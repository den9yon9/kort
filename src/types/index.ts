export interface Workspace {
  origin: string
  branches: string[]
  webhook?: string
  hostname: string
  pathname: string
  path: string
  readonly source: string
  readonly dist: string
}

export interface Task {
  origin: string
  branch: string
  compare: string
  additional?: Record<string, string | string[]>
}
