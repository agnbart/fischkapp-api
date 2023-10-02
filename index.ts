import * as express from 'express';
import cors = require('cors');
import {homeRouter} from "./routers/home";
import {cardRouter} from "./routers/card";
import {checkAuthorization} from "./utils/check-authorization";

export const app = express();

const PORT: number = Number(process.env.PORT) || 4000;

require ('./db/mongodb');

app.use(checkAuthorization);

const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:2000',
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', homeRouter)
app.use('/cards', cardRouter);

app.listen(PORT,'localhost',() => {
    console.log(`Server listening on http://localhost:${PORT}`)
});
