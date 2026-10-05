import type { WorkspaceMode } from '../../domain/entities'
import type { IWorkspaceRepository } from '../../domain/repositories'
import { readWorkspaceMode, writeWorkspaceMode } from '../workspace/workspaceMode'

export class WorkspaceRepository implements IWorkspaceRepository {
  async getMode(): Promise<WorkspaceMode> {
    return readWorkspaceMode()
  }

  async setMode(mode: WorkspaceMode): Promise<void> {
    writeWorkspaceMode(mode)
  }
}
