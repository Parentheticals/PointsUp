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

// Get information of the person that logged in
router.get('/:userId/profile',(req,res,next)=>{

    // debug
    // console.log("Here");
    // console.log(StudentModel.findById(req.session.userId))

    // Get all organizations
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
                        let arraysum = [];
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
                            for(var k = 0; k<orglist.length; k++){
                                if(orglist[k].org_name == user.organization[i].org_name){
                                    p_org_short_name = orglist[k].org_short_name
                                    break;
                                }
                            }
                            arraysum.push({
                                p_org_shname: p_org_short_name,
                                p_org_name: user.organization[i].org_name,
                                allpoints: sum
                            })
                        }
                        return res.render('profile',{
                            student: user,
                            totalpoints: arraysum,
                            page: "Profile"
                        })
                    }
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