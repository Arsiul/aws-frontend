import {
  ArrowDown,
  ArrowRight,
  Cloud,
  Database,
  DoorOpen,
  Globe,
  Lock,
  Network,
  Server,
  Shield,
  Split,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { NetworkArchitecture, NetworkNode, SecurityGroup, Subnet } from '../../../domain/entities'

const NODE_ICONS: Record<NetworkNode['type'], LucideIcon> = {
  internet: Globe,
  dns: Network,
  cdn: Zap,
  vpc: Cloud,
  gateway: DoorOpen,
  loadbalancer: Split,
  compute: Server,
  database: Database,
}

const NODE_SUBTITLES: Record<NetworkNode['type'], string> = {
  internet: 'Usuarios',
  dns: 'DNS',
  cdn: 'CDN',
  vpc: 'Red privada',
  gateway: 'Puerta de enlace',
  loadbalancer: 'Balanceo de carga',
  compute: 'Cómputo',
  database: 'Base de datos',
}

const EDGE_TYPES: NetworkNode['type'][] = ['internet', 'dns', 'cdn']

type Selection = { kind: 'node'; id: string } | { kind: 'subnet'; id: string } | null

interface NetworkDiagramProps {
  architecture: NetworkArchitecture
}

export function NetworkDiagram({ architecture }: NetworkDiagramProps) {
  const [selection, setSelection] = useState<Selection>(null)
  const { nodes, subnets, securityGroups, connections } = architecture

  const nodeById = (id: string) => nodes.find((n) => n.id === id)
  const groupsOf = (nodeId: string) => securityGroups.filter((sg) => sg.nodeIds.includes(nodeId))

  // Walk the traffic path from Internet so the edge services render in flow order.
  const ordered: NetworkNode[] = []
  let current = nodeById('internet')
  while (current && !ordered.includes(current)) {
    ordered.push(current)
    const fromId = current.id
    const next = connections.find((c) => c.from === fromId)
    current = next ? nodeById(next.to) : undefined
  }
  const edgeNodes = ordered.filter((n) => EDGE_TYPES.includes(n.type))
  const vpc = nodes.find((n) => n.type === 'vpc')
  const gateway = nodes.find((n) => n.type === 'gateway')
  const publicSubnets = subnets.filter((s) => s.kind === 'public')
  const privateSubnets = subnets.filter((s) => s.kind === 'private')

  const selectNode = (id: string) => setSelection({ kind: 'node', id })
  const selectSubnet = (id: string) => setSelection({ kind: 'subnet', id })
  const isNodeSelected = (id: string) => selection?.kind === 'node' && selection.id === id
  const isSubnetSelected = (id: string) => selection?.kind === 'subnet' && selection.id === id

  const renderNode = (node: NetworkNode) => (
    <DiagramNode
      key={node.id}
      node={node}
      securityGroups={groupsOf(node.id)}
      isSelected={isNodeSelected(node.id)}
      onSelect={selectNode}
    />
  )

  const renderSubnet = (subnet: Subnet) => (
    <SubnetBox
      key={subnet.id}
      subnet={subnet}
      isSelected={isSubnetSelected(subnet.id)}
      onSelect={selectSubnet}
    >
      {subnet.nodeIds.map(nodeById).filter((n): n is NetworkNode => Boolean(n)).map(renderNode)}
    </SubnetBox>
  )

  return (
    <div className="rounded-card border border-border bg-card p-4 shadow-card sm:p-8">
      <div className="flex flex-col items-center">
        {edgeNodes.map((node) => (
          <div key={node.id} className="flex flex-col items-center">
            {renderNode(node)}
            <VerticalArrow />
          </div>
        ))}

        {vpc && (
          <div className="w-full max-w-3xl rounded-2xl border-2 border-dashed border-brand/40 bg-brand/[0.03] p-3 sm:p-6">
            <button
              type="button"
              onClick={() => selectNode(vpc.id)}
              className={`mx-auto flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors duration-200 ${
                isNodeSelected(vpc.id)
                  ? 'border-brand bg-brand text-white'
                  : 'border-brand/30 bg-card text-brand hover:bg-brand/10'
              }`}
            >
              <Cloud size={16} />
              {vpc.label} · {architecture.vpcCidr}
            </button>

            <div className="mt-5 flex flex-col items-center">
              {gateway && (
                <>
                  {renderNode(gateway)}
                  <VerticalArrow />
                </>
              )}

              <div className="flex w-full flex-col items-center gap-3">{publicSubnets.map(renderSubnet)}</div>

              {privateSubnets.length > 0 && (
                <>
                  <VerticalArrow />
                  <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                    {privateSubnets.map((subnet, index) => (
                      <div key={subnet.id} className="contents">
                        {index > 0 && (
                          <div className="flex justify-center text-text-secondary">
                            <ArrowRight size={22} className="hidden sm:block" />
                            <ArrowDown size={22} className="sm:hidden" />
                          </div>
                        )}
                        <div className="flex-1">{renderSubnet(subnet)}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Legend />

      <DetailPanel selection={selection} architecture={architecture} groupsOf={groupsOf} />
    </div>
  )
}

function VerticalArrow() {
  return (
    <div className="flex flex-col items-center py-1.5">
      <div className="h-6 w-0.5 bg-border" />
      <ArrowDown size={16} className="-mt-1 shrink-0 text-text-secondary" />
    </div>
  )
}

interface DiagramNodeProps {
  node: NetworkNode
  securityGroups: SecurityGroup[]
  isSelected: boolean
  onSelect: (id: string) => void
}

function DiagramNode({ node, securityGroups, isSelected, onSelect }: DiagramNodeProps) {
  const Icon = NODE_ICONS[node.type]

  return (
    <button
      type="button"
      onClick={() => onSelect(node.id)}
      className={`flex w-36 shrink-0 flex-col items-center gap-2 rounded-2xl border bg-card px-3 py-4 transition-all duration-200 sm:w-40 ${
        isSelected
          ? 'scale-105 border-brand bg-brand/10 shadow-md'
          : 'border-border hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand/5'
      }`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-200 ${
          isSelected ? 'bg-brand text-white' : 'bg-brand/10 text-brand'
        }`}
      >
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <div className="text-center">
        <span className="block text-sm font-semibold text-text-primary">{node.label}</span>
        <span className="mt-0.5 block text-[11px] text-text-secondary">{NODE_SUBTITLES[node.type]}</span>
      </div>
      {securityGroups.map((sg) => (
        <span
          key={sg.id}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-alert/50 px-2 py-0.5 text-[10px] font-semibold text-alert"
        >
          <Shield size={10} />
          {sg.name}
        </span>
      ))}
    </button>
  )
}

interface SubnetBoxProps {
  subnet: Subnet
  isSelected: boolean
  onSelect: (id: string) => void
  children: ReactNode
}

function SubnetBox({ subnet, isSelected, onSelect, children }: SubnetBoxProps) {
  const isPublic = subnet.kind === 'public'

  return (
    <div
      className={`w-full rounded-xl border p-3 transition-colors duration-200 ${
        isPublic ? 'border-security/40 bg-security/5' : 'border-text-secondary/30 bg-card'
      } ${isSelected ? 'ring-2 ring-brand/40' : ''}`}
    >
      <button type="button" onClick={() => onSelect(subnet.id)} className="flex w-full items-center justify-between gap-2 text-left">
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${isPublic ? 'text-security' : 'text-text-primary'}`}>
          {isPublic ? <Globe size={13} /> : <Lock size={13} />}
          {subnet.name}
        </span>
        <span className="font-mono text-[11px] text-text-secondary">{subnet.cidr}</span>
      </button>
      <p className="mt-0.5 text-[11px] text-text-secondary">{subnet.availabilityZone}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-3">{children}</div>
    </div>
  )
}

function Legend() {
  return (
    <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-text-secondary">
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border-2 border-dashed border-brand/50" /> VPC
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-security/50 bg-security/10" /> Subred pública
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded border border-text-secondary/40" /> Subred privada
      </span>
      <span className="flex items-center gap-1.5">
        <Shield size={12} className="text-alert" /> Security Group
      </span>
    </div>
  )
}

interface DetailPanelProps {
  selection: Selection
  architecture: NetworkArchitecture
  groupsOf: (nodeId: string) => SecurityGroup[]
}

function DetailPanel({ selection, architecture, groupsOf }: DetailPanelProps) {
  const node = selection?.kind === 'node' ? architecture.nodes.find((n) => n.id === selection.id) : undefined
  const subnet = selection?.kind === 'subnet' ? architecture.subnets.find((s) => s.id === selection.id) : undefined

  return (
    <div className="mx-auto mt-6 max-w-3xl rounded-lg border border-border bg-background p-4 text-sm text-text-secondary">
      {node && (
        <div key={node.id} className="animate-fadeIn space-y-2">
          <p>
            <span className="font-semibold text-text-primary">{node.label}: </span>
            {node.description}
          </p>
          {groupsOf(node.id).map((sg) => (
            <p key={sg.id} className="flex flex-wrap items-center gap-1.5 text-xs">
              <Shield size={12} className="text-alert" />
              <span className="font-semibold text-text-primary">{sg.name}</span> · Entrada permitida:
              {sg.inboundRules.map((rule) => (
                <span key={rule} className="rounded bg-card px-1.5 py-0.5 font-mono text-[11px]">
                  {rule}
                </span>
              ))}
            </p>
          ))}
        </div>
      )}

      {subnet && (
        <div key={subnet.id} className="grid animate-fadeIn gap-2 sm:grid-cols-2">
          <p className="sm:col-span-2">
            <span className="font-semibold text-text-primary">{subnet.name}: </span>
            {subnet.kind === 'public'
              ? 'tiene ruta hacia el Internet Gateway, por lo que sus recursos pueden recibir tráfico de Internet.'
              : 'no tiene ruta directa a Internet; sus recursos solo son accesibles desde dentro de la VPC.'}
          </p>
          <DetailItem label="Bloque CIDR" value={subnet.cidr} />
          <DetailItem label="Zona de disponibilidad" value={subnet.availabilityZone} />
          <DetailItem label="Tabla de rutas" value={subnet.routeTable} wide />
        </div>
      )}

      {!node && !subnet && (
        <p className="text-center">
          Haz clic en un componente, en la VPC o en una subred para ver su función, sus reglas y su tabla de rutas.
        </p>
      )}
    </div>
  )
}

function DetailItem({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <p className="text-[11px] uppercase tracking-wide">{label}</p>
      <p className="font-mono text-xs text-text-primary">{value}</p>
    </div>
  )
}
