import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================================================
// Session Persistence Library Imports - Idle Event Types
// ============================================================================
// These types from @svt_089/angular-msal-session-persistence define the
// contract for idle detection events and user responses:
//
// - IdleEvent: Rich event object emitted by IdleDetectionService containing:
//   - type: IdleEventType enumeration value indicating the event category
//   - elapsedTimeMs: Milliseconds since last detected user activity
//   - lastActiveTimestamp: Unix timestamp of when user was last active
//   - metadata: Additional context object with:
//     - formsSaved: Boolean indicating if forms were persisted
//     - formCount: Number of forms registered with FormLifecycleService
//     - returnReason: How user activity was detected (tab_visible, window_focused, etc.)
//
// - IdleEventType: Enumeration of possible idle event types:
//   - IDLE_WARNING: User approaching idle timeout threshold (e.g., at 80% of timeout)
//   - TIMEOUT_EXCEEDED: User has been idle beyond configured threshold
//   - USER_RETURNED: User became active before timeout expired
//   - SESSION_EXPIRED: Session expired after extended idle period
//
// - IdleUserDecision: User's response to the idle timeout dialog:
//   - REAUTHENTICATE: User wants to stay signed in and re-authenticate
//   - SIGN_OUT: User wants to end the session and sign out
//
// This component receives an IdleEvent via @Input and emits IdleUserDecision
// via @Output when the user makes a choice.
// ============================================================================
import {
  IdleEvent,
  IdleEventType,
  IdleUserDecision
} from '@svt_089/angular-msal-session-persistence';

@Component({
  selector: 'app-idle-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="idle-overlay" *ngIf="event">
      <div class="idle-dialog">
        <div class="dialog-header">
          <div class="warning-icon">⏱️</div>
          <h2>Session Timeout Warning</h2>
        </div>

        <div class="dialog-content">
          <p>Your session has been idle for {{ formatDuration(event.elapsedTimeMs) }}.</p>

          <!--
            ================================================================
            Session Information Panel
            ================================================================
            Displays rich context from the IdleEvent metadata:
            
            - Last Active: When the user was last detected as active
            - Forms Saved: Number of forms automatically persisted by
              FormLifecycleService before re-authentication
            - Detected via: How the system detected user activity return
              (useful for debugging visibility/focus detection)
            ================================================================
          -->
          <div class="session-info">
            <div class="info-item">
              <span class="info-label">Last Active:</span>
              <span class="info-value">{{ event.lastActiveTimestamp | date:'medium' }}</span>
            </div>

            <div class="info-item" *ngIf="event.metadata.formsSaved">
              <span class="info-label">Forms Saved:</span>
              <span class="info-value">{{ event.metadata.formCount || 0 }} form(s)</span>
            </div>

            <div class="info-item" *ngIf="event.metadata.returnReason">
              <span class="info-label">Detected via:</span>
              <span class="info-value">{{ formatReturnReason(event.metadata.returnReason) }}</span>
            </div>
          </div>

          <p class="hint">
            Your form data has been automatically saved and will be restored after re-authentication.
          </p>
        </div>

        <div class="dialog-actions">
          <!--
            ================================================================
            Dialog Action Buttons
            ================================================================
            - Sign Out: Ends the session completely (calls logoutPopup)
            - Stay Signed In: Triggers re-authentication flow
              1. Saves all forms via FormLifecycleService
              2. Opens MSAL login popup
              3. On success, resets idle timer
              4. Forms are restored automatically by AutoPersistFormDirective
            ================================================================
          -->
          <button
            type="button"
            class="btn btn-secondary"
            (click)="onDecision(IdleUserDecision.SIGN_OUT)">
            Sign Out
          </button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="onDecision(IdleUserDecision.REAUTHENTICATE)">
            Stay Signed In
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .idle-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    .idle-dialog {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-50px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dialog-header {
      padding: 24px 24px 16px;
      border-bottom: 1px solid #eee;
      text-align: center;
    }

    .warning-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .dialog-header h2 {
      margin: 0;
      color: #333;
      font-size: 24px;
    }

    .dialog-content {
      padding: 24px;
    }

    .dialog-content p {
      margin: 0 0 16px;
      color: #555;
      line-height: 1.5;
    }

    .session-info {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-label {
      font-weight: 600;
      color: #555;
    }

    .info-value {
      color: #333;
      font-weight: 500;
    }

    .hint {
      font-style: italic;
      color: #6c757d;
      font-size: 14px;
      margin: 16px 0 0;
      padding: 12px;
      background-color: #e7f3ff;
      border-left: 4px solid #007bff;
      border-radius: 0 4px 4px 0;
    }

    .dialog-actions {
      padding: 16px 24px 24px;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn:focus {
      outline: 2px solid #007bff;
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #0056b3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #545b62;
    }
  `]
})
export class IdleDialogComponent {
  // ==========================================================================
  // Input: IdleEvent from IdleDetectionService
  // ==========================================================================
  // Contains full context about the idle timeout:
  // - elapsedTimeMs: How long the user has been idle
  // - lastActiveTimestamp: When they were last active
  // - metadata: Additional context (forms saved, return reason)
  // ==========================================================================
  @Input() event?: IdleEvent;

  // ==========================================================================
  // Output: User's decision on how to proceed
  // ==========================================================================
  // Emits IdleUserDecision enum value:
  // - REAUTHENTICATE: User wants to stay signed in
  // - SIGN_OUT: User wants to end session
  //
  // Parent component (app.ts) handles the actual workflow:
  // - For REAUTHENTICATE: saveAllForms() → loginPopup() → reset()
  // - For SIGN_OUT: logoutPopup()
  // ==========================================================================
  @Output() decision = new EventEmitter<IdleUserDecision>();

  // Expose enum to template for button click handlers
  IdleUserDecision = IdleUserDecision;

  /**
   * Emits the user's decision to the parent component.
   * 
   * The parent component (App) handles the actual workflow:
   * - REAUTHENTICATE: Triggers form save → popup login → idle timer reset
   * - SIGN_OUT: Triggers popup logout
   * 
   * @param decision - User's choice from IdleUserDecision enum
   */
  onDecision(decision: IdleUserDecision): void {
    this.decision.emit(decision);
  }

  /**
   * Formats elapsed time in milliseconds to human-readable string.
   * 
   * Examples:
   * - 5000ms → "0 minutes and 5 seconds"
   * - 65000ms → "1 minute and 5 seconds"
   * - 125000ms → "2 minutes and 5 seconds"
   * 
   * @param ms - Elapsed time in milliseconds
   * @returns Formatted duration string
   */
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  /**
   * Formats the idle detection return reason to user-friendly text.
   * 
   * The IdleDetectionService detects user activity through multiple signals:
   * - tab_visible: Browser tab became visible (visibilitychange event)
   * - window_focused: Browser window gained focus
   * - page_resumed: Page resumed from background/sleep state
   * - manual_check: Manual activity check triggered
   * 
   * @param reason - Raw reason string from IdleEvent metadata
   * @returns Human-readable description of how activity was detected
   */
  formatReturnReason(reason: string): string {
    const map: Record<string, string> = {
      'tab_visible': 'Tab became visible',
      'window_focused': 'Window gained focus',
      'page_resumed': 'Page resumed from sleep',
      'manual_check': 'Manual check'
    };
    return map[reason] || reason;
  }
}