export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber?: string;
  qualifications?: string;
  experienceYears: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateDoctor {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber?: string;
  qualifications?: string;
  experienceYears: number;
}

export interface UpdateDoctor {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber?: string;
  qualifications?: string;
  experienceYears: number;
}
