const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.model');
const bcrypt = require('bcrypt');


passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'Invalid Email' });
            }

            const isValid = await bcrypt.compare(password, user.password)
            if (!isValid) {
                return done(null, false, { message: 'Invalid Password.' })
            }

            return done(null, user);

        } catch (error) {
            return done(error);

        }
    }));

passport.serializeUser((user, done) => {
    return done(null, user)
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        return done(error)
    }
});

passport.userAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.locals.user = req.user
        return next();
    }
    return res.redirect('/login');
}
module.exports = passport;