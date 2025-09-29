import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-firma-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="fd-backdrop" (click)="close()"></div>
  <div class="fd-card">
    <h5 class="mb-3">Firmar para continuar</h5>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="mb-2">
        <label class="form-label">Usuario</label>
        <input class="form-control" formControlName="user" autocomplete="username">
      </div>
      <div class="mb-3">
        <label class="form-label">Contraseña</label>
        <input type="password" class="form-control" formControlName="pass" autocomplete="current-password">
      </div>
      <div class="d-flex gap-2 justify-content-end">
        <button type="button" class="btn btn-outline-secondary" (click)="close()">Cancelar</button>
        <button class="btn btn-primary" [disabled]="form.invalid">Continuar</button>
      </div>
      <div class="text-danger small mt-2" *ngIf="error">{{ error }}</div>
    </form>
  </div>
  `,
  styles: [`
    .fd-backdrop{position:fixed;inset:0;background:#0006;z-index:1040}
    .fd-card{position:fixed;inset:0;margin:auto;max-width:400px;background:#fff;border-radius:14px;
      padding:16px;box-shadow:0 10px 30px #0003;z-index:1050}
  `]
})
export class FirmaDialogComponent {
  @Output() done = new EventEmitter<boolean>();
  error = '';
  form = this.fb.group({ user: ['', Validators.required], pass: ['', Validators.required] });
  constructor(private fb: FormBuilder) {}
  submit() {
    const { user, pass } = this.form.value;
    if ((user || '').toLowerCase() === 'admin' && pass === '1234') this.done.emit(true);
    else this.error = 'Usuario o contraseña inválidos';
  }
  close() { this.done.emit(false); }
}
