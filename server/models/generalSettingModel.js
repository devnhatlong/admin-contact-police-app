const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var GeneralSettingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    time: {
        type: String,
        default: null,
    },
    description: {
        type: String,
        default: '',
    }
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('GeneralSetting', GeneralSettingSchema);
