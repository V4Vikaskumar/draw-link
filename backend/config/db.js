const mongoose = require('mongoose');
require("dotenv").config();

module.exports = async function () {
    return await mongoose.connect(process.env.DB_URL);
}