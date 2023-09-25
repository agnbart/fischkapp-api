import * as express from 'express';
import cors = require('cors');
import {homeRouter} from "./routers/home";
import {cardRouter} from "./routers/card";

const app = express();

const PORT: number = Number(process.env.PORT) || 4000;

require ('./db/mongodb');

const corsOptions = {
    origin: 'http://localhost:2000'
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', homeRouter)
app.use('/cards', cardRouter);

app.listen(PORT,'localhost',() => {
    console.log(`Server listening on http://localhost:${PORT}`)
});