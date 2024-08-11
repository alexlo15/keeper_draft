function createTeamInputs(numOfTeams, namesTable, prevSettings) {
  namesTable.innerHTML = "";
  for (let i = 0; i < numOfTeams; i++) {
    let tr = document.createElement("TR"),
      input = document.createElement("input"),
      td = document.createElement("TD");

    if (i === 0) {
      input.name = "player";
      input.id = "player";
      input.value = prevSettings ? prevSettings.player : "Player";
    } else {
      input.name = "team" + i;
      input.id = "team" + i;
      input.value = prevSettings["team" + i] ?? "CPU " + i;
    }
    input.type = "text";
    input.className = "form-control";

    td.classList.add("text-end");

    td.appendChild(input);
    tr.appendChild(td);
    namesTable.appendChild(tr);
  }
}
const currentTheme = localStorage.getItem("darktheme");
if (currentTheme === "dark") document.body.setAttribute("data-bs-theme", "dark");
window.onload = function () {
  let namesTable = document.getElementById("teamNames");
  let prevSettings = JSON.parse(localStorage.getItem("settings"));

  // Load previous settings if available, otherwise set default values and create initial team inputs
  if (prevSettings) {
    document.getElementById("numteams").value = prevSettings.numteams;
    document.getElementById("numrounds").value = prevSettings.numrounds;
    createTeamInputs(prevSettings.numteams, namesTable, prevSettings);
  } else {
    document.getElementById("numteams").value = 12;
    document.getElementById("numrounds").value = 14;
    createTeamInputs(12, namesTable, false);
  }

  // save draft settings to local storage
  document.getElementById("saveSettingsBtn").addEventListener("click", function () {
    const formData = new FormData(document.getElementById("settingsForm"));

    // Create an object to hold the form data
    const formObject = {};

    // Iterate over each key/value pair in the FormData object
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    localStorage.setItem("settings", JSON.stringify(formObject));

    // Log the form data object to the console
    console.log(formObject);
  });

  // create team names table on input change
  document.getElementById("numteams").addEventListener("change", function (event) {
    createTeamInputs(event.target.value, namesTable, prevSettings ? prevSettings : false);
  });

  const toggleThemeBtn = document.getElementById("toggleTheme");
  toggleThemeBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("darktheme", newTheme);
    document.body.setAttribute("data-bs-theme", newTheme);
  });
};
