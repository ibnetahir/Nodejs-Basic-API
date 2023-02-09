const { default: mongoose } = require('mongoose');
const logger = require('./utils/winston.service');

const mongoURI = "mongodb://localhost:27017";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI, ()=> {
        logger.info("connected to mongo successfully");
    })
}

module.exports = connectToMongo;