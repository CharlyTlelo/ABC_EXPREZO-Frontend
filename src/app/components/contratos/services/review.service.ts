import { Injectable } from '@angular/core';

export type ReviewDecision = 'aprobado' | 'rechazado';

export interface ReviewEntry {
  id: string;
  folio: string;
  decision: ReviewDecision;
  reason?: string;
  timestamp: string;
}

const KEY = 'abcx-review-storage';
const DRAFT_KEY = 'abcx-review-drafts';

interface DraftRecord {
  id: string;
  folio: string;
  reason: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
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

  // Drafts
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
  clearDraftsByFolio(folio: string) {
    this.writeDrafts(this.readDrafts().filter(x => x.folio !== folio));
  }
}
