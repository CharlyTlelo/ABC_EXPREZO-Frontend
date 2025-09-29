import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SolicitudesService } from './solicitudes.service';
import { Solicitud } from './solicitud.model';

@Component({
  selector: 'app-solicitudes-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './solicitudes-list.component.html',
  styleUrls: ['./solicitudes-list.component.scss']
})
export class SolicitudesListComponent {
  private api = inject(SolicitudesService);
  filtro = signal('');
  estado = signal('');
  solicitudes = signal<Solicitud[]>([]);

  constructor(){
    this.api.list().subscribe(list => this.solicitudes.set(list));
  }

  get filtered(){
    const q = this.filtro().toLowerCase();
    const e = this.estado();
    return this.solicitudes().filter(s =>
      (!q || s.titulo.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (!e || s.estado === e as any)
    );
  }
}
