// models/Creator.js
const mongoose = require('mongoose');

const creatorSchema = new mongoose.Schema({
    name: String,
    genre: String,
    age: Number,
    category: [String],
    videoTypes: [String],
    profileImage: String,
    portfolioImages: [String],
    description: String,
    country : String,
    langue : [String],
    atout :[String],
    videos :[String],
});

module.exports = mongoose.model('Creator', creatorSchema);


