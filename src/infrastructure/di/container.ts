// Composition root: the ONLY file that wires concrete infrastructure implementations
// to application use-cases. To plug in a real API later, replace the repository instances
// below (e.g. CloudServiceRepository -> HttpCloudServiceRepository) — nothing in domain/,
// application/ or presentation/ needs to change.

import { EstimateCostUseCase, GetCostCatalogUseCase } from '../../application/use-cases/EstimateCostUseCase'
import { GenerateCloudReportUseCase } from '../../application/use-cases/GenerateCloudReportUseCase'
import { GetCloudServiceDetailUseCase } from '../../application/use-cases/GetCloudServiceDetailUseCase'
import { GetCloudServicesUseCase } from '../../application/use-cases/GetCloudServicesUseCase'
import { GetDashboardSummaryUseCase } from '../../application/use-cases/GetDashboardSummaryUseCase'
import { GetIamIdentitiesUseCase } from '../../application/use-cases/GetIamIdentitiesUseCase'
import { GetNetworkArchitectureUseCase } from '../../application/use-cases/GetNetworkArchitectureUseCase'
import { GetRegionConnectionsUseCase } from '../../application/use-cases/GetRegionConnectionsUseCase'
import { GetRegionsUseCase } from '../../application/use-cases/GetRegionsUseCase'
import { GetSecurityChecksUseCase } from '../../application/use-cases/GetSecurityChecksUseCase'
import { GetSharedResponsibilityUseCase } from '../../application/use-cases/GetSharedResponsibilityUseCase'
import { GetSystemAlertsUseCase } from '../../application/use-cases/GetSystemAlertsUseCase'
import {
  DeleteCloudProposalUseCase,
  GetActiveProposalUseCase,
  GetCloudProposalsUseCase,
  LoadExampleScenarioUseCase,
  RegisterCloudProposalUseCase,
  ResetWorkspaceUseCase,
  SetActiveProposalUseCase,
  UpdateCloudProposalUseCase,
} from '../../application/use-cases/PlanningUseCases'
import { SimulateRegionFailoverUseCase } from '../../application/use-cases/SimulateRegionFailoverUseCase'
import { EXAMPLE_SCENARIO_DATA } from '../data/exampleScenario.data'
import { CloudServiceRepository } from '../repositories/CloudServiceRepository'
import { CostRepository } from '../repositories/CostRepository'
import { NetworkRepository } from '../repositories/NetworkRepository'
import { PlanningRepository } from '../repositories/PlanningRepository'
import { RegionRepository } from '../repositories/RegionRepository'
import { SecurityRepository } from '../repositories/SecurityRepository'

function buildContainer() {
  // Infrastructure: concrete adapters for each domain port.
  const cloudServiceRepository = new CloudServiceRepository()
  const regionRepository = new RegionRepository()
  const costRepository = new CostRepository()
  const securityRepository = new SecurityRepository()
  const planningRepository = new PlanningRepository()
  const networkRepository = new NetworkRepository()

  // Use-cases that other use-cases compose.
  const getSecurityChecks = new GetSecurityChecksUseCase(securityRepository, planningRepository)
  const getCloudServices = new GetCloudServicesUseCase(cloudServiceRepository, planningRepository)
  const estimateCost = new EstimateCostUseCase(costRepository, regionRepository)
  const getDashboardSummary = new GetDashboardSummaryUseCase(
    cloudServiceRepository,
    regionRepository,
    costRepository,
    planningRepository,
    getSecurityChecks,
  )

  // Application: use-cases injected with the ports they depend on (constructor injection).
  return {
    getCloudServices,
    getCloudServiceDetail: new GetCloudServiceDetailUseCase(cloudServiceRepository, regionRepository, planningRepository),
    getRegions: new GetRegionsUseCase(regionRepository),
    getRegionConnections: new GetRegionConnectionsUseCase(regionRepository),
    simulateRegionFailover: new SimulateRegionFailoverUseCase(regionRepository),
    getCostCatalog: new GetCostCatalogUseCase(costRepository),
    estimateCost,
    getSecurityChecks,
    getIamIdentities: new GetIamIdentitiesUseCase(securityRepository),
    getSharedResponsibility: new GetSharedResponsibilityUseCase(securityRepository),
    getSystemAlerts: new GetSystemAlertsUseCase(getSecurityChecks, regionRepository),
    getCloudProposals: new GetCloudProposalsUseCase(planningRepository),
    registerCloudProposal: new RegisterCloudProposalUseCase(planningRepository, costRepository),
    updateCloudProposal: new UpdateCloudProposalUseCase(planningRepository),
    deleteCloudProposal: new DeleteCloudProposalUseCase(planningRepository),
    getActiveProposal: new GetActiveProposalUseCase(planningRepository),
    setActiveProposal: new SetActiveProposalUseCase(planningRepository),
    loadExampleScenario: new LoadExampleScenarioUseCase(planningRepository, EXAMPLE_SCENARIO_DATA),
    resetWorkspace: new ResetWorkspaceUseCase(planningRepository),
    getNetworkArchitecture: new GetNetworkArchitectureUseCase(networkRepository, planningRepository, regionRepository),
    getDashboardSummary,
    generateCloudReport: new GenerateCloudReportUseCase(
      getDashboardSummary,
      getCloudServices,
      getSecurityChecks,
      estimateCost,
      regionRepository,
      planningRepository,
    ),
  }
}

export type Container = ReturnType<typeof buildContainer>

/** Singleton composition root — one dependency graph for the whole app lifetime. */
export const container: Container = buildContainer()
