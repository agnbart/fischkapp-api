const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;

app.listen(PORT,'localhost',() => {
    console.log(`DoggieNote server listening on http://localhost:4000`)
})