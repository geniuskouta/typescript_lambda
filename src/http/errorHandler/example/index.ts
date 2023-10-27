import { type Request, type Response } from 'lambda-api'
import { type CustomError } from '../../../models/error'

const handleError = (res: Response, error: CustomError): boolean => {
  switch (error.status) {
    case 400:
      res.status(error.status).json({ message: 'invalid input, object invalid' })
      break
    case 404:
      res.status(error.status).json({ message: 'Not found' })
      break
    case 500:
      res.status(error.status).json({ message: 'Internal server error' })
      break
    case 401:
    default:
      res.status(error.status).json({ message: error.message })
  }
  return true
}

export const errorHandler = (req: Request, res: Response, error: CustomError): boolean => {
  const url = req.path ?? ''
  const needToRun = !!url.includes('/example')
  if (needToRun) {
    return handleError(res, error)
  }
  return false
}
