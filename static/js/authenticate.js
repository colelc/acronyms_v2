async function fetchClaims() {
    try {
        console.log("fetch claims")
        const res = await fetch("/api/claims");   // call backend endpoint
        if (res.status === 200) {
            const data = await res.json();
            console.log("data", data);
            document.getElementById("user-info").textContent =
                "Logged in as: " + JSON.stringify(data, null, 2);
        } else {
            document.getElementById("user-info").textContent =
                "Unauthorized (status " + res.status + ")";
        }
    } catch (err) {
        console.log("err", err);
        document.getElementById("user-info").textContent = "Error: " + err;
    }
}

