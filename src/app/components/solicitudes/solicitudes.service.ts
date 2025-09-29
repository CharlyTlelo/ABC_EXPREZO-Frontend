import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Solicitud, EstadoSolicitud } from './solicitud.model';

const STORAGE_KEY = 'abc-expreso-solicitudes';

function seed(): Solicitud[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'SOL-0001',
      titulo: 'Alta de módulo de contratos',
      descripcion: 'Como admin quiero ...',
      tipo: 'FEATURE',
      prioridad: 'ALTA',
      estado: 'LEVANTAMIENTO',
      solicitante: { id: 'u-01', nombre: 'Charly' },
      responsableActual: { id: 'u-02', nombre: 'Arquitecto' },
      fechas: { creada: now, aprobada: null, liberada: null },
      checklist: {
        levantamiento: { completo: true, adjuntos: [] },
        reqTecnico: { completo: false, adjuntos: [] },
        aprobacion: { completo: false, adjuntos: [] },
      },
      desarrollo: { porcentaje: 0 },
      qa: { resultado: 'PENDIENTE', evidencias: [] },
      uat: { resultado: 'PENDIENTE', actaUrl: '' },
      liberacion: { releaseTag: '', fecha: null },
      historial: [{ fecha: now, usuario: 'sistema', accion: 'CREADA' }],
      bloqueada: false,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private state$ = new BehaviorSubject<Solicitud[]>(this.load());

  private load(): Solicitud[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw) as Solicitud[];
    } catch {
      return seed();
    }
  }

  private persist(list: Solicitud[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  list(): Observable<Solicitud[]> {
    return this.state$.asObservable();
  }

  findById(id: string): Observable<Solicitud | undefined> {
    return of(this.state$.value.find(s => s.id === id));
  }

  create(partial: Partial<Solicitud>): Observable<Solicitud> {
    const list = [...this.state$.value];
    const id = this.nextId();
    const now = new Date().toISOString();
    const nueva: Solicitud = {
      id,
      titulo: partial.titulo || 'Nueva solicitud',
      descripcion: partial.descripcion || '',
      tipo: partial.tipo || 'FEATURE',
      prioridad: partial.prioridad || 'MEDIA',
      estado: 'PENDIENTE',
      solicitante: partial.solicitante || { id: 'u-self', nombre: 'Yo' },
      responsableActual: partial.responsableActual,
      fechas: { creada: now, aprobada: null, liberada: null },
      checklist: partial.checklist || {
        levantamiento: { completo: false, adjuntos: [] },
        reqTecnico: { completo: false, adjuntos: [] },
        aprobacion: { completo: false, adjuntos: [] },
      },
      desarrollo: { porcentaje: 0 },
      qa: { resultado: 'PENDIENTE', evidencias: [] },
      uat: { resultado: 'PENDIENTE', actaUrl: '' },
      liberacion: { releaseTag: '', fecha: null },
      historial: [{ fecha: now, usuario: 'sistema', accion: 'CREADA' }],
      bloqueada: false,
    };
    list.unshift(nueva);
    this.state$.next(list);
    this.persist(list);
    return of(nueva);
  }

  update(id: string, changes: Partial<Solicitud>): Observable<Solicitud | undefined> {
    const list = this.state$.value.map(s => (s.id === id ? { ...s, ...changes } : s));
    this.state$.next(list);
    this.persist(list);
    return this.findById(id);
  }

  toggleBloqueo(id: string, bloqueada: boolean) {
    return this.update(id, { bloqueada });
  }

  transition(id: string, to: EstadoSolicitud, comentario = ''): Observable<Solicitud | undefined> {
    const s = this.state$.value.find(x => x.id === id);
    if (!s) return of(undefined);
    const from = s.estado;
    // Reglas mínimas
    const valid = this.isValidTransition(from, to, s);
    if (!valid) throw new Error('Transición inválida según reglas de negocio');
    const now = new Date().toISOString();
    const historial = [...s.historial, { fecha: now, usuario: 'yo', accion: 'CAMBIO_ESTADO', de: from, a: to, comentario }];
    const fechas = { ...s.fechas };
    if (to === 'APROBADA') fechas.aprobada = now;
    if (to === 'LIBERADA') fechas.liberada = now;
    return this.update(id, { estado: to, historial, fechas });
  }

  private isValidTransition(from: EstadoSolicitud, to: EstadoSolicitud, s: Solicitud): boolean {
    const linear: EstadoSolicitud[] = ['PENDIENTE','LEVANTAMIENTO','REVISION','APROBADA','DESARROLLO','QA','UAT','LIBERADA','CERRADA'];
    const idxFrom = linear.indexOf(from);
    const idxTo = linear.indexOf(to);
    if (to === 'RECHAZADA') return ['REVISION'].includes(from);
    if (from === 'RECHAZADA' && to === 'LEVANTAMIENTO') return true;
    // Reglas de checklist para pasar a REVISION
    if (to === 'REVISION') {
      const ok = s.checklist.levantamiento.completo && s.checklist.reqTecnico.completo;
      if (!ok) return false;
    }
    // Solo permitir avanzar de uno en uno hacia adelante
    return idxTo - idxFrom === 1;
  }

  private nextId(): string {
    const prefix = 'SOL-';
    const nums = this.state$.value
      .map(s => parseInt(s.id.replace(prefix, ''), 10))
      .filter(n => !isNaN(n));
    const next = (nums.length ? Math.max(...nums) + 1 : 1).toString().padStart(4, '0');
    return prefix + next;
  }
}
