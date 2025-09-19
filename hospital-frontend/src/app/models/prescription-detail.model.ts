export interface PrescriptionDetail {
  id: number;
  appointmentId: number;
  medicineId: number;
  medicineName: string;
  dosage: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  frequency?: string;
  instructions?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreatePrescriptionDetail {
  medicineId: number;
  dosage: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  frequency?: string;
  instructions?: string;
}

export interface UpdatePrescriptionDetail {
  medicineId: number;
  dosage: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
  frequency?: string;
  instructions?: string;
}
