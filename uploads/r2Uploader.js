const s3 = require('../config/r2config');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const moment = require('moment')

const uploadToR2 = async (files) => {
  const uploadPromises = files.map((file) => {
    const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      const date = moment().format('YYYY-MM-DD');
      const uniqueName = `${baseName}_${date}_${uuidv4()}${ext}`;
   
    return s3
      .putObject({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: uniqueName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise()
      .then(() => uniqueName);
  });

  return Promise.all(uploadPromises);
};

module.exports = { uploadToR2 };
