import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

// ============================================================================
// AutoPersistFormDirective - Automatic Form State Persistence
// ============================================================================
// This directive from @svt_089/angular-msal-session-persistence provides
// automatic form state persistence and restoration capabilities:
//
// HOW IT WORKS:
// 1. Apply the directive to a <form> element with a unique formId attribute
// 2. The directive automatically watches for form value changes (debounced)
// 3. On each change, it serializes the form value and saves to sessionStorage
//    with key: 'sessionpersist_form_{formId}'
// 4. On component initialization, it reads from sessionStorage and restores
//    the form value if previously saved data exists
// 5. After successful form submission, manually clear the persisted data
//
// BENEFITS:
// - Prevents data loss during page refresh, browser crashes, or session timeouts
// - Seamlessly restores form state after re-authentication flows
// - No manual save/restore code needed in component logic
// - Works transparently with Angular's reactive forms
//
// USAGE:
// <form [formGroup]="myForm" formId="uniqueFormId" autoPersistForm>
//   ... form controls ...
// </form>
//
// NOTE: The formId attribute is REQUIRED and must be unique per form
// ============================================================================
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
        <!--
          ================================================================
          Auto-Persisting Form with AutoPersistFormDirective
          ================================================================
          - formId="form1": Unique identifier used as sessionStorage key suffix
          - autoPersistForm: Directive attribute that enables automatic persistence
          
          When user types in any field:
          1. Directive detects value change (debounced to avoid excessive writes)
          2. Serializes form value to JSON
          3. Saves to sessionStorage under 'sessionpersist_form_form1'
          
          When component initializes:
          1. Directive checks sessionStorage for 'sessionpersist_form_form1'
          2. If found, patches the form with saved values
          3. Form appears pre-filled with user's previous input
          
          After submission (see onSubmit method):
          1. Persisted data is manually cleared from sessionStorage
          2. Next form load starts fresh
          ================================================================
        -->
        <form [formGroup]="sampleForm" formId="form1" autoPersistForm (ngSubmit)="onSubmit()" class="sample-form">
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
        <!--
          ================================================================
          Second Auto-Persisting Form with Unique formId
          ================================================================
          - formId="form2": Different identifier creates separate sessionStorage entry
          - Each form maintains independent persisted state
          - Key: 'sessionpersist_form_form2'
          
          This demonstrates that multiple forms can coexist with the
          AutoPersistFormDirective, each with their own persistence lifecycle.
          ================================================================
        -->
        <form [formGroup]="sampleForm1" formId="form2" autoPersistForm (ngSubmit)="onSubmit1()" class="sample-form">
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
    // Initialize Form 1 with validation rules
    this.sampleForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      comments: [''],
      agreement: [false, Validators.requiredTrue]
    });

    // Initialize Form 2 with same validation rules (independent instance)
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

    // NOTE: Form restoration is handled automatically by AutoPersistFormDirective
    // No manual restoration code needed here. The directive:
    // 1. Detects form initialization
    // 2. Reads from sessionStorage using formId
    // 3. Patches form value if saved data exists
  }

  /**
   * Handles Form 1 submission.
   * 
   * On successful submission:
   * 1. Stores form data for display in success message
   * 2. Clears persisted form data from sessionStorage
   *    (prevents stale data on next form load)
   * 3. In production: would send data to backend API
   */
  onSubmit() {
    if (this.sampleForm.valid) {
      this.formData = this.sampleForm.value;
      this.formSubmitted = true;
      console.log('Form 1 submitted:', this.formData);

      // Here you would typically send the data to your backend API
      // For demo purposes, we're just showing the data in the UI

      // ===============================================================
      // Clear Persisted Form Data After Successful Submission
      // ===============================================================
      // The AutoPersistFormDirective saves form state automatically,
      // but we must manually clear it after successful submission
      // to prevent stale data from appearing on next form load.
      //
      // Key format: 'sessionpersist_form_{formId}'
      // For Form 1: 'sessionpersist_form_form1'
      // ===============================================================
      sessionStorage.removeItem('sessionpersist_form_form1');
    } else {
      console.log('Form 1 is invalid');
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.sampleForm);
    }
  }

  /**
   * Handles Form 2 submission.
   * 
   * Same logic as onSubmit() but for the second form with its own
   * independent persisted state.
   */
  onSubmit1() {
    if (this.sampleForm1.valid) {
      this.formData1 = this.sampleForm1.value;
      this.formSubmitted1 = true;
      console.log('Form 2 submitted:', this.formData1);

      // Here you would typically send the data to your backend API
      // For demo purposes, we're just showing the data in the UI

      // ===============================================================
      // Clear Persisted Form Data After Successful Submission
      // ===============================================================
      // Key format: 'sessionpersist_form_{formId}'
      // For Form 2: 'sessionpersist_form_form2'
      // ===============================================================
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