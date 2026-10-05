// Domain layer: repository ports (interfaces). Infrastructure provides the implementations;
// application depends only on these contracts — never on a concrete data source.

import type {
  CloudProposal,
  CloudService,
  CostCatalogItem,
  IamIdentity,
  NetworkArchitecture,
  Region,
  RegionConnection,
  SecurityCheckItem,
  SharedResponsibilityModel,
} from './entities'

export interface ICloudServiceRepository {
  getAll(): Promise<CloudService[]>
  getById(id: string): Promise<CloudService | undefined>
}

export interface IRegionRepository {
  getAll(): Promise<Region[]>
  getById(id: string): Promise<Region | undefined>
  getConnections(): Promise<RegionConnection[]>
}

export interface CostEstimateRequest {
  serviceId: string
  quantity: number
  estimatedHours: number
}

export interface ICostRepository {
  getCatalog(): Promise<CostCatalogItem[]>
}

export interface ISecurityRepository {
  getChecks(): Promise<SecurityCheckItem[]>
  getIamIdentities(): Promise<IamIdentity[]>
  getSharedResponsibility(): Promise<SharedResponsibilityModel>
}

export interface IPlanningRepository {
  getAll(): Promise<CloudProposal[]>
  create(proposal: Omit<CloudProposal, 'id' | 'createdAt'>): Promise<CloudProposal>
  delete(id: string): Promise<void>
}

export interface INetworkRepository {
  getArchitecture(): Promise<NetworkArchitecture>
}
