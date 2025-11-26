import { container } from 'tsyringe';
import { IVersionService } from '../interfaces/IVersionService';
import { VersionService } from '../services/VersionService';
import { ICaptureService } from '../interfaces/ICaptureService';
import { CaptureService } from '../services/CaptureService';
import { AuthService } from '../services/AuthService';

container.register<IVersionService>('IVersionService', { useClass: VersionService });
container.register<ICaptureService>('ICaptureService', { useClass: CaptureService });
container.register(AuthService, { useClass: AuthService });

export { container };
