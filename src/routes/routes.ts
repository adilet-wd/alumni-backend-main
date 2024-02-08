import { Router } from 'express';
import { UserController } from '../controllers/user-controller';
import { body, param, query, type ValidationChain } from 'express-validator';
import { authMiddleware } from '../middlewares/auth-middleware';
import { rateLimit } from 'express-rate-limit';
import { deleteFieldsMiddleware } from '../middlewares/delete-fields-middleware';
import { roleCheckMiddleware } from '../middlewares/role-check-middleware';
import { NewsController } from '../controllers/news-controller';
import { ImageFolders, ValidationMessages, type RequestForMulter } from '../types/global';
import { fileUploader } from '../helpers/file-uploader';
import { AuthController } from '../controllers/auth-controller';
import { ImageController } from '../controllers/image-controller';

/* eslint-disable @typescript-eslint/no-misused-promises */

const emailValidation = body('email').isEmail().withMessage(ValidationMessages.EMAIL_MESSAGE).isString().withMessage(ValidationMessages.IS_STRING);
const passwordValidation = (field: string): ValidationChain => body(field).isLength({ min: 3, max: 32 }).withMessage(ValidationMessages.PASSWORD_MESSAGE);
const nameValidation = (field: string): ValidationChain => body(field).isString().withMessage(ValidationMessages.IS_STRING).isLength({ min: 2, max: 32 }).withMessage(ValidationMessages.NAME_SURNAME_MESSAGE);
const isMongoId = param('id').isLength({ min: 24, max: 24 }).withMessage(ValidationMessages.ID_LENGTH_MESSAGE).matches(/^[0-9a-fA-F]{24}$/).withMessage(ValidationMessages.ID_REGEX_MESSAGE);
export const router: Router = Router();

const limit15min = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: { message: 'Too much request' }
});

enum AuthRouteEndpoint {
  REGISTER = '/auth/registration',
  LOGIN = '/auth/login',
  LOGOUT = '/auth/logout',
  ACTIVATE = '/auth/activate/:link',
  REFRESH = '/auth/refresh',
  CHANGE_PASSWORD = '/auth/change-password',
  RESET_PASSWORD = '/auth/reset-password',
  SEND_OTP = '/auth/send-otp',
  RESEND_OTP = '/auth/resend-otp',
}

/**
* @openapi
* '/api/auth/registration':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Registration
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             "phoneNumber": "+380123456789"
*             "email": "user@gmail.com"
*             "password": "pass123"
*             "confirmPassword": "pass123"
*             "name": "Alex"
*             "surname": "Smith"
*     responses:
*       200:
*         description: User created
*         content:
*          application/json:
*           example:
*             "message": "User successful registered"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example:
*                "message": "User already exist"
*                "errors": []
*/
router.post(
  AuthRouteEndpoint.REGISTER,
  emailValidation,
  passwordValidation('password'),
  passwordValidation('confirmPassword').custom((value, { req }) => {
    return value === req.body.password;
  }).withMessage(ValidationMessages.PASSWORD_EQUAL),
  nameValidation('name'),
  nameValidation('surname'),
  body('phoneNumber'),
  AuthController.registration
);

/**
* @openapi
* '/api/auth/login':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Login
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             "email": "user@gmail.com"
*             "password": "pass123"
*     responses:
*       200:
*         description: Product created
*         content:
*          application/json:
*           example:
*             "user": "642a0de05f16e6dad68efdad"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example:
*               "message": "User not found"
*               "errors": []
*/
router.post(
  AuthRouteEndpoint.LOGIN,
  emailValidation,
  AuthController.login
);

router.get(
  AuthRouteEndpoint.ACTIVATE,
  AuthController.activate
);

/**
* @openapi
* '/api/auth/login':
*  get:
*     tags:
*     - AUTHENTICATION
*     summary: Get refresh token
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             reftreshToken: "token"
*/
router.get(
  AuthRouteEndpoint.REFRESH,
  body('refreshToken'),
  AuthController.refresh
);

router.post(
  AuthRouteEndpoint.LOGOUT,
  AuthController.logout
);

