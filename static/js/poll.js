function pollStart() {
    //document.getElementById("polling_status").textContent = "Polling is starting ...";

    // clear out previous polling data
    document.querySelectorAll('.poll-line').forEach(el => el.remove());

    // brown out any previous seat hits
    if (window.seats.length > 0) {
        window.seats.forEach((seat) => {
            const seatEl = document.getElementById("seat-" + seat.seat);

            // restore the IP coloring in the seat squares that may have been previous hits
            if (seatEl !== null) {
                seatEl.style.removeProperty("background-color"); // green, if set
            }
        });
    }

    // clear out previous capture list
    window.captured = [];

    // what kind of polling
    const checkedRadio = document.querySelector('input[name="pollType"]:checked');
    //console.log(checkedRadio.value);

    const pollSeatNumber = checkedRadio.value === "seat" ? document.getElementById("pollSeat").value : "0";

    fetch('http://localhost:8000/poll/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            pollingType: checkedRadio.value,
            pollSeatNumber: pollSeatNumber
        }) // Data payload
    })
        .then(response => response.json())
        .then(data => {
            console.log("polling data", data)
            //console.log("Server said: " + data.message);
            document.getElementById("id_poll_start").setAttribute("disabled", "");
            document.getElementById("id_poll_stop").removeAttribute("disabled");

            // const elVolumeThreshold = document.getElementById("volume_threshold");
            // elVolumeThreshold.setAttribute("disabled", "disabled");
            // elVolumeThreshold.style.backgroundColor = "grey";
            // elVolumeThreshold.style.color = "black";

            const elAzMargin = document.getElementById("id_az_margin");
            elAzMargin.setAttribute("disabled", "disabled");
            elAzMargin.style.backgroundColor = "grey";
            elAzMargin.style.color = "black";

            const elElMargin = document.getElementById("id_el_margin");
            elElMargin.setAttribute("disabled", "disabled");
            elElMargin.style.backgroundColor = "grey";
            elElMargin.style.color = "black";

            const filterEl = document.getElementById("filterSeat");
            filterEl.setAttribute("disabled", "disabled");

            const filterDivEl = document.getElementById("filterDiv");
            filterDivEl.style.display = "none";

            const beamFilterEl = document.getElementById("filterBeam");
            beamFilterEl.style.display = "block";

            document.getElementById("beam_32").checked = true;
            document.getElementById("beam_33").checked = true;
            document.getElementById("beam_34").checked = true;

            const radios = document.querySelectorAll('input[type="radio"]');
            radios.forEach((radio) => {
                radio.setAttribute("disabled", "disabled");
            });

            const captureDiscardButtons = document.querySelectorAll(".capture_discard");
            captureDiscardButtons.forEach((button) => {
                button.disabled = true;
            });

            const pollSeatEl = document.getElementById("pollSeat");
            pollSeatEl.setAttribute("disabled", "");

            document.getElementById("captureList").innerHTML = "";

            // const title = document.getElementById("title");
            // title.style.color = "black";
            newEventSource();
        })
        .catch(error => {
            console.error('API call error:', error);
        });
}

function pollStop() {
    fetch('http://localhost:8000/poll/stop')
        .then(response => response.json())
        .then(data => {
            console.log("Server said: " + data.message);

            // enable/disable poll start/stop buttons
            document.getElementById("id_poll_stop").setAttribute("disabled", "");
            document.getElementById("id_poll_start").removeAttribute("disabled");

            // const elVolumeThreshold = document.getElementById("volume_threshold");
            // elVolumeThreshold.removeAttribute("disabled");
            // elVolumeThreshold.style.backgroundColor = "white";
            // elVolumeThreshold.style.color = "grey";

            const elAzMargin = document.getElementById("id_az_margin");
            elAzMargin.removeAttribute("disabled");
            elAzMargin.style.backgroundColor = "white";
            elAzMargin.style.color = "grey";

            const elElMargin = document.getElementById("id_el_margin");
            elElMargin.removeAttribute("disabled");
            elElMargin.style.backgroundColor = "white";
            elElMargin.style.color = "grey";

            const filterEl = document.getElementById("filterSeat");
            filterEl.removeAttribute("disabled");
            filterEl.value = "";

            if (window.captured.length > 0) {
                const filterDivEl = document.getElementById("filterDiv");
                filterDivEl.style.display = "block";
            }

            const beamFilterEl = document.getElementById("filterBeam");
            beamFilterEl.style.display = "none";

            const radios = document.querySelectorAll('input[type="radio"]');
            radios.forEach((radio) => {
                radio.removeAttribute("disabled");
            });

            const captureDiscardButtons = document.querySelectorAll(".capture_discard");
            captureDiscardButtons.forEach((button) => {
                button.disabled = false;
            });

            const pollSeatEl = document.getElementById("pollSeat");
            pollSeatEl.removeAttribute("disabled");

            // grey out title
            // const title = document.getElementById("title");
            // title.style.color = "grey";

            // enable capture list checkboxes
            // const allCheckboxes = document.querySelectorAll('.capture-class');
            // allCheckboxes.forEach((cb) => {
            //     cb.removeAttribute("disabled");
            // });

        })
        .catch(error => {
            console.error('API call error:', error);
        });
}
