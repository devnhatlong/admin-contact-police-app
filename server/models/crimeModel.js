const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var CrimeSchema = new mongoose.Schema({
    crimeName: {
        type: String,
        required: true,
        trim: true,
    },
    fieldId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FieldOfWork',
    },
    description: {
        type: String,
        default: "",
        trim: true,
    }
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('Crime', CrimeSchema);
