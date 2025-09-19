import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Appointment,
  CreateAppointment,
  UpdateAppointment,
  PagedResult,
  AppointmentFilter
} from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly endpoint = '/appointments';

  constructor(private apiService: ApiService) { }

  getAppointments(filter: AppointmentFilter): Observable<PagedResult<Appointment>> {
    return this.apiService.get<PagedResult<Appointment>>(this.endpoint, filter);
  }

  getAppointment(id: number): Observable<Appointment> {
    return this.apiService.get<Appointment>(`${this.endpoint}/${id}`);
  }

  createAppointment(appointment: CreateAppointment): Observable<Appointment> {
    return this.apiService.post<Appointment>(this.endpoint, appointment);
  }

  updateAppointment(id: number, appointment: UpdateAppointment): Observable<Appointment> {
    return this.apiService.put<Appointment>(`${this.endpoint}/${id}`, appointment);
  }

  deleteAppointment(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  downloadPrescriptionPdf(id: number): Observable<Blob> {
    return this.apiService.downloadFile(`${this.endpoint}/${id}/pdf`);
  }

  sendPrescriptionEmail(id: number, emailRequest: { toEmail: string; toName?: string }): Observable<any> {
    return this.apiService.post(`${this.endpoint}/${id}/email`, emailRequest);
  }

  downloadPdf(appointment: Appointment): void {
    this.downloadPrescriptionPdf(appointment.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Prescription_${appointment.patientName.replace(' ', '_')}_${new Date(appointment.appointmentDate).toISOString().split('T')[0]}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
      }
    });
  }
}
