export interface Medicine {
  id: number;
  name: string;
  genericName?: string;
  manufacturer?: string;
  description?: string;
  category?: string;
  strength?: string;
  form?: string;
  price?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateMedicine {
  name: string;
  genericName?: string;
  manufacturer?: string;
  description?: string;
  category?: string;
  strength?: string;
  form?: string;
  price?: number;
  isActive: boolean;
}

export interface UpdateMedicine {
  name: string;
  genericName?: string;
  manufacturer?: string;
  description?: string;
  category?: string;
  strength?: string;
  form?: string;
  price?: number;
  isActive: boolean;
}
