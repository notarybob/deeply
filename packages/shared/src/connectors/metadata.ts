// If authBaseUrl or apiUrl both start with / it means a company_subdomain is likely needed
// If authBaseUrl is blank then it must be manually built in the client given the provider (meaning its not deterministic)

import { AuthStrategy, ProvidersConfig } from '../types';

export const CONNECTORS_METADATA: ProvidersConfig = {
    'crm': {
      'hubspot': {
        scopes: 'crm.objects.companies.read crm.objects.companies.write crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write crm.objects.custom.read crm.objects.custom.write crm.objects.leads.read crm.objects.leads.write crm.objects.owners.read crm.objects.users.read crm.objects.users.write oauth sales-email-read',
        urls: {
          docsUrl: 'https://developers.hubspot.com/docs/api/crm/understanding-the-crm',
          authBaseUrl: 'https://app-eu1.hubspot.com/oauth/authorize',
          apiUrl: 'https://api.hubapi.com',
          customPropertiesUrl: 'https://api.hubapi.com/properties/v1/contacts/properties',
        },
        logoPath: 'https://assets-global.website-files.com/6421a177cdeeaf3c6791b745/64d61202dd99e63d40d446f6_hubspot%20logo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      'attio': {
        urls: {
          docsUrl: 'https://developers.attio.com/reference',
          authBaseUrl: 'https://app.attio.com/authorize',
          apiUrl: 'https://api.attio.com',
          customPropertiesUrl: '/docs/standard-objects-people',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJWZsShi0G6mZ451MngEvQrmJ2JIGH-AF8JyFU-q-n3w&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'zoho': {
        scopes: 'ZohoCRM.modules.ALL,ZohoCRM.users.READ',
        urls: {
          docsUrl: 'https://www.zoho.com/crm/developer/docs/api/v5/',
          authBaseUrl: 'https://accounts.zoho.com/oauth/v2/auth',
          apiUrl: (zohoLocationBaseUrl: string) => `${zohoLocationBaseUrl}/crm`,
          customPropertiesUrl: '/settings/fields?module=Contact',
        },
        logoPath: 'https://assets-global.website-files.com/64f68d43d25e5962af5f82dd/64f68d43d25e5962af5f9812_64ad8bbe47c78358489b29fc_645e3ccf636a8d659f320e25_Group%25252012.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'pipedrive': {
        urls: { 
          docsUrl: 'https://developers.pipedrive.com/docs/api/v1',
          authBaseUrl: 'https://oauth.pipedrive.com/oauth/authorize',
          apiUrl: 'https://api.pipedrive.com',
          customPropertiesUrl: '/v1/personFields',
        },
        logoPath: 'https://asset.brandfetch.io/idZG_U1qqs/ideqSFbb2E.jpeg',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      'freshsales': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/Mwgb5c2sVHGHoDlthAYPnMGekEOzsvMR5zotxskrl0erKTW-xpZbuIXn7AEIqvrRHQ',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'zendesk': {
        scopes: 'read write profile',
        urls: {
          docsUrl: 'https://developer.zendesk.com/api-reference/sales-crm/introduction/',
          authBaseUrl: 'https://api.getbase.com/oauth2/authorize',
          apiUrl: 'https://api.getbase.com',
          customPropertiesUrl: '/contact/custom_fields',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'accelo': { 
        urls: {
          docsUrl: 'https://api.accelo.com/docs/#introduction',
          authBaseUrl: (domain) => `https://${domain}.api.accelo.com/oauth2/v0/authorize`,
          apiUrl: (domain) => `https://${domain}.api.accelo.com/api/v0`,
        },
        logoPath: 'https://play-lh.googleusercontent.com/j63K2u8ZXukgPs8QPgyXfyoxuNBl_ST7gLx5DEFeczCTtM9e5JNpDjjBy32qLxFS7p0',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        options: {
          company_subdomain: true
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'active_campaign': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.activecampaign.com/reference/overview',
          apiUrl: '/api/3',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSymrBOaXpQab_5RPRZfiOXU7h9dfsduGZeCaZZw59xJA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key']
        }
      },
      'affinity': {
        urls: {
          docsUrl: 'https://api-docs.affinity.co/#getting-started',
          apiUrl: 'https://api.affinity.co',
        },
        logoPath: 'https://media.licdn.com/dms/image/C4D0BAQFOaK6KXEYj_w/company-logo_200_200/0/1630489791871/project_affinity_logo?e=2147483647&v=beta&t=u8j-1u3nO2m6vqgT170WJMCJyFSDiLYS_VguYOllNMI',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        primaryColor: '#244CED',
        authStrategy: {
          strategy: AuthStrategy.basic,
          properties: ['password']
        }
      },
      'capsule': { 
        urls: {
          docsUrl: 'https://developer.capsulecrm.com/',
          authBaseUrl: 'https://api.capsulecrm.com/oauth/authorise',
          apiUrl: 'https://api.capsulecrm.com/api/v2',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjS3qFlJJbQ802nGEV9w2GEgmnAIgJj6JJxe14cH6Wuw&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      'close': {
        urls: {
          docsUrl: 'https://developer.close.com/',
          authBaseUrl: 'https://app.close.com/oauth2/authorize',
          apiUrl: 'https://api.close.com/api',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEH77yPBUkStmoc1ZtgJS4XeBmQiaq_Q1vgF5oerOGbg&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'copper': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.copper.com/index.html',
          authBaseUrl: 'https://app.copper.com/oauth/authorize',
          apiUrl: 'https://api.copper.com/developer_api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVa1YDciibzviRJxGovqH4gNgPxpZUAHEz36Bwnj54uQ&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'insightly': {
        scopes: '',
        urls: {
          docsUrl: 'https://api.insightly.com/v3.1/Help#!/Overview/Introduction',
          apiUrl: '/v3.1',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        },
      },
      'keap': {
        urls: {
          docsUrl: 'https://developer.infusionsoft.com/docs/restv2/',
          authBaseUrl: 'https://accounts.infusionsoft.com/app/oauth/authorize',
          apiUrl: 'https://api.infusionsoft.com/crm/rest/v2',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPYsWSMe9KVWgCIQ8fw-vBOnfTlZaSS6p_43ZhEIx51A&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'microsoftdynamicssales': {
        scopes: 'offline_access',
        urls: {
          docsUrl: '',
          authBaseUrl: (orgName) => `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?resource=${orgName}`,
          apiUrl: `/api/data/v9.2`,
        },
        logoPath: 'https://play-lh.googleusercontent.com/MC_Aoa7rlMjGtcgAdiLJGeIm3-kpVw7APQmQUrUZtXuoZokiqVOJqR-bTu7idJBD8g',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        primaryColor: '#516EE2',
        options: {
          end_user_domain: true
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2,
          properties: ['organization_name']
        }
      },
      'nutshell': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.nutshell.com/',
          apiUrl: '/api/v1/json',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbCONyN9DCKfd4E8pzIdItl5VqPTEErpoEn9vHCgblRg&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.basic
        }
      },
      'pipeliner': {
        scopes: '',
        urls: {
          docsUrl: 'https://pipeliner.stoplight.io/docs/api-docs',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/rK9Qv_w9C8Py_aLZdQQDobNdHWSG8KL4dj3cBBQLcimVu-ctxwujA4VE442lIpZ65AE',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.basic
        }
      },
      'salesflare': {
        scopes: '',
        urls: {
          docsUrl: 'https://api.salesflare.com/docs#section/Introduction/Getting-Started',
          apiUrl: 'https://api.salesflare.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTesqSVCSaCDrjedsKbepr14iJPySzUwrh7Fg9MhgKh9w&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'salesforce': {
        scopes: 'offline_access refresh_token full',
        urls: {
          docsUrl: 'https://help.salesforce.com',
          authBaseUrl: (domain) => `https://${domain}.my.salesforce.com/services/oauth2/authorize`,
          apiUrl: (domain) => `https://${domain}.my.salesforce.com`,
        },
        logoPath: 'https://logos-world.net/wp-content/uploads/2020/10/Salesforce-Logo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2,
          properties: ['domain']
        },
        primaryColor: '#01A2E0',
        options: {
          end_user_domain: true
        }, 
      },
      'sugarcrm': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQftNERc1ImBHm8MXXuWdhQiFYwW-dXNcogRL1UV8JyHFQGY2BbsbpwKvERwKRB39RH6zw&usqp=CAU',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'teamleader': {
        urls: {
          docsUrl: 'https://developer.teamleader.eu/#/introduction/ap-what?',
          authBaseUrl: 'https://focus.teamleader.eu/oauth2/authorize',
          apiUrl: 'https://api.focus.teamleader.eu',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTE99rDOwXdRYGET0oeSCqK2kB02slJxZtTeBC79pb8IQ&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'teamwork': {
        urls: {
          docsUrl: 'https://apidocs.teamwork.com/guides/teamwork/getting-started-with-the-teamwork-com-api',
          authBaseUrl: 'https://www.teamwork.com/launchpad/login',
          apiUrl: '', // on purpose blank => everything is contained inside the apiEndPoint that teamwork returns
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQr6gYDMNagMEicBb4dhKz4BC1fQs72In45QF7Ls6-moA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      // todo
      'vtiger': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcUYrYD8lnaFaDN93vwjHhksKJUG3rqlb1TCFC__oPBw&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.basic
        }
      },
      // todo
      'twenty': {
        scopes: '',
        urls: {
          docsUrl: '',
          authBaseUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'redtail': {
        urls: {
          docsUrl: 'https://corporate.redtailtechnology.com/api',
          apiUrl: 'https://smf.crm3.redtailtechnology.com/api/public/v1', // still unsure need to double check with their team
        },
        logoPath: 'https://pbs.twimg.com/profile_images/1247266546688249856/7TZh-Laf_400x400.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.api_key
        },
        active: false
      },
      'wealthbox': {
        scopes: 'login+data',
        urls: {
          docsUrl: 'https://dev.wealthbox.com',
          apiUrl: 'https://smf.crm3.redtailtechnology.com/api/public/v1',
          authBaseUrl: 'https://app.crmworkspace.com/oauth/authorize'
        },
        logoPath: 'https://pbs.twimg.com/profile_images/1674874004027461632/zoKBfoA0_400x400.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        active: false
      }
    },
    'ticketing': {
      'front': {
        urls: {
          docsUrl: 'https://dev.frontapp.com/docs/welcome',
          authBaseUrl: 'https://app.frontapp.com/oauth/authorize',
          apiUrl: 'https://api2.frontapp.com',
        },
        logoPath: 'https://i.pinimg.com/originals/43/a2/43/43a24316bd773798c7638ad98521eb81.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      'zendesk': {
        scopes: 'read write',
        urls: {
          docsUrl: 'https://developer.zendesk.com/api-reference/sales-crm/introduction/',
          apiUrl: (myDomain) => `https://${myDomain}.zendesk.com/api`,
          authBaseUrl: (myDomain) => `https://${myDomain}.zendesk.com/oauth/authorizations/new`
        }, 
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKVceZGVM7PbARp_2bjdOICUxlpS5B29UYlurvh6Z2Q&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          company_subdomain: true
        },
        realTimeWebhookMetadata: {
          method: 'API',
          events: [
            'ticketing.tickets.events',
            'ticketing.comments.events',
            'ticketing.tags.events',
            'ticketing.attachments.events', 
            'ticketing.accounts.events',
            'ticketing.users.events',
            'ticketing.contacts.events',
          ]
        },
      },
      'gorgias': {
        scopes: 'write:all openid email profile offline',
        urls: {
          docsUrl: 'https://developers.gorgias.com/reference/introduction',
          apiUrl: (domain) => `https://${domain}.gorgias.com/api`,
          authBaseUrl: (domain) => `https://${domain}.com/connections/gorgias/oauth/install`,
        },
        options: {
          company_subdomain: true,
        },
        logoPath: 'https://x5h8w2v3.rocketcdn.me/wp-content/uploads/2020/09/FS-AFFI-00660Gorgias.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        active: false
      },
      'jira': {
        scopes: 'read:jira-work manage:jira-project manage:jira-configuration read:jira-user write:jira-work manage:jira-webhook manage:jira-data-provider offline_access',
        urls: {
          docsUrl: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3',
          apiUrl: (cloudId) => `https://api.atlassian.com/ex/jira/${cloudId}/rest/api`, 
          authBaseUrl: 'https://auth.atlassian.com/authorize', 
        },
        options: {
          local_redirect_uri_in_https: true
        },
        logoPath: 'https://logowik.com/content/uploads/images/jira3124.jpg',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2 
        }
      },
      'linear': {
        scopes: 'read,write',
        urls: {
          docsUrl: 'https://developers.linear.app/docs',
          apiUrl: 'https://api.linear.app/graphql',
          authBaseUrl: 'https://linear.app/oauth/authorize',
        },
        logoPath: 'https://asset.brandfetch.io/iduDa181eM/idYYbqOlKi.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'gitlab': {
        scopes: 'api read_api read_user create_runner k8s_proxy read_repository write_repository sudo admin_mode read_service_ping openid profile email',
        urls: {
          docsUrl: 'https://docs.gitlab.com/ee/api/rest/#',
          apiUrl: 'https://gitlab.com/api',
          authBaseUrl: 'https://gitlab.com/oauth/authorize',
        },
        logoPath: 'https://asset.brandfetch.io/idw382nG0m/idVn6myaqy.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'clickup': {
        urls: {
          docsUrl: 'https://clickup.com/api/',
          apiUrl: 'https://api.clickup.com/v2',
          authBaseUrl: 'https://app.clickup.com/api',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRewJj9y5yKzSCf-qGgjmdLagEhxfnlZ7TUsvukbfZaIg&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'github': {
        scopes: 'repo user project read:org repo:status write:repo_hook',
        urls: {
          docsUrl: 'https://docs.github.com/fr/rest',
          apiUrl: 'https://api.github.com',
          authBaseUrl: 'https://github.com/login/oauth/authorize',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'aha': {
        urls: {
          docsUrl: 'https://www.aha.io/api',
          apiUrl: (domain) => `https://${domain}.aha.io/api/v1`,
          authBaseUrl: (domain) => `https://${domain}.aha.io/oauth/authorize`,
        },
        logoPath: 'https://www.aha.io/aha-logo-2x.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          company_subdomain: true,
          local_redirect_uri_in_https: true
        }
      },
      'asana': {
        urls: {
          docsUrl: 'https://developers.asana.com/docs/overview',
          apiUrl: 'https://app.asana.com/api/1.0',
          authBaseUrl: 'https://app.asana.com/-/oauth_authorize',
        },
        logoPath: 'https://cdn.dribbble.com/users/2043665/screenshots/12080585/sunset_asana_logo_screenprint.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'azure': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'basecamp': {
        scopes: '',
        urls: {
          docsUrl: 'https://github.com/basecamp/api/blob/master/sections/authentication.md',
          apiUrl: '',
          authBaseUrl: 'https://launchpad.37signals.com/authorization/new',
        }, 
        logoPath: 'https://asset.brandfetch.io/id7Kew_cLD/idx-Jcj2Qo.jpeg',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'bitbucket': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        }, logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'dixa': {
        urls: {
          docsUrl: 'https://docs.dixa.io/docs/',
          apiUrl: 'https://dev.dixa.io/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOxBDw6TkTaxR4EUGI_lNBLl4BCpd3AzXnr30cU_VEaB0jHFh__fFZJHXPB1t-451Eno8&usqp=CAU',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        primaryColor: '#5644D8',
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key']
        }
      },
      'freshdesk': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'freshservice': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'gladly': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.gladly.com/rest/',
          apiUrl: '/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.basic
        }
      },
      // todo
      'height': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'helpscout': {
        urls: {
          docsUrl: 'https://developer.helpscout.com/docs-api/',
          apiUrl: 'https://docsapi.helpscout.net/v1',
          authBaseUrl: 'https://secure.helpscout.net/authentication/authorizeClientApplication'
        },
        logoPath: 'https://play-lh.googleusercontent.com/ejDdUZ3Ssup5cVeOdCknoc1BpQtU07f8gYy4VYRudfBatFsOvFuwYybhB_lpSi2rmr2j',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'hive': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.hive.com/reference/introduction',
          apiUrl: 'https://app.hive.com/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['user_id']
        }
      },
      'intercom': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'ironclad': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.ironcladapp.com/reference/authorization-code-grant',
          apiUrl: 'https://ironcladapp.com',
          authBaseUrl: 'https://ironcladapp.com/oauth/authorize'
        },
        logoPath: 'https://logosandtypes.com/wp-content/uploads/2023/03/Ironclad.png',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'kustomer': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.kustomer.com/kustomer-api-docs/reference/introduction',
          apiUrl: 'https://api.kustomerapp.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      // todo
      'pivotal_tracker': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      // todo
      'rally': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'reamaze': {
        scopes: '',
        urls: {
          docsUrl: 'https://www.reamaze.com/api',
          apiUrl: '/api/v1',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['login_email']
        }
      },
      // todo
      'salesforce': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      // todo
      'servicenow': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'shortcut': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.shortcut.com/api/rest/v3',
          apiUrl: 'https://api.app.shortcut.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      // todo
      'spotdraft': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'teamwork': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'trello': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: 'https://api.app.shortcut.com',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'wrike': {
        urls: {
          docsUrl: 'https://developers.wrike.com/overview/',
          apiUrl: (domain) => `https://${domain}/api/v4`,
          authBaseUrl: 'https://login.wrike.com/oauth2/authorize/v4',
        },
        logoPath: 'https://play-lh.googleusercontent.com/uh-GbLWEKoIefta2iNX0L0zUWA66YTjfJ4cBarNZWbc7mEzbKUWbWg8NjjrojgkFH5ni',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        options: {
          company_subdomain: true,
          local_redirect_uri_in_https: true
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'zoho_bugtracker': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'zoho_desk': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqz0aID6B-InxK_03P7tCtqpXNXdawBcro67CyEE0I5g&s',
        description: 'Sync & Create accounts, tickets, comments, attachments, contacts, tags, teams and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
    },
    'accounting': {
      'pennylane': {
        scopes: 'accounting+customer_invoices+supplier_invoices',
        urls: {
          docsUrl: 'https://pennylane.readme.io/docs/getting-started',
          apiUrl: 'https://app.pennylane.com/api/external/v1',
          authBaseUrl: 'https://app.pennylane.com/oauth/authorize',
        },
        logoPath: 'https://c.clc2l.com/t/P/e/Pennylane-U9Wdby.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      'freshbooks': {
        scopes: '', 
        urls: {
          docsUrl: 'https://www.freshbooks.com/api/start',
          apiUrl: 'https://api.freshbooks.com',
          authBaseUrl: 'https://auth.freshbooks.com/oauth/authorize',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      // todo
      'clearbooks': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://s3-eu-west-1.amazonaws.com/clearbooks-marketing/media-centre/MediaCentre/clear-books/CMYK/icon/clear-books-icon-cmyk.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'freeagent': {
        urls: {
          docsUrl: 'https://dev.freeagent.com/docs/quick_start',
          apiUrl: 'https://api.freeagent.com/v2',
          authBaseUrl: 'https://api.freeagent.com/v2/approve_app',
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQU-fob0b9pBNQdm80usnYa2yWdagm3eeBDH-870vSmfg&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'sage': {
        scopes: 'full_access',
        urls: {
          docsUrl: 'https://developer.sage.com/accounting/reference/',
          apiUrl: 'https://api.accounting.sage.com/v3.1',
          authBaseUrl: 'https://www.sageone.com/oauth2/auth/central?filter=apiv3.1',
        },
        logoPath: 'https://zynk.com/wp-content/uploads/2018/02/new-sage-logo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      // todo
      'sage_intacct': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      // todo
      'microsoft_dynamics': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'moneybird': {
        urls: {
          docsUrl: 'https://developer.moneybird.com/',
          apiUrl: 'https://moneybird.com/api/v2',
          authBaseUrl: 'https://moneybird.com/oauth/authorize',
        },
        logoPath: 'https://play-lh.googleusercontent.com/xqHj2qyqNoC-lX3HGeR6VMjndoc931QiFX92RPnRm8ACDcGMoMR5JKj4wyvPe6ITY5s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      // todo
      'netsuite': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'quickbooks': {
        scopes: 'com.intuit.quickbooks.accounting',
        urls: {
          docsUrl: 'https://developer.intuit.com/app/developer/qbo/docs/develop',
          apiUrl: 'https://quickbooks.api.intuit.com/v3',
          authBaseUrl: 'https://appcenter.intuit.com/connect/oauth2',
        },
        logoPath: 'https://media.licdn.com/dms/image/D4D12AQFduz3E6g6COg/article-cover_image-shrink_600_2000/0/1697053235030?e=2147483647&v=beta&t=c2Ia7g8fJ6wAHNlnogLV_Ii765HMqSw16HxgawsxmTw',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'workday': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: '',
          authBaseUrl: '',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key']
        }
      },
      'wave_financial': {
        scopes: '',
        urls: {
          docsUrl: 'https://developer.waveapps.com/hc/en-us/articles/360019968212-API-Reference',
          apiUrl: 'https://gql.waveapps.com/graphql/public',
          authBaseUrl: 'https://api.waveapps.com/oauth2/authorize/',
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'xero': {
        scopes: 'offline_access openid profile email accounting.transactions',       
        urls: {
          docsUrl: 'https://developer.xero.com/documentation/getting-started-guide/',
          apiUrl: 'https://api.xero.com/api.xro/2.0',
          authBaseUrl: 'https://login.xero.com/identity/connect/authorize',
        },
        logoPath: 'https://upload.wikimedia.org/wikipedia/en/archive/9/9f/20171204173437%21Xero_software_logo.svg',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false, 
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
    },
    'marketingautomation': {
      'active_campaign': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.activecampaign.com/reference/overview',
          apiUrl: '/api/3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'customerio': {
        scopes: '',
        urls: {
          docsUrl: 'https://customer.io/docs/api/track/',
          apiUrl: 'https://track.customer.io/api/'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'getresponse': {
        urls: {
          authBaseUrl: 'https://app.getresponse.com/oauth2_authorize.html',
          docsUrl: 'https://apidocs.getresponse.com/v3',
          apiUrl: 'https://api.getresponse.com/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'apollo': {
        urls: {
          docsUrl: 'https://apolloio.github.io/apollo-api-docs/?shell#introduction',
          apiUrl: 'https://api.apollo.io'
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM4trwPJLoj7tPkFYZG6TyMVzgCX1fn2zUyA&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        primaryColor: '#ffcf40',
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key']
        }
      },
      'hubspot_marketing_hub': {
        scopes: '',
        urls: {
          docsUrl: '',
          apiUrl: ''
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'keap': {
        urls: {
          authBaseUrl: 'https://accounts.infusionsoft.com/app/oauth/authorize',
          docsUrl: 'https://developer.infusionsoft.com/docs/rest/',
          apiUrl: 'https://api.infusionsoft.com/crm/rest/v1/account/profile'
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPYsWSMe9KVWgCIQ8fw-vBOnfTlZaSS6p_43ZhEIx51A&s',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'klaviyo': {
        scopes: 'campaigns:read accounts:read events:read events:write profiles:read profiles:write webhooks:read webhooks:write lists:read templates:read',
        urls: {
          docsUrl: 'https://developers.klaviyo.com/en/reference/api_overview',
          apiUrl: 'https://a.klaviyo.com/api',
          authBaseUrl: 'https://www.klaviyo.com/oauth/authorize'
        },
        logoPath: 'https://logosandtypes.com/wp-content/uploads/2022/04/Klaviyo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'mailchimp': {
        scopes: '',
        urls: {
          authBaseUrl: 'https://login.mailchimp.com/oauth2/authorize',
          docsUrl: 'https://mailchimp.com/developer/marketing/api/',
          apiUrl: '' // todo
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'messagebird': {
        scopes: '',
        urls: {
          docsUrl: 'https://developers.messagebird.com/api/',
          apiUrl: 'https://rest.messagebird.com'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'podium': {
        scopes: '',
        urls: {
          authBaseUrl: 'https://api.podium.com/oauth/authorize',
          docsUrl: 'https://docs.podium.com/reference/introduction',
          apiUrl: 'https://api.podium.com/v4'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'sendgrid': {
        scopes: '',
        urls: {
          docsUrl: 'https://docs.sendgrid.com/for-developers/sending-email/api-getting-started',
          apiUrl: 'https://api.sendgrid.com/v3'
        },
        logoPath: 'https://play-lh.googleusercontent.com/EMobDJKabP1eY_63QHgPS_-TK3eRfxXaeOnERbcRaWAw573iaV74pXS9xOv997dRZtM',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.api_key
        }
      },
      'brevo': {
        urls: { 
          docsUrl: 'https://developers.brevo.com/docs/getting-started',
          apiUrl: 'https://api.brevo.com/v3'
        },
        logoPath: 'https://sbp-plugin-images.s3.eu-west-1.amazonaws.com/technologies526_65670ec92e038_brevo300.jpg',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        primaryColor: '#0B996F',
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key']
        }
      },
    },
    'filestorage': {
      'googledrive': {
        scopes: 'https://www.googleapis.com/auth/drive',
        urls: {
          docsUrl: '',
          apiUrl: 'https://www.googleapis.com/drive',
          authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
        },
        logoPath: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'onedrive': {
        scopes: 'Files.Read.All offline_access openid User.Read.All Group.Read.All',
        urls: {
          docsUrl: 'https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0',
          apiUrl: 'https://graph.microsoft.com',
          authBaseUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize'
        },
        logoPath: 'https://logowik.com/content/uploads/images/4964-microsoft-onedrive-new.jpg',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'dropbox': {
        urls: {
          docsUrl: 'https://www.dropbox.com/developers/documentation/http/documentation',
          apiUrl: 'https://api.dropboxapi.com/2',
          authBaseUrl: 'https://www.dropbox.com/oauth2/authorize'
        },
        logoPath: 'https://cdn2.iconfinder.com/data/icons/metro-ui-dock/512/Dropbox.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
      'sharepoint': {
        scopes: 'Files.Read.All offline_access openid User.Read.All Group.Read.All Sites.Read.All Sites.ReadWrite.All',
        urls: {
          docsUrl: 'https://learn.microsoft.com/en-us/graph/api/overview?view=graph-rest-1.0',
          apiUrl: (siteId) => `https://graph.microsoft.com/v1.0/sites/${siteId}`,
          authBaseUrl: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize`
        },
        logoPath: 'https://pnghq.com/wp-content/uploads/pnghq.com-microsoft-sharepoint-logo-9.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        primaryColor: '#6EA5A8', 
        options: {
          end_user_domain: true
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2,
          properties: ['site', 'tenant']
        }
      },
      'box': {
        urls: {
          docsUrl: 'https://developer.box.com/reference/',
          apiUrl: 'https://api.box.com',
          authBaseUrl: 'https://account.box.com/api/oauth2/authorize'
        },
        logoPath: 'https://gdm-catalog-fmapi-prod.imgix.net/ProductLogo/95b201e8-845a-4064-a9b2-a8eb49d19ca3.png?w=128&h=128&fit=max&dpr=3&auto=format&q=50',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
    },
    'productivity': {
      'notion': {
        urls: {
          docsUrl: 'https://developers.notion.com/docs/getting-started',
          apiUrl: 'https://api.notion.com',
          authBaseUrl: 'https://api.notion.com/v1/oauth/authorize'
        },
        logoPath: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        authStrategy: { 
          strategy: AuthStrategy.oauth2
        }
      },
      'slack': {
        scopes: 'channels:history',
        urls: {
          docsUrl: 'https://api.slack.com/apis',
          apiUrl: 'https://slack.com/api',
          authBaseUrl: 'https://slack.com/oauth/v2/authorize'
        },
        logoPath: 'https://assets-global.website-files.com/621c8d7ad9e04933c4e51ffb/65eba5ffa14998827c92cc01_slack-octothorpe.png',
        description: 'Sync & Create contacts, deals, companies, notes, engagements, stages, tasks and users',
        active: false,
        options: {
          local_redirect_uri_in_https: true
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2
        }
      },
    },
    'ecommerce': {
      'bigcommerce': {
        urls: {
          docsUrl: 'https://developer.bigcommerce.com/docs/rest-catalog',
          apiUrl: (storeHash) => `https://api.bigcommerce.com/stores/${storeHash}`,
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH_-bQ399xl-yfJYhbLraU-w0yWBcppLf8NA&s',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: false,
        primaryColor: '#000001',
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key', 'store_hash']
        }
      },
      'ebay': {
        scopes: 'https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/commerce.identity.readonly https://api.ebay.com/oauth/api_scope/sell.reputation https://api.ebay.com/oauth/api_scope/sell.reputation.readonly https://api.ebay.com/oauth/api_scope/commerce.notification.subscription https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly https://api.ebay.com/oauth/api_scope/sell.stores https://api.ebay.com/oauth/api_scope/sell.stores.readonly',
        urls: {
          docsUrl: 'https://edp.ebay.com/develop/get-started',
          apiUrl: 'https://api.ebay.com',
          authBaseUrl: 'https://auth.ebay.com/oauth2/authorize'
        },
        logoPath: 'https://www.logodesignlove.com/images/evolution/ebay-logo-01.jpg',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: false,
        options: {
          local_redirect_uri_in_https: true,
          oauth_attributes: ['ruvalue']
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2,
        }
      },
      'squarespace': {
        scopes: 'website.orders,website.orders.read,website.inventory,website.inventory.read,website.products,website.products.read',
        urls: {
          docsUrl: 'https://developers.squarespace.com/commerce-apis/overview',
          apiUrl: `https://api.squarespace.com`,
          authBaseUrl: 'https://login.squarespace.com/api/1/login/oauth/provider/authorize'
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu9U-j_3EMYlKtu5dRaTl6ejitL2X6lz3pYg&s',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2,
        }
      },
      'amazon': {
        urls: {
          docsUrl: 'https://developer-docs.amazon.com/sp-api/docs/welcome',
          apiUrl: 'https://sellingpartnerapi-na.amazon.com',
          authBaseUrl: 'https://sellercentral.amazon.com/apps/authorize/consent'
        },
        logoPath: 'https://cdn.vectorstock.com/i/500p/39/87/astana-kazakhstan-20-july-2020-amazon-icon-vector-34243987.jpg',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: true,
        options: {
          local_redirect_uri_in_https: true,
          oauth_attributes: ['application_id']
        },
        authStrategy: {
          strategy: AuthStrategy.oauth2,
        }
      },
      'shopify': {
        // scopes: 'read_all_orders,read_assigned_fulfillment_orders,read_customers,read_fulfillments,read_orders,write_orders,read_products,write_products',
        urls: {
          docsUrl: 'https://shopify.dev/docs/apps/build',
          apiUrl: (storeName: string) => `https://${storeName}.myshopify.com`,
        },
        logoPath: 'https://www.pngall.com/wp-content/uploads/13/Shopify-Logo-PNG.png',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: true,
        primaryColor: '#5E8E3E',
        authStrategy: {
          strategy: AuthStrategy.api_key,
          properties: ['api_key', 'store_url']
        }
      },
      'magento': {
        urls: {
          docsUrl: 'https://developer.adobe.com/commerce/webapi/get-started/',
          apiUrl: '',
          authBaseUrl: ''
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKRidZq3jXGYOIZ2X2EruCx0pFMkbsHineLg&s',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
      },
      'webflow': {
        scopes: 'ecommerce:read ecommerce:write users:read authorized_user:read sites:read',
        urls: {
          docsUrl: 'https://developers.webflow.com/data/reference/rest-introduction',
          apiUrl: 'https://api.webflow.com/v2',
          authBaseUrl: 'https://webflow.com/oauth/authorize'
        },
        logoPath: 'https://dailybrand.co.zw/wp-content/uploads/2023/10/webflow-2.png',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: true,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
        options: {
          local_redirect_uri_in_https: true
        }
      },
      'faire': {
        scopes: 'READ_PRODUCTS WRITE_PRODUCTS READ_ORDERS WRITE_ORDERS READ_INVENTORIES WRITE_INVENTORIES',
        urls: {
          docsUrl: 'https://faire.github.io/external-api-v2-docs',
          apiUrl: 'https://www.faire.com/external-api',
          authBaseUrl: 'https://faire.com/oauth2/authorize'
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSDg6WOKCYRvGFmwtaJ6Gv88PjAGRS9_h9EQ&s',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
      }, 
      'mercadolibre': {
        scopes: '',
        urls: {
          docsUrl: 'https://global-selling.mercadolibre.com/devsite/introduction-globalselling',
          apiUrl: 'https://api.mercadolibre.com',
          authBaseUrl: 'https://global-selling.mercadolibre.com/authorization'
        },
        logoPath: 'https://api.getkoala.com/web/companies/mercadolibre.com/logo',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: false,
        authStrategy: {
          strategy: AuthStrategy.oauth2
        },
      },
      'woocommerce': {
        urls: {
          docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs/#introduction',
          apiUrl: (storeName: string) => `https://${storeName}/wp-json/wc`,
        },
        logoPath: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHiusc7S5-BoiU1YKCztJMv_Qj7wlim4TwbA&s',
        description: 'Sync & Create orders, fulfillments, fulfillment orders, customers and products',
        active: true,
        primaryColor: '#702963',
        authStrategy: {
          strategy: AuthStrategy.basic,
          properties: ['username', 'password', 'store_url']
        }
      },
    }
};
