export type FileConfig = {
  accessKeyId?: string;
  secretAccessKey?: string;
  awsS3Region?: string;
  awsDefaultS3Bucket?: string;
  uploadPrefix: string;
  signedUrlExpiration: number;
  maxUploadBytes: number;
};
