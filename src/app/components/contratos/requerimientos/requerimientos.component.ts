import { Component, inject, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { LocalPdfService, PdfMeta } from '../services/local-pdf.service';
import { ReviewService } from '../services/review.service';
import { ContratosService, EstatusContrato } from '../services/contratos.service';

type ReviewDecision = 'aprobado' | 'rechazado' | 'none';

type DecisionState = {
  decision: ReviewDecision;
  reason: string;             // comentario opcional
  commentSaved?: boolean;     // UI helper
};

@Component({
  selector: 'app-requerimientos-revision',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Revisión de requerimientos</h2>
      <a class="btn btn-outline-secondary" routerLink="/abc-exprezo/contratos">Volver</a>
    </div>

    <div class="mb-2 text-muted">
      Folio: <strong>{{ folio }}</strong>
    </div>

    <ng-container *ngIf="docs().length; else vacio">
      <table class="table align-middle">
        <thead>
          <tr>
            <th style="width: 120px;">ID</th>
            <th>Documento</th>
            <th style="width: 220px;">Decisión</th>
            <th style="width: 30%;">Comentario (opcional)</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of docs(); let i = index">
            <td><code>{{ d.id }}</code></td>
            <td>
              <div class="fw-semibold">{{ d.nombre }}</div>
              <div class="small text-muted">{{ d.tipo || 'PDF' }}</div>
            </td>
            <td>
              <div class="btn-group" role="group" aria-label="Decisión">
                <button type="button" class="btn"
                        [class.btn-success]="state[i]?.decision==='aprobado'"
                        [class.btn-outline-success]="state[i]?.decision!=='aprobado'"
                        (click)="setDecision(i,'aprobado')">Aprobar</button>
                <button type="button" class="btn"
                        [class.btn-danger]="state[i]?.decision==='rechazado'"
                        [class.btn-outline-danger]="state[i]?.decision!=='rechazado'"
                        (click)="setDecision(i,'rechazado')">Rechazar</button>
              </div>
            </td>
            <td>
              <input class="form-control"
                     [(ngModel)]="state[i].reason"
                     placeholder="Motivo del rechazo / comentario">
            </td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary" (click)="guardarBorrador()">
          Guardar borrador
        </button>
        <button class="btn btn-primary" (click)="guardarRevision()">
          Guardar revisión
        </button>
      </div>
    </ng-container>

    <ng-template #vacio>
      <div class="alert alert-info m-0">
        No hay documentos para revisar en este folio.
      </div>
    </ng-template>
  </div>
  `,
})
export class RequerimientosComponent {
  // Inyección de dependencias
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private files = inject(LocalPdfService);
  private reviews = inject(ReviewService);
  private contratos = inject(ContratosService);

  folio = '';
  docs: Signal<PdfMeta[]> = signal<PdfMeta[]>([]);

  // Estado editable por fila
  state: DecisionState[] = [];

  ngOnInit() {
    // 1) Obtener folio desde la ruta (p. ej. /abc-exprezo/contratos/requerimientos/:folio)
    this.folio = this.route.snapshot.paramMap.get('folio') || '';

    // 2) Cargar PDFs asociados
    const list = this.files.listByFolio(this.folio); // asume que tu servicio lo expone
    this.docs = signal(list);

    // 3) Cargar borradores previos (si existen) o inicializar
    const drafts = this.reviews.getDraftsByFolio(this.folio); // asume que devuelve { [id]: {decision,reason} }
    this.state = this.docs().map(d => ({
      decision: drafts[d.id]?.decision ?? 'none',
      reason: drafts[d.id]?.reason ?? '',
      commentSaved: false,
    }));
  }

  setDecision(idx: number, d: ReviewDecision) {
    this.state[idx].decision = d;
  }

  async guardarBorrador() {
    // Persistir borrador por documento
    this.docs().forEach((d, i) => {
      this.reviews.setDraft(this.folio, d.id, {
        decision: this.state[i].decision,
        reason: this.state[i].reason,
      });
      this.state[i].commentSaved = true;
      setTimeout(() => (this.state[i].commentSaved = false), 800);
    });
    await Swal.fire('Borrador guardado', 'Tus decisiones temporales fueron guardadas.', 'success');
  }

  async guardarRevision() {
    // Validar que haya decisiones (opcional: puedes exigir decisión en todos)
    const entries = this.docs().map((d, i) => ({
      id: d.id,
      decision: this.state[i].decision,
      reason: this.state[i].reason?.trim() || '',
    })).filter(e => e.decision !== 'none');

    if (entries.length === 0) {
      await Swal.fire('Sin cambios', 'Selecciona aprobar o rechazar al menos un documento.', 'info');
      return;
    }

    // Aplicar decisiones a los archivos (servicio local simulado)
    for (const e of entries) {
      if (e.decision === 'rechazado') this.files.setReview(e.id, 'rechazado', e.reason);
      else this.files.setReview(e.id, 'aprobado', e.reason);
    }

    // Determinar estatus del contrato
    const anyRejected = entries.some(e => e.decision === 'rechazado');
    const allDecided = entries.length === this.docs().length && this.docs().length > 0;
    const allApproved = allDecided && entries.every(e => e.decision === 'aprobado');

    const nextStatus: EstatusContrato =
      anyRejected ? 'Rechazado' :
      allApproved ? 'Aprobado' :
      'En revisión'; // <— con tilde

    this.contratos.updateByFolio(this.folio, { estatus: nextStatus });

    // Limpiar borradores y notificar
    this.reviews.clearDraftsByFolio(this.folio);
    await Swal.fire('Guardado', 'Decisiones almacenadas.', 'success');

    // Volver al listado
    this.router.navigate(['/abc-exprezo/contratos']);
  }
}
