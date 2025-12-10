const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var DepartmentSchema = new mongoose.Schema({
    departmentName: {
        type:String,
        required: true,
        trim: true,
    },
    departmentType: {
        type:String,
        required: true,
        trim: true,
    }
}, {
    timestamps: true
});

//Export the model
module.exports = mongoose.model('Department', DepartmentSchema);