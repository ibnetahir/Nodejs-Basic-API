const { default: mongoose, Schema } = require('mongoose');

const UserSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now
    },
    balance:{
        type: Number,
        default: 0
    }
});

const User = mongoose.model('user', UserSchema);
User.createIndexes();
module.exports = User;