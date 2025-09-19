import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface EmailDialogData {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  appointmentDate: Date;
  patientEmail?: string;
}

export interface EmailRequest {
  toEmail: string;
  toName?: string;
}

@Component({
  selector: 'app-email-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="email-dialog">
      <h2 mat-dialog-title>
        <mat-icon>email</mat-icon>
        Send Prescription Report
      </h2>

      <mat-dialog-content>
        <div class="dialog-content">
          <div class="appointment-info">
            <h3>Appointment Details</h3>
            <p><strong>Patient:</strong> {{ data.patientName }}</p>
            <p><strong>Doctor:</strong> {{ data.doctorName }}</p>
            <p><strong>Date:</strong> {{ data.appointmentDate | date:'medium' }}</p>
          </div>

          <form [formGroup]="emailForm" class="email-form">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Recipient Email *</mat-label>
              <input
                matInput
                type="email"
                formControlName="toEmail"
                placeholder="patient@email.com"
                required>
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="toEmail?.hasError('required') && toEmail?.touched">
                Email address is required
              </mat-error>
              <mat-error *ngIf="toEmail?.hasError('email') && toEmail?.touched">
                Please enter a valid email address
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Recipient Name</mat-label>
              <input
                matInput
                formControlName="toName"
                placeholder="Patient's full name">
              <mat-icon matSuffix>person</mat-icon>
              <mat-hint>Optional: If not provided, patient name will be used</mat-hint>
            </mat-form-field>
          </form>

          <div class="email-preview">
            <h4>Email Preview</h4>
            <div class="preview-content">
              <p><strong>Subject:</strong> Prescription Report - {{ data.patientName }}</p>
              <p><strong>Attachment:</strong> Prescription_{{ data.patientName.replace(' ', '_') }}_{{ formatDate(data.appointmentDate) }}.pdf</p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button
          mat-button
          (click)="onCancel()"
          [disabled]="isLoading">
          <mat-icon>cancel</mat-icon>
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onSend()"
          [disabled]="emailForm.invalid || isLoading">
          <mat-icon *ngIf="!isLoading">send</mat-icon>
          <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
          {{ isLoading ? 'Sending...' : 'Send Email' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .email-dialog {
      min-width: 500px;
      max-width: 600px;
    }

    .dialog-content {
      padding: 20px 0;
    }

    .appointment-info {
      background-color: #f5f5f5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .appointment-info h3 {
      margin: 0 0 12px 0;
      color: #333;
      font-size: 16px;
    }

    .appointment-info p {
      margin: 4px 0;
      color: #666;
    }

    .email-form {
      margin-bottom: 24px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .email-preview {
      background-color: #e3f2fd;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #2196f3;
    }

    .email-preview h4 {
      margin: 0 0 12px 0;
      color: #1976d2;
      font-size: 14px;
    }

    .preview-content p {
      margin: 8px 0;
      font-size: 14px;
      color: #555;
    }

    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      margin-bottom: 20px;
    }

    mat-dialog-actions {
      padding: 20px 0 0 0;
      margin: 0;
    }

    button[mat-raised-button] {
      margin-left: 8px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class EmailDialogComponent {
  emailForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EmailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmailDialogData
  ) {
    this.emailForm = this.fb.group({
      toEmail: [data.patientEmail || '', [Validators.required, Validators.email]],
      toName: [data.patientName]
    });
  }

  get toEmail() { return this.emailForm.get('toEmail'); }
  get toName() { return this.emailForm.get('toName'); }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSend(): void {
    if (this.emailForm.valid) {
      this.isLoading = true;
      const emailRequest: EmailRequest = {
        toEmail: this.emailForm.value.toEmail,
        toName: this.emailForm.value.toName || this.data.patientName
      };

      this.dialogRef.close(emailRequest);
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0].replace(/-/g, '');
  }
}
