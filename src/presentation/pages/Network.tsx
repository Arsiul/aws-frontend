import { Share2 } from 'lucide-react'
import { ErrorState, LoadingState } from '../components/common/AsyncState'
import { PageHeader } from '../components/common/PageHeader'
import { NetworkDiagram } from '../components/network/NetworkDiagram'
import { useNetworkArchitecture } from '../hooks/useNetworkArchitecture'

export function Network() {
  const { data: architecture, isLoading, error } = useNetworkArchitecture()

  if (isLoading) return <LoadingState label="Cargando arquitectura de red…" />
  if (error) return <ErrorState message={error} />
  if (!architecture) return null

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Share2}
        title="Arquitectura de red"
        description="Flujo de tráfico: Internet → Route 53 → CloudFront → VPC (Internet Gateway, subredes y Security Groups) → EC2 / RDS."
      />

      <NetworkDiagram architecture={architecture} />
    </div>
  )
}
