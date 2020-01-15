let mongoose = require('mongoose');
let express = require('express');
let router = express.Router();
let path = require('path');
let EventModel = require('../models/event');
let StudentModel = require('../models/person');
let OrgSchema = require('../models/organization_mod');

// Check if user has logged in, if so, they can access the page (MiddleWare)
function needsLog(req,res,next){
    if(req.session && req.session.userId){
        return next();
    } else {
        let err = new Error('Please, log in in order to view this page');
        err.status = 401;
        // Go back to sign up page
        return res.redirect('/');
    }
}

router.get('/:userId/:organization/addeventform',needsLog,(req,res,next)=>{
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
                        // Check if the user is the admin of the org
                        if(user.adminorganization!=null){
                            for(var i = 0; i<user.adminorganization.length; i++ ){
                                if(user.adminorganization[i].ad_org_name == org.org_name){
                                    adminorg = true;
                                }
                            }
                        }
                        if(adminorg){
                            res.render('add_event_form',{
                                student: user,
                                organization: org.org_name,
                                org_data: org,
                            })
                        } else {
                            res.redirect(`/${user._id}/${org.org_short_name}/desc`)
                        }
                    }
                })
            }
        })
})

router.post('/:userId/:organization/addevent',(req,res)=>{
    if(!req.body){
        return res.status(400).send('Request Body is missing');
    }
    OrgSchema.findOne({org_short_name: req.params.organization})
        .exec((err,org)=>{
            if(err){
                return next(err);
            }
            // let time = combineDateAndTime(new Date(req.body.event_day), new Date(req.body.event_time))
            let event = {
                event_name: req.body.event_name,
                event_day: req.body.event_day,
                description: req.body.description,
                duration: req.body.duration,
                password: req.body.pw,
                organization: org.org_name,
                value: req.body.value,
                status: "Scheduled",
                openpass: false,
            }
            // console.log(time);
            let model = new EventModel(event);
            model.save()
                .then(doc => {
                    if(!doc || doc.length === 0) { // if doc is not saved or is nothing
                        return res.status(500).send(doc) // respond with an error
                    } else {
                        return res.redirect(`/${req.params.userId}/${org.org_short_name}/desc`)
                    }
                })
        })
})

router.post('/:userId/:organization/:eventId/pass',(req,res,next)=>{
    OrgSchema.findOne({org_short_name: req.params.organization})
        .exec((err,org)=>{
            if(err){
                return next(err);
            }
            EventModel.findById(req.params.eventId)
                .exec((err,event)=>{
                    if(err){
                        return next(err);
                    }
                    EventModel.acceptPass(event,req.body.password,req.params.userId,org.org_name,(err,events)=>{
                        if(err){
                            return next(err);
                        } else {
                            return res.redirect(`/${req.params.userId}/${req.params.organization}/desc`);
                        }
                    })
                })
    })
})

router.get('/:userId/:organization/:eventId/delete',(req,res,next)=>{
    console.log("Got into the delete thing");
    EventModel.findByIdAndRemove(req.params.eventId)
        .then(doc =>{
            console.log("Should got deleted");
            return res.redirect(`/${req.params.userId}/${req.params.organization}/desc`);
        })
})


module.exports = router;
