'use strict';

module.exports = class {
    constructor(appointmentsRepo, mailer) {
        this.appointmentsRepo = appointmentsRepo;
        this.mailer = mailer;
        this.get = this.get.bind(this);
        this.create= this.create.bind(this);
    }

    makeErrorResponse(data) {
        return {
            status: 400,
            error: {
                message: "error processing request, field validation errors",
                error_details: {
                    startDate: "required, must be a unix timestamp, must be less than endDate",
                    endDate: "required, must be a unix timestamp, must be greater than startDate",
                    received: {
                        startDate: data.startDate,
                        endDate: data.endDate,
                        all: data
                    }
                }
            }
        };
    }

    get(req, res) {
        let query = req.query;
        let startDate = parseInt(query.startDate);
        let endDate = parseInt(query.endDate);

        if (!this.validateGetRequest(startDate, endDate)) {
            res.status(400).json(this.makeErrorResponse(query));
            return;
        }

        this.appointmentsRepo.getAll(startDate, endDate)
            .then(results => {
                res.status(200).json({
                    status: 200,
                    message: `unix timestamps collected from ${startDate} to ${endDate}`,
                    data: results
                });
            })
            .catch(e => {
                res.status(500).json({
                    status: 500,
                    error: "Internal database error, unable to process request"
                });
            });

    }

    validateGetRequest(startDate, endDate) {
        let error = "bad input";

        if (!Number.isInteger(startDate) || !Number.isInteger(endDate))
                return false;

        if (!(startDate < endDate))
                return false;

        return true;
    }

    async create(req, res) {
        let json = req.body;

        console.log(json);

        if (!this.validatePostRequest(json)) {
            res.status(400).json(this.makeErrorResponse(json));
            return;
        }

        let timestamp = json.timestamp;
        let name = json.name;
        let email = json.email;
        let phone = json.phone;
        let result;

        try {
            result = await this.appointmentsRepo.create(timestamp, name, email, phone);
        }
        catch(e) {
            console.log(e);
            res.status(500).json({
                status: 500,
                error: "Internal database error, unable to process request"
            });
            return;
        }

        if (result.affectedRows == 0) {
            res.status(400).json({
                status: 400,
                error: "error processing request, appointment time already booked"
            });
            return;
        }

        let offset = 0;

        if (Number.isInteger(json.offset))
            offset = json.offset;

        let appointmentTime = timestamp + offset;

        let appointmentDate = new Date(appointmentTime * 1000);

        this.sendConfirmationEmail(email, appointmentDate);

        res.status(200).json({
            status: 200,
            message: "Appoinment successfully booked",
            data: json
        });
    }

    validatePostRequest(json) {
        if (!Number.isInteger(json.timestamp))
            return false;
        
        if (json.timestamp < Math.floor(new Date() / 1000))
            return false;

        if ((typeof json.name !== 'string') || (typeof json.email !== 'string')
            || (typeof json.phone !== 'string'))
            return false;

        if (json.name.match(/[^A-Za-z\s]/g))
            return false;

        if (!json.email.match(/^[^@]+@[^@]+\..+$/))
            return false;

        if (json.phone.match(/[^0-9\-]/g))
            return false;

        return true;
    }

    sendConfirmationEmail(email, date) {
        let d = date;

        let amPm = 'AM';
        let hours = d.getHours();

        if (hours >= 12)
            amPm = 'PM';

        if (hours > 12)
            hours -= 12;

        let formattedDate =
            `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()} ${hours}:${d.getMinutes()} ${amPm}`;

        let msg = `Thank you for booking your appointment at ${formattedDate}`;

        this.mailer.sendMail(email, "Appointment", msg);
    }


}