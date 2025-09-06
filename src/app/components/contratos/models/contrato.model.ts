export type ContratoStatus = 'Pendiente' | 'En revision' | 'Aprobado' | 'Rechazado';

export interface Contrato {
  folio: string;          // usado en URL
  contrato: string;
  descripcion: string;
  estatus: ContratoStatus; // default: 'Pendiente'
  modelado?: {
    recoleccion: string;
    conceptual: string;
    logico: string;
    fisico: string;
    validacion: string;
  };
}
