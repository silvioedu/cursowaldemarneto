import './util/module-alias';

import { Server } from '@overnightjs/core';
import apiSchema from '@src/api.schema.json';
import { BeachController } from '@src/controller/beach';
import { ForecastController } from '@src/controller/forecast';
import { UserController } from '@src/controller/user';
import { close as dbClose, connect as dbConnect } from '@src/database';
import logger from '@src/logger';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Application } from 'express';
import expressPino from 'express-pino-logger';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import { OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import { apiErrorValidator } from '@src/middleware/api-error-validator';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    await this.setupDocs();
    this.setupControllers();
    await this.setupDatabase();
    this.setupErrorHandlers();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      logger.info(`Server listening on port: ${this.port}`);
    });
  }

  public async close(): Promise<void> {
    await dbClose();
    logger.info('Databse closed OK');
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    logger.info('Preparing Express');
    this.app.use(bodyParser.json());
    this.app.use(
      expressPino({
        logger,
      })
    );
    this.app.use(
      cors({
        origin: '*',
      })
    );
    logger.info('Express configuration OK');
  }

  private setupControllers(): void {
    logger.info('Preparing Controllers');
    const forecastController = new ForecastController();
    const beachController = new BeachController();
    const userController = new UserController();

    this.addControllers([forecastController, beachController, userController]);
    logger.info('Controllers OK');
  }

  private async setupDatabase(): Promise<void> {
    logger.info('Preparing Database');
    await dbConnect();
    logger.info('Database OK');
  }

  private async setupDocs(): Promise<void> {
    this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSchema));
    this.app.use(
      OpenApiValidator.middleware({
        apiSpec: apiSchema as OpenAPIV3.Document,
        validateRequests: false,
        validateResponses: false,
      })
    );
    logger.info('Docs OK');
  }

  private setupErrorHandlers(): void {
    this.app.use(apiErrorValidator);
    logger.info('Error Handlers OK');
  }
}
