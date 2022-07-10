import './util/module-alias';

import { Server } from '@overnightjs/core';
import { BeachController } from '@src/controller/beach';
import { ForecastController } from '@src/controller/forecast';
import { UserController } from '@src/controller/user';
import { close as dbClose, connect as dbConnect } from '@src/database';
import bodyParser from 'body-parser';
import { Application } from 'express';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.info('Server listening on port:', this.port);
    });
  }

  public async close(): Promise<void> {
    await dbClose();
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
    // console.info('Express configuration OK');
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachController = new BeachController();
    const userController = new UserController();

    this.addControllers([forecastController, beachController, userController]);
    // console.info('Controllers OK');
  }

  private async setupDatabase(): Promise<void> {
    await dbConnect();
    // console.info('Database OK');
  }
}
