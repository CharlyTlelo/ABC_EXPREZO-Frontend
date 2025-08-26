import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RouterModule } from '@angular/router';

interface Contratos {
  folio: string;
  contrato: string;
  descripcion: string;
  url: string;
}

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './contratos.component.html',
  styleUrl: './contratos.component.scss'
})
export class ContratosComponent {
  contrato: Contratos[] = [
    {
      folio: 'contrato_01',
      contrato: 'Push notification',
      descripcion: 'Sistema de integracion para administración para envio de notificaciones a clientes.',
      url: 'https://github.com/tu-usuario/AdministradorBackEnd'
    }
  ];

  agregarContrato() {
Swal.fire({
  title: '<span style="font-size:18px; color:#333;">AGREGAR NUEVO CONTRATO</span>',
  html: `
    <div style="text-align: left;">
    <label for="contrato" style="font-weight: 600; font-size: 16px; color: #333; display: block; margin-bottom: 4px;">Nombre del contrato</label>
    <input id="contrato" class="swal2-input bootstrap-input" placeholder="Ej. Módulo de clientes" style="width: 80%; margin-bottom: 12px; font-size: 16px">

    <label for="descripcion" style="font-weight: 600; font-size: 16px; color: #333; display: block; margin-bottom: 4px;">Descripción</label>
    <textarea id="descripcion" class="swal2-textarea bootstrap-input" placeholder="Describe brevemente el contrato" style="width: 80%; font-size: 16px"></textarea>
  </div>
  `,
  showCancelButton: true,
  cancelButtonText: 'x Cancelar',
  confirmButtonText: '+ Agregar',
  reverseButtons: true,
  confirmButtonColor: '#009c03',
  cancelButtonColor: '#1f618d',
  preConfirm: () => {
    const contrato = (document.getElementById('contrato') as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value.trim();

    if (!contrato || !descripcion) {
      Swal.showValidationMessage('Todos los campos son obligatorios');
      return null;
    }

    return { contrato, descripcion };
  }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const nuevoFolio = `contrato_${(this.contrato.length + 1).toString().padStart(2, '0')}`;
        this.contrato.push({
          folio: nuevoFolio,
          contrato: result.value.contrato,
          descripcion: result.value.descripcion,
          url: result.value.url
        });

        Swal.fire('¡Agregado!', 'El contrato ha sido registrado.', 'success');
      }
    });
  }
}
