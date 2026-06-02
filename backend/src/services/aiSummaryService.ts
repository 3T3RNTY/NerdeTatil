import axios from 'axios';
import summaryCache from '../utils/summaryCache';

interface LocationData {
  city?: string;
  country?: string;
  rating?: number | null;
  multiCriteriaRatings?: any;
}

interface Post {
  id: string;
  title: string;
  description: string;
  postType: string;
  rating?: number | null;
  locations?: LocationData[];
  multiCriteriaRatings?: any;
  likesCount?: number;
  commentsCount?: number;
  theme?: {
    name: string;
    emoji?: string;
  };
}

interface SearchSummaryResult {
  summary: string;
  cached: boolean;
  generatedAt: Date;
  metrics?: {
    visitCount: number;
    happinessPercentage: number;
    postTypes: Record<string, number>;
    topThemes: Array<{ name: string; count: number }>;
    avgEngagement: number;
  };
}

interface PersonalizedSuggestion {
  location: string;
  reason: string;
  source: 'liked' | 'own' | 'mixed';
}

interface PersonalizedSuggestionsResult {
  summary: string;
  suggestions: PersonalizedSuggestion[];
  generatedAt: Date;
}

class AISummaryService {
  private ollamaBaseUrl: string;
  private model: string = 'mistral';
  private timeout: number = 30000; // 30 seconds

  constructor() {
    this.ollamaBaseUrl =
      process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  /**
   * Calculate average happiness percentage from posts
   * Happiness = average of multiCriteriaRatings >= 3
   */
  private calculateHappinessPercentage(posts: Post[]): number {
    if (posts.length === 0) return 0;

    let happyCount = 0;

    for (const post of posts) {
      const ratings = post.multiCriteriaRatings;
      if (!ratings) {
        // If no multi-criteria ratings, check overall rating
        if (post.rating && post.rating >= 3) {
          happyCount++;
        }
        continue;
      }

      const values = [
        ratings.optionVariety,
        ratings.location,
        ratings.accessibility,
        ratings.priceValue,
      ].filter((v) => typeof v === 'number' && v !== null);

      if (values.length > 0) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        if (avg >= 3) {
          happyCount++;
        }
      }
    }

    return Math.round((happyCount / posts.length) * 100);
  }

