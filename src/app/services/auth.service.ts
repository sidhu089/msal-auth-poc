import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, PopupRequest, RedirectRequest } from '@azure/msal-browser';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private msalService: MsalService) {
    // Initialize MSAL instance first
    this.msalService.instance.initialize().then(() => {
      this.checkInitialAuthStatus();
      this.setupEventHandlers();
    });
  }

  private checkInitialAuthStatus() {
    const accounts = this.msalService.instance.getAllAccounts();
    console.log('Initial accounts count:', accounts.length); // Debug log
    this.isAuthenticatedSubject.next(accounts.length > 0);
  }

  private setupEventHandlers() {
    // Listen for login success events
    this.msalService.instance.addEventCallback((event: any) => {
      if (event.eventType === 'LOGIN_SUCCESS') {
        console.log('Login success event received'); // Debug log
        setTimeout(() => {
          this.isAuthenticatedSubject.next(true);
        }, 500); // Delay to ensure account is properly set
      } else if (event.eventType === 'LOGOUT_SUCCESS') {
        console.log('Logout success event received'); // Debug log
        this.isAuthenticatedSubject.next(false);
      }
    });
  }

  login() {
    const popupRequest: PopupRequest = {
      scopes: ['user.read']
    };

    return this.msalService.loginPopup(popupRequest)
      .subscribe({
        next: (result: AuthenticationResult) => {
          if (result.account) {
            this.msalService.instance.setActiveAccount(result.account);
            this.isAuthenticatedSubject.next(true);
          }
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
  }

  logout() {
    this.msalService.logoutPopup({
      mainWindowRedirectUri: '/'
    }).subscribe(() => {
      this.isAuthenticatedSubject.next(false);
    });
  }

  getActiveAccount(): AccountInfo | null {
    return this.msalService.instance.getActiveAccount();
  }

  getAccessToken(): Observable<any> {
    const account = this.getActiveAccount();
    if (!account) {
      return new Observable(observer => {
        observer.error('No active account found');
      });
    }
    
    const request = {
      scopes: ['user.read'],
      account: account
    };

    return new Observable(observer => {
      this.msalService.acquireTokenSilent(request).subscribe({
        next: (result: any) => {
          observer.next(result.accessToken);
          observer.complete();
        },
        error: (error) => {
          console.error('Failed to acquire token silently:', error);
          // Fallback to popup
          this.msalService.acquireTokenPopup(request).subscribe({
            next: (result: any) => {
              observer.next(result.accessToken);
              observer.complete();
            },
            error: (error) => {
              console.error('Failed to acquire token via popup:', error);
              observer.error(error);
            }
          });
        }
      });
    });
  }
}