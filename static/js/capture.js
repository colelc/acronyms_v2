function colorSeats(beam_array) {

    if (window.seats.length === 0) {
        return;
    }

    //const volume_threshold = parseInt(document.getElementById("volume_threshold").value);
    const azMargin = parseInt(document.getElementById("id_az_margin").value);
    const elMargin = parseInt(document.getElementById("id_el_margin").value);

    //const primaryBeam = (beam_array.filter(beamData => beamData.ip === "10.149.144.32"))[0];
    //const secondaryBeam = (beam_array.filter(beamData => beamData.ip === "10.149.144.32"))[0];
    //const otherBeam = (beam_array.filter(beamData => beamData.ip == "10.149.144.34"))[0];

    window.seats.forEach(seat => {
        if (seat.seat == "0" || seat.seat == "76" || seat.seat == "77") {
            return;
        }

        const primaryBeamIp = seat.primary;
        const primaryBeam = (beam_array.filter(beamData => beamData.ip === primaryBeamIp))[0];
        const secondaryBeamIp = seat.secondary;
        const secondaryBeam = (beam_array.filter(beamData => beamData.ip === secondaryBeamIp))[0];
        const otherBeamIp = seat.other;
        const otherBeam = (beam_array.filter(beamData => beamData.ip === otherBeamIp))[0];

        const seatEl = document.getElementById("seat-" + seat.seat);
        // TEST
        // if (seat.seat == "63") {
        //primaryBeam.azimuth = 255;
        //primaryBeam.elevation = 23;
        //secondaryBeam.azimuth = 93;
        //secondaryBeam.elevation = 14;
        //otherBeam.azimuth = 355;
        //otherBeam.elevation = 10;
        //}

        const hitData = bounding_box_check(primaryBeam, secondaryBeam, seat, azMargin, elMargin);
        hitData.seat = seat;
        hitData.primaryBeam = primaryBeam;
        hitData.secondaryBeam = secondaryBeam;
        hitData.otherBeam = otherBeam;

        const azimuthOnlyEl = document.getElementById("azimuth_only");

        if (azimuthOnlyEl.checked == false) { // azimuth and elevation checks
            const fitPrimary = hitData.fitPriAz && hitData.fitPriEl ? true : false;
            const fitSecondary = hitData.fitSecAz && hitData.fitSecEl ? true : false;
            const fitAz = hitData.fitPriAz && hitData.fitSecAz;

            if (fitPrimary || fitSecondary || fitAz) {
                seatEl.style.backgroundColor = "green";
                displayCaptureData(hitData);
            }
            else {
                seatEl.style.removeProperty("background-color");
                seatEl.innerHTML = `<b>Seat ${seat.seat}</b>`;
            }
        } else { // azimuth only
            const fitPrimary = hitData.fitPriAz;
            const fitSecondary = hitData.fitSecAz;
            const fitAz = hitData.fitPriAz && hitData.fitSecAz;

            if (fitPrimary || fitSecondary || fitAz) {
                seatEl.style.backgroundColor = "green";
                displayCaptureData(hitData);
            }
            else {
                seatEl.style.removeProperty("background-color");
                seatEl.innerHTML = `<b>Seat ${seat.seat}</b>`;
            }
        }
    });
}

