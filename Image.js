const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
})

const Image = mongoose.model('Image', imageSchema, 'images')
module.exports = Image
