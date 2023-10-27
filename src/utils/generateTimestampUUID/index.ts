import { v4 as uuidv4 } from 'uuid'

export function generateTimestampUUID (): string {
  const timestamp = new Date().getTime().toString(16) // Convert current time to hexadecimal
  const randomUUID = uuidv4().replace(/-/g, '') // Remove hyphens from the random UUID

  return `${timestamp}-${randomUUID}`
}
