const { v2: cloudinary } = require('cloudinary');
const { environment } = require('./environment');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error('Cloudinary environment variables are required.');
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

function createSignedUploadPayload(extraParams = {}) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    ...extraParams,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder: extraParams.folder || 'smart-field-ops',
  };
}

module.exports = {
  cloudinary,
  createSignedUploadPayload,
};