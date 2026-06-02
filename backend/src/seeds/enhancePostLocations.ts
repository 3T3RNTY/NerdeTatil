import { PrismaClient } from '@prisma/client';
import geocodingService from '../services/geocodingService';

const prisma = new PrismaClient();

interface LocationData {
  id?: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  visitDate?: string | null;
}

/**
 * Enhance existing post locations with missing city and country data
 * Uses reverse geocoding to fetch city and country from coordinates
 */
async function enhancePostLocations() {
  try {
    console.log('Starting to enhance post locations with city and country data...');

    // Get all posts
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        locationsData: true,
      },
    });

    console.log(`Found ${posts.length} posts to check`);

    let updatedCount = 0;
    let processedCount = 0;

    for (const post of posts) {
      const locationsData = (post.locationsData as unknown as LocationData[]) || [];
      let hasChanges = false;
      const enhancedLocations: LocationData[] = [];

      for (const location of locationsData) {
        let enhancedLocation = { ...location };

        // If city or country is missing and we have coordinates, use reverse geocoding
        if (
          (!location.city || !location.country) &&
          location.latitude &&
          location.longitude
        ) {
          try {
            console.log(
              `Reverse geocoding for location: ${location.name} (${location.latitude}, ${location.longitude})`
            );

            const result = await geocodingService.reverseGeocode(
              location.latitude,
              location.longitude
            );

            enhancedLocation = {
              ...enhancedLocation,
              city: result.city || location.city,
              country: result.country || location.country,
              address: result.address || location.address,
            };

            hasChanges = true;
            console.log(
              `  ✓ Enhanced: ${enhancedLocation.name} → ${enhancedLocation.city}, ${enhancedLocation.country}`
            );
          } catch (error) {
            console.warn(
              `  ✗ Failed to reverse geocode ${location.name}:`,
              error instanceof Error ? error.message : 'Unknown error'
            );
            // Continue with original data if reverse geocoding fails
          }
        }

        enhancedLocations.push(enhancedLocation);
      }

      // Update post if changes were made
      if (hasChanges) {
        await prisma.post.update({
          where: { id: post.id },
          data: {
            locationsData: enhancedLocations as unknown as any,
          },
        });
        updatedCount++;
        console.log(`Post ${post.id} updated ✓`);
      }

      processedCount++;
      if (processedCount % 5 === 0) {
        console.log(`Progress: ${processedCount}/${posts.length} posts processed`);
      }
    }

    console.log('\n=== Enhancement Complete ===');
    console.log(`Total posts processed: ${processedCount}`);
    console.log(`Posts updated: ${updatedCount}`);
    console.log('✓ All posts have been enhanced with location data');
  } catch (error) {
    console.error('Error enhancing post locations:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
enhancePostLocations()
  .then(() => {
    console.log('\n✓ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Script failed:', error);
    process.exit(1);
  });
