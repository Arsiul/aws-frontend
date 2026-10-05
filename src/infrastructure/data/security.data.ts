import type { SecurityCheckItem } from '../../domain/entities'

export const SECURITY_CHECKS_DATA: SecurityCheckItem[] = [
  {
    id: 'shared-resp-1',
    title: 'Modelo de responsabilidad compartida',
    category: 'shared-responsibility',
    status: 'ok',
    description: 'AWS asegura la nube (infraestructura física); el cliente asegura lo que hay en la nube (datos, IAM, configuración).',
  },
  {
    id: 'iam-1',
    title: 'Principio de mínimo privilegio',
    category: 'iam',
    status: 'ok',
    description: 'Los roles IAM otorgan solo los permisos necesarios para cada función.',
  },
  {
    id: 'iam-2',
    title: 'MFA en la cuenta root',
    category: 'iam',
    status: 'warning',
    description: 'Se recomienda habilitar autenticación multifactor en la cuenta root y usuarios administradores.',
  },
  {
    id: 'account-1',
    title: 'Rotación de credenciales',
    category: 'account-protection',
    status: 'ok',
    description: 'Las claves de acceso se rotan cada 90 días según la política definida.',
  },
  {
    id: 'account-2',
    title: 'Alertas de actividad inusual',
    category: 'account-protection',
    status: 'critical',
    description: 'Se detectaron intentos de acceso fallidos desde una región no habitual. Requiere revisión inmediata.',
  },
  {
    id: 'data-1',
    title: 'Cifrado en reposo (S3 / RDS)',
    category: 'data-protection',
    status: 'ok',
    description: 'Todos los buckets y bases de datos tienen cifrado AES-256 habilitado.',
  },
  {
    id: 'data-2',
    title: 'Cifrado en tránsito (TLS)',
    category: 'data-protection',
    status: 'ok',
    description: 'El tráfico entre CloudFront, VPC y los clientes utiliza TLS 1.2+.',
  },
  {
    id: 'compliance-1',
    title: 'Cumplimiento normativo',
    category: 'compliance',
    status: 'warning',
    description: 'Falta completar la evidencia de cumplimiento para el estándar ISO 27001.',
  },
]
