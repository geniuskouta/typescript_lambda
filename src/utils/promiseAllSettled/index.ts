export type PromiseSettledStatus = 'fulfilled' | 'rejected'

export const getErrorResults = <T>(results: Array<PromiseSettledResult<T>>): Array<PromiseSettledResult<T>> => {
  return results.filter(item => item.status === 'rejected')
}