function displayCaptureData(hitData) {
    //console.log("hitData", hitData);

    window.captured.push(hitData);

    // const pollSeatEl = document.getElementById("pollSeat");
    // if (pollSeatEl.value !== "" && !isNaN(pollSeatEl.value)) {
    //     if (pollSeatEl.value !== hitData.seat.seat) {
    //         return;
    //     }
    // }

    const seat = hitData.seat;
    //console.log("seat", seat);

    const primaryBeam = hitData.primaryBeam;
    const secondaryBeam = hitData.secondaryBeam;
    const otherBeam = hitData.otherBeam;
    // console.log("primaryBeam", primaryBeam);
    // console.log("secondaryBeam", secondaryBeam);
    // console.log("otherBeam", otherBeam);

    const captureList = document.getElementById("captureList");
    const div = document.createElement("div");
    //div.id = generateAlphabeticId();
    div.id = "capture_" + seat.seat + "_" + primaryBeam.tcc2_response_time;
    div.classList.add("capture-line");

    const pri = `<span>`;
    const sec = `<span>`;

    const priAz = hitData.fitPriAz === true ? `<span class="highlight-green">` : `<span>`;
    const priEl = hitData.fitPriEl === true ? `<span class="highlight-green">` : `<span>`;
    const secAz = hitData.fitSecAz === true ? `<span class="highlight-green">` : `<span>`;
    const secEl = hitData.fitSecEl === true ? `<span class="highlight-green">` : `<span>`;
    const othAz = "";
    const othEl = "";

    let markup = ``;
    markup += `<table><thead><tr>`;
    markup += `<th>Seat</th>`;
    markup += `<th>IP</th>`;
    markup += `<th>Beam Coords</th>`;
    markup += `<th>Seat Coords</th>`;
    markup += `<th>Az Diff</th>`;
    markup += `<th>El Diff</th>`;
    markup += `<th>Volume</th>`;
    markup += `<th>Response Time</th>`;
    markup += `<th>&nbsp;</th>`;
    markup += `<th>&nbsp;</th>`;
    markup += `<th>&nbsp;</th>`;
    markup += `</tr></thead>`;
    markup += `<tbody><tr>`;


    markup += `<td><span class="capture-seat">${seat.seat}</span></td>`;

    // beam IP
    markup += `<td>`;
    markup += `${pri}${seat.primary} (Pri)</span><br />`;
    markup += `${sec}${seat.secondary} (Sec)</span><br />`;
    markup += `${seat.other} (Other)</td>`;

    // beam (az, el)
    markup += `<td>`;
    markup += `(${priAz}${primaryBeam.azimuth}</span>`;
    markup += `, ${priEl}${primaryBeam.elevation}</span>)<br />`;
    markup += `(${secAz}${secondaryBeam.azimuth}</span>`;
    markup += `, ${secEl}${secondaryBeam.elevation}</span>)<br />`;
    markup += `(${otherBeam.azimuth}`;
    markup += `, ${otherBeam.elevation})`;
    markup += `</td>`;


    // seat (az,el)
    markup += `<td>`;
    markup += `(${priAz}${seat.priAzAverage}</span>`;
    markup += `, ${priEl}${seat.priElAverage}</span>)<br />`;
    markup += `(${secAz}${seat.secAzAverage}</span>`;
    markup += `, ${secEl}${seat.secElAverage}</span>)<br />`;
    markup += `(${seat.othAzAverage}`;
    markup += `, ${seat.othElAverage})`;
    markup += `</td>`;

    // az margin
    const priAzDiff = Math.round(100 * (Math.abs(primaryBeam.azimuth - seat.priAzAverage))) / 100;
    const secAzDiff = Math.round(100 * (Math.abs(secondaryBeam.azimuth - seat.secAzAverage))) / 100;
    const othAzDiff = Math.round(100 * (Math.abs(otherBeam.azimuth - seat.othAzAverage))) / 100;

    markup += `<td style="text-align: center;">`;
    markup += `${priAz}${priAzDiff}</span><br />`;
    markup += `${secAz}${secAzDiff}</span><br />`;
    markup += `${othAzDiff}`;
    markup += `</td>`;

    // el margin
    const priElDiff = Math.round(100 * (Math.abs(primaryBeam.elevation - seat.priElAverage))) / 100;
    const secElDiff = Math.round(100 * (Math.abs(secondaryBeam.elevation - seat.secElAverage))) / 100;
    const othElDiff = Math.round(100 * (Math.abs(otherBeam.elevation - seat.othElAverage))) / 100;

    markup += `<td style="text-align: center;">`;
    markup += `${priEl}${priElDiff}</span><br />`;
    markup += `${secEl}${secElDiff}</span><br />`;
    markup += `${othElDiff}`;
    markup += `</td>`;

    // volume
    markup += `<td>`;
    markup += `${primaryBeam.peak}<br />`;
    markup += `${secondaryBeam.peak}<br />`;
    markup += `${otherBeam.peak}`;
    markup += `</td>`;

    // TCC2 response time
    markup += `<td>`;
    markup += `${hitData.primaryBeam.tcc2_response_time}<br />`;
    markup += `${hitData.secondaryBeam.tcc2_response_time}<br />`;
    markup += `${hitData.otherBeam.tcc2_response_time}`;
    markup += `</td>`;

    // radio buttons for training values
    const id = seat.seat + "_" + primaryBeam.tcc2_response_time;

    const checkedPriAz = priAz === "<span>" ? "" : "checked";
    const checkedPriEl = priEl === "<span>" ? "" : "checked";
    const checkedSecAz = secAz === "<span>" ? "" : "checked";
    const checkedSecEl = secEl === "<span>" ? "" : "checked";
    const checkedOthAz = othAz === "";
    const checkedOthEl = othEl === "";

    markup += `<td>`;
    markup += `<label for="pri_az_${id}" id="pri_az_label_${id}" class="train-class">Pri Az</label>`;
    markup += `<input id="pri_az_${id}" class="train-radio-button" type="checkbox"  ${checkedPriAz}  onchange="buttonCheck(event, this);")>`;

    markup += `<label for="pri_el_${id}" id="pri_el_label_${id}" class="train-class">Pri El</label>`;
    markup += `<input id="pri_el_${id}" class="train-radio-button" type="checkbox"  ${checkedPriEl} onchange="buttonCheck(event, this);")>`;
    markup += `<br />`;

    markup += `<label for="sec_az_${id}"  id="sec_az_label_${id}" class="train-class">Sec Az</label>`;
    markup += `<input id="sec_az_${id}" class="train-radio-button" type="checkbox" ${checkedSecAz}  onchange="buttonCheck(event, this);">`;

    markup += `<label for="sec_el_${id}" id="sec_el_label_${id}" class="train-class">Sec El</label>`;
    markup += `<input id="sec_el_${id}" class="train-radio-button" type="checkbox" ${checkedSecEl}  onchange="buttonCheck(event, this);")>`;
    markup += `<br />`;

    markup += `<label for="oth_az_${id}" id="oth_az_label_${id}" class="train-class">Oth Az</label>`;
    markup += `<input id="oth_az_${id}" class="train-radio-button" type="checkbox" ${checkedOthAz} onchange="buttonCheck(event, this);")>`;

    markup += `<label for="oth_el_${id}"  id="oth_el_label_${id}" class="train-class">Oth El</label>`;
    markup += `<input id="oth_el_${id}" class="train-radio-button" type="checkbox" ${checkedOthEl} onchange="buttonCheck(event, this);")>`;
    markup += '</td>';

    // capture button 
    const buttonId = seat.seat + "_" + primaryBeam.tcc2_response_time;
    const buttonChecked = (checkedPriAz || checkedPriEl || checkedSecAz || checkedSecEl || checkedOthAz || checkedOthEl) ? "" : "disabled";
    markup += `<td><button id="id_train_${buttonId}" class="buttonWidth train-class" ${buttonChecked} data-json="${encodeURIComponent(JSON.stringify(hitData))}">Capture</button><br />`;
    markup += `<span id="capture_status_${id}" class="capture-status"></span>`;
    markup += `</td>`;

    //buttonCheck(buttonId);

    markup += `</tr></tbody></table>`;

    div.innerHTML = markup;
    div.style.backgroundColor = "#def7d5";
    captureList.prepend(div);

    setTimeout(function () {
        div.style.removeProperty("background-color");
    }, 1000);

    // event listener for training/capture
    const trainingButtonEl = document.getElementById("id_train_" + buttonId);
    if (trainingButtonEl !== null) {
        trainingButtonEl.removeEventListener("click", train);
        trainingButtonEl.addEventListener("click", train, false);
    }

    // Limit number of displayed lines to 500 (customizable)
    const maxLines = 500;

    while (captureList.children.length > maxLines) {
        captureList.removeChild(captureList.lastChild);
    }
}

function buttonCheck(element) {
    //console.log("buttonCheck", element.target);

    const elementId = element.target.id;
    const splits = elementId.split("_");
    // console.log("splits", splits);
    const seatNumber = splits[2];
    const ts = splits[3];
    // console.log("seatNumber", seatNumber);
    // console.log("ts", ts);

    const buttonEl = document.getElementById("id_train_" + seatNumber + "_" + ts);
    //console.log("buttonEl", buttonEl);

    const priAzEl = document.getElementById("pri_az_" + seatNumber + "_" + ts);
    const priElEl = document.getElementById("pri_el_" + seatNumber + "_" + ts);
    const secAzEl = document.getElementById("sec_az_" + seatNumber + "_" + ts);
    const secElEl = document.getElementById("sec_el_" + seatNumber + "_" + ts);
    const othAzEl = document.getElementById("oth_az_" + seatNumber + "_" + ts);
    const othElEl = document.getElementById("oth_el_" + seatNumber + "_" + ts);

    if (priAzEl.checked === true || priElEl.checked === true || secAzEl.checked === true || secElEl.checked === true || othAzEl.checked === true || othElEl.checked === true) {
        buttonEl.disabled = false;
    } else {
        buttonEl.disabled = true;
    }
}
