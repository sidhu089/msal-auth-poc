# Angular MSAL Authentication POC

This is a proof-of-concept application demonstrating how to implement Microsoft Authentication Library (MSAL) authentication in an Angular single-page application (SPA) with integrated session persistence and idle detection capabilities.

## Features

- MSAL authentication with Azure Active Directory
- Protected routes that require authentication
- Sample form accessible only to authenticated users
- User profile information display
- Login and logout functionality
- **Automatic form state persistence** - Form data is automatically saved to sessionStorage and restored after re-authentication
- **Idle detection with session timeout management** - Detects user inactivity and prompts for re-authentication
- **Seamless session recovery** - Preserves user work across authentication boundaries

## Session Persistence Library: `@svt_089/angular-msal-session-persistence`

This application integrates a custom session persistence library designed to enhance the MSAL authentication experience by maintaining user session state and form data across authentication boundaries.

### Purpose and Architecture

The `@svt_089/angular-msal-session-persistence` library provides four core services that work together to create a seamless authentication experience:

#### 1. **`MsalAuthService`** - Authentication Wrapper Service
   - **Purpose**: Provides a simplified interface for MSAL authentication operations (login, logout, token acquisition)
   - **Key Features**:
     - Wraps MSAL's popup and redirect authentication flows
     - Manages active account state
     - Handles token acquisition with automatic fallback from silent to interactive methods
   - **Usage in this POC**: Injected in `app.ts` to handle re-authentication when idle timeout occurs

#### 2. **`IdleDetectionService`** - User Activity Monitoring
   - **Purpose**: Monitors user activity across multiple signals (mouse, keyboard, touch, scroll, visibility, focus) to detect idle states
   - **Key Features**:
     - Configurable idle timeout threshold
     - Rich event context including timestamps, elapsed time, and metadata
     - Emits events via `onIdleEvent$` observable with `IdleEventType` enumeration:
       - `IDLE_WARNING`: Approaching timeout threshold
       - `TIMEOUT_EXCEEDED`: Idle timeout reached
       - `USER_RETURNED`: User returned before timeout
       - `SESSION_EXPIRED`: Session expired after timeout
     - Automatic cleanup and resource management
   - **Usage in this POC**: 
     - Configured in `app.ts` with a 10-second timeout (for demo purposes)
     - Subscribes to `TIMEOUT_EXCEEDED` events to show the idle dialog
     - Resets timer after successful re-authentication

#### 3. **`FormLifecycleService`** - Form State Management
   - **Purpose**: Tracks and manages the lifecycle state of forms throughout the application
   - **Key Features**:
     - Registers forms with unique IDs
     - Tracks form dirty state, validation status, and submission state
     - Provides `saveAllForms()` method to persist form state before authentication events
     - Provides `restoreAllForms()` method to restore form state after re-authentication
   - **Usage in this POC**: Called in `app.ts` before re-authentication to save all form states

#### 4. **`AutoPersistFormDirective`** - Automatic Form Persistence
   - **Purpose**: Structural directive that automatically persists and restores form data using sessionStorage
   - **Key Features**:
     - Applies to `<form>` elements with a required `formId` attribute
     - Automatically saves form value on every value change (debounced)
     - Restores form state on initialization if persisted data exists
     - Clears persisted data after successful form submission
     - Integrates with Angular's `FormGroup` for reactive forms
   - **Usage in this POC**: Applied to forms in `form.component.ts` to enable automatic persistence
   - **How it works**:
     ```typescript
     // In form.component.ts - import the directive
     import { AutoPersistFormDirective } from '@svt_089/angular-msal-session-persistence';

     // Add to imports array
     imports: [AutoPersistFormDirective]

     // Apply to form template with unique formId
     <form [formGroup]="sampleForm" formId="form1" autoPersistForm>
     ```

#### 5. **`NavigationTrackerService`** - Navigation State Tracking
   - **Purpose**: Tracks navigation events and maintains navigation history
   - **Key Features**:
     - Monitors route changes and navigation events
     - Stores navigation context for session recovery
   - **Usage in this POC**: Injected in `app.ts` for potential navigation state restoration

### Data Flow: Idle Detection → Re-authentication → Form Restoration

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User fills out form                                          │
│    → AutoPersistFormDirective saves to sessionStorage          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. IdleDetectionService detects inactivity (10 seconds)         │
│    → Emits TIMEOUT_EXCEEDED event                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Idle dialog shown in app.ts                                  │
│    → Displays idle duration, last active time, forms saved      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. User clicks "Stay Signed In"                                 │
│    → formLifecycle.saveAllForms() called                        │
│    → authService.loginPopup() triggers re-authentication        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. After successful re-authentication                           │
│    → idleService.reset() resets idle timer                      │
│    → AutoPersistFormDirective restores form from sessionStorage│
└─────────────────────────────────────────────────────────────────┘
```

### Session Storage Structure

The library uses sessionStorage to persist data with the following key structure:

- **Form Data**: `sessionpersist_form_{formId}` - Stores serialized form values
- **Form Metadata**: `sessionpersist_meta_{formId}` - Stores form state metadata
- **Navigation State**: `sessionpersist_nav_state` - Stores navigation history

### Configuration Example

```typescript
// In app.config.ts - Register services as providers
import {
  IdleDetectionService,
  MsalAuthService,
  FormLifecycleService,
  NavigationTrackerService
} from '@svt_089/angular-msal-session-persistence';

export const appConfig: ApplicationConfig = {
  providers: [
    IdleDetectionService,
    MsalAuthService,
    FormLifecycleService,
    NavigationTrackerService,
    // ... other providers
  ]
};

// In app.ts - Configure idle detection
ngOnInit() {
  this.idleService.configure({
    idleTimeoutSeconds: 900, // 15 minutes
    enableLogging: false
  });

  this.subscription = this.idleService.onIdleEvent$
    .pipe(filter(e => e.type === IdleEventType.TIMEOUT_EXCEEDED))
    .subscribe((event) => {
      this.currentIdleEvent = event;
      this.showIdleDialog = true;
    });

  this.idleService.start();
}
```

## Prerequisites

- Node.js (version 16.x or later)
- Angular CLI (version 17.x or later)
- An Azure Active Directory tenant with an application registration

## Setup Instructions

### 1. Azure AD Application Registration

Before running the application, you need to register an application in Azure AD:

1. Go to the [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" > "App registrations" > "New registration"
3. Enter a name for your application (e.g., "Angular MSAL POC")
4. Select "Single-page application (SPA)" as the platform
5. Add `http://localhost:4200` as a redirect URI
6. Click "Register"
7. Note down the "Application (client) ID"

### 2. Configure the Application

1. Open `src/app/app.config.ts`
2. Replace `'YOUR_CLIENT_ID_HERE'` with the client ID from your Azure AD application registration

```typescript
clientId: 'YOUR_CLIENT_ID_HERE', // Replace with your Azure AD App Registration Client ID
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
ng serve
```

The application will be available at `http://localhost:4200`

## Usage

1. Navigate to the application in your browser
2. Click the "Sign In with Microsoft" button
3. Complete the authentication flow with your Microsoft account
4. Once authenticated, you'll see your profile information and navigation options
5. Click on "Sample Form" to access the protected form
6. Fill out the form and submit it to see the authentication in action

## Project Structure

- `src/app/app.config.ts` - Main application configuration with MSAL settings
- `src/app/services/auth.service.ts` - Authentication service managing MSAL operations
- `src/app/profile/profile.component.ts` - Profile component with login/logout functionality
- `src/app/form/form.component.ts` - Protected form component accessible only to authenticated users
- `src/app/app.routes.ts` - Route configuration with protected routes

## Important Notes

- This is a proof-of-concept application and should not be used in production without additional security considerations
- Make sure to properly configure your Azure AD application with appropriate redirect URIs
- The application uses sessionStorage for caching tokens, which is suitable for SPA scenarios

## Session Persistence Library Development

This project includes a custom session persistence library located at `package/sessionpersist/`.

### Development Workflow

1. **Developing the library**: Make changes directly in the `package/sessionpersist/src` directory
2. **Building the library**: Run `npm run build-lib` from the project root
3. **Testing integration**: Run `npm run link-lib` from the project root to build and link the compiled library to the main application
4. **Regular development**: The workspace automatically links to the source for seamless development

### Library Scripts

- `npm run build-lib`: Builds the session persistence library
- `npm run watch-lib`: Watches for changes and rebuilds the library automatically during development
- `npm run pack-lib`: Builds and packages the library into a distributable format
- `npm run link-lib`: Builds, packages, and links the compiled library to the main application for integration testing