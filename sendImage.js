require('dotenv').config();
const axios = require('axios');
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
const getPhoneNumbers = async () => {
  const query = `SELECT phone_number FROM CUSTOMERS where opt_in_preference = true AND NOW() - last_interaction < interval '1' day`;
  const result = await pool.query(query);
  const numbers = result.rows?.map((row) => row.phone_number);
  return numbers;
}
const sendImageToNumber = async (phoneNumber, image_id, caption) => {
    try {
      const response = await axios.post('https://graph.facebook.com/v20.0/'+ phoneNumberID + '/messages', 
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: "image",
        image: { id: image_id, caption: caption}
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log(`Message sent to ${phoneNumber}:`, response.data);
    } catch (error) {
      console.error(`Error sending message to ${phoneNumber}:`, error.response.data);
    }
};
const sendImage = async (image_id, caption) => {
  const numbers = await getPhoneNumbers();
  numbers.map((number) => sendImageToNumber(number, image_id, caption));
}
if(process.argv.length < 3) {
  console.log("Please provide the image id")
}
else {
  image_id = process.argv[2];
  caption = process.argv.length === 4 ? process.argv[3] : "";
  sendImage(image_id, caption)
}