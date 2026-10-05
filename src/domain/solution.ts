// Domain layer: business rules that derive every module's view from the user's active solution.
// Pure functions — no framework, no storage.

import type {
  CloudProposal,
  CloudService,
  NetworkArchitecture,
  NetworkConnection,
  NetworkNode,
  SecurityCheckItem,
  SecurityGroup,
  Subnet,
} from './entities'

const has = (proposal: CloudProposal, serviceId: string) => proposal.selectedServices.includes(serviceId)

/** Catalog "utilization status" follows the solution: chosen → active, the rest inactive
 *  (services flagged as recommended keep that hint). */
export function applySolutionUsage(services: CloudService[], proposal: CloudProposal | null): CloudService[] {
  if (!proposal) return services
  return services.map((service) => ({
    ...service,
    status: has(proposal, service.id) ? 'active' : service.status === 'recommended' ? 'recommended' : 'inactive',
  }))
}

/** Security controls evaluated against the design itself (what the customer is responsible for). */
export function evaluateSolutionSecurity(proposal: CloudProposal): SecurityCheckItem[] {
  const checks: SecurityCheckItem[] = []
  const add = (id: string, check: Omit<SecurityCheckItem, 'id'>) => checks.push({ id: `solution-${id}`, ...check })

  add(
    'iam',
    has(proposal, 'iam')
      ? { title: 'IAM incluido en el diseño', category: 'iam', status: 'ok', description: 'La solución gestiona usuarios, roles y permisos con AWS IAM.' }
      : { title: 'Solución sin gestión de identidades', category: 'iam', status: 'critical', description: 'No se seleccionó AWS IAM: no hay control de quién accede ni con qué permisos.' },
  )

  add(
    'availability',
    proposal.availabilityLevel === 'standard'
      ? { title: 'Una sola zona de disponibilidad', category: 'shared-responsibility', status: 'warning', description: 'Si la zona falla, la aplicación se detiene. Considera un despliegue multi-AZ.' }
      : { title: 'Despliegue tolerante a fallos', category: 'shared-responsibility', status: 'ok', description: proposal.availabilityLevel === 'critical' ? 'Multi-región con failover: tolera la caída de una región completa.' : 'Multi-AZ: tolera la caída de una zona de disponibilidad.' },
  )

  add(
    'edge',
    has(proposal, 'cloudfront') || has(proposal, 'shield')
      ? { title: 'Protección perimetral', category: 'account-protection', status: 'ok', description: 'CloudFront / Shield absorben tráfico malicioso antes de llegar al origen.' }
      : { title: 'Sin protección perimetral DDoS', category: 'account-protection', status: 'warning', description: 'El origen queda expuesto directamente. Añade CloudFront o AWS Shield.' },
  )

  add(
    'monitoring',
    has(proposal, 'cloudwatch')
      ? { title: 'Monitoreo activo', category: 'compliance', status: 'ok', description: 'CloudWatch registra métricas, logs y alarmas para auditoría.' }
      : { title: 'Sin monitoreo ni auditoría', category: 'compliance', status: 'warning', description: 'Sin CloudWatch no hay registros para detectar incidentes ni demostrar cumplimiento.' },
  )

  if (has(proposal, 'rds') || has(proposal, 's3')) {
    add('data', {
      title: 'Datos dentro de la solución',
      category: 'data-protection',
      status: has(proposal, 'iam') ? 'ok' : 'warning',
      description: has(proposal, 'iam')
        ? 'RDS / S3 con cifrado en reposo y acceso controlado por políticas IAM.'
        : 'Hay datos en RDS / S3 pero sin IAM no se puede restringir el acceso.',
    })
  }

  return checks
}

/** Builds the network diagram from the services of the solution. EC2 and RDS always live in a
 *  VPC (the default one if VPC was not chosen); serverless and storage stay outside it. */
export function buildSolutionArchitecture(
  proposal: CloudProposal,
  regionCode: string,
  secondaryRegionName?: string,
): NetworkArchitecture {
  const nodes: NetworkNode[] = [
    { id: 'internet', label: 'Internet', type: 'internet', description: `Los ${proposal.estimatedUsers.toLocaleString('es-PE')} usuarios estimados de la solución.` },
  ]
  const connections: NetworkConnection[] = []
  const subnets: Subnet[] = []
  const securityGroups: SecurityGroup[] = []
  const notes: string[] = []
  let previous = 'internet'
  const link = (id: string) => {
    connections.push({ from: previous, to: id })
    previous = id
  }

  if (has(proposal, 'route53')) {
    nodes.push({ id: 'route53', label: 'Route 53', type: 'dns', description: 'Resuelve el dominio de la solución y enruta al endpoint saludable.' })
    link('route53')
  }
  if (has(proposal, 'cloudfront')) {
    nodes.push({ id: 'cloudfront', label: 'CloudFront', type: 'cdn', description: 'Cachea el contenido en ubicaciones de borde cercanas a los usuarios.' })
    link('cloudfront')
  }

  const multiAz = proposal.availabilityLevel !== 'standard'
  const zones = multiAz ? `${regionCode}a + ${regionCode}b` : `${regionCode}a`
  const needsVpc = has(proposal, 'ec2') || has(proposal, 'rds')

  if (needsVpc) {
    nodes.push({
      id: 'vpc',
      label: has(proposal, 'vpc') ? 'VPC' : 'VPC por defecto',
      type: 'vpc',
      description: has(proposal, 'vpc')
        ? 'Red privada propia (10.0.0.0/16) que aísla los recursos de la solución.'
        : 'No se eligió una VPC propia: EC2/RDS usan la VPC por defecto de la región.',
    })
    if (!has(proposal, 'vpc')) notes.push('No se seleccionó Amazon VPC: los recursos usan la VPC por defecto, con menos control de la red.')
  }

  if (has(proposal, 'ec2')) {
    nodes.push(
      { id: 'igw', label: 'Internet Gateway', type: 'gateway', description: 'Permite el tráfico entre Internet y la subred pública.' },
      { id: 'alb', label: 'Load Balancer', type: 'loadbalancer', description: `Reparte las peticiones entre las instancias EC2${multiAz ? ' de ambas zonas' : ''}.` },
      { id: 'ec2', label: 'EC2', type: 'compute', description: `Servidores de la aplicación${multiAz ? ' replicados en dos zonas de disponibilidad' : ''}.` },
    )
    link('igw')
    link('alb')
    link('ec2')
    subnets.push(
      { id: 'subnet-public', name: 'Subred pública', kind: 'public', cidr: '10.0.1.0/24', availabilityZone: zones, routeTable: '0.0.0.0/0 → Internet Gateway', nodeIds: ['alb'] },
      { id: 'subnet-app', name: 'Subred privada (aplicación)', kind: 'private', cidr: '10.0.2.0/24', availabilityZone: zones, routeTable: '10.0.0.0/16 → local (sin salida directa a Internet)', nodeIds: ['ec2'] },
    )
    securityGroups.push(
      { id: 'sg-alb', name: 'sg-alb', nodeIds: ['alb'], inboundRules: ['HTTPS 443 desde 0.0.0.0/0'] },
      { id: 'sg-app', name: 'sg-app', nodeIds: ['ec2'], inboundRules: ['HTTP 80 solo desde sg-alb'] },
    )
  }

  if (has(proposal, 'rds')) {
    nodes.push({
      id: 'rds',
      label: 'RDS',
      type: 'database',
      description: multiAz ? 'Base de datos Multi-AZ: réplica en espera en la segunda zona con failover automático.' : 'Base de datos en una sola zona de disponibilidad.',
    })
    if (has(proposal, 'ec2')) link('rds')
    subnets.push({ id: 'subnet-data', name: 'Subred privada (datos)', kind: 'private', cidr: '10.0.3.0/24', availabilityZone: zones, routeTable: '10.0.0.0/16 → local (sin salida directa a Internet)', nodeIds: ['rds'] })
    securityGroups.push({
      id: 'sg-db',
      name: 'sg-db',
      nodeIds: ['rds'],
      inboundRules: [has(proposal, 'ec2') ? 'PostgreSQL 5432 solo desde sg-app' : has(proposal, 'lambda') ? 'PostgreSQL 5432 solo desde Lambda' : 'PostgreSQL 5432 solo desde la VPC'],
    })
  }

  if (has(proposal, 'lambda')) {
    nodes.push({ id: 'lambda', label: 'Lambda', type: 'serverless', description: 'Funciones serverless que se ejecutan por evento, sin servidores que administrar.' })
  }
  if (has(proposal, 's3')) {
    nodes.push({ id: 's3', label: 'S3', type: 'storage', description: 'Almacenamiento de objetos: archivos estáticos, respaldos y documentos.' })
  }
  if (has(proposal, 'cloudwatch')) {
    nodes.push({ id: 'cloudwatch', label: 'CloudWatch', type: 'monitoring', description: 'Métricas, logs y alarmas de todos los componentes.' })
  }

  if (multiAz && needsVpc) notes.push(`Alta disponibilidad: los recursos se replican en dos zonas (${zones}).`)
  if (proposal.availabilityLevel === 'critical') {
    notes.push(
      `Nivel crítico: la solución se replica en una región secundaria${secondaryRegionName ? ` (${secondaryRegionName})` : ''} y Route 53 hace failover si la región principal cae.`,
    )
  }
  if (!needsVpc) notes.push('La solución no usa EC2 ni RDS, así que no necesita una VPC: todos sus servicios son administrados por AWS.')

  return { solutionName: proposal.solutionName, vpcCidr: '10.0.0.0/16', notes, nodes, connections, subnets, securityGroups }
}
