const s3 = require('../config/r2config');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const moment = require('moment');

const PUBLIC_R2_BASE_URL = process.env.PUBLIC_R2_BASE_URL; // e.g. https://pub-xxxx.r2.dev

const uploadToR2 = async (projectName,files, masterType, customerName) => {
  const uploadPromises = files.map((file) => {
    const ext = path.extname(file.originalname) || '';
    const baseName = path.basename(file.originalname, ext) || 'file';
    const documentType = (file.documentType || file.fieldname || 'unknown') + '';
    const docTypeSafe = documentType.replace(/\s+/g, '-');
    const date = moment().format('YYYY-MM-DD');

    // Skip empty buffers
    if (!file.buffer || file.buffer.length === 0) {
      console.warn(`Skipping ${file.originalname} — buffer is empty.`);
      return null;
    }

    // Generate unique and readable file name
    const uniqueFileName = `${baseName}_${docTypeSafe}_${date}_${uuidv4()}${ext}`;

    // Key inside bucket (also used to rebuild public URL)
    const key = `${masterType}/${customerName}/${uniqueFileName}`;

    return s3.putObject({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise().then(() => ({
      key,                                   // Store this in DB
      url: `${PUBLIC_R2_BASE_URL}/${key}`   // Use this for frontend/preview
    }));
  });

  const results = await Promise.all(uploadPromises);
  return results.filter(Boolean); // removes skipped (null) entries
};

module.exports = { uploadToR2 };
