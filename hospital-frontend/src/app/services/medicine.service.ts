import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Medicine, CreateMedicine, UpdateMedicine } from '../models/medicine.model';

@Injectable({
  providedIn: 'root'
})
export class MedicineService {
  private readonly endpoint = '/medicines';

  constructor(private apiService: ApiService) { }

  getMedicines(): Observable<Medicine[]> {
    return this.apiService.get<Medicine[]>(this.endpoint);
  }

  getAllMedicines(): Observable<Medicine[]> {
    return this.apiService.get<Medicine[]>(`${this.endpoint}/all`);
  }

  getMedicine(id: number): Observable<Medicine> {
    return this.apiService.get<Medicine>(`${this.endpoint}/${id}`);
  }

  searchMedicines(searchTerm: string): Observable<Medicine[]> {
    return this.apiService.get<Medicine[]>(`${this.endpoint}/search`, { searchTerm });
  }

  getMedicinesByCategory(category: string): Observable<Medicine[]> {
    return this.apiService.get<Medicine[]>(`${this.endpoint}/category/${category}`);
  }

  createMedicine(medicine: CreateMedicine): Observable<Medicine> {
    return this.apiService.post<Medicine>(this.endpoint, medicine);
  }

  updateMedicine(id: number, medicine: UpdateMedicine): Observable<Medicine> {
    return this.apiService.put<Medicine>(`${this.endpoint}/${id}`, medicine);
  }

  deleteMedicine(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
