import { RouterModule, Routes } from '@angular/router';
import { EstandaresComponent } from './components/estandares/estandares.component';
import { ArquitecturaComponent } from './components/arquitectura/arquitectura.component';
import { AwsComponent } from './components/aws/aws.component';
import { RepositoriosComponent } from './components/repositorios/repositorios.component';
import { SwaggerComponent } from './components/swagger/swagger.component';
import { NgModule } from '@angular/core';
import { ContratosComponent } from './components/contratos/contratos.component';
import('./components/contratos/detalle-contrato/detalle-contrato.component')

import { FrameworkComponent } from './components/framework/framework.component';
import { GrupoComponent } from './components/grupo/grupo.component';

export const routes: Routes = [
    { path: 'abczorro/grupo', component: GrupoComponent },
    { path: 'abczorro/framework', component: FrameworkComponent },
    { path: 'abczorro/estandares', component: EstandaresComponent },
    { path: 'abczorro/arquitectura', component: ArquitecturaComponent },
    { path: 'abczorro/aws', component: AwsComponent },
    { path: 'abczorro/repositorios', component: RepositoriosComponent },
    { path: 'abczorro/swagger', component: SwaggerComponent },
    { path: 'abczorro/contratos', component: ContratosComponent},


    {
        path: 'abczorro/contratos/:folio',
        loadComponent: () => import('./components/contratos/detalle-contrato/detalle-contrato.component')
  .then(m => m.DetalleContratoComponent)

        },


    
    { path: '', redirectTo: '/abczorro/grupo', pathMatch: 'full' }


];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })
  export class AppRoutingModule { }
