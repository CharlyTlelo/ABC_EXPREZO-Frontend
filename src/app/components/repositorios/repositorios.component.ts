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
    { proyecto: 'Exprezo', repositorio: 'AdministradorBackEnd', url: 'https://github.com/tu-usuario/AdministradorBackEnd' },
    { proyecto: 'Exprezo', repositorio: 'AdministradorFrontEnd', url: 'https://github.com/tu-usuario/AdministradorFrontEnd' },
    { proyecto: 'Exprezo', repositorio: 'E-CommerceBackEnd', url: 'https://github.com/tu-usuario/E-CommerceBackEnd' },
    { proyecto: 'Exprezo', repositorio: 'E-CommerceFrontEnd', url: 'https://github.com/tu-usuario/E-CommerceFrontEnd' },
    { proyecto: 'Exprezo', repositorio: 'ExprezoAfilacionFletero', url: 'https://github.com/tu-usuario/ExprezoAfilacionFletero' },
    { proyecto: 'Exprezo', repositorio: 'ExprezoAPITerceros', url: 'https://github.com/tu-usuario/ExprezoAPITerceros' },
    { proyecto: 'Exprezo', repositorio: 'ExprezoAplicacionMovil', url: 'https://github.com/tu-usuario/ExprezoAplicacionMovil' }
  ];
}