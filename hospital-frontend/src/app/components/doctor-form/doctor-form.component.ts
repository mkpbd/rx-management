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
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DoctorService } from '../../services/doctor.service';
import { Doctor, CreateDoctor, UpdateDoctor } from '../../models/doctor.model';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  template: `
    <div class="doctor-form-container">
      <mat-toolbar color="primary" class="form-toolbar">
        <mat-icon>medical_services</mat-icon>
        <span class="toolbar-title">
          {{ isEditMode ? 'Edit Doctor' : 'Add New Doctor' }}
        </span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="onCancel()" matTooltip="Close">
          <mat-icon>close</mat-icon>
        </button>
      </mat-toolbar>

      <div class="form-content">
        <mat-card class="doctor-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>person_add</mat-icon>
              Doctor Information
            </mat-card-title>
            <mat-card-subtitle>
              {{ isEditMode ? 'Update the doctor information below' : 'Fill in the doctor information below' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="doctorForm" (ngSubmit)="onSubmit()" class="doctor-form">
              <!-- Loading Spinner -->
              <div *ngIf="isLoading" class="loading-container">
                <mat-spinner diameter="50"></mat-spinner>
                <p>{{ isEditMode ? 'Updating doctor...' : 'Creating doctor...' }}</p>
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

                <!-- Professional Information Row -->
                <div class="form-row dual-column">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Specialization *</mat-label>
                    <mat-select formControlName="specialization">
                      <mat-option value="">Select Specialization</mat-option>
                      <mat-option *ngFor="let spec of specializations" [value]="spec">{{spec}}</mat-option>
                    </mat-select>
                    <mat-icon matSuffix>local_hospital</mat-icon>
                    <mat-error *ngIf="specialization?.hasError('required') && specialization?.touched">
                      Specialization is required
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>License Number</mat-label>
                    <input matInput formControlName="licenseNumber" placeholder="Enter license number">
                    <mat-icon matSuffix>badge</mat-icon>
                  </mat-form-field>
                </div>

                <!-- Additional Information Row -->
                <div class="form-row dual-column">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Years of Experience *</mat-label>
                    <input matInput formControlName="experienceYears" type="number" min="0" placeholder="Enter years of experience">
                    <mat-icon matSuffix>work</mat-icon>
                    <mat-error *ngIf="experienceYears?.hasError('required') && experienceYears?.touched">
                      Years of experience is required
                    </mat-error>
                    <mat-error *ngIf="experienceYears?.hasError('min') && experienceYears?.touched">
                      Experience must be a positive number
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>Qualifications</mat-label>
                    <input matInput formControlName="qualifications" placeholder="Enter qualifications">
                    <mat-icon matSuffix>school</mat-icon>
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
                    [disabled]="!doctorForm.dirty">
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
                    matTooltip="Edit Doctor">
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
                    matTooltip="Delete Doctor">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>

                  <button
                    mat-raised-button
                    color="primary"
                    type="submit"
                    class="submit-button"
                    [disabled]="doctorForm.invalid">
                    <mat-icon>save</mat-icon>
                    {{ isEditMode ? 'Update Doctor' : 'Create Doctor' }}
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
    .doctor-form-container {
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

    .doctor-card {
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      border-radius: 8px;
    }

    .doctor-form {
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
      .doctor-form-container {
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
export class DoctorFormComponent implements OnInit {
  doctorForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  doctorId: number | null = null;

  specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'General Medicine', 'Surgery', 'Psychiatry', 'Radiology', 'Anesthesiology'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private doctorService: DoctorService
  ) {
    // Initialize reactive form with validation
    this.doctorForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[+]?[1-9]?\d{9,15}$/)]],
      specialization: ['', [Validators.required]],
      licenseNumber: [''],
      experienceYears: [0, [Validators.required, Validators.min(0)]],
      qualifications: ['']
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.doctorId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.doctorId;

    // Load doctor data if in edit mode
    if (this.isEditMode) {
      this.loadDoctorData();
    }
  }

  private loadDoctorData(): void {
    if (this.doctorId) {
      this.isLoading = true;

      this.doctorService.getDoctor(this.doctorId).subscribe({
        next: (doctor) => {
          this.doctorForm.patchValue(doctor);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading doctor:', error);
          this.snackBar.open('Error loading doctor data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/doctors']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.doctorForm.valid) {
      this.isLoading = true;
      const formValue = this.doctorForm.value;

      if (this.isEditMode && this.doctorId) {
        // Update existing doctor
        const updateData: UpdateDoctor = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          specialization: formValue.specialization,
          licenseNumber: formValue.licenseNumber,
          experienceYears: formValue.experienceYears,
          qualifications: formValue.qualifications
        };

        this.doctorService.updateDoctor(this.doctorId, updateData).subscribe({
          next: (doctor) => {
            this.isLoading = false;
            this.snackBar.open('Doctor updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/doctors']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating doctor:', error);
            this.snackBar.open('Error updating doctor', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new doctor
        const createData: CreateDoctor = {
          firstName: formValue.firstName,
          lastName: formValue.lastName,
          email: formValue.email,
          phone: formValue.phone,
          specialization: formValue.specialization,
          licenseNumber: formValue.licenseNumber,
          experienceYears: formValue.experienceYears,
          qualifications: formValue.qualifications
        };

        this.doctorService.createDoctor(createData).subscribe({
          next: (doctor) => {
            this.isLoading = false;
            this.snackBar.open('Doctor created successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/doctors']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating doctor:', error);
            this.snackBar.open('Error creating doctor', 'Close', { duration: 3000 });
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
    this.router.navigate(['/doctors']);
  }

  onReset(): void {
    this.doctorForm.reset();
  }

  onEdit(): void {
    // Enable form for editing if disabled
    if (this.doctorForm.disabled) {
      this.doctorForm.enable();
      this.snackBar.open('Form enabled for editing', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  onDelete(): void {
    if (this.doctorId && confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      this.isLoading = true;

      this.doctorService.deleteDoctor(this.doctorId).subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open('Doctor deleted successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          this.router.navigate(['/doctors']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error deleting doctor:', error);
          this.snackBar.open('Error deleting doctor', 'Close', { duration: 3000 });
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.doctorForm.controls).forEach(key => {
      const control = this.doctorForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form validation
  get firstName() { return this.doctorForm.get('firstName'); }
  get lastName() { return this.doctorForm.get('lastName'); }
  get email() { return this.doctorForm.get('email'); }
  get phone() { return this.doctorForm.get('phone'); }
  get specialization() { return this.doctorForm.get('specialization'); }
  get licenseNumber() { return this.doctorForm.get('licenseNumber'); }
  get experienceYears() { return this.doctorForm.get('experienceYears'); }
  get qualifications() { return this.doctorForm.get('qualifications'); }
}
