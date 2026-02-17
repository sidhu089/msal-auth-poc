import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

// ============================================================================
// Session Persistence Library Imports
// ============================================================================
// These services from @svt_089/angular-msal-session-persistence work together
// to provide seamless session management:
//
// - IdleDetectionService: Monitors user activity and emits events when idle
//   timeout is exceeded. Uses multiple signals (mouse, keyboard, touch, scroll,
//   visibility, focus) to accurately detect user presence.
//
// - MsalAuthService: Simplified wrapper around MSAL for authentication operations.
//   Provides loginPopup() and logoutPopup() methods with error handling.
//
// - FormLifecycleService: Manages form state registry. saveAllForms() persists
//   all registered forms to sessionStorage before re-authentication.
//
// - NavigationTrackerService: Tracks navigation state for potential restoration
//   after authentication flows.
//
// - IdleEventType: Enumeration of idle event types:
//   - IDLE_WARNING: Approaching timeout threshold
//   - TIMEOUT_EXCEEDED: Idle timeout reached (triggers re-auth)
//   - USER_RETURNED: User returned before timeout
//   - SESSION_EXPIRED: Session expired after timeout
//
// - IdleEvent: Rich event object containing:
//   - type: IdleEventType enumeration value
//   - elapsedTimeMs: Time since last user activity
//   - lastActiveTimestamp: When user was last active
//   - metadata: Additional context (forms saved, return reason, etc.)
//
// - IdleUserDecision: User's response to idle dialog:
//   - REAUTHENTICATE: User wants to stay signed in
//   - SIGN_OUT: User wants to sign out
// ============================================================================
import {
  IdleDetectionService,
  MsalAuthService,
  FormLifecycleService,
  NavigationTrackerService,
  IdleEventType,
  IdleEvent,
  IdleUserDecision
} from '@svt_089/angular-msal-session-persistence';
import { IdleDialogComponent } from './idle-dialog/idle-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IdleDialogComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('msal-auth-poc');

  // ==========================================================================
  // Inject Session Persistence Services
  // ==========================================================================
  // Using Angular's inject() function for cleaner dependency injection.
  // These services are singletons provided at the application level in app.config.ts.
  // ==========================================================================
  private idleService = inject(IdleDetectionService);
  private authService = inject(MsalAuthService);
  private formLifecycle = inject(FormLifecycleService);
  private navTracker = inject(NavigationTrackerService);

  private subscription?: Subscription;

  // Properties for the custom dialog
  showIdleDialog = false;
  currentIdleEvent?: IdleEvent;

  constructor(private msalService: MsalService) { }

  ngOnInit() {
    this.msalService.instance.initialize();

    // ========================================================================
    // Start Idle Detection if User is Authenticated
    // ========================================================================
    // Only monitor idle time when user has an active session.
    // The idle detection is skipped for unauthenticated users since
    // session timeout management only applies to logged-in users.
    // ========================================================================
    const isAuthenticated = this.msalService.instance.getAllAccounts().length > 0;
    if (isAuthenticated) {
      this.startIdleDetection();
    }
  }

  /**
   * Configures and starts the idle detection service.
   * 
   * The idle detection workflow:
   * 1. Configure timeout threshold (10 seconds for demo, typically 15 minutes)
   * 2. Subscribe to idle events, filtering for TIMEOUT_EXCEEDED
   * 3. When timeout occurs, show custom dialog with event context
   * 4. User can choose to re-authenticate or sign out
   * 5. On re-authentication, reset idle timer to continue monitoring
   */
  private startIdleDetection(): void {
    // Configure idle detection with timeout and logging options
    this.idleService.configure({
      idleTimeoutSeconds: 10, // 10 seconds for demo purposes (typically 900 for 15 minutes)
      enableLogging: false    // Disable verbose logging in production
    });

    // ========================================================================
    // Subscribe to Idle Events with Filtering
    // ========================================================================
    // The onIdleEvent$ observable emits rich IdleEvent objects containing:
    // - Event type (IDLE_WARNING, TIMEOUT_EXCEEDED, USER_RETURNED, SESSION_EXPIRED)
    // - Elapsed time since last activity
    // - Last active timestamp
    // - Metadata (forms saved count, return reason, etc.)
    //
    // We filter for TIMEOUT_EXCEEDED to trigger the re-authentication flow.
    // Other event types could be handled separately for different UX patterns.
    // ========================================================================
    this.subscription = this.idleService.onIdleEvent$
      .pipe(filter(e => e.type === IdleEventType.TIMEOUT_EXCEEDED))
      .subscribe((event) => {
        // Show custom dialog with full event context
        // The dialog displays: idle duration, last active time, forms saved status
        this.currentIdleEvent = event;
        this.showIdleDialog = true;
      });

    // Start monitoring user activity across all registered signals
    this.idleService.start();
  }

  /**
   * Handles user's decision from the idle timeout dialog.
   * 
   * This method implements the core session recovery workflow:
   * 
   * REAUTHENTICATE flow:
   * 1. Save all form states using FormLifecycleService (persists to sessionStorage)
   * 2. Trigger MSAL popup login for re-authentication
   * 3. On success, reset idle timer to continue monitoring
   * 4. Forms are automatically restored by AutoPersistFormDirective
   * 
   * SIGN_OUT flow:
   * 1. Trigger MSAL popup logout
   * 2. Clears all session data and ends the authenticated session
   * 
   * @param decision - User's choice: REAUTHENTICATE or SIGN_OUT
   */
  async onIdleDialogDecision(decision: IdleUserDecision): Promise<void> {
    this.showIdleDialog = false;

    if (decision === IdleUserDecision.REAUTHENTICATE) {
      try {
        // ===============================================================
        // Step 1: Save All Form States Before Re-authentication
        // ===============================================================
        // FormLifecycleService iterates through all registered forms and
        // persists their current state (value, dirty, touched, validation)
        // to sessionStorage. This ensures no data is lost during the
        // authentication redirect/popup.
        // ===============================================================
        this.formLifecycle.saveAllForms();

        // ===============================================================
        // Step 2: Trigger Re-authentication via MSAL Popup
        // ===============================================================
        // Opens a popup window for the user to re-authenticate with Azure AD.
        // Using popup (vs redirect) maintains application state and context.
        // ===============================================================
        await this.authService.loginPopup();

        // ===============================================================
        // Step 3: Reset Idle Timer After Successful Re-authentication
        // ===============================================================
        // Clears the idle timer and resets internal state. The user is
        // now considered "active" and the monitoring cycle restarts.
        // ===============================================================
        this.idleService.reset();

        // Note: Forms are automatically restored by AutoPersistFormDirective
        // when the component re-initializes and reads from sessionStorage.
      } catch (error) {
        console.error('Re-authentication failed', error);
        // TODO: Show error dialog to user
      }
    } else if (decision === IdleUserDecision.SIGN_OUT) {
      // User chose to sign out - end the session completely
      await this.authService.logoutPopup();
    }
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    this.subscription?.unsubscribe();
    // Stop idle detection service when component is destroyed
    this.idleService.stop();
  }
}
