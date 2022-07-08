import './util/module-alias';

import { Server } from '@overnightjs/core';
import { close as dbClose, connect as dbConnect } from '@src/database';
import bodyParser from 'body-parser';
import { Application } from 'express';

import { ForecastController } from '@src/controller/forecast';
import { BeachController } from '@src/controller/beach';

export class SetupServer extends Server {
  constructor(private port = 3000) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.setupDatabase();
  }

  public async close(): Promise<void> {
    await dbClose();
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    const beachController = new BeachController();
    this.addControllers([forecastController, beachController]);
  }

  private async setupDatabase(): Promise<void> {
    await dbConnect();
  }
}
