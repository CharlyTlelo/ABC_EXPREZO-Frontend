import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { LocalPdfService, ModeladoSection, PdfMeta } from '../services/local-pdf.service';
import { ContratosService } from '../services/contratos.service';

type SectionStats = { total: number; ready: number; percent: number; complete: boolean; hasRejected: boolean };
interface SectionVM { key: ModeladoSection; title: string; items: PdfMeta[]; stats: SectionStats; }

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
  private files = inject(LocalPdfService);
  private contratos = inject(ContratosService);

  folio = this.route.snapshot.paramMap.get('folio') || '';

  sections: SectionVM[] = [
    { key: 'recoleccion', title: 'Recolección de requerimiento', items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'conceptual',  title: 'Modelado Conceptual', items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'logico',      title: 'Modelo Lógico', items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'fisico',      title: 'Modelo Físico', items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
    { key: 'validacion',  title: 'Validación y pruebas', items: [], stats: { total: 0, ready: 0, percent: 0, complete: false, hasRejected: false } },
  ];

  stats: ProgressStats = { totalSections: 5, sectionsComplete: 0, totalDocs: 0, docsReady: 0, percent: 0, canApprove: false };

  ngOnInit(){ this.reload(); }

  private reload(){
    for (const s of this.sections){
      s.items = this.files.listByFolioAndSection(this.folio, s.key);
      this.updateSectionStats(s);
    }
    this.updateGlobalStats();
  }

  private updateSectionStats(s: SectionVM){
    const total = s.items.length;
    const ready = s.items.filter(i => !!i.ready).length;
    const percent = total ? Math.floor((ready / total) * 100) : 0;
    const complete = total > 0 && ready === total;
    const hasRejected = s.items.some(i => i.review === 'rechazado');
    s.stats = { total, ready, percent, complete, hasRejected };
  }

  private updateGlobalStats(){
    const totalSections = this.sections.length;
    const sectionsComplete = this.sections.filter(s => s.stats.complete).length;
    const totalDocs = this.sections.reduce((acc, s) => acc + s.stats.total, 0);
    const docsReady = this.sections.reduce((acc, s) => acc + s.stats.ready, 0);
    const percent = totalDocs ? Math.floor((docsReady / totalDocs) * 100) : 0;

    const canApprove = this.allDocsReady();
    this.stats = { totalSections, sectionsComplete, totalDocs, docsReady, percent, canApprove };

    this.contratos.updateByFolio(this.folio, { estatus: canApprove ? 'En revision' : 'Pendiente' } as any);
  }

  async onFileSelected(event: Event, section: ModeladoSection){
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const file = input.files[0];
    await this.files.addFile(this.folio, section, file);
    this.reload();
    input.value = '';
  }

  toggleReady(item: PdfMeta, checked: boolean){
    this.files.toggleReady(item.id, checked);
    if (checked) this.files.clearReview(item.id);
    this.reload();
  }

  descargar(item: PdfMeta){
    const blob = this.files.getPdfBlob(item.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = item.name; a.click();
    URL.revokeObjectURL(url);
  }

  eliminar(item: PdfMeta){
    this.files.remove(item.id);
    this.reload();
  }

  async exportZip(){
    const zip = new JSZip();
    for (const s of this.sections){
      const folder = zip.folder(`${s.key}`)!;
      for (const it of s.items){
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
