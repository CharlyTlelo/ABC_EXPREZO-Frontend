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
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/\-+/g, '-');
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

  oldFolio = this.route.snapshot.paramMap.get('folio') || '';
  saving = false;

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
    const payload: Partial<Contrato> = {
      folio: folioSlug,
      contrato: this.form.value.contrato!,
      descripcion: this.form.value.descripcion!,
      estatus: 'Pendiente'
    };

    // Si cambió el folio, elimina el viejo y agrega como nuevo
    if (this.oldFolio !== folioSlug) {
      const current = this.svc.getByFolio(this.oldFolio);
      if (current) this.svc.removeByFolio(this.oldFolio);
      this.svc.add(payload as Contrato);
    } else {
      this.svc.updateByFolio(this.oldFolio, payload);
    }

    this.saving = false;
    this.router.navigate(['/abc-exprezo/contratos']);
  }
}
