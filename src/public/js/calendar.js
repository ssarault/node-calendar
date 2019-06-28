{
    'use strict';

    const CURDATE = new Date;

    const CURYEAR = CURDATE.getFullYear();

    const CURMONTH = CURDATE.getMonth();

    const CURDAY = CURDATE.getDate();

    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed',
        'Thu', 'Fri', 'Sat'
    ];

    const MONTHS = ['January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August', 'Septemeber',
        'Ocotber', 'November', 'December'
    ];

    const MONTHSABRV = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul',
        'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    let selectedDate = new Date(CURDATE.getTime());
    let selectedTimestamp;

    function setCalendarYear(year) {
        document.getElementById('calendar__year').textContent = year;
    }

    function setCalendarMonth(month) {
        document.getElementById('calendar__month').textContent = month;
    }

    function setCalendarDaysOfWeek() {
        let days = document.getElementById('calendar__day-names');

        for (let i = 0; i < 7; i++) {
            let node = document.createElement("li");
            let text = document.createTextNode(WEEKDAYS[i]);
            node.appendChild(text);
            node.classList = "calendar__weekday";
            days.appendChild(node);
        }

    }

    function setUpCalendar() {
        let i = 0;

        while (i < 6) {
            let week = document.createElement("ul");
            week.classList = "calendar__week";
            week.id = `calendar_week-${i}`;

            for (let d = 0; d < 7; d++) {
                let day = document.createElement("li");
                day.classList = 'calendar__day-square';
                day.id = `calendar__day-square-${i}-${d}`;
                day.textContent = "&nbsp;";
                week.appendChild(day);
            }

            document.getElementById('calendar__days').appendChild(week);
            i++;
        }
    }

    function setBookTime(d) {
        let hours = d.getHours();
        let mins = d.getMinutes();
        let stdHours, amPm;

        if (hours == 0) {
            stdHours = 12;
            amPm = 'AM';
        } else if (hours == 12) {
            stdHours = hours;
            amPm = 'PM';
        } else if (hours > 12) {
            stdHours = hours - 12;
            amPm = 'PM';
        } else {
            stdHours = hours;
            amPm = 'AM';
        }

        if (mins == 0) {
            d.setMinutes(30);
            mins = '00';
        } else {
            d.setMinutes(0);
            d.setHours(hours + 1);
        }

        return `${stdHours}:${mins} ${amPm}`;
    }

    function setUpBooking() {
        let i = 0;

        let bookContent = document.getElementById('calendar__book-content');
        let d = new Date(0, 0, 0);

        while (i < 48) {
            let row = document.createElement("div");
            row.classList = 'calendar__book-row';
            let j = 0;
            while (j < 7) {
                let col = document.createElement("div");
                if (j == 0 || j == 6) {
                    col.classList = 'calendar__book-time';
                    if (j == 0)
                        col.textContent = setBookTime(d);
                } else
                    col.classList = 'calendar__book-event';
                col.id = `calendar__book-item-${i}-${j}`;
                row.appendChild(col);
                j++;
            }
            bookContent.appendChild(row);
            i++;
        }
    }

    function renderBookingHeader() {
        let itemDate = new Date(selectedDate.getTime());

        for (let i = 0; i < 5; i++) {
            let item = document.getElementById(`calendar__book-header-item-${i}`);
            let dayOfWeek = WEEKDAYS[itemDate.getDay()];
            let month = MONTHSABRV[itemDate.getMonth()];
            let day = itemDate.getDate();
            let year = itemDate.getFullYear();
            item.textContent = `${dayOfWeek} ${month} ${day}, ${year}`;
            itemDate.setDate(day + 1);
        }
    }

    function renderBookingItemsSuccess(json, day) {
        let result = json;

        console.log(json);

        let p = 0;

        let parent = document.getElementById('calendar__book-content');

        for (let j = 1; j < 6; j++) {
            for (let i = 0; i < 48; i++) {
                let item = parent.querySelector(`#calendar__book-item-${i}-${j}`);

                let timestamp = new Date(selectedDate);
                timestamp.setMinutes(0, 0, 0);
                timestamp.setDate(day + j - 1);
                timestamp.setHours(Math.floor(i / 2));
                if (i % 2 != 0)
                    timestamp.setMinutes(30);
                let unixTimestamp = Math.floor(timestamp.getTime() / 1000);
                if (p < result.length && unixTimestamp == result[p].timestamp) {
                    console.log("BAM")
                    item.innerHTML = `<div class="calendar__book-btn calendar__book-btn--unavailable">Unavailable</div>`;
                    p++;
                    continue;
                }

                item.innerHTML = `<a href="#"
                            class="calendar__book-btn calendar__book-btn--available"
                            onclick="selectAppointmentDate(this)"
                            data-timestamp="${unixTimestamp}"
                        >Book Now</a>`;
            }
        }
    }

    function renderBookingItemsFailed(error) {
        console.log(error);
    }

    function renderBookingItems() {
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth();
        let day = selectedDate.getDate();
        let unixStart = Math.floor(+new Date(year, month, day) / 1000);
        let unixEnd = Math.floor(+new Date(year, month, day + 4, 23, 30) / 1000);
        console.log(unixStart, unixEnd);
        let json = JSON.stringify({
            startDate: unixStart,
            endDate: unixEnd
        });
        console.log(json);
        // ajax
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let data = JSON.parse(this.responseText);
                renderBookingItemsSuccess(data.data, day);
            } else if (this.readyState == 4 && (this.status == 400 || this.status == 500)) {
                console.log(this.responseText);
            }
        }

        request.open("GET", `/api/appointments?startDate=${unixStart}&endDate=${unixEnd}`);
        request.send();
    }

    function getDaysInMonth(month, year) {
        let date = new Date(year, month, 1);
        let days = [];
        while (date.getMonth() === month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    function renderCalendar(date) {
        let days = getDaysInMonth(date.getMonth(), date.getFullYear());
        let firstDayofMonth = days[0].getDay();

        let d = 0;
        //let calendarSize = 35;
        let parent = document.getElementById('calendar__days');

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                let square = parent.querySelector(`#calendar__day-square-${i}-${j}`);
                if ((i == 0 && j < firstDayofMonth) || d >= days.length) {
                    //square.textContent = "xx";
                    square.innerHTML = `<a href="#" class="calendar__day-link calendar__day-link--out">xx</a>`;
                    continue;
                }
                let day = days[d].getDate().toString();

                let spanClass = "calendar__day-link";

                if (day == CURDAY && date.getMonth() == CURMONTH &&
                    date.getFullYear() == CURYEAR)
                    //square.style.color = 'red';
                    spanClass += " calendar__day-link--today";
                // else
                //     square.style.color = 'black';

                if (day < 10)
                    day = '0' + day;

                //square.textContent = day;
                square.innerHTML = `<a href="#" class="${spanClass}">${day}</a>`;
                d++;
            }
        }

    }

    setCalendarYear(CURYEAR);
    setCalendarMonth(MONTHS[CURMONTH]);
    setCalendarDaysOfWeek();
    setUpCalendar();
    renderCalendar(CURDATE);
    setUpBooking();

    function bookToggle() {

        let book = document.getElementById('calendar__book');

        if (book.classList.contains('calendar__book--active'))
            book.classList.remove('calendar__book--active');
        else
            book.classList.add('calendar__book--active');
    }

    function confirmToggle() {

        let confirm = document.getElementById('calendar__confirm');

        if (confirm.classList.contains('calendar__confirm--active'))
            confirm.classList.remove('calendar__confirm--active');
        else
            confirm.classList.add('calendar__confirm--active');
    }

    function selectAppointmentDate(el) {
        selectedTimestamp = parseInt(el.dataset.timestamp);
        confirmToggle();
    }

    function submitBookingInfo() {
        console.log("submitted!");
        confirmSubmit();
        return false;
    }


    document.getElementById('calendar__month--back').addEventListener('click', function (el) {
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth();
        let day = selectedDate.getDate()

        if (month > 0) {
            month--;
        } else {
            month = 11;
            year--;
        }

        selectedDate = new Date(year, month, day);
        setCalendarYear(year);
        setCalendarMonth(MONTHS[selectedDate.getMonth()]);
        renderCalendar(selectedDate);
    });

    document.getElementById('calendar__month--fwd').addEventListener('click', function (el) {
        let year = selectedDate.getFullYear();
        let month = selectedDate.getMonth();
        let day = selectedDate.getDate()
        if (month < 11) {
            month++;
        } else {
            month = 0;
            year++;
        }

        selectedDate = new Date(year, month, day);
        setCalendarYear(year)
        setCalendarMonth(MONTHS[selectedDate.getMonth()]);
        renderCalendar(selectedDate);
    });

    // document.getElementById('calendar__current-date').addEventListener('click', function (el) {
    //     selectedDate = new Date(CURYEAR, CURMONTH, CURDAY);
    //     setCalendarYear(CURYEAR)
    //     setCalendarMonth(MONTHS[CURMONTH]);
    //     renderCalendar(selectedDate);
    // });

    document.getElementById('calendar__days').addEventListener('click', function (el) {
        if (el.target.classList.contains("calendar__day-link")) {
            let targetDay = el.target;
            let day = Number(targetDay.textContent);
            let year = selectedDate.getFullYear();
            let month = selectedDate.getMonth();
            selectedDate.setDate(day);
            let unix = Math.floor(+new Date(year, month, day) / 1000);
            console.log(unix);
            if (selectedDate.getTime() > CURDATE.getTime()) {
                renderBookingHeader();
                renderBookingItems();
                bookToggle();
            }
        }
    });

    document.getElementById('calendar__book-arrow-back').addEventListener('click', function (el) {
        if (selectedDate.getTime() > CURDATE.getTime()) {
            selectedDate.setDate(selectedDate.getDate() - 5);
            renderBookingHeader();
            renderBookingItems();
        }
    });

    document.getElementById('calendar__book-arrow-fwd').addEventListener('click', function (el) {
        selectedDate.setDate(selectedDate.getDate() + 5);
        renderBookingHeader();
        renderBookingItems();
    });

    function confirmSubmit() {
        //ajax
        let offset = (new Date(selectedTimestamp * 1000)).getTimezoneOffset();
        let request = new XMLHttpRequest();
        request.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let result = JSON.parse(this.responseText);
                bookingSuccess(result);

            } else if (this.readyState == 4 && this.status == 400) {
                let result = JSON.parse(this.responseText);
                bookingFailed(result);
            }

            // console.log(JSON.parse(this.responseText));
        }

        request.open("POST", "/api/appointments/book");
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify({
            timestamp: selectedTimestamp,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            offset: offset
        }));
        return false;
    }

    function bookingSuccess(json) {
        let holder = document.getElementById('calendar__message');
        let date = new Date(json.data.timestamp * 1000);
        let name = json.data.name;
        let email = json.data.email;
        let phone = json.data.phone;
        let hours = date.getHours();
        let amPm = 'AM';
        if (hours >= 12)
            amPm = 'PM';
        if (hours > 12)
            hours -= 12;
        else if (hours == 0)
            hours = 12;
        let mins = date.getMinutes();
        if (mins == 0)
            mins = "00";
        let dateFormatted = `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} ${hours}:${mins} ${amPm}`;
        document.getElementById('calendar__message--date').innerText = dateFormatted;
        document.getElementById('calendar__message--name').innerText = name;
        document.getElementById('calendar__message--email').innerText = email;
        document.getElementById('calendar__message--phone').innerText = phone;
        holder.classList.add('calendar__message--active');
        document.getElementById('calendar__message--success').classList.add('calendar__message-container--active');
        confirmToggle();
        bookToggle();
        console.log("success");
    }

    function bookingFailed(json) {
        console.log(json);
        console.log("failed");
        document.getElementById('calendar__message').classList.add('calendar__message--active');
        document.getElementById('calendar__message--failed').classList.add('calendar__message-container--active');
    }

    document.getElementById('calendar__message--success-close').addEventListener('click', function(e) {
        document.getElementById('calendar__message--success').classList.remove('calendar__message-container--active');
        document.getElementById('calendar__message').classList.remove('calendar__message--active');
    });

    document.getElementById('calendar__message--failed-close').addEventListener('click', function (e) {
        document.getElementById('calendar__message--failed').classList.remove('calendar__message-container--active');
        document.getElementById('calendar__message').classList.remove('calendar__message--active');
    });
}