import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ContratosService, Contrato } from './services/contratos.service';
import { FirmaDialogComponent } from './shared/firma-dialog.component';

// === JSZip: usa UNA de estas dos opciones ===
import JSZip from 'jszip';                      // opción A (con esModuleInterop)
// import * as JSZip_ from 'jszip';             // opción B (universal)
// const JSZip = JSZip_;                        // opción B (universal)

import { saveAs } from 'file-saver';
import { LocalPdfService } from './services/local-pdf.service';

type TabKey = 'pendientes' | 'revision' | 'aprobados';

@Component({
  selector: 'app-contratos',
  standalone: true,
  imports: [CommonModule, RouterModule, FirmaDialogComponent],
  templateUrl: './contratos.component.html',
  styleUrls: ['./contratos.component.scss'],
})
export class ContratosComponent {
  private svc = inject(ContratosService);
  private router = inject(Router);

  // ✅ INYECTAR tu servicio de PDFs (faltaba)
  private pdfs = inject(LocalPdfService);

  // agrega propiedad
  selectedFolio = '';

  // pestaña activa
  activeTab = signal<'pendientes' | 'revision' | 'aprobados'>('aprobados');

  // controla el modal de firma
  showFirma = false;

  // Fuente: signal del servicio (se actualiza solo)
  contratosAll = this.svc.items;

  downloading = false;

  /** Predicados por estatus (ojo: con tilde y mayúscula inicial) */
  private isApproved = (c: Contrato) => c.estatus === 'Aprobado';
  private isRevision = (c: Contrato) => c.estatus === 'En revisión';
  private isPending  = (c: Contrato) => c.estatus === 'Pendiente';

  counts = computed(() => {
    const arr = this.contratosAll();
    return {
      pendientes: arr.filter(this.isPending).length,
      revision:   arr.filter(this.isRevision).length,
      aprobados:  arr.filter(this.isApproved).length,
    };
  });

  contratos = computed<Contrato[]>(() => {
    const arr = this.contratosAll();
    switch (this.activeTab()) {
      case 'aprobados': return arr.filter(this.isApproved);
      case 'revision':  return arr.filter(this.isRevision);
      default:          return arr.filter(this.isPending);
    }
  });

  setTab(tab: TabKey) { this.activeTab.set(tab); }

  // Navegación / acciones
  irAgregar()  { this.router.navigate(['/abc-exprezo/contratos/agregar_contrato']); }
  irModelado(folio: string) { this.router.navigate(['/abc-exprezo/contratos/modelado', folio]); }
  verDetalle(folio: string) { this.irModelado(folio); }

  // —— Botón FIRMAR (en pestaña "En revisión") ——
  abrirFirma(folio: string) {
    this.selectedFolio = folio;
    this.showFirma = true;
  }

  onFirmaDone(ok: boolean) {
    this.showFirma = false;
    if (ok && this.selectedFolio) {
      this.router.navigate(['/abc-exprezo/contratos/revision', this.selectedFolio]);
    }
  }

  /** Acciones del revisor (si las usas desde aquí) */
  aprobar(folio: string) {
    Swal.fire({
      title: 'Aprobar requerimiento',
      text: `¿Confirmas aprobar el folio ${folio}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.approve(folio); // el servicio actualiza signal + localStorage
      Swal.fire('Aprobado', 'El requerimiento fue aprobado.', 'success');
    });
  }

  rechazar(folio: string) {
    Swal.fire({
      title: 'Rechazar requerimiento',
      input: 'textarea',
      inputLabel: 'Motivo del rechazo (opcional)',
      inputPlaceholder: 'Describe qué falta o qué corregir…',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      confirmButtonColor: '#d33',
    }).then(res => {
      if (!res.isConfirmed) return;
      this.svc.reject(folio, (res.value || undefined)); // marca Rechazado y lo regresa a Pendiente
      Swal.fire('Rechazado', 'Se envió a Pendientes con tu comentario.', 'success');
    });
  }

  // === DESCARGAR ZIP DE APROBADOS (solo front) ===
  async descargar(folio: string) {
    try {
      this.downloading = true;

      // Traer todos los PDFs del folio y quedarnos con los que tienen review 'aprobado'
      const all = this.pdfs.listByFolio(folio);
      const aprobados = all.filter(a => a.review === 'aprobado');

      if (aprobados.length === 0) {
        await Swal.fire('Sin archivos', 'Este folio no tiene archivos aprobados para descargar.', 'info');
        return;
      }

      const zip = new JSZip();

      // Agregar cada PDF al ZIP (desde localStorage -> base64/Blob)
      for (const a of aprobados) {
        const blob = this.pdfs.getPdfBlob(a.id);
        if (blob) {
          const nombre = a.name ? a.name : `${a.section}-${a.id}.pdf`;
          zip.file(nombre, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `aprobados_${folio}.zip`);
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'No fue posible generar la descarga.', 'error');
    } finally {
      this.downloading = false;
    }
  }

  /** Carga inicial */
  ngOnInit() {
    this.svc.list().subscribe(); // hidrata desde API o localStorage
  }
}
