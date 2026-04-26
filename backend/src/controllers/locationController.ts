import { Request, Response } from 'express';
import { LocationService } from '../services/locationService';
import geocodingService from '../services/geocodingService';

export class LocationController {
  /**
   * GET /api/locations
   * Get all locations with optional filters
   */
  static async list(req: Request, res: Response) {
    try {
      const { city, country, search } = req.query;

      const locations = await LocationService.getLocations({
        city: city as string,
        country: country as string,
        search: search as string,
      });

      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/locations/:id
   * Get location by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const location = await LocationService.getLocationById(id);

      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }

      res.json(location);
    } catch (error) {
      console.error('Error fetching location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/locations
   * Create a new location
   */
  static async create(req: Request, res: Response) {
    try {
      const {
        name,
        address,
        city,
        country,
        latitude,
        longitude,
        description,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Location name is required' });
      }

      const location = await LocationService.createLocation({
        name,
        address,
        city,
        country,
        latitude,
        longitude,
        description,
      });

      res.status(201).json(location);
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * PUT /api/locations/:id
   * Update location
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        name,
        address,
        city,
        country,
        latitude,
        longitude,
        description,
      } = req.body;

      const location = await LocationService.updateLocation(id, {
        name,
        address,
        city,
        country,
        latitude,
        longitude,
        description,
      });

      res.json(location);
    } catch (error: any) {
      console.error('Error updating location:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * DELETE /api/locations/:id
   * Delete location
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await LocationService.deleteLocation(id);

      res.json({ message: 'Location deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting location:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Location not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/locations/country/:country
   * Get locations by country
   */
  static async getByCountry(req: Request, res: Response) {
    try {
      const { country } = req.params;

      const locations = await LocationService.getLocationsByCountry(country);

      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations by country:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/locations/city/:city
   * Get locations by city
   */
  static async getByCity(req: Request, res: Response) {
    try {
      const { city } = req.params;

      const locations = await LocationService.getLocationsByCity(city);

      res.json(locations);
    } catch (error) {
      console.error('Error fetching locations by city:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * GET /api/locations/popular
   * Get popular locations (with most posts)
   */
  static async getPopular(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const locations = await LocationService.getPopularLocations(limit);

      res.json(locations);
    } catch (error) {
      console.error('Error fetching popular locations:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * POST /api/locations/geocode
   * Geocode an address to coordinates
   */
  static async geocode(req: Request, res: Response) {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ error: 'Address is required' });
      }

      const result = await geocodingService.geocodeAddress(address);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Geocoding failed',
      });
    }
  }

  /**
   * POST /api/locations/reverse-geocode
   * Reverse geocode coordinates to address
   */
  static async reverseGeocode(req: Request, res: Response) {
    try {
      const { latitude, longitude } = req.body;

      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({
          error: 'Latitude and longitude are required',
        });
      }

      if (!geocodingService.validateCoordinates(latitude, longitude)) {
        return res.status(400).json({
          error: 'Invalid coordinates',
        });
      }

      const result = await geocodingService.reverseGeocode(latitude, longitude);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Reverse geocoding failed',
      });
    }
  }

  /**
   * GET /api/locations/search
   * Search for locations by query (autocomplete)
   */
  static async search(req: Request, res: Response) {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Search query is required',
        });
      }

      const results = await geocodingService.searchLocations(
        q as string,
        parseInt(limit as string) || 5
      );

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      console.error('Error searching locations:', error);
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Search failed',
      });
    }
  }
}
