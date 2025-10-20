import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';


import { environment } from '../../../../environments/environment';
import { FirmaService } from '../../../services/firma.service';

@Component({  
  selector: 'app-firma-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // ← clave
  template: `
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
    <div class="field">
      <label>Usuario</label>
      <input formControlName="user" autocomplete="username" />  
    </div>

    <div class="field">
      <label>Contraseña / PIN</label>
      <input [type]="hide ? 'password' : 'text'" formControlName="pass" autocomplete="current-password" />
      <button type="button" (click)="hide = !hide" aria-label="Mostrar u ocultar">👁</button>
    </div>

    <p class="error" *ngIf="error">{{ error }}</p>

    <div class="actions">
      <button type="button" (click)="close()">Cancelar</button>
      <button type="submit" [disabled]="form.invalid">Firmar</button>
    </div>
  </form>
  `
})
export class FirmaDialogComponent {
  @Output() done = new EventEmitter<boolean>();
  private fb = inject(NonNullableFormBuilder);
  private firma = inject(FirmaService);

  hide = true;
  error = '';

  form = this.fb.group({
    user: ['', Validators.required],
    pass: ['', Validators.required],
  });

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { user, pass } = this.form.getRawValue();

    // DEMO solo en DEV
    if (environment.useMockAuth) {
      if (user.toLowerCase() === environment.mockUser && pass === environment.mockPass) {
        this.done.emit(true);
      } else {
        this.error = 'Usuario o contraseña inválidos';
      }
      return;
    }

    // QA/PROD → backend
    try {
      await this.firma.validar(user, pass);
      this.done.emit(true);
    } catch (e: any) {
      this.error = e?.error?.message || e?.message || 'No se pudo firmar';
    }
  }

  close() { this.done.emit(false); }
}