router.post(
  AuthRouteEndpoint.CHANGE_PASSWORD,
  authMiddleware,
  passwordValidation('oldPassword'),
  passwordValidation('newPassword'),
  passwordValidation('confirmNewPassword').custom((value, { req }) => {
    return value === req.body.newPassword;
  }).withMessage(ValidationMessages.PASSWORD_EQUAL),
  AuthController.changePassword
);

router.post(
  AuthRouteEndpoint.SEND_OTP,
  emailValidation,
  limit15min,
  AuthController.sendOtp
);

router.post(
  AuthRouteEndpoint.RESEND_OTP,
  emailValidation,
  limit15min,
  AuthController.reSendOtp
);

router.post(
  AuthRouteEndpoint.RESET_PASSWORD,
  body('code').isNumeric().isLength({ min: 6, max: 6 }),
  emailValidation,
  passwordValidation('newPassword'),
  passwordValidation('confirmNewPassword').custom((value, { req }) => {
    return value === req.body.newPassword;
  }).withMessage(ValidationMessages.PASSWORD_EQUAL),
  limit15min,
  AuthController.resetPassword
);

enum UserRouteEndpoint {
  PROFILE = '/user/profile',
  UPDATE_PROFILE = '/user/update-profile',
  USER_BY_ID = '/user/:id',
  USERS = '/users',
}

router.get(
  UserRouteEndpoint.USERS,
  query('limit').default('10'),
  query('page').default('1'),
  UserController.getUsers
);

router.get(
  UserRouteEndpoint.PROFILE,
  authMiddleware,
  UserController.getProfile
);

router.patch(
  UserRouteEndpoint.UPDATE_PROFILE,
  authMiddleware,
  deleteFieldsMiddleware,
  fileUploader.single(ImageFolders.AVATARS),
  UserController.updateProfile
);

router.get(
  UserRouteEndpoint.USER_BY_ID,
  authMiddleware,
  isMongoId,
  UserController.getUserById
);

enum NewsRouteEndpoint {
  NEWS = '/news',
  NEWS_BY_ID = '/news/:id',
  CREATE_NEWS = '/news/create-news',
  UPDATE_NEWS = '/news/update-news/:id',
  DELETE_NEWS = '/news/delete-news/:id',
}

router.post(
  NewsRouteEndpoint.CREATE_NEWS,
  authMiddleware,
  roleCheckMiddleware,
  fileUploader.fields([
    { name: ImageFolders.POSTERS, maxCount: 1 }, { name: ImageFolders.NEWS_IMAGES, maxCount: 6 }
  ]),
  // @ts-expect-error
  async (req: RequestForMulter, res, next) => await NewsController.createNews(req, res, next)
);

router.get(
  NewsRouteEndpoint.NEWS,
  authMiddleware,
  query('limit').default('10'),
  query('page').default('1'),
  NewsController.getNews
);

router.get(
  NewsRouteEndpoint.NEWS_BY_ID,
  authMiddleware,
  isMongoId,
  NewsController.getNewsById
);

router.put(
  NewsRouteEndpoint.UPDATE_NEWS,
  authMiddleware,
  roleCheckMiddleware,
  isMongoId,
  fileUploader.fields([
    { name: ImageFolders.POSTERS, maxCount: 1 }, { name: ImageFolders.NEWS_IMAGES, maxCount: 6 }
  ]),
  // @ts-expect-error
  async (req: RequestForMulter, res, next) => await NewsController.updateNewById(req, res, next)
);

router.delete(
  NewsRouteEndpoint.DELETE_NEWS,
  authMiddleware,
  roleCheckMiddleware,
  isMongoId,
  NewsController.deleteNewsById
);

enum ImagesRouteEndpoints {
  AVATAR = '/images/avatars/:filepath',
  POSTER = '/images/posters/:filepath',
  NEWS_IMAGE = '/images/newsImages/:filepath',
}

router.get(ImagesRouteEndpoints.AVATAR, ImageController.getAvatar);
router.get(ImagesRouteEndpoints.POSTER, ImageController.getPoster);
router.get(ImagesRouteEndpoints.NEWS_IMAGE, ImageController.getNewsImage);
