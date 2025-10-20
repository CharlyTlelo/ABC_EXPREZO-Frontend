import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FirmaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}/firmas`;

  /**
   * Valida credenciales de firma con el backend.
   * Ajusta URL/payload según tu API real (p. ej. /requerimientos/:folio/firmar).
   */
  validar(user: string, pass: string): Promise<void> {
    return this.http.post<void>(`${this.baseUrl}/validar`, { user, pass }).toPromise();
  }
}
