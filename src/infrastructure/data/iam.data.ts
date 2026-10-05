import type { IamIdentity, SharedResponsibilityModel } from '../../domain/entities'

export const IAM_IDENTITIES_DATA: IamIdentity[] = [
  {
    id: 'user-admin',
    name: 'admin-plataforma',
    type: 'user',
    description: 'Usuario administrador de la cuenta para tareas de configuración.',
    attachedPolicies: ['AdministratorAccess'],
    mfaEnabled: false,
    status: 'warning',
  },
  {
    id: 'user-dev',
    name: 'desarrollador-01',
    type: 'user',
    description: 'Usuario del equipo de desarrollo.',
    attachedPolicies: ['Hereda de grupo Desarrolladores'],
    mfaEnabled: true,
    status: 'ok',
  },
  {
    id: 'user-auditor',
    name: 'auditor-externo',
    type: 'user',
    description: 'Acceso de solo lectura para auditorías de cumplimiento.',
    attachedPolicies: ['ReadOnlyAccess'],
    mfaEnabled: true,
    status: 'ok',
  },
  {
    id: 'group-devs',
    name: 'Desarrolladores',
    type: 'group',
    description: 'Agrupa a los desarrolladores para asignarles permisos en bloque.',
    attachedPolicies: ['AmazonEC2ReadOnlyAccess', 'AmazonS3ReadOnlyAccess'],
    status: 'ok',
  },
  {
    id: 'group-ops',
    name: 'Operaciones',
    type: 'group',
    description: 'Equipo que opera la infraestructura en producción.',
    attachedPolicies: ['PowerUserAccess'],
    status: 'warning',
  },
  {
    id: 'role-ec2',
    name: 'rol-ec2-app',
    type: 'role',
    description: 'Rol que asumen las instancias EC2 para leer archivos en S3 sin claves fijas.',
    attachedPolicies: ['politica-s3-lectura-app'],
    status: 'ok',
  },
  {
    id: 'role-lambda',
    name: 'rol-lambda-procesamiento',
    type: 'role',
    description: 'Rol de ejecución de las funciones Lambda.',
    attachedPolicies: ['AWSLambdaBasicExecutionRole'],
    status: 'ok',
  },
  {
    id: 'policy-s3',
    name: 'politica-s3-lectura-app',
    type: 'policy',
    description: 'Política personalizada: permite s3:GetObject solo sobre el bucket de la aplicación.',
    attachedPolicies: [],
    status: 'ok',
  },
  {
    id: 'policy-wildcard',
    name: 'politica-acceso-total-legado',
    type: 'policy',
    description: 'Política heredada con "Action": "*" y "Resource": "*". Viola el mínimo privilegio.',
    attachedPolicies: [],
    status: 'critical',
  },
]

export const SHARED_RESPONSIBILITY_DATA: SharedResponsibilityModel = {
  aws: [
    { title: 'Infraestructura física', description: 'Centros de datos, energía, refrigeración y seguridad física.' },
    { title: 'Regiones y zonas de disponibilidad', description: 'Red global, edge locations y redundancia entre AZ.' },
    { title: 'Hardware y virtualización', description: 'Servidores, almacenamiento y el hipervisor que aísla a los clientes.' },
    { title: 'Servicios administrados', description: 'Parcheo del sistema operativo y del motor en servicios como RDS o Lambda.' },
  ],
  customer: [
    { title: 'Datos del cliente', description: 'Clasificación, cifrado en reposo y en tránsito, y copias de seguridad.' },
    { title: 'Identidades y accesos (IAM)', description: 'Usuarios, roles, MFA y principio de mínimo privilegio.' },
    { title: 'Sistema operativo y aplicaciones', description: 'Parches del SO en EC2, dependencias y código de la aplicación.' },
    { title: 'Configuración de red', description: 'Security Groups, Network ACLs, subredes y reglas de firewall.' },
  ],
  shared: [
    { title: 'Gestión de parches', description: 'AWS parchea la infraestructura; el cliente, sus sistemas operativos y aplicaciones.' },
    { title: 'Gestión de configuración', description: 'AWS configura sus dispositivos; el cliente, sus recursos y servicios.' },
    { title: 'Concientización y formación', description: 'AWS capacita a su personal; el cliente, a sus propios equipos.' },
  ],
}
