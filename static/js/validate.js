
function setMarginValue(id, value) {
    //console.log("setMarginValue", id, value);
    const marginEl = document.getElementById(id);
    //console.log("marginEl", marginEl);

    if (marginEl === null || marginEl === undefined) {
        console.log("marginEl, no value");
        return;
    }
}

function setVolumeThresholdValue(id, value) {
    //console.log("setVolumeThresholdValue", id, value);
    const El = document.getElementById(id);
    //console.log("marginEl", marginEl);
}


function validateIP(id, value) {
    //console.log("validateIP", id, value);
    const el = document.getElementById(id);
    // console.log("el", el);
    if (value !== "10.149.144.32" && value !== "10.149.144.33" && value !== "10.149.144.34") {
        const saveEl = document.getElementById("id_save");
        saveEl.setAttribute("disabled", "disabled");

        el.style.backgroundColor = "grey";
    } else {
        el.style.backgroundColor = "white";
        yesSaveCheck();
    }
}

// function validateAzStart(id) {

//     const startEl = document.getElementById(id);
//     const startValue = parseInt(startEl.value);
//     const endEl = document.getElementById(id.replace("start", "end"));
//     const endValue = parseInt(endEl.value);
//     //console.log("startValue", startValue, "endValue", endValue);

//     if (azValueCheck(startValue) == false || Number.isNaN(startValue) || startValue > endValue) {
//         noSave(startEl);
//         return;
//     }
//     whiteBackground(startEl);
//     yesSaveCheck();
// }

// function validateAzEnd(id, value) {
//     const endEl = document.getElementById(id);
//     const endValue = parseInt(endEl.value);
//     const startEl = document.getElementById(id.replace("end", "start"));
//     const startValue = parseInt(startEl.value);
//     //console.log("startValue", startValue, "endValue", endValue);

//     if (azValueCheck(endValue) == false || Number.isNaN(endValue) || startValue > endValue) {
//         noSave(endEl);
//         return;
//     }
//     whiteBackground(endEl);
//     yesSaveCheck();
// }

// function validateElStart(id) {
//     const startEl = document.getElementById(id);
//     const startValue = parseInt(startEl.value);
//     const endEl = document.getElementById(id.replace("start", "end"));
//     const endValue = parseInt(endEl.value);
//     //console.log("startValue", startValue, "endValue", endValue);

//     if (elValueCheck(startValue) == false || Number.isNaN(startValue) || startValue > endValue) {
//         noSave(startEl);
//         return;
//     }
//     whiteBackground(startEl);
//     yesSaveCheck();
// }

// function validateElEnd(id) {
//     const endEl = document.getElementById(id);
//     const endValue = parseInt(endEl.value);
//     const startEl = document.getElementById(id.replace("end", "start"));
//     const startValue = parseInt(startEl.value);
//     //console.log("startValue", startValue, "endValue", endValue);

//     if (elValueCheck(endValue) == false || Number.isNaN(endValue) || startValue > endValue) {
//         noSave(endEl);
//         return;
//     }
//     whiteBackground(endEl);
//     yesSaveCheck();
// }

// function azValueCheck(value) {
//     if (value < 0 || value >= 360 || value.length == 0) {
//         console.log("fail az value check", value);
//         return false;
//     }
//     return true;
// }

// function elValueCheck(value) {
//     if (value < 0 || value >= 90 || value.length == 0) {
//         return false;
//     }
//     return true;
// }

function noSave(el) {
    const saveEl = document.getElementById("id_save");
    saveEl.setAttribute("disabled", "disabled");
    el.style.backgroundColor = "grey";
}

function yesSaveCheck() {
    if (!yesSaveEl("id_primary_ip") || !yesSaveEl("id_secondary_ip")) {
        return;
    }

    // if (!yesSaveEl("id_primary_az_block_start") || !yesSaveEl("id_primary_az_block_end")) {
    //     return;
    // }

    // if (!yesSaveEl("id_primary_el_block_start") || !yesSaveEl("id_primary_el_block_end")) {
    //     return;
    // }

    // if (!yesSaveEl("id_secondary_az_block_start") || !yesSaveEl("id_secondary_az_block_end")) {
    //     return;
    // }

    // if (!yesSaveEl("id_secondary_el_block_start") || !yesSaveEl("id_secondary_el_block_end")) {
    //     return;
    // }

    // ok to save
    const saveEl = document.getElementById("id_save");
    saveEl.removeAttribute("disabled");
    //el.style.backgroundColor = "grey";

}

function yesSaveEl(elId) {
    const el = document.getElementById(elId);
    if (el.style.backgroundColor !== "white") {
        return false;
    }

    return true;
}

function whiteBackground(el) {
    el.style.backgroundColor = "white";
}
