import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export type EstatusContrato = 'Pendiente' | 'En revisión' | 'Aprobado' | 'Rechazado';


export interface Contrato {
folio: string;
contrato: string;
descripcion: string;
estatus: EstatusContrato;
rechazadoComentario?: string | null;
}

function normalizeStatus(raw?: string | null): EstatusContrato {
const v = (raw ?? '')
.normalize('NFD')
.replace(/\p{Diacritic}/gu, '')
.toLowerCase()
.trim();
if (v.includes('aprob')) return 'Aprobado';
if (v.includes('rechaz')) return 'Rechazado';
if (v.includes('revi')) return 'En revisión';
return 'Pendiente';
}

@Injectable({ providedIn: 'root' })
export class ContratosService {
private readonly KEY = 'contratos';
private readonly base = `${environment.apiBase}/contratos`;


items: WritableSignal<Contrato[]> = signal<Contrato[]>(this.readLocal());


constructor(private http: HttpClient) {}

// -------- Persistencia local --------
private readLocal(): Contrato[] {
const raw = JSON.parse(localStorage.getItem(this.KEY) || '[]') as any[];
return raw.map(c => ({ ...c, estatus: normalizeStatus(c.estatus) })) as Contrato[];
}
private writeLocal(list: Contrato[]) { localStorage.setItem(this.KEY, JSON.stringify(list)); }


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


// -------- Lectura --------
list(): Observable<Contrato[]> {
return this.http.get<Contrato[]>(this.base).pipe(
map(arr => arr.map(c => ({ ...c, estatus: normalizeStatus(c.estatus) }))),
tap(arr => { this.items.set(arr); this.writeLocal(arr); }),
catchError(() => {
const arr = this.readLocal();
this.items.set(arr);
return of(arr);
})
);
}


fetchByFolio$(folio: string): Observable<Contrato> {
return this.http.get<Contrato>(`${this.base}/${folio}`).pipe(
map(c => ({ ...c, estatus: normalizeStatus(c.estatus) }))
);
}

// 🔙 Back-compat para componentes que leen del store local
getByFolio(folio: string): Contrato | undefined {
return this.items().find(c => c.folio === folio);
}


all(): Contrato[] { return this.items().map(c => ({ ...c })); }
getByStatus(status: EstatusContrato): Contrato[] { return this.items().filter(c => c.estatus === status); }


// -------- Crear --------
add(payload: Partial<Contrato>): void {
this.http.post<Contrato>(this.base, payload).pipe(
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


// -------- Actualizar --------
updateByFolio(folio: string, patch: Partial<Contrato>): void {
this.http.patch<Contrato>(`${this.base}/${folio}`, patch).pipe(
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
this.http.patch<Contrato>(`${this.base}/${folio}/status`, { status: normalized, comment: comentario }).pipe(
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


markEnRevision(folio: string) { this.setStatus(folio, 'En revisión'); }
approve(folio: string) { this.setStatus(folio, 'Aprobado'); }
reject(folio: string, comentario?: string) {
this.setStatus(folio, 'Rechazado', comentario);
// Si quisieras volver a 'Pendiente' inmediatamente, activa:
// this.setStatus(folio, 'Pendiente', comentario);
}


// -------- Eliminar --------
removeByFolio(folio: string): void {
this.http.delete<void>(`${this.base}/${folio}`).pipe(
tap(() => this.removeLocal(folio)),
catchError(() => { this.removeLocal(folio); return of(void 0); })
).subscribe();
}
}