import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { LocalPdfService, ModeladoSection, PdfMeta } from '../services/local-pdf.service';
import { ContratosService, EstatusContrato } from '../services/contratos.service';

type SectionStats = {
  total: number;
  ready: number;
  percent: number;
  complete: boolean;
  hasRejected: boolean;
};
interface SectionVM {
  key: ModeladoSection;
  title: string;
  items: PdfMeta[];
  stats: SectionStats;
}

type ProgressStats = {
  totalSections: number;
  sectionsComplete: number;
  totalDocs: number;
  docsReady: number;
  percent: number;
  canApprove: boolean;
};

@Component({
  selector: 'app-modelado-contrato',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modelado-contrato.component.html',
  styleUrls: ['./modelado-contrato.component.scss']
})
export class ModeladoContratoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private files  = inject(LocalPdfService);
  private contratos = inject(ContratosService);

  folio = this.route.snapshot.paramMap.get('folio') || '';

  sections: SectionVM[] = [
    { key: 'recoleccion', title: 'Recolección de requerimiento', items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'conceptual',  title: 'Modelado Conceptual',           items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'logico',      title: 'Modelo Lógico',                  items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'fisico',      title: 'Modelo Físico',                  items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'validacion',  title: 'Validación y pruebas',           items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
  ];

  stats: ProgressStats = { totalSections: 5, sectionsComplete: 0, totalDocs: 0, docsReady: 0, percent: 0, canApprove: false };

  /** true si en TODO el contrato hay al menos un rechazado */
  hasAnyRejected = false;

  ngOnInit() { this.reload(); }

  private reload() {
    for (const s of this.sections) {
      s.items = this.files.listByFolioAndSection(this.folio, s.key);
      this.updateSectionStats(s);
    }
    this.hasAnyRejected = this.sections.some(sec => sec.stats.hasRejected);
    this.updateGlobalStats();
  }

  private updateSectionStats(s: SectionVM) {
    const total = s.items.length;
    const ready = s.items.filter(i => !!i.ready).length;
    const percent = total ? Math.floor((ready / total) * 100) : 0;
    const complete = total > 0 && ready === total;
    const hasRejected = s.items.some(i => i.review === 'rechazado');
    s.stats = { total, ready, percent, complete, hasRejected };
  }

  private updateGlobalStats() {
    const totalSections = this.sections.length;
    const sectionsComplete = this.sections.filter(s => s.stats.complete).length;
    const totalDocs = this.sections.reduce((acc, s) => acc + s.stats.total, 0);
    const docsReady = this.sections.reduce((acc, s) => acc + s.stats.ready, 0);
    const percent = totalDocs ? Math.floor((docsReady / totalDocs) * 100) : 0;

    const canApprove = this.allDocsReady();
    this.stats = { totalSections, sectionsComplete, totalDocs, docsReady, percent, canApprove };

    // Estatus del contrato en la lista principal
    const next: EstatusContrato = canApprove ? 'En revisión' : 'Pendiente';
    this.contratos.updateByFolio(this.folio, { estatus: next });
  }

  /** Subida inicial: SOLO si NO hay rechazados en todo el contrato */
  async onFileSelected(event: Event, section: ModeladoSection) {
    if (this.hasAnyRejected) return; // seguridad extra
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    await this.files.addFile(this.folio, section, file);
    this.reload();
    input.value = '';
  }

  /** Reemplazo: SOLO para documentos rechazados (el template solo muestra el botón en ese caso) */
  async onReplaceSelected(event: Event, item: PdfMeta) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];

    // Si tu servicio tiene replaceFile(id, file), úsalo; si no, fallback remove+add
    const svcAny = this.files as any;
    if (typeof svcAny.replaceFile === 'function') {
      await svcAny.replaceFile(item.id, file);
    } else {
      this.files.remove(item.id);
      await this.files.addFile(this.folio, (item.section as ModeladoSection), file);
    }

    this.reload();
  }

  toggleReady(item: PdfMeta, checked: boolean) {
    if (item.review === 'aprobado') return;      // bloquear aprobados
    this.files.toggleReady(item.id, checked);
    if (checked) this.files.clearReview(item.id); // limpiar marca de revisión si lo vuelve a marcar
    this.reload();
  }

  descargar(item: PdfMeta) {
    const blob = this.files.getPdfBlob(item.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = item.name; a.click();
    URL.revokeObjectURL(url);
  }

  eliminar(item: PdfMeta) {
    if (item.review === 'aprobado') return; // no permitir borrar aprobados
    this.files.remove(item.id);
    this.reload();
  }

  async exportZip() {
    const zip = new JSZip();
    for (const s of this.sections) {
      const folder = zip.folder(`${s.key}`)!;
      for (const it of s.items) {
        const blob = this.files.getPdfBlob(it.id);
        if (blob) {
          const buf = await blob.arrayBuffer();
          folder.file(it.name, buf);
        }
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${this.folio}-modelado.zip`);
  }

  cancelar() { this.router.navigate(['/abc-exprezo/contratos']); }

  private allDocsReady(): boolean {
    for (const s of this.sections) {
      if (s.items.length === 0) return false;
      if (s.items.some(i => !i.ready)) return false;
    }
    return true;
  }
}
