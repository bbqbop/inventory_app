const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const LifePeriodSchema = new Schema({
    name: { type: String, required: true, maxLength: 100 },
    span: { type: String, required: true, maxLength: 100 },
    desc: { type: String, required: true, maxLength: 250 },
});

// Virtual for category URL
LifePeriodSchema.virtual('url').get(function(){
    return `/catalog/lifeperiod/${this._id}`;
})

module.exports = mongoose.model('LifePeriod', LifePeriodSchema);