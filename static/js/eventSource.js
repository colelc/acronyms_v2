function newEventSource() {
    const es = new EventSource("/events");

    es.addEventListener("message", function (event) {
        appendEventData(event);
    });

}

function appendEventData(event) {

    const es = event.target;

    const data = JSON.parse(event.data);
    //console.log(data);

    // Check if polling has stopped
    if (data.message && data.message === "Polling stopped") {

        // Optionally, close the EventSource so no more events are received
        es.close();

        console.log("Polling stopped notification received, EventSource closed.");

        return;  // Exit handler so you don't try to appendEventData
    }

    //console.log("data.beam_data", data.beam_data); // JSON object, keyed by IP
    if (Object.keys(data).length === 0) {
        return;
    }

    beam_array = sort_beam_array(Object.values(data.beam_data)); // converted to array
    //console.log("beam_array", beam_array);

    const ip_list = [];

    beam_array.forEach(item => {
        ip_list.push(calculateDisplay(item));
    });

    //console.log(ip_list);

    // -------------------------------------------------------------------
    //flatten the data
    let combined = {};
    beam_array.forEach(item => {
        //console.log("item", item);

        const ip = item.ip;
        combined.room = item.room; // redundant but ok
        //combined.response_time = item.response_time;
        combined[ip + "_tcc2_response_time"] = item.tcc2_response_time;
        combined[ip + "_AZ"] = item.azimuth;
        combined[ip + "_EL"] = item.elevation;
        combined[ip + "_peak"] = item.peak;
        combined[ip + "_RMS"] = item.rms;

        //console.log("combined", combined);
    });
    //console.log("combined", combined);

    // -------------------------------------------------------------------
    // generate the markup
    const div = document.createElement("div");
    div.style.marginBottom = "0.5rem";
    div.classList.add("poll-line");
    div.id = generateAlphabeticId(7);

    let markup = "<table><tbody><tr>";

    //markup += `<td>${combined.response_time.replaceAll(".", ":")}</td>`;
    let combined_tcc2_response_time = "";
    for (let ip of ip_list) {
        if (ip.display === true) {
            const ipKey_ts = ip.ip + "_tcc2_response_time";
            combined_tcc2_response_time += combined[ipKey_ts] + "<br />";
        }
    }
    markup += `<td><span class="noisy">${combined_tcc2_response_time}</span></td>`;

    let combined_beam_data = "";
    for (let ip of ip_list) {
        if (ip.display === true) {
            let quietStart = ip.quiet == true ? `<span class="quiet">` : `<span class="noisy">`;
            const quietEnd = ``;

            const ipKey_a = ip.ip + "_AZ";
            const ipKey_e = ip.ip + "_EL";
            combined_beam_data += quietStart + ip.ip + " (" + combined[ipKey_a] + ", " + combined[ipKey_e] + ")" + quietEnd + "<br />";
        }
    };
    markup += `<td>${combined_beam_data.slice(0, -6)}</td>`;

    let combined_sound_data = "";
    for (let ip of ip_list) {
        if (ip.display === true) {
            let quietStart = ip.quiet == true ? `<span class="quiet">` : `<span class="noisy">`;
            const quietEnd = ``;
            const ipKey_peak = ip.ip + "_peak";
            const ipKey_rms = ip.ip + "_RMS";
            //combined_sound_data += "(" + combined[ipKey_rms] + ", " + combined[ipKey_peak] + ")<br />";
            combined_sound_data += quietStart + "Volume: " + combined[ipKey_peak] + quietEnd + "<br />";
        }
    };
    markup += `<td>${combined_sound_data.slice(0, -6)}</td>`;

    const dataPacket = {
        "combined": combined,
        "beam_array": beam_array,
    };

    //console.log("dataPacket", dataPacket);
    window.pollData.push(dataPacket);
    //console.log(window.pollData.length);

    markup += "</tr></tbody></table>";

    div.innerHTML = markup;

    const beamList = document.getElementById("beamList");
    beamList.prepend(div);

    // Limit number of displayed lines to 10 (customizable)
    const maxLines = 500;

    while (beamList.children.length > maxLines) {
        beamList.removeChild(beamList.lastChild);
        window.pollData.pop();
    }

    // Update the title
    // title = document.getElementById("title");
    // title.innerHTML = combined.room;

    colorSeats(beam_array, data.elMargin);
}

function beamCheck(element) {
    //console.log("beamCheck", element.target);
    const checked = element.target.checked;
    //console.log(element.target, checked);
}

function calculateDisplay(item) {
    let display = true;
    const ip = item.ip;

    if (ip == "10.149.144.32") {
        display = document.getElementById("beam_32").checked;
    } else if (ip == "10.149.144.33") {
        display = document.getElementById("beam_33").checked;
    } else if (ip == "10.149.144.34") {
        display = document.getElementById("beam_34").checked;
    }

    return { ip: item.ip, quiet: false, display: display };
}

// function calculateQuiet(item, az32QuietValue, el32QuietValue, az33QuietValue, el33QuietValue, az34QuietValue, el34QuietValue) {
//     wobblyAz33 = 326;
//     wobblyEl33 = 13;
//     anotherWobblyAz33 = 329;
//     anotherWobblyEl33 = 18;

//     if (item.ip == "10.149.144.32") {
//         return yesNo(item.ip, item, az32QuietValue, el32QuietValue);
//     }

//     if (item.ip == "10.149.144.33") {
//         //return yesNo(item.ip, item, az33QuietValue, el33QuietValue);
//         return yesNoWobbly(item, az33QuietValue, el33QuietValue, wobblyAz33, wobblyEl33, anotherWobblyAz33, anotherWobblyEl33);
//     }

//     if (item.ip == "10.149.144.34") {
//         return yesNo(item.ip, item, az34QuietValue, el34QuietValue);
//     }
// }

// function yesNo(ip, item, az, el) {
//     if (item.ip == ip) {
//         // if (item.azimuth == az && item.elevation == el) {
//         //     return { ip: item.ip, quiet: true };
//         // } else {
//         //     return { ip: item.ip, quiet: false };
//         // }
//         return { ip: item.ip, quiet: false };
//     }
// }

// function yesNoWobbly(item, az, el, wobblyAz, wobblyEl, anotherWobblyAz, anotherWobblyEl) {
//     // if (item.azimuth == az && item.elevation == el) {
//     //     return { ip: item.ip, quiet: true };
//     // } else if (item.azimuth == wobblyAz && item.elevation == wobblyEl) {
//     //     return { ip: item.ip, quiet: true };
//     // } else if (item.azimuth == anotherWobblyAz && item.elevation == anotherWobblyEl) {
//     //     return { ip: item.ip, quiet: true };
//     // } else {
//     //     return { ip: item.ip, quiet: false };
//     // }
//     return { ip: item.ip, quiet: false };
// }


