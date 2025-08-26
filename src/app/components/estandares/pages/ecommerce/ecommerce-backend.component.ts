import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente que muestra el reporte de estándares para el backend
 * de la sección E‑Commerce Exprezo. El contenido proviene de la
 * documentación compartida por el usuario y sigue el diseño
 * consistente de la aplicación.
 */
@Component({
  selector: 'app-ecommerce-backend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ecommerce-backend.component.html',
  styleUrls: ['./ecommerce-backend.component.scss']
})
export class EcommerceBackendComponent {}