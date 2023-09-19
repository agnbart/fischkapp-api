import * as express from 'express';
import {MongoClient} from 'mongodb';

const app = express();

const PORT: number = Number(process.env.PORT) || 4000;
const MONGODB_URI: string = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mydatabase';

const client = new MongoClient(MONGODB_URI);

(async() => {
    try {
        await client.connect();
        console.log('Connecting to database ' + MONGODB_URI);
    } catch (err) {
        console.error(`Error connecting to database: ${err}`);
    }
})();

app.listen(PORT,'localhost',() => {
    console.log(`Server listening on http://localhost:${PORT}`)
});