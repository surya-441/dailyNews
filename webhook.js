require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
});

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

app.get('/webhook', (req, res) => {
	const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
	const mode = req.query['hub.mode'];
	const token = req.query['hub.verify_token'];
	const challenge = req.query['hub.challenge'];

	if(mode && token === VERIFY_TOKEN) {
		console.log('Webhook verified');
		res.status(200).send(challenge);
	}
	else {
		res.sendStatus(403);
	}
});
async function set_true(phone_number, time) {
	const queryText = `
		UPDATE customers
		SET opt_in_preference = true, last_interaction = TO_TIMESTAMP($2)
		WHERE phone_number = $1
		`;
	const values = [phone_number, time]	
	try {
		const res = await pool.query(queryText, values);
		console.log('DB Updated');
	} catch(error) {
		console.error('Error updating DB', error.stack);
	}
}
app.post('/webhook', (req, res) => {
	const body = req.body;
	console.log('Incoming Webhook: ' + JSON.stringify(body));
	const phone_number = body.entry[0].changes[0].value.contacts[0].wa_id
	const messages = body.entry[0].changes[0].value.messages
	for (const message of messages) {
		if(message.type === 'text') {
			if(message.text.body === 'Yes') {
				const time = message.timestamp;
				console.log('Recieved Yes from ' + phone_number + ' at ' + Date(time).toString())
				set_true(phone_number, time)
			}
		}
	}
	res.sendStatus(200);
});

app.listen(process.env.HTTP_PORT, () => {
	console.log(`Webhook is listening on port ${process.env.HTTP_PORT}`);
});
