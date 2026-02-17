import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalService
} from '@azure/msal-angular';
import { PublicClientApplication, LogLevel } from '@azure/msal-browser';
import { MsalGuardConfiguration } from '@azure/msal-angular';

// Import session persistence library services
import {
  IdleDetectionService,
  MsalAuthService,
  FormLifecycleService
} from '@svt_089/angular-msal-session-persistence';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    // Add session persistence services
    IdleDetectionService,
    MsalAuthService,
    FormLifecycleService,
    {
      provide: MSAL_INSTANCE,
      useFactory: () => {
        return new PublicClientApplication({
          auth: {
            clientId: 'your-client-id-here', // Replace with your Azure AD App Registration Client ID
            authority: 'https://login.microsoftonline.com/your-tenant-id-here', // Replace with your Azure AD Tenant IDs
            redirectUri: 'http://localhost:4200'
          },
          cache: {
            cacheLocation: 'sessionStorage',
            storeAuthStateInCookie: false
          },
          system: {
            loggerOptions: {
              loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                  return;
                }
                switch (level) {
                  case LogLevel.Error:
                    console.error(message);
                    return;
                  case LogLevel.Info:
                    console.info(message);
                    return;
                  case LogLevel.Verbose:
                    console.debug(message);
                    return;
                  case LogLevel.Warning:
                    console.warn(message);
                    return;
                }
              }
            }
          }
        });
      }
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: 'popup', // Use popup or redirect
        authRequest: {
          scopes: ['user.read']
        }
      } as MsalGuardConfiguration
    }
  ]
};
