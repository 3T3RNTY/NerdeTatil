import apiClient from './client';

export interface Location {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class LocationService {
  /**
   * Get all locations
   */
  static async getLocations(filters?: {
    city?: string;
    country?: string;
    search?: string;
  }): Promise<Location[]> {
    try {
      const response = await apiClient.get<Location[]>('/locations', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch locations' };
    }
  }

  /**
   * Get location by ID
   */
  static async getLocationById(locationId: string): Promise<Location> {
    try {
      const response = await apiClient.get<Location>(`/locations/${locationId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch location' };
    }
  }

  /**
   * Get popular locations
   */
  static async getPopularLocations(limit: number = 10): Promise<Location[]> {
    try {
      const response = await apiClient.get<Location[]>('/locations/popular', {
        params: { limit },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch popular locations' };
    }
  }

  /**
   * Get locations by country
   */
  static async getLocationsByCountry(country: string): Promise<Location[]> {
    try {
      const response = await apiClient.get<Location[]>(
        `/locations/country/${country}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch locations by country' };
    }
  }

  /**
   * Get locations by city
   */
  static async getLocationsByCity(city: string): Promise<Location[]> {
    try {
      const response = await apiClient.get<Location[]>(`/locations/city/${city}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch locations by city' };
    }
  }

  /**
   * Create a new location
   */
  static async createLocation(data: Partial<Location>): Promise<Location> {
    try {
      const response = await apiClient.post<Location>('/locations', data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to create location' };
    }
  }

  /**
   * Update location
   */
  static async updateLocation(
    locationId: string,
    data: Partial<Location>
  ): Promise<Location> {
    try {
      const response = await apiClient.put<Location>(`/locations/${locationId}`, data);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update location' };
    }
  }

  /**
   * Delete location
   */
  static async deleteLocation(locationId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(
        `/locations/${locationId}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete location' };
    }
  }
}
