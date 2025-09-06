import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ContratosService } from './services/contratos.service';
import Swal from 'sweetalert2';

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

  irModelado(folio: string) {
    this.router.navigate(['/abc-exprezo/contratos', 'modelado', folio]);
  }

  async onStatusClick(c: any) {
    const { value: formValues } = await Swal.fire({
      title: 'Autenticación requerida',
      html:
        '<input id="swal-user" class="swal2-input" placeholder="Usuario">' +
        '<input id="swal-pass" type="password" class="swal2-input" placeholder="Contraseña">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Entrar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const user = (document.getElementById('swal-user') as HTMLInputElement)?.value?.trim();
        const pass = (document.getElementById('swal-pass') as HTMLInputElement)?.value ?? '';
        if (!user || !pass) {
          Swal.showValidationMessage('Captura usuario y contraseña');
          return;
        }
        return { user, pass };
      }
    });

    if (!formValues) return;

    const { user, pass } = formValues as { user: string; pass: string };

    // *** Validación temporal (solo front) ***
    if (user === 'administrador' && pass === 'Zorro2025') {
      await Swal.fire({
        icon: 'success',
        title: 'Acceso concedido',
        text: 'Validación correcta (modo temporal).'
      });

      // Aquí puedes abrir otro diálogo para cambiar estatus, si quieres:
      // this.cambiarEstatus(c);

    } else {
      await Swal.fire({
        icon: 'error',
        title: 'Acceso denegado',
        text: 'Usuario o contraseña incorrectos.'
      });
    }
  }

}
