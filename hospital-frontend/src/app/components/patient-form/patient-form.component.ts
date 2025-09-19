import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PatientService } from '../../services/patient.service';
import { Patient, CreatePatient, UpdatePatient } from '../../models/patient.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  template: `
    <div class="patient-form-container">
      <mat-toolbar color="primary" class="form-toolbar">
        <mat-icon>person</mat-icon>
        <span class="toolbar-title">
          {{ isEditMode ? 'Edit Patient' : 'Add New Patient' }}
        </span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="onCancel()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>

      <div class="form-content">
        <mat-card class="patient-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person_add</mat-icon>
              Patient Information
            </mat-card-title>
            <mat-card-subtitle>
              {{ isEditMode ? 'Update the patient information below' : 'Fill in the patient information below' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" class="patient-form">
              <!-- Loading Spinner -->
              <div *ngIf="isLoading" class="loading-container">
                <mat-spinner diameter="50"></mat-spinner>
                <p>{{ isEditMode ? 'Updating patient...' : 'Creating patient...' }}</p>
              </div>

              <div *ngIf="!isLoading">
                <!-- Name Fields Row -->
                <div class="form-row dual-column">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>First Name *</mat-label>
                    <input matInput formControlName="firstName" placeholder="Enter first name">
                    <mat-icon matSuffix>person</mat-icon>
                    <mat-error *ngIf="firstName?.hasError('required') && firstName?.touched">
                      First name is required
                    </mat-error>
                    <mat-error *ngIf="firstName?.hasError('maxlength') && firstName?.touched">
                      First name must be less than 50 characters
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Last Name *</mat-label>
                    <input matInput formControlName="lastName" placeholder="Enter last name">
                    <mat-icon matSuffix>person</mat-icon>
                    <mat-error *ngIf="lastName?.hasError('required') && lastName?.touched">
                      Last name is required
                    </mat-error>
                    <mat-error *ngIf="lastName?.hasError('maxlength') && lastName?.touched">
                      Last name must be less than 50 characters
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Contact Information Row -->
                <div class="form-row dual-column">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Email *</mat-label>
                    <input matInput formControlName="email" type="email" placeholder="Enter email address">
                    <mat-icon matSuffix>email</mat-icon>
                    <mat-error *ngIf="email?.hasError('required') && email?.touched">
                      Email is required
                    </mat-error>
                    <mat-error *ngIf="email?.hasError('email') && email?.touched">
                      Please enter a valid email address
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" placeholder="Enter phone number">
                    <mat-icon matSuffix>phone</mat-icon>
                    <mat-error *ngIf="phone?.hasError('pattern') && phone?.touched">
                      Please enter a valid phone number
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Personal Information Row -->
                <div class="form-row dual-column">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Date of Birth *</mat-label>
                    <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" placeholder="Select date of birth">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                    <mat-error *ngIf="dateOfBirth?.hasError('required') && dateOfBirth?.touched">
                      Date of birth is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Gender</mat-label>
                    <mat-select formControlName="gender">
                      <mat-option value="Male">Male</mat-option>
                      <mat-option value="Female">Female</mat-option>
                      <mat-option value="Other">Other</mat-option>
                      <mat-option value="Prefer not to say">Prefer not to say</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>wc</mat-icon>
                  </mat-form-field>
                </div>

                <!-- Address Field -->
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Address</mat-label>
                    <textarea matInput formControlName="address" placeholder="Enter full address" rows="3"></textarea>
                    <mat-icon matSuffix>home</mat-icon>
                    <mat-error *ngIf="address?.hasError('maxlength') && address?.touched">
                      Address must be less than 500 characters
                    </mat-error>
                  </mat-form-field>
                </div>

                <!-- Action Buttons -->
                <div class="form-actions">
                  <button
                    mat-button
                    type="button"
                    (click)="onCancel()"
                    class="cancel-button">
                    <mat-icon>cancel</mat-icon>
                    Cancel
                  </button>

                  <button
                    mat-button
                    type="button"
                    (click)="onReset()"
                    class="reset-button"
                    [disabled]="!patientForm.dirty">
                    <mat-icon>refresh</mat-icon>
                    Reset
                  </button>

                  <!-- Edit Button - only show in edit mode -->
                  <button
                    *ngIf="isEditMode"
                    mat-button
                    type="button"
                    (click)="onEdit()"
                    class="edit-button"
                    matTooltip="Edit Patient">
                    <mat-icon>edit</mat-icon>
                    Edit
                  </button>

                  <!-- Delete Button - only show in edit mode -->
                  <button
                    *ngIf="isEditMode"
                    mat-button
                    type="button"
                    (click)="onDelete()"
                    class="delete-button"
                    matTooltip="Delete Patient">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>

                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    class="submit-button"
                    [disabled]="patientForm.invalid">
                    <mat-icon>save</mat-icon>
                    {{ isEditMode ? 'Update Patient' : 'Create Patient' }}
                  </button>
                </div>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .patient-form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .form-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-title {
      margin-left: 16px;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .toolbar-spacer {
      flex: 1;
    }

    .form-content {
      padding: 24px;
    }

    .patient-card {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
    }

    .patient-form {
      max-width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .dual-column {
      flex-wrap: wrap;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
      min-width: 250px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: #666;
    }

    .loading-container p {
      margin-top: 16px;
      font-size: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .cancel-button {
      color: #666;
    }

    .reset-button {
      color: #ff9800;
    }

    .edit-button {
      color: #4caf50;
    }

    .delete-button {
      color: #f44336;
    }

    .submit-button {
      min-width: 140px;
    }

    @media screen and (max-width: 768px) {
      .patient-form-container {
        padding: 0;
      }

      .form-content {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
        min-width: unset;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .form-actions button {
        width: 100%;
        margin-bottom: 8px;
      }
    }
  `]
})
export class PatientFormComponent implements OnInit {
  patientForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  patientId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private patientService: PatientService
  ) {
    // Initialize reactive form with validation
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+]?[1-9]?\d{9,15}$/)]],
      dateOfBirth: ['', [Validators.required]],
      gender: [''],
      address: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.patientId;

    // Load patient data if in edit mode
    if (this.isEditMode) {
      this.loadPatientData();
    }
  }

  private loadPatientData(): void {
    if (this.patientId) {
      this.isLoading = true;

      this.patientService.getPatient(this.patientId).subscribe({
        next: (patient) => {
          // Convert date string to Date object for form
          const patientData = {
            ...patient,
            dateOfBirth: new Date(patient.dateOfBirth)
          };

          this.patientForm.patchValue(patientData);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading patient:', error);
          this.snackBar.open('Error loading patient data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/patients']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isLoading = true;
      const formValue = this.patientForm.value;

      if (this.isEditMode && this.patientId) {
        // Update existing patient
        const updateData: UpdatePatient = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          dateOfBirth: formValue.dateOfBirth,
          gender: formValue.gender,
          address: formValue.address
        };

        this.patientService.updatePatient(this.patientId, updateData).subscribe({
          next: (patient) => {
            this.isLoading = false;
            this.snackBar.open('Patient updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating patient:', error);
            this.snackBar.open('Error updating patient', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new patient
        const createData: CreatePatient = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          dateOfBirth: formValue.dateOfBirth,
          gender: formValue.gender,
          address: formValue.address
        };

        this.patientService.createPatient(createData).subscribe({
          next: (patient) => {
            this.isLoading = false;
            this.snackBar.open('Patient created successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating patient:', error);
            this.snackBar.open('Error creating patient', 'Close', { duration: 3000 });
          }
        });
      }
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/patients']);
  }

  onReset(): void {
    this.patientForm.reset();
  }

  onEdit(): void {
    // Enable form for editing if disabled
    if (this.patientForm.disabled) {
      this.patientForm.enable();
      this.snackBar.open('Form enabled for editing', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  onDelete(): void {
    if (this.patientId && confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
      this.isLoading = true;

      this.patientService.deletePatient(this.patientId).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Patient deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.router.navigate(['/patients']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error deleting patient:', error);
          this.snackBar.open('Error deleting patient', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.patientForm.controls).forEach(key => {
      const control = this.patientForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form validation
  get firstName() { return this.patientForm.get('firstName'); }
  get lastName() { return this.patientForm.get('lastName'); }
  get email() { return this.patientForm.get('email'); }
  get phone() { return this.patientForm.get('phone'); }
  get dateOfBirth() { return this.patientForm.get('dateOfBirth'); }
  get gender() { return this.patientForm.get('gender'); }
  get address() { return this.patientForm.get('address'); }
}
