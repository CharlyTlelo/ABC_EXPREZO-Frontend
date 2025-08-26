import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/**
 * Página de bienvenida para la sección de estándares. Ofrece enlaces
 * rápidos a las distintas secciones disponibles.
 */
@Component({
  selector: 'app-estandares-landing',
  standalone: true,
  imports: [RouterModule],
  template: `
    <h1 class="titulo">Estándares Grupo Exprezo</h1>
    <p>Selecciona una sección para comenzar.</p>
    <div class="links">
      <a routerLink="/abc-expreso/estandares/administrador/frontend">Administrador Exprezo</a> |
      <a routerLink="/abc-expreso/estandares/ecommerce/maquetacion">E‑Commerce Exprezo</a> |
      <a routerLink="/abc-expreso/estandares/abc/frontend">ABC Exprezo</a>
    </div>
  `
})
export class EstandaresLandingComponent {}