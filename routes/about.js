var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');

/* GET /about */
router.get('/', async function(req, res) {
    let parms = {
        title: 'About',
        active: {
            about: true
        }
    };

    parms.signInUrl = authHelper.getAuthUrl();
    res.render('about', parms);
});

module.exports = router;