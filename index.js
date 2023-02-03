const connectToMongo = require('./db');
const express = require('express')
const { default: mongoose } = require('mongoose');
var cors = require('cors')

connectToMongo(); 
mongoose.set('strictQuery', false);

const app = express()
const port = 5000
app.use(cors())
app.use(express.json())

app.use('/api/auth' , require('./routes/auth'))
app.use('/api' , require('./routes/notes'))

app.get('/', (req, res) => {
  res.send('Hello Fida!')
})

app.listen(port, () => {
  console.log(`Backend is listening on port ${port}`)
})