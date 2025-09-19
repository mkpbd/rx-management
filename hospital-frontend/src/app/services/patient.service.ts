import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Patient, CreatePatient, UpdatePatient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly endpoint = '/patients';

  constructor(private apiService: ApiService) { }

  getPatients(): Observable<Patient[]> {
    return this.apiService.get<Patient[]>(this.endpoint);
  }

  getPatient(id: number): Observable<Patient> {
    return this.apiService.get<Patient>(`${this.endpoint}/${id}`);
  }

  searchPatients(searchTerm: string): Observable<Patient[]> {
    return this.apiService.get<Patient[]>(`${this.endpoint}/search`, { searchTerm });
  }

  createPatient(patient: CreatePatient): Observable<Patient> {
    return this.apiService.post<Patient>(this.endpoint, patient);
  }

  updatePatient(id: number, patient: UpdatePatient): Observable<Patient> {
    return this.apiService.put<Patient>(`${this.endpoint}/${id}`, patient);
  }

  deletePatient(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
