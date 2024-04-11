const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const DinoSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    desc: { type: String, required: true, maxLength: 250 },
    lifePeriod: { type: Schema.Types.ObjectId, ref: 'LifePeriod', required: true},
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true}],
})

// Virtual for URL

DinoSchema.virtual('url').get(function () {
    return `/catalog/dino/${this._id}`;
})

module.exports = mongoose.model('Dino', DinoSchema);