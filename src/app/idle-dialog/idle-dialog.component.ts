import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  @Input() event?: IdleEvent;
  @Output() decision = new EventEmitter<IdleUserDecision>();
  
  IdleUserDecision = IdleUserDecision;

  onDecision(decision: IdleUserDecision): void {
    this.decision.emit(decision);
  }

  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

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