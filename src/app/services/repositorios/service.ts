import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RepoItem {
  id?: string;
  proyecto: string;
  repositorio: string;
  url?: string;
}

@Injectable({ providedIn: 'root' })
export class RepositoriosService {
  private base = `${environment.apiBase}/repos`;
  constructor(private http: HttpClient) {}
  list(): Observable<RepoItem[]> { return this.http.get<RepoItem[]>(this.base); }
  create(b: RepoItem){ return this.http.post<RepoItem>(this.base, b); }
  update(id: string, b: RepoItem){ return this.http.put<RepoItem>(`${this.base}/${id}`, b); }
  delete(id: string){ return this.http.delete<void>(`${this.base}/${id}`); }
}
