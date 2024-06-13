const AWS = require('aws-sdk');

const uploadToS3 = (data, fileName) => {
    const BUCKET_NAME = process.env.BUCKET_NAME
    const IAM_USER_KEY = process.env.IAM_USER_KEY
    const IAM_USER_SECRET = process.env.IAM_USER_SECRET
  
    let s3Bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET
    })
  
    let params = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: data,
      ACL: 'public-read',
    }
  
    return new Promise((resolve, reject) => {
      s3Bucket.upload(params, (err, s3Response) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          console.log('s3Response', s3Response)
          resolve(s3Response.Location)
        }
      })
    })
  }
  
  module.exports = {
    uploadToS3
  }
