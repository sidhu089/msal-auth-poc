import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MsalService, MsalModule } from '@azure/msal-angular';
import { EventMessage, EventType, InteractionStatus } from '@azure/msal-browser';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MsalModule, RouterLink, RouterOutlet],
  template: `
    <div class="container">
      <h2>MSAL Authentication Demo</h2>

      <!-- Loading state -->
      <div *ngIf="!isInitialized" class="loading">
        Initializing authentication...
      </div>

      <!-- Login/Logout button -->
      <div class="auth-section" *ngIf="isInitialized && !(isAuthenticated$ | async)">
        <button (click)="login()" class="btn btn-primary">Sign In with Microsoft</button>
      </div>

      <div class="auth-section" *ngIf="isInitialized && isAuthenticated$ | async">
        <div class="user-info">
          <h3>Welcome, {{ username }}!</h3>
          <p>Email: {{ userEmail }}</p>
          <button (click)="logout()" class="btn btn-secondary">Sign Out</button>
        </div>

        <nav>
          <ul class="nav-links">
            <li><a routerLink="/profile" routerLinkActive="active">Profile</a></li>
            <li><a routerLink="/form" routerLinkActive="active">Sample Forms</a></li>
          </ul>
        </nav>
      </div>

      <!-- Display form content here when on form route -->
      <router-outlet />
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .loading {
      text-align: center;
      padding: 20px;
      font-size: 16px;
      color: #666;
    }

    .auth-section {
      margin-bottom: 20px;
    }

    .user-info {
      background-color: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-right: 10px;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .nav-links {
      list-style-type: none;
      padding: 0;
      display: flex;
      gap: 20px;
    }

    .nav-links li {
      margin-bottom: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: #007bff;
      padding: 10px 15px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }

    .nav-links a:hover, .nav-links a.active {
      background-color: #e9ecef;
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  isAuthenticated$!: any;
  username: string = '';
  userEmail: string = '';
  private destroy$ = new Subject<void>();
  isInitialized = false;

  constructor(
    private authService: AuthService,
    private msalService: MsalService
  ) {
    // Wait for MSAL to initialize before setting up the observable
    this.msalService.instance.initialize().then(() => {
      this.isAuthenticated$ = this.authService.isAuthenticated$;
      this.isInitialized = true;
    });
  }

  ngOnInit() {
    // Check if user is logged in initially
    const account = this.authService.getActiveAccount();
    if (account) {
      this.setUserInfo(account);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout();
  }

  private setUserInfo(account: any) {
    this.username = account?.name || account?.username || '';
    this.userEmail = account?.username || '';
  }
}