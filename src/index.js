'use strict';

let express = require('express'),
    app = express(),
    path = require('path'),
    bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

let appointmentController = require(path.resolve(__dirname, "./controllers/appointments.js"));
let appointmentsRepo = require(path.resolve(__dirname, "./repositories/appointments.js"));
let mailer = require(path.resolve(__dirname, "./services/mailer.js"));
let mysql = require(path.resolve(__dirname, "./services/mysql_db.js"));
let guardNonJson = require(path.resolve(__dirname, "./middlewares/guard.js"));

appointmentsRepo = new appointmentsRepo(mysql);
appointmentController = new appointmentController(appointmentsRepo, mailer);

app.get("/", function (req, res) {
    res.sendFile("/index.html", {
        root: __dirname + '/views'
    });
});

app.get("/api/appointments", appointmentController.get);

app.post("/api/appointments/book", guardNonJson, appointmentController.create);

app.listen(8000, function () {
    console.log('Listening on *:8000');
});