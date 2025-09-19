import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';

// Angular Material imports (following memory requirement for proper imports)
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MedicineService } from '../../services/medicine.service';
import { Medicine as MedicineModel } from '../../models/medicine.model';

export interface PrescriptionDetail {
  id?: number;
  medicineId: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  quantity: number;
}

@Component({
  selector: 'app-prescription-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './prescription-detail.html',
  styleUrls: ['./prescription-detail.scss']
})
export class PrescriptionDetailComponent implements OnInit {
  @Input() appointmentId: number | null = null;
  @Input() prescriptionDetails: PrescriptionDetail[] = [];
  @Input() appointmentData: any = null; // Additional appointment data for PDF generation
  @Output() prescriptionChanged = new EventEmitter<PrescriptionDetail[]>();

  displayedColumns: string[] = ['medicine', 'dosage', 'frequency', 'duration', 'quantity', 'instructions', 'actions'];
  dataSource = new MatTableDataSource<PrescriptionDetail>([]);

  // Initialize form and data arrays (following memory requirement for explicit initialization)
  medicineForm: FormGroup;
  availableMedicines: MedicineModel[] = [];
  filteredMedicines!: Observable<MedicineModel[]>;
  isLoadingMedicines = false;
  medicineSearchTerm = '';
  categories: string[] = [];
  selectedCategory = '';

  frequencies = [
    'Once daily (OD)',
    'Twice daily (BD)',
    'Thrice daily (TDS)',
    'Four times daily (QDS)',
    'As needed (PRN)',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  durations = [
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '21 days',
    '30 days',
    '60 days',
    '90 days',
    'As prescribed',
    'Until finished'
  ];

  dosageUnits = ['mg', 'g', 'ml', 'mcg', 'IU', 'tablet', 'capsule', 'drop', 'spray', 'patch'];
  commonDosages: { [key: string]: string[] } = {
    'tablet': ['1 tablet', '2 tablets', '0.5 tablet'],
    'capsule': ['1 capsule', '2 capsules'],
    'mg': ['250mg', '500mg', '1000mg', '100mg', '200mg'],
    'ml': ['5ml', '10ml', '15ml', '20ml']
  };

  isEditMode = false;
  editingIndex = -1;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private medicineService: MedicineService
  ) {
    // Initialize medicine form with validation
    this.medicineForm = this.fb.group({
      medicineSearch: ['', [Validators.required]],
      medicineId: ['', [Validators.required]],
      dosage: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?\s*(mg|g|ml|mcg|IU|tablet|capsule|drop|spray|patch)$/i)]],
      frequency: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(1000)]],
      instructions: ['', [Validators.maxLength(500)]],
      category: ['']
    });
  }

  ngOnInit(): void {
    this.loadMedicines();
    this.dataSource.data = this.prescriptionDetails || [];
    this.setupMedicineAutocomplete();
  }

  private setupMedicineAutocomplete(): void {
    this.filteredMedicines = this.medicineForm.get('medicineSearch')!.valueChanges.pipe(
      startWith(''),
      map(value => {
        const searchTerm = typeof value === 'string' ? value : '';
        return this._filterMedicines(searchTerm);
      })
    );
  }

  private _filterMedicines(value: string): MedicineModel[] {
    if (!value || typeof value !== 'string') {
      return this.selectedCategory
        ? this.availableMedicines.filter(m => m.category === this.selectedCategory)
        : this.availableMedicines;
    }

    const filterValue = value.toLowerCase().trim();
    let filtered = this.availableMedicines.filter(medicine =>
      medicine.name.toLowerCase().includes(filterValue) ||
      medicine.genericName?.toLowerCase().includes(filterValue) ||
      (medicine.category && medicine.category.toLowerCase().includes(filterValue)) ||
      (medicine.manufacturer && medicine.manufacturer.toLowerCase().includes(filterValue))
    );

    if (this.selectedCategory) {
      filtered = filtered.filter(m => m.category === this.selectedCategory);
    }

    return filtered.slice(0, 10); // Limit results for performance
  }

  private loadMedicines(): void {
    this.isLoadingMedicines = true;
    this.medicineService.getMedicines().subscribe({
      next: (medicines) => {
        this.availableMedicines = medicines.filter(m => m.isActive !== false);
        this.extractCategories();
        this.isLoadingMedicines = false;
      },
      error: (error) => {
        console.error('Error loading medicines:', error);
        this.snackBar.open('Error loading medicines', 'Close', { duration: 3000 });
        this.loadMockMedicines();
        this.isLoadingMedicines = false;
      }
    });
  }

  private extractCategories(): void {
    const categorySet = new Set(
      this.availableMedicines
        .map(m => m.category)
        .filter(category => category !== undefined && category !== null)
    );
    this.categories = Array.from(categorySet).sort();
  }

  private loadMockMedicines(): void {
    // Fallback mock medicine data with more variety
    this.availableMedicines = [
      { id: 1, name: 'Paracetamol', genericName: 'Acetaminophen', category: 'Analgesic', manufacturer: 'ABC Pharma', strength: '500mg', form: 'Tablet', price: 5.99, isActive: true, createdAt: new Date() },
      { id: 2, name: 'Amoxicillin', genericName: 'Amoxicillin Trihydrate', category: 'Antibiotic', manufacturer: 'XYZ Labs', strength: '250mg', form: 'Capsule', price: 18.75, isActive: true, createdAt: new Date() },
      { id: 3, name: 'Ibuprofen', genericName: 'Ibuprofen', category: 'Anti-inflammatory', manufacturer: 'MedCorp', strength: '400mg', form: 'Tablet', price: 7.50, isActive: true, createdAt: new Date() },
      { id: 4, name: 'Cetirizine', genericName: 'Cetirizine HCl', category: 'Antihistamine', manufacturer: 'HealthCare Inc', strength: '10mg', form: 'Tablet', price: 12.30, isActive: true, createdAt: new Date() },
      { id: 5, name: 'Omeprazole', genericName: 'Omeprazole', category: 'Proton Pump Inhibitor', manufacturer: 'PharmaTech', strength: '20mg', form: 'Capsule', price: 15.00, isActive: true, createdAt: new Date() },
      { id: 6, name: 'Metformin', genericName: 'Metformin HCl', category: 'Antidiabetic', manufacturer: 'DiabetesCare', strength: '500mg', form: 'Tablet', price: 12.50, isActive: true, createdAt: new Date() },
      { id: 7, name: 'Lisinopril', genericName: 'Lisinopril', category: 'Antihypertensive', manufacturer: 'CardioMed', strength: '10mg', form: 'Tablet', price: 8.25, isActive: true, createdAt: new Date() },
      { id: 8, name: 'Atorvastatin', genericName: 'Atorvastatin Calcium', category: 'Statin', manufacturer: 'CholesterolCare', strength: '20mg', form: 'Tablet', price: 22.00, isActive: true, createdAt: new Date() }
    ];
    this.extractCategories();
  }

  onAddMedicine(): void {
    if (this.medicineForm.valid) {
      const formValue = this.medicineForm.value;
      let selectedMedicine: MedicineModel | undefined;

      // Handle both autocomplete selection and direct ID selection
      if (formValue.medicineSearch && typeof formValue.medicineSearch === 'object') {
        selectedMedicine = formValue.medicineSearch;
        if (selectedMedicine) {
          this.medicineForm.patchValue({ medicineId: selectedMedicine.id });
        }
      } else if (formValue.medicineId) {
        selectedMedicine = this.availableMedicines.find(m => m.id === formValue.medicineId);
      }

      if (!selectedMedicine) {
        this.snackBar.open('Please select a valid medicine', 'Close', { duration: 3000 });
        return;
      }

      // Check for duplicate medicines
      const isDuplicate = this.prescriptionDetails.some(p =>
        p.medicineId === selectedMedicine!.id && (!this.isEditMode || this.editingIndex !== this.prescriptionDetails.findIndex(pd => pd.medicineId === selectedMedicine!.id))
      );

      if (isDuplicate) {
        this.snackBar.open('This medicine is already prescribed', 'Close', { duration: 3000 });
        return;
      }

      const newPrescription: PrescriptionDetail = {
        id: this.isEditMode ? this.prescriptionDetails[this.editingIndex]?.id : undefined,
        medicineId: selectedMedicine.id,
        medicineName: selectedMedicine.name,
        dosage: formValue.dosage,
        frequency: formValue.frequency,
        duration: formValue.duration,
        quantity: formValue.quantity,
        instructions: formValue.instructions || ''
      };

      if (this.isEditMode) {
        // Update existing prescription
        this.prescriptionDetails[this.editingIndex] = newPrescription;
        this.snackBar.open('Medicine updated successfully', 'Close', { duration: 3000 });
      } else {
        // Add new prescription
        this.prescriptionDetails.push(newPrescription);
        this.snackBar.open('Medicine added successfully', 'Close', { duration: 3000 });
      }

      this.dataSource.data = [...this.prescriptionDetails];
      this.prescriptionChanged.emit(this.prescriptionDetails);
      this.resetForm();
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Please fill in all required fields correctly', 'Close', { duration: 3000 });
    }
  }

  onEditMedicine(index: number): void {
    const prescription = this.prescriptionDetails[index];
    const medicine = this.availableMedicines.find(m => m.id === prescription.medicineId);
    this.isEditMode = true;
    this.editingIndex = index;

    this.medicineForm.patchValue({
      medicineSearch: medicine || prescription.medicineName,
      medicineId: prescription.medicineId,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      quantity: prescription.quantity,
      instructions: prescription.instructions
    });
  }

  onDeleteMedicine(index: number): void {
    const medicineName = this.prescriptionDetails[index].medicineName;

    if (confirm(`Are you sure you want to remove ${medicineName} from the prescription?`)) {
      this.prescriptionDetails.splice(index, 1);
      this.dataSource.data = [...this.prescriptionDetails];
      this.prescriptionChanged.emit(this.prescriptionDetails);
      this.snackBar.open('Medicine removed successfully', 'Close', { duration: 3000 });
    }
  }

  onCancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.medicineForm.reset({
      quantity: 1,
      medicineSearch: '',
      category: ''
    });
    this.isEditMode = false;
    this.editingIndex = -1;
    this.selectedCategory = '';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.medicineForm.controls).forEach(key => {
      const control = this.medicineForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getter methods for form validation
  get medicineSearch() { return this.medicineForm.get('medicineSearch'); }
  get medicineId() { return this.medicineForm.get('medicineId'); }
  get dosage() { return this.medicineForm.get('dosage'); }
  get frequency() { return this.medicineForm.get('frequency'); }
  get duration() { return this.medicineForm.get('duration'); }
  get quantity() { return this.medicineForm.get('quantity'); }
  get instructions() { return this.medicineForm.get('instructions'); }
  get category() { return this.medicineForm.get('category'); }

  // New helper methods for enhanced functionality
  onMedicineSelected(medicine: MedicineModel): void {
    this.medicineForm.patchValue({
      medicineId: medicine.id,
      medicineSearch: medicine
    });
    this.suggestDosage(medicine);
  }

  private suggestDosage(medicine: MedicineModel): void {
    if (medicine.strength && medicine.form) {
      const suggestedDosage = `1 ${medicine.form.toLowerCase()}`;
      this.medicineForm.patchValue({ dosage: suggestedDosage });
    }
  }

  onCategoryFilterChange(): void {
    this.selectedCategory = this.medicineForm.get('category')?.value || '';
    this.setupMedicineAutocomplete(); // Refresh the filtered list
  }

  clearCategoryFilter(): void {
    this.selectedCategory = '';
    this.medicineForm.patchValue({ category: '' });
    this.setupMedicineAutocomplete();
  }

  displayMedicine(medicine: MedicineModel): string {
    return medicine ? `${medicine.name} (${medicine.strength || ''})` : '';
  }

  getMedicinePrice(medicineId: number): number {
    const medicine = this.availableMedicines.find(m => m.id === medicineId);
    return medicine?.price || 0;
  }

  calculateTotalCost(): number {
    return this.prescriptionDetails.reduce((total, prescription) => {
      const price = this.getMedicinePrice(prescription.medicineId);
      return total + (price * prescription.quantity);
    }, 0);
  }

  onQuickDosage(dosage: string): void {
    this.medicineForm.patchValue({ dosage });
  }

  // Helper methods
  getMedicineDisplayName(medicineId: number): string {
    const medicine = this.availableMedicines.find(m => m.id === medicineId);
    return medicine ? `${medicine.name} (${medicine.strength || ''})` : 'Unknown Medicine';
  }

  getMedicineDetails(medicineId: number): string {
    const medicine = this.availableMedicines.find(m => m.id === medicineId);
    return medicine ? `${medicine.category} - ${medicine.manufacturer}` : '';
  }

  getTotalMedicines(): number {
    return this.prescriptionDetails.length;
  }

  hasPrescriptionDetails(): boolean {
    return this.prescriptionDetails.length > 0;
  }

  onGeneratePrescriptionPDF(): void {
    if (!this.hasPrescriptionDetails()) {
      this.snackBar.open('Please add medicines before generating PDF', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    if (!this.appointmentData) {
      this.snackBar.open('Appointment data is required for PDF generation', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    }

    const snackBarRef = this.snackBar.open('PDF generation feature will be implemented with backend integration', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
