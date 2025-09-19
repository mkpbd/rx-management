import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="main-toolbar">
      <mat-toolbar-row>
        <span class="logo-section">
          <mat-icon class="logo-icon">local_hospital</mat-icon>
          <span class="app-name">RX Hospital</span>
        </span>

        <span class="spacer"></span>

        <nav class="nav-links">
          <button
            mat-button
            [routerLink]="['/dashboard']"
            routerLinkActive="active-link"
            class="nav-button">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </button>

          <button
            mat-button
            [routerLink]="['/appointments']"
            routerLinkActive="active-link"
            class="nav-button">
            <mat-icon>calendar_today</mat-icon>
            <span>Appointments</span>
          </button>

          <button
            mat-button
            [routerLink]="['/appointments/create']"
            class="nav-button create-button">
            <mat-icon>add</mat-icon>
            <span>New Appointment</span>
          </button>

          <button
            mat-button
            [matMenuTriggerFor]="managementMenu"
            class="nav-button">
            <mat-icon>settings</mat-icon>
            <span>Management</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        </nav>
      </mat-toolbar-row>
    </mat-toolbar>

    <mat-menu #managementMenu="matMenu">
      <button mat-menu-item (click)="navigateToPatients()">
        <mat-icon>people</mat-icon>
        <span>Patients</span>
      </button>
      <button mat-menu-item (click)="navigateToDoctors()">
        <mat-icon>medical_services</mat-icon>
        <span>Doctors</span>
      </button>
      <button mat-menu-item (click)="navigateToMedicines()">
        <mat-icon>medication</mat-icon>
        <span>Medicines</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="navigateToReports()">
        <mat-icon>assessment</mat-icon>
        <span>Reports</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .logo-icon {
      font-size: 24px;
      color: #fff;
    }

    .app-name {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .nav-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-button.active-link {
      background-color: rgba(255, 255, 255, 0.2);
      font-weight: 500;
    }

    .create-button {
      background-color: rgba(255, 255, 255, 0.15);
      font-weight: 500;
    }

    .create-button:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }

    .nav-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    @media screen and (max-width: 768px) {
      .nav-button span {
        display: none;
      }

      .nav-button {
        min-width: 40px;
        padding: 8px;
      }

      .app-name {
        font-size: 1rem;
      }
    }
  `]
})
export class NavigationComponent {
  constructor(private router: Router) {}

  navigateToPatients() {
    this.router.navigate(['/patients']);
  }

  navigateToDoctors() {
    this.router.navigate(['/doctors']);
  }

  navigateToMedicines() {
    this.router.navigate(['/medicines']);
  }

  navigateToReports() {
    // TODO: Implement reports route
    this.router.navigate(['/dashboard']); // Temporary redirect to dashboard
    console.log('Reports page not yet implemented');
  }
}
