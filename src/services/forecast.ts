import { StormGlass } from '@src/clients/stormGlass';
import { ForecastPoint } from '@src/clients/stormGlass-interface';
import logger from '@src/logger';
import { Beach } from '@src/model/beach';
import { ForecastProcessingInternalError } from '@src/services/forecast-error';
import { BeachForecast, TimeForecast } from '@src/services/forecast-interface';
import { Rating } from '@src/services/rating';
import _ from 'lodash';

export class Forecast {
  constructor(
    protected stormGlass = new StormGlass(),
    protected RatingService: typeof Rating = Rating
  ) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    try {
      const beachForecast = await this.calculateRating(beaches);
      const timeForecast = this.mapForecastByTime(beachForecast);
      return timeForecast.map(t => ({
        time: t.time,
        forecast: _.orderBy(t.forecast, ['rating'], ['desc'])
      }));
    } catch (error) {
      logger.error(error);
      throw new ForecastProcessingInternalError((error as Error).message);
    }
  }

  private async calculateRating(beaches: Beach[]): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    logger.info(`Preparing the forecast for ${beaches.length} beaches`);
    for (const beach of beaches) {
      const rating = new this.RatingService(beach);
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng);
      const enrichedBeachData = this.enrichBeachData(points, beach, rating);
      pointsWithCorrectSources.push(...enrichedBeachData);
    }
    return pointsWithCorrectSources;
  }

  private enrichBeachData(
    points: ForecastPoint[],
    beach: Beach,
    rating: Rating
  ): BeachForecast[] {
    return points.map((point) => ({
      ...{},
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: rating.getRateForPoint(point),
      },
      ...point,
    }));
  }

  private mapForecastByTime(forecast: BeachForecast[]): TimeForecast[] {
    const forecastByTime: TimeForecast[] = [];
    for (const point of forecast) {
      const timePoint = forecastByTime.find((f) => f.time === point.time);
      if (timePoint) {
        timePoint.forecast.push(point);
      } else {
        forecastByTime.push({
          time: point.time,
          forecast: [point],
        });
      }
    }
    return forecastByTime;
  }
}
