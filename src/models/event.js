let mongoose = require('mongoose');
let Person = require('./person.js')
let StudentModel = require('../models/person');
let PersonSchema = mongoose.model('Person').schema;

let EventSchema = new mongoose.Schema({
    event_name: {
        type: String,
        required: true,
    },
    event_day: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        default: "Well, come to the event and figured it out!"
    },
    duration: {
        // In minutes
        type: Number,
        required: true,
    },
    password: {
        type: String,
        max: 4,
        required: true
    },
    organization: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    // 3 options. Scheduled, Ongoing, Done
    status: {
        type: String,
        required: true,
        default: "Scheduled"
    },
    openpass: {
        type: Boolean,
        required: true,
        default: false
    }
})

// Show option for password (input: text)
// User is going to be passed via parameter (name parameter)

// Accept password
EventSchema.statics.acceptPass = function(event, log_event_pass, userId, org_name, callback){
    StudentModel.findById(userId)
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
            if(log_event_pass === event.password){

                let data = {
                    value: event.value,
                    event_name: event.event_name,
                    event_time: event.event_day,
                    p_org: org_name,
                    obtained: true
                }

                user.points.push(data);
                user.save();
                return callback(null, event);
            } else {
                let err = new Error('Wrong password');
                err.status = 401;
                return callback(err);
            }
        })
}

let Event = mongoose.model('Event', EventSchema);
module.exports = Event;