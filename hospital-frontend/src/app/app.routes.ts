import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form';
import { AppointmentDetailComponent } from './components/appointment-detail/appointment-detail.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';
import { DoctorListComponent } from './components/doctor-list/doctor-list.component';
import { MedicineListComponent } from './components/medicine-list/medicine-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },

  // Appointments
  { path: 'appointments', component: AppointmentListComponent },
  { path: 'appointments/create', component: AppointmentFormComponent },
  { path: 'appointments/view/:id', component: AppointmentDetailComponent },
  { path: 'appointments/edit/:id', component: AppointmentFormComponent },

  // Patients
  { path: 'patients', component: PatientListComponent },
  { path: 'patients/create', component: PatientFormComponent },
  { path: 'patients/view/:id', component: PatientListComponent }, // TODO: Create PatientDetailComponent
  { path: 'patients/edit/:id', component: PatientFormComponent },

  // Doctors
  { path: 'doctors', component: DoctorListComponent },
  { path: 'doctors/create', component: DoctorListComponent }, // TODO: Create DoctorFormComponent
  { path: 'doctors/view/:id', component: DoctorListComponent }, // TODO: Create DoctorDetailComponent
  { path: 'doctors/edit/:id', component: DoctorListComponent }, // TODO: Create DoctorFormComponent
  { path: 'doctors/schedule/:id', component: DoctorListComponent }, // TODO: Create DoctorScheduleComponent

  // Medicines
  { path: 'medicines', component: MedicineListComponent },
  { path: 'medicines/create', component: MedicineListComponent }, // TODO: Create MedicineFormComponent
  { path: 'medicines/view/:id', component: MedicineListComponent }, // TODO: Create MedicineDetailComponent
  { path: 'medicines/edit/:id', component: MedicineListComponent }, // TODO: Create MedicineFormComponent

  { path: '**', redirectTo: '/dashboard' }
];
