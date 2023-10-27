import dotenv from 'dotenv'
import { type APIGatewayProxyEvent } from 'aws-lambda'
import lambdaApi, { type Request, type Response, type NextFunction } from 'lambda-api'
import * as exampleController from './controllers/example'
import { errorHandler } from './middlewares/errorHandler'
// Load environment variables from .env file
dotenv.config()

const api = lambdaApi()

type APIControllerType = (req: any, res: any) => void // the library does not accept Promise<void> return type

api.use((req: Request, res: Response, next: NextFunction) => {
  res.cors({}) // set cors options
  next()
})

api.use(errorHandler)

api.get('/example', exampleController.get as APIControllerType)

// Declare your Lambda handler
export const lambdaHandler = async (event: APIGatewayProxyEvent, context: any): Promise<void> => {
  // Run the request
  return await api.run(event, context)
}
