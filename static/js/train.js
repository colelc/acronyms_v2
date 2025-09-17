// function displayHitData(seat) {
//     //console.log("displayHitData", seat);

//     fetch('http://localhost:8000/seat/hits', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             seat: seat.seat
//         })
//     })
//         .then(response => response.json())
//         .then(data => {
//             const hits = data.data;
//             console.log("hits", hits);

//             // clear out previous list
//             const deleteMe = document.querySelectorAll(".hit-line");
//             deleteMe.forEach((div) => div.remove());

//             const hitList = document.getElementById("hitList");

//             hits.forEach((hit) => {
//                 const div = document.createElement("div");
//                 div.id = generateAlphabeticId();
//                 div.classList.add("hit-line");

//                 let markup = ``;
//                 markup += `<table><thead><tr>`;
//                 markup += `<th>IP</th>`;
//                 markup += `<th>Seat Coords</th>`;
//                 markup += `<th>Beam Coords</th>`;

//                 markup += `<th>Az Margin</th>`;
//                 markup += `<th>El Margin</th>`;
//                 // markup += `<th>Response Time</th>`;
//                 markup += `<th>Train</th>`;
//                 markup += `<th>&nbsp;</th>`;
//                 markup += `</tr></thead>`;
//                 markup += `<tbody>`;

//                 markup += `<tr>`;

//                 // IP
//                 markup += `<td>`;
//                 markup += `${hit.primaryIp} (Pri)<br />`;
//                 markup += `${hit.secondaryIp} (Sec)<br />`;
//                 markup += `${hit.otherIp} (Oth)</td>`;

//                 // seat coords at time of hit
//                 markup += `<td>${hit.seat.priAzAverage}, ${hit.seat.priElAverage}</br>`;
//                 markup += `${hit.seat.secAzAverage}, ${hit.seat.secElAverage}</br>`;
//                 markup += `${hit.seat.othAzAverage}, ${hit.seat.othElAverage}</td>`;

//                 // beam coords at time of hit
//                 markup += `<td>${hit.primaryBeam.azimuth}, ${hit.primaryBeam.elevation}</br>`;
//                 markup += `${hit.secondaryBeam.azimuth}, ${hit.secondaryBeam.elevation}<br />`;
//                 markup += `${hit.otherBeam.azimuth}, ${hit.otherBeam.elevation}</td>`;

//                 // az margin at time of hit
//                 markup += `<td>${hit.azMargin}<br />`;
//                 markup += `${hit.azMargin}<br />`;
//                 markup += `${hit.azMargin}</td>`;

//                 // el margin at time of hit
//                 markup += `<td>${hit.elMargin}<br />`;
//                 markup += `${hit.elMargin}<br />`;
//                 markup += `${hit.elMargin}</td>`;

//                 // timestamp at time of hit
//                 // markup += `<td>${hit.primaryBeam.tcc2_response_time}</br>`;
//                 // markup += `${hit.secondaryBeam.tcc2_response_time}<br />`;
//                 // markup += `${hit.otherBeam.tcc2_response_time}</td>`;

//                 // training: primary az, primary el, secondary az, secondary el
//                 if (hit.usedToTrain === false) {
//                     markup += `<td>`;
//                     markup += `<label for="pri_az_${hit._id}" id="pri_az_label_${hit._id}" class="train-class">Pri Az</label>`;
//                     markup += `<input id="pri_az_${hit._id}" class="train-class" type="checkbox" onchange="buttonCheck(event, this);")>`;

//                     markup += `<label for="pri_el_${hit._id}" id="pri_el_label_${hit._id}" class="train-class">Pri El</label>`;
//                     markup += `<input id="pri_el_${hit._id}" class="train-class" type="checkbox" onchange="buttonCheck(event, this);")>`;
//                     markup += `<br />`;

//                     markup += `<label for="sec_a_${hit._id}"  id="sec_az_label_${hit._id}" class="train-class">Sec Az</label>`;
//                     markup += `<input id="sec_az_${hit._id}" class="train-class" type="checkbox" onchange="buttonCheck(event, this);">`;

//                     markup += `<label for="sec_el_${hit._id}" id="sec_el_label_${hit._id}" class="train-class">Sec El</label>`;
//                     markup += `<input id="sec_el_${hit._id}" class="train-class" type="checkbox" onchange="buttonCheck(event, this);")>`;
//                     markup += `<br />`;

//                     markup += `<label for="oth_az_${hit._id}" id="oth_az_label_${hit._id}" class="train-class">Oth Az</label>`;
//                     markup += `<input id="oth_az_${hit._id}" class="train-class" type="checkbox" onchange="buttonCheck(event, this);")>`;

//                     markup += `<label for="oth_el_${hit._id}"  id="oth_el_label_${hit._id}" class="train-class">Oth El</label>`;
//                     markup += `<input id="oth_el_${hit._id}" class="train-class" type="checkbox" onchange="buttonCheck(event, this);")>`;
//                     markup += '</td>';
//                 } else {
//                     markup += `<td>Previously Used To Train</td>`;
//                 }

