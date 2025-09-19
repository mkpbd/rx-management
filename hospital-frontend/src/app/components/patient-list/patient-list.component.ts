import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.model';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="patient-list-container">
      <div class="page-header">
        <h1>Patient Management</h1>
        <button mat-raised-button color="primary" (click)="addPatient()">
          <mat-icon>add</mat-icon>
          Add New Patient
        </button>
      </div>

      <!-- Search and Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Patients</mat-label>
              <input matInput formControlName="searchTerm" placeholder="Search by name, email, or phone">
              <mat-icon matSuffix>search</mat-icon>
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
            <table mat-table [dataSource]="dataSource" class="patients-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let patient">{{patient.id}}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let patient">{{patient.firstName}} {{patient.lastName}}</td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let patient">{{patient.email}}</td>
              </ng-container>

              <!-- Phone Column -->
              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let patient">{{patient.phone}}</td>
              </ng-container>

              <!-- Date of Birth Column -->
              <ng-container matColumnDef="dateOfBirth">
                <th mat-header-cell *matHeaderCellDef>Date of Birth</th>
                <td mat-cell *matCellDef="let patient">{{patient.dateOfBirth | date:'shortDate'}}</td>
              </ng-container>

              <!-- Gender Column -->
              <ng-container matColumnDef="gender">
                <th mat-header-cell *matHeaderCellDef>Gender</th>
                <td mat-cell *matCellDef="let patient">{{patient.gender}}</td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let patient">
                  <button mat-icon-button color="primary" (click)="viewPatient(patient)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="editPatient(patient)" matTooltip="Edit Patient">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deletePatient(patient)" matTooltip="Delete Patient">
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
              <p>Loading patients...</p>
            </div>

            <!-- No Data Message -->
            <div *ngIf="!isLoading && dataSource.data.length === 0" class="no-data">
              <mat-icon>people_outline</mat-icon>
              <p>No patients found</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .patient-list-container {
      padding: 24px;
      max-width: 1400px;
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
      font-size: 1.8rem;
      font-weight: 500;
    }

    .filter-card {
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border-radius: 10px;
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
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border-radius: 10px;
    }

    .table-container {
      overflow-x: auto;
    }

    .patients-table {
      width: 100%;
      min-width: 800px;
    }

    .patients-table th {
      font-weight: 600;
      color: #333;
    }

    .patients-table td {
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
      .patient-list-container {
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
export class PatientListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'dateOfBirth', 'gender', 'actions'];
  patients: Patient[] = [];
  dataSource = new MatTableDataSource<Patient>([]);
  isLoading = false;
  searchForm: FormGroup;
  private routerSubscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private patientService: PatientService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit() {
    this.loadPatients();

    // Subscribe to router events to reload data when navigating back to patient list
    this.routerSubscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          if (event.url === '/patients' || event.urlAfterRedirects === '/patients') {
            this.loadPatients();
          }
        })
    );
  }

  ngOnDestroy() {
    // Unsubscribe from all subscriptions to prevent memory leaks
    this.routerSubscription.unsubscribe();
  }

  loadPatients() {
    this.isLoading = true;
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.dataSource.data = patients;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.snackBar.open('Error loading patients', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    if (searchTerm && searchTerm.trim()) {
      this.isLoading = true;
      this.patientService.searchPatients(searchTerm.trim()).subscribe({
        next: (patients) => {
          this.dataSource.data = patients;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error searching patients:', error);
          this.snackBar.open('Error searching patients', 'Close', { duration: 3000 });
          this.isLoading = false;
        }
      });
    } else {
      this.loadPatients();
    }
  }

  clearFilters() {
    this.searchForm.reset();
    this.loadPatients();
  }

  addPatient() {
    this.router.navigate(['/patients/create']);
  }

  viewPatient(patient: Patient) {
    this.router.navigate(['/patients/view', patient.id]);
  }

  editPatient(patient: Patient) {
    this.router.navigate(['/patients/edit', patient.id]);
  }

  deletePatient(patient: Patient) {
    if (confirm(`Are you sure you want to delete patient ${patient.firstName} ${patient.lastName}?`)) {
      this.patientService.deletePatient(patient.id).subscribe({
        next: () => {
          this.snackBar.open('Patient deleted successfully', 'Close', { duration: 3000 });
          this.loadPatients(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting patient:', error);
          this.snackBar.open('Error deleting patient', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
