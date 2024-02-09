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
*           schema:
*             type: object
*             properties:
*               phoneNumber:
*                 type: string
*                 example: "+380123456789"
*               email:
*                 type: string
*                 example: "user@gmail.com"
*               password:
*                 type: string
*                 example: "pass123"
*                 minLength: 3
*                 maxLength: 32
*                 description: "Password must be between 3 and 32 characters"
*               confirmPassword:
*                 type: string
*                 example: "pass123"
*               name:
*                 type: string
*                 example: "Alex"
*                 minLength: 2
*                 maxLength: 32
*                 description: "Name must be between 2 and 32 characters"
*               surname:
*                 type: string
*                 example: "Smith"
*                 minLength: 2
*                 maxLength: 32
*                 description: "Surname must be between 2 and 32 characters"
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
*/router.post(
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
*         description: Login successful
*         content:
*          application/json:
*           example:
*             {
*                 "accessToken": "accessToken",
*                 "refreshToken": "refreshToken",
*                 "user": {
*                     "id": "id",
*                     "name": "name",
*                     "surname": "surname",
*                     "email": "email",
*                     "isAdmin": false,
*                     "education": null,
*                     "specialty": null,
*                     "yearOfRelease": null,
*                     "place": null,
*                     "phoneNumber": "number",
*                     "workPlace": null,
*                     "positionAtWork": null,
*                     "shortBiography": null,
*                     "educationAndGoals": null,
*                     "avatar": null,
*                     "createdAt": "time",
*                 }
*             }
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
* '/api/auth/refresh':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Login by refresh token
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             {
*               "refreshToken": "token"
*             }
*     responses:
*       200:
*         description: Login successful
*         content:
*          application/json:
*           example:
*             {
*                 "accessToken": "accessToken",
*                 "refreshToken": "refreshToken",
*                 "user": {
*                     "id": "id",
*                     "name": "name",
*                     "surname": "surname",
*                     "email": "email",
*                     "isAdmin": false,
*                     "education": null,
*                     "specialty": null,
*                     "yearOfRelease": null,
*                     "place": null,
*                     "phoneNumber": "number",
*                     "workPlace": null,
*                     "positionAtWork": null,
*                     "shortBiography": null,
*                     "educationAndGoals": null,
*                     "avatar": null,
*                     "createdAt": "time",
*                 }
*             }
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.post(
  AuthRouteEndpoint.REFRESH,
  body('refreshToken'),
  AuthController.refresh
);

/**
* @openapi
* '/api/auth/logout':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Logout
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             {
*               "refreshToken": "token"
*             }
*     responses:
*       200:
*         description: Logout successful
*         content:
*          application/json:
*           example: {
*             "message": "You successful logout"
*           }
*
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.post(
  AuthRouteEndpoint.LOGOUT,
  body('refreshToken'),
  AuthController.logout
);

/**
* @openapi
* '/api/auth/change-password':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Change password
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               oldPassword:
*                 type: string
*                 example: "oldPassword"
*               newPassword:
*                 type: string
*                 example: "newPassword"
*                 minLength: 3
*                 maxLength: 32
*                 description: "Password must be between 3 and 32 characters"
*               confirmNewPassword:
*                 type: string
*                 example: "newPassword"
*     responses:
*       200:
*         description: Password successful changed
*         content:
*          application/json:
*           example: {
*             "message": "Password successful changed"
*           }
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {
*               "message": "Validation error",
*               "errors": []
*             }
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example: {
*                "message": "User not authorized",
*                "errors": []
*             }
*/
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

/**
* @openapi
* '/api/auth/send-otp':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Send one time password
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             {
*               "email": "user@gmail.com"
*             }
*     responses:
*       200:
*         description: Code successful sent
*         content:
*          application/json:
*           example: {
*             "message": "Code successful sent"
*           }
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {
*               "message": "User not found",
*               "errors": []
*             }
*/
router.post(
  AuthRouteEndpoint.SEND_OTP,
  emailValidation,
  limit15min,
  AuthController.sendOtp
);

/**
* @openapi
* '/api/auth/resend-otp':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Resend one time password
*     requestBody:
*       required: true
*       content:
*         application/json:
*           example:
*             {
*               "email": "user@gmail.com"
*             }
*     responses:
*       200:
*         description: Code successful resent
*         content:
*          application/json:
*           example: {
*             "message": "Code successful resent"
*           }
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {
*               "message": "User not found",
*               "errors": []
*             }
*/
router.post(
  AuthRouteEndpoint.RESEND_OTP,
  emailValidation,
  limit15min,
  AuthController.reSendOtp
);

/**
* @openapi
* '/api/auth/reset-password':
*  post:
*     tags:
*     - AUTHENTICATION
*     summary: Reset password with otp code
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               email:
*                 type: string
*                 example: "user@gmail.com"
*               code:
*                 type: integer
*                 example: 123456
*                 description: "Otp code"
*               newPassword:
*                 type: string
*                 example: "newPassword"
*                 minLength: 3
*                 maxLength: 32
*                 description: "Password must be between 3 and 32 characters"
*               confirmNewPassword:
*                 type: string
*                 example: "newPassword"
*     responses:
*       200:
*         description: Password successful recovered
*         content:
*          application/json:
*           example: {
*             "message": "Password successful recovered"
*           }
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {
*               "message": "User not found",
*               "errors": []
*             }
*/
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

/**
* @openapi
* '/api/users':
*  get:
*     tags:
*     - PROFILE
*     summary: Get users
*     parameters:
*     - in: query
*       name: limit
*       schema:
*         type: integer
*       required: false
*       description: The number of items to return per page
*     - in: query
*       name: page
*       schema:
*         type: integer
*       required: false
*       description: The page number to return
*     responses:
*       200:
*         description: Users list
*         content:
*          application/json:
*           example:
*             total: 10
*             totalPages: 10
*             currentPage: 1
*             hasNextPage: true
*             hasPrevPage: false
*             perPage: 1
*             results:
*             - id: "userId"
*               name: "Alex"
*               surname: "Smith"
*               email: "user@gmail.com"
*               isAdmin: false
*               education: null
*               specialty: null
*               yearOfRelease: null
*               place: null
*               phoneNumber: "+380123456789"
*               workPlace: null
*               positionAtWork: null
*               shortBiography: null
*               educationAndGoals: null
*               avatar: null
*               createdAt: "time"
*/
router.get(
  UserRouteEndpoint.USERS,
  query('limit').default('10'),
  query('page').default('1'),
  UserController.getUsers
);

/**
* @openapi
* '/api/user/profile':
*  get:
*     tags:
*     - PROFILE
*     summary: Get user by refresh token
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: Users list
*         content:
*          application/json:
*           example:
*               id: "userId"
*               name: "Alex"
*               surname: "Smith"
*               email: "user@gmail.com"
*               isAdmin: false
*               education: null
*               specialty: null
*               yearOfRelease: null
*               place: null
*               phoneNumber: "+380123456789"
*               workPlace: null
*               positionAtWork: null
*               shortBiography: null
*               educationAndGoals: null
*               avatar: null
*               createdAt: "time"
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.get(
  UserRouteEndpoint.PROFILE,
  authMiddleware,
  UserController.getProfile
);

/**
* @openapi
* '/api/user/update-profile':
*  patch:
*     tags:
*     - PROFILE
*     summary: Update user profile
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               name:
*                 type: string
*                 description: The user's name.
*               surname:
*                 type: string
*                 description: The user's surname.
*               education:
*                 type: enum
*                 description: The user's education. ENUM type.
*                 enum: ["Среднее-Профессиональное","Бакалавриат", "Магистратура", "Докторантура", "Аспирантура", null]
*               specialty:
*                 type: enum
*                 description: The user's specialty. ENUM type.
*                 enum: ["Программист", "Врач", "Психолог", "Переводчик", null]
*               yearOfRelease:
*                 type: number
*                 description: The year the user was released.
*               place:
*                 type: string
*                 description: The user's place.
*               workPlace:
*                 type: string
*                 description: The user's workplace.
*               positionAtWork:
*                 type: string
*                 description: The user's position at work.
*               shortBiography:
*                 type: string
*                 description: A short biography of the user.
*               educationAndGoals:
*                 type: string
*                 description: The user's education and goals.
*               avatars:
*                 type: file
*                 description: The user's avatars.
*           example:
*             name: "name"
*             surname: "surname"
*             education: "education"
*             specialty: "specialty"
*             yearOfRelease: 2023
*             place: "place"
*             workPlace: "workPlace"
*             positionAtWork: "positionAtWork"
*             shortBiography: "shortBiography"
*             educationAndGoals: "educationAndGoals"
*             avatars: "avatars"
*     responses:
*       200:
*         description: Users list
*         content:
*          application/json:
*           example:
*              message: "User successful updated"
*              user:
*                  id: "userId"
*                  name: "Alex"
*                  surname: "Smith"
*                  email: "kanatbekovich36@gmail.com"
*                  isAdmin: false
*                  education: "Бакалавриат"
*                  specialty: "Программист"
*                  yearOfRelease: 2023
*                  place: "place"
*                  phoneNumber: "+380123456789"
*                  workPlace: "workPlace"
*                  positionAtWork: "positionArWork"
*                  shortBiography: "shortBiography"
*                  educationAndGoals: "educationAndGoals"
*                  avatar: "avatars-2549c1ea-d841-4632-8b14-21637f782e.jpg"
*                  createdAt: "2024-02-09T12:29:53.816Z"
*       500:
*         description: Unexpected error
*         content:
*          application/json:
*           example:
*              message: "Unexpected error"
*              errors: []
*       401:
*         description: User not authorized
*         content:
*          application/json:
*           example:
*              message: "User not authorized"
*              errors: []
*/
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
