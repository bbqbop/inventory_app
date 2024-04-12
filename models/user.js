const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: { type: String, minLength: 5, required: true },
    password: { type: String, minLength: 5, required: true },
    isLoggedIn: { type: Boolean }
})

module.exports = mongoose.model('User', UserSchema)