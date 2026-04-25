import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export class LocationService {
  /**
   * Get all locations
   */
  static async getLocations(filters?: {
    city?: string;
    country?: string;
    search?: string;
  }) {
    const where: Prisma.LocationWhereInput = {};

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.country) {
      where.country = filters.country;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
        { country: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
    });
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
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      orderBy: {
        posts: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return locations.map((loc) => ({
      ...loc,
      postsCount: loc._count.posts,
      _count: undefined,
    }));
  }
}
