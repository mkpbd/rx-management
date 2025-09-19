import { Component, OnInit } from '@angular/core';
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
    <div class=\"appointment-detail-container\">
      <div class=\"detail-header\">
        <button
          mat-icon-button
          (click)=\"navigateBack()\"
          class=\"back-button\">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>Appointment Details</h1>
      </div>

      <div *ngIf=\"isLoading\" class=\"loading-container\">
        <mat-spinner diameter=\"50\"></mat-spinner>
        <p>Loading appointment details...</p>
      </div>

      <div *ngIf=\"!isLoading && appointment\" class=\"appointment-content\">
        <div class=\"details-grid\">
          <!-- Patient Information -->
          <mat-card class=\"info-card\">
            <mat-card-header>
              <div mat-card-avatar class=\"patient-avatar\">
                <mat-icon>person</mat-icon>
              </div>
              <mat-card-title>Patient Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class=\"info-item\">
                <span class=\"label\">Name:</span>
                <span class=\"value\">{{ appointment.patientName }}</span>
              </div>
              <div class=\"info-item\">
                <span class=\"label\">Patient ID:</span>
                <span class=\"value\">#{{ appointment.patientId }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Doctor Information -->
          <mat-card class=\"info-card\">
            <mat-card-header>
              <div mat-card-avatar class=\"doctor-avatar\">
                <mat-icon>medical_services</mat-icon>
              </div>
              <mat-card-title>Doctor Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class=\"info-item\">
                <span class=\"label\">Name:</span>
                <span class=\"value\">{{ appointment.doctorName }}</span>
              </div>
              <div class=\"info-item\">
                <span class=\"label\">Doctor ID:</span>
                <span class=\"value\">#{{ appointment.doctorId }}</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Appointment Information -->
          <mat-card class=\"info-card full-width\">
            <mat-card-header>
              <div mat-card-avatar class=\"appointment-avatar\">
                <mat-icon>calendar_today</mat-icon>
              </div>
              <mat-card-title>Appointment Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class=\"appointment-details\">
                <div class=\"info-item\">
                  <span class=\"label\">Appointment ID:</span>
                  <span class=\"value\">#{{ appointment.id }}</span>
                </div>
                <div class=\"info-item\">
                  <span class=\"label\">Date & Time:</span>
                  <span class=\"value\">{{ formatDateTime(appointment.appointmentDate) }}</span>
                </div>
                <div class=\"info-item\">
                  <span class=\"label\">Visit Type:</span>
                  <span class=\"value\">{{ appointment.visitType }}</span>
                </div>
                <div class=\"info-item\">
                  <span class=\"label\">Status:</span>
                  <mat-chip [class]=\"getStatusClass(appointment.status)\">{{ appointment.status }}</mat-chip>
                </div>
                <div class=\"info-item\" *ngIf=\"appointment.notes\">
                  <span class=\"label\">Notes:</span>
                  <span class=\"value\">{{ appointment.notes }}</span>
                </div>
                <div class=\"info-item\" *ngIf=\"appointment.diagnosis\">
                  <span class=\"label\">Diagnosis:</span>
                  <span class=\"value\">{{ appointment.diagnosis }}</span>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Prescription Details -->
          <mat-card class=\"info-card full-width\" *ngIf=\"appointment.prescriptionDetails && appointment.prescriptionDetails.length > 0\">
            <mat-card-header>
              <div mat-card-avatar class=\"prescription-avatar\">
                <mat-icon>medication</mat-icon>
              </div>
              <mat-card-title>Prescription Details</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]=\"appointment.prescriptionDetails\" class=\"prescription-table\">
                <ng-container matColumnDef=\"medicine\">
                  <th mat-header-cell *matHeaderCellDef>Medicine</th>
                  <td mat-cell *matCellDef=\"let prescription\">{{ prescription.medicineName }}</td>
                </ng-container>

                <ng-container matColumnDef=\"dosage\">
                  <th mat-header-cell *matHeaderCellDef>Dosage</th>
                  <td mat-cell *matCellDef=\"let prescription\">{{ prescription.dosage }}</td>
                </ng-container>

                <ng-container matColumnDef=\"frequency\">
                  <th mat-header-cell *matHeaderCellDef>Frequency</th>
                  <td mat-cell *matCellDef=\"let prescription\">{{ prescription.frequency || 'As needed' }}</td>
                </ng-container>

                <ng-container matColumnDef=\"duration\">
                  <th mat-header-cell *matHeaderCellDef>Duration</th>
                  <td mat-cell *matCellDef=\"let prescription\">{{ calculateDuration(prescription.startDate, prescription.endDate) }}</td>
                </ng-container>

                <ng-container matColumnDef=\"instructions\">
                  <th mat-header-cell *matHeaderCellDef>Instructions</th>
                  <td mat-cell *matCellDef=\"let prescription\">{{ prescription.instructions || 'No special instructions' }}</td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef=\"prescriptionColumns\"></tr>
                <tr mat-row *matRowDef=\"let row; columns: prescriptionColumns;\"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Action Buttons -->
        <div class=\"action-buttons\">
          <button
            mat-raised-button
            color=\"primary\"
            (click)=\"editAppointment()\">
            <mat-icon>edit</mat-icon>
            Edit Appointment
          </button>

          <button
            mat-raised-button
            color=\"accent\"
            (click)=\"downloadPDF()\">
            <mat-icon>picture_as_pdf</mat-icon>
            Download PDF
          </button>

          <button
            mat-raised-button
            (click)=\"sendEmail()\">
            <mat-icon>email</mat-icon>
            Send Email
          </button>

          <button
            mat-button
            color=\"warn\"
            (click)=\"deleteAppointment()\">
            <mat-icon>delete</mat-icon>
            Delete
          </button>
        </div>
      </div>

      <div *ngIf=\"!isLoading && !appointment\" class=\"error-container\">
        <mat-icon class=\"error-icon\">error_outline</mat-icon>
        <h2>Appointment Not Found</h2>
        <p>The requested appointment could not be found.</p>
        <button mat-raised-button color=\"primary\" (click)=\"navigateBack()\">
          <mat-icon>arrow_back</mat-icon>
          Back to Appointments
        </button>
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const appointmentId = Number(this.route.snapshot.paramMap.get('id'));
    if (appointmentId) {
      this.loadAppointment(appointmentId);
    } else {
      this.isLoading = false;
    }
  }

  private loadAppointment(id: number) {
    this.appointmentService.getAppointment(id).subscribe({
      next: (appointment) => {
        this.appointment = appointment;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointment:', error);
        this.snackBar.open('Error loading appointment details', 'Close', { duration: 3000 });
        this.appointment = null;
        this.isLoading = false;
      }
    });
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
        appointmentDate: this.appointment.appointmentDate
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
        this.snackBar.open('Failed to send prescription email. Please try again later.', 'Close', {
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

  formatDateTime(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateDuration(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
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
