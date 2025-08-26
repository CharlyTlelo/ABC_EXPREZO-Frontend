import { Routes } from '@angular/router';

// Componentes existentes del proyecto (ajusta los paths según tu estructura real)
import { GrupoComponent } from './components/grupo/grupo.component';
import { FrameworkComponent } from './components/framework/framework.component';
import { ArquitecturaComponent } from './components/arquitectura/arquitectura.component';
import { AwsComponent } from './components/aws/aws.component';
import { RepositoriosComponent } from './components/repositorios/repositorios.component';
import { SwaggerComponent } from './components/swagger/swagger.component';
import { ContratosComponent } from './components/contratos/contratos.component';

// Paginas de Estándares
import { EstandaresLandingComponent } from './components/estandares/pages/landing/landing.component';
import { EstandaresShellComponent } from './components/estandares/pages/shell/shell.component';
import { FrontendReportComponent } from './components/estandares/pages/frontend/frontend-report.component';
import { BackendReportComponent } from './components/estandares/pages/backend/backend-report.component';
import { DatabaseEditorComponent } from './components/estandares/pages/database/database-editor.component';
import { EcommerceMaquetacionComponent } from './components/estandares/pages/ecommerce/ecommerce-maquetacion.component';
// Importa los nuevos componentes específicos para E‑Commerce
import { EcommerceFrontendComponent } from './components/estandares/pages/ecommerce/ecommerce-frontend.component';
import { EcommerceBackendComponent } from './components/estandares/pages/ecommerce/ecommerce-backend.component';

export const routes: Routes = [
  // === Rutas existentes ===
  { path: 'abc-exprezo/grupo', component: GrupoComponent },
  { path: 'abc-exprezo/framework', component: FrameworkComponent },
  { path: 'abc-exprezo/arquitectura', component: ArquitecturaComponent },
  { path: 'abc-exprezo/aws', component: AwsComponent },
  { path: 'abc-exprezo/repositorios', component: RepositoriosComponent },
  { path: 'abc-exprezo/swagger', component: SwaggerComponent },
  {
    path: 'abc-exprezo/contratos',
    component: ContratosComponent,
  },
  {
    path: 'abc-exprezo/contratos/:id',
    loadComponent: () =>
      import('./components/contratos/detalle-contrato/detalle-contrato.component')
        .then(m => m.DetalleContratoComponent)
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
          { path: 'backend',  component: EcommerceBackendComponent },
          { path: 'database', component: DatabaseEditorComponent },
          { path: 'maquetacion', component: EcommerceMaquetacionComponent },
          { path: '', pathMatch: 'full', redirectTo: 'frontend' }
        ]
      },
      // Otras secciones (administrador, abc) utilizan los componentes por defecto
      {
        path: ':section',
        component: EstandaresShellComponent,
        children: [
          { path: 'frontend', component: FrontendReportComponent },
          { path: 'backend',  component: BackendReportComponent },
          { path: 'database', component: DatabaseEditorComponent },
          { path: '', pathMatch: 'full', redirectTo: 'frontend' }
        ]
      }
    ]
  },
  // === Redirecciones ===
  { path: '', redirectTo: '/abc-exprezo/grupo', pathMatch: 'full' },
  { path: '**', redirectTo: '/abc-exprezo/grupo' }
];