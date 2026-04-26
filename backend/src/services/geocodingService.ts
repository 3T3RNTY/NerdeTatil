import axios from 'axios';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  address: string;
  city?: string;
  country?: string;
}

interface ReverseGeocodingResult {
  address: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

/**
 * GeocodingService - Uses OpenStreetMap Nominatim API for free geocoding
 * No API key required, but includes user-agent for courtesy
 */
class GeocodingService {
  private baseUrl = 'https://nominatim.openstreetmap.org';
  private userAgent = process.env.GEOCODING_USER_AGENT || 'NerdeTatil/1.0';

  /**
   * Geocode address to coordinates
   * @param address - Full address or location name
   * @returns Promise<GeocodingResult> - Coordinates and standardized address
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      if (!response.data || response.data.length === 0) {
        throw new Error(`Location not found: ${address}`);
      }

      const result = response.data[0];
      const addressParts = result.address || {};

      return {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        address: result.display_name,
        city: addressParts.city || addressParts.town || addressParts.village,
        country: addressParts.country,
      };
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(
          `Geocoding failed: ${error.response?.status} - ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Reverse geocode coordinates to address
   * @param latitude - Latitude coordinate
   * @param longitude - Longitude coordinate
   * @returns Promise<ReverseGeocodingResult> - Address and location info
   */
  async reverseGeocode(
    latitude: number,
    longitude: number
  ): Promise<ReverseGeocodingResult> {
    try {
      // Validate coordinates
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Invalid coordinates');
      }

      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat: latitude,
          lon: longitude,
          format: 'json',
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      if (!response.data) {
        throw new Error('No address found for coordinates');
      }

      const result = response.data;
      const addressParts = result.address || {};

      return {
        address: result.display_name,
        city: addressParts.city || addressParts.town || addressParts.village,
        country: addressParts.country,
        latitude,
        longitude,
      };
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(
          `Reverse geocoding failed: ${error.response?.status} - ${error.message}`
        );
      }
      throw error;
    }
  }

  /**
   * Search for locations (autocomplete)
   * @param query - Search query
   * @param limit - Max results
   * @returns Promise<GeocodingResult[]> - Array of matching locations
   */
  async searchLocations(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit,
        },
        headers: {
          'User-Agent': this.userAgent,
        },
        timeout: 10000,
      });

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data.map((result: any) => {
        const addressParts = result.address || {};
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name,
          city: addressParts.city || addressParts.town || addressParts.village,
          country: addressParts.country,
        };
      });
    } catch (error) {
      if (error instanceof axios.AxiosError) {
        throw new Error(`Location search failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validate if coordinates are within reasonable bounds
   * @param latitude - Latitude
   * @param longitude - Longitude
   * @returns boolean - True if valid
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Calculate distance between two points (Haversine formula)
   * @param lat1 - First latitude
   * @param lon1 - First longitude
   * @param lat2 - Second latitude
   * @param lon2 - Second longitude
   * @returns number - Distance in kilometers
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default new GeocodingService();
