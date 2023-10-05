import * as express from 'express';
import cors = require('cors');
import swaggerUi = require('swagger-ui-express');
import {homeRouter} from "./routers/home";
import {cardRouter} from "./routers/card";
import {checkAuthorization} from "./utils/check-authorization";
import swaggerSpec from './docs/swaggerConfig';

export const app = express();

const PORT: number = Number(process.env.PORT) || 4000;

require ('./db/mongodb');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(checkAuthorization);

const corsOptions = {
    origin: process.env.CORS_ORIGIN || `http://localhost:${PORT}`,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/', homeRouter)
app.use('/cards', cardRouter);


app.listen(PORT,() => {
    console.log(`Server listening on http://localhost:${PORT}`)
});
