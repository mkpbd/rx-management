import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { Appointment } from '../../models/appointment.model';
import { EmailDialogComponent } from '../email-dialog/email-dialog.component';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="appointment-detail-container">
      <div class="detail-header">
        <button
          mat-icon-button
          (click)="navigateBack()"
          class="back-button">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Appointment Details</h1>
      </div>

      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading appointment details...</p>
      </div>

      <div *ngIf="!isLoading && appointment" class="appointment-content">
        <div class="details-grid">
          <!-- Patient Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <div mat-card-avatar class="patient-avatar">
                <mat-icon>person</mat-icon>
              </div>
              <mat-card-title>Patient Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-item">
                <span class="label">Name:</span>
                <span class="value">{{ appointment.patientName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Patient ID:</span>
                <span class="value">#{{ appointment.patientId }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Doctor Information -->
          <mat-card class="info-card">
            <mat-card-header>
              <div mat-card-avatar class="doctor-avatar">
                <mat-icon>medical_services</mat-icon>
              </div>
              <mat-card-title>Doctor Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="info-item">
                <span class="label">Name:</span>
                <span class="value">{{ appointment.doctorName }}</span>
              </div>
              <div class="info-item">
                <span class="label">Doctor ID:</span>
                <span class="value">#{{ appointment.doctorId }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Appointment Information -->
          <mat-card class="info-card full-width">
            <mat-card-header>
              <div mat-card-avatar class="appointment-avatar">
                <mat-icon>calendar_today</mat-icon>
              </div>
              <mat-card-title>Appointment Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="appointment-details">
                <div class="info-item">
                  <span class="label">Appointment ID:</span>
                  <span class="value">#{{ appointment.id }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Date & Time:</span>
                  <span class="value">{{ formatDateTime(appointment.appointmentDate) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Visit Type:</span>
                  <span class="value">{{ appointment.visitType }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Status:</span>
                  <mat-chip [class]="getStatusClass(appointment.status)">{{ appointment.status }}</mat-chip>
                </div>
                <div class="info-item" *ngIf="appointment.notes">
                  <span class="label">Notes:</span>
                  <span class="value">{{ appointment.notes }}</span>
                </div>
                <div class="info-item" *ngIf="appointment.diagnosis">
                  <span class="label">Diagnosis:</span>
                  <span class="value">{{ appointment.diagnosis }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Prescription Details -->
          <mat-card class="info-card full-width" *ngIf="appointment.prescriptionDetails && appointment.prescriptionDetails.length > 0">
            <mat-card-header>
              <div mat-card-avatar class="prescription-avatar">
                <mat-icon>medication</mat-icon>
              </div>
              <mat-card-title>Prescription Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="appointment.prescriptionDetails" class="prescription-table">
                <ng-container matColumnDef="medicine">
                  <th mat-header-cell *matHeaderCellDef>Medicine</th>
                  <td mat-cell *matCellDef="let prescription">{{ prescription.medicineName }}</td>
                </ng-container>

                <ng-container matColumnDef="dosage">
                  <th mat-header-cell *matHeaderCellDef>Dosage</th>
                  <td mat-cell *matCellDef="let prescription">{{ prescription.dosage }}</td>
                </ng-container>

                <ng-container matColumnDef="frequency">
                  <th mat-header-cell *matHeaderCellDef>Frequency</th>
                  <td mat-cell *matCellDef="let prescription">{{ prescription.frequency || 'As needed' }}</td>
                </ng-container>

                <ng-container matColumnDef="duration">
                  <th mat-header-cell *matHeaderCellDef>Duration</th>
                  <td mat-cell *matCellDef="let prescription">{{ calculateDuration(prescription.startDate, prescription.endDate) }}</td>
                </ng-container>

                <ng-container matColumnDef="instructions">
                  <th mat-header-cell *matHeaderCellDef>Instructions</th>
                  <td mat-cell *matCellDef="let prescription">{{ prescription.instructions || 'No special instructions' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="prescriptionColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: prescriptionColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button
            mat-raised-button
            color="primary"
            (click)="editAppointment()">
            <mat-icon>edit</mat-icon>
            Edit Appointment
          </button>

          <button
            mat-raised-button
            color="accent"
            (click)="downloadPDF()">
            <mat-icon>picture_as_pdf</mat-icon>
            Download PDF
          </button>

          <button
            mat-raised-button
            (click)="sendEmail()">
            <mat-icon>email</mat-icon>
            Send Email
          </button>

          <button
            mat-button
            color="warn"
            (click)="deleteAppointment()">
            <mat-icon>delete</mat-icon>
            Delete
          </button>
        </div>
      </div>

      <div *ngIf="!isLoading && !appointment" class="error-container">
        <mat-icon class="error-icon">error_outline</mat-icon>
        <h2>Appointment Not Found</h2>
        <p>The requested appointment could not be found.</p>
        <div class="error-actions">
          <button mat-raised-button color="primary" (click)="navigateBack()">
            <mat-icon>arrow_back</mat-icon>
            Back to Appointments
          </button>
          <button mat-raised-button color="accent" (click)="retryLoad()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
          <button mat-raised-button color="warn" (click)="testApiCall()">
            <mat-icon>bug_report</mat-icon>
            Test API
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .appointment-detail-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }

    .detail-header h1 {
      margin: 0;
      color: #333;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .back-button {
      background: #f5f5f5;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .error-actions {
      display: flex;
      gap: 16px;
      margin-top: 24px;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .error-container h2 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .error-container p {
      margin: 0 0 24px 0;
      color: #666;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-bottom: 32px;
    }

    .info-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .info-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .patient-avatar {
      background: linear-gradient(135deg, #4caf50, #388e3c);
      color: white;
    }

    .doctor-avatar {
      background: linear-gradient(135deg, #ff9800, #f57c00);
      color: white;
    }

    .appointment-avatar {
      background: linear-gradient(135deg, #2196f3, #1976d2);
      color: white;
    }

    .prescription-avatar {
      background: linear-gradient(135deg, #9c27b0, #7b1fa2);
      color: white;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #eee;
    }

    .info-item:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
      flex: 0 0 auto;
      margin-right: 16px;
    }

    .value {
      color: #333;
      text-align: right;
      word-break: break-word;
    }

    .appointment-details {
      display: grid;
      gap: 8px;
    }

    .prescription-table {
      width: 100%;
      margin-top: 16px;
    }

    .status-scheduled {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-completed {
      background-color: #e8f5e8;
      color: #388e3c;
    }

    .status-cancelled {
      background-color: #ffebee;
      color: #f44336;
    }

    .action-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 140px;
    }

    @media screen and (max-width: 768px) {
      .appointment-detail-container {
        padding: 16px;
      }

      .details-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-buttons {
        flex-direction: column;
        align-items: center;
      }

      .action-buttons button {
        width: 100%;
        max-width: 300px;
      }

      .info-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .value {
        text-align: left;
      }
    }
  `]
})
export class AppointmentDetailComponent implements OnInit {
  appointment: Appointment | null = null;
  isLoading = true;
  prescriptionColumns = ['medicine', 'dosage', 'frequency', 'duration', 'instructions'];
  patientEmail: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('AppointmentDetailComponent initialized');
    console.log('Route snapshot:', this.route.snapshot);
    console.log('Route params:', this.route.snapshot.paramMap);

    const idParam = this.route.snapshot.paramMap.get('id');
    console.log('Appointment ID parameter:', idParam);

    const appointmentId = idParam ? Number(idParam) : NaN;
    console.log('Parsed appointment ID:', appointmentId);
    console.log('Is valid number:', !isNaN(appointmentId));

    if (appointmentId && !isNaN(appointmentId)) {
      console.log('Calling loadAppointment with ID:', appointmentId);
      this.loadAppointment(appointmentId);
    } else {
      console.error('Invalid appointment ID:', idParam);
      this.snackBar.open('Invalid appointment ID', 'Close', { duration: 3000 });
      this.isLoading = false;
    }
  }

  private loadAppointment(id: number) {
    console.log('Loading appointment with ID:', id);
    this.isLoading = true; // Make sure loading is set to true

    // Add a timeout to prevent indefinite loading
    const timeout = setTimeout(() => {
      if (this.isLoading) {
        console.warn('Appointment loading timeout');
        this.isLoading = false;
        this.snackBar.open('Request timeout. Please try again.', 'Close', { duration: 5000 });
        this.cdr.detectChanges(); // Trigger change detection
      }
    }, 10000); // 10 second timeout

    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment) => {
        clearTimeout(timeout); // Clear the timeout
        console.log('Received appointment data:', appointment);

        // Handle case where appointment might be null or undefined
        if (!appointment) {
          console.error('Received null or undefined appointment data');
          this.snackBar.open('No appointment data received', 'Close', { duration: 5000 });
          this.appointment = null;
          this.isLoading = false;
          this.cdr.detectChanges(); // Trigger change detection
          return;
        }

        try {
          // Create a new object to ensure we're not modifying the original
          const processedAppointment: Appointment = {
            ...appointment,
            appointmentDate: this.parseDate(appointment.appointmentDate),
            createdAt: appointment.createdAt ? this.parseDate(appointment.createdAt) : undefined,
            updatedAt: appointment.updatedAt ? this.parseDate(appointment.updatedAt) : undefined
          };

          // Ensure prescription detail dates are properly parsed
          if (processedAppointment.prescriptionDetails && Array.isArray(processedAppointment.prescriptionDetails)) {
            processedAppointment.prescriptionDetails = processedAppointment.prescriptionDetails.map(prescription => ({
              ...prescription,
              startDate: this.parseDate(prescription.startDate),
              endDate: this.parseDate(prescription.endDate),
              createdAt: prescription.createdAt ? this.parseDate(prescription.createdAt) : new Date(),
              updatedAt: prescription.updatedAt ? this.parseDate(prescription.updatedAt) : undefined
            }));
          }

          this.appointment = processedAppointment;

          // Load patient email
          this.loadPatientEmail(processedAppointment.patientId);

          this.isLoading = false;
          console.log('Appointment loaded successfully:', this.appointment);
          this.cdr.detectChanges(); // Trigger change detection
        } catch (error) {
          console.error('Error processing appointment data:', error);
          this.snackBar.open('Error processing appointment data', 'Close', { duration: 5000 });
          this.appointment = null;
          this.isLoading = false;
          this.cdr.detectChanges(); // Trigger change detection
        }
      },
      error: (error) => {
        clearTimeout(timeout); // Clear the timeout
        console.error('Error loading appointment:', error);
        // Check if it's a 404 error (not found)
        if (error.status === 404) {
          this.snackBar.open('Appointment not found', 'Close', { duration: 5000 });
        } else if (error.status === 0) {
          this.snackBar.open('Unable to connect to server. Please check if the backend is running.', 'Close', { duration: 5000 });
        } else {
          this.snackBar.open('Error loading appointment details: ' + (error.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
        this.appointment = null;
        this.isLoading = false;
        this.cdr.detectChanges(); // Trigger change detection
      }
    });
  }

  private loadPatientEmail(patientId: number) {
    this.patientService.getPatient(patientId).subscribe({
      next: (patient) => {
        this.patientEmail = patient.email;
        console.log('Patient email loaded:', this.patientEmail);
        this.cdr.detectChanges(); // Trigger change detection
      },
      error: (error) => {
        console.error('Error loading patient email:', error);
        this.patientEmail = '';
        this.cdr.detectChanges(); // Trigger change detection
      }
    });
  }

  private parseDate(dateValue: string | Date): Date {
    if (dateValue instanceof Date) {
      return dateValue;
    }

    if (typeof dateValue === 'string') {
      // Handle different date string formats
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    // Fallback to current date if parsing fails
    return new Date();
  }

  navigateBack() {
    this.router.navigate(['/appointments']);
  }

  editAppointment() {
    if (this.appointment) {
      this.router.navigate(['/appointments/edit', this.appointment.id]);
    }
  }

  downloadPDF() {
    if (this.appointment) {
      this.appointmentService.downloadPdf(this.appointment);
    }
  }

  sendEmail() {
    if (!this.appointment) return;

    const dialogRef = this.dialog.open(EmailDialogComponent, {
      width: '600px',
      data: {
        appointmentId: this.appointment.id,
        patientName: this.appointment.patientName,
        doctorName: this.appointment.doctorName,
        appointmentDate: this.appointment.appointmentDate,
        patientEmail: this.patientEmail // Pass patient email to dialog
      }
    });

    dialogRef.afterClosed().subscribe(emailRequest => {
      if (emailRequest && this.appointment) {
        this.sendPrescriptionEmail(this.appointment.id, emailRequest);
      }
    });
  }

  private sendPrescriptionEmail(appointmentId: number, emailRequest: { toEmail: string; toName?: string }) {
    const snackBarRef = this.snackBar.open('Sending prescription email...', 'Cancel', {
      duration: 0,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

    this.appointmentService.sendPrescriptionEmail(appointmentId, emailRequest).subscribe({
      next: (response) => {
        snackBarRef.dismiss();
        this.snackBar.open(`Prescription email sent successfully to ${emailRequest.toEmail}!`, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        snackBarRef.dismiss();
        console.error('Email sending failed:', error);

        // Provide more detailed error message
        let errorMessage = 'Failed to send prescription email. Please try again later.';
        if (error.status === 500) {
          errorMessage = 'Server error occurred while sending email. Please check server logs for details.';
        } else if (error.status === 400) {
          errorMessage = 'Invalid email request. Please check the email address and try again.';
        } else if (error.status === 404) {
          errorMessage = 'Appointment not found.';
        }

        this.snackBar.open(errorMessage, 'Close', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }

  deleteAppointment() {
    if (!this.appointment) return;

    if (confirm(`Are you sure you want to delete the appointment for ${this.appointment.patientName}?`)) {
      this.appointmentService.deleteAppointment(this.appointment.id).subscribe({
        next: () => {
          this.snackBar.open('Appointment deleted successfully', 'Close', { duration: 3000 });
          this.navigateBack();
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
          this.snackBar.open('Error deleting appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  retryLoad() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const appointmentId = idParam ? Number(idParam) : NaN;

    if (appointmentId && !isNaN(appointmentId)) {
      this.loadAppointment(appointmentId);
    }
  }

  testApiCall() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const appointmentId = idParam ? Number(idParam) : 1; // Default to 1 for testing

    console.log('Testing API call with ID:', appointmentId);

    // Direct fetch test
    fetch(`http://localhost:5037/api/appointments/${appointmentId}`)
      .then(response => {
        console.log('Fetch response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Fetch response data:', data);
      })
      .catch(error => {
        console.error('Fetch error:', error);
      });
  }

  formatDateTime(dateString: string | Date): string {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

      // Check if date is valid
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  calculateDuration(startDate: Date, endDate: Date): string {
    try {
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

      // Check if dates are valid
      if (!(start instanceof Date) || isNaN(start.getTime()) ||
          !(end instanceof Date) || isNaN(end.getTime())) {
        return 'Invalid Duration';
      }

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 'Invalid Duration';
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  }
}
