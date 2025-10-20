import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-firma-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <div class="field mb-2">
        <label>Usuario</label>
        <input
          class="form-control"
          formControlName="user"
          autocomplete="username"
        />
      </div>
      <div class="field mb-2">
        <label>Contraseña / PIN</label>
        <input
          class="form-control"
          [type]="hide ? 'password' : 'text'"
          formControlName="pass"
          autocomplete="current-password"
        />
        <button
          type="button"
          class="btn btn-link p-0"
          (click)="hide = !hide"
          aria-label="Mostrar u ocultar"
        >
          👁
        </button>
      </div>
      <p class="text-danger" *ngIf="error">{{ error }}</p>
      <div class="d-flex justify-content-end gap-2">
        <button
          type="button"
          class="btn btn-outline-secondary"
          (click)="close()"
        >
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary" [disabled]="form.invalid">
          Firmar
        </button>
      </div>
    </form>
  `,
})
export class FirmaDialogComponent {
  @Output() done = new EventEmitter<boolean>();
  private fb = inject(NonNullableFormBuilder);
  hide = true;
  error = '';
  form = this.fb.group({
    user: ['', Validators.required],
    pass: ['', Validators.required],
  });

  submit() {
    const { user, pass } = this.form.getRawValue();
    if (environment.useMockAuth) {
      if (
        user.toLowerCase() === environment.mockUser &&
        pass === environment.mockPass
      )
        this.done.emit(true);
      else this.error = 'Usuario o contraseña inválidos';
      return;
    }
    // TODO: llamar a servicio real de validación
    this.error = 'Validación de firma no configurada';
  }
  close() {
    this.done.emit(false);
  }
}
