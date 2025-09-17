function loadSeatingChart() {
    fetch('http://localhost:8000/read/seat/assignments')
        .then(response => response.json())
        .then(data => {
            //console.log("file data", data);

            const seats = data.seats;
            seatLoadTemplate(seats);
        })
        .catch(error => {
            console.error('API call error:', error);
        });
}

function seatLoadTemplate(seats) {
    console.log("seats", seats);

    const typeEl = document.getElementById("primary_secondary_title");
    const primaryOrSecondary = typeEl.textContent;

    let seatList = [];

    if (seats !== undefined && seats.length > 0) {
        // global copy
        window.seats = structuredClone(seats);

        // clear out previous list
        const deleteMe = document.querySelectorAll(".seat-line");
        deleteMe.forEach((div) => div.remove());

        const mappedSeatsList = document.getElementById("mappedSeatsList");

        const div = document.createElement("div");
        div.classList.add("seat-line");

        let markup = "<table><tbody><tr>";
        //let x = 0;
        let y = 0;

        seats.forEach((seat) => {
            //console.log("seat", seat);

            let id = ``;
            let value = ` `;
            let background = `class="empty"`;

            if (seat.seat !== "0" && seat.seat !== "76" && seat.seat !== "77") {
                seatList.push(seat);

                background = primaryOrSecondary == "Primary" ? calculateBackgroundColor(seat.primary) : calculateBackgroundColor(seat.secondary);
                // const priTextColor = calculateBackgroundColorText(seat.primary, seat);  // <span class=...
                // const secTextColor = calculateBackgroundColorText(seat.secondary, seat);
                // const othTextColor = calculateBackgroundColorText(seat.other, seat);

                id = `id="seat-${seat.seat}" `;
                id += `data-json="${encodeURIComponent(JSON.stringify(seat))}"`;

                value += `<b>Seat ${seat.seat}</b>`;
                value += `<br />`;
                // value += `${priTextColor}${seat.priAzAverage}, ${seat.priElAverage}</span><br />`;
                // value += `${secTextColor}${seat.secAzAverage}, ${seat.secElAverage}</span><br />`;
                // value += `${othTextColor}${seat.othAzAverage}, ${seat.othElAverage}</span>`;
            } else {
                // check for device squares
                if (seat.deviceDisplay !== undefined) {
                    // background = `style="font-size: 1.2rem; font-weight: bold;`;
                    const bgColor = seat.deviceDisplay == ".32" ? "tan" : (seat.deviceDisplay == ".33" ? "thistle" : "skyblue");
                    background = `style="font-weight: bold; background-color: ${bgColor};"`;
                    id = ``;
                    value = `${seat.deviceDisplay}`;
                }
            }

            // set the markup
            if (seat.y === y) {
                markup += `<td ${background} ${id}>${value}</td>`;
            } else {
                markup += "</tr>";
                markup += "<tr>";
                markup += `<td ${background} ${id}>${value}</td>`;
                y = seat.y;
            }
        });

        markup += "</tr></tbody></table>";
        div.innerHTML = markup;
        mappedSeatsList.appendChild(div);

        // add/remove the event listeners for clicking on seats
        seats.forEach((seat) => {
            //console.log(seat);
            const seatEl = document.getElementById("seat-" + seat.seat);
            if (seatEl === null || seatEl === undefined) { // skip seats with value 0
                return;
            }
            seatEl.removeEventListener("click", seatClickedHandler);
            seatEl.addEventListener("click", seatClickedHandler, false);
        });

        // add/remove event listeners for save and close (after opening up a seat)
        // const saveEl = document.getElementById("id_save");
        // saveEl.removeEventListener("click", saveSeatData);
        // saveEl.addEventListener("click", saveSeatData, false);

        const closeEl = document.getElementById("id_close");
        closeEl.removeEventListener("click", closeSeatData);
        closeEl.addEventListener("click", closeSeatData, false);
    }
}

function seatClickedHandler(event) {
    const encodedJson = event.currentTarget.getAttribute("data-json");
    const jsonString = decodeURIComponent(encodedJson);
    const seat = JSON.parse(jsonString);
    //console.log("seatClickedHandler seat", seat.seat);

    const filterDivEl = document.getElementById("filterDiv");
    filterDivEl.style.display = "none";

    const hitList = document.getElementById("hitList");
    hitList.innerHTML = "";

    const closeEl = document.getElementById("id_close");
    closeEl.style.display = "none";

    const captureListEl = document.getElementById("captureList");
    captureListEl.style.display = "none";

    const seatNumberEl = document.getElementById("seat-number-id");
    seatNumberEl.textContent = "Loading data for seat " + seat.seat + "...";
    seatNumberEl.style.display = "block";

    const seatDataEl = document.getElementById("seatData");
    seatDataEl.style.display = "block";

    fetch('http://localhost:8000/fetch/seat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            seatNumber: seat.seat
        })
    })
        .then(response => response.json())
        .then(data => {
            //console.log("data", data);
            const seat = data.data;
            //console.log("seat", seat);
            populateSeatReadings(seat);
        })
        .catch(error => {
            console.error('API call error:', error);
        });
}

