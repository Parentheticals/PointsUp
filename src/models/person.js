let mongoose = require('mongoose');
// let PointsSchema = require('../models/points')
let bcrypt = require('bcryptjs');

let PersonSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required:true,
    },
    // Important things
    points: {
        type: [{
            value: {
                type: Number,
                required: true,
            },
            event_name: {
                type: String,
                required: true,
            },
            event_time: {
                type: Date,
                required: true,
            },
            p_org:{
                type: String,
                required: true,
            },
            obtained: {
                type: Boolean,
                required: true,
            }
        }],
        default: [],
        required: true
    },
    // false means student. True means admin
    status: {
        type: Boolean,
        default: false,
        required: true,
    },
    organization: {
        type: [{org_name: String}],
        default: [],
        required: true
    },
    adminorganization: {
        type: [{ad_org_name: String}],
        default: [],
        required: true
    }
})

// Autheticate input anainst database
PersonSchema.statics.authentication = function(email, password, callback) {
    Person.findOne({email: email})
        .exec((err,user)=>{
            if(err){
                return callback(err);
            } else {
                if (!user) { // there is nothing
                    let err = new Error('User not found');
                    err.status = 401;
                    return callback(err);
                }
            }
            bcrypt.compare(password, user.password, function(err,res){
                // debug
                // console.log(`You are here ${user.email} and ${user.password} and ${password}`);

                if(res === true){
                    return callback(null, user);
                } else {
                    // debug
                    console.log(`Got weird stuff going on. res is not true`)
                    return callback();
                }
            })
        })
}

// Hashing user password before saving it to the database

PersonSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

var Person = mongoose.model('Person', PersonSchema);
module.exports = Person;