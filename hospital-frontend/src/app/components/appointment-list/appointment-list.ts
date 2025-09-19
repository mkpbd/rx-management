import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { DoctorService } from '../../services/doctor.service';
import { Appointment, AppointmentFilter } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { Doctor } from '../../models/doctor.model';
import { EmailDialogComponent } from '../email-dialog/email-dialog.component';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.scss']
})
export class AppointmentListComponent {
  displayedColumns: string[] = ['id', 'appointmentDate', 'patientName', 'doctorName', 'status', 'actions'];
  appointments: Appointment[] = [];
  dataSource = new MatTableDataSource<Appointment>([]);
  totalCount = 0;
  pageSize = 10;
  currentPage = 0;
  isLoading = false;

  filterForm: FormGroup;
  statuses = ['All', 'Scheduled', 'Completed', 'Cancelled'];
  visitTypes = ['Consultation', 'Follow-up', 'Emergency', 'Regular Checkup'];
  doctors: Doctor[] = [];
  patients: Patient[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: ['All'],
      doctor: [''],
      dateFrom: [''],
      dateTo: ['']
    });

    this.initializeData();
  }

  private initializeData() {
    this.loadDropdownData();
    this.loadAppointments();
  }

  private loadDropdownData() {
    // Load doctors for dropdown
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.snackBar.open('Error loading doctors', 'Close', { duration: 3000 });
      }
    });

    // Load patients for reference
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.snackBar.open('Error loading patients', 'Close', { duration: 3000 });
      }
    });
  }

  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadAppointments();
  }

  onClearFilters() {
    this.filterForm.reset({
      search: '',
      status: 'All',
      doctor: '',
      dateFrom: '',
      dateTo: ''
    });
    this.onSearch();
  }

  clearFilters() {
    this.onClearFilters();
  }

  onFilterChange() {
    this.onSearch();
  }

  editAppointment(appointment: any) {
    this.onEditAppointment(appointment);
  }

  downloadPdf(appointment: any) {
    this.onDownloadPDF(appointment);
  }

  deleteAppointment(appointment: any) {
    this.onDeleteAppointment(appointment);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString();
  }

  private loadAppointments() {
    this.isLoading = true;

    const formValue = this.filterForm.value;
    const filter: AppointmentFilter = {
      pageNumber: this.currentPage + 1,
      pageSize: this.pageSize,
      searchTerm: formValue.search || '',
      doctorId: formValue.doctor || undefined,
      visitType: formValue.status !== 'All' ? formValue.status : undefined,
      fromDate: formValue.dateFrom ? new Date(formValue.dateFrom) : undefined,
      toDate: formValue.dateTo ? new Date(formValue.dateTo) : undefined
    };

    this.appointmentService.getAppointments(filter).subscribe({
      next: (result) => {
        this.appointments = result.data;
        this.dataSource.data = this.appointments;
        this.totalCount = result.totalCount;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.snackBar.open('Error loading appointments', 'Close', { duration: 3000 });
        this.isLoading = false;
        // Fallback to empty array
        this.appointments = [];
        this.dataSource.data = [];
        this.totalCount = 0;
      }
    });
  }

  onCreateAppointment() {
    this.router.navigate(['/appointments/create']);
  }

  onEditAppointment(appointment: Appointment) {
    this.router.navigate(['/appointments/edit', appointment.id]);
  }

  onViewAppointment(appointment: Appointment) {
    this.router.navigate(['/appointments/view', appointment.id]);
  }

  onDeleteAppointment(appointment: Appointment) {
    if (confirm(`Are you sure you want to delete the appointment for ${appointment.patientName}?`)) {
      this.appointmentService.deleteAppointment(appointment.id).subscribe({
        next: () => {
          this.snackBar.open('Appointment deleted successfully', 'Close', { duration: 3000 });
          this.loadAppointments(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting appointment:', error);
          this.snackBar.open('Error deleting appointment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onDownloadPDF(appointment: Appointment) {
    // Show loading state
    const snackBarRef = this.snackBar.open('Generating prescription PDF...', 'Cancel', {
      duration: 0, // Keep open until dismissed
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });

    // Use the appointment service to download PDF
    this.appointmentService.downloadPdf(appointment);

    // Dismiss loading after a short delay
    setTimeout(() => {
      snackBarRef.dismiss();
      this.snackBar.open('PDF download initiated!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }, 1000);

    // Handle cancel action
    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss();
      this.snackBar.open('PDF generation cancelled', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
  }

  onPreviewPDF(appointment: Appointment) {
    this.snackBar.open('PDF preview not available - use download instead', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onEmailPrescription(appointment: Appointment) {
    const dialogRef = this.dialog.open(EmailDialogComponent, {
      width: '600px',
      data: {
        appointmentId: appointment.id,
        patientName: appointment.patientName,
        doctorName: appointment.doctorName,
        appointmentDate: appointment.appointmentDate
      }
    });

    dialogRef.afterClosed().subscribe(emailRequest => {
      if (emailRequest) {
        this.sendPrescriptionEmail(appointment.id, emailRequest);
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

    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss();
      this.snackBar.open('Email sending cancelled', 'Close', {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    });
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
