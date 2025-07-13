const s3 = require('../config/r2config');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const moment = require('moment');

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL;

const uploadToR2 = async (files, masterType, customerName) => {
  const uploadPromises = files.map((file) => {
    const ext = path.extname(file.originalname) || '';
    const baseName = path.basename(file.originalname, ext) || 'file';
    const documentType = (file.documentType || file.fieldname || 'unknown') + '';
    const docTypeSafe = documentType.replace(/\s+/g, '-');
    const date = moment().format('YYYY-MM-DD');
    const uniqueName = `${baseName}_${docTypeSafe}_${date}_${uuidv4()}${ext}`;
    const key = `${masterType}/${customerName}/${uniqueName}`;

    // if (!file.buffer || !file.mimetype) {
    //   console.warn(`Skipping file: ${file.originalname} (missing buffer or mimetype)`);
    //   return null;
    // }
if (!file.buffer || file.buffer.length === 0) {
  console.warn(`Skipping ${file.originalname} — buffer is empty.`);
  return null;
}

    return s3.putObject({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise().then(() => ({
      key,
      url: `${PUBLIC_R2_BASE_URL}/${key}`,
    }));
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean); // remove any nulls
};

module.exports = { uploadToR2 };
