import { Routes } from '@angular/router';

// === Componentes existentes del proyecto
import { GrupoComponent } from './components/grupo/grupo.component';
import { FrameworkComponent } from './components/framework/framework.component';
import { ArquitecturaComponent } from './components/arquitectura/arquitectura.component';
import { AwsComponent } from './components/aws/aws.component';
import { RepositoriosComponent } from './components/repositorios/repositorios.component';
import { SwaggerComponent } from './components/swagger/swagger.component';

// === Estándares
import { EstandaresLandingComponent } from './components/estandares/pages/landing/landing.component';
import { EstandaresShellComponent } from './components/estandares/pages/shell/shell.component';
import { FrontendReportComponent } from './components/estandares/pages/frontend/frontend-report.component';
import { BackendReportComponent } from './components/estandares/pages/backend/backend-report.component';
import { DatabaseEditorComponent } from './components/estandares/pages/database/database-editor.component';
import { EcommerceMaquetacionComponent } from './components/estandares/pages/ecommerce/ecommerce-maquetacion.component';
import { EcommerceFrontendComponent } from './components/estandares/pages/ecommerce/ecommerce-frontend.component';
import { EcommerceBackendComponent } from './components/estandares/pages/ecommerce/ecommerce-backend.component';

// ====== Hijos reutilizables para /abc-exprezo/estandares (OPCIÓN A) ======
export const ESTANDARES_CHILDREN: Routes = [
  // Landing de Estándares
  { path: '', pathMatch: 'full', component: EstandaresLandingComponent },

  // Sección E-Commerce
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

  // (Opcional) Solicitudes también accesible bajo Estándares
  {
    path: 'solicitudes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/solicitudes/solicitudes-list.component').then(
            (m) => m.SolicitudesListComponent
          ),
      },
      {
        path: 'nueva',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-form.component').then(
            (m) => m.SolicitudFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-detail.component').then(
            (m) => m.SolicitudDetailComponent
          ),
      },
    ],
  },

  // Otras secciones genéricas de Estándares
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
];

// ====== RUTAS PRINCIPALES ======
export const routes: Routes = [
  // Básicas
  { path: 'abc-exprezo/grupo', component: GrupoComponent },
  { path: 'abc-exprezo/framework', component: FrameworkComponent },
  { path: 'abc-exprezo/arquitectura', component: ArquitecturaComponent },
  { path: 'abc-exprezo/aws', component: AwsComponent },
  { path: 'abc-exprezo/repositorios', component: RepositoriosComponent },
  { path: 'abc-exprezo/swagger', component: SwaggerComponent },

  // Contratos
  {
    path: 'abc-exprezo/contratos',
    loadComponent: () =>
      import('./components/contratos/contratos.component').then(
        (m) => m.ContratosComponent
      ),
  },
  // alias seguro para no capturar "agregar" como :folio
  {
    path: 'abc-exprezo/contratos/agregar',
    redirectTo: 'abc-exprezo/contratos/agregar_contrato',
    pathMatch: 'full',
  },

  {
    path: 'abc-exprezo/contratos/agregar_contrato',
    loadComponent: () =>
      import(
        './components/contratos/agregar-contrato/agregar-contrato.component'
      ).then((m) => m.AgregarContratoComponent),
  },
  {
    path: 'abc-exprezo/contratos/modelado/:folio',
    loadComponent: () =>
      import(
        './components/contratos/modelado-contrato/modelado-contrato.component'
      ).then((m) => m.ModeladoContratoComponent),
  },
  {
    path: 'abc-exprezo/contratos/:folio/modelado',
    redirectTo: 'abc-exprezo/contratos/modelado/:folio',
    pathMatch: 'full',
  },
  {
    path: 'abc-exprezo/contratos/:folio',
    loadComponent: () =>
      import(
        './components/contratos/detalle-contrato/detalle-contrato.component'
      ).then((m) => m.DetalleContratoComponent),
  },

  {
    path: 'abc-exprezo/contratos/revision',
    loadComponent: () =>
      import('./components/contratos/revision-contratos.component').then(
        (m) => m.RevisionContratosComponent
      ),
  },

  //Revision de contratos
  {
  path: 'abc-exprezo/contratos/revision/:folio',
  loadComponent: () =>
    import('./components/contratos/revision-contratos.component')
      .then(m => m.RevisionContratosComponent),
},


  // Estándares (solo con "z")
  {
    path: 'abc-exprezo/estandares',
    children: ESTANDARES_CHILDREN,
  },

  // Solicitudes (ruta directa al módulo)
  {
    path: 'abc-exprezo/solicitudes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/solicitudes/solicitudes-list.component').then(
            (m) => m.SolicitudesListComponent
          ),
      },
      {
        path: 'nueva',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-form.component').then(
            (m) => m.SolicitudFormComponent
          ),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/solicitudes/solicitud-detail.component').then(
            (m) => m.SolicitudDetailComponent
          ),
      },
    ],
  },

  // Redirecciones del prefijo viejo (no obligatorias, pero recomendables)
  {
    path: 'abc-expreso/estandares',
    redirectTo: 'abc-exprezo/estandares',
    pathMatch: 'full',
  },
  {
    path: 'abc-expreso/estandares/:s1',
    redirectTo: 'abc-exprezo/estandares/:s1',
  },
  {
    path: 'abc-expreso/estandares/:s1/:s2',
    redirectTo: 'abc-exprezo/estandares/:s1/:s2',
  },
  {
    path: 'abc-expreso/estandares/:s1/:s2/:s3',
    redirectTo: 'abc-exprezo/estandares/:s1/:s2/:s3',
  },

  // Home y comodín
  { path: '', redirectTo: '/abc-exprezo/grupo', pathMatch: 'full' },
  { path: '**', redirectTo: '/abc-exprezo/grupo' },
];
