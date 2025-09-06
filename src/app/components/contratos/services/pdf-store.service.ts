import { Injectable } from '@angular/core';

export type ModeladoSection = 'recoleccion' | 'conceptual' | 'logico' | 'fisico' | 'validacion';

export interface PdfMeta {
  id: string;           // clave en IndexedDB
  folio: string;
  section: ModeladoSection;
  name: string;
  size: number;         // bytes
  createdAt: string;    // ISO
}

@Injectable({ providedIn: 'root' })
export class PdfStoreService {
  private dbName = 'abcx-files';
  private storeName = 'pdfs';
  private db!: IDBDatabase;

  private getDB(): Promise<IDBDatabase> {
    if (this.db) return Promise.resolve(this.db);

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('byFolio', 'folio', { unique: false });
          store.createIndex('bySection', 'section', { unique: false });
          store.createIndex('byFolioSection', ['folio', 'section'], { unique: false });
        }
      };
      req.onsuccess = () => { this.db = req.result; resolve(this.db); };
      req.onerror = () => reject(req.error);
    });
  }

  async savePdf(folio: string, section: ModeladoSection, file: File): Promise<PdfMeta> {
    if (file.type !== 'application/pdf') throw new Error('Solo se permiten PDFs');
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const meta: PdfMeta = {
      id, folio, section,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const record = { ...meta, blob: file }; // guardamos el Blob
      store.add(record);
      tx.oncomplete = () => resolve(meta);
      tx.onerror = () => reject(tx.error);
    });
  }

  async listPdfs(folio: string, section: ModeladoSection): Promise<PdfMeta[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const idx = store.index('byFolioSection');
      const req = idx.getAll(IDBKeyRange.only([folio, section]));
      req.onsuccess = () => {
        const items = (req.result as any[]).map(r => ({
          id: r.id, folio: r.folio, section: r.section,
          name: r.name, size: r.size, createdAt: r.createdAt
        })) as PdfMeta[];
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getPdfBlob(id: string): Promise<Blob> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.get(id);
      req.onsuccess = () => {
        const rec = req.result;
        if (!rec) { reject(new Error('Archivo no encontrado')); return; }
        resolve(rec.blob as Blob);
      };
      req.onerror = () => reject(req.error);
    });
  }

  async remove(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      tx.objectStore(this.storeName).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
