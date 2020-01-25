let EventModel = require('../models/event');
let StudentModel = require('../models/person');
let OrgSchema = require('../models/organization_mod');
let mongoose = require('mongoose');
let express = require('express');
let router = express.Router();

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

router.get('/:userId/organization/all',needsLog,(req,res,next)=>{
    OrgSchema.find({})
        .exec((err,orgs)=>{
            if(err){
                return next(err);
            }
            StudentModel.findById(req.params.userId)
                .exec((err,user)=>{
                    if(err){
                        return next(err);
                    }
                    let empty = true;
                    if(orgs.length > 0){
                        empty = false;
                    }
                    res.render('organization_list',{
                        student: user,
                        page: "All Organizations",
                        orglist: orgs,
                        isEmpty: empty
                    })
                })
        })
})

router.get('/:userId/organization/addform',needsLog,(req,res,next)=>{
    StudentModel.findById(req.params.userId)
        .exec((err,user)=>{
            if(err){
                return next(err);
            } else {
                res.render('add_org_form',{
                    student: user,
                    page: "Adding an organization"
                })
            }
        })
})

router.post('/:userId/organization/add',(req,res)=>{
    if(!req.body){
        return res.status(400).send('Request Body is missing')
    }
    let org = new OrgSchema(req.body);
    org.save()
        .then(doc => {
            if(!doc || doc.length === 0){
                return res.status(500).send(doc)
            }
            StudentModel.findById(req.params.userId)
                .exec((err,user)=>{
                    if(err){
                        return next(err);
                    } else {
                        let admindata = {
                            ad_org_name: `${doc.org_name}`
                        }
                        let orgdata = {
                            org_name: `${doc.org_name}`
                        }
                        user.adminorganization.push(admindata); // The user that created the organization is going to be an admin of it
                        user.organization.push(orgdata); // The user that created the organizations is also going to be part of it
                        user.save();
                    }
                })
            res.redirect(`/${req.params.userId}/organization/all`)
        })
})

// Organization page
router.get('/:userId/:organization/desc',needsLog,(req,res,next)=>{
    // Get organization
    OrgSchema.findOne({org_short_name: req.params.organization})
        .exec((err,org)=>{
            if(err){
                return next(err);
            } else {
                if(org!=null){
                    // Get Events
                    EventModel.find({organization: org.org_name}).sort({event_day: 1})
                        .exec((err,events)=>{
                            let del = 0;
                            // Update the events
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
                            if(err){
                                return next(err);
                            } else {
                                // Get User
                                StudentModel.findById(req.params.userId)
                                    .exec((err,user)=>{
                                        if(err){
                                            return next(err);
                                        } else {
                                            let adminorg = false;
                                            let empty = true;
                                            let hasjoined = false;
                                            if(user.adminorganization!=null){
                                                // console.log("AdmOrg Not null")
                                                // console.log(user.adminorganization);
                                                // console.log(org.org_name);
                                                for(var i = 0; i<user.adminorganization.length; i++ ){
                                                    // console.log(user.adminorganization[i].ad_org_name)
                                                    if(user.adminorganization[i].ad_org_name == org.org_name){
                                                        // console.log("Got inside")
                                                        adminorg = true;
                                                    }
                                                }
                                            }
                                            if(user.organization!=null){
                                                // console.log("Org Not null")
                                                // console.log(user.organization);
                                                // console.log(org.org_name);
                                                for(var i = 0; i<user.organization.length; i++ ){
                                                    // console.log(user.adminorganization[i].ad_org_name)
                                                    if(user.organization[i].org_name == org.org_name){
                                                        // console.log("Got inside")
                                                        hasjoined = true;
                                                    }
                                                }
                                            }
                                            if(events.length > 0){
                                                empty = false;
                                            }
                            
                                            // debug
                                            // console.log(req.params.organization);
                                            // console.log(user);
                                            // console.log(empty);
                            
                                            res.render('org_page',{
                                                page: org.org_name,
                                                org_data: org,
                                                student: user,
                                                eventlist: events,
                                                isEmpty: empty,
                                                addevent: adminorg,
                                                joined: hasjoined
                                            })
                                        }
                                    })
                            }
                    })
                }
            }
        })
})

