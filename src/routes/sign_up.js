<<<<<<< HEAD
let StudentModel = require('../models/person');
let path = require('path');
let express = require('express');
let router = express.Router();

router.post('/sign_up',(req,res)=>{

    // debug
    // console.log(req.body);

    if(!req.body){
        return res.status(400).send('Request Body is missing');
    }
    let model = new StudentModel(req.body);
    model.save()
        .then(doc => { //doc is the document that is saved
            if(!doc || doc.length === 0) { // if doc is not saved or is nothing
                return res.status(500).send(doc) // respond with an error
            }
            req.session.userId = doc._id;
            return res.redirect(`/${doc._id}/profile`);
        })
        // .catch(err=> {
        //     res.status(500).json(err)
        // })
})

router.get("/",(req,res)=>{
    res.render('landingpage');
})

router.get("/sign_up_form",(req,res)=>{
    res.render('signup');
})
=======
let StudentModel = require('../models/person');
let path = require('path');
let express = require('express');
let router = express.Router();

router.post('/sign_up',(req,res)=>{

    // debug
    // console.log(req.body);

    if(!req.body){
        return res.status(400).send('Request Body is missing');
    }
    let model = new StudentModel(req.body);
    model.save()
        .then(doc => { //doc is the document that is saved
            if(!doc || doc.length === 0) { // if doc is not saved or is nothing
                return res.status(500).send(doc) // respond with an error
            }
            req.session.userId = doc._id;
            return res.redirect(`/${doc._id}/profile`);
        })
        // .catch(err=> {
        //     res.status(500).json(err)
        // })
})

router.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../../public/static/sign_up.html"));
})

>>>>>>> a00f69ecf1071a6e080d8a1169d22c84d87f4aa7
module.exports = router;