const flash = require('connect-flash');

const addFlash = (req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
}

module.exports = addFlash;