export interface Task {
  origin: string
  branch: string
  selector: string
  sender: string
}

export interface Project {
  name: string
  state: 'pending' | 'fulfilled' | 'rejected'
  path: string
  reason?: object
}
