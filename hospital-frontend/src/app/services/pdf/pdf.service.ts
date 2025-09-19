import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface PrescriptionReportRequest {
  appointmentId: number;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  prescriptionDetails: PrescriptionDetail[];
}

export interface PrescriptionDetail {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
  instructions: string;
}

export interface PdfDownloadOptions {
  filename?: string;
  openInNewTab?: boolean;
  showLoadingIndicator?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  private readonly apiUrl = 'https://localhost:7171/api'; // Default API URL

  constructor(private http: HttpClient) {}

  /**
   * Generate and download prescription PDF report
   * Integrates with QuestPDF backend as per memory requirement
   */
  generatePrescriptionPdf(
    appointmentId: number,
    options: PdfDownloadOptions = {}
  ): Observable<Blob> {
    const url = `${this.apiUrl}/appointments/${appointmentId}/prescription-pdf`;

    const headers = new HttpHeaders({
      'Accept': 'application/pdf',
      'Content-Type': 'application/json'
    });

    return this.http.get(url, {
      headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body) {
          // Handle PDF download
          this.handlePdfDownload(response.body, options);
          return response.body;
        }
        throw new Error('Empty response received');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Generate prescription PDF with custom data
   * For cases where appointment data needs to be sent explicitly
   */
  generateCustomPrescriptionPdf(
    reportData: PrescriptionReportRequest,
    options: PdfDownloadOptions = {}
  ): Observable<Blob> {
    const url = `${this.apiUrl}/pdf/prescription-report`;

    const headers = new HttpHeaders({
      'Accept': 'application/pdf',
      'Content-Type': 'application/json'
    });

    return this.http.post(url, reportData, {
      headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        if (response.body) {
          this.handlePdfDownload(response.body, options);
          return response.body;
        }
        throw new Error('Empty response received');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Preview prescription PDF without downloading
   * Opens PDF in new tab for preview
   */
  previewPrescriptionPdf(appointmentId: number): Observable<string> {
    const url = `${this.apiUrl}/appointments/${appointmentId}/prescription-pdf`;

    return this.http.get(url, {
      responseType: 'blob'
    }).pipe(
      map(blob => {
        const pdfUrl = URL.createObjectURL(blob);
        window.open(pdfUrl, '_blank');
        return pdfUrl;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get PDF generation status for long-running operations
   */
  getPdfGenerationStatus(jobId: string): Observable<any> {
    const url = `${this.apiUrl}/pdf/status/${jobId}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Handles PDF blob download or preview
   */
  private handlePdfDownload(blob: Blob, options: PdfDownloadOptions): void {
    const url = URL.createObjectURL(blob);

    if (options.openInNewTab) {
      // Open PDF in new tab for preview
      window.open(url, '_blank');
    } else {
      // Download PDF file
      const filename = options.filename || `prescription-report-${new Date().getTime()}.pdf`;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Clean up the URL object after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An error occurred while generating PDF';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 404:
          errorMessage = 'Appointment not found';
          break;
        case 400:
          errorMessage = 'Invalid request data';
          break;
        case 500:
          errorMessage = 'Server error occurred while generating PDF';
          break;
        default:
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }

    console.error('PDF Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };

  /**
   * Utility method to validate appointment data before PDF generation
   */
  validateAppointmentData(appointmentId: number): boolean {
    return !!(appointmentId && appointmentId > 0);
  }

  /**
   * Format prescription data for PDF generation
   */
  formatPrescriptionData(appointment: any): PrescriptionReportRequest {
    return {
      appointmentId: appointment.id,
      patientName: appointment.patientName || `${appointment.patient?.firstName} ${appointment.patient?.lastName}`,
      doctorName: appointment.doctorName || `${appointment.doctor?.firstName} ${appointment.doctor?.lastName}`,
      appointmentDate: appointment.appointmentDate,
      prescriptionDetails: appointment.prescriptionDetails || []
    };
  }
}
