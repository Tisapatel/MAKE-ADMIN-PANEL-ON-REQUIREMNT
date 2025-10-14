const express = require('express');
const bodyParser = require('body-parser');
const passport = require('./middlewares/passport');
require('dotenv').config({ quiet: true });
const db = require('./configs/db')
const flash = require('connect-flash');
const addFlash = require('./middlewares/flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3008;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL}),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash())
app.use(addFlash)

app.use('/', require('./routers'))

app.listen(PORT, (err)=>{
    if(!err){
        db();
        console.log(`Server Connected at http://localhost:${PORT}`);
        
    }
});
