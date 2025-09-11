import { Routes } from '@angular/router';

// === Componentes existentes del proyecto (deja los tuyos tal cual)
import { GrupoComponent } from './components/grupo/grupo.component';
import { FrameworkComponent } from './components/framework/framework.component';
import { ArquitecturaComponent } from './components/arquitectura/arquitectura.component';
import { AwsComponent } from './components/aws/aws.component';
import { RepositoriosComponent } from './components/repositorios/repositorios.component';
import { SwaggerComponent } from './components/swagger/swagger.component';

// Estándares (deja los tuyos)
import { EstandaresLandingComponent } from './components/estandares/pages/landing/landing.component';
import { EstandaresShellComponent } from './components/estandares/pages/shell/shell.component';
import { FrontendReportComponent } from './components/estandares/pages/frontend/frontend-report.component';
import { BackendReportComponent } from './components/estandares/pages/backend/backend-report.component';
import { DatabaseEditorComponent } from './components/estandares/pages/database/database-editor.component';
import { EcommerceMaquetacionComponent } from './components/estandares/pages/ecommerce/ecommerce-maquetacion.component';
import { EcommerceFrontendComponent } from './components/estandares/pages/ecommerce/ecommerce-frontend.component';
import { EcommerceBackendComponent } from './components/estandares/pages/ecommerce/ecommerce-backend.component';

export const routes: Routes = [
  // === Rutas
  { path: 'abc-exprezo/grupo', component: GrupoComponent },
  { path: 'abc-exprezo/framework', component: FrameworkComponent },
  { path: 'abc-exprezo/arquitectura', component: ArquitecturaComponent },
  { path: 'abc-exprezo/aws', component: AwsComponent },
  { path: 'abc-exprezo/repositorios', component: RepositoriosComponent },
  { path: 'abc-exprezo/swagger', component: SwaggerComponent },

  // === Contratos: listado
  {
    path: 'abc-exprezo/contratos',
    loadComponent: () =>
      import('./components/contratos/contratos.component').then(
        (m) => m.ContratosComponent
      ),
  },
  // Alta
  {
    path: 'abc-exprezo/contratos/agregar_contrato',
    loadComponent: () =>
      import(
        './components/contratos/agregar-contrato/agregar-contrato.component'
      ).then((m) => m.AgregarContratoComponent),
  },
  // Modelado NUEVO formato: /contratos/modelado/:folio
  {
    path: 'abc-exprezo/contratos/modelado/:folio',
    loadComponent: () =>
      import(
        './components/contratos/modelado-contrato/modelado-contrato.component'
      ).then((m) => m.ModeladoContratoComponent),
  },
  // Compatibilidad ruta vieja: /contratos/:folio/modelado  -> redirige
  {
    path: 'abc-exprezo/contratos/:folio/modelado',
    redirectTo: 'abc-exprezo/contratos/modelado/:folio',
    pathMatch: 'full',
  },
  // Detalle/edición básica por folio (si lo usas)
  {
    path: 'abc-exprezo/contratos/:folio',
    loadComponent: () =>
      import(
        './components/contratos/detalle-contrato/detalle-contrato.component'
      ).then((m) => m.DetalleContratoComponent),
  },

  // Requerimientos (nueva vista para aprobar/rechazar)
  {
    path: 'abc-exprezo/contratos/requerimientos/:folio',
    loadComponent: () =>
      import(
        './components/contratos/requerimientos/requerimientos.component'
      ).then((m) => m.RequerimientosComponent),
  },

  // === Estándares con rutas anidadas ===
  {
    path: 'abc-expreso/estandares',
    children: [
      // Página inicial de estándares
      { path: '', pathMatch: 'full', component: EstandaresLandingComponent },
      // Sección específica para E‑Commerce con rutas propias
      {
        path: 'ecommerce',
        component: EstandaresShellComponent,
        children: [
          { path: 'frontend', component: EcommerceFrontendComponent },
          { path: 'backend', component: EcommerceBackendComponent },
          { path: 'database', component: DatabaseEditorComponent },
          { path: 'maquetacion', component: EcommerceMaquetacionComponent },
          { path: '', pathMatch: 'full', redirectTo: 'frontend' },
        ],
      },
      // Otras secciones (administrador, abc) utilizan los componentes por defecto
      {
        path: ':section',
        component: EstandaresShellComponent,
        children: [
          { path: 'frontend', component: FrontendReportComponent },
          { path: 'backend', component: BackendReportComponent },
          { path: 'database', component: DatabaseEditorComponent },
          { path: '', pathMatch: 'full', redirectTo: 'frontend' },
        ],
      },
    ],
  },

  // === Redirecciones ===
  { path: '', redirectTo: '/abc-exprezo/grupo', pathMatch: 'full' },
  { path: '**', redirectTo: '/abc-exprezo/grupo' },
];
