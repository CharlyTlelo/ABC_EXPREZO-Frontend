import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { LocalPdfService, PdfMeta } from '../services/local-pdf.service';
import { ReviewService, ReviewEntry, ReviewDecision } from '../services/review.service';
import { ContratosService } from '../services/contratos.service';

type DecisionState = {
  decision: 'aprobado' | 'rechazado' | 'none';
  reason: string;
  commentSaved?: boolean;
};

@Component({
  selector: 'app-requerimientos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './requerimientos.component.html',
  styleUrls: ['./requerimientos.component.scss']
})
export class RequerimientosComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private files = inject(LocalPdfService);
  private reviews = inject(ReviewService);
  private contratos = inject(ContratosService);

  folio = this.route.snapshot.paramMap.get('folio') || '';
  docs: PdfMeta[] = [];
  state = new Map<string, DecisionState>();

  sectionTitle: Record<string, string> = {
    recoleccion: 'Recolección',
    conceptual: 'Modelo Conceptual',
    logico: 'Modelo Lógico',
    fisico: 'Modelo Físico',
    validacion: 'Validación'
  };

  ngOnInit() {
    this.docs = this.files.listByFolio(this.folio);
    const prev = this.reviews.getByFolio(this.folio);

    for (const d of this.docs) {
      const decided = prev.find(p => p.id === d.id);
      const base: DecisionState = {
        decision: decided?.decision ?? 'none',
        reason: decided?.reason ?? ''
      };
      const draft = this.reviews.getDraftReason(this.folio, d.id);
      if (draft) this.state.set(d.id, { ...base, reason: draft, commentSaved: true });
      else this.state.set(d.id, base);
    }
  }

  setDecision(docId: string, decision: ReviewDecision) {
    const curr = this.state.get(docId) || { decision: 'none', reason: '' };
    if (decision === 'aprobado' && curr.commentSaved) {
      this.reviews.deleteDraftReason(this.folio, docId);
      this.state.set(docId, { decision, reason: '', commentSaved: false });
      return;
    }
    this.state.set(docId, { decision, reason: curr.reason || '', commentSaved: curr.commentSaved });
  }

  onReasonChange(docId: string, value: string) {
    const curr = this.state.get(docId) || { decision: 'none', reason: '' };
    this.state.set(docId, { ...curr, reason: value });
  }

  guardarComentario(docId: string) {
    const s = this.state.get(docId) || { decision: 'none', reason: '' };
    const text = (s.reason || '').trim();
    if (!text) return;
    this.reviews.setDraftReason(this.folio, docId, text);
    this.state.set(docId, { ...s, reason: text, commentSaved: true });
  }

  eliminarComentario(docId: string) {
    this.reviews.deleteDraftReason(this.folio, docId);
    const s = this.state.get(docId) || { decision: 'none', reason: '' };
    this.state.set(docId, { ...s, reason: '', commentSaved: false });
  }

  salir() {
    this.router.navigate(['/abc-exprezo/contratos']);
  }

  async aceptar() {
    const invalid = this.docs.filter(d => {
      const s = this.state.get(d.id);
      return s?.decision === 'rechazado' && !s.reason.trim();
    });
    if (invalid.length) {
      await Swal.fire('Falta motivo', 'Indica el motivo en todos los documentos rechazados.', 'warning');
      return;
    }

    const entries: ReviewEntry[] = this.docs
      .filter(d => (this.state.get(d.id)?.decision || 'none') !== 'none')
      .map(d => {
        const s = this.state.get(d.id)!;
        return {
          id: d.id,
          folio: this.folio,
          decision: s.decision as ReviewDecision,
          reason: s.decision === 'rechazado' ? s.reason.trim() : undefined,
          timestamp: new Date().toISOString()
        };
      });

    this.reviews.upsertMany(entries);

    for (const e of entries) {
      if (e.decision === 'rechazado') this.files.setReview(e.id, 'rechazado', e.reason);
      else this.files.setReview(e.id, 'aprobado');
    }

    const anyRejected = entries.some(e => e.decision === 'rechazado');
    const allDecided = entries.length === this.docs.length && this.docs.length > 0;
    const allApproved = allDecided && entries.every(e => e.decision === 'aprobado');
    const nextStatus = anyRejected ? 'Rechazado' : (allApproved ? 'Aprobado' : 'En revision');
    this.contratos.updateByFolio(this.folio, { estatus: nextStatus } as any);

    this.reviews.clearDraftsByFolio(this.folio);

    await Swal.fire('Guardado', 'Decisiones almacenadas (temporal).', 'success');
    this.router.navigate(['/abc-exprezo/contratos']);
  }
}
