import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LocalPdfService, ModeladoSection, PdfMeta } from '../services/local-pdf.service';
import { ContratosService } from '../services/contratos.service';
import Swal from 'sweetalert2';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/** ===== Tipos para progreso ===== */
type SectionStats = { total: number; ready: number; percent: number; complete: boolean };
type ProgressStats = {
  totalSections: number;
  sectionsComplete: number;
  totalDocs: number;
  docsReady: number;
  percent: number; // 0..100
  perSection: Record<ModeladoSection, SectionStats>;
};

@Component({
  selector: 'app-modelado-contrato',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modelado-contrato.component.html',
  styleUrls: ['./modelado-contrato.component.scss']
})
export class ModeladoContratoComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(LocalPdfService);
  private contratos = inject(ContratosService);

  folio = this.route.snapshot.paramMap.get('folio') || '';

  loading = false;
  errorMsg = '';

  sections: { key: ModeladoSection; title: string; items: PdfMeta[] }[] = [
    { key: 'recoleccion', title: 'Recolección de requerimiento', items: [] },
    { key: 'conceptual',  title: 'Modelado Conceptual',         items: [] },
    { key: 'logico',      title: 'Modelo Lógico',               items: [] },
    { key: 'fisico',      title: 'Modelo Físico',               items: [] },
    { key: 'validacion',  title: 'Validación y pruebas',        items: [] },
  ];

  /** ===== Estado de progreso global ===== */
  stats: ProgressStats = {
    totalSections: 5,
    sectionsComplete: 0,
    totalDocs: 0,
    docsReady: 0,
    percent: 0,
    perSection: {
      recoleccion: { total: 0, ready: 0, percent: 0, complete: false },
      conceptual:  { total: 0, ready: 0, percent: 0, complete: false },
      logico:      { total: 0, ready: 0, percent: 0, complete: false },
      fisico:      { total: 0, ready: 0, percent: 0, complete: false },
      validacion:  { total: 0, ready: 0, percent: 0, complete: false },
    }
  };

  ngOnInit() { this.reloadAll(); }

  /** Carga todas las listas y recalcula progreso */
  reloadAll() {
    this.loading = true; this.errorMsg = '';
    try {
      for (const s of this.sections) s.items = this.store.listPdfs(this.folio, s.key);
      this.computeStats(); // ⬅️ importante
    } catch (e: any) {
      this.errorMsg = e?.message || 'Error al cargar archivos';
    } finally {
      this.loading = false;
    }
  }

  /** ====== PROGRESO: cálculo ====== */
  private computeStats() {
    let totalDocs = 0;
    let docsReady = 0;
    let sectionsComplete = 0;

    const perSection = { ...this.stats.perSection };

    for (const s of this.sections) {
      const total = s.items.length;
      const ready = s.items.filter(i => i.ready).length;
      const complete = total > 0 && ready === total;
      const percent = total === 0 ? 0 : Math.round((ready / total) * 100);

      perSection[s.key] = { total, ready, percent, complete };

      totalDocs += total;
      docsReady += ready;
      if (complete) sectionsComplete++;
    }

    const percent = Math.round(((docsReady / (totalDocs || 1)) * 50) + ((sectionsComplete / this.sections.length) * 50));

    this.stats = {
      totalSections: this.sections.length,
      sectionsComplete,
      totalDocs,
      docsReady,
      percent,
      perSection
    };
  }

  /** Subida de archivo */
  async onFileSelected(ev: Event, section: ModeladoSection) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      await Swal.fire('Ups', 'Solo se permiten PDFs', 'warning');
      input.value = '';
      return;
    }
    try {
      await this.store.savePdf(this.folio, section, file);
      this.reloadAll(); // recalc stats
      input.value = '';
    } catch (e: any) {
      await Swal.fire('Error', e?.message || 'No se pudo guardar', 'error');
    }
  }

  /** Marcar listo */
  async markReady(meta: PdfMeta) {
    const res = await Swal.fire({
      title: '¿Listo para validar?',
      text: `El documento "${meta.name}" se marcará como listo para revisión.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, marcar',
      cancelButtonText: 'Cancelar'
    });
    if (!res.isConfirmed) return;

    this.store.setReady(meta.id, true);
    this.reloadAll(); // recalc stats

    if (this.allDocsReady()) {
      this.contratos.updateByFolio(this.folio, { estatus: 'En revision' as any });
      await Swal.fire('¡Todo listo!', 'Todos los documentos están listos y el contrato pasó a "En revisión".', 'success');
    } else {
      await Swal.fire('Marcado', 'Documento listo para revisión.', 'success');
    }
  }

  /** Desmarcar (opcional si lo necesitas) */
  unmarkReady(meta: PdfMeta) {
    this.store.setReady(meta.id, false);
    this.reloadAll(); // recalc stats
  }

  /** Descargar 1 PDF */
  download(meta: PdfMeta) {
    const blob = this.store.getPdfBlob(meta.id);
    if (!blob) { Swal.fire('Error', 'Archivo no encontrado', 'error'); return; }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = meta.name; a.click();
    URL.revokeObjectURL(url);
  }

  /** Eliminar 1 PDF */
  public remove(meta: PdfMeta): void {
    if (!confirm(`Eliminar "${meta.name}"?`)) return;
    this.store.remove(meta.id);
    this.reloadAll(); // recalc stats
  }

  /** ZIP de una sección */
  async downloadSectionZip(section: ModeladoSection) {
    const sec = this.sections.find(s => s.key === section);
    if (!sec || sec.items.length === 0) return;

    const zip = new JSZip();
    for (const f of sec.items) {
      const blob = this.store.getPdfBlob(f.id);
      if (!blob) continue;
      const buf = await blob.arrayBuffer();
      zip.file(f.name, buf);
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${this.folio}-${section}.zip`);
  }

  /** ZIP de TODO el modelado */
  async downloadAllZip() {
    const zip = new JSZip();
    for (const s of this.sections) {
      if (s.items.length === 0) continue;
      const folder = zip.folder(s.key)!;
      for (const f of s.items) {
        const blob = this.store.getPdfBlob(f.id);
        if (!blob) continue;
        const buf = await blob.arrayBuffer();
        folder.file(f.name, buf);
      }
    }
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${this.folio}-modelado.zip`);
  }

  cancelar() { this.router.navigate(['/abc-exprezo/contratos']); }

  /** true si hay al menos 1 archivo por sección y TODOS tienen ready=true */
  private allDocsReady(): boolean {
    for (const s of this.sections) {
      if (s.items.length === 0) return false;
      if (s.items.some(i => !i.ready)) return false;
    }
    return true;
  }
}
