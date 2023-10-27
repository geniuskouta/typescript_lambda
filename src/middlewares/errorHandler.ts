import { type NextFunction, type Request, type Response } from 'lambda-api'
import { type CustomError } from '../models/error'
import { errorHandler as handler } from '../http/errorHandler'

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  handler(error as CustomError, req, res, next)
}
