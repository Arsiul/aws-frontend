import type { WorkspaceMode } from '../../domain/entities'

const MODE_KEY = 'cloudops.workspace-mode'

/** Read synchronously by the mock repositories: in a blank workspace they return no example data. */
export function readWorkspaceMode(): WorkspaceMode {
  try {
    return localStorage.getItem(MODE_KEY) === 'blank' ? 'blank' : 'demo'
  } catch {
    return 'demo'
  }
}

export function writeWorkspaceMode(mode: WorkspaceMode): void {
  try {
    if (mode === 'blank') localStorage.setItem(MODE_KEY, 'blank')
    else localStorage.removeItem(MODE_KEY)
  } catch {
    // Storage unavailable: the app keeps the default (demo) data.
  }
}

export const isBlankWorkspace = () => readWorkspaceMode() === 'blank'
