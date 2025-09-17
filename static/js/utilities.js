// Helper function to convert IPs to a numerical value (optional)
function ipToNumber(ip) {
    // const tst = ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
    // console.log("tst", tst);
    return ip.split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
}

function sort_beam_array(beam_array) {
    //console.log("sort_beam_array", beam_array);

    // Sort array by 'ip' property lexicographically
    beam_array.sort((a, b) => {
        if (a.ip < b.ip) return -1;
        if (a.ip > b.ip) return 1;
        return 0;
    });

    return beam_array;
}

function generateAlphabeticId(length = 8) {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let id = '';
    for (let i = 0; i < length; i++) {
        id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return id;
}

function bounding_box_check(primaryBeam, secondaryBeam, seat, azMargin, elMargin) {

    let returnData = {
        azMargin: azMargin,
        elMargin: elMargin,

        fitPriAz: false,
        fitPriEl: false,
        fitSecAz: false,
        fitSecEl: false
        // fitOthAz: false,
        //fitOthEl: false
    };

    const azimuthOnlyEl = document.getElementById("azimuth_only");

    const primaryAz = primaryBeam.azimuth;
    const primaryEl = primaryBeam.elevation;

    const secondaryAz = secondaryBeam.azimuth;
    const secondaryEl = secondaryBeam.elevation;

    //const otherAz = otherBeam.azimuth;
    //const otherEl = otherBeam.elevation;

    if (azimuthOnlyEl.checked == false) {

        let diff = Math.abs(primaryAz - seat.priAzAverage);
        if (diff <= azMargin) {
            returnData.fitPriAz = true;
            returnData.fitPriAzDiff = diff;
            diff = Math.abs(primaryEl - seat.priElAverage);
            if (diff <= elMargin) {
                returnData.fitPriEl = true;
                returnData.fitPriElDiff = diff;
            }
        }

        diff = Math.abs(secondaryAz - seat.secAzAverage);
        if (diff <= azMargin) {
            returnData.fitSecAz = true;
            returnData.fitSecAzDiff = diff;
            diff = Math.abs(secondaryEl - seat.secElAverage);
            if (diff <= elMargin) {
                returnData.fitSecEl = true;
                returnData.fitSecElDiff = diff;
            }
        }

        // diff = Math.abs(otherAz - seat.othAzAverage);
        // if (diff <= azMargin) {
        //     returnData.fitOthAz = true;
        //     returnData.fitOthAzDiff = diff;
        //     diff = Math.abs(otherEl - seat.othElAverage);
        //     if (diff <= elMargin) {
        //         returnData.fitOthEl = true;
        //         returnData.fitOthElDiff = diff;
        //     }
        // }
    } else {
        let diff = Math.abs(primaryAz - seat.priAzAverage);
        if (diff <= azMargin) {
            returnData.fitPriAz = true;
            returnData.fitAzPriDiff = diff;
        }

        diff = Math.abs(secondaryAz - seat.secAzAverage);
        if (diff <= azMargin) {
            returnData.fitSecAz = true;
            returnData.fitSecAzDiff = diff;
        }

        // diff = Math.abs(otherAz - seat.othAzAverage);
        // if (diff <= azMargin) {
        //     returnData.fitOthAz = true;
        //     returnData.fitOthAzDiff = diff;
        // }
    }

    return returnData;
}

function togglePrimarySecondary(button) {
    const titleEl = document.getElementById("primary_secondary_title");

    if (button.textContent == "Show Primary") {
        button.textContent = "Show Secondary";
        titleEl.innerHTML = "Primary";
    } else {
        button.textContent = "Show Primary";
        titleEl.innerHTML = "Secondary";
    }

    seatLoadTemplate(window.seats);

}

function typeChecked(radio) {
    //console.log("typeChecked", radio.value);
    if (typeChecked !== "seat") {
        document.getElementById("pollSeat").value = "";
    }
}

function seatChecked(seat) {
    //console.log("seatChecked", seat);

    const elSeat = document.getElementById("pollSeatRadio");
    const elGeneral = document.getElementById("pollGeneral");
    const elQuiet = document.getElementById("pollQuiet");

    const pollSeatText = document.getElementById("pollSeat");

    if (isNaN(pollSeatText.value)) {
        pollSeatText.value = "";
        return;
    }

    if (pollSeatText.value.length > 0) {
        elSeat.checked = true;
        elGeneral.checked = "";
        elQuiet.checked = "";
    } else {
        elSeat.checked = false;
        elGeneral.checked = true;
        elQuiet.checked = false;
    }

}

function filterBySeat() {

    const filterEl = document.getElementById("filterSeat");

    if (isNaN(filterEl.value)) {
        filterEl.value = "";
        return;
    }

    const captureListEl = document.getElementById("captureList");
    const captures = Array.from(captureListEl.querySelectorAll("div"));

    captures.forEach((capture) => {
        if (filterEl.value === "") {
            capture.style.removeProperty("display");
        } else {
            if (!capture.id.includes("_" + filterEl.value + "_")) {
                capture.style.display = "none";
            } else {
                capture.style.removeProperty("display");
            }
        }
    });

}
