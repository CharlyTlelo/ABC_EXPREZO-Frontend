import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ContratosService } from '../services/contratos.service';
import { Contrato } from '../models/contrato.model';

function slugify(value: string): string {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-');
}

@Component({
  selector: 'app-agregar-contrato',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './agregar-contrato.component.html',
  styleUrls: ['./agregar-contrato.component.scss']
})
export class AgregarContratoComponent {
  private fb = inject(FormBuilder);
  private svc = inject(ContratosService);
  private router = inject(Router);

  saving = false;
  guardadoOK = false;
  folioSlug = '';

  form = this.fb.group({
    folio: ['', [Validators.required, Validators.minLength(2)]],
    contrato: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
  });

  get vistaPreviaFolio() { return this.folioSlug; }

  ngOnInit() {
    this.form.get('folio')!.valueChanges.subscribe(v => {
      this.folioSlug = slugify(v || '');
    });
  }

  guardar() {
    if (this.form.invalid) return;
    this.saving = true;

    const f = this.folioSlug || slugify(this.form.value.folio || '');
    const payload: Contrato = {
      folio: f,
      contrato: this.form.value.contrato!,
      descripcion: this.form.value.descripcion!,
      estatus: 'Pendiente'
    };

    this.svc.add(payload);
    this.saving = false;
    this.router.navigate(['/abc-exprezo/contratos']);
  }
}
