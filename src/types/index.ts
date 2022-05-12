export interface Task {
  origin: string
  branch: string
  compare: string
  sender: string
}

export interface Project {
  name: string
  state: 'pending' | 'fulfilled' | 'rejected'
  path: string
  reason?: object
}
