require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

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

app.post('/webhook', (req, res) => {
	const body = req.body;
	console.log('Incoming Webhook: ' + JSON.stringify(req.body));
	res.sendStatus(200);
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Webhook is listening on port ${PORT}`);
});
