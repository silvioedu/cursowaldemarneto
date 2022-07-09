import { ForecastPoint } from '@src/clients/stormGlass-interface';
import { Beach } from '@src/model/beach';

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export interface TimeForecast {
  time: string;
  forecast: BeachForecast[];
}
