function createTeamInputs(numOfTeams, namesTable, prevSettings) {
  namesTable.innerHTML = "";

  for (let i = 0; i < numOfTeams; i++) {
    let tr = document.createElement("li"),
      input = document.createElement("input");

    // Create the input group div
    const inputGroupDiv = document.createElement("div");
    inputGroupDiv.className = "input-group mb-2";

    // Create the span element with the Font Awesome icon
    const span = document.createElement("span");
    span.className = "input-group-text";
    span.id = "reorder" + i;
    span.innerHTML = '<i class="fa-solid fa-arrows-up-down-left-right"></i>'; // Font Awesome draggable icon

    const span1 = document.createElement("span");
    span1.className = "input-group-text allPlaces";
    span1.id = "place" + i;
    span1.innerText = i + 1;

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
    input.className = "form-control allTeamsDO";
    input.ariaDescribedby = "reorder" + i;

    tr.classList.add("text-end");
    tr.draggable = true;

    inputGroupDiv.appendChild(span);
    inputGroupDiv.appendChild(span1);
    inputGroupDiv.appendChild(input);
    tr.appendChild(inputGroupDiv);
    namesTable.appendChild(tr);
  }
}

// Script.js
const sortableList = document.getElementById("teamNames");
let draggedItem = null;

sortableList.addEventListener("dragstart", (e) => {
  draggedItem = e.target;
  setTimeout(() => {
    e.target.style.display = "none";
  }, 0);
});

sortableList.addEventListener("dragend", (e) => {
  setTimeout(() => {
    e.target.style.display = "";
    draggedItem = null;
  }, 0);
});

sortableList.addEventListener("dragover", (e) => {
  e.preventDefault();
  const afterElement = getDragAfterElement(sortableList, e.clientY);
  const currentElement = document.querySelector(".dragging");
  if (afterElement == null) {
    sortableList.appendChild(draggedItem);
  } else {
    sortableList.insertBefore(draggedItem, afterElement);
  }

  updateDraftOrderLINums();
});

const getDragAfterElement = (container, y) => {
  const draggableElements = [
    ...container.querySelectorAll("li:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return {
          offset: offset,
          element: child,
        };
      } else {
        return closest;
      }
    },
    {
      offset: Number.NEGATIVE_INFINITY,
    }
  ).element;
};

const updateDraftOrderLINums = () => {
  document.querySelectorAll(".allPlaces").forEach((el, index) => {
    el.textContent = index + 1;
  });
};

const updateDraftOrderOptions = (prevSettings) => {
  let ul = document.getElementById("teamNames"); // Get all LI elements

  // Create a document fragment to hold the reordered elements
  let fragment = document.createDocumentFragment();

  // Loop through the teamOrder and find the corresponding elements
  prevSettings.teamOrder.forEach((teamKey) => {
    // Find the grandparent LI element
    let grandparentLi = document.getElementById(teamKey).closest("li");

    // Append the grandparent LI to the fragment
    if (grandparentLi) {
      fragment.appendChild(grandparentLi);
    }
  });

  // Re-append the fragment, which contains the LIs in the correct order
  ul.innerHTML = "";
  ul.appendChild(fragment);
};
////////////////////////////

const currentTheme = localStorage.getItem("darktheme");
if (currentTheme === "dark")
  document.body.setAttribute("data-bs-theme", "dark");

window.onload = function () {
  let namesTable = document.getElementById("teamNames");
  let prevSettings = JSON.parse(localStorage.getItem("settings"));

  // Load previous settings if available, otherwise set default values and create initial team inputs
  if (prevSettings) {
    document.getElementById("numteams").value = prevSettings.numteams;
    document.getElementById("numrounds").value = prevSettings.numrounds;
    document.getElementById("draftorderon").checked =
      prevSettings.draftorderon === "on";
    createTeamInputs(prevSettings.numteams, namesTable, prevSettings);
    updateDraftOrderOptions(prevSettings);
    updateDraftOrderLINums();
  } else {
    document.getElementById("numteams").value = 12;
    document.getElementById("numrounds").value = 14;
    createTeamInputs(12, namesTable, false);
  }

  // save draft settings to local storage
  document
    .getElementById("saveSettingsBtn")
    .addEventListener("click", function () {
      const formData = new FormData(document.getElementById("settingsForm"));

      // Create an object to hold the form data
      const formObject = {};

      // identify all inputs with the class 'allTeamsDO'
      const allTeamsInputs = document.querySelectorAll(".allTeamsDO");

      // Initialize an array to store the order of the teams
      const teamOrder = [];

      // allTeamsDO
      // Iterate over each key/value pair in the FormData object
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      // default to 'off' if not provided by user
      if (!formObject["draftorderon"]) formObject["draftorderon"] = "off";

      // Loop through each input with the class 'allTeamsDO'
      allTeamsInputs.forEach(function (input) {
        const playerName = input.value;

        teamOrder.push(
          Object.keys(formObject).find((key) => formObject[key] === playerName)
        );
      });

      formObject["teamOrder"] = teamOrder;

      localStorage.setItem("settings", JSON.stringify(formObject));

      // Log the form data object to the console
      console.log(formObject);
      // window.location.reload();
    });

  // create team names table on input change
  document
    .getElementById("numteams")
    .addEventListener("change", function (event) {
      createTeamInputs(
        event.target.value,
        namesTable,
        prevSettings ? prevSettings : false
      );
    });

  const toggleThemeBtn = document.getElementById("toggleTheme");
  toggleThemeBtn.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-bs-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem("darktheme", newTheme);
    document.body.setAttribute("data-bs-theme", newTheme);
  });
};
