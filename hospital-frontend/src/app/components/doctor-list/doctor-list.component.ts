import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../models/doctor.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="doctor-list-container">
      <div class="page-header">
        <h1>Doctor Management</h1>
        <button mat-raised-button color="primary" (click)="addDoctor()">
          <mat-icon>add</mat-icon>
          Add New Doctor
        </button>
      </div>

      <!-- Search and Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Doctors</mat-label>
              <input matInput formControlName="searchTerm" placeholder="Search by name, email, or specialization">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Specialization</mat-label>
              <mat-select formControlName="specialization">
                <mat-option value="">All Specializations</mat-option>
                <mat-option *ngFor="let spec of specializations" [value]="spec">{{spec}}</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filter-actions">
              <button mat-button type="button" (click)="onSearch()">
                <mat-icon>search</mat-icon>
                Search
              </button>
              <button mat-button type="button" (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Data Table -->
      <mat-card class="table-card">
        <mat-card-content>
          <div class="table-container">
            <table mat-table [dataSource]="dataSource" class="doctors-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let doctor">{{doctor.id}}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let doctor">Dr. {{doctor.firstName}} {{doctor.lastName}}</td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let doctor">{{doctor.email}}</td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let doctor">{{doctor.phoneNumber}}</td>
              </ng-container>

              <!-- Specialization Column -->
              <ng-container matColumnDef="specialization">
                <th mat-header-cell *matHeaderCellDef>Specialization</th>
                <td mat-cell *matCellDef="let doctor">{{doctor.specialization}}</td>
              </ng-container>

              <!-- License Number Column -->
              <ng-container matColumnDef="licenseNumber">
                <th mat-header-cell *matHeaderCellDef>License</th>
                <td mat-cell *matCellDef="let doctor">{{doctor.licenseNumber}}</td>
              </ng-container>

              <!-- Experience Column -->
              <ng-container matColumnDef="experience">
                <th mat-header-cell *matHeaderCellDef>Experience</th>
                <td mat-cell *matCellDef="let doctor">{{doctor.yearsOfExperience}} years</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let doctor">
                  <button mat-icon-button color="primary" (click)="viewDoctor(doctor)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="editDoctor(doctor)" matTooltip="Edit Doctor">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="viewSchedule(doctor)" matTooltip="View Schedule">
                    <mat-icon>schedule</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteDoctor(doctor)" matTooltip="Delete Doctor">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>

            <!-- Loading Spinner -->
            <div *ngIf="isLoading" class="loading-container">
              <mat-spinner></mat-spinner>
              <p>Loading doctors...</p>
            </div>

            <!-- No Data Message -->
            <div *ngIf="!isLoading && dataSource.data.length === 0" class="no-data">
              <mat-icon>medical_services</mat-icon>
              <p>No doctors found</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .doctor-list-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .filter-card {
      margin-bottom: 24px;
    }

    .search-form {
      display: flex;
      gap: 16px;
      align-items: end;
    }

    .search-field {
      flex: 1;
    }

    .filter-actions {
      display: flex;
      gap: 8px;
    }

    .table-card {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .table-container {
      overflow-x: auto;
    }

    .doctors-table {
      width: 100%;
      min-width: 900px;
    }

    .doctors-table th {
      font-weight: 600;
      color: #333;
    }

    .doctors-table td {
      padding: 12px 8px;
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

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-data p {
      margin: 0;
      font-size: 1rem;
    }

    @media screen and (max-width: 768px) {
      .doctor-list-container {
        padding: 16px;
      }

      .page-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .search-form {
        flex-direction: column;
        align-items: stretch;
      }

      .filter-actions {
        justify-content: center;
      }
    }
  `]
})
export class DoctorListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'specialization', 'licenseNumber', 'experience', 'actions'];
  doctors: Doctor[] = [];
  dataSource = new MatTableDataSource<Doctor>([]);
  isLoading = false;
  searchForm: FormGroup;
  private routerSubscription = new Subscription();

  specializations = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'General Medicine', 'Surgery', 'Psychiatry', 'Radiology', 'Anesthesiology'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private doctorService: DoctorService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      specialization: ['']
    });
  }

  ngOnInit() {
    this.loadDoctors();
    
    // Subscribe to router events to reload data when navigating back to doctor list
    this.routerSubscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          if (event.url === '/doctors' || event.urlAfterRedirects === '/doctors') {
            this.loadDoctors();
          }
        })
    );
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.routerSubscription.unsubscribe();
  }

  loadDoctors() {
    this.isLoading = true;
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
        this.dataSource.data = doctors;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.snackBar.open('Error loading doctors', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    const specialization = this.searchForm.get('specialization')?.value;

    let filteredDoctors = [...this.doctors];

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.firstName.toLowerCase().includes(term) ||
        doctor.lastName.toLowerCase().includes(term) ||
        doctor.email.toLowerCase().includes(term) ||
        doctor.specialization.toLowerCase().includes(term)
      );
    }

    if (specialization) {
      filteredDoctors = filteredDoctors.filter(doctor =>
        doctor.specialization === specialization
      );
    }

    this.dataSource.data = filteredDoctors;
  }

  clearFilters() {
    this.searchForm.reset();
    this.dataSource.data = this.doctors;
  }

  addDoctor() {
    this.router.navigate(['/doctors/create']);
  }

  viewDoctor(doctor: Doctor) {
    this.router.navigate(['/doctors/view', doctor.id]);
  }

  editDoctor(doctor: Doctor) {
    this.router.navigate(['/doctors/edit', doctor.id]);
  }

  viewSchedule(doctor: Doctor) {
    this.router.navigate(['/doctors/schedule', doctor.id]);
  }

  deleteDoctor(doctor: Doctor) {
    if (confirm(`Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
      this.doctorService.deleteDoctor(doctor.id).subscribe({
        next: () => {
          this.snackBar.open('Doctor deleted successfully', 'Close', { duration: 3000 });
          this.loadDoctors(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting doctor:', error);
          this.snackBar.open('Error deleting doctor', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
