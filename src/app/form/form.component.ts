import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AutoPersistFormDirective } from '@svt_089/angular-msal-session-persistence';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutoPersistFormDirective],
  template: `
    <div class="form-container">
      <h2>Sample Forms</h2>
      <p>Welcome, {{ username }}! You are authenticated and can access these forms.</p>

      <!-- Form 1 -->
      <div class="form-section">
        <h3>Form 1</h3>
        <form [formGroup]="sampleForm" id="form1" (ngSubmit)="onSubmit()" class="sample-form">
          <div class="form-group">
            <label for="name1">Name:</label>
            <input
              type="text"
              id="name1"
              formControlName="name"
              class="form-control"
              placeholder="Enter your name">
          </div>

          <div class="form-group">
            <label for="email1">Email:</label>
            <input
              type="email"
              id="email1"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email">
          </div>

          <div class="form-group">
            <label for="phone1">Phone Number:</label>
            <input
              type="tel"
              id="phone1"
              formControlName="phone"
              class="form-control"
              placeholder="Enter your phone number">
          </div>

          <div class="form-group">
            <label for="comments1">Comments:</label>
            <textarea
              id="comments1"
              formControlName="comments"
              class="form-control"
              rows="4"
              placeholder="Enter your comments"></textarea>
          </div>

          <div class="form-group">
            <label>
              <input
                type="checkbox"
                formControlName="agreement"
                class="form-checkbox">
              I agree to the terms and conditions
            </label>
          </div>

          <button type="submit" [disabled]="sampleForm.invalid" class="btn-submit">
            Submit Form 1
          </button>
        </form>

        <div *ngIf="formSubmitted" class="success-message">
          <h4>Form 1 Submitted Successfully!</h4>
          <p>Data entered:</p>
          <pre>{{ formData | json }}</pre>
        </div>
      </div>

      <!-- Form 2 -->
      <div class="form-section">
        <h3>Form 2</h3>
        <form [formGroup]="sampleForm1" id="form2" (ngSubmit)="onSubmit1()" class="sample-form">
          <div class="form-group">
            <label for="name2">Name:</label>
            <input
              type="text"
              id="name2"
              formControlName="name"
              class="form-control"
              placeholder="Enter your name">
          </div>

          <div class="form-group">
            <label for="email2">Email:</label>
            <input
              type="email"
              id="email2"
              formControlName="email"
              class="form-control"
              placeholder="Enter your email">
          </div>

          <div class="form-group">
            <label for="phone2">Phone Number:</label>
            <input
              type="tel"
              id="phone2"
              formControlName="phone"
              class="form-control"
              placeholder="Enter your phone number">
          </div>

          <div class="form-group">
            <label for="comments2">Comments:</label>
            <textarea
              id="comments2"
              formControlName="comments"
              class="form-control"
              rows="4"
              placeholder="Enter your comments"></textarea>
          </div>

          <div class="form-group">
            <label>
              <input
                type="checkbox"
                formControlName="agreement"
                class="form-checkbox">
              I agree to the terms and conditions
            </label>
          </div>

          <button type="submit" [disabled]="sampleForm1.invalid" class="btn-submit">
            Submit Form 2
          </button>
        </form>

        <div *ngIf="formSubmitted1" class="success-message">
          <h4>Form 2 Submitted Successfully!</h4>
          <p>Data entered:</p>
          <pre>{{ formData1 | json }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .form-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .sample-form {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-top: 15px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
    }

    .form-checkbox {
      margin-right: 8px;
    }

    .btn-submit {
      background-color: #28a745;
      color: white;
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
    }

    .btn-submit:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .success-message {
      margin-top: 20px;
      padding: 15px;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
      color: #155724;
    }

    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `]
})
export class FormComponent implements OnInit {
  sampleForm: FormGroup;
  sampleForm1: FormGroup;
  formSubmitted = false;
  formSubmitted1 = false;
  formData: any;
  formData1: any;
  username: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.sampleForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      comments: [''],
      agreement: [false, Validators.requiredTrue]
    });
    
    this.sampleForm1 = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      comments: [''],
      agreement: [false, Validators.requiredTrue]
    });
  }

  ngOnInit() {
    // Get user info from authentication service
    const account = this.authService.getActiveAccount();
    if (account) {
      this.username = account.name || account.username || 'User';
    }
  }

  onSubmit() {
    if (this.sampleForm.valid) {
      this.formData = this.sampleForm.value;
      this.formSubmitted = true;
      console.log('Form 1 submitted:', this.formData);

      // Here you would typically send the data to your backend API
      // For demo purposes, we're just showing the data in the UI

      // Clear the persisted form data after successful submission
      sessionStorage.removeItem('sessionpersist_form_form1');
    } else {
      console.log('Form 1 is invalid');
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.sampleForm);
    }
  }

  onSubmit1() {
    if (this.sampleForm1.valid) {
      this.formData1 = this.sampleForm1.value;
      this.formSubmitted1 = true;
      console.log('Form 2 submitted:', this.formData1);

      // Here you would typically send the data to your backend API
      // For demo purposes, we're just showing the data in the UI

      // Clear the persisted form data after successful submission
      sessionStorage.removeItem('sessionpersist_form_form2');
    } else {
      console.log('Form 2 is invalid');
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.sampleForm1);
    }
  }

  private markFormGroupTouched(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      control?.markAsTouched();
    });
  }
}