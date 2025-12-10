const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var ProvinceSchema = new mongoose.Schema({
    provinceName: {
        type: String,
        required: true,
        unique: true,
    },
    provinceCode: {
        type: String,
        default: "",
        trim: true,
    },
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('Province', ProvinceSchema);
