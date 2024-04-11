const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    desc: { type: String, required: true, maxLength: 250 },
});

// Virtual for category URL
CategorySchema.virtual('url').get(function(){
    return `/catalog/category/${this._id}`;
})

module.exports = mongoose.model('Category', CategorySchema);