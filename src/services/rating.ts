import { ForecastPoint } from '@src/clients/stormGlass-interface';
import { Beach, GeoPosition } from '@src/model/beach';

// meters
const WAVE_HEIGHTS = {
  ankleToKnee: {
    min: 0.3,
    max: 1.0,
  },
  waistHigh: {
    min: 1.0,
    max: 2.0,
  },
  headHigh: {
    min: 2.0,
    max: 2.5,
  },
};

export class Rating {
  constructor(private beach: Beach) {}

  public getRateForPoint(point: ForecastPoint): number {
    const swellDirection = this.getPositionFromLocation(point.swellDirection);
    const windDirection = this.getPositionFromLocation(point.windDirection);
    const windAndWaveRating = this.getRatingBasedOnWindAndWavePositions(
      swellDirection,
      windDirection
    );
    const swellHeightRating = this.getRatingForSwellSize(point.swellHeight);
    const swellPeriodRating = this.getRatingForSwellPeriod(point.swellPeriod);
    const finalRating =
      (windAndWaveRating + swellHeightRating + swellPeriodRating) / 3;
    return Math.round(finalRating);
  }

  public getRatingBasedOnWindAndWavePositions(
    wavePosition: GeoPosition,
    windPosition: GeoPosition
  ): number {
    if (wavePosition === windPosition) {
      return 1;
    } else if (this.isWindOffShore(wavePosition, windPosition)) {
      return 5;
    }
    return 3;
  }

  public isWindOffShore(
    waveDirection: GeoPosition,
    windDirection: GeoPosition
  ): boolean {
    return (
      (waveDirection === GeoPosition.N &&
        windDirection === GeoPosition.S &&
        this.beach.position === GeoPosition.N) ||
      (waveDirection === GeoPosition.S &&
        windDirection === GeoPosition.N &&
        this.beach.position === GeoPosition.S) ||
      (waveDirection === GeoPosition.E &&
        windDirection === GeoPosition.W &&
        this.beach.position === GeoPosition.E) ||
      (waveDirection === GeoPosition.W &&
        windDirection === GeoPosition.E &&
        this.beach.position === GeoPosition.W)
    );
  }

  public getRatingForSwellPeriod(period: number): number {
    return period < 7 ? 1 : period < 10 ? 2 : period < 14 ? 4 : 5;
  }

  public getRatingForSwellSize(height: number): number {
    return height < WAVE_HEIGHTS.ankleToKnee.min
      ? 1
      : height < WAVE_HEIGHTS.ankleToKnee.max
      ? 2
      : height < WAVE_HEIGHTS.waistHigh.max
      ? 3
      : 5;
  }

  public getPositionFromLocation(coordinates: number): GeoPosition {
    return coordinates < 50
      ? GeoPosition.N
      : coordinates < 120
      ? GeoPosition.E
      : coordinates < 220
      ? GeoPosition.S
      : coordinates < 310
      ? GeoPosition.W
      : GeoPosition.N;
  }
}
