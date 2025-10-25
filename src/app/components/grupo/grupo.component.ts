import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {
  TeamMembersService,
  TeamMember,
} from '../../services/grupo/team-members.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-grupo',
  standalone: true, // ⬅️ si no está, añádelo
  imports: [CommonModule], // ⬅️ agrega CommonModule
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.scss', './grupo.component.css'],
})
export class GrupoComponent implements OnInit {
  members$!: Observable<TeamMember[]>;
  loading = true;
  error = '';

  constructor(private api: TeamMembersService) {}

  ngOnInit(): void {
    this.members$ = this.api.list();
    this.members$.subscribe({
      next: (_) => (this.loading = false),
      error: (_) => {
        this.error = 'Error cargando equipo';
        this.loading = false;
      },
    });
  }

  private readonly colorByCat: Record<string, string> = {
    MANAGEMENT: '#b20505',
    DEV: '#148d0a',
    QA: '#38a3b0',
    ARCHITECT: '#38a3b0',
    COORDINATOR: '#ff9a02ff',
    DBA: '#38a3b0',
    SUPPORT: '#38a3b0',
  };

  cardColor(m: TeamMember) {
    return this.colorByCat[m.category ?? ''] ?? '#38a3b0';
  }
}
