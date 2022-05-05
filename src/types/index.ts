export interface Task {
  origin: string
  branch: string
  compare: string
}

export interface Project {
  state: 'pending' | 'fulfilled' | 'rejected'
  path: string
  reason?: string
}
