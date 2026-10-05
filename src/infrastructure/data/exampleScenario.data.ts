import type { CloudProposal } from '../../domain/entities'

// Fictional demo scenario: three contrasting solutions so every module has something to show
// (a healthy multi-AZ design, a cheap one with security gaps, and a multi-region serverless one).
export const EXAMPLE_SCENARIO_DATA: Omit<CloudProposal, 'createdAt'>[] = [
  {
    id: 'demo-tienda',
    solutionName: 'Tienda en línea Andina',
    applicationType: 'E-commerce',
    description: 'Tienda virtual con catálogo, carrito y pagos para clientes de todo el país.',
    regionId: 'us-east-1',
    estimatedUsers: 5000,
    availabilityLevel: 'high',
    selectedServices: ['ec2', 'rds', 's3', 'iam', 'vpc', 'route53', 'cloudfront', 'cloudwatch'],
    migrationGoal: 'Escalabilidad bajo demanda',
    costItems: [
      { serviceId: 'ec2', quantity: 3, estimatedHours: 730 },
      { serviceId: 'rds', quantity: 2, estimatedHours: 730 },
      { serviceId: 's3', quantity: 1, estimatedHours: 730 },
      { serviceId: 'route53', quantity: 1, estimatedHours: 730 },
      { serviceId: 'cloudfront', quantity: 1, estimatedHours: 730 },
      { serviceId: 'cloudwatch', quantity: 1, estimatedHours: 730 },
    ],
  },
  {
    id: 'demo-rrhh',
    solutionName: 'Portal interno de RR. HH.',
    applicationType: 'Sistema interno (ERP / CRM)',
    description: 'Portal para vacaciones, boletas y solicitudes del personal, usado en horario de oficina.',
    regionId: 'sa-east-1',
    estimatedUsers: 300,
    availabilityLevel: 'standard',
    selectedServices: ['ec2', 'rds'],
    migrationGoal: 'Reducir costos (de CapEx a OpEx)',
    costItems: [
      { serviceId: 'ec2', quantity: 1, estimatedHours: 264 },
      { serviceId: 'rds', quantity: 1, estimatedHours: 264 },
    ],
  },
  {
    id: 'demo-pagos',
    solutionName: 'API de pagos Global',
    applicationType: 'API / microservicios',
    description: 'API serverless de cobros para socios en varios países, con disponibilidad 24/7.',
    regionId: 'eu-west-1',
    estimatedUsers: 20000,
    availabilityLevel: 'critical',
    selectedServices: ['lambda', 'rds', 's3', 'iam', 'vpc', 'route53', 'cloudfront', 'shield', 'cloudwatch'],
    migrationGoal: 'Expansión global',
    costItems: [
      { serviceId: 'lambda', quantity: 50, estimatedHours: 730 },
      { serviceId: 'rds', quantity: 2, estimatedHours: 730 },
      { serviceId: 's3', quantity: 2, estimatedHours: 730 },
      { serviceId: 'route53', quantity: 1, estimatedHours: 730 },
      { serviceId: 'cloudfront', quantity: 2, estimatedHours: 730 },
      { serviceId: 'cloudwatch', quantity: 1, estimatedHours: 730 },
    ],
  },
]
