// Domain layer: pure business types. No framework, no infrastructure imports.

export type HealthStatus = 'operational' | 'degraded' | 'outage'

export type ServiceCategory =
  | 'compute'
  | 'storage'
  | 'database'
  | 'networking'
  | 'security'
  | 'identity'

export type UtilizationStatus = 'active' | 'inactive' | 'recommended'

export interface CloudService {
  id: string
  name: string
  category: ServiceCategory
  description: string
  mainFunction: string
  status: UtilizationStatus
  icon: string
  hourlyCost: number
  pricingModel: string
  keyFeatures: string[]
  useCases: string[]
}

export interface AvailabilityZone {
  id: string
  name: string
  status: HealthStatus
}

export interface Region {
  id: string
  code: string
  name: string
  country: string
  city: string
  coordinates: [number, number] // [longitude, latitude]
  servicesDeployed: string[]
  status: HealthStatus
  availabilityZones: AvailabilityZone[]
  /** Simulated price multiplier relative to us-east-1 (AWS prices vary by region). */
  pricingFactor: number
}

export interface RegionConnection {
  fromRegionId: string
  toRegionId: string
  type: 'primary' | 'backup'
}

export type AvailabilityLevel = 'standard' | 'high' | 'critical'

/** One line of a cost estimate: which service, how many units and how many hours per month. */
export interface CostEstimateRequest {
  serviceId: string
  quantity: number
  estimatedHours: number
}

/** A proposal is the user's own (mock) solution; when active, every module is computed from it. */
export interface CloudProposal {
  id: string
  solutionName: string
  applicationType: string
  description: string
  regionId: string
  estimatedUsers: number
  availabilityLevel: AvailabilityLevel
  selectedServices: string[]
  migrationGoal: string
  /** Billable resources of the solution; the cost module edits them. */
  costItems: CostEstimateRequest[]
  createdAt: string
}

/** What the planning form captures; cost lines are derived when the proposal is registered. */
export type NewCloudProposal = Omit<CloudProposal, 'id' | 'createdAt' | 'costItems'>

export interface CostCatalogItem {
  serviceId: string
  serviceName: string
  hourlyCost: number
}

export interface CostLineItem {
  id: string
  serviceId: string
  serviceName: string
  quantity: number
  /** Hours of use per month entered by the user (1–730). */
  estimatedHours: number
  /** Catalog price per hour, already adjusted by the region's pricing factor. */
  unitCost: number
  /** Cost of the whole line for one hour: unitCost × quantity. */
  hourlyCost: number
  monthlyCost: number
  annualCost: number
}

export type SecurityCategory =
  | 'shared-responsibility'
  | 'iam'
  | 'account-protection'
  | 'data-protection'
  | 'compliance'

export type SecurityStatus = 'ok' | 'warning' | 'critical'

export interface SecurityCheckItem {
  id: string
  title: string
  category: SecurityCategory
  status: SecurityStatus
  description: string
}

export interface ResponsibilityItem {
  title: string
  description: string
}

/** AWS shared responsibility model: AWS secures "of" the cloud, the customer secures "in" the cloud. */
export interface SharedResponsibilityModel {
  aws: ResponsibilityItem[]
  customer: ResponsibilityItem[]
  shared: ResponsibilityItem[]
}

export type IamIdentityType = 'user' | 'group' | 'role' | 'policy'

export interface IamIdentity {
  id: string
  name: string
  type: IamIdentityType
  description: string
  attachedPolicies: string[]
  /** Only meaningful for users. */
  mfaEnabled?: boolean
  status: SecurityStatus
}

export type NetworkNodeType =
  | 'internet'
  | 'dns'
  | 'cdn'
  | 'vpc'
  | 'gateway'
  | 'loadbalancer'
  | 'compute'
  | 'database'
  | 'storage'
  | 'serverless'
  | 'monitoring'

export interface NetworkNode {
  id: string
  label: string
  type: NetworkNodeType
  description: string
}

export interface NetworkConnection {
  from: string
  to: string
}

export interface Subnet {
  id: string
  name: string
  kind: 'public' | 'private'
  cidr: string
  availabilityZone: string
  routeTable: string
  nodeIds: string[]
}

export interface SecurityGroup {
  id: string
  name: string
  nodeIds: string[]
  inboundRules: string[]
}

export interface NetworkArchitecture {
  /** Name of the solution this diagram belongs to, or null for the reference architecture. */
  solutionName: string | null
  vpcCidr: string
  /** Design remarks shown under the diagram (multi-AZ, default VPC, failover…). */
  notes: string[]
  nodes: NetworkNode[]
  connections: NetworkConnection[]
  subnets: Subnet[]
  securityGroups: SecurityGroup[]
}

export interface CostTrendPoint {
  month: string
  cost: number
}

export interface CategoryCost {
  category: ServiceCategory
  cost: number
}

export interface ActiveSolutionInfo {
  id: string
  name: string
  applicationType: string
  availabilityLevel: AvailabilityLevel
  estimatedUsers: number
  migrationGoal: string
}

export interface DashboardSummary {
  /** Null when no proposal is active: the summary then describes the reference catalog. */
  solution: ActiveSolutionInfo | null
  usedServiceIds: string[]
  totalServices: number
  activeServices: number
  selectedRegionId: string
  selectedRegionName: string
  selectedRegionCode: string
  selectedRegionStatus: HealthStatus
  pricingFactor: number
  monthlyCost: number
  annualCost: number
  securityScore: number
  totalResources: number
  architectureStatus: HealthStatus
  costTrend: CostTrendPoint[]
  costByCategory: CategoryCost[]
}

export interface FailoverResult {
  downRegion: Region
  optimalRegion: Region | null
  distanceKm: number | null
}

export interface SystemAlert {
  id: string
  title: string
  message: string
  severity: 'warning' | 'critical'
  source: 'security' | 'infrastructure'
}

export interface CloudServiceDetail {
  service: CloudService
  deployedRegions: Region[]
  monthlyCost: number
}

export interface CloudReport {
  generatedAt: string
  summary: DashboardSummary
  /** Priced cost lines of the active solution (empty when none is active). */
  costLines: CostLineItem[]
  services: CloudService[]
  regions: Region[]
  securityChecks: SecurityCheckItem[]
  proposals: CloudProposal[]
}
