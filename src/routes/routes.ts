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
import { VacancyController } from '../controllers/vacancy-controller';

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
*                  avatar: "avatars"
*                  createdAt: "2024-02-09T12:29:53.816Z"
*       500:
*         description: Unexpected error
*         content:
*          application/json:
*           example:
*              message: "Unexpected error"
*              errors: []
*       401:
*         description: Unathorized
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

/**
* @openapi
* '/api/user/{id}':
*  get:
*     tags:
*     - PROFILE
*     summary: Get user by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the user
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: User
*         content:
*          application/json:
*           example:
*             id: "userId"
*             name: "Alex"
*             surname: "Smith"
*             email: "user@gmail.com"
*             isAdmin: false
*             education: null
*             specialty: null
*             yearOfRelease: null
*             place: null
*             phoneNumber: "+380123456789"
*             workPlace: null
*             positionAtWork: null
*             shortBiography: null
*             educationAndGoals: null
*             avatar: null
*             createdAt: "time"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example:
*                "message": "Validation error"
*                "errors": []
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*                "message": "User not authorized"
*                "errors": []
*/
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

/**
* @openapi
* '/api/news/create-news':
*  post:
*     tags:
*     - NEWS
*     summary: Create news
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
*               title:
*                 type: string
*                 description: The news' title.
*               shortDescribe:
*                 type: string
*                 description: Short description of the news.
*               posters:
*                 type: file
*                 description: The poster for the news.
*               content:
*                 type: object
*                 description: The content of the news.
*                 properties:
*                  title:
*                    type: string
*                    description: The title of the section.
*                  paragraph:
*                    type: string
*                    description: The text of the section.
*               newsImages:
*                 type: files
*                 description: Images related to the news.
*           example:
*             title: "Title"
*             shortDescribe: "ShortDescription"
*             posters: "poster"
*             content: {"title": "Section1", "paragraph": "innerText"}
*             newsImages: "newsImages"
*     responses:
*       200:
*         description: News created
*         content:
*          application/json:
*           example:
*           - "message": "News successful created"
*             "news":
*             - "id": "newsId"
*               "title": "NewsTitle"
*               "poster": "poster"
*               "shortDescribe": "ShortDescription"
*               "content": [{"title": "Section1", "paragraph": "innerText"}]
*               "newsImages": [ "newsImage", "newsImage"]
*               "lastUpdate": null
*               "updatedBy": "Not updated yet"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "You are not a admin", "errors": []}
*/
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

/**
* @openapi
* '/api/news':
*  get:
*     tags:
*     - NEWS
*     summary: Get news
*     security:
*     - bearerAuth: []
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
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: News list
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
*               - "id": "newId"
*                 "title": "New"
*                 "poster": "poster"
*                 "shortDescribe": "ShortDescription"
*                 "content": [{"title": "Section1", "paragraph": "innerText"}]
*                 "newsImages": [ "newsImage", "newsImage"]
*                 "lastUpdate": null
*                 "updatedBy": "Not updated yet"
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.get(
  NewsRouteEndpoint.NEWS,
  authMiddleware,
  query('limit').default('10'),
  query('page').default('1'),
  NewsController.getNews
);

/**
* @openapi
* '/api/news/{id}':
*  get:
*     tags:
*     - NEWS
*     summary: Get news by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the news
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: News
*         content:
*          application/json:
*           example:
*             "id": "newsId"
*             "title": "NewsTitle"
*             "poster": "poster"
*             "shortDescribe": "ShortDescription"
*             "content": [{"title": "Section1", "paragraph": "innerText"}]
*             "newsImages": [ "newsImage", "newsImage"]
*             "lastUpdate": time
*             "updatedBy": "user@gmail.com"
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*                "message": "User not authorized"
*                "errors": []
*/
router.get(
  NewsRouteEndpoint.NEWS_BY_ID,
  authMiddleware,
  isMongoId,
  NewsController.getNewsById
);

