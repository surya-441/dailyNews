require('dotenv').config();
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { Pool } = require('pg');

const token = process.env.API_TOKEN;
const phoneNumberID = process.env.PHONE_ID;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const uploadImage = async (imagePath) => {
  const absolutePath = path.resolve(imagePath);
  const imageStream = fs.createReadStream(absolutePath);
  const formData = new FormData();
  formData.append('file', imageStream);
  formData.append('messaging_product', 'whatsapp');
  try {
    const response = await axios.post('https://graph.facebook.com/v21.0/'+ phoneNumberID + '/media',
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`,
      }
    });
    console.log(`Image uploaded.`, response.data);
  } catch (error) {
    console.error(`Error uploading the image:`, error);
  }
};


if(process.argv.length < 3) {
  console.log('Please give the image to upload.');
}
else {
  uploadImage(process.argv[2]);
}