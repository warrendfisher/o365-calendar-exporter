var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var json2xls = require('json2xls');
var filesys = require('file-system');
var fs = require('fs');
var moment = require('moment');

/* GET /xlsexport */
router.get('/', async function(req, res) {
    //console.log('session: fromDate - ', req.session.fromDate);
    //console.log('session: toDate - ', req.session.toDate);
    //console.log('session: events - ', req.session.events);

    let parms = {
        title: 'Excel Export',
        active: {
            xlsexport: true
        }
    };

    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;
    const userEmail = req.cookies.graph_user_email;

    if (accessToken && userName) {
        //parms.user = userName;
        var calJson = req.session.events;
        var ip = req.ip;
        //console.log("client address: ", ip);

        var xlsx = json2xls(calJson, {
            fields: ['company', 'calendarTitle', 'date', 'totalTime', 'location', 'organizer', 'body']
        });

        //var filename = 'calendar-export_' + Math.random().toString(10).substr(2, 10) + '.xlsx';
        var filename = 'calendar-export_' + moment(new Date()).local().format("YYYYMMDDHHmmssSSS") + '.xlsx';
        var file = '/public/' + filename;

        filesys.writeFileSync(file, xlsx, 'binary');

        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        var filestream = filesys.createReadStream(file, function(err) {
            if (err) throw err;
        });

        filestream.pipe(res);
        fs.unlink(file);

        var logStream = fs.createWriteStream('./logs/exports.log', {
            'flags': 'a'
        });
        // use {'flags': 'a'} to append and {'flags': 'w'} to erase and write a new file
        //logStream.write('Initial line...');
        var logLine = moment(new Date()).local().format("YYYY-MM-DD HH:mm:ss") + "\t" + userEmail + "\t" + ip;
        logStream.write(logLine);
        logStream.end(
            "\n"
        );
    } else {
        // Redirect to calendar
        res.redirect('/calendar');
    }
});

module.exports = router;