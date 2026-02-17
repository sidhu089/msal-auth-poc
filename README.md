# Angular MSAL Authentication POC

This is a proof-of-concept application demonstrating how to implement Microsoft Authentication Library (MSAL) authentication in an Angular single-page application (SPA) with a sample form.

## Features

- MSAL authentication with Azure Active Directory
- Protected routes that require authentication
- Sample form accessible only to authenticated users
- User profile information display
- Login and logout functionality

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