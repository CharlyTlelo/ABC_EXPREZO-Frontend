import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente de reporte para la parte frontend del Administrador Exprezo.
 * El contenido se basa en el reporte estático generado a partir
 * del análisis del repositorio del proyecto.
 */
@Component({
  selector: 'app-frontend-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frontend-report.component.html',
  styleUrls: ['./frontend-report.component.scss']
})
export class FrontendReportComponent {}