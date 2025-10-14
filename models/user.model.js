const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema ({
    username: String,
    email: String,
    password: String
})

const User = mongoose.model('userTbl', userSchema);

module.exports = User;