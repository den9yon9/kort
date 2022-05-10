import axios from 'axios'

export default async function build(
  port: number,
  origin: string,
  branch: string,
  compare
) {
  try {
    const response = await axios.post(`http://localhost:${port}/build`, {
      origin,
      branch,
      compare
    })
    if (response) console.log(response.data)
  } catch (err) {
    console.log(`build失败, 请检查是否已启动kort服务: ${err.message}`)
  }
}
