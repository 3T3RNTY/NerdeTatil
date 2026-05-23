import express, { Router } from 'express';
import { UserController } from '../controllers/userController';
import { PostController } from '../controllers/postController';
import { LocationController } from '../controllers/locationController';
import { AuthController } from '../controllers/authController';
import imageController from '../controllers/imageController';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import {
  validateUserRegistration,
  validatePostCreation,
  validateLocationCreation,
} from '../middleware/validation';

const router = Router();

// ============================================
// HEALTH CHECK
// ============================================

router.get('/', (req, res) => {
  res.json({ message: 'NerdeTatil API v1.0' });
});

// ============================================
// AUTHENTICATION ROUTES
// ============================================

router.post(
  '/auth/register',
  validateUserRegistration,
  AuthController.register
);
router.post('/auth/login', AuthController.login);
router.post('/auth/verify', authMiddleware, AuthController.verify);

// ============================================
// USERS ROUTES
// ============================================

router.post('/users', validateUserRegistration, UserController.create);
router.get('/users/:id', UserController.getById);
router.get('/users/:id/profile', UserController.getProfile);
router.put('/users/:id', authMiddleware, UserController.update);

// ============================================
// POSTS ROUTES
// ============================================

router.get('/themes', PostController.getThemes);
router.get('/posts', optionalAuthMiddleware, PostController.list);
router.get('/posts/user/:userId', PostController.getByUserId);
router.get('/posts/:id', optionalAuthMiddleware, PostController.getById);
router.post(
  '/posts',
  authMiddleware,
  validatePostCreation,
  PostController.create
);
router.put('/posts/:id', authMiddleware, PostController.update);
router.delete('/posts/:id', authMiddleware, PostController.delete);

// ============================================
// COMMENTS ROUTES
// ============================================

router.post(
  '/posts/:id/comments',
  authMiddleware,
  PostController.addComment
);
router.get('/posts/:id/comments', PostController.getComments);

// ============================================
// LIKES ROUTES
// ============================================

router.post('/posts/:id/like', authMiddleware, PostController.like);
router.delete('/posts/:id/like', authMiddleware, PostController.unlike);

// ============================================
// LOCATIONS ROUTES
// ============================================

router.get('/locations', LocationController.list);
router.get('/locations/popular', LocationController.getPopular);
router.post('/locations/geocode', LocationController.geocode);
router.post('/locations/reverse-geocode', LocationController.reverseGeocode);
router.get('/locations/search', LocationController.search);
router.get('/locations/country/:country', LocationController.getByCountry);
router.get('/locations/city/:city', LocationController.getByCity);
router.get('/locations/:id', LocationController.getById); // Must be last - generic route
router.post(
  '/locations',
  authMiddleware,
  validateLocationCreation,
  LocationController.create
);
router.put('/locations/:id', authMiddleware, LocationController.update);
router.delete('/locations/:id', authMiddleware, LocationController.delete);

// ============================================
// IMAGES ROUTES
// ============================================

router.use('/images', imageController);

export default router;
