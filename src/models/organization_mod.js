let mongoose = require('mongoose');
let Person = require('./person.js')
let PersonSchema = mongoose.model('Person').schema;

let OrganizationSchema = new mongoose.Schema({
    org_name: {
        type: String,
        required: true,
        unique: true,
    },
    org_short_name:{
        type:String,
        required:true,
        unique: true,
    },
    org_desc: {
        type: String,
        required: true
    }
})

let Organization = mongoose.model('Organizations', OrganizationSchema);
module.exports = Organization;