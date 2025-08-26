export type ContratoStatus = 'Pendiente' | 'En revision' | 'Aprobado' | 'Rechazado';

export interface Contrato {
  folio: string;        // usado también en la URL /abc-exprezo/contratos/:folio
  contrato: string;
  descripcion: string;
  estatus: ContratoStatus;  // default: 'Pendiente'
}
