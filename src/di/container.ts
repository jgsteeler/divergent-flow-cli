import { container } from 'tsyringe';
import type { IApiClient } from '../api-client/interfaces/IApiClient';
import { ApiClientImpl } from '../api-client/ApiClientImpl';

container.register<IApiClient>('IApiClient', { useClass: ApiClientImpl });

export { container };
