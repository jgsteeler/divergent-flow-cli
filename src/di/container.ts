import { container } from 'tsyringe';
import { IVersionService } from '../interfaces/IVersionService';
import { VersionService } from '../services/VersionService';

container.register<IVersionService>('IVersionService', { useClass: VersionService });

export { container };
