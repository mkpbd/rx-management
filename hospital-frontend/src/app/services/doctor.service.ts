import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Doctor, CreateDoctor, UpdateDoctor } from '../models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private readonly endpoint = '/doctors';

  constructor(private apiService: ApiService) { }

  getDoctors(): Observable<Doctor[]> {
    return this.apiService.get<Doctor[]>(this.endpoint);
  }

  getDoctor(id: number): Observable<Doctor> {
    return this.apiService.get<Doctor>(`${this.endpoint}/${id}`);
  }

  searchDoctors(searchTerm: string): Observable<Doctor[]> {
    return this.apiService.get<Doctor[]>(`${this.endpoint}/search`, { searchTerm });
  }

  getDoctorsBySpecialization(specialization: string): Observable<Doctor[]> {
    return this.apiService.get<Doctor[]>(`${this.endpoint}/specialization/${specialization}`);
  }

  createDoctor(doctor: CreateDoctor): Observable<Doctor> {
    return this.apiService.post<Doctor>(this.endpoint, doctor);
  }

  updateDoctor(id: number, doctor: UpdateDoctor): Observable<Doctor> {
    return this.apiService.put<Doctor>(`${this.endpoint}/${id}`, doctor);
  }

  deleteDoctor(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
