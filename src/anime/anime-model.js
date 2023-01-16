const mongoose = require('mongoose')

const schema = mongoose.Schema({    
    slug_name: {
        type: String,
        required: true,
        unique : true
    },
    name: {
        type: String,
        required: true,
    },
    names: {
        type: [{ type: String }],
        default: undefined
    },
    type: {
        type: String,
        required: false,
    },
    season: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false
    },
    images: {
        type: [{ type: String }],
        default: undefined
    },
    description: {
        type: String,
        required: false
    },
    source: {
        mal: { type: Object },
        atc: { type: Object }
    },
    extra: {
        type: [{ type: Object }],
        default: undefined
    }    
}, { versionKey: false, timestamps: true })

module.exports = mongoose.model('animes', schema)