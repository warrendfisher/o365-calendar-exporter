const jwt = require('jsonwebtoken');
var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET /authorize. */
router.get('/', async function(req, res, next) {
    // Get auth code
    const code = req.query.code;
    //console.log('AUTH-Code: ', code);

    // If code is present, use it
    if (code) {
        let token;

        try {
            token = await authHelper.getTokenFromCode(code, res);
            //console.log('AUTH-Token created: ', token.token);
            // Redirect to home
            res.redirect('/');
        } catch (error) {
            //console.log('AUTH-Error: ', error);
            res.render('error', { title: 'Error', message: 'Error exchanging code for token', error: error });
        }
    } else {
        // Otherwise complain
        res.render('error', { title: 'Error', message: 'Authorization error', error: { status: 'Missing code parameter' } });
    }
});

/* GET /authorize/signout */
router.get('/signout', function(req, res, next) {
    authHelper.clearCookies(res);
    req.session.destroy();
    // Redirect to home
    res.redirect('/');
});

module.exports = router;