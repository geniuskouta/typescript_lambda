import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'
import { DynamoDB, GetItemCommand, DeleteItemCommand, UpdateItemCommand, PutItemCommand, QueryCommand, type GetItemOutput, type QueryCommandOutput } from '@aws-sdk/client-dynamodb'

const REGION = process.env.AWS_REGION ?? 'eu-west-3'

class AWSDynamoDB {
  private readonly dbClient: DynamoDB
  private readonly region: string
  private static instance: AWSDynamoDB | null = null

  constructor (dbClient: DynamoDB) {
    this.region = REGION
    this.dbClient = dbClient
  }

  static getInstance (): AWSDynamoDB {
    return this.instance ?? new this(new DynamoDB({ region: REGION }))
  }

  static destroyInstance (): void {
    this.instance = null
  }

  async getItem (tableName: string, key: Record<string, any>): Promise<any | undefined> {
    const command = new GetItemCommand({
      TableName: tableName,
      Key: marshall(key)
    })

    const response: GetItemOutput = await this.dbClient.send(command)

    if (response.Item !== null && response.Item !== undefined) {
      return unmarshall(response.Item)
    } else {
      return undefined
    }
  }

  async deleteItem (tableName: string, key: Record<string, any>): Promise<void> {
    const command = new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key)
    })

    await this.dbClient.send(command)
  }

  async queryItems (tableName: string, queryOptions: {
    keyConditionExpression: string
    expressionAttributeNames: Record<string, string>
    expressionAttributeValues: Record<string, any>
    limit?: number
  }): Promise<any> {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: queryOptions.keyConditionExpression,
      ExpressionAttributeValues: marshall(queryOptions.expressionAttributeValues),
      ExpressionAttributeNames: queryOptions.expressionAttributeNames,
      Limit: queryOptions.limit ?? 50
    })

    const response: QueryCommandOutput = await this.dbClient.send(command)
    if (response.Items !== undefined) {
      return response.Items.map(item => unmarshall(item))
    } else {
      return []
    }
  }

  async updateItem (tableName: string, key: Record<string, any>, attributesToUpdate: Record<string, any>): Promise<void> {
    const sanitizedAttributes = this.removeKeysWithUndefinedValues(attributesToUpdate)
    const updateOptions = AWSDynamoDB.generateUpdateOptions(sanitizedAttributes)
    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: marshall(key),
      UpdateExpression: updateOptions.updateExpression,
      ExpressionAttributeNames: updateOptions.expressionAttributeNames,
      ExpressionAttributeValues: marshall(updateOptions.expressionAttributeValues)
    })

    await this.dbClient.send(command)
  }

  async putItem (tableName: string, item: Record<string, any>): Promise<void> {
    const sanitizedItem = this.removeKeysWithUndefinedValues(item)
    const command = new PutItemCommand({
      TableName: tableName,
      Item: marshall(sanitizedItem)
    })

    await this.dbClient.send(command)
  }

  private removeKeysWithUndefinedValues (item: Record<string, any>): Record<string, any> {
    return Object.fromEntries(Object.entries(item).filter(([_, value]) => value !== undefined))
  }

  static generateUpdateOptions (attributesToUpdate: Record<string, any>): Record<string, any> {
    const expressionAttributeNames: Record<string, any> = {}
    const expressionAttributeValues: Record<string, any> = {}

    Object.keys(attributesToUpdate).forEach((key, index) => {
      const attributeName = `#attr${index}`
      expressionAttributeNames[attributeName] = key
      expressionAttributeValues[`:${key}`] = attributesToUpdate[key]
    })

    const updateExpression = `SET ${Object.keys(expressionAttributeNames)
      .map(attributeName => `${attributeName} = :${expressionAttributeNames[attributeName]}`)
      .join(', ')}`

    return {
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues
    }
  }

  static generateSortKeyString (sortKeyObject: Record<string, any>): string {
    const result = []
    const sortKeyValueList = Object.entries(sortKeyObject)

    for (const [key, value] of sortKeyValueList) {
      if (value === undefined) {
        break
      }
      result.push(key.toUpperCase() + '#' + value)
    }

    if (result.length === 0) {
      // if sort key values are all undefined, return the first key as a upper case string
      return sortKeyValueList[0][0].toLocaleUpperCase()
    }

    return result.join('')
  }

  static generateSortKeyObject (sortKeyString: string, sortKeys: string[]): Record<string, any> {
    const sortKeyObject: Record<string, any> = {}

    let updatedSortKeyString = sortKeyString

    sortKeys.forEach((key, index) => {
      updatedSortKeyString = updatedSortKeyString.slice(`${sortKeys[index]}#`.length)
      if (index === sortKeys.length - 1) {
        // last item
        sortKeyObject[key] = updatedSortKeyString
      } else {
        // first items
        const sortKeyValue = updatedSortKeyString.split(`${(sortKeys[index + 1]).toUpperCase()}#`)[0]
        updatedSortKeyString = updatedSortKeyString.slice(sortKeyValue.length)
        sortKeyObject[key] = sortKeyValue
      }
    })

    return sortKeyObject
  }
}

export default AWSDynamoDB
