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

// ============================================================================
// Session Persistence Library Imports
// ============================================================================
// The @svt_089/angular-msal-session-persistence library provides enhanced session
// management capabilities for MSAL-authenticated Angular applications:
//
// - IdleDetectionService: Monitors user activity (mouse, keyboard, touch, scroll,
//   visibility, focus) and emits events when idle timeout is exceeded. Enables
//   proactive session timeout warnings and automatic re-authentication flows.
//
// - MsalAuthService: Wrapper service simplifying MSAL authentication operations
//   (loginPopup, logoutPopup, token acquisition) with built-in error handling
//   and fallback mechanisms.
//
// - FormLifecycleService: Tracks and manages form state across the application.
//   Provides saveAllForms() and restoreAllForms() methods to persist and restore
//   form data during authentication boundaries (e.g., before/after re-authentication).
//
// These services work together to create a seamless user experience where form
// data is automatically preserved when users need to re-authenticate due to
// session timeouts or idle detection.
// ============================================================================
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
    // ==========================================================================
    // Register Session Persistence Services as Angular Injectables
    // ==========================================================================
    // These services are provided at the application level so they can be
    // injected into any component. They maintain singleton state across the
    // app lifecycle:
    // - IdleDetectionService: Single instance monitors all user activity
    // - MsalAuthService: Centralized authentication wrapper
    // - FormLifecycleService: Global form state registry
    // ==========================================================================
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
            // ===============================================================
            // Session Storage Configuration
            // ===============================================================
            // Using sessionStorage (instead of localStorage) ensures that:
            // 1. Authentication state is cleared when the browser tab is closed
            // 2. Each tab maintains independent authentication state
            // 3. Better security posture for sensitive authentication tokens
            //
            // This is the recommended approach for SPAs with session management
            // requirements, as it aligns with the session persistence library's
            // use of sessionStorage for form state.
            // ===============================================================
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
