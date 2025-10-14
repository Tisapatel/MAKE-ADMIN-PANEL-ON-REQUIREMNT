const { Router } = require("express");

const userCtl = require('../controllers/auth.controller');
const passport = require('../middlewares/passport')

const authRouter = Router();

authRouter.get('/signup', userCtl.signupPage);
authRouter.post('/signup', userCtl.signup);

authRouter.get('/login', userCtl.loginPage);
authRouter.post('/login', (req,res,next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) next(err);
        if(!user){
            req.flash('error_msg', info ? info.message : "Invalid credentials");
            return res.redirect('/login');
        }

        req.logIn(user, (err)=> {
            if (err) return next(err);
            req.flash('success_msg', 'Login Successful.');

            if (user.role === 'admin') return res.redirect('/admin/dashboard');
            return res.redirect('/dashboard');
        });
    })(req,res,next);
})

authRouter.get('/otpVerify', userCtl.otpVerifyPage);
authRouter.post('/otpVerify', userCtl.otpVerify);

authRouter.get('/forgotPass', userCtl.forgotPassPage);
authRouter.post('/forgotPass', userCtl.forgotPass);

authRouter.get('/changeOtpVerify', userCtl.changeOtpVerifyPage);
authRouter.post('/changeOtpVerify', userCtl.changeOtpVerify);

authRouter.get('/newPassword', userCtl.newpasswordPage);
authRouter.post('/newPassword', userCtl.newPassword);

authRouter.use(passport.userAuth);

authRouter.get("/logout", userCtl.logout);

module.exports = authRouter;
