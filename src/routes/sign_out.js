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

module.exports = router;