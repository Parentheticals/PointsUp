let express = require('express');
let app = express();
// routes
let signup = require('./routes/sign_up');
let signin = require('./routes/sign_in');
let signout = require('./routes/sign_out');
let profile = require('./routes/profile');
let events = require('./routes/event_page')
let organization = require('./routes/organizations')
// other stuff
let path = require('path');
let bodyParser = require('body-parser');
let session = require('express-session');
// mongoose stuff
let mongoose = require('mongoose');
let mongostore = require('connect-mongo')(session);
// view engine
app.set('view engine','pug');
app.set('views',path.join(__dirname,'/views'));

// I did this again in person.js. Not sure if rewritting it is necessary
let db = mongoose.connection;

const server = 'cluster0-2zltw.mongodb.net';
const database = 'PointsUp';
const user = 'parentheticals';
const password = 'Arstotzka1';

const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}

mongoose.connect(`mongodb+srv://${user}:${password}@${server}/${database}`, options);

db.on('error',console.log.bind(console, "connection error"));
db.once('open', function(callback){
    console.log("connection succeeded");
})

// Mongoose stuff up there 

app.use(bodyParser.json());

app.use((req,res,next) => {
    console.log(`${new Date().toString()} => ${req.originalUrl}`, req.body)
    next();
})

app.use(session({
    secret: "coding hard",
    resave: true,
    saveUninitialized: false,
    store: new mongostore({
        mongooseConnection: db
    })
}))

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(signup);
app.use(signin);
app.use(signout);
app.use(profile);
app.use(events);
app.use(organization);
app.use(express.static(path.join(__dirname, '../public')));

// Handler for 404 - Resource Not Found
app.use((req,res,next)=>{
    res.status(404).send("We think you are lost!")
})

// Handler for Error 500
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.sendFile(path.join(__dirname, '../public/static/public/500.html')) // Still need to make a 500.html file
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.info(`Server has started on ${PORT}`));