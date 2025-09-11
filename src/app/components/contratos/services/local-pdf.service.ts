import { Injectable } from '@angular/core';

export type ModeladoSection =
  | 'recoleccion'
  | 'conceptual'
  | 'logico'
  | 'fisico'
  | 'validacion';

export interface PdfMeta {
  id: string;
  folio: string;
  section: ModeladoSection;
  name: string;
  size: number;
  createdAt: string; // ISO
  ready?: boolean; // ⬅️ nuevo: marcado para validación
}

interface PdfRecord extends PdfMeta {
  data: string; // Base64 (sin el prefijo data:)
}

const KEY = 'abcx-pdfs-local';

@Injectable({ providedIn: 'root' })
export class LocalPdfService {
  private readAll(): PdfRecord[] {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]') as PdfRecord[];
    } catch {
      return [];
    }
  }
  private writeAll(arr: PdfRecord[]) {
    localStorage.setItem(KEY, JSON.stringify(arr));
  }

  async savePdf(
    folio: string,
    section: ModeladoSection,
    file: File
  ): Promise<PdfMeta> {
    if (file.type !== 'application/pdf')
      throw new Error('Solo se permiten PDFs');
    const data = await this.fileToBase64(file);
    const rec: PdfRecord = {
      id: crypto.randomUUID(),
      folio,
      section,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
      ready: false, // ⬅️ por defecto no listo
      data,
    };
    const all = this.readAll();
    all.push(rec);
    this.writeAll(all);
    const { data: _omit, ...meta } = rec;
    return meta;
  }

  listPdfs(folio: string, section: ModeladoSection): PdfMeta[] {
    const all = this.readAll();
    return all
      .filter((r) => r.folio === folio && r.section === section)
      .map(({ data: _omit, ...meta }) => meta);
  }

  listByFolio(folio: string): PdfMeta[] {
    return this.readAll()
      .filter((r) => r.folio === folio)
      .map(({ data: _omit, ...meta }) => meta);
  }

  getPdfBlob(id: string): Blob | null {
    const rec = this.readAll().find((r) => r.id === id);
    if (!rec) return null;
    const byteCharacters = atob(rec.data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++)
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/pdf' });
  }

  remove(id: string) {
    const all = this.readAll().filter((r) => r.id !== id);
    this.writeAll(all);
  }

  /** ⬅️ Nuevo: marcar/desmarcar como listo */
  setReady(id: string, ready: boolean) {
    const all = this.readAll();
    const idx = all.findIndex((r) => r.id === id);
    if (idx >= 0) {
      all[idx].ready = ready;
      this.writeAll(all);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const result = String(reader.result);
        const base64 = result.split(',')[1] || '';
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  }
}
