var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');
var moment = require('moment');

/* GET /calendar */
router.get('/', async function(req, res, next) {
    let parms = { title: 'Calendar', active: { calendar: true } };

    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;

    if (accessToken && userName) {
        parms.user = userName;

        if (!req.session.fromDate && !req.session.toDate) {
            //Render message to user about input parameters.
            parms.message = "Enter the date parameters on the 'Home' page";
            res.render('error', parms);
        }
    } else {
        // Redirect to home
        res.redirect('/');
    }
});

/* POST /calendar */
router.post('/', async function(req, res) {
    //console.log('session: ', req.session);
    //console.log('req.body: ', req.body);
    let parms = {
        title: 'Calendar',
        active: {
            calendar: true
        }
    };

    const accessToken = await authHelper.getAccessToken(req.cookies, res);
    const userName = req.cookies.graph_user_name;
    const titleQueryFormat = req.cookies.queryFormat;
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const titleTemplate = req.body.titleTemplate;
    const queryFormat = req.body.queryFormat;
    var start;
    var end;
    var sessionData = req.session;
    //sessionData.fromDate = fromDate;
    //sessionData.toDate = toDate;
    //sessionData.titleTemplate = titleTemplate;
    /**
    console.log("Request Body:", req.body);
    console.log("From Date: ", fromDate);
    console.log("To Date: ", toDate);
    console.log("Query Format: ", queryFormat);
    */

    if (accessToken && userName) {
        parms.user = userName;

        // Initialize Graph client
        const client = graph.Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });

        const currentDate = new Date(new Date().setHours(0, 0, 0));
        if (fromDate) {
            // Set start of the calendar view to the date entered at midnight
            start = new Date(new Date(fromDate).setHours(0, 0, 0));
        } else {
            // Set end of the calendar view to 7 days from start
            start = new Date(new Date(currentDate).setDate(currentDate.getDate() - 31));
        }

        if (toDate) {
            // Set start of the calendar view to the date entered at midnight
            end = new Date(new Date(toDate).setHours(0, 0, 0));
        } else {
            // Set start of the calendar view to today at midnight
            end = new Date(currentDate);
        }

        /**
        console.log("Start Date: ", start.toLocaleString());
        console.log("End Date: ", end.toLocaleString());
        */
        try {
            // Get the first 10 events for the coming week
            const result = await client
                .api(`/me/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}`)
                .top(1000)
                .select('subject,start,end,location,body,organizer')
                .orderby('start/dateTime ASC')
                .get();

            //console.log("Results: ", result.value);
            var matchArray = [];
            var strPattern = /^\[(.*)\]\s(.*)$/g;
            for (var i = 0, len = result.value.length; i < len; i++) {
                // Do stuff with arr[i]
                var match;
                var calendarEntry = new Object();
                var theSubject = result.value[i].subject;
                console.log("titleTemplate: ", titleTemplate);
                console.log("subject: ", theSubject);
                if (titleTemplate == 0 && theSubject) { //NO filtering NOR Company Extraction
                    calendarEntry.company = "";
                    calendarEntry.calendarTitle = result.value[i].subject;
                    calendarEntry.date = moment(new Date(result.value[i].start.dateTime)).local().format("YYYY/MM/DD");
                    var totalTime = (Math.abs(new Date(result.value[i].end.dateTime) - new Date(result.value[i].start.dateTime)) / (1000 * 60 * 60).toFixed(1));
                    calendarEntry.totalTime = totalTime;
                    calendarEntry.location = result.value[i].location.displayName;
                    calendarEntry.organizer = result.value[i].organizer.emailAddress.name + " (" + result.value[i].organizer.emailAddress.address + ")";
                    var cleanBody = result.value[i].body.content.replace(/<[^>]+>|\&nbsp\;/g, '');
                    calendarEntry.body = cleanBody.replace(/\r|\n/g, '');
                    matchArray.push(calendarEntry);
                }
                if (titleTemplate == 1 && theSubject) { //Filter AND Extract Company - [COMPANY] Calendar Title
                    if (result.value[i].subject.match(strPattern)) {
                        var match = strPattern.exec(result.value[i].subject);
                        calendarEntry.company = match[1].trim();
                        calendarEntry.calendarTitle = match[2];
                        calendarEntry.date = moment(new Date(result.value[i].start.dateTime)).local().format("YYYY/MM/DD");
                        var totalTime = (Math.abs(new Date(result.value[i].end.dateTime) - new Date(result.value[i].start.dateTime)) / (1000 * 60 * 60).toFixed(1));
                        calendarEntry.totalTime = totalTime;
                        calendarEntry.location = result.value[i].location.displayName;
                        calendarEntry.organizer = result.value[i].organizer.emailAddress.name + " (" + result.value[i].organizer.emailAddress.address + ")";
                        var cleanBody = result.value[i].body.content.replace(/<[^>]+>|\&nbsp\;/g, '');
                        calendarEntry.body = cleanBody.replace(/\r|\n/g, '');
                        matchArray.push(calendarEntry);
                    }
                }
            }
            sessionData.events = matchArray;
            parms.events = matchArray;
            res.render('calendar', parms);
        } catch (err) {
            parms.message = 'Error retrieving events';
            parms.error = {
                status: `${err.code}: ${err.message}`
            };
            parms.debug = JSON.stringify(err.body, null, 2);
            res.render('error', parms);
        }
    } else {
        // Redirect to home
        res.redirect('/');
    }
});

module.exports = router;