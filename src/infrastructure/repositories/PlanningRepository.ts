import type { CloudProposal } from '../../domain/entities'
import type { IPlanningRepository } from '../../domain/repositories'
import { simulatedDelay } from '../../shared/utils/async'

const STORAGE_KEY = 'cloudops.proposals'

function readFromStorage(): CloudProposal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CloudProposal[]) : []
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

/** Persists proposals in localStorage so a registered plan survives a page reload
 *  without needing a backend yet. */
export class PlanningRepository implements IPlanningRepository {
  async getAll(): Promise<CloudProposal[]> {
    await simulatedDelay()
    return readFromStorage()
  }

  async create(proposal: Omit<CloudProposal, 'id' | 'createdAt'>): Promise<CloudProposal> {
    await simulatedDelay()

    const newProposal: CloudProposal = {
      ...proposal,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    const proposals = [newProposal, ...readFromStorage()]
    writeToStorage(proposals)

    return newProposal
  }

  async delete(id: string): Promise<void> {
    await simulatedDelay()
    writeToStorage(readFromStorage().filter((proposal) => proposal.id !== id))
  }
}
