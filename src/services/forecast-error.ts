import { InternalError } from '@src/util/error/internal-error';

export class ForecastProcessingInternalError extends InternalError {
  constructor(message: string) {
    const internalMessage = 'Unexpected error during the forecast processing';
    super(`${internalMessage}: ${message}`);
  }
}
