import { Injectable } from '@angular/core';

export type ReviewFlag = 'aprobado' | 'rechazado' | null;

/** Las 5 secciones que usa el componente */
export type ModeladoSection =
  | 'recoleccion'
  | 'conceptual'
  | 'logico'
  | 'fisico'
  | 'validacion';

export interface PdfMeta {
  id: string;                 // UID
  folio: string;              // contrato al que pertenece
  section: ModeladoSection;   // sección
  name: string;
  size: number;
  createdAt: string;          // ISO
  ready: boolean;             // marcado como listo por el usuario
  review: ReviewFlag;         // null | aprobado | rechazado
  reviewReason?: string;
  reviewAt?: string;          // ISO
  /** Contenido real en base64 (solo en storage; no lo expongas al UI) */
  data?: string;
}

@Injectable({ providedIn: 'root' })
export class LocalPdfService {
  private KEY = 'pdfs';

  // ----------------- Storage utils -----------------
  private readAll(): PdfMeta[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  }
  private writeAll(list: PdfMeta[]) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
  private uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(String(reader.result));
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });
  }

  private dataURLToBlob(dataURL: string): Blob | null {
    try {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8 = new Uint8Array(n);
      while (n--) u8[n] = bstr.charCodeAt(n);
      return new Blob([u8], { type: mime });
    } catch {
      return null;
    }
  }

  // ----------------- API principal -----------------

  /** Lista TODO por folio */
  listByFolio(folio: string): PdfMeta[] {
    return this.readAll().filter(x => x.folio === folio);
  }

  /** Lista por folio + sección (la que usa tu componente) */
  listByFolioAndSection(folio: string, section: ModeladoSection): PdfMeta[] {
    return this.readAll().filter(x => x.folio === folio && x.section === section);
  }

  /** Agrupado por sección (por si lo necesitas en otros lados) */
  listByFolioGroupBySection(folio: string): Record<ModeladoSection, PdfMeta[]> {
    const out = {} as Record<ModeladoSection, PdfMeta[]>;
    for (const s of ['recoleccion','conceptual','logico','fisico','validacion'] as ModeladoSection[]) {
      out[s] = [];
    }
    for (const p of this.listByFolio(folio)) {
      (out[p.section] ??= []).push(p);
    }
    return out;
  }

  /** Alta de archivo (subida inicial) */
  async addFile(folio: string, section: ModeladoSection, file: File): Promise<PdfMeta> {
    const all = this.readAll();
    const b64 = await this.fileToBase64(file);
    const meta: PdfMeta = {
      id: this.uid(),
      folio,
      section,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
      ready: false,
      review: null,
      data: b64,
    };
    all.push(meta);
    this.writeAll(all);
    const { data: _omit, ...clean } = meta;
    return clean;
  }

  /** Reemplazo de un PDF ya existente (resetea ready/review) */
  async replaceFile(id: string, file: File): Promise<PdfMeta> {
    const all = this.readAll();
    const i = all.findIndex(r => r.id === id);
    if (i < 0) throw new Error('Archivo no encontrado');
    const b64 = await this.fileToBase64(file);
    all[i] = {
      ...all[i],
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
      ready: false,           // se vuelve a marcar manualmente
      review: null,           // se limpia estatus de revisión
      reviewReason: undefined,
      reviewAt: undefined,
      data: b64,
    };
    this.writeAll(all);
    const { data: _omit, ...clean } = all[i];
    return clean;
  }

  /** Marcar/Desmarcar “Listo” (nombre que ya usa tu componente) */
  toggleReady(id: string, ready: boolean): void {
    const all = this.readAll();
    const i = all.findIndex(r => r.id === id);
    if (i < 0) return;
    all[i].ready = ready;
    this.writeAll(all);
  }

  /** Limpia estado de revisión (para cuando el usuario vuelve a marcar “Listo”) */
  clearReview(id: string): void {
    const all = this.readAll();
    const i = all.findIndex(r => r.id === id);
    if (i < 0) return;
    all[i].review = null;
    all[i].reviewReason = undefined;
    all[i].reviewAt = undefined;
    this.writeAll(all);
  }

  /** Set de revisión (lo usa el módulo de “revisión”) */
  setReview(id: string, flag: 'aprobado' | 'rechazado', reason?: string): void {
    const all = this.readAll();
    const i = all.findIndex(r => r.id === id);
    if (i < 0) return;
    all[i].review = flag;
    all[i].reviewReason = reason;
    all[i].reviewAt = new Date().toISOString();
    this.writeAll(all);
  }

  /** Blob para descargar/exportar ZIP */
  getPdfBlob(id: string): Blob | null {
    const item = this.readAll().find(x => x.id === id);
    if (!item?.data) return null;
    return this.dataURLToBlob(item.data);
  }

  /** Eliminar del storage */
  remove(id: string): void {
    const next = this.readAll().filter(x => x.id !== id);
    this.writeAll(next);
  }

  // -------- Helpers opcionales --------
  humanSize(bytes: number): string { return `${Math.round(bytes / 1024)} KB`; }
}
