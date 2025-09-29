import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { ContratosService, EstatusContrato } from './services/contratos.service';
import { LocalPdfService, PdfMeta } from './services/local-pdf.service';

type Review = { decision: 'aprobado'|'rechazado'|'none'; reason: string; };

@Component({
  selector: 'app-revision-contratos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
  <div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="m-0">Revisión de contratos</h2>
      <a routerLink="/abc-exprezo/contratos" class="btn btn-outline-secondary">Volver</a>
    </div>

    <div class="mb-2 text-muted">Folio: <strong>{{ folio }}</strong></div>

    <ng-container *ngIf="docs.length; else vacio">
      <table class="table align-middle">
        <thead>
          <tr>
            <th style="width:120px;">ID</th>
            <th>Documento</th>
            <th style="width:220px;">Decisión</th>
            <th style="width:35%;">Comentario (opcional)</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of docs; let i = index">
            <td><code>{{ d.id }}</code></td>
            <td>
              <div class="fw-semibold">{{ d.name }}</div>
              <div class="small text-muted">{{ d.section || 'PDF' }}</div>
            </td>
            <td>
              <div class="btn-group" role="group">
                <button type="button" class="btn"
                        [class.btn-success]="state[i].decision==='aprobado'"
                        [class.btn-outline-success]="state[i].decision!=='aprobado'"
                        (click)="setDecision(i,'aprobado')">Aprobar</button>
                <button type="button" class="btn"
                        [class.btn-danger]="state[i].decision==='rechazado'"
                        [class.btn-outline-danger]="state[i].decision!=='rechazado'"
                        (click)="setDecision(i,'rechazado')">Rechazar</button>
              </div>
            </td>
            <td>
              <input class="form-control"
                     [(ngModel)]="state[i].reason"
                     placeholder="Motivo del rechazo / comentario" />
            </td>
          </tr>
        </tbody>
      </table>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-outline-secondary" (click)="guardarBorrador()">Guardar borrador</button>
        <button class="btn btn-primary" (click)="guardarRevision()">Guardar revisión</button>
      </div>
    </ng-container>

    <ng-template #vacio>
      <div class="alert alert-info m-0">No hay documentos para revisar en este folio.</div>
    </ng-template>
  </div>
  `
})
export class RevisionContratosComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ContratosService);
  private files = inject(LocalPdfService);

  folio = '';
  docs: PdfMeta[] = [];
  state: Review[] = [];

  ngOnInit() {
    this.folio = this.route.snapshot.paramMap.get('folio') || '';
    // si no vino folio, regresar
    if (!this.folio) {
      this.router.navigate(['/abc-exprezo/contratos']);
      return;
    }

    this.docs = this.files.listByFolio(this.folio);
    this.state = this.docs.map(() => ({ decision: 'none', reason: '' }));
  }

  setDecision(i: number, d: Review['decision']) { this.state[i].decision = d; }

  async guardarBorrador() {
  this.docs.forEach((doc, i) => {
    const d = this.state[i].decision;
    if (d === 'rechazado') {
      this.files.setReview(doc.id, 'rechazado', this.state[i].reason);
    } else if (d === 'aprobado') {
      this.files.setReview(doc.id, 'aprobado', this.state[i].reason);
    } // si es 'none', no guardamos nada (borrador implícito)
  });
  await Swal.fire('Borrador guardado', 'Se guardaron tus decisiones temporales.', 'success');
}


  async guardarRevision() {
    // Aplicar decisiones a los archivos
    this.docs.forEach((doc, i) => {
      if (this.state[i].decision === 'rechazado') this.files.setReview(doc.id, 'rechazado', this.state[i].reason);
      else if (this.state[i].decision === 'aprobado') this.files.setReview(doc.id, 'aprobado', this.state[i].reason);
    });

    // Calcular estatus del contrato
    const anyRejected = this.state.some(s => s.decision === 'rechazado');
    const allDecided = this.state.every(s => s.decision !== 'none') && this.state.length > 0;
    const allApproved = allDecided && this.state.every(s => s.decision === 'aprobado');

    const next: EstatusContrato = anyRejected ? 'Rechazado' : (allApproved ? 'Aprobado' : 'En revisión');
    this.svc.updateByFolio(this.folio, { estatus: next });

    await Swal.fire('Guardado', 'Las decisiones se guardaron correctamente.', 'success');
    this.router.navigate(['/abc-exprezo/contratos']);
  }
}