// Update the user to join that organization
router.get('/:userId/:organization/join',needsLog,(req,res,next)=>{
    OrgSchema.findOne({org_short_name: req.params.organization})
        .exec((err,org)=>{
            // console.log("1");
            if(err){
                return next(err);
            } else {
                StudentModel.findById(req.params.userId)
                    .exec((err,user)=>{
                        // console.log("2");
                        if(err){
                            return next(err);
                        } else {
                            // console.log("3");
                            let data = {
                                org_name: org.org_name
                            }
                            user.organization.push(data);
                            user.save();
                            // console.log("4");
                            res.redirect(`/${req.params.userId}/${org.org_short_name}/desc`);
                        }
                    })
            }
        })
})

router.get('/:userId/:organization/logs',needsLog,(req,res,next)=>{
    StudentModel.findById(req.params.userId)
        .exec((err,user)=>{
            if(err){
                return next(err);
            }
            OrgSchema.findOne({org_short_name: req.params.organization})
                .exec((err,org)=>{
                    if(err){
                        return next(err);
                    }
                    let logs = [];
                    for(var i = 0; i<user.points.length; i++){
                        // console.log(user.points[i].p_org);
                        // console.log(org[0].org_name);
                        if(user.points[i].p_org == org.org_name){
                            // console.log("Got here");
                            logs.push(user.points[i]);
                        }
                    }
                    let isadmin = false;
                    for(var i = 0; i<user.adminorganization.length; i++){
                        if(user.adminorganization[i].ad_org_name == org.org_name){
                            isadmin = true;
                        }
                    }
                    // console.log(logs);
                    res.render('point_logs',{
                        student: user,
                        page: `${org.org_short_name}'s Logs`,
                        org_data: org,
                        logs: logs,
                        admin: isadmin
                    })
                })
        })
})

// User is already an admin
router.get('/:userId/:organization/studentlogs',needsLog,(req,res,next)=>{
    StudentModel.findById(req.params.userId)
        .exec((err,user)=>{
            if(err){
                return next(err);
            } else {
                OrgSchema.findOne({org_short_name: req.params.organization})
                    .exec((err,org)=>{
                        if(err){
                            return next(err);
                        } else {
                            // Get all the students inside an organization
                            StudentModel.find({'organization.org_name': org.org_name})
                                .exec((err,studentlist)=>{
                                    // console.log(studentlist)
                                    if(err){
                                        return next(err);
                                    } else {
                                        let studentdata = [];
                                        // Go through all the students
                                        for(var i = 0; i<studentlist.length; i++){
                                            // console.log("1");
                                            let sum = 0;
                                            for(var j = 0; j<studentlist[i].points.length; j++){
                                                // console.log("2");
                                                sum = sum + studentlist[i].points[j].value;
                                            }
                                            // console.log(studentlist[i].name),
                                            // console.log(sum),
                                            studentdata.push({
                                                studentname: studentlist[i],
                                                points: sum
                                            })
                                        }
                                        // console.log(studentdata);
                                        res.render('admin_log',{
                                            student: user,
                                            page: `${org.org_short_name}'s AdminLogs`,
                                            org_data: org,
                                            data: studentdata
                                        })
                                    }
                                })
                        }
                    })
            }
        })
})

router.get('/:userId/:organization/leave',(req,res,next)=>{
    StudentModel.findById(req.params.userId)
        .exec((err,user)=>{
            if(err){
                return next(err);
            } else {
                OrgSchema.findOne({org_short_name: req.params.organization})
                    .exec((err,org)=>{
                        console.log(2)
                        if(err){
                            return next(err);
                        } else {
                            for(var i = 0; i<user.organization.length;i++){
                                console.log(3)
                                if(user.organization[i].org_name == org.org_name){
                                    user.organization.splice(i,1);
                                    user.save();
                                    break;
                                }
                            }
                            res.redirect(`/${user._id}/profile`);
                        }
                })
            }
        })
})

module.exports = router;