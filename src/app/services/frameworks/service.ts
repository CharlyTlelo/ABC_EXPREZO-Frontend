import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Framework {
  id?: string;
  tecnologia: string;
  categoria: string;
  versionActual: string;
  proximaVersion: string;
}

@Injectable({ providedIn: 'root' })
export class FrameworksService {
  private base = `${environment.apiBase}/frameworks`;
  constructor(private http: HttpClient) {}

  list(): Observable<Framework[]> { return this.http.get<Framework[]>(this.base); }
  create(body: Framework){ return this.http.post<Framework>(this.base, body); }
  update(id: string, body: Framework){ return this.http.put<Framework>(`${this.base}/${id}`, body); }
  delete(id: string){ return this.http.delete<void>(`${this.base}/${id}`); }
}
