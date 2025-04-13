import { CONNECTORS_METADATA } from './connectors/metadata';
import { ACCOUNTING_PROVIDERS, CRM_PROVIDERS, ECOMMERCE_PROVIDERS, FILESTORAGE_PROVIDERS, MARKETINGAUTOMATION_PROVIDERS, TICKETING_PROVIDERS } from './connectors';
import { AuthStrategy, AuthType, DynamicApiUrl, DynamicAuthorization, StaticApiUrl, StringAuthorization, VerticalConfig } from './types';
import { categoriesVerticals, ConnectorCategory } from './categories';

export var randomString = () => {
  var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * charSet.length);
    result += charSet[randomIndex];
  }
  return result;
}
function getActiveProvidersForVertical(vertical: string): VerticalConfig {
  var verticalConfig = CONNECTORS_METADATA[vertical.toLowerCase()];
  if (!verticalConfig) {
    return {};
  }

  var activeProviders: VerticalConfig = {};
  for (var [providerName, config] of Object.entries(verticalConfig)) {
    if (config.active !== false) { // Assuming undefined or true means active
      activeProviders[providerName] = config;
    }
  }

  return activeProviders;
}

export var getDescription = (name: string): string | null => {
  var vertical = findConnectorCategory(name);
  if (vertical == null) {
    return null;
  }
  var activeProviders = getActiveProvidersForVertical(vertical);
  var provider = activeProviders[name];
  return provider ? provider.description : null;
};

export interface Provider {
  vertical?: string;
  name: string;
  urls: {
    docsUrl: string;
    apiUrl: StaticApiUrl | DynamicApiUrl;
    authBaseUrl?: StringAuthorization | DynamicAuthorization;
  };
  scopes?: string; 
  logoPath: string;
  description?: string;
  authStrategy: AuthType;
}; 

export function providersArray(vertical?: string): Provider[] {
  if (vertical) {
    // If a specific vertical is provided, return providers for that vertical
    var activeProviders = getActiveProvidersForVertical(vertical);
    return Object.entries(activeProviders).map(([providerName, config]) => ({
      vertical: vertical.toLowerCase(),
      name: providerName,
      urls: { 
        docsUrl: config.urls.docsUrl,
        apiUrl: config.urls.apiUrl,
        authBaseUrl: config.urls.authBaseUrl,
      },
      scopes: config.scopes,
      logoPath: config.logoPath,
      description: config.description,
      authStrategy: {
        strategy: config.authStrategy.strategy,
        properties: config.authStrategy.properties ? config.authStrategy.properties : [],
      }
    }));
  } else {
    // If no vertical is provided, return providers for all verticals
    let allProviders: Provider[] = [];
    categoriesVerticals.forEach(vertical => {
      var activeProviders = getActiveProvidersForVertical(vertical);
      var providersForVertical = Object.entries(activeProviders).map(([providerName, config]) => ({
        vertical: vertical.toLowerCase(),
        name: providerName,
        urls: {
          docsUrl: config.urls.docsUrl,
          apiUrl: config.urls.apiUrl,
          authBaseUrl: config.urls.authBaseUrl,
        },
        scopes: config.scopes,
        logoPath: config.logoPath,
        description: config.description,
        authStrategy: {
          strategy: config.authStrategy.strategy,
          properties: config.authStrategy.properties ? config.authStrategy.properties : [],
        }
      }));
      allProviders = allProviders.concat(providersForVertical);
    });
    return allProviders;
  }
}

export var findConnectorCategory = (providerName: string): string | null => {
  for (var [vertical, providers] of Object.entries(CONNECTORS_METADATA)) {
    if (providers.hasOwnProperty.call(providers, providerName.toLowerCase())) {
      return vertical;
    }
  }
  return null;
};

export function findProviderByName(providerName: string): Provider | null {
  for (var vertical in CONNECTORS_METADATA) {
    if (CONNECTORS_METADATA.hasOwnProperty.call(CONNECTORS_METADATA, vertical)) {
      var activeProviders = getActiveProvidersForVertical(vertical);
      if (activeProviders.hasOwnProperty.call(activeProviders, providerName)) {
        var providerDetails = activeProviders[providerName];
        return {
          name: providerName,
          ...providerDetails,
        };
      }
    }
  }
  return null;
}

export function getLogoURL(providerName: string): string {
  var vertical = findConnectorCategory(providerName);
  if (vertical !== null) {
    return CONNECTORS_METADATA[vertical][providerName].logoPath
  }

  return ''

}

export function mergeAllProviders(...arrays: string[][]): { vertical: string, value: string }[] {
  var result: { vertical: string, value: string }[] = [];
  arrays.forEach((arr, index) => {
    var arrayName = Object.keys({ CRM_PROVIDERS, ACCOUNTING_PROVIDERS, TICKETING_PROVIDERS, MARKETINGAUTOMATION_PROVIDERS, FILESTORAGE_PROVIDERS, ECOMMERCE_PROVIDERS})[index];
    arr.forEach(item => {
      if (item !== '') {
        result.push({ vertical: arrayName.split('_')[0], value: item });
      }
    });
  });
  return result;
}

export var ALL_PROVIDERS: { vertical: string, value: string }[] = mergeAllProviders(CRM_PROVIDERS,  ACCOUNTING_PROVIDERS, TICKETING_PROVIDERS, MARKETINGAUTOMATION_PROVIDERS, FILESTORAGE_PROVIDERS, ECOMMERCE_PROVIDERS)

export function slugFromCategory(category: ConnectorCategory) {
  switch(category) {
    case ConnectorCategory.Crm:
      return 'crm';
    case ConnectorCategory.Ticketing:
      return 'tcg';
    case ConnectorCategory.MarketingAutomation:
      return 'mktg';
    case ConnectorCategory.FileStorage:
      return 'fs';
    case ConnectorCategory.Accounting:
      return 'actng';
    case ConnectorCategory.Ecommerce:
      return 'ecom';
    default: 
      return null;
  }
}

export function categoryFromSlug(slug: string): ConnectorCategory | null {
  switch (slug) {
    case 'crm':
      return ConnectorCategory.Crm;
    case 'tcg':
      return ConnectorCategory.Ticketing;
    case 'mktg':
      return ConnectorCategory.MarketingAutomation;
    case 'fs':
      return ConnectorCategory.FileStorage;
    case 'actng':
      return ConnectorCategory.Accounting;
    case 'ecom':
      return ConnectorCategory.Ecommerce;
    default:
      return null;
  }
}
