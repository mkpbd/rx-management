import { PrescriptionDetail, CreatePrescriptionDetail, UpdatePrescriptionDetail } from './prescription-detail.model';

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  appointmentDate: Date;
  visitType: string;
  notes?: string;
  diagnosis?: string;
  status: string;
  prescriptionDetails: PrescriptionDetail[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateAppointment {
  patientId: number;
  doctorId: number;
  appointmentDate: Date;
  visitType: string;
  notes?: string;
  diagnosis?: string;
  status: string;
  prescriptionDetails: CreatePrescriptionDetail[];
}

export interface UpdateAppointment {
  patientId: number;
  doctorId: number;
  appointmentDate: Date;
  visitType: string;
  notes?: string;
  diagnosis?: string;
  status: string;
  prescriptionDetails: UpdatePrescriptionDetail[];
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface AppointmentFilter {
  searchTerm?: string;
  doctorId?: number;
  visitType?: string;
  fromDate?: Date;
  toDate?: Date;
  pageNumber: number;
  pageSize: number;
}
