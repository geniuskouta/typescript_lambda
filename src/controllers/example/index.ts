import { type Request, type Response } from 'lambda-api'
import { BadRequestErrorModel, ResponseErrorModel } from '../../models/error'
import { getErrorResults } from '../../utils/promiseAllSettled'

export const get = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.query

  if (id === undefined) {
    throw new BadRequestErrorModel({ status: 400 })
  }

  const createPromises = ['a', 'b', 'c'].map(async (item: string): Promise<string> => {
    return await new Promise((resolve, reject) => {
      setTimeout(() => { resolve(item) }, 5000)
    })
  })

  const results: Array<PromiseSettledResult<string>> = await Promise.allSettled(createPromises)
  const errorResults = getErrorResults<any>(results)

  if (errorResults.length === results.length) {
    throw new ResponseErrorModel({ status: 500 })
  }

  if (errorResults.length > 0) {
    res.status(200).json({ message: 'Examples with a few unsuccessful results', error: errorResults }); return
  }

  res.status(200).json({ message: 'All examples' })
}
