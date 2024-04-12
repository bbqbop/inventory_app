require('dotenv').config()

const User = require('../models/user')

const asyncHandler = require('express-async-handler');

exports.loginGET = (req, res) => {
    res.render('login', {
        currentUrl: '/login'
    })
}
exports.loginPOST = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ name: req.body.name });

    if (!user){
        res.render('login', {
            name: req.body.name,
            error: 'User not found.'
        })
    }

    if (user.password === req.body.password) {
        await User.updateOne({_id: user._id}, {isLoggedIn: true} );
        req.session.isLoggedIn = true;
        req.session.user = user.name;
        res.redirect('/');
        // return res.status(200).json({ message: "Login successful" });
    } else {
        res.render('login', {
            name: req.body.name,
            error: 'Incorrect password.'
        })
    }
});

exports.logoutPOST = asyncHandler(async (req, res,) => {
    await User.updateOne( {name: req.session.user}, {isLoggedIn: false} );
    req.session.isLoggedIn = false;
    req.session.user = false;
    res.redirect('/');
})