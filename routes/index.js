var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET home page. */
router.get('/', async function(req, res, next) {
    let parms = { title: 'Home', active: { home: true } };

    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;
    const titleQueryFormat = req.cookies.queryFormat;

    if (accessToken && userName) {
        parms.user = userName;
        parms.queryFormat = titleQueryFormat;
        parms.debug = `User: ${userName}\nAccess Token: ${accessToken}`;
        req.session.regenerate((err) => {
            if (err) {
                return reject(err);
            }
            req.session.userName = userName;
            req.session.save((err) => {
                if (err) {
                    return reject(err);
                }
                //resolve();
            });
        });
    } else {
        parms.signInUrl = authHelper.getAuthUrl();
        parms.debug = parms.signInUrl;
    }

    res.render('index', parms);
});

module.exports = router;