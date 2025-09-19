import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MedicineService } from '../../services/medicine.service';
import { CreateMedicine, UpdateMedicine, Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-medicine-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="medicine-form-container">
      <div class="form-header">
        <button mat-icon-button (click)="goBack()" class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Edit Medicine' : 'Add New Medicine' }}</h1>
      </div>

      <mat-card class="form-card">
        <mat-card-content>
          <form [formGroup]="medicineForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Medicine Name *</mat-label>
                <input matInput formControlName="name" placeholder="Enter medicine name">
                <mat-error *ngIf="medicineForm.get('name')?.hasError('required')">
                  Medicine name is required
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Generic Name</mat-label>
                <input matInput formControlName="genericName" placeholder="Enter generic name">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Manufacturer</mat-label>
                <input matInput formControlName="manufacturer" placeholder="Enter manufacturer">
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" placeholder="Enter description" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option value="">Select Category</mat-option>
                  <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Form</mat-label>
                <mat-select formControlName="form">
                  <mat-option value="">Select Form</mat-option>
                  <mat-option *ngFor="let form of forms" [value]="form">{{form}}</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Strength</mat-label>
                <input matInput formControlName="strength" placeholder="e.g., 500mg, 10ml">
              </mat-form-field>

              <mat-form-field appearance="outline" class="half-width">
                <mat-label>Price ($)</mat-label>
                <input matInput type="number" formControlName="price" placeholder="Enter price" step="0.01" min="0">
                <mat-error *ngIf="medicineForm.get('price')?.hasError('min')">
                  Price must be a positive number
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-checkbox formControlName="isActive">
                Active Medicine
              </mat-checkbox>
            </div>

            <div class="form-actions">
              <button mat-button type="button" (click)="goBack()">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="medicineForm.invalid || isSubmitting">
                <mat-spinner *ngIf="isSubmitting" diameter="20" class="button-spinner"></mat-spinner>
                {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Medicine' : 'Add Medicine') }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .medicine-form-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .form-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .back-button {
      background: #f5f5f5;
    }

    .form-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .form-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .full-width {
      flex: 1;
    }

    .half-width {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #eee;
    }

    .button-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    @media screen and (max-width: 768px) {
      .medicine-form-container {
        padding: 16px;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class MedicineFormComponent implements OnInit {
  medicineForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  medicineId: number | null = null;

  categories = [
    'Analgesics', 'Antibiotics', 'Antifungals', 'Antivirals', 'Cardiovascular',
    'Dermatological', 'Gastrointestinal', 'Neurological', 'Respiratory', 'Vitamins'
  ];

  forms = [
    'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch'
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private medicineService: MedicineService,
    private snackBar: MatSnackBar
  ) {
    this.medicineForm = this.createForm();
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.medicineId = +idParam;
      this.isEditMode = true;
      this.loadMedicine(this.medicineId);
    } else {
      // Set default values for new medicine
      this.medicineForm.patchValue({
        isActive: true
      });
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      genericName: [''],
      manufacturer: [''],
      description: [''],
      category: [''],
      form: [''],
      strength: [''],
      price: [0, [Validators.min(0)]],
      isActive: [true]
    });
  }

  private loadMedicine(id: number) {
    this.medicineService.getMedicine(id).subscribe({
      next: (medicine) => {
        this.medicineForm.patchValue(medicine);
      },
      error: (error) => {
        console.error('Error loading medicine:', error);
        this.snackBar.open('Error loading medicine details', 'Close', { duration: 3000 });
        this.router.navigate(['/medicines']);
      }
    });
  }

  onSubmit() {
    if (this.medicineForm.valid) {
      this.isSubmitting = true;

      if (this.isEditMode && this.medicineId) {
        this.updateMedicine();
      } else {
        this.createMedicine();
      }
    }
  }

  private createMedicine() {
    const medicineData: CreateMedicine = this.medicineForm.value;

    this.medicineService.createMedicine(medicineData).subscribe({
      next: (medicine) => {
        this.isSubmitting = false;
        this.snackBar.open('Medicine created successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/medicines']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creating medicine:', error);
        this.snackBar.open('Error creating medicine', 'Close', { duration: 3000 });
      }
    });
  }

  private updateMedicine() {
    if (!this.medicineId) return;

    const medicineData: UpdateMedicine = this.medicineForm.value;

    this.medicineService.updateMedicine(this.medicineId, medicineData).subscribe({
      next: (medicine) => {
        this.isSubmitting = false;
        this.snackBar.open('Medicine updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/medicines']);
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error updating medicine:', error);
        this.snackBar.open('Error updating medicine', 'Close', { duration: 3000 });
      }
    });
  }

  goBack() {
    this.router.navigate(['/medicines']);
  }
}
