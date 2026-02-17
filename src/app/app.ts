import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
// Import session persistence services
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

  // Inject session persistence services
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
    
    // Start idle detection if user is authenticated
    const isAuthenticated = this.msalService.instance.getAllAccounts().length > 0;
    if (isAuthenticated) {
      this.startIdleDetection();
    }
  }

  private startIdleDetection(): void {
    this.idleService.configure({
      idleTimeoutSeconds: 10, // 15 minutes
      enableLogging: false
    });

    // Subscribe to rich idle events with full context (NEW APPROACH)
    this.subscription = this.idleService.onIdleEvent$
      .pipe(filter(e => e.type === IdleEventType.TIMEOUT_EXCEEDED))
      .subscribe((event) => {
        // Show custom dialog with event context
        this.currentIdleEvent = event;
        this.showIdleDialog = true;
      });

    this.idleService.start();
  }

  async onIdleDialogDecision(decision: IdleUserDecision): Promise<void> {
    this.showIdleDialog = false;

    if (decision === IdleUserDecision.REAUTHENTICATE) {
      try {
        this.formLifecycle.saveAllForms();
        await this.authService.loginPopup();
        this.idleService.reset();
      } catch (error) {
        console.error('Re-authentication failed', error);
      }
    } else if (decision === IdleUserDecision.SIGN_OUT) {
      await this.authService.logoutPopup();
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.idleService.stop();
  }
}
