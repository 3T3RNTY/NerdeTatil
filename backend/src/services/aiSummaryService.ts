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

      // For engagement calculation (placeholder, would need likes/comments from full post object)
      totalLikesComments += 0;
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
      avgEngagement: Math.ceil(totalLikesComments / posts.length),
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

      // Extract top post descriptions
      const topPostDescriptions = posts
        .slice(0, 3)
        .map(
          (p) =>
            `${p.title}${p.description ? ': ' + p.description.substring(0, 50) : ''}`
        );

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
