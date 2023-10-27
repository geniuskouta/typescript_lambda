import { type NextFunction, type Request, type Response } from 'lambda-api'
import { errorHandler as exampleErrorHandler } from './example'
import { type CustomError } from '../../models/error'

const errorHandlers = [exampleErrorHandler]

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction): void => {
  let isErrorHandled = false

  for (const handler of errorHandlers) {
    isErrorHandled = handler(req, res, error)
    if (isErrorHandled) {
      break
    }
  }

  if (!isErrorHandled) {
    next()
  }
}
