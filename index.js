const connectToMongo = require('./db');
const express = require('express');
const { default: mongoose } = require('mongoose');
var cors = require('cors');
const router = require('./routes');

connectToMongo(); 
mongoose.set('strictQuery', false);

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

app.use('/crud', router);

app.listen(port, () => {
  console.log(`Backend is listening on port ${port}`)
});