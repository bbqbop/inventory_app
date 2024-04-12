module.exports = (req, res,next ) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.user = req.session.user || false;
    next();
};