export interface Workspace {
  origin: string
  branches: string[]
  webhook?: string
  path: string
  readonly source: string
  readonly dist: string
}
