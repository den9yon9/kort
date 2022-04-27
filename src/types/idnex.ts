export interface Workspace {
  origin: string
  branches: string[]
  webhook?: string
  path: string
  source: string
  dist: string
}