  /**
   * Extract aggregated metrics from posts
   */
  private aggregateMetrics(
    posts: Post[],
    city?: string,
    country?: string
  ): SearchSummaryResult['metrics'] {
    const postTypes: Record<string, number> = {};
    const themeCounts: Record<string, number> = {};
    let totalLikesComments = 0;

    posts.forEach((post) => {
      // Count post types
      postTypes[post.postType || 'LOCATION'] =
        (postTypes[post.postType || 'LOCATION'] || 0) + 1;

      // Count themes
      if (post.theme) {
        const themeName = post.theme.emoji
          ? `${post.theme.emoji} ${post.theme.name}`
          : post.theme.name;
        themeCounts[themeName] = (themeCounts[themeName] || 0) + 1;
      }

      totalLikesComments += (post.likesCount || 0) + (post.commentsCount || 0);
    });

    // Get top 3 themes
    const topThemes = Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      visitCount: posts.length,
      happinessPercentage: this.calculateHappinessPercentage(posts),
      postTypes,
      topThemes,
      avgEngagement: Math.ceil(totalLikesComments / Math.max(posts.length, 1)),
    };
  }

  /**
   * Build prompt for Ollama based on metrics
   */
  private buildPrompt(
    metrics: SearchSummaryResult['metrics'],
    city?: string,
    country?: string,
    topPostDescriptions: string[] = []
  ): string {
    const location = city && country ? `${city}, ${country}` : city || country || 'bu konum';
    
    const typesList = Object.entries(metrics!.postTypes)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ');

    const themesList = metrics!.topThemes
      .map((t) => t.name)
      .join(', ');

    const statisticsSentence = `${location} hakkında ${metrics!.visitCount} ${metrics!.visitCount === 1 ? 'paylaşım' : 'paylaşım'}: %${metrics!.happinessPercentage} olumlu değerlendirildi (3+/5), ${typesList} içeriyor, popüler temalar ${themesList}.`;

    const descriptionsSentence =
      topPostDescriptions.length > 0
        ? `Öne Çıkanlar: ${topPostDescriptions.slice(0, 2).join(' | ')}.`
        : '';

    const fullPrompt = descriptionsSentence 
      ? `${statisticsSentence} ${descriptionsSentence}`
      : statisticsSentence;

    return `Aşağıdaki arama sonuçlarına dayanarak gezginler için 1-2 cümlelik rahat bir özet oluştur:

${fullPrompt}

Konuşma tarzında, ilgi çekici ve gerçekçi tut. Örnek: "5 kullanıcı İstanbul'u ziyaret etti, %80'i sevdi! Popüler: Oteller, Anıtlar. Öne Çıkanlar: Topkapı Sarayı | Mavi Cami."`;
  }

  /**
   * Build prompt for profile summaries (liked posts, own posts)
   */
  private buildProfilePrompt(
    metrics: SearchSummaryResult['metrics'],
    contextLabel: string,
    topPostDescriptions: string[] = []
  ): string {
    const typesList = Object.entries(metrics!.postTypes)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ');

    const themesList = metrics!.topThemes
      .map((t) => t.name)
      .join(', ');

    let contextText = 'kullanıcı beğendiği paylaşımlarında';
    if (contextLabel.includes('own-posts')) {
      contextText = 'kullanıcı paylaşımlarında';
    }

    const statisticsSentence = `${contextText} ${metrics!.visitCount} ${metrics!.visitCount === 1 ? 'paylaşım' : 'paylaşım'}: %${metrics!.happinessPercentage} olumlu değerlendirildi (3+/5), ${typesList} içeriyor, popüler temalar ${themesList}.`;

    const descriptionsSentence =
      topPostDescriptions.length > 0
        ? `Öne Çıkanlar: ${topPostDescriptions.slice(0, 2).join(' | ')}.`
        : '';

    const fullPrompt = descriptionsSentence 
      ? `${statisticsSentence} ${descriptionsSentence}`
      : statisticsSentence;

    return `Aşağıdaki paylaşımlarına dayanarak kullanıcının ilgi alanları ve zevki hakkında 1-2 cümlelik rahat bir özet oluştur:

${fullPrompt}

Konuşma tarzında, ilgi çekici ve gerçekçi tut. Örnek: "Doğa ve macera severmiş! 3 paylaşımda dağlar, kanyonlar ve ormanlar var. %70'i harika denmiş. Popüler: TRIP, LOCATION. Öne Çıkanlar: Cappadocia Trekking | Swiss Alps."`;
  }

  /**
   * Call Ollama API to generate summary
   */
  private async callOllama(prompt: string): Promise<string> {
    try {
      console.log(
        `[AISummaryService] Calling Ollama at ${this.ollamaBaseUrl} with model: ${this.model}`
      );

      const response = await axios.post(
        `${this.ollamaBaseUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
        },
        { timeout: this.timeout }
      );

      if (response.data && response.data.response) {
        const summary = response.data.response.trim();
        console.log(`[AISummaryService] Generated summary: ${summary}`);
        return summary;
      }

      throw new Error('No response from Ollama');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          `[AISummaryService] Ollama error: ${error.message}`,
          error.response?.data || ''
        );
      } else {
        console.error(
          `[AISummaryService] Error calling Ollama:`,
          error instanceof Error ? error.message : String(error)
        );
      }
      throw error;
    }
  }

  /**
   * Generate AI summary for search results
   * Returns cached summary if available, otherwise generates new one
   */
  async generateSummary(
    posts: Post[],
    city?: string,
    country?: string,
    query?: string
  ): Promise<SearchSummaryResult> {
    try {
      // Check cache first
      const cachedSummary = summaryCache.get(city, country, query);
      if (cachedSummary) {
        console.log(
          `[AISummaryService] Using cached summary for ${city || query || 'all'}`
        );
        return {
          summary: cachedSummary,
          cached: true,
          generatedAt: new Date(),
        };
      }

      // If no posts, return empty summary
      if (posts.length === 0) {
        const emptySummary = `No posts found for ${city || country || query || 'this search'}.`;
        summaryCache.set(emptySummary, city, country, query);
        return {
          summary: emptySummary,
          cached: false,
          generatedAt: new Date(),
        };
      }

      // Aggregate metrics
      const metrics = this.aggregateMetrics(posts, city, country);

      // Extract top post descriptions with more complete information
      const topPostDescriptions = posts
        .slice(0, 5)
        .map(
          (p) =>
            `${p.title}${p.description ? ': ' + p.description.substring(0, 150) : ''}`
        )
        .filter((desc) => desc.trim().length > 0);

      // Build prompt and call Ollama
      const prompt = this.buildPrompt(
        metrics,
        city,
        country,
        topPostDescriptions
      );

      let summary: string;
      try {
        summary = await this.callOllama(prompt);
      } catch (ollamaError) {
        // Fallback: generate summary without AI if Ollama is unavailable
        console.warn(
          '[AISummaryService] Ollama unavailable, using fallback summary'
        );
        summary = this.generateFallbackSummary(metrics, city, country);
      }

      // Cache the summary
      summaryCache.set(summary, city, country, query);

      return {
        summary,
        cached: false,
        generatedAt: new Date(),
        metrics,
      };
    } catch (error) {
      console.error(
        '[AISummaryService] Error generating summary:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  async generateProfileSummary(
    posts: Post[],
    contextLabel: string
  ): Promise<SearchSummaryResult> {
    try {
      // Check cache first
      const cacheKey = `profile:${contextLabel}`;
      const cachedSummary = summaryCache.get(undefined, undefined, cacheKey);
      if (cachedSummary) {
        console.log(
          `[AISummaryService] Using cached profile summary for ${contextLabel}`
        );
        return {
          summary: cachedSummary,
          cached: true,
          generatedAt: new Date(),
        };
      }

      // If no posts, return empty summary
      if (posts.length === 0) {
        const emptySummary = contextLabel.includes('liked')
          ? 'Henüz beğendiğiniz paylaşım yok'
          : 'Henüz paylaşım yapmadınız';
        summaryCache.set(emptySummary, undefined, undefined, cacheKey);
        return {
          summary: emptySummary,
          cached: false,
          generatedAt: new Date(),
        };
      }

      // Aggregate metrics
      const metrics = this.aggregateMetrics(posts);

      // Extract top post descriptions with more complete information
      const topPostDescriptions = posts
        .slice(0, 5)
        .map(
          (p) =>
            `${p.title}${p.description ? ': ' + p.description.substring(0, 150) : ''}`
        )
        .filter((desc) => desc.trim().length > 0);

      // Build profile-specific prompt
      const prompt = this.buildProfilePrompt(
        metrics,
        contextLabel,
        topPostDescriptions
      );

      let summary: string;
      try {
        summary = await this.callOllama(prompt);
      } catch (ollamaError) {
        // Fallback: generate summary without AI if Ollama is unavailable
        console.warn(
          '[AISummaryService] Ollama unavailable, using fallback summary'
        );
        summary = this.generateProfileFallbackSummary(metrics, contextLabel);
      }

      // Cache the summary
      summaryCache.set(summary, undefined, undefined, cacheKey);

      return {
        summary,
        cached: false,
        generatedAt: new Date(),
        metrics,
      };
    } catch (error) {
      console.error(
        '[AISummaryService] Error generating profile summary:',
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  async generatePersonalizedSuggestions(
    ownPosts: Post[],
    likedPosts: Post[]
  ): Promise<PersonalizedSuggestionsResult> {
    const combined = [...ownPosts, ...likedPosts];
    if (combined.length === 0) {
      return {
        summary: 'Henüz yeterli veri yok. Paylaşım yapıp beğeni verdikçe öneriler burada görünecek.',
        suggestions: [],
        generatedAt: new Date(),
      };
    }

    const themes = new Map<string, number>();
    const locations = new Map<string, { count: number; source: 'liked' | 'own' | 'mixed' }>();

    const ingestPosts = (posts: Post[], source: 'liked' | 'own') => {
      posts.forEach((post) => {
        if (post.theme?.name) {
          themes.set(post.theme.name, (themes.get(post.theme.name) || 0) + 1);
        }

        (post.locations || []).forEach((loc) => {
          const key = [loc.city, loc.country].filter(Boolean).join(', ') || loc.country || loc.city;
          if (!key) return;
          const current = locations.get(key);
          if (!current) {
            locations.set(key, { count: 1, source });
            return;
          }
          const mergedSource =
            current.source === source ? source : 'mixed';
          locations.set(key, { count: current.count + 1, source: mergedSource });
        });
      });
    };

    ingestPosts(ownPosts, 'own');
    ingestPosts(likedPosts, 'liked');

    const topThemes = Array.from(themes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    const topLocations = Array.from(locations.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);

    const suggestions: PersonalizedSuggestion[] = topLocations.map(([location, meta]) => ({
      location,
      source: meta.source,
      reason:
        meta.source === 'mixed'
          ? `Hem beğenilerinizde hem paylaşımlarınızda benzer yerler öne çıkıyor (${meta.count} sinyal).`
          : meta.source === 'liked'
            ? `Beğendiğiniz içeriklerde bu bölge sık geçiyor (${meta.count} sinyal).`
            : `Kendi paylaşımlarınız bu bölgeye ilgi gösteriyor (${meta.count} sinyal).`,
    }));

    const summaryPrompt = `Kullanıcının geçmiş verilerine göre kısa öneri özeti yaz.
Tema eğilimleri: ${topThemes.join(', ') || 'karışık'}.
Öne çıkan lokasyonlar: ${topLocations.map(([name]) => name).join(', ') || 'belirsiz'}.
1-2 cümle, Türkçe, doğal konuşma tonu.`;

    let summary = '';
    try {
      summary = await this.callOllama(summaryPrompt);
    } catch {
      const topThemeText = topThemes.length ? topThemes.join(', ') : 'farklı temalar';
      const topLocationText = topLocations.length
        ? topLocations.slice(0, 3).map(([name]) => name).join(', ')
        : 'farklı lokasyonlar';
      summary = `İlgi alanlarınıza göre ${topThemeText} temalarında ve ${topLocationText} tarafında yeni yerler keşfetmeniz yüksek ihtimalle keyifli olur.`;
    }

    return {
      summary,
      suggestions,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate summary without AI (fallback)
   */
  private generateFallbackSummary(
    metrics: SearchSummaryResult['metrics'],
    city?: string,
    country?: string
  ): string {
    const location = city && country ? `${city}, ${country}` : city || country || 'bu konum';
    const topTheme =
      metrics!.topThemes.length > 0 ? metrics!.topThemes[0].name : 'anıtlar';

    return `${location} hakkında ${metrics!.visitCount} ${metrics!.visitCount === 1 ? 'paylaşım' : 'paylaşım'}. %${metrics!.happinessPercentage} yüksek puan verdi. Popüler: ${topTheme}.`;
  }

  private generateProfileFallbackSummary(
    metrics: SearchSummaryResult['metrics'],
    contextLabel: string
  ): string {
    const isLiked = contextLabel.includes('liked');
    const contextText = isLiked ? 'beğendiği' : 'paylaştığı';
    const topTheme =
      metrics!.topThemes.length > 0 ? metrics!.topThemes[0].name : 'anıtlar';

    return `${metrics!.visitCount} ${metrics!.visitCount === 1 ? 'paylaşım' : 'paylaşım'} ${contextText} konular arasında yer alıyor. %${metrics!.happinessPercentage} yüksek puan verdi. Popüler tema: ${topTheme}.`;
  }

  /**
   * Check if Ollama is available
   */
  async isOllamaAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.ollamaBaseUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.warn('[AISummaryService] Ollama not available:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Preload model (optional, called on app startup)
   */
  async preloadModel(): Promise<void> {
    try {
      console.log(`[AISummaryService] Preloading model: ${this.model}`);
      // Send a simple generate request to ensure model is loaded
      await axios.post(
        `${this.ollamaBaseUrl}/api/generate`,
        {
          model: this.model,
          prompt: 'Hi',
          stream: false,
        },
        { timeout: 60000 } // Give it 60s to download/load model
      );
      console.log(`[AISummaryService] Model ${this.model} preloaded successfully`);
    } catch (error) {
      console.warn(
        `[AISummaryService] Failed to preload model:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }
}

export default new AISummaryService();