function populateSeatReadings(seat) {

    // clear out previous list
    const deleteMe = document.querySelectorAll(".hit-line");
    deleteMe.forEach((div) => div.remove());

    const hitList = document.getElementById("hitList");

    const div = document.createElement("div");
    div.id = generateAlphabeticId();
    div.classList.add("hit-line");

    let markup = ``;
    markup += `<table><thead><tr>`;
    markup += `<th>IP</th>`;
    markup += `<th>Type</th>`; // IP type (pri, sec, oth)
    markup += `<th>Multimedia Az,El</th>`; // multimedia base readings for this IP (az,el)
    markup += `<th>Adjusted Seat Az,El</th>`;  // trained readings
    markup += `<th>Az Values</th>`;
    markup += `<th>El Values</th>`;
    markup += `</tr></thead>`;
    markup += `<tbody>`;

    // pri
    markup += `<tr>`;
    markup += `<td>${seat.primary}</td>`;
    markup += `<td>Primary</td>`;
    markup += `<td>${seat.mmPrimaryAz}, ${seat.mmPrimaryEl}</td>`;
    markup += `<td>${seat.priAzAverage}, ${seat.priElAverage}</td>`;
    markup += `<td>${seat.priAzValues.join(", ")}</td>`;
    markup += `<td>${seat.priElValues.join(", ")}</td>`;
    markup += `</tr>`;

    // sec
    markup += `<tr>`;
    markup += `<td>${seat.secondary}</td>`;
    markup += `<td>Secondary</td>`;
    markup += `<td>${seat.mmSecondaryAz}, ${seat.mmSecondaryEl}</td>`;
    markup += `<td>${seat.secAzAverage}, ${seat.secElAverage}</td>`;
    markup += `<td>${seat.secAzValues.join(", ")}</td>`;
    markup += `<td>${seat.secElValues.join(", ")}</td>`;
    markup += `</tr>`;

    // oth
    markup += `<tr>`;
    markup += `<td>${seat.other}</td>`;
    markup += `<td>Other</td>`;
    markup += `<td>${seat.mmOtherAz}, ${seat.mmOtherEl}</td>`;
    markup += `<td>${seat.othAzAverage}, ${seat.othElAverage}</td>`;
    markup += `<td>${seat.othAzValues.join(", ")}</td>`;
    markup += `<td>${seat.othElValues.join(", ")}</td>`;
    markup += `</tr>`;
    markup += `</table>`;

    div.innerHTML = markup;
    hitList.append(div);

    const seatNumberEl = document.getElementById("seat-number-id");
    seatNumberEl.textContent = "Seat " + seat.seat;
    seatNumberEl.style.display = "block";

    const closeEl = document.getElementById("id_close");
    closeEl.style.display = "block";

    //const seatDataEl = document.getElementById("seatData");
    //seatDataEl.style.display = "block";
}

function closeSeatData() {
    const seatDataEl = document.getElementById("seatData");
    seatDataEl.style.display = "none";

    if (window.captured.length > 0) {
        document.getElementById("filterDiv").style.display = "block";
    }

    const captureListEl = document.getElementById("captureList");
    captureListEl.style.display = "block";

    //const messageEl = document.getElementById("id-save-seat");
    //messageEl.textContent = "";
}

// function anyChecked(checkbox) {
//     //console.log("anyChecked", checkbox);

//     const data = JSON.parse(decodeURIComponent(checkbox.getAttribute("data-json")));
//     console.log("data", data);

//     const allValues = document.querySelectorAll('.capture-class');
//     const allChecked = Array.from(allValues).filter(cb => cb.checked);
//     //console.log("allChecked", allChecked);
//     allChecked.forEach((cb) => {
//         //console.log("checked", cb);
//     });
// }

function calculateBackgroundColor(ip) {
    if (ip == "10.149.144.32") {
        return `class="highlight-32"`;
    }

    if (ip == "10.149.144.33") {
        return `class="highlight-33"`;
    }

    if (ip == "10.149.144.34") {
        return `class="highlight-34"`;
    }
    return ``;
}

