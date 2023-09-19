const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const app = express();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydatabase';

const client = new MongoClient(MONGODB_URI);

(async() => {
    await client.connect();
    console.log('Baza połączona!');
    await client.close();
})();

app.listen(PORT,'localhost',() => {
    console.log(`Server listening on http://localhost:${PORT}`)
})