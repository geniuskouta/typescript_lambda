import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REGION = process.env.AWS_REGION ?? 'eu-west-3'
const BUCKET = process.env.AWS_S3_BUCKET_DATA_LABELING ?? ''

class AWSS3 {
  private readonly s3Client: S3Client
  private readonly region: string
  private readonly bucketName: string
  private readonly expiresIn: number
  private static instance: AWSS3 | null = null

  constructor (s3Client: S3Client) {
    this.region = REGION
    this.s3Client = s3Client
    this.bucketName = BUCKET
    this.expiresIn = 60 * 60 // 1 hour in seconds
  }

  static getInstance (): AWSS3 {
    return this.instance ?? new this(new S3Client({ region: REGION }))
  }

  static destroyInstance (): void {
    this.instance = null
  }

  async generatePresignedUrl (objectPath: string): Promise<string> {
    const objectParams = {
      Bucket: this.bucketName,
      Key: objectPath
    }
    const url = await getSignedUrl(this.s3Client, new GetObjectCommand(objectParams), { expiresIn: this.expiresIn })
    return url
  }
}

export default AWSS3
