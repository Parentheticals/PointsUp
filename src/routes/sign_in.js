let StudentModel = require('../models/person');
let path = require('path');
let express = require('express');
let router = express.Router();

// logemail and logpass is being passed from the form in sign_in
router.post('/sign_in',(req,res,next)=>{
    StudentModel.authentication(req.body.logemail, req.body.logpass, (err,user)=>{
        //debug
        // console.log(`Get ${req.body.logemail} and ${req.body.logpass}`);

        if(err || !user ){ //weird stuff that is not supposed to happen
            let err = new Error("Wrong email or password");
            err.status = 401;
            return next(err);
        } else {
            req.session.userId = user._id;
            // Update this
            // Check if the user has joined an organization
            // if(user.organization.length==0){ // User has not joined an organization
            //     return res.redirect(`/organizations/${user._id}`);
            // }
            return res.redirect(`/${user._id}/profile`);
        }
    })
})

// Go to sign_in html file
router.get('/sign_in_form',(req,res)=>{
    return res.render('signin');
})

module.exports = router;