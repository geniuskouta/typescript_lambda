interface CustomErrorParams {
  status: number
  subCode?: string
  message?: string
}

export interface CustomError extends Error {
  status: number
  subCode?: string
}

class CustomErrorModel extends Error {
  private readonly status
  private readonly subCode

  constructor ({ status, subCode, message }: CustomErrorParams) {
    super(message)
    this.name = 'ResponseError'
    this.status = status
    this.subCode = subCode
  }
}

export class ResponseErrorModel extends CustomErrorModel {}
export class BadRequestErrorModel extends CustomErrorModel {}
export class NotFoundErrorModel extends CustomErrorModel {}
