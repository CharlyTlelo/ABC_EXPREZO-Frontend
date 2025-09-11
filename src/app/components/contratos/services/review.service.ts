import { Injectable } from '@angular/core';

export type ReviewDecision = 'aprobado' | 'rechazado';
export interface ReviewEntry {
  id: string;       // id del documento (PdfMeta.id)
  folio: string;    // folio del contrato
  decision: ReviewDecision;
  reason?: string;  // requerido si 'rechazado'
  timestamp: string;
}

const KEY = 'abcx-review-storage';

// === Drafts de comentarios (guardado inmediato por doc) ===
const DRAFT_KEY = 'abcx-review-drafts';
interface DraftRecord {
  id: string;        // PdfMeta.id
  folio: string;     // contrato
  reason: string;    // comentario
  updatedAt: string; // ISO
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  // ---- decisiones finales ----
  private readAll(): ReviewEntry[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }
  private writeAll(items: ReviewEntry[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
  }

  getByFolio(folio: string): ReviewEntry[] {
    return this.readAll().filter(r => r.folio === folio);
  }

  upsert(entry: ReviewEntry) {
    const all = this.readAll();
    const idx = all.findIndex(e => e.id === entry.id && e.folio === entry.folio);
    if (idx >= 0) all[idx] = entry; else all.push(entry);
    this.writeAll(all);
  }

  upsertMany(entries: ReviewEntry[]) {
    const all = this.readAll();
    for (const e of entries) {
      const idx = all.findIndex(x => x.id === e.id && x.folio === e.folio);
      if (idx >= 0) all[idx] = e; else all.push(e);
    }
    this.writeAll(all);
  }

  clearFolio(folio: string) {
    const rest = this.readAll().filter(e => e.folio !== folio);
    this.writeAll(rest);
  }

  // ---- drafts de comentarios ----
  private readDrafts(): DraftRecord[] {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || '[]'); }
    catch { return []; }
  }
  private writeDrafts(items: DraftRecord[]) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
  }

  getDraftReason(folio: string, id: string): string | undefined {
    return this.readDrafts().find(x => x.folio === folio && x.id === id)?.reason;
  }
  setDraftReason(folio: string, id: string, reason: string) {
    const arr = this.readDrafts();
    const idx = arr.findIndex(x => x.folio === folio && x.id === id);
    const rec: DraftRecord = { id, folio, reason, updatedAt: new Date().toISOString() };
    if (idx >= 0) arr[idx] = rec; else arr.push(rec);
    this.writeDrafts(arr);
  }
  deleteDraftReason(folio: string, id: string) {
    this.writeDrafts(this.readDrafts().filter(x => !(x.folio === folio && x.id === id)));
  }
}