/**
* @openapi
* '/api/news/update-news/{id}':
*  put:
*     tags:
*     - NEWS
*     summary: Update news by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the news
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
*               title:
*                 type: string
*                 description: The news' title.
*               shortDescribe:
*                 type: string
*                 description: Short description of the news.
*               posters:
*                 type: file
*                 description: The poster for the news.
*               content:
*                 type: object
*                 description: The content of the news.
*                 properties:
*                  title:
*                    type: string
*                    description: The title of the section.
*                  paragraph:
*                    type: string
*                    description: The text of the section.
*               newsImages:
*                 type: files
*                 description: Images related to the news.
*           example:
*             title: "Title"
*             shortDescribe: "ShortDescription"
*             posters: "poster"
*             content: {"title": "Section1", "paragraph": "innerText"}
*             newsImages: "newsImages"
*     responses:
*       200:
*         description: News successful updated
*         content:
*          application/json:
*           example:
*           - "message": "News successful created"
*             "news":
*             - "id": "newsId"
*               "title": "NewsTitle"
*               "poster": "poster"
*               "shortDescribe": "ShortDescription"
*               "content": [{"title": "Section1", "paragraph": "innerText"}]
*               "newsImages": [ "newsImage", "newsImage"]
*               "lastUpdate": time
*               "updatedBy": "user@gmail.com"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "You are not a admin", "errors": []}
*/
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

/**
* @openapi
* '/api/news/delete-news/{id}':
*  delete:
*     tags:
*     - NEWS
*     summary: Delete news by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the news
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: News successful deleted
*         content:
*          application/json:
*           example:
*           - "message": "News successful deleted"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "You are not a admin", "errors": []}
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.delete(
  NewsRouteEndpoint.DELETE_NEWS,
  authMiddleware,
  roleCheckMiddleware,
  isMongoId,
  NewsController.deleteNewsById
);

enum VacanciesRouteEndpoint {
  VACANCIES = '/vacancies',
  VACANCY_BY_ID = '/vacancies/:id',
  CREATE_VACANCY = '/vacancies/create-vacancy',
  UPDATE_VACANCY = '/vacancies/update-vacancy/:id',
  DELETE_VACANCY = '/vacancies/delete-vacancy/:id',
}

/**
* @openapi
* '/api/vacancies/create-vacancy':
*  post:
*     tags:
*     - VACANCIES
*     summary: Create vacancy
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
*               companyName:
*                 type: string
*                 description: The company name.
*               companyLogos:
*                 type: file
*                 description: The logo of company.
*               contacts:
*                 type: object
*                 description: The contacts of the company.
*                 properties:
*                  whatsapp:
*                    type: string
*                    description: Whatsapp number.
*                  telegram:
*                    type: string
*                    description: Telegram number.
*                  email:
*                    type: string
*                    description: email.
*               salary:
*                 type: string
*                 description: The salary of the position.
*               requirements:
*                 type: string
*                 description: The requirements of the position.
*               position:
*                 type: string
*                 description: The position in the company.
*           example:
*             companyName: "companyName"
*             companyLogos: "companyLogos"
*             salary: "salary"
*             content: {"whatsapp": "+380123456789", "telegram": "+380123456789", "email": "emailForCheck@gmail.com"}
*             requirements: "requirements"
*             position: "position"
*     responses:
*       200:
*         description: Vacancy created
*         content:
*          application/json:
*           example:
*           - "message": "Vacancy successful created"
*             "vacancy":
*             - "id": "vacancyId"
*               companyName: "companyName"
*               companyLogos: "companyLogos"
*               salary: "salary"
*               requirements: "requirements"
*               position: "position"
*               contacts: {"whatsapp": "+380123456789", "telegram": "+380123456789", "email": "emailForCheck@gmail.com"}
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "You are not a admin", "errors": []}
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.post(
  VacanciesRouteEndpoint.CREATE_VACANCY,
  authMiddleware,
  roleCheckMiddleware,
  fileUploader.single(ImageFolders.COMPANY_LOGOS),
  VacancyController.createVacancy
);

/**
* @openapi
* '/api/vacancies/update-vacancy/{id}':
*  put:
*     tags:
*     - VACANCIES
*     summary: Update vacancy by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the vacancy
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
*               companyName:
*                 type: string
*                 description: The company name.
*               companyLogos:
*                 type: file
*                 description: The logo of company.
*               contacts:
*                 type: object
*                 description: The contacts of the company.
*                 properties:
*                  whatsapp:
*                    type: string
*                    description: Whatsapp number.
*                  telegram:
*                    type: string
*                    description: Telegram number.
*                  email:
*                    type: string
*                    description: email.
*               salary:
*                 type: string
*                 description: The salary of the position.
*               requirements:
*                 type: string
*                 description: The requirements of the position.
*               position:
*                 type: string
*                 description: The position in the company.
*           example:
*             companyName: "companyName"
*             companyLogos: "companyLogos"
*             salary: "salary"
*             content: {"whatsapp": "+380123456789", "telegram": "+380123456789", "email": "emailForCheck@gmail.com"}
*             requirements: "requirements"
*             position: "position"
*     responses:
*       200:
*         description: Vacancy successful updated
*         content:
*          application/json:
*           example:
*           - "message": "successful updated"
*             "vacancy":
*             - "id": "vacancyId"
*               companyName: "companyName"
*               companyLogos: "companyLogos"
*               salary: "salary"
*               requirements: "requirements"
*               position: "position"
*               contacts: {"whatsapp": "+380123456789", "telegram": "+380123456789", "email": "emailForCheck@gmail.com"}
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "You are not a admin", "errors": []}
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.put(
  VacanciesRouteEndpoint.UPDATE_VACANCY,
  authMiddleware,
  roleCheckMiddleware,
  isMongoId,
  fileUploader.single(ImageFolders.COMPANY_LOGOS),
  VacancyController.updateVacancyById
);

/**
* @openapi
* '/api/vacancies/delete-vacancy/{id}':
*  delete:
*     tags:
*     - VACANCIES
*     summary: Delete vacancy by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the vacancy
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: Vacancy successful deleted
*         content:
*          application/json:
*           example:
*           - "message": "Vacancy successful deleted"
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "You are not a admin", "errors": []}
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.delete(
  VacanciesRouteEndpoint.DELETE_VACANCY,
  authMiddleware,
  roleCheckMiddleware,
  isMongoId,
  VacancyController.deleteVacancyById
);

/**
* @openapi
* '/api/vacancies/{id}':
*  get:
*     tags:
*     - VACANCIES
*     summary: Get vacancy by MongoDB id
*     security:
*     - bearerAuth: []
*     parameters:
*     - in: path
*       name: id
*       schema:
*         type: string
*       required: true
*       description: The MongoDB id of the vacancy
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: Vacancy
*         content:
*          application/json:
*           example:
*               "id": "vacancyId"
*               companyName: "companyName"
*               companyLogos: "companyLogos"
*               salary: "salary"
*               requirements: "requirements"
*               position: "position"
*               contacts: {"whatsapp": "+380123456789", "telegram": "+380123456789", "email": "emailForCheck@gmail.com"}
*               "lastUpdate": time
*               "updatedBy": "user@gmail.com"
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*                "message": "User not authorized"
*                "errors": []
*       400:
*         description: Bad request
*         content:
*           application/json:
*             example: {"message": "Vacancy not found", "errors": []}
*/
router.get(
  VacanciesRouteEndpoint.VACANCY_BY_ID,
  authMiddleware,
  isMongoId,
  VacancyController.getVacancyById
);

/**
* @openapi
* '/api/vacancies':
*  get:
*     tags:
*     - VACANCIES
*     summary: Get vacancies
*     security:
*     - bearerAuth: []
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
*     - in: header
*       name: Authorization
*       schema:
*         type: string
*       required: true
*       description: refresh token (bearer)
*     responses:
*       200:
*         description: Vacancies list
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
*               - "id": "vacancyId"
*                 "companyName": "companyName"
*                 "companyLogos": "companyLogos"
*                 "salary": "salary"
*                 "requirements": "requirements"
*                 "position": "position"
*                 "contacts": {"whatsapp": "+380123456789", "telegram": "+380123456789", "email": "emailForCheck@gmail.com"}
*                 "lastUpdate": time
*                 "updatedBy": "user@gmail.com"
*       401:
*         description: Unathorized
*         content:
*           application/json:
*             example:
*               "message": "User not authorized"
*               "errors": []
*/
router.get(
  VacanciesRouteEndpoint.VACANCIES,
  authMiddleware,
  query('limit').default('10'),
  query('page').default('1'),
  VacancyController.getVacancies
);

enum ImagesRouteEndpoints {
  AVATAR = '/images/avatars/:filepath',
  POSTER = '/images/posters/:filepath',
  NEWS_IMAGE = '/images/newsImages/:filepath',
  COMPANY_LOGO = '/images/companyLogos/:filepath'
}

router.get(ImagesRouteEndpoints.AVATAR, ImageController.getAvatar);
router.get(ImagesRouteEndpoints.POSTER, ImageController.getPoster);
router.get(ImagesRouteEndpoints.NEWS_IMAGE, ImageController.getNewsImage);
router.get(ImagesRouteEndpoints.COMPANY_LOGO, ImageController.getCompanyLogo);
