import {client, MONGODB_URI} from "../utils/db";

(async() => {
    try {
        await client.connect();
        console.log('Connecting to cards ' + MONGODB_URI);
    } catch (err) {
        console.error(`Error connecting to database: ${err}`);
    }
})();

