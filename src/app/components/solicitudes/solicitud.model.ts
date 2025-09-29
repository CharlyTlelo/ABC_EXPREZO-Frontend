export type EstadoSolicitud =
  | 'PENDIENTE'
  | 'LEVANTAMIENTO'
  | 'REVISION'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'DESARROLLO'
  | 'QA'
  | 'UAT'
  | 'LIBERADA'
  | 'CERRADA';

export type Prioridad = 'ALTA' | 'MEDIA' | 'BAJA';

export interface UsuarioRef {
  id: string;
  nombre: string;
}

export interface Evidencia {
  id: string;
  nombre: string;
  url?: string;
}

export interface ChecklistItem {
  completo: boolean;
  adjuntos: Evidencia[];
}

export interface Solicitud {
  id: string; // e.g., SOL-0001
  titulo: string;
  descripcion: string;
  tipo: 'FEATURE' | 'BUG' | 'SOPORTE';
  prioridad: Prioridad;
  estado: EstadoSolicitud;
  bloqueada?: boolean;
  solicitante: UsuarioRef;
  responsableActual?: UsuarioRef;
  fechas: {
    creada: string;
    aprobada?: string | null;
    liberada?: string | null;
  };
  checklist: {
    levantamiento: ChecklistItem;
    reqTecnico: ChecklistItem;
    aprobacion: ChecklistItem;
  };
  desarrollo?: { branch?: string; prUrl?: string; porcentaje?: number };
  qa?: { resultado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'; evidencias: Evidencia[] };
  uat?: { resultado?: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO'; actaUrl?: string };
  liberacion?: { releaseTag?: string; fecha?: string | null };
  historial: Array<{
    fecha: string;
    usuario: string;
    accion: string;
    de?: EstadoSolicitud;
    a?: EstadoSolicitud;
    comentario?: string;
  }>;
}
