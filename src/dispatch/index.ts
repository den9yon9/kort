import { Task } from 'src/types/index'

export default class Dispatcher {
  private static currentTask: Task | null = null
  private static queue: Task[] = []
  static register(task: Task) {
    this.queue.push(task)
    if (this.currentTask === null) this.next()
  }

  private static next() {
    const task = this.queue.pop()
    if (task) this.handle(task)
    else this.currentTask = null
  }

  private static async handle(task: Task) {
    // 1. 解析task的workspace
    // 2. pull task的workspace
    // 3. 获取task对应的projects
    // 4. 打包
  }
}
