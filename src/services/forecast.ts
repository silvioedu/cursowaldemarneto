import { StormGlass } from '@src/clients/stormGlass';
import { ForecastPoint } from '@src/clients/stormGlass-interface';
import {
  Beach,
  BeachForecast,
  TimeForecast,
} from '@src/services/forecast-interface';

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    for (const beach of beaches) {
      const points: ForecastPoint[] = await this.stormGlass.fetchPoints(
        beach.lat,
        beach.lng
      );
      const enrichedBeachData = points.map((point) =>
        this.enrichData(beach, point)
      );
      pointsWithCorrectSources.push(...enrichedBeachData);
    }
    return this.mapForecastByTime(pointsWithCorrectSources);
  }

  private enrichData(beach: Beach, point: ForecastPoint): BeachForecast {
    return {
      ...{
        lat: beach.lat,
        lng: beach.lng,
        name: beach.name,
        position: beach.position,
        rating: 1, // need to be implemented
      },
      ...point,
    };
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
