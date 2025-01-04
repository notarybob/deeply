import {
  CRM_PROVIDERS,
  ACCOUNTING_PROVIDERS,
  TICKETING_PROVIDERS,
  MARKETINGAUTOMATION_PROVIDERS,
  FILESTORAGE_PROVIDERS,
  ECOMMERCE_PROVIDERS,
  EcommerceObject,
  CrmObject,
  FileStorageObject,
  TicketingObject,
  AccountingObject,
  MarketingAutomationObject,
} from '@panora/shared';
import * as fs from 'fs';
import * as path from 'path';

interface ProviderMetadata {
  actions: string[];
  supportedFields: string[][];
}

export async function generatePanoraParamsSpec(spec: any) {
  let verticals = {
    crm: [CRM_PROVIDERS, CrmObject],
    accounting: [ACCOUNTING_PROVIDERS, AccountingObject],
    ticketing: [TICKETING_PROVIDERS, TicketingObject],
    marketingautomation: [
      MARKETINGAUTOMATION_PROVIDERS,
      MarketingAutomationObject,
    ],
    filestorage: [FILESTORAGE_PROVIDERS, FileStorageObject],
    ecommerce: [ECOMMERCE_PROVIDERS, EcommerceObject],
  };

  for (let [vertical, [providers, COMMON_OBJECTS]] of Object.entries(
    verticals,
  )) {
    for (let objectKey of Object.values(COMMON_OBJECTS)) {
      for (let provider of providers as string[]) {
        try {
          let metadataPath = path.join(
            process.cwd(),
            'src',
            vertical.toLowerCase(),
            objectKey as string,
            'services',
            provider,
            'metadata.json',
          );

          let metadataRaw = fs.readFileSync(metadataPath, 'utf8');
          let metadata: ProviderMetadata = JSON.parse(metadataRaw);

          if (metadata) {
            metadata.actions.forEach((action, index) => {
              let path = `/${vertical.toLowerCase()}/${objectKey}s`;
              let op =
                action === 'list' ? 'get' : action === 'create' ? 'post' : '';

              if (spec.paths[path] && spec.paths[path][op]) {
                if (!spec.paths[path][op]['x-panora-remote-platforms']) {
                  spec.paths[path][op]['x-panora-remote-platforms'] = {};
                }
                // Ensure the provider array is initialized
                if (
                  !spec.paths[path][op]['x-panora-remote-platforms'][provider]
                ) {
                  spec.paths[path][op]['x-panora-remote-platforms'][provider] =
                    []; // Initialize as an array
                }
                for (let field of metadata.supportedFields[index]) {
                  spec.paths[path][op]['x-panora-remote-platforms'][
                    provider
                  ].push(field);
                }
              } else {
                console.warn(
                  `Path or operation not found in spec: ${path} ${op}`,
                );
              }
            });
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  return spec;
}
