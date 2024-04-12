require('dotenv').config()

exports.loginGET = (req, res) => {
    res.render('login')
}
exports.loginPOST = (req, res) => {
    const { user, password, loggedIn } = JSON.parse(process.env.credentials)
    if (user === user && password === password) {
        console.log(loggedIn)
    }
}