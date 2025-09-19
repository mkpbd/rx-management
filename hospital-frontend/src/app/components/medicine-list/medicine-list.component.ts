import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MedicineService } from '../../services/medicine.service';
import { Medicine } from '../../models/medicine.model';

@Component({
  selector: 'app-medicine-list',
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
    MatChipsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="medicine-list-container">
      <div class="page-header">
        <h1>Medicine Management</h1>
        <button mat-raised-button color="primary" (click)="addMedicine()">
          <mat-icon>add</mat-icon>
          Add New Medicine
        </button>
      </div>

      <!-- Search and Filters -->
      <mat-card class="filter-card">
        <mat-card-content>
          <form [formGroup]="searchForm" class="search-form">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search Medicines</mat-label>
              <input matInput formControlName="searchTerm" placeholder="Search by name, manufacturer, or category">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select formControlName="category">
                <mat-option value="">All Categories</mat-option>
                <mat-option *ngFor="let cat of categories" [value]="cat">{{cat}}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select formControlName="activeStatus">
                <mat-option value="">All</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="inactive">Inactive</mat-option>
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
            <table mat-table [dataSource]="dataSource" class="medicines-table">
              <!-- ID Column -->
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let medicine">{{medicine.id}}</td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let medicine">
                  <strong>{{medicine.name}}</strong>
                  <br>
                  <small class="generic-name">{{medicine.genericName}}</small>
                </td>
              </ng-container>

              <!-- Manufacturer Column -->
              <ng-container matColumnDef="manufacturer">
                <th mat-header-cell *matHeaderCellDef>Manufacturer</th>
                <td mat-cell *matCellDef="let medicine">{{medicine.manufacturer}}</td>
              </ng-container>

              <!-- Category Column -->
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Category</th>
                <td mat-cell *matCellDef="let medicine">
                  <mat-chip-listbox>
                    <mat-chip>{{medicine.category}}</mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <!-- Form & Strength Column -->
              <ng-container matColumnDef="dosage">
                <th mat-header-cell *matHeaderCellDef>Form & Strength</th>
                <td mat-cell *matCellDef="let medicine">{{medicine.form}} - {{medicine.strength}}</td>
              </ng-container>

              <!-- Price Column -->
              <ng-container matColumnDef="price">
                <th mat-header-cell *matHeaderCellDef>Price</th>
                <td mat-cell *matCellDef="let medicine">\${{medicine.price | number:'1.2-2'}}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let medicine">
                  <mat-chip-listbox>
                    <mat-chip [class]="medicine.isActive ? 'status-active' : 'status-inactive'">
                      {{medicine.isActive ? 'Active' : 'Inactive'}}
                    </mat-chip>
                  </mat-chip-listbox>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let medicine">
                  <button mat-icon-button color="primary" (click)="viewMedicine(medicine)" matTooltip="View Details">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="primary" (click)="editMedicine(medicine)" matTooltip="Edit Medicine">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" (click)="toggleStatus(medicine)" matTooltip="Toggle Status">
                    <mat-icon>toggle_on</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteMedicine(medicine)" matTooltip="Delete Medicine">
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
              <p>Loading medicines...</p>
            </div>

            <!-- No Data Message -->
            <div *ngIf="!isLoading && dataSource.data.length === 0" class="no-data">
              <mat-icon>medication</mat-icon>
              <p>No medicines found</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .medicine-list-container {
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

    .medicines-table {
      width: 100%;
      min-width: 1200px;
    }

    .medicines-table th {
      font-weight: 600;
      color: #333;
    }

    .medicines-table td {
      padding: 12px 8px;
    }

    .generic-name {
      color: #666;
      font-style: italic;
    }

    .status-active {
      background-color: #4caf50;
      color: white;
    }

    .status-inactive {
      background-color: #f44336;
      color: white;
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
      .medicine-list-container {
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
export class MedicineListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'manufacturer', 'category', 'dosage', 'price', 'status', 'actions'];
  medicines: Medicine[] = [];
  dataSource = new MatTableDataSource<Medicine>([]);
  isLoading = false;
  searchForm: FormGroup;

  categories = [
    'Analgesics', 'Antibiotics', 'Antifungals', 'Antivirals', 'Cardiovascular',
    'Dermatological', 'Gastrointestinal', 'Neurological', 'Respiratory', 'Vitamins'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private medicineService: MedicineService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      category: [''],
      activeStatus: ['']
    });
  }

  ngOnInit() {
    this.loadMedicines();
  }

  loadMedicines() {
    this.isLoading = true;
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.medicines = medicines;
        this.dataSource.data = medicines;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
        this.snackBar.open('Error loading medicines', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    const searchTerm = this.searchForm.get('searchTerm')?.value;
    const category = this.searchForm.get('category')?.value;
    const activeStatus = this.searchForm.get('activeStatus')?.value;

    let filteredMedicines = [...this.medicines];

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filteredMedicines = filteredMedicines.filter(medicine =>
        medicine.name.toLowerCase().includes(term) ||
        (medicine.genericName && medicine.genericName.toLowerCase().includes(term)) ||
        (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(term)) ||
        (medicine.category && medicine.category.toLowerCase().includes(term))
      );
    }

    if (category) {
      filteredMedicines = filteredMedicines.filter(medicine =>
        medicine.category === category
      );
    }

    if (activeStatus) {
      const isActive = activeStatus === 'active';
      filteredMedicines = filteredMedicines.filter(medicine =>
        medicine.isActive === isActive
      );
    }

    this.dataSource.data = filteredMedicines;
  }

  clearFilters() {
    this.searchForm.reset();
    this.dataSource.data = this.medicines;
  }



  addMedicine() {
    this.router.navigate(['/medicines/create']);
  }

  viewMedicine(medicine: Medicine) {
    this.router.navigate(['/medicines/view', medicine.id]);
  }

  editMedicine(medicine: Medicine) {
    this.router.navigate(['/medicines/edit', medicine.id]);
  }

  toggleStatus(medicine: Medicine) {
    // Toggle the status and update the medicine
    const updatedMedicine = { ...medicine, isActive: !medicine.isActive };
    this.medicineService.updateMedicine(medicine.id, updatedMedicine).subscribe({
      next: () => {
        this.snackBar.open('Medicine status updated successfully', 'Close', { duration: 3000 });
        this.loadMedicines(); // Refresh the list
      },
      error: (error) => {
        console.error('Error updating medicine status:', error);
        this.snackBar.open('Error updating medicine status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteMedicine(medicine: Medicine) {
    if (confirm(`Are you sure you want to delete ${medicine.name}?`)) {
      this.medicineService.deleteMedicine(medicine.id).subscribe({
        next: () => {
          this.snackBar.open('Medicine deleted successfully', 'Close', { duration: 3000 });
          this.loadMedicines(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting medicine:', error);
          this.snackBar.open('Error deleting medicine', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
