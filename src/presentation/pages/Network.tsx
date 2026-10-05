import { Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { EmptyState } from '../components/common/EmptyState'
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

      {architecture.nodes.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="Sin arquitectura todavía"
          description="La red se genera a partir de los servicios de tu solución activa: Route 53, CloudFront, VPC, subredes, EC2, RDS…"
          action={
            <Link to="/planning" className="btn-primary">
              Crear mi primera propuesta
            </Link>
          }
        />
      ) : (
        <NetworkDiagram architecture={architecture} />
      )}
    </div>
  )
}
