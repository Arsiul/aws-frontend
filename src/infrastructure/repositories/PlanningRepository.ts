import type { CloudProposal } from '../../domain/entities'
import { defaultCostItems } from '../../domain/pricing'
import type { IPlanningRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'
import { COST_CATALOG_DATA } from '../data/costCatalog.data'

const STORAGE_KEY = 'cloudops.proposals'
const ACTIVE_KEY = 'cloudops.active-proposal'

/** Proposals saved before cost lines existed get one unit of each billable service. */
function normalize(proposal: CloudProposal): CloudProposal {
  return Array.isArray(proposal.costItems)
    ? proposal
    : { ...proposal, costItems: defaultCostItems(proposal.selectedServices ?? [], COST_CATALOG_DATA) }
}

function readFromStorage(): CloudProposal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CloudProposal[]).map(normalize) : []
  } catch {
    return []
  }
}

function writeToStorage(proposals: CloudProposal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals))
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently, in-memory state still works.
  }
}

function readActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY)
  } catch {
    return null
  }
}

function writeActiveId(id: string | null): void {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id)
    else localStorage.removeItem(ACTIVE_KEY)
  } catch {
    // Ignore: see writeToStorage.
  }
}

/** Persists proposals and the active one in localStorage so the demo survives a reload
 *  without needing a backend. */
export class PlanningRepository implements IPlanningRepository {
  async getAll(): Promise<CloudProposal[]> {
    await simulatedDelay()
    return readFromStorage()
  }

  async getById(id: string): Promise<CloudProposal | undefined> {
    await simulatedDelay(50)
    return readFromStorage().find((proposal) => proposal.id === id)
  }

  async create(proposal: Omit<CloudProposal, 'id' | 'createdAt'>): Promise<CloudProposal> {
    await simulatedDelay()

    const newProposal: CloudProposal = {
      ...proposal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    writeToStorage([newProposal, ...readFromStorage()])
    return newProposal
  }

  async update(proposal: CloudProposal): Promise<CloudProposal> {
    await simulatedDelay(50)
    writeToStorage(readFromStorage().map((p) => (p.id === proposal.id ? proposal : p)))
    return proposal
  }

  async delete(id: string): Promise<void> {
    await simulatedDelay()
    writeToStorage(readFromStorage().filter((proposal) => proposal.id !== id))
    if (readActiveId() === id) writeActiveId(null)
  }

  async replaceAll(proposals: CloudProposal[]): Promise<void> {
    await simulatedDelay()
    writeToStorage(proposals)
  }

  async getActiveId(): Promise<string | null> {
    const id = readActiveId()
    // A dangling id (proposal deleted elsewhere) counts as no active solution.
    return id && readFromStorage().some((p) => p.id === id) ? id : null
  }

  async setActiveId(id: string | null): Promise<void> {
    writeActiveId(id)
  }

  async clear(): Promise<void> {
    writeToStorage([])
    writeActiveId(null)
  }
}
