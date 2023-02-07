const connectToMongo = require('./db');
const express = require('express');
const { default: mongoose } = require('mongoose');
var cors = require('cors');
const {user, note} = require('./routes');

connectToMongo(); 
mongoose.set('strictQuery', false);

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());

app.use('/api' , user);
app.use('/api' , note);

app.listen(port, () => {
  console.log(`Backend is listening on port ${port}`)
});