import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContratosService } from './services/contratos.service';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss']
})
export class ContratosComponent {
  private svc = inject(ContratosService);
  private router = inject(Router);

  contratos = computed(() => this.svc.items());

  irAgregar() {
    this.router.navigate(['/abc-exprezo/contratos/agregar_contrato']);
  }
  verDetalle(folio: string) {
    this.router.navigate(['/abc-exprezo/contratos', folio]);
  }
}
