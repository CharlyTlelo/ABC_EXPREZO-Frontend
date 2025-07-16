import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Repositorio {
  proyecto: string;
  repositorio: string;
  url: string;
}

@Component({
  selector: 'app-repositorios',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './repositorios.component.html',
  styleUrl: './repositorios.component.scss'
})
export class RepositoriosComponent {

repositorios: Repositorio[] = [
    { proyecto: 'Expreso', repositorio: 'AdministradorBackEnd', url: 'https://github.com/tu-usuario/AdministradorBackEnd' },
    { proyecto: 'Expreso', repositorio: 'AdministradorFrontEnd', url: 'https://github.com/tu-usuario/AdministradorFrontEnd' },
    { proyecto: 'Expreso', repositorio: 'E-CommerceBackEnd', url: 'https://github.com/tu-usuario/E-CommerceBackEnd' },
    { proyecto: 'Expreso', repositorio: 'E-CommerceFrontEnd', url: 'https://github.com/tu-usuario/E-CommerceFrontEnd' },
    { proyecto: 'Expreso', repositorio: 'ExprezoAfilacionFletero', url: 'https://github.com/tu-usuario/ExprezoAfilacionFletero' },
    { proyecto: 'Expreso', repositorio: 'ExprezoAPITerceros', url: 'https://github.com/tu-usuario/ExprezoAPITerceros' },
    { proyecto: 'Expreso', repositorio: 'ExprezoAplicacionMovil', url: 'https://github.com/tu-usuario/ExprezoAplicacionMovil' }
  ];
}