const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  endpoint: process.env.R2_ENDPOINT, // e.g., https://<account>.r2.cloudflarestorage.com
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto',
});

module.exports = s3;
