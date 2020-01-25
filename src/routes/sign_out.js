<<<<<<< HEAD
let express = require('express');
let path = require('path');
let router = express.Router();

router.get('/sign_out',(req,res,next)=>{
    // console.log(`I am here save ${req.session}`)
    if(req.session){
        req.session.destroy(err=>{
            if(err){
                return next(err);
            } else {
                // console.log(`Am I here?`)
                return res.redirect('/');
            }
        })
    }
})

=======
let express = require('express');
let path = require('path');
let router = express.Router();

router.get('/sign_out',(req,res,next)=>{
    // console.log(`I am here save ${req.session}`)
    if(req.session){
        req.session.destroy(err=>{
            if(err){
                return next(err);
            } else {
                // console.log(`Am I here?`)
                return res.redirect('/');
            }
        })
    }
})

>>>>>>> a00f69ecf1071a6e080d8a1169d22c84d87f4aa7
module.exports = router;