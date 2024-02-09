import express, { type Express } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { router } from '../routes/routes';
import { errorMiddleware } from '../middlewares/error-middleware';

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API with Swagger',
      version: '1.0.0'
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/routes.ts'] // files containing annotations as above
};
const specs = swaggerJsdoc(options);

const app: Express = express();
const port: number = (process.env.PORT != null) ? parseInt(process.env.PORT) : 5000;
const dbUrl: string = process.env.DB_URL as string;
// RegisterRoutes(app);

app.use(express.json());
app.use(cors());
app.use('/api', express.static(path.join(__dirname, '..', 'images')));
app.use('/api', router);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(errorMiddleware);

const start = async (): Promise<void> => {
  try {
    await mongoose.connect(dbUrl);
    console.log('You have been connected to db successful');

    console.log(process.env.SMTP_PASSWORD);
    app.listen(port, () => { console.log(`Server started on http://localhost:${port}`); });
  } catch (error) {
    console.log(error);
  }
};

void start();
