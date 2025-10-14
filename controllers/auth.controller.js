const User = require('../models/user.model')
const bcrypt = require('bcrypt');
const sendMail = require('../middlewares/sendMail');
const crypto = require('crypto');

exports.signupPage = (req, res) => {
    res.render('./pages/signup')
}

exports.loginPage = (req, res) => {
    res.render('./pages/login')
}

exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // check password exists
        if (!password) {
            req.flash("error_msg", "Password is required.");
            return res.redirect("/signup");
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            req.flash('success_msg', 'Email already registered.');
            return res.redirect('/signup'); // add return
        }

        // hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // store temp user in session
        req.session.tempUser = {
            username,
            email,
            password: hashPassword,
            otp,
            otpExpire: Date.now() + 10 * 60 * 1000
        }

        // send OTP email
        await sendMail(
            email,
            "Your OTP code",
            `<h2>Hello ${username},</h2>
             <p>Your OTP is:</p>
             <h1>${otp}</h1>
             <p>Valid for 10 minutes.</p>`
        )

        req.flash('success_msg', 'OTP sent to your email.');
        return res.render('pages/otpVerify');

    } catch (error) {
        console.error(error);
        req.flash("error_msg", "Something went wrong. Please try again.");
        return res.redirect(req.get('Referrer') || '/');
    }
};

exports.otpVerifyPage = (req, res) => {
    return res.render('./pages/otpVerify')
}

exports.otpVerify = async (req, res) => {
    try {
        const { otp } = req.body;

        const tempUser = req.session.tempUser;

        if (!tempUser) {
            req.flash("error_msg", "Session expired. Please signup again.");
            return res.redirect("/signup");
        }

        if (tempUser.otp !== otp || tempUser.otpExpire < Date.now()) {
            req.flash("error_msg", "Invalid or expired OTP.");
            return res.redirect("/otpVerify");
        }

        // create user
        await User.create({
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password
        });

        // clear session
        req.session.tempUser = null;
        req.flash("success_msg", "Email verified successfully. Please login.");
        return res.redirect("/login"); // correct route

    } catch (error) {
        console.log(error);
        req.flash("error_msg", "OTP verification failed.");
        return res.redirect(req.get('Referrer') || '/');
    }
};

exports.forgotPassPage = (req, res) => {
    return res.render('./pages/forgotPass')
}

exports.forgotPass = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            req.flash('error_msg', 'Email not registered');
            return res.redirect(req.get('Referrer') || '/');
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpire = Date.now() + 10 * 60 * 1000;;
        await user.save();

        await sendMail(
            email,
            "Your OTP code",
            `<h2>Hello ${user.username},</h2>
            <p>Your OTP is:</p>
            <h1>${otp}</h1>
            <p>Valid for 10 minutes.</p>`
        );

        req.session.tempUser = {
            email,
            otp
        }

        req.flash('success_msg', 'OTP sent on your email.')
        return res.redirect('/changeOtpVerify');

    } catch (error) {
        console.log(error.message);
        req.flash('error_msg', 'Email Verification failed.')
        return res.redirect(req.get('Referrer') || '/')
    }
}

exports.changeOtpVerifyPage = (req, res) => {
    return res.render('./pages/changeOtpVerify')
}

exports.changeOtpVerify = async (req, res) => {
    try {
        const { otp } = req.body;

        const tempUser = req.session.tempUser;

        if (!tempUser) {
            req.flash('error_msg', 'Session expired. Please try again.')
            return res.redirect(req.get('Referrer') || '/')
        }

        const user = await User.findOne({ email: tempUser.email })

        if (!user) {
            req.flash('error_msg', 'User not found.')
            return res.redirect(req.get('Referrer') || '/')
        }

        if (tempUser.otp !== otp) {
            req.flash('error_msg', 'Invalid OTP.')
            return res.redirect(req.get('Referrer') || '/')
        }

        req.flash('success_msg', 'Email verification successfull. Please change your password.')
        return res.redirect('/newPassword')

    } catch (error) {
        console.log(error.message);
        req.flash('error_msg', 'OTP Verification failed.')
        return res.redirect(req.get('Referrer') || '/')
    }
}

exports.newpasswordPage = (req, res) => {
    return res.render('./pages/newPassword')
}


exports.newPassword = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const tempUser = req.session.tempUser;

        if (newPassword == confirmPassword) {
            const user = await User.findOne({ email: tempUser.email });
            user.password = await bcrypt.hash(newPassword, 10);

            await user.save();

            req.flash('success_msg', 'NewPassword and ConfirmPassword Match. Please Login Again.')
            return res.redirect('/login')
        }
        else {
            req.flash('error_msg', 'New Password and Confirm Password not match..')
            return res.redirect(req.get('Referrer') || '/')
        }
    } catch (error) {
        console.log(error.message);
        req.flash('error_msg', 'New Password and Confirm Password not match..')
        return res.redirect(req.get('Referrer') || '/')
    }
}

exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            req.flash('error_msg', 'Logout failed, try again.');
            return res.redirect('/login');
        }
        req.flash('success_msg', 'Logged out successfully.');
        res.redirect('/login');
    });
};
