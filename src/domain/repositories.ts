// Domain layer: repository ports (interfaces). Infrastructure provides the implementations;
// application depends only on these contracts — never on a concrete data source.

import type {
  CloudProposal,
  CloudService,
  CostCatalogItem,
  CostEstimateRequest,
  IamIdentity,
  NetworkArchitecture,
  Region,
  RegionConnection,
  SecurityCheckItem,
  SharedResponsibilityModel,
  WorkspaceMode,
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

export type { CostEstimateRequest }

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
  getById(id: string): Promise<CloudProposal | undefined>
  create(proposal: Omit<CloudProposal, 'id' | 'createdAt'>): Promise<CloudProposal>
  update(proposal: CloudProposal): Promise<CloudProposal>
  delete(id: string): Promise<void>
  /** Replaces every stored proposal (used to load the demo scenario). */
  replaceAll(proposals: CloudProposal[]): Promise<void>
  getActiveId(): Promise<string | null>
  setActiveId(id: string | null): Promise<void>
  /** Wipes proposals and the active selection. */
  clear(): Promise<void>
}

export interface INetworkRepository {
  getArchitecture(): Promise<NetworkArchitecture>
}

export interface IWorkspaceRepository {
  getMode(): Promise<WorkspaceMode>
  setMode(mode: WorkspaceMode): Promise<void>
}
