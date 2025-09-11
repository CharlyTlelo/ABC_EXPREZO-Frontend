import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ContratosService } from './services/contratos.service';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss'],
})
export class ContratosComponent {
  private svc = inject(ContratosService);
  private router = inject(Router);

  // Si los quieres ordenados por folio:
  // contratos = computed(() => [...this.svc.items()].sort((a,b)=>a.folio.localeCompare(b.folio)));
  contratos = computed(() => this.svc.items());

  irAgregar() {
    this.router.navigate(['/abc-exprezo/contratos/agregar_contrato']);
  }

  irModelado(folio: string) {
    this.router.navigate(['/abc-exprezo/contratos', 'modelado', folio]);
  }

  /**
   * (Opcional) Si mantienes este handler en los badges,
   * ahora NO hace login ni cambia estado. Puedes borrarlo si no lo usas.
   */
  onStatusClick(_c: any) {
    // No-op: se dejó vacío a petición (sin login aquí).
    // Si quieres, puedes mostrar una nota informativa:
    // Swal.fire('Estatus', 'La firma se realiza desde el botón "Firmar" en la columna Modelo.', 'info');
  }

  /**
   * Login SOLO desde el botón "Firmar" cuando estatus = "En revision"
   */
  async firmar(folio: string) {
    const { value, isConfirmed } = await Swal.fire({
      title: 'Firmar contrato',
      html: `
        <input id="swal-user" class="swal2-input" placeholder="Usuario" autocomplete="username">
        <input id="swal-pass" type="password" class="swal2-input" placeholder="Contraseña" autocomplete="current-password">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const user = (
          document.getElementById('swal-user') as HTMLInputElement
        )?.value?.trim();
        const pass =
          (document.getElementById('swal-pass') as HTMLInputElement)?.value ??
          '';
        if (!user || !pass) {
          Swal.showValidationMessage('Ingresa usuario y contraseña');
          return;
        }
        return { user, pass };
      },
    });

    if (!isConfirmed || !value) return;

    const { user, pass } = value as { user: string; pass: string };

    // DEMO (mientras no conectamos backend). Quita/ajusta después:
    const okDemo = user === 'administrador' && pass === 'Zorro2025';
    if (!okDemo) {
      await Swal.fire(
        'Acceso denegado',
        'Usuario o contraseña incorrectos.',
        'error'
      );
      return;
    }

    await Swal.fire(
      'Validado',
      `Credenciales correctas para el folio ${folio}.`,
      'success'
    );

    // Ir a la vista de Requerimientos
    this.router.navigate(['/abc-exprezo/contratos', 'requerimientos', folio]);

    // Si por ahora NO quieres mover estatus, no hagas nada más.
    // Cuando lo conectemos a backend, aquí harás el POST y decidirás qué hacer con el estatus.
    // this.svc.updateByFolio(folio, { estatus: 'Aprobado' });
  }
}
