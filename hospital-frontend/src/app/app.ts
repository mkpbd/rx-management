import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavigationComponent } from './components/navigation/navigation.component';
import { PatientService } from './services/patient.service';
import { DoctorService } from './services/doctor.service';
import { MedicineService } from './services/medicine.service';
import { Patient } from './models/patient.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('hospital-frontend');

  patients: Patient[] = [];
  totalPatients = 0;
  totalDoctors = 0;
  totalMedicines = 0;

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private medicineService: MedicineService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
    // Load patients
    this.patientService.getPatients().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.totalPatients = patients.length;
      },
      error: (error) => {
        console.error('Error loading patients:', error);
      }
    });

    // Load doctors
    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.totalDoctors = doctors.length;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
      }
    });

    // Load medicines
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.totalMedicines = medicines.length;
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
      }
    });
  }
}
