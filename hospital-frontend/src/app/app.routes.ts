import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AppointmentListComponent } from './components/appointment-list/appointment-list';
import { AppointmentFormComponent } from './components/appointment-form/appointment-form';
import { AppointmentDetailComponent } from './components/appointment-detail/appointment-detail.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientFormComponent } from './components/patient-form/patient-form.component';
import { DoctorListComponent } from './components/doctor-list/doctor-list.component';
import { DoctorFormComponent } from './components/doctor-form/doctor-form.component';
import { MedicineListComponent } from './components/medicine-list/medicine-list.component';
import { MedicineFormComponent } from './components/medicine-form/medicine-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, data: { reuseRoute: false } },

  // Appointments
  { path: 'appointments', component: AppointmentListComponent, data: { reuseRoute: false } },
  { path: 'appointments/create', component: AppointmentFormComponent },
  { path: 'appointments/view/:id', component: AppointmentDetailComponent },
  { path: 'appointments/edit/:id', component: AppointmentFormComponent },

  // Patients
  { path: 'patients', component: PatientListComponent, data: { reuseRoute: false } },
  { path: 'patients/create', component: PatientFormComponent },
  { path: 'patients/view/:id', component: PatientListComponent }, // TODO: Create PatientDetailComponent
  { path: 'patients/edit/:id', component: PatientFormComponent },

  // Doctors
  { path: 'doctors', component: DoctorListComponent, data: { reuseRoute: false } },
  { path: 'doctors/create', component: DoctorFormComponent },
  { path: 'doctors/view/:id', component: DoctorListComponent }, // TODO: Create DoctorDetailComponent
  { path: 'doctors/edit/:id', component: DoctorFormComponent },
  { path: 'doctors/schedule/:id', component: DoctorListComponent }, // TODO: Create DoctorScheduleComponent

  // Medicines
  { path: 'medicines', component: MedicineListComponent, data: { reuseRoute: false } },
  { path: 'medicines/create', component: MedicineFormComponent },
  { path: 'medicines/view/:id', component: MedicineListComponent }, // TODO: Create MedicineDetailComponent
  { path: 'medicines/edit/:id', component: MedicineFormComponent },

  { path: '**', redirectTo: '/dashboard' }
];
