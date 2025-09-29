import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SolicitudesService } from './solicitudes.service';
import { Solicitud, EstadoSolicitud } from './solicitud.model';

@Component({
  selector: 'app-solicitud-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './solicitud-detail.component.html',
  styleUrls: ['./solicitud-detail.component.scss']
})
export class SolicitudDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(SolicitudesService);

  solicitud = signal<Solicitud | null>(null);

  estadosLineales: EstadoSolicitud[] = ['PENDIENTE','LEVANTAMIENTO','REVISION','APROBADA','DESARROLLO','QA','UAT','LIBERADA','CERRADA'];

  constructor(){
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.findById(id).subscribe(s => this.solicitud.set(s || null));
  }

  canEnviarRevision(): boolean {
    const s = this.solicitud();
    return !!(s && s.estado === 'LEVANTAMIENTO' && s.checklist.levantamiento.completo && s.checklist.reqTecnico.completo && !s.bloqueada);
  }

  mover(to: EstadoSolicitud){
    const s = this.solicitud();
    if(!s) return;
    this.api.transition(s.id, to, 'via detalle').subscribe(updated => {
      if(updated) this.solicitud.set(updated);
    });
  }
}