//                 if (hit.usedToTrain === false) {
//                     markup += `<td><button id="id_train_${hit._id}" class="buttonWidth train-class" disabled data-json="${encodeURIComponent(JSON.stringify(hit))}">Train</button></td>`;
//                 } else {
//                     markup += `<td></td>`;
//                 }

//                 markup += `</tr>`;
//                 markup += `</table>`;

//                 div.innerHTML = markup;
//                 hitList.append(div);

//                 // event listeners for training
//                 const trainingButtonEl = document.getElementById("id_train_" + hit._id);
//                 if (trainingButtonEl !== null) {
//                     trainingButtonEl.removeEventListener("click", train);
//                     trainingButtonEl.addEventListener("click", train, false);
//                 }
//             });

//         })
//         .catch(error => {
//             console.error('API call error:', error);
//         });
// }

function train(event) {
    const encodedJson = event.target.getAttribute("data-json");
    const jsonString = decodeURIComponent(encodedJson);
    const hit = JSON.parse(jsonString);
    //console.log("TRAIN: hit", hit);
    const id = hit.seat.seat + "_" + hit.primaryBeam.tcc2_response_time;
    //console.log("id", id);

    const priAzEl = document.getElementById("pri_az_" + id);
    const priElEl = document.getElementById("pri_el_" + id);
    const secAzEl = document.getElementById("sec_az_" + id);
    const secElEl = document.getElementById("sec_el_" + id);
    const othAzEl = document.getElementById("oth_az_" + id);
    const othElEl = document.getElementById("oth_el_" + id);

    let instructions = {
        "trainPriAz": priAzEl.checked,
        "trainPriEl": priElEl.checked,
        "trainSecAz": secAzEl.checked,
        "trainSecEl": secElEl.checked,
        "trainOthAz": othAzEl.checked,
        "trainOthEl": othElEl.checked
    };

    //console.log("instructions", instructions);
    trainData(instructions, hit);
}

function trainData(instructions, hit) {
    //console.log("instructions", instructions);
    //console.log("hit", hit);
    //markup += `<span id="capture_status_${id}" class="capture-status"></span>`;
    //const id = seat.seat + "_" + primaryBeam.tcc2_response_time;
    const statusEl = document.getElementById("capture_status_" + hit.seat.seat + "_" + hit.primaryBeam.tcc2_response_time);
    //console.log("statusEl", statusEl);
    statusEl.textContent = "Saving data . . .";

    fetch('http://localhost:8000/train/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            instructions: instructions,
            hit: hit
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("data", data);
            //const seatHit = data.data.trainedSeatHit;
            //console.log("seatHit", seatHit);
            const trainingData = data.data.trainingData;
            //console.log("trainingData", trainingData);
            //console.log("instructions", instructions);

            // remove Train button and checkboxes and checkbox labels
            const id = hit.seat.seat + "_" + hit.primaryBeam.tcc2_response_time;
            document.getElementById("id_train_" + id).remove();

            document.getElementById("pri_az_" + id).remove();
            document.getElementById("pri_el_" + id).remove();
            document.getElementById("sec_az_" + id).remove();
            document.getElementById("sec_el_" + id).remove();
            document.getElementById("oth_az_" + id).remove();
            document.getElementById("oth_el_" + id).remove();

            document.getElementById("pri_az_label_" + id).remove();
            document.getElementById("pri_el_label_" + id).remove();
            document.getElementById("sec_az_label_" + id).remove();
            document.getElementById("sec_el_label_" + id).remove();
            document.getElementById("oth_az_label_" + id).remove();
            document.getElementById("oth_el_label_" + id).remove();

            // redisplay Seat az,el values for this seat
            //const typeEl = document.getElementById("primary_secondary_title");
            //const primaryOrSecondary = typeEl.textContent;

            //const az = primaryOrSecondary == "Primary" ? trainingData.priAzAverage : trainingData.secAzAverage;
            //const el = primaryOrSecondary == "Primary" ? trainingData.priElAverage : trainingData.secElAverage;

            // const priTextColor = calculateBackgroundColorText(hit.seat.primary, hit.seat);  // <span class=...
            // const secTextColor = calculateBackgroundColorText(hit.seat.secondary, hit.seat);
            // const othTextColor = calculateBackgroundColorText(hit.seat.other, hit.seat);

            const seatEl = document.getElementById("seat-" + hit.seat.seat);
            let value = `<b>Seat ${hit.seat.seat}</b>`;
            value += `<br />`;
            // value += `${priTextColor}${trainingData.priAzAverage}, ${trainingData.priElAverage}</span><br />`;
            // value += `${secTextColor}${trainingData.secAzAverage}, ${trainingData.secElAverage}</span><br />`;
            // value += `${othTextColor}${trainingData.othAzAverage}, ${trainingData.othElAverage}</span>`;
            //seatEl.innerHTML = `<b>Seat ${hit.seat.seat}</b><br />${az}, ${el}`;
            seatEl.innerHTML = value;

            // status message
            const statusEl = document.getElementById("capture_status_" + hit.seat.seat + "_" + hit.primaryBeam.tcc2_response_time);
            statusEl.textContent = "Capture complete";
        })
        .catch(error => {
            console.error('API call error:', error);
        });
}

