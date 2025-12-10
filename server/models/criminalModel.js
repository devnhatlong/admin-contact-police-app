const mongoose = require('mongoose');

var CriminalSchema = new mongoose.Schema(
    {
        socialOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SocialOrder',
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        birthDate: {
            type: Date,
            required: true,
        },
        crime: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crime',
            required: true,
        },
        province: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Province',
            required: true,
        },
        commune: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Commune',
            required: true,
        },
        job: {
            type: String,
            default: '',
        },
        isFemale: {
            type: Boolean,
            default: false,
        },
        isDrugAddict: {
            type: Boolean,
            default: false,
        },
        criminalRecord: {
            type: Boolean,
            default: false,
        },
        prosecution: {
            type: Boolean,
            default: false,
        },
        administrativeHandling: {
            type: Boolean,
            default: false,
        },
        fine: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Criminal', CriminalSchema);
// module.exports = mongoose.models.Criminal || mongoose.model('Criminal', CriminalSchema);