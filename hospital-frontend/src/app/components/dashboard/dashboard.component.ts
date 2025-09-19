import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PatientService } from '../../services/patient.service';
import { DoctorService } from '../../services/doctor.service';
import { MedicineService } from '../../services/medicine.service';
import { AppointmentService } from '../../services/appointment.service';
import { AppointmentFilter } from '../../models/appointment.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Hospital Management Dashboard</h1>
        <p>Welcome to the RX Hospital Management System</p>
      </div>

      <div class="stats-grid" *ngIf="!isLoading && !hasConnectionError">
        <mat-card class="stat-card patients-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalPatients }}</h3>
                <p>Total Patients</p>
              </div>
            </div>
            <button mat-button color="primary" class="stat-action" (click)="navigateToPatients()">
              <mat-icon>visibility</mat-icon>
              View All
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card doctors-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>medical_services</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalDoctors }}</h3>
                <p>Total Doctors</p>
              </div>
            </div>
            <button mat-button color="primary" class="stat-action" (click)="navigateToDoctors()">
              <mat-icon>visibility</mat-icon>
              View All
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card appointments-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>calendar_today</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalAppointments }}</h3>
                <p>Total Appointments</p>
              </div>
            </div>
            <button
              mat-button
              color="primary"
              class="stat-action"
              (click)="navigateToAppointments()">
              <mat-icon>visibility</mat-icon>
              View All
            </button>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card medicines-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-icon">
                <mat-icon>medication</mat-icon>
              </div>
              <div class="stat-info">
                <h3>{{ totalMedicines }}</h3>
                <p>Available Medicines</p>
              </div>
            </div>
            <button mat-button color="primary" class="stat-action" (click)="navigateToMedicines()">
              <mat-icon>visibility</mat-icon>
              View All
            </button>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading dashboard data...</p>
        <p class="loading-hint">Please wait while we fetch the latest information</p>
      </div>

      <div class="error-container" *ngIf="hasConnectionError && !isLoading">
        <mat-icon class="error-icon">wifi_off</mat-icon>
        <h2>Connection Error</h2>
        <p>Unable to load dashboard data. Please check your connection.</p>
        <button mat-raised-button color="primary" (click)="retryLoading()" [disabled]="retryCount >= maxRetries">
          <mat-icon>refresh</mat-icon>
          {{ retryCount >= maxRetries ? 'Max Retries Reached' : 'Retry' }}
        </button>
        <p class="retry-info" *ngIf="retryCount > 0">Retry attempt: {{retryCount}}/{{maxRetries}}</p>
      </div>

      <div class="quick-actions" *ngIf="!isLoading && !hasConnectionError">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <button
            mat-raised-button
            color="primary"
            class="action-button"
            (click)="navigateToCreateAppointment()">
            <mat-icon>add</mat-icon>
            New Appointment
          </button>

          <button
            mat-raised-button
            color="accent"
            class="action-button"
            (click)="navigateToAppointments()">
            <mat-icon>calendar_today</mat-icon>
            View Appointments
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;
      text-align: center;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      color: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(25, 118, 210, 0.3);
    }

    .dashboard-header h1 {
      margin: 0 0 8px 0;
      color: white;
      font-size: 2.5rem;
      font-weight: 600;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .dashboard-header p {
      margin: 0;
      color: rgba(255,255,255,0.9);
      font-size: 1.2rem;
      font-weight: 300;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .stat-card {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
    }

    .stat-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1976d2, #1565c0);
    }

    .stat-icon mat-icon {
      color: white;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .patients-card .stat-icon {
      background: linear-gradient(135deg, #4caf50, #388e3c);
    }

    .doctors-card .stat-icon {
      background: linear-gradient(135deg, #ff9800, #f57c00);
    }

    .appointments-card .stat-icon {
      background: linear-gradient(135deg, #2196f3, #1976d2);
    }

    .medicines-card .stat-icon {
      background: linear-gradient(135deg, #9c27b0, #7b1fa2);
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2rem;
      font-weight: 600;
      color: #333;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 0.95rem;
    }

    .stat-action {
      width: 100%;
      margin-top: 16px;
      border-radius: 8px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.2s ease;
    }

    .stat-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      color: #666;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      border-radius: 16px;
      margin: 32px 0;
    }

    .loading-container p {
      margin-top: 20px;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .loading-container mat-spinner {
      color: #1976d2;
    }

    .loading-hint {
      font-size: 0.9rem;
      color: #888;
      margin-top: 8px;
    }

    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      color: #d32f2f;
      background: linear-gradient(135deg, #ffebee, #ffcdd2);
      border-radius: 16px;
      margin: 32px 0;
      border: 2px solid #f8bbd9;
    }

    .error-container .error-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #d32f2f;
    }

    .error-container h2 {
      margin: 0 0 16px 0;
      color: #d32f2f;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .error-container p {
      margin: 8px 0;
      color: #666;
      font-size: 1rem;
      text-align: center;
    }

    .error-container button {
      margin-top: 20px;
      min-width: 120px;
    }

    .retry-info {
      font-size: 0.85rem;
      color: #888;
      margin-top: 8px;
    }

    .quick-actions {
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 32px;
      border-radius: 16px;
      margin-top: 32px;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .quick-actions h2 {
      margin: 0 0 32px 0;
      color: #333;
      font-size: 1.8rem;
      font-weight: 600;
      position: relative;
    }

    .quick-actions h2::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(135deg, #1976d2, #1565c0);
      border-radius: 2px;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-button {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 32px;
      font-size: 1.1rem;
      font-weight: 500;
      border-radius: 12px;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      min-width: 200px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .action-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .action-button mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media screen and (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .dashboard-header h1 {
        font-size: 1.5rem;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }

      .action-button {
        width: 100%;
        max-width: 320px;
        justify-content: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .dashboard-header {
        padding: 24px 16px;
      }

      .dashboard-header h1 {
        font-size: 2rem;
      }

      .quick-actions {
        padding: 24px 16px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  totalPatients = 0;
  totalDoctors = 0;
  totalAppointments = 0;
  totalMedicines = 0;
  isLoading = true;
  hasConnectionError = false;
  retryCount = 0;
  readonly maxRetries = 3;

  constructor(
    private router: Router,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private medicineService: MedicineService,
    private appointmentService: AppointmentService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  retryLoading() {
    this.hasConnectionError = false;
    this.retryCount++;
    console.log(`Retrying dashboard data loading (attempt ${this.retryCount})`);
    this.loadDashboardData();
  }

  // Simple connectivity test
  private testApiConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      // Test with a simple GET request to the API base
      fetch('http://localhost:5037/api/patients')
        .then(response => {
          console.log('API connectivity test:', response.status);
          resolve(response.ok);
        })
        .catch(error => {
          console.error('API connectivity test failed:', error);
          resolve(false);
        });
    });
  }

  private loadDashboardData() {
    this.isLoading = true;
    this.hasConnectionError = false;
    console.log('Loading dashboard data...');

    // Test API connectivity first
    this.testApiConnection().then(isConnected => {
      if (!isConnected) {
        console.warn('API connectivity test failed');
        this.isLoading = false;
        this.hasConnectionError = true;
        return;
      }

      // Set a timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        if (this.isLoading) {
          console.warn('Dashboard loading timeout - showing connection error');
          this.isLoading = false;
          this.hasConnectionError = true;
        }
      }, 15000); // 15 second timeout

      // Load all data in parallel with individual error handling
      const loadPromises = [
        this.loadPatients().catch(err => { console.error('Patients failed:', err); return Promise.resolve(); }),
        this.loadDoctors().catch(err => { console.error('Doctors failed:', err); return Promise.resolve(); }),
        this.loadMedicines().catch(err => { console.error('Medicines failed:', err); return Promise.resolve(); }),
        this.loadAppointments().catch(err => { console.error('Appointments failed:', err); return Promise.resolve(); })
      ];

      Promise.all(loadPromises).then(() => {
        clearTimeout(loadingTimeout);
        this.isLoading = false;
        this.hasConnectionError = false;
        console.log('Dashboard data loaded successfully');
        console.log(`Stats: Patients=${this.totalPatients}, Doctors=${this.totalDoctors}, Medicines=${this.totalMedicines}, Appointments=${this.totalAppointments}`);
      }).catch((error) => {
        clearTimeout(loadingTimeout);
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        this.hasConnectionError = true;
      });
    });
  }

  private loadPatients(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Loading patients...');
      const timeoutId = setTimeout(() => {
        console.warn('Patients loading timeout');
        this.totalPatients = 0;
        resolve();
      }, 5000);

      this.patientService.getPatients().subscribe({
        next: (patients) => {
          clearTimeout(timeoutId);
          this.totalPatients = patients.length;
          console.log(`Loaded ${patients.length} patients`);
          resolve();
        },
        error: (error) => {
          clearTimeout(timeoutId);
          console.error('Error loading patients:', error);
          this.totalPatients = 0;
          resolve();
        }
      });
    });
  }

  private loadDoctors(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Loading doctors...');
      const timeoutId = setTimeout(() => {
        console.warn('Doctors loading timeout');
        this.totalDoctors = 0;
        resolve();
      }, 5000);

      this.doctorService.getDoctors().subscribe({
        next: (doctors) => {
          clearTimeout(timeoutId);
          this.totalDoctors = doctors.length;
          console.log(`Loaded ${doctors.length} doctors`);
          resolve();
        },
        error: (error) => {
          clearTimeout(timeoutId);
          console.error('Error loading doctors:', error);
          this.totalDoctors = 0;
          resolve();
        }
      });
    });
  }

  private loadMedicines(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Loading medicines...');
      const timeoutId = setTimeout(() => {
        console.warn('Medicines loading timeout');
        this.totalMedicines = 0;
        resolve();
      }, 5000);

      this.medicineService.getMedicines().subscribe({
        next: (medicines) => {
          clearTimeout(timeoutId);
          this.totalMedicines = medicines.length;
          console.log(`Loaded ${medicines.length} medicines`);
          resolve();
        },
        error: (error) => {
          clearTimeout(timeoutId);
          console.error('Error loading medicines:', error);
          this.totalMedicines = 0;
          resolve();
        }
      });
    });
  }

  private loadAppointments(): Promise<void> {
    return new Promise((resolve) => {
      console.log('Loading appointments...');
      const timeoutId = setTimeout(() => {
        console.warn('Appointments loading timeout');
        this.totalAppointments = 0;
        resolve();
      }, 5000);

      const filter: AppointmentFilter = {
        pageNumber: 1,
        pageSize: 1000 // Get all appointments for count
      };

      this.appointmentService.getAppointments(filter).subscribe({
        next: (result) => {
          clearTimeout(timeoutId);
          this.totalAppointments = result.totalCount;
          console.log(`Loaded ${result.totalCount} appointments`);
          resolve();
        },
        error: (error) => {
          clearTimeout(timeoutId);
          console.error('Error loading appointments:', error);
          this.totalAppointments = 0;
          resolve();
        }
      });
    });
  }

  navigateToCreateAppointment() {
    this.router.navigate(['/appointments/create']);
  }

  navigateToAppointments() {
    this.router.navigate(['/appointments']);
  }

  navigateToPatients() {
    this.router.navigate(['/patients']);
  }

  navigateToDoctors() {
    this.router.navigate(['/doctors']);
  }

  navigateToMedicines() {
    this.router.navigate(['/medicines']);
  }
}
