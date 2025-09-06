import { Injectable, signal } from '@angular/core';
import { Contrato } from '../models/contrato.model';

const KEY = 'contratos-storage';

@Injectable({ providedIn: 'root' })
export class ContratosService {
  private _items = signal<Contrato[]>(this.load());
  items = this._items.asReadonly();

  private load(): Contrato[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  private persist(){ localStorage.setItem(KEY, JSON.stringify(this._items())); }

  list(): Contrato[] { return this._items(); }

  getByFolio(folio: string): Contrato | undefined {
    return this._items().find(c => c.folio === folio);
  }

  add(c: Contrato) {
    this._items.update(arr => [...arr, c]);
    this.persist();
  }

  updateByFolio(folio: string, payload: Partial<Contrato>) {
    this._items.update(arr => {
      const idx = arr.findIndex(c => c.folio === folio);
      if (idx === -1) return arr;
      const copy = [...arr];
      copy[idx] = { ...copy[idx], ...payload, folio: copy[idx].folio };
      return copy;
    });
    this.persist();
  }

  removeByFolio(folio: string) {
    this._items.update(arr => arr.filter(c => c.folio !== folio));
    this.persist();
  }
}
