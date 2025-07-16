import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-estandares',
  standalone: true,
  imports: [
    CommonModule,
    
  ],
  templateUrl: './estandares.component.html',
  styleUrl: './estandares.component.scss'
})
export class EstandaresComponent {
  selectedSection: string | null = 'frontend';
   frontendInfo: string = `  `;
  backendInfo: string = 'Información aleatoria sobre Backend: Los servicios RESTful se implementan con Node.js y Express.';
  databaseInfo: string = 'Información aleatoria sobre Base de Datos: Se emplean bases de datos relacionales como PostgreSQL para almacenamiento eficiente.';

  selectSection(section: string) {
    this.selectedSection = section;
  }
}