import { Component, OnInit } from '@angular/core';
import { Framework, FrameworksService } from '../../services/frameworks/service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-framework',
  standalone: true,                               // ⬅️ Standalone
  imports: [CommonModule],                        // ⬅️ Habilita *ngFor, *ngIf, etc.
  templateUrl: './framework.component.html',
  styleUrls: ['./framework.component.scss']
})

export class FrameworkComponent implements OnInit {
  technologies: Framework[] = [];
  loading = true;
  error = '';

  constructor(private api: FrameworksService) {}

  ngOnInit(): void {
    this.api.list().subscribe({
      next: data => { this.technologies = data; this.loading = false; },
      error: err => { this.error = 'No se pudo cargar Frameworks'; console.error(err); this.loading = false; }
    });
  }
}
