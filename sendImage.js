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
  const query = "SELECT phone_number FROM customers";
  const result = await pool.query(query);
  const numbers = result.rows?.map((row) => row.phone_number);
  return numbers;
}
const sendMessage = async (phoneNumber) => {
    try {
      const response = await axios.post('https://graph.facebook.com/v20.0/'+ phoneNumberID + '/messages', 
      {
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: "template",
        template: { name: "request_news", language: {code: "en_US"}}
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
const messageAllCustomers = async () => {
  const numbers = await getPhoneNumbers();
  numbers.map((number) => sendMessage(number));
}

messageAllCustomers();