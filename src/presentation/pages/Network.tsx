import { Share2 } from 'lucide-react'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { PageHeader } from '../components/common/PageHeader'
import { SolutionBanner } from '../components/common/SolutionBanner'
import { NetworkDiagram } from '../components/network/NetworkDiagram'
import { useNetworkArchitecture } from '../hooks/useNetworkArchitecture'

export function Network() {
  const { data: architecture, error } = useNetworkArchitecture()

  // Only the first load shows a spinner; refetches after a solution change keep the old diagram.
  if (error) return <ErrorState message={error} />
  if (!architecture) return <LoadingState label="Cargando arquitectura de red…" />

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Share2}
        title="Arquitectura de red"
        description={
          architecture.solutionName
            ? `Topología generada a partir de los servicios de "${architecture.solutionName}".`
            : 'Flujo de tráfico: Internet → Route 53 → CloudFront → VPC (Internet Gateway, subredes y Security Groups) → EC2 / RDS.'
        }
      />

      <SolutionBanner detail="el diagrama se arma con sus servicios" />

      <NetworkDiagram architecture={architecture} />
    </div>
  )
}
