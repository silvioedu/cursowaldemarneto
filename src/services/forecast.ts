import { ForecastPoint } from '@src/clients/stormGlass-interface';
import { Beach, BeachForecast } from '@src/services/forecast-interface';
import { StormGlass } from '@src/clients/stormGlass';

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(
    beaches: Beach[]
  ): Promise<BeachForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = [];
    for (const beach of beaches) {
      const points: ForecastPoint[] = await this.stormGlass.fetchPoints(
        beach.lat,
        beach.lng
      );
      const enrichedBeachData = points.map((e) => ({
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 1,
        },
        ...e,
      }));
      pointsWithCorrectSources.push(...enrichedBeachData);
    }
    return pointsWithCorrectSources;
  }
}
