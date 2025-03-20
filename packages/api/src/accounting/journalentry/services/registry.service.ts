import { Injectable } from '@nestjs/common';
import { IJournalEntryService } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, IJournalEntryService>;

  constructor() {
    this.serviceMap = new Map<string, IJournalEntryService>();
  }

  registerService(serviceKey: string, service: IJournalEntryService) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): IJournalEntryService {
    let service = this.serviceMap.get(integrationId);
    if (!service) {
      return null;
    }
    return service;
  }
}
