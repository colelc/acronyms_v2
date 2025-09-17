function renderHome() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>Hello SPA!</h1>
    <button id="loadBtn">Fetch from backend</button>
    <div id="result"></div>
  `;

  document.getElementById("loadBtn").onclick = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      document.getElementById("result").textContent =
        "Backend says: " + data.message;
    } catch (err) {
      document.getElementById("result").textContent = "Error fetching data";
    }
  };
}

renderHome();