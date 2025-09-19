import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import prescription detail component
import { PrescriptionDetailComponent, PrescriptionDetail } from '../prescription-detail/prescription-detail';

// Angular Material imports (following memory requirement for proper imports)
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
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { DoctorService } from '../../services/doctor.service';
import { Appointment, CreateAppointment, UpdateAppointment } from '../../models/appointment.model';
import { CreatePrescriptionDetail, UpdatePrescriptionDetail } from '../../models/prescription-detail.model';
import { Patient } from '../../models/patient.model';
import { Doctor } from '../../models/doctor.model';


@Component({
  selector: 'app-appointment-form',
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
    PrescriptionDetailComponent
  ],
  templateUrl: './appointment-form.html',
  styleUrls: ['./appointment-form.scss']
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  appointmentId: number | null = null;

  // Initialize dropdown data (following memory requirement for explicit initialization)
  patients: Patient[] = [];
  doctors: Doctor[] = [];
  prescriptionDetails: PrescriptionDetail[] = [];
  appointmentStatuses = [
    { value: 'Scheduled', label: 'Scheduled' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'In Progress', label: 'In Progress' }
  ];

  visitypes = [
    { value: 'Annual', label: 'Annual' },
    { value: 'Follow up', label: 'Follow up' },
    { value: 'Checkup', label: 'Checkup' },
    { value: 'Consultation', label: 'Consultation' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private doctorService: DoctorService
  ) {
    // Initialize reactive form with validation
    this.appointmentForm = this.fb.group({
      patientId: ['', [Validators.required]],
      doctorId: ['', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      appointmentTime: ['', [Validators.required]],
      status: ['Scheduled', [Validators.required]],
      visit: ['Follow up', [Validators.required]],
      notes: ['', [Validators.maxLength(500)]],
      // reason: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    // Check if we're in edit mode
    this.appointmentId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEditMode = !!this.appointmentId;

    // Load dropdown data
    this.loadDropdownData();

    // Load appointment data if in edit mode
    if (this.isEditMode) {
      this.loadAppointmentData();
    }
  }

  private loadDropdownData(): void {
    // Load patients
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.snackBar.open('Error loading patients', 'Close', { duration: 3000 });
      }
    });

    // Load doctors
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.snackBar.open('Error loading doctors', 'Close', { duration: 3000 });
      }
    });
  }

  private loadAppointmentData(): void {
    if (this.appointmentId) {
      this.isLoading = true;

      this.appointmentService.getAppointment(this.appointmentId).subscribe({
        next: (appointment) => {
          // Convert date string to Date object for form
          const appointmentDate = new Date(appointment.appointmentDate);

          // Extract time portion for the time input (format: HH:MM)
          const hours = appointmentDate.getHours().toString().padStart(2, '0');
          const minutes = appointmentDate.getMinutes().toString().padStart(2, '0');
          const appointmentTime = `${hours}:${minutes}`;

          const appointmentData = {
            ...appointment,
            appointmentDate: appointmentDate,
            appointmentTime: appointmentTime
          };

          this.appointmentForm.patchValue(appointmentData);
          // Map appointment prescriptionDetails to component format
          this.prescriptionDetails = appointment.prescriptionDetails?.map(pd => ({
            id: pd.id,
            medicineId: pd.medicineId,
            medicineName: pd.medicineName,
            dosage: pd.dosage,
            frequency: pd.frequency || '',
            duration: this.calculateDuration(pd.startDate, pd.endDate),
            quantity: 1, // Default quantity since not in model
            instructions: pd.instructions || ''
          })) || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading appointment:', error);
          this.snackBar.open('Error loading appointment data', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.router.navigate(['/appointments']); // Navigate back on error
        }
      });
    }
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isLoading = true;

      const formValue = this.appointmentForm.value;

      // Combine date and time
      const combinedDateTime = this.combineDateAndTime(formValue.appointmentDate, formValue.appointmentTime);

      if (this.isEditMode && this.appointmentId) {
        // Update existing appointment
        const updateData: UpdateAppointment = {
          patientId: formValue.patientId,
          doctorId: formValue.doctorId,
          appointmentDate: combinedDateTime,
          visitType: formValue.visit,
          notes: formValue.notes,
          status: formValue.status,

          prescriptionDetails: this.prescriptionDetails.map(pd => ({
            medicineId: pd.medicineId,
            dosage: pd.dosage,
            frequency: pd.frequency,
            startDate: new Date(),
            endDate: this.calculateEndDate(pd.duration),
            instructions: pd.instructions
          } as UpdatePrescriptionDetail))
        };

        this.appointmentService.updateAppointment(this.appointmentId, updateData).subscribe({
          next: (appointment) => {
            this.isLoading = false;
            this.snackBar.open('Appointment updated successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/appointments']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error updating appointment:', error);
            this.snackBar.open('Error updating appointment', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new appointment
        const createData: CreateAppointment = {
          patientId: formValue.patientId,
          doctorId: formValue.doctorId,
          appointmentDate: combinedDateTime,
          visitType: formValue.visit,
          notes: formValue.notes,
          status: formValue.status,
          prescriptionDetails: this.prescriptionDetails.map(pd => ({
            medicineId: pd.medicineId,
            dosage: pd.dosage,
            frequency: pd.frequency,
            startDate: new Date(),
            endDate: this.calculateEndDate(pd.duration),
            instructions: pd.instructions
          } as CreatePrescriptionDetail))
        };

        this.appointmentService.createAppointment(createData).subscribe({
          next: (appointment) => {
            this.isLoading = false;
            this.snackBar.open('Appointment created successfully!', 'Close', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.router.navigate(['/appointments']);
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error creating appointment:', error);
            this.snackBar.open('Error creating appointment', 'Close', { duration: 3000 });
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
    this.router.navigate(['/appointments']);
  }

  onReset(): void {
    this.appointmentForm.reset({
      status: 'Scheduled'
    });
    this.prescriptionDetails = [];
  }

  onPrescriptionChanged(prescriptions: PrescriptionDetail[]): void {
    this.prescriptionDetails = prescriptions;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.appointmentForm.controls).forEach(key => {
      const control = this.appointmentForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form validation
  get patientId() { return this.appointmentForm.get('patientId'); }
  get doctorId() { return this.appointmentForm.get('doctorId'); }
  get appointmentDate() { return this.appointmentForm.get('appointmentDate'); }
  get appointmentTime() { return this.appointmentForm.get('appointmentTime'); }
  get status() { return this.appointmentForm.get('status'); }
  get visit() { return this.appointmentForm.get('visit'); }
  get notes() { return this.appointmentForm.get('notes'); }

  // Helper methods for template
  getPatientDisplayName(patient: Patient): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  getDoctorDisplayName(doctor: Doctor): string {
    return `${doctor.firstName} ${doctor.lastName} - ${doctor.specialization}`;
  }

  getAppointmentDataForPDF(): any {
    const formValue = this.appointmentForm.value;
    const selectedPatient = this.patients.find(p => p.id === formValue.patientId);
    const selectedDoctor = this.doctors.find(d => d.id === formValue.doctorId);

    // Combine date and time for PDF display
    const combinedDateTime = this.combineDateAndTime(formValue.appointmentDate, formValue.appointmentTime);

    return {
      patientName: selectedPatient ? this.getPatientDisplayName(selectedPatient) : 'Unknown Patient',
      doctorName: selectedDoctor ? this.getDoctorDisplayName(selectedDoctor) : 'Unknown Doctor',
      appointmentDate: combinedDateTime,
      appointmentTime: formValue.appointmentTime,
      notes: formValue.notes
    };
  }

  private calculateDuration(startDate: Date, endDate: Date): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  private calculateEndDate(duration: string): Date {
    const days = parseInt(duration.match(/\d+/)?.[0] || '7');
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    return endDate;
  }

  // Helper method to combine date and time
  private combineDateAndTime(date: Date, time: string): Date {
    if (!date || !time) {
      return date || new Date();
    }

    const [hours, minutes] = time.split(':').map(Number);
    const combinedDate = new Date(date);
    combinedDate.setHours(hours || 0);
    combinedDate.setMinutes(minutes || 0);
    combinedDate.setSeconds(0);
    combinedDate.setMilliseconds(0);

    return combinedDate;
  }
}
