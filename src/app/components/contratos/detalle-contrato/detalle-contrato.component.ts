import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContratosService } from '../services/contratos.service';
import { Contrato } from '../models/contrato.model';

function slugify(value: string): string {
  return (value || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')     // espacios/_ -> -
    .replace(/[^a-z0-9\-]/g, '') // quita símbolos
    .replace(/\-+/g, '-');       // colapsa -- a -
}

@Component({
  selector: 'app-detalle-contrato',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './detalle-contrato.component.html',
  styleUrls: ['./detalle-contrato.component.scss']
})
export class DetalleContratoComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(ContratosService);
  private fb = inject(FormBuilder);

  // folio de la URL (puede venir como "agregar_contrato" la primera vez)
  oldFolio = this.route.snapshot.paramMap.get('contrato_01') || '';

  saving = false;
  guardadoOK = false;

  form = this.fb.group({
    folio: ['', [Validators.required, Validators.minLength(2)]],
    contrato: ['', [Validators.required, Validators.minLength(2)]],
    descripcion: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() {
    const existente = this.svc.getByFolio(this.oldFolio);
    if (existente) {
      this.form.patchValue({
        folio: existente.folio,
        contrato: existente.contrato,
        descripcion: existente.descripcion
      });
    } else {
      // si no existe, precargar el folio visible con el segmento recibido (editable)
      this.form.patchValue({ folio: this.oldFolio });
    }
  }

  cancelar() {
    this.router.navigate(['/abc-exprezo/contratos']);
  }

  guardar() {
  if (this.form.invalid) return;
  this.saving = true;

  const folioSlug = slugify(this.form.value.folio || '');
  const payload: Contrato = {
    folio: folioSlug,
    contrato: this.form.value.contrato!,
    descripcion: this.form.value.descripcion!,
    estatus: 'Pendiente' // siempre por default
  };

  this.svc.upsertWithFolio(this.oldFolio || null, payload);
  this.saving = false;

  // 🔹 Redirigir directo al listado
  this.router.navigate(['/abc-exprezo/contratos']);
}

}
