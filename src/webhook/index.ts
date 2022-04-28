import axios from 'axios'
import type { Task } from 'src/types'

export default function webhook(
  stage: 'start' | 'builed' | 'error',
  task: Task
) {}
