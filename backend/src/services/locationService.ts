import { PrismaClient, Prisma } from '@prisma/client';
import { fuzzyMatch } from '../utils/fuzzySearch';

const prisma = new PrismaClient();

export class LocationService {
  /**
   * Get all locations with fuzzy matching support
   */
  static async getLocations(filters?: {
    city?: string;
    country?: string;
    search?: string;
  }) {
    const where: Prisma.LocationWhereInput = {};

    // Apply exact filters for city/country
    if (filters?.city) {
      where.city = {
        equals: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters?.country) {
      where.country = {
        equals: filters.country,
        mode: 'insensitive',
      };
    }

    // Get all locations matching the city/country filters
    let allLocations = await prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    // Apply fuzzy matching for search term
    if (filters?.search && filters.search.trim().length > 0) {
      const searchNames = allLocations.map(l => l.name);
      const matchedNames = await fuzzyMatch(searchNames, filters.search, 0.35);
      
      allLocations = allLocations.filter(location => 
        matchedNames.includes(location.name)
      );
    }

    return allLocations;
  }

  /**
   * Get location by ID
   */
  static async getLocationById(locationId: string) {
    return prisma.location.findUnique({
      where: { id: locationId },
    });
  }

  /**
   * Create a new location
   */
  static async createLocation(data: {
    name: string;
    address?: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
  }) {
    return prisma.location.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        latitude: data.latitude ? Math.round(data.latitude * 1e8) / 1e8 : undefined,
        longitude: data.longitude ? Math.round(data.longitude * 1e8) / 1e8 : undefined,
        description: data.description,
      },
    });
  }

  /**
   * Update location
   */
  static async updateLocation(locationId: string, data: Prisma.LocationUpdateInput) {
    return prisma.location.update({
      where: { id: locationId },
      data,
    });
  }

  /**
   * Delete location
   */
  static async deleteLocation(locationId: string) {
    return prisma.location.delete({
      where: { id: locationId },
    });
  }

  /**
   * Get locations by country
   */
  static async getLocationsByCountry(country: string) {
    return prisma.location.findMany({
      where: { country },
      orderBy: { city: 'asc' },
    });
  }

  /**
   * Get locations by city
   */
  static async getLocationsByCity(city: string) {
    return prisma.location.findMany({
      where: { city },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get popular locations (with most posts)
   */
  static async getPopularLocations(limit: number = 10) {
    const safeLimit = Number.isFinite(limit)
      ? Math.min(Math.max(Math.trunc(limit), 1), 100)
      : 10;

    const posts = await prisma.post.findMany({
      where: { isPublic: true },
      select: { locationsData: true },
    });

    const locationPostCounts = new Map<string, number>();

    for (const post of posts) {
      if (!Array.isArray(post.locationsData)) continue;

      // Count each location at most once per post.
      const uniqueLocationIds = new Set<string>();

      for (const location of post.locationsData) {
        if (
          typeof location === 'object' &&
          location !== null &&
          'id' in location &&
          typeof location.id === 'string' &&
          location.id.trim() !== ''
        ) {
          uniqueLocationIds.add(location.id);
        }
      }

      for (const locationId of uniqueLocationIds) {
        locationPostCounts.set(locationId, (locationPostCounts.get(locationId) ?? 0) + 1);
      }
    }

    const rankedLocationIds = Array.from(locationPostCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, safeLimit);

    if (rankedLocationIds.length === 0) {
      return [];
    }

    const locations = await prisma.location.findMany({
      where: {
        id: {
          in: rankedLocationIds.map(([locationId]) => locationId),
        },
      },
    });

    const locationById = new Map(locations.map((location) => [location.id, location]));

    return rankedLocationIds
      .map(([locationId, postsCount]) => {
        const location = locationById.get(locationId);
        if (!location) return null;

        return {
          ...location,
          postsCount,
        };
      })
      .filter((location): location is NonNullable<typeof location> => location !== null);
  }
}
