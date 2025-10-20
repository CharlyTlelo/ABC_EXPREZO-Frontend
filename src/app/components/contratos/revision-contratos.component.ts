import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import {
  ContratosService,
  EstatusContrato,
} from './services/contratos.service';
import { LocalPdfService, PdfMeta } from './services/local-pdf.service';

type Decision = 'aprobado' | 'rechazado' | 'none';
type ReviewState = { decision: Decision; reason: string };

@Component({
  selector: 'app-revision-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="card p-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="m-0">Revisión de contratos</h2>
        <a routerLink="/abc-exprezo/contratos" class="btn btn-outline-secondary"
          >Volver</a
        >
      </div>

      <div class="mb-2 text-muted">
        Folio: <strong>{{ folio }}</strong>
      </div>

      <!-- Toggle para segunda revisión -->
      <div class="d-flex align-items-center gap-3 mb-2" *ngIf="hasRejected">
        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="onlyRej"
            [(ngModel)]="showOnlyRejected"
          />
          <label class="form-check-label" for="onlyRej"
            >Ver solo rechazados</label
          >
        </div>
        <small class="text-muted"
          >Los documentos previamente aprobados están bloqueados.</small
        >
      </div>

      <ng-container *ngIf="visibleDocs.length; else vacio">
        <table class="table align-middle">
          <thead>
            <tr>
              <th style="width:120px;">ID</th>
              <th>Documento</th>
              <th style="width:240px;">Decisión</th>
              <th style="width:35%;">Comentario (opcional)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of visibleDocs; trackBy: trackById">
              <td>
                <code>{{ d.id }}</code>
              </td>
              <td>
                <div class="fw-semibold">{{ d.name }}</div>
                <div class="small text-muted">{{ d.section || 'PDF' }}</div>
                <div class="mt-1">
                  <span
                    *ngIf="d.review === 'aprobado'"
                    class="badge text-bg-success"
                    >Aprobado previamente</span
                  >
                  <span
                    *ngIf="d.review === 'rechazado'"
                    class="badge text-bg-danger"
                    >Rechazado previamente</span
                  >
                </div>
              </td>
              <td>
                <div class="btn-group" role="group" aria-label="Decisión">
                  <button
                    type="button"
                    class="btn"
                    [class.btn-success]="state[d.id]?.decision === 'aprobado'"
                    [class.btn-outline-success]="
                      state[d.id]?.decision !== 'aprobado'
                    "
                    (click)="setDecision(d.id, 'aprobado')"
                    [disabled]="d.review === 'aprobado'"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    class="btn"
                    [class.btn-danger]="state[d.id]?.decision === 'rechazado'"
                    [class.btn-outline-danger]="
                      state[d.id]?.decision !== 'rechazado'
                    "
                    (click)="setDecision(d.id, 'rechazado')"
                    [disabled]="d.review === 'aprobado'"
                  >
                    Rechazar
                  </button>
                </div>
              </td>
              <td>
                <input
                  class="form-control"
                  [(ngModel)]="state[d.id].reason"
                  [disabled]="d.review === 'aprobado'"
                  placeholder="Motivo del rechazo / comentario"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-outline-secondary" (click)="guardarBorrador()">
            Guardar borrador
          </button>
          <button
            class="btn btn-primary"
            (click)="guardarRevision()"
            [disabled]="!hasAnyDecision()"
          >
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
export class RevisionContratosComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ContratosService);
  private files = inject(LocalPdfService);

  folio = '';
  /** Todos los documentos del folio */
  docs: PdfMeta[] = [];
  /** Estado por documento (id => estado) */
  state: Record<string, ReviewState> = {};

  /** UI: ver solo rechazados cuando existan */
  showOnlyRejected = false;
  hasRejected = false;

  ngOnInit() {
    this.folio = this.route.snapshot.paramMap.get('folio') || '';
    if (!this.folio) {
      this.router.navigate(['/abc-exprezo/contratos']);
      return;
    }

    this.docs = this.files.listByFolio(this.folio);

    // Precarga: si ya tenían review, respetarla para que el usuario “vea” el historial
    this.state = {};
    for (const d of this.docs) {
      const decision: Decision =
        d.review === 'aprobado'
          ? 'aprobado'
          : d.review === 'rechazado'
          ? 'rechazado'
          : 'none';

      this.state[d.id] = {
        decision,
        reason: d.reviewReason ?? '',
      };
    }

    // Si hay rechazados previos, mostramos solo rechazados
    this.hasRejected = this.docs.some((d) => d.review === 'rechazado');
    this.showOnlyRejected = this.hasRejected;
  }

  /** Documentos visibles según el toggle */
  get visibleDocs(): PdfMeta[] {
    if (this.showOnlyRejected)
      return this.docs.filter((d) => d.review === 'rechazado');
    return this.docs;
  }

  trackById = (_: number, d: PdfMeta) => d.id;

  setDecision(id: string, d: Decision) {
    const curr = this.state[id] || { decision: 'none', reason: '' };
    this.state[id] = { ...curr, decision: d };
  }

  hasAnyDecision(): boolean {
    return this.visibleDocs.some((d) => this.state[d.id]?.decision !== 'none');
  }

  async guardarBorrador() {
    // Simple: guardamos como “estado temporal” sobre el mismo storage local
    for (const d of this.visibleDocs) {
      const st = this.state[d.id];
      if (!st) continue;
      if (st.decision === 'aprobado')
        this.files.setReview(d.id, 'aprobado', st.reason);
      if (st.decision === 'rechazado')
        this.files.setReview(d.id, 'rechazado', st.reason);
    }
    await Swal.fire(
      'Borrador guardado',
      'Se guardaron tus decisiones temporales.',
      'success'
    );
  }

  async guardarRevision() {
    // 1) Aplicar decisiones actuales
    const decided = this.docs
      .map((d) => ({
        id: d.id,
        decision: this.state[d.id]?.decision || 'none',
        reason: (this.state[d.id]?.reason || '').trim(),
      }))
      .filter((e) => e.decision !== 'none');

    for (const e of decided) {
      if (e.decision === 'rechazado')
        this.files.setReview(e.id, 'rechazado', e.reason);
      else if (e.decision === 'aprobado')
        this.files.setReview(e.id, 'aprobado', e.reason);
    }

    // 2) Calcular estatus global
    const anyRejected = this.docs.some(
      (d) => (this.state[d.id]?.decision || d.review || 'none') === 'rechazado'
    );

    const allDecided =
      this.docs.length > 0 &&
      this.docs.every(
        (d) =>
          (this.state[d.id]?.decision || 'none') !== 'none' || d.review !== null
      );

    const allApproved =
      allDecided &&
      this.docs.every(
        (d) =>
          (this.state[d.id]?.decision || (d.review ?? 'none')) === 'aprobado'
      );

    const next: EstatusContrato = anyRejected
      ? 'Pendiente'
      : allApproved
      ? 'Aprobado'
      : 'En revisión';
    this.svc.updateByFolio(this.folio, { estatus: next });

    await Swal.fire(
      'Guardado',
      'Las decisiones se guardaron correctamente.',
      'success'
    );
    this.router.navigate(['/abc-exprezo/contratos']);
  }
}
