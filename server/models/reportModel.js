const mongoose = require('mongoose');

// Declare the Schema of the Mongo model
var ReportSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    topicId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
        required: true,
    },
    reportTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReportType',
        required: true,
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: true,
    },
    reportContent: {
        type: String,
        default: "",
    }
}, {
    timestamps: true
});

// Export the model
module.exports = mongoose.model('Report', ReportSchema);
