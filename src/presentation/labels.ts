// Spanish UI labels for domain enums, shared by cards, filters and exported reports.

import type {
  AvailabilityLevel,
  HealthStatus,
  IamIdentityType,
  SecurityCategory,
  SecurityStatus,
  ServiceCategory,
  UtilizationStatus,
} from '../domain/entities'

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  compute: 'Cómputo',
  storage: 'Almacenamiento',
  database: 'Base de datos',
  networking: 'Redes',
  security: 'Seguridad',
  identity: 'Identidad',
}

export const UTILIZATION_LABELS: Record<UtilizationStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  recommended: 'Recomendado',
}

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  operational: 'Operativa',
  degraded: 'Degradada',
  outage: 'Caída',
}

export const ARCHITECTURE_LABELS: Record<HealthStatus, string> = {
  operational: 'Estable',
  degraded: 'Con incidencias',
  outage: 'Interrumpida',
}

export const SECURITY_STATUS_LABELS: Record<SecurityStatus, string> = {
  ok: 'Correcto',
  warning: 'Requiere revisión',
  critical: 'Problema',
}

export const SECURITY_CATEGORY_LABELS: Record<SecurityCategory, string> = {
  'shared-responsibility': 'Responsabilidad compartida',
  iam: 'IAM',
  'account-protection': 'Protección de cuenta',
  'data-protection': 'Protección de datos',
  compliance: 'Cumplimiento',
}

export const AVAILABILITY_LABELS: Record<AvailabilityLevel, string> = {
  standard: 'Estándar (una sola AZ)',
  high: 'Alta disponibilidad (multi-AZ)',
  critical: 'Crítica (multi-región)',
}

export const IAM_TYPE_LABELS: Record<IamIdentityType, string> = {
  user: 'Usuario',
  group: 'Grupo',
  role: 'Rol',
  policy: 'Política',
}

export const IAM_TYPE_PLURAL_LABELS: Record<IamIdentityType, string> = {
  user: 'Usuarios',
  group: 'Grupos',
  role: 'Roles',
  policy: 'Políticas',
}

/** Short service name for chips: "Amazon EC2" → "EC2". */
export function shortServiceName(name: string): string {
  return name.replace(/^(Amazon|AWS)\s+/, '')
}
