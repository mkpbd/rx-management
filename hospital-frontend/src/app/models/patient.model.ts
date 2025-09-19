export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender?: string;
  address?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreatePatient {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender?: string;
  address?: string;
}

export interface UpdatePatient {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth: Date;
  gender?: string;
  address?: string;
}
