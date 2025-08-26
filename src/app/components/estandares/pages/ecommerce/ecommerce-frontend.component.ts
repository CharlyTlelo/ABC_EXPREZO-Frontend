import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra el reporte de estándares para el frontend
 * de la sección E‑Commerce Exprezo. El contenido se basa en la
 * documentación proporcionada por el usuario y conserva el
 * diseño de reportes utilizado en otras secciones.
 */
@Component({
  selector: 'app-ecommerce-frontend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce-frontend.component.html',
  styleUrls: ['./ecommerce-frontend.component.scss']
})
export class EcommerceFrontendComponent {}