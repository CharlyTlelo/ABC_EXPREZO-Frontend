import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';

const API = '/api/contratos';

export type EstatusContrato = 'Pendiente' | 'En revisión' | 'Aprobado' | 'Rechazado';

export interface Contrato {
  folio: string;
  contrato: string;
  descripcion: string;
  estatus: EstatusContrato;
  rechazadoComentario?: string | null;
}

/** Normaliza cualquier string a uno de los 4 estados oficiales */
function normalizeStatus(raw?: string | null): EstatusContrato {
  const v = (raw ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  if (v.includes('aprob')) return 'Aprobado';
  if (v.includes('rechaz')) return 'Rechazado';
  if (v.includes('revi')) return 'En revisión';
  return 'Pendiente';
}

@Injectable({ providedIn: 'root' })
export class ContratosService {
  private readonly KEY = 'contratos';

  /** Fuente de verdad en el front (reflejada también en localStorage) */
  items: WritableSignal<Contrato[]> = signal<Contrato[]>(this.readLocal());

  constructor(private http: HttpClient) {}

  // ---------- Persistencia local ----------
  private readLocal(): Contrato[] {
    const raw = JSON.parse(localStorage.getItem(this.KEY) || '[]') as any[];
    return raw.map(c => ({ ...c, estatus: normalizeStatus(c.estatus) })) as Contrato[];
  }

  private writeLocal(list: Contrato[]) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }

  private upsertLocal(c: Contrato) {
    const u: Contrato = { ...c, estatus: normalizeStatus(c.estatus) };
    const curr = this.items();
    const idx = curr.findIndex(x => x.folio === u.folio);
    const next = curr.slice();
    if (idx >= 0) next[idx] = u; else next.unshift(u);
    this.items.set(next);
    this.writeLocal(next);
  }

  private removeLocal(folio: string) {
    const next = this.items().filter(x => x.folio !== folio);
    this.items.set(next);
    this.writeLocal(next);
  }

  // ---------- Lectura / Listado ----------
  list(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(API).pipe(
      map(arr => arr.map(c => ({ ...c, estatus: normalizeStatus(c.estatus) }))),
      tap(arr => { this.items.set(arr); this.writeLocal(arr); }),
      catchError(() => {
        const arr = this.readLocal();
        this.items.set(arr);
        return of(arr);
      })
    );
  }

  all(): Contrato[] { return this.items().map(c => ({ ...c })); }

  getByStatus(status: EstatusContrato): Contrato[] {
    return this.items().filter(c => c.estatus === status);
  }

  getByFolio(folio: string): Contrato | undefined {
    return this.items().find(c => c.folio === folio);
  }

  // ---------- Crear ----------
  add(payload: Partial<Contrato>): void {
    this.http.post<Contrato>(API, payload).pipe(
      map(c => ({ ...c, estatus: normalizeStatus(c.estatus) })),
      catchError(() => {
        if (payload.folio && payload.contrato) {
          const nuevo: Contrato = {
            folio: String(payload.folio),
            contrato: String(payload.contrato),
            descripcion: String(payload.descripcion ?? ''),
            estatus: normalizeStatus(payload.estatus ?? 'Pendiente'),
            rechazadoComentario: null,
          };
          this.upsertLocal(nuevo);
        }
        return of(null);
      })
    ).subscribe(c => { if (c) this.upsertLocal(c); });
  }

  // ---------- Actualizar ----------
  updateByFolio(folio: string, patch: Partial<Contrato>): void {
    this.http.patch<Contrato>(`${API}/${folio}`, patch).pipe(
      map(c => ({ ...c, estatus: normalizeStatus(c.estatus) })),
      catchError(() => {
        const curr = this.getByFolio(folio);
        if (curr) this.upsertLocal({ ...curr, ...patch } as Contrato);
        return of(null);
      })
    ).subscribe(c => { if (c) this.upsertLocal(c); });
  }

  setStatus(folio: string, estatus: EstatusContrato, comentario?: string) {
    const normalized = normalizeStatus(estatus);
    this.http.patch<Contrato>(`${API}/${folio}/status`, { status: normalized, comment: comentario }).pipe(
      map(c => ({ ...c, estatus: normalizeStatus(c.estatus) })),
      tap(c => this.upsertLocal(c)),
      catchError(() => {
        const curr = this.getByFolio(folio);
        if (curr) {
          this.upsertLocal({
            ...curr,
            estatus: normalized,
            rechazadoComentario: normalized === 'Rechazado' ? (comentario || null) : null,
          });
        }
        return of(null);
      })
    ).subscribe();
  }

  // Azúcares
  markEnRevision(folio: string) { this.setStatus(folio, 'En revisión'); }
  approve(folio: string)        { this.setStatus(folio, 'Aprobado'); }
  reject(folio: string, comentario?: string) {
    this.setStatus(folio, 'Rechazado', comentario);
    this.setStatus(folio, 'Pendiente', comentario);
  }

  // ---------- Eliminar ----------
  removeByFolio(folio: string): void {
    this.http.delete<void>(`${API}/${folio}`).pipe(
      tap(() => this.removeLocal(folio)),
      catchError(() => { this.removeLocal(folio); return of(void 0); })
    ).subscribe();
  }
}
