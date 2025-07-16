import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-detalle-contrato',
  imports: [
    CommonModule,
    RouterModule
  ],
  template: `
    <div class="container mt-4">
      <button routerLink="/abczorro/contratos" class="btn btn-outline-primary mb-3">
        <i class="bi bi-arrow-left-circle"></i> Regresar
      </button>

      <h3>Folio: {{ folio }}</h3>

      <div class="mt-4">
        <h5>1. Cargar el levantamiento técnico</h5>
        <!-- contenido -->
      </div>

      <div class="mt-4">
        <h5>2. Cargar el requerimiento técnico</h5>
        <!-- contenido -->
      </div>

      <div class="mt-4">
        <h5>3. Aprobación</h5>
        <!-- contenido -->
      </div>
    </div>
  `
})
export class DetalleContratoComponent {
  folio: string = '';

  constructor(private route: ActivatedRoute) {
    this.folio = this.route.snapshot.paramMap.get('folio') || '';
  }
}
