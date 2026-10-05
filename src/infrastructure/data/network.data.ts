import type { NetworkArchitecture } from '../../domain/entities'

export const NETWORK_ARCHITECTURE_DATA: NetworkArchitecture = {
  vpcCidr: '10.0.0.0/16',
  nodes: [
    { id: 'internet', label: 'Internet', type: 'internet', description: 'Usuarios finales accediendo a la aplicación desde cualquier lugar.' },
    { id: 'route53', label: 'Route 53', type: 'dns', description: 'Resuelve el dominio y enruta al endpoint más saludable (health checks y failover).' },
    { id: 'cloudfront', label: 'CloudFront', type: 'cdn', description: 'Distribuye y cachea el contenido desde las ubicaciones de borde más cercanas al usuario.' },
    { id: 'vpc', label: 'VPC', type: 'vpc', description: 'Red privada virtual (10.0.0.0/16) que aísla lógicamente los recursos de la aplicación.' },
    { id: 'igw', label: 'Internet Gateway', type: 'gateway', description: 'Puerta de enlace que permite el tráfico entre Internet y las subredes públicas de la VPC.' },
    { id: 'alb', label: 'Load Balancer', type: 'loadbalancer', description: 'Application Load Balancer que reparte las peticiones HTTPS entre las instancias EC2.' },
    { id: 'ec2', label: 'EC2', type: 'compute', description: 'Instancias de cómputo de la aplicación, sin IP pública, dentro de una subred privada.' },
    { id: 'rds', label: 'RDS', type: 'database', description: 'Base de datos administrada en una subred privada aislada, accesible solo desde EC2.' },
  ],
  connections: [
    { from: 'internet', to: 'route53' },
    { from: 'route53', to: 'cloudfront' },
    { from: 'cloudfront', to: 'igw' },
    { from: 'igw', to: 'alb' },
    { from: 'alb', to: 'ec2' },
    { from: 'ec2', to: 'rds' },
  ],
  subnets: [
    {
      id: 'subnet-public',
      name: 'Subred pública',
      kind: 'public',
      cidr: '10.0.1.0/24',
      availabilityZone: 'us-east-1a',
      routeTable: '0.0.0.0/0 → Internet Gateway',
      nodeIds: ['alb'],
    },
    {
      id: 'subnet-app',
      name: 'Subred privada (aplicación)',
      kind: 'private',
      cidr: '10.0.2.0/24',
      availabilityZone: 'us-east-1a',
      routeTable: '10.0.0.0/16 → local (sin salida directa a Internet)',
      nodeIds: ['ec2'],
    },
    {
      id: 'subnet-data',
      name: 'Subred privada (datos)',
      kind: 'private',
      cidr: '10.0.3.0/24',
      availabilityZone: 'us-east-1b',
      routeTable: '10.0.0.0/16 → local (sin salida directa a Internet)',
      nodeIds: ['rds'],
    },
  ],
  securityGroups: [
    { id: 'sg-alb', name: 'sg-alb', nodeIds: ['alb'], inboundRules: ['HTTPS 443 desde 0.0.0.0/0'] },
    { id: 'sg-app', name: 'sg-app', nodeIds: ['ec2'], inboundRules: ['HTTP 80 solo desde sg-alb'] },
    { id: 'sg-db', name: 'sg-db', nodeIds: ['rds'], inboundRules: ['PostgreSQL 5432 solo desde sg-app'] },
  ],
}
