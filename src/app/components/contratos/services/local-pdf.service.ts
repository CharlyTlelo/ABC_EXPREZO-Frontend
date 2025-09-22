import { Injectable } from '@angular/core';

export type ModeladoSection = 'recoleccion' | 'conceptual' | 'logico' | 'fisico' | 'validacion';

export interface PdfMeta {
  id: string;
  folio: string;
  section: ModeladoSection;
  name: string;
  size: number;
  createdAt: string;
  ready?: boolean;
  review?: 'aprobado' | 'rechazado' | null;
  reviewReason?: string;
  reviewAt?: string;
}

interface PdfRecord extends PdfMeta { data: string; }

const KEY = 'abcx-pdf-storage';

@Injectable({ providedIn: 'root' })
export class LocalPdfService {
  private readAll(): PdfRecord[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  private writeAll(items: PdfRecord[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  listByFolio(folio: string): PdfMeta[] {
    return this.readAll()
      .filter(r => r.folio === folio)
      .map(({ data: _omit, ...meta }) => meta);
  }

  listByFolioAndSection(folio: string, section: ModeladoSection): PdfMeta[] {
    return this.readAll()
      .filter(r => r.folio === folio && r.section === section)
      .map(({ data: _omit, ...meta }) => meta);
  }

  async addFile(folio: string, section: ModeladoSection, file: File): Promise<PdfMeta> {
    const base64 = await this.fileToBase64(file);
    const meta: PdfRecord = {
      id: crypto.randomUUID(),
      folio, section,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
      ready: false,
      review: null,
      reviewReason: undefined,
      reviewAt: undefined,
      data: base64
    };
    const all = this.readAll();
    all.push(meta);
    this.writeAll(all);
    const { data: _omit, ...clean } = meta;
    return clean;
  }

  toggleReady(id: string, ready: boolean) {
    const all = this.readAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx].ready = ready;
      this.writeAll(all);
    }
  }

  setReview(id: string, decision: 'aprobado' | 'rechazado', reason?: string) {
    const all = this.readAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx].review = decision;
      all[idx].reviewReason = decision === 'rechazado' ? (reason || '') : undefined;
      all[idx].reviewAt = new Date().toISOString();
      if (decision === 'rechazado') all[idx].ready = false;
      this.writeAll(all);
    }
  }

  clearReview(id: string) {
    const all = this.readAll();
    const idx = all.findIndex(r => r.id === id);
    if (idx !== -1) {
      all[idx].review = null;
      all[idx].reviewReason = undefined;
      all[idx].reviewAt = undefined;
      this.writeAll(all);
    }
  }

  getPdfBlob(id: string): Blob | null {
    const rec = this.readAll().find(r => r.id === id);
    if (!rec) return null;
    const bytes = atob(rec.data);
    const buf = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
    return new Blob([buf], { type: 'application/pdf' });
  }

  remove(id: string) {
    const all = this.readAll().filter(r => r.id !== id);
    this.writeAll(all);
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(fr.error);
      fr.onload = () => resolve(String(fr.result).split(',')[1] || '');
      fr.readAsDataURL(file);
    });
  }
}
