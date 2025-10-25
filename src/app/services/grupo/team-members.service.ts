import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeamMember {
  id?: string;
  code: string;
  fullName: string;
  title: string;
  category?: string;   // DEV, QA, MANAGEMENT...
  status?: string;     // ACTIVE, INACTIVE
  area?: string;
  avatarUrl?: string;
  displayOrder?: number;
}

@Injectable({ providedIn: 'root' })
export class TeamMembersService {
  private base = `${environment.apiBase}/members`;   // http://localhost:8082/api/v1/members

  constructor(private http: HttpClient) {}

  list(params?: { category?: string; status?: string; q?: string }): Observable<TeamMember[]> {
    const httpParams = new HttpParams({ fromObject: { ...(params || {}) } });
    return this.http.get<TeamMember[]>(this.base, { params: httpParams })
      .pipe(map(arr => [...arr].sort((a,b)=>(a.displayOrder ?? 0) - (b.displayOrder ?? 0))));
  }
}
