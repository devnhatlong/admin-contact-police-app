const mongoose = require('mongoose');

var SocialOrderAnnexSchema = new mongoose.Schema(
    {
        socialOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SocialOrder',
            required: true,
        },
        commonAnnex: {
            numberOfDeaths: {
                type: Number,
                default: 0,
            },
            numberOfInjuries: {
                type: Number,
                default: 0,
            },
            numberOfChildrenAbused: {
                type: Number,
                default: 0,
            },
            propertyDamage: {
                type: Number,
                default: 0,
            },
            propertyRecovered: {
                type: Number,
                default: 0,
            },
            gunsRecovered: {
                type: Number,
                default: 0,
            },
            explosivesRecovered: {
                type: Number,
                default: 0,
            },
        },
        drugAnnex: {
            heroin: {
                type: Number,
                default: 0,
            },
            opium: {
                type: Number,
                default: 0,
            },
            cannabis: {
                type: Number,
                default: 0,
            },
            drugPlants: {
                type: Number,
                default: 0,
            },
            syntheticDrugs: {
                type: Number,
                default: 0,
            },
            syntheticDrugPills: {
                type: Number,
                default: 0,
            },
            otherDrugsWeight: {
                type: Number,
                default: 0,
            },
            otherDrugsVolume: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('SocialOrderAnnex', SocialOrderAnnexSchema);