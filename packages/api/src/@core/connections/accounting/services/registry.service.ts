import { IConnectionService } from '@@core/connections/@utils/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IConnectionService>;

  constructor() {
    this.serviceMap = new Map<string, IConnectionService>();
  }

  registerService(serviceKey: string, service: IConnectionService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IConnectionService {
    let service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
