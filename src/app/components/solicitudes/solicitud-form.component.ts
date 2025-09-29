import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SolicitudesService } from './solicitudes.service';

@Component({
  selector: 'app-solicitud-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './solicitud-form.component.html',
  styleUrls: ['./solicitud-form.component.scss']
})
export class SolicitudFormComponent {
  private api = inject(SolicitudesService);
  private router = inject(Router);

  form = {
    titulo: '',
    descripcion: '',
    tipo: 'FEATURE',
    prioridad: 'MEDIA'
  };

  crear(){
    this.api.create({
      titulo: this.form.titulo,
      descripcion: this.form.descripcion,
      tipo: this.form.tipo as any,
      prioridad: this.form.prioridad as any
    }).subscribe(s => this.router.navigate(['/solicitudes', s.id]));
  }
}
