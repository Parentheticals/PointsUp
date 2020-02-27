let StudentModel = require('../models/person');
let OrgSchema = require('../models/organization_mod');
let EventModel = require('../models/event');
let path = require('path');
let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
let db = mongoose.connection;

// Check if user has logged in, if so, they can access the page (MiddleWare)
function needsLog(req,res,next){
    // if(req.session && req.session.userId){
    if(req.session && req.session.userId && req.session.userId == req.params.userId){
        return next();
    } else {
        let err = new Error('Please, log in in order to view this page');
        err.status = 401;
        // Go back to sign up page
        return res.redirect('/');
    }
}

function getcurrentevent(org_name){
    EventModel.find({})
        .exec((err,events)=>{
            if(err){
                return next(err);
            }
            // Update events
            let del = 0;
            // console.log("Here inside");
            for(var i = 0; i<events.length-del; i++){
                if(events[i].event_day.getTime()<=Date.now() && events[i].event_day.getTime()>=(Date.now()-events[i].duration*60*1000)){
                    events[i].status = "Ongoing";
                    events[i].openpass = true;
                    events[i].save();
                } else {
                    events[i].openpass = false;
                    // Event has not yet started
                    if(events[i].event_day.getTime()>Date.now()){
                        events[i].status = "Scheduled";
                        events[i].save();
                    } else {
                        events[i].status = "Done";
                        EventModel.findByIdAndRemove(events[i]._id)
                            .then(doc => {
                                del++;
                                i--;
                            })
                            .catch(err => {
                                res.status(500).json(err)
                            })
                    }
                }
            }
            // console.log("Here again");
            for(var i = 0; i < events.length; i++){
                // console.log("In Loop");
                // console.log(events[i].event_name);
                // console.log(events[i].status === "Ongoing");
                if(events[i].organization == org_name && (events[i].status) === ("Ongoing")){
                    console.log(events[i].event_name);
                    return events[i];
                }
            }
            return null;
        })
    return null;
}

// Get information of the person that logged in
router.get('/:userId/profile',(req,res,next)=>{

    // debug
    // console.log("Here");
    // console.log(StudentModel.findById(req.session.userId))

    // Get all organizations
    EventModel.find({})
        .exec((err,events)=>{
    OrgSchema.find({})
        .exec((err,orglist)=>{
            if(err){
                return next(err);
            }
            StudentModel.findById(req.session.userId)
                .exec((error,user)=>{
                    if(error){
                        return next(error);
                    } else {
        
                        // debug
                        // console.log("In first else");
                        // console.log(user);
        
                        if( user === null) {
                            let err = new Error('Uh, waht¿');
                            err.status = 400;
                            return next(err);
                        }
                        // console.log("e");
                        let arraysum = [];
                        let currevents = [];
                        for(var i = 0; i<user.organization.length; i++){ // Get the org in which the person in inside
                            let sum = 0;
                            for(var j = 0; j<user.points.length; j++){
                                // console.log("Inside loop")
                                // console.log(user.points[j].p_org)
                                // console.log(user.organization[i].org_name)
                                if(user.points[j].p_org == user.organization[i].org_name){
                                    // console.log("Got accepted")
                                    sum = sum + user.points[j].value;
                                }
                            }
                            let p_org_short_name = "";
                            for(var k = 0; k<orglist.length - 1 ; k++){
                                
                                // console.log(orglist[k]);
                                if(orglist[k].org_name == user.organization[i].org_name){
                                    p_org_short_name = orglist[k].org_short_name

                                    // console.log("I'm here before push");

                                    arraysum.push({
                                        p_org_shname: p_org_short_name,
                                        p_org_name: user.organization[i].org_name,
                                        allpoints: sum
                                    });

                                            // console.log("I'm here in events")
                                            if(err){
                                                return next(err);
                                            }
                                            // Update events
                                            let del = 0;
                                            // console.log("Here inside");
                                            for(var i = 0; i<events.length-del; i++){
                                                if(events[i].event_day.getTime()<=Date.now() && events[i].event_day.getTime()>=(Date.now()-events[i].duration*60*1000)){
                                                    events[i].status = "Ongoing";
                                                    events[i].openpass = true;
                                                    events[i].save();
                                                } else {
                                                    events[i].openpass = false;
                                                    // Event has not yet started
                                                    if(events[i].event_day.getTime()>Date.now()){
                                                        events[i].status = "Scheduled";
                                                        events[i].save();
                                                    } else {
                                                        events[i].status = "Done";
                                                        EventModel.findByIdAndRemove(events[i]._id)
                                                            .then(doc => {
                                                                del++;
                                                                i--;
                                                            })
                                                            .catch(err => {
                                                                res.status(500).json(err)
                                                            })
                                                    }
                                                }
                                            }
                                            // console.log("Here again");
                                            for(var l = 0; l < events.length; l++){
                                                // console.log("In Loop");
                                                // console.log(events[l].event_name);
                                                // console.log(events[i].status === "Ongoing");
                                                if(events[l].organization == orglist[k].org_name && (events[l].status) === ("Ongoing")){
                                                    // console.log(events[l].event_name);
                                                    currevents.push({
                                                        p_org_shname: p_org_short_name,
                                                        current_event: events[l],
                                                    })
                                                    // console.log(currevents);
                                                }
                                            }
                                    break;
                                }
                            }
                        }
                        // console.log(currevents);
                        // console.log(arraysum);
                        return res.render('profile',{
                            student: user,
                            totalpoints: arraysum,
                            current_events: currevents
                        })
                    }
                })
        })
    })
})

router.get('/:userId/:organization/studentlogs/:memberId', (req,res,next)=>{
    StudentModel.findById(req.params.memberId)
        .exec((err,member)=>{
            if(err){
                return next(err);
            } else {
                OrgSchema.findOne({org_short_name: req.params.organization})
                    .exec((err,org)=>{
                        if(err){
                            return next(err);
                        } else {
                            StudentModel.findById(req.params.userId)
                                .exec((err,user)=>{
                                    if(err){
                                        return next(err);
                                    } else {
                                        let data = {
                                            ad_org_name: org.org_name
                                        }
                                        member.adminorganization.push(data);
                                        member.save()
                                        res.redirect(`/${user._id}/${org.org_short_name}/studentlogs`)
                                    }
                                })
                        }
                    })
            }
        })
})

module.exports = router;