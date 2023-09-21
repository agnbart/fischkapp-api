import * as express from 'express';
import {homeRouter} from "./routers/home";
import {cardRouter} from "./routers/card";

const app = express();

const PORT: number = Number(process.env.PORT) || 4000;

require ('./db/mongodb');

app.use(express.json());

app.use('/', homeRouter)
app.use('/cards', cardRouter);

app.listen(PORT,'localhost',() => {
    console.log(`Server listening on http://localhost:${PORT}`)
});