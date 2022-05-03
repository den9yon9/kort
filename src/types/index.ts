export interface Task {
  origin: string
  branch: string
  compare: string
}

export interface ProjectWithState {
  state: 'pending' | 'fulfilled' | 'rejected',
  project: string,
  reason?: string
}