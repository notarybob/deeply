import { CONNECTORS_METADATA } from './connectors/metadata';
import {
  needsEndUserSubdomain,
  needsScope,
  needsSubdomain,
  OAuth2AuthData,
  providerToType
} from './envConfig';
import {
  AuthStrategy,
  DynamicAuthorization,
  ProviderConfig,
  StringAuthorization
} from './types';
import { randomString } from './utils';

interface AuthParams {
  projectId: string;
  linkedUserId: string;
  providerName: string;
  returnUrl: string;
  apiUrl: string;
  vertical: string;
  redirectUriIngress?: {
    status: boolean;
    value: string | null;
  };
  [key: string]: any;
}

export var constructAuthUrl = async ({
  projectId,
  linkedUserId,
  providerName,
  returnUrl,
  apiUrl,
  vertical,
  additionalParams,
  redirectUriIngress
}: AuthParams) => {
  var config = CONNECTORS_METADATA[vertical.toLowerCase()][providerName];
  if (!config) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  let baseRedirectURL = apiUrl;
  if (config.options?.local_redirect_uri_in_https && redirectUriIngress?.status) {
    baseRedirectURL = redirectUriIngress.value!;
  } 

  var encodedRedirectUrl = encodeURIComponent(`${baseRedirectURL}/connections/oauth/callback`);
  let state = encodeURIComponent(JSON.stringify({ projectId, linkedUserId, providerName, vertical, ...additionalParams, returnUrl }));

  if (['deel', 'squarespace'].includes(providerName)) {
    var randomState = randomString();
    state = encodeURIComponent(randomState + `${providerName}_delimiter` + Buffer.from(JSON.stringify({
      projectId, linkedUserId, providerName, vertical, returnUrl, ...Object.values(additionalParams || {})
    })).toString('base64'));
  }
  var opts: any = {};
  if (['snyk', 'klaviyo'].includes(providerName)) {
    var response = await fetch(`${apiUrl}/auth/s256Codes`);
    var data = await response.json();
    var { codeChallenge, codeVerifier } = data;
    state = encodeURIComponent(JSON.stringify({
      projectId, linkedUserId, providerName, vertical, returnUrl, code_verifier: codeVerifier
    }));
    opts.codeVerifier = codeVerifier;
    opts.codeChallenge = codeChallenge;
  }

  if (vertical === null) {
    throw new ReferenceError('vertical is null');
  }

  var authStrategy = config.authStrategy!.strategy;

  switch (authStrategy) {
    case AuthStrategy.oauth2:
      return handleOAuth2Url({
        providerName, vertical, authStrategy, projectId, config,
        encodedRedirectUrl, state, apiUrl, ...Object.values(additionalParams || {}), ...opts
      });
    case AuthStrategy.api_key:
      return handleApiKeyUrl();
    case AuthStrategy.basic:
      return handleBasicUrl();
  }
};

interface HandleOAuth2Url {
  providerName: string;
  vertical: string;
  authStrategy: AuthStrategy;
  projectId: string;
  config: ProviderConfig;
  encodedRedirectUrl: string;
  state: string;
  apiUrl: string;
  [key: string]: any;
}

var handleOAuth2Url = async ({
  providerName,
  vertical,
  authStrategy,
  projectId,
  config,
  encodedRedirectUrl,
  state,
  apiUrl,
  ...dyn
}: HandleOAuth2Url) => {
  var type = providerToType(providerName, vertical, authStrategy);

  var response = await fetch(`${apiUrl}/connection_strategies/getCredentials?projectId=${projectId}&type=${type}`);
  var data = await response.json() as OAuth2AuthData;

  var clientId = data.CLIENT_ID;
  if (!clientId) throw new ReferenceError(`No client id for type ${type}`);

  var scopes = data.SCOPE;
  var { urls: { authBaseUrl: baseUrl } } = config;
  if (!baseUrl) throw new ReferenceError(`No authBaseUrl found for type ${type}`);

  let BASE_URL: string;
  if (needsSubdomain(providerName, vertical)) {
    BASE_URL = typeof baseUrl === 'string' ? baseUrl : (baseUrl as DynamicAuthorization)(data.SUBDOMAIN as string);
  } else if (needsEndUserSubdomain(providerName, vertical)) {
    BASE_URL = typeof baseUrl === 'string' ? baseUrl : (baseUrl as DynamicAuthorization)(...Object.values(dyn || {}));
  } else {
    BASE_URL = baseUrl as StringAuthorization;
  }

  if (!BASE_URL) {
    throw new Error(`Unsupported provider: ${providerName}`);
  }

  let params = `response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;

  // Provider-specific parameter adjustments
  switch (providerName) {
    case 'helpscout':
      params = `client_id=${encodeURIComponent(clientId)}&state=${state}`;
      break;
    case 'pipedrive':
    case 'shopify':
    case 'squarespace':
      params = `client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodedRedirectUrl}&state=${state}`;
      break;
    case 'faire':
      params = `applicationId=${encodeURIComponent(clientId)}&redirectUrl=${encodedRedirectUrl}&state=${state}`;
      break;
    case 'ebay':
      params = `response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${data.RUVALUE}&state=${state}`;
      break;
    case 'amazon':
      params = `application_id=${encodeURIComponent(data.APPLICATION_ID)}&state=${state}&version=beta`;
      break;
  }

  // Handle scopes
  if (needsScope(providerName, vertical) && scopes) {
    if (providerName === 'slack') {
      params += `&scope=&user_scope=${encodeURIComponent(scopes)}`;
    } else if (providerName === 'microsoftdynamicssales') {
      var url = new URL(BASE_URL);
      BASE_URL = url.origin + url.pathname;
      var resource = url.searchParams.get('resource');
      var scopeValue = `https://${resource}/.default offline_access`;
      params += `&scope=${encodeURIComponent(scopeValue)}`;
    } else if (providerName === 'deel') {
      params += `&scope=${encodeURIComponent(scopes.replace(/\t/g, ' '))}`;
    } else {
      params += `&scope=${encodeURIComponent(scopes)}`;
    }
  }

  // Additional provider-specific parameters
  switch (providerName) {
    case 'zoho':
    case 'squarespace':
      params += '&access_type=offline';
      break;
    case 'jira':
    case 'jira_service_mgmt':
      params = `audience=api.atlassian.com&${params}&prompt=consent`;
      break;
    case 'gitlab':
      params += '&code_challenge=&code_challenge_method=';
      break;
    case 'gorgias':
      params += `&nonce=${randomString()}`;
      break;
    case 'googledrive':
      params += '&access_type=offline&prompt=consent';
      break;
    case 'dropbox':
      params += '&token_access_type=offline';
      break;
    case 'basecamp':
      params += '&type=web_server';
      break;
    case 'lever':
      params += '&audience=https://api.lever.co/v1/';
      break;
    case 'notion':
      params += '&owner=user';
      break;
    case 'snyk':
    case 'klaviyo':
      params += `&code_challenge_method=S256&code_challenge=${dyn.codeChallenge}`;
      break;
  }

  return `${BASE_URL}?${params}`;
}

var handleApiKeyUrl = async () => {
  // Placeholder for API key handling
  return;
}

var handleBasicUrl = async () => {
  // Placeholder for basic auth handling
  return;
}
