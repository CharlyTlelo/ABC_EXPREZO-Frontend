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
      const updated: Contrato = { ...arr[idx], ...payload, folio: arr[idx].folio };
      const copy = [...arr]; copy[idx] = updated; return copy;
    });
    this.persist();
  }

  removeByFolio(folio: string) {
    this._items.update(arr => arr.filter(c => c.folio !== folio));
    this.persist();
  }

  /** Crea o actualiza; si cambia el folio, renombra moviendo el registro. */
  upsertWithFolio(oldFolio: string | null, data: Contrato) {
    if (!oldFolio || oldFolio === data.folio) {
      // add o update in-place
      const exists = !!this.getByFolio(data.folio);
      if (exists) this.updateByFolio(data.folio, data);
      else this.add(data);
    } else {
      // rename: eliminar el viejo y agregar el nuevo
      this.removeByFolio(oldFolio);
      this.add(data);
    }
  }
}
