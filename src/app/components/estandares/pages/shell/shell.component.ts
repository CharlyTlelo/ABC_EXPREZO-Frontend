import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

/**
 * Menú lateral de Estándares con acordeón de múltiples secciones abiertas.
 * - Transición CSS (sin @angular/animations)
 * - scrollIntoView al abrir
 * - Activo por URL
 */

@Component({
  selector: 'app-estandares-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class EstandaresShellComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Cambia aquí si tu base real es /abc-exprezo */
  private readonly BASE = '/abc-expreso/estandares';
  private readonly LS_KEY = 'estandares.openSections';

  /** Obtiene {section, area} desde la URL actual (sin query/fragment). */
  private getCurrentFromUrl(): { section: string; area: string } {
    const tree = this.router.parseUrl(this.router.url);
    const primary = tree.root.children['primary'];
    const segs = primary?.segments.map((s) => s.path) ?? [];
    const i = segs.indexOf('estandares');
    return {
      section: i >= 0 && i + 1 < segs.length ? segs[i + 1] : '',
      area: i >= 0 && i + 2 < segs.length ? segs[i + 2] : '',
    };
  }

  /** Secciones del menú */
  sections = [
    { key: 'administrador', title: 'Administrador Exprezo' },
    { key: 'ecommerce', title: 'E-Commerce Exprezo' },
    { key: 'abc', title: 'ABC Exprezo' },
  ];

  /** Submenús por sección */
  areasBySection: Record<string, { key: string; title: string }[]> = {
    administrador: [
      { key: 'frontend', title: 'Frontend' },
      { key: 'backend', title: 'Backend' },
      { key: 'database', title: 'Base de datos' },
    ],
    ecommerce: [
      { key: 'frontend', title: 'Frontend' },
      { key: 'backend', title: 'Backend' },
      { key: 'database', title: 'Base de datos' },
    ],
    abc: [
      { key: 'frontend', title: 'Frontend' },
      { key: 'backend', title: 'Backend' },
      { key: 'database', title: 'Base de datos' },
    ],
  };

  /** Estado: conjunto de secciones abiertas (permite múltiples) */
  openSections = new Set<string>();

  /** Sección actual detectada en URL (segmento después de "estandares") */
  sectionParam = computed(() => {
    const param = this.route.snapshot.paramMap.get('section');
    if (param) return param;
    const segments = this.router.url.split('/');
    const idx = segments.indexOf('estandares');
    return idx >= 0 && idx + 1 < segments.length ? segments[idx + 1] : '';
  });

  /** Área actual (último segmento de la URL) */
  currentArea = computed(() => {
    const seg = this.router.url.split('/');
    return seg[seg.length - 1] ?? '';
  });

  ngOnInit(): void {
    // Si NO quieres recordar nada: comenta estas 3 líneas
    try {
      const raw = localStorage.getItem(this.LS_KEY);
      if (raw)
        JSON.parse(raw)?.forEach((k: string) => this.openSections.add(k));
    } catch {}

    const autopen = this.route.snapshot.queryParamMap.get('autopen') === '1';
    if (autopen) {
      const cur = this.sectionParam();
      if (cur) this.openSections.add(cur);
    }
  }

  /** Persistir estado de secciones abiertas */
  private persistOpen() {
    try {
      localStorage.setItem(this.LS_KEY, JSON.stringify([...this.openSections]));
    } catch {}
  }

  /** ¿Está abierta una sección? */
  isSectionOpen(sectionKey: string): boolean {
    return this.openSections.has(sectionKey);
  }

  /** Alterna apertura de una sección (múltiples permitidas) */
  toggleSection(sectionKey: string): void {
    if (this.openSections.has(sectionKey)) {
      this.openSections.delete(sectionKey);
    } else {
      this.openSections.add(sectionKey);
      // desplazamiento suave al abrir
      setTimeout(() => {
        document
          .querySelector<HTMLElement>(`.submenu-wrap[data-key="${sectionKey}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 0);
    }
    this.persistOpen();
  }

  /** ¿El pill está activo según la URL? */
  isAreaActive(sectionKey: string, areaKey: string): boolean {
    const cur = this.getCurrentFromUrl();
    return cur.section === sectionKey && cur.area === areaKey;
  }

  /** Navega a un área dentro de una sección (comandos absolutos, sin ambigüedad) */
  go(sectionKey: string, areaKey: string): void {
    this.router.navigate([
      '/',
      'abc-expreso',
      'estandares',
      sectionKey,
      areaKey,
    ]);
  }

  /** (opcional) Navegar a la sección abriendo su primera área */
  navigateToSection(sectionKey: string): void {
    const defaultArea = this.areasBySection[sectionKey]?.[0]?.key || 'frontend';
    this.router.navigate([
      '/',
      'abc-expreso',
      'estandares',
      sectionKey,
      defaultArea,
    ]);
  }

  /** Trackers para *ngFor */
  trackSection = (_: number, s: { key: string }) => s.key;
  trackArea = (_: number, a: { key: string }) => a.key;
}
