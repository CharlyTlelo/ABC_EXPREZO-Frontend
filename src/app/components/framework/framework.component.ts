import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-framework',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './framework.component.html',
  styleUrl: './framework.component.scss'
})
export class FrameworkComponent {
technologies = [
    { tecnologia: 'Node js', categoria: 'Motor de aplicaciones web', versionActual: '18.10.0', proximaVersion: 'por definir' },
    { tecnologia: 'Sails JS ', categoria: 'Framework para proyectos backend basado en Node JS', versionActual: '1.15', proximaVersion: 'por definir' },
    { tecnologia: 'Angular', categoria: 'Proyectos para clientes web', versionActual: '16', proximaVersion: 'por definir' },
    { tecnologia: 'Flutter', categoria: 'Proyecto para cliente mobile', versionActual: '3.7', proximaVersion: 'por definir' },
    { tecnologia: '.Net Framework', categoria: 'Proyecto de aplicaciones web (API)', versionActual: '3.5', proximaVersion: 'por definir' },
    { tecnologia: 'Mongo DB', categoria: 'Base de datos ', versionActual: '8.0.8', proximaVersion: 'por definir' },
    { tecnologia: 'Redis', categoria: 'Base de datos en cache', versionActual: '5.0.14', proximaVersion: 'por definir' },
    { tecnologia: 'SQL Server', categoria: 'Motor principal de base de datos', versionActual: 'SQL Server 2019 Estándar', proximaVersion: 'por definir' },
    { tecnologia: 'Windows Server', categoria: 'SO de servidores virtuales', versionActual: 'Windows Server 2019 R2', proximaVersion: 'por definir' },

  ];
}
