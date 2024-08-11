let teams;

//
function add2Team(event, element, tR, teams, snakeDraftOrder, currentPool, originalCt) {
  tR.remove();
  let logTD = document.createElement("td"),
    logTR = document.createElement("tr");

  let currTeam, nextTeam, playersID;
  teams.forEach((team) => {
    if (team.isPlayer) playersID = team.id;
    if (team.id === snakeDraftOrder[0]) currTeam = team;
    if (team.id === snakeDraftOrder[1]) nextTeam = team;
  });

  currTeam.roster.push(element);
  document.getElementById("team-" + currTeam.id).innerHTML += "<tr><td>" + element.rank + "</td><td>" + element.name + "</td></tr>";
  if (snakeDraftOrder[0] === currTeam.id && currTeam.isPlayer) {
    logTD.textContent = "You drafted " + element.name + " (" + element.posrank.substring(0, 2) + ") - overall pick #" + (originalCt - (currentPool.length - 1));
  } else {
    logTD.textContent = currTeam.id + " drafted " + element.name + " (" + element.posrank.substring(0, 2) + ") - overall pick #" + (originalCt - (currentPool.length - 1));
  }

  logTR.appendChild(logTD);
  document.getElementById("logTable").prepend(logTR);

  currentPool.splice(currentPool.indexOf(element), 1);
  snakeDraftOrder.shift();
  appendButtonsToContainer(snakeDraftOrder);

  // If the upcoming is not a player, determine best pick for next team and retrigger this function
  if (snakeDraftOrder[0] === nextTeam.id && !nextTeam.isPlayer) {
    let nextPick = getBestPick(nextTeam.roster, currentPool);
    const event = new MouseEvent("dblclick", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    setTimeout(() => {
      document.getElementById("row" + nextPick.name).dispatchEvent(event);
    }, 1550);
  } else {
    // else current team is a player, so we should not draft any player
    const sound = new Audio('/keeper_draft/assets/sounds/quick_melody_alert_sound.mp3');
    sound.play();
  }
}

//
function createTeamsWithPlayer(numTeams, prevSettings) {
  const teams = [];

  // Create a special team with the ID 'player'
  const playerTeam = {
    id: prevSettings.player ?? "player",
    isPlayer: true,
    roster: [],
  };
  teams.push(playerTeam);

  // Create the rest of the teams
  //  Passing prevsettings from starting point to here because if they exist that means the user is already a saved team in LStorage
  for (let i = 1; i <= (prevSettings ? numTeams - 1 : numTeams); i++) {
    const team = {
      id: prevSettings["team" + i] ?? i,
      isPlayer: false,
      roster: [],
    };
    teams.push(team);
  }

  return teams;
}

//
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//
function createSnakeDraftOrderWithPlayer(numTeams, numRounds, prevSettings) {
  const teams = createTeamsWithPlayer(numTeams ?? 12, prevSettings);

  // Shuffle the teams to randomize the order
  const randomizedTeams = shuffleArray(teams.slice());

  const draftOrder = [];

  for (let round = 1; round <= numRounds; round++) {
    if (round % 2 !== 0) {
      // If the round is odd, add the teams in randomized order
      for (let i = 0; i < randomizedTeams.length; i++) {
        draftOrder.push(randomizedTeams[i].id);
      }
    } else {
      // If the round is even, add the teams in reversed randomized order
      for (let i = randomizedTeams.length - 1; i >= 0; i--) {
        draftOrder.push(randomizedTeams[i].id);
      }
    }
  }

  return [teams, draftOrder];
}

//
function createButtonHtml(id) {
  const button = document.createElement("div");
  let settings = localStorage.getItem("settings") ? JSON.parse(localStorage.getItem("settings")) : false;

  if (settings && id === settings.player) {
    button.innerHTML = `
    <img src="/keeper_draft/assets/img/avatar.png" class="rounded-circle  shadow-4"
        style="width: 50px;" alt="Avatar" /><br>
  ${id}
`;
  } else {
    button.innerHTML = `
    <img src="/keeper_draft/assets/img/red_avatar.png" class="rounded-circle shadow-4"
        style="width: 50px;" alt="Avatar" /><br>
  ${id}
`;
  }
  button.className = "me-3 img-fluid text-center p-1 shadow-4 ";

  return button;
}

//
function appendButtonsToContainer(draftOrder) {
  const container = document.getElementById("draftOrder");
  container.innerHTML = "";
  const limit = Math.min(draftOrder.length, 20);

  for (let i = 0; i < limit; i++) {
    const buttonHtml = createButtonHtml(draftOrder[i]);
    container.appendChild(buttonHtml);
  }
}

//
function createTeamCard(team) {
  const cardDiv = document.createElement("div");
  cardDiv.id = team.id;
  if (!team.isPlayer) cardDiv.className = "col-12 teamCards d-none";
  else cardDiv.className = "col-12 teamCards";

  const card = document.createElement("div");
  card.className = "card mb-4";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const table = document.createElement("table");
  table.className = "table";

  const thead = document.createElement("thead");
  thead.innerHTML = `
        <tr>
            <th scope="col">Rank</th>
            <th scope="col">Name</th>
        </tr>
    `;

  const tbody = document.createElement("tbody");
  tbody.id = `team-${team.id}`;

  table.appendChild(thead);
  table.appendChild(tbody);
  cardBody.appendChild(table);
  card.appendChild(cardBody);
  cardDiv.appendChild(card);

  return cardDiv;
}

//
function appendTeamCards(teams, containerId) {
  const container = document.getElementById(containerId);

  teams.forEach((team) => {
    let option = document.createElement("option");
    option.value = team.id;
    option.textContent = team.id + "'s team";
    document.getElementById("dropdown").appendChild(option);

    const teamCard = createTeamCard(team);
    container.appendChild(teamCard);
  });
}

//
function triggerDoubleClickOnFirstRow(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    const firstRow = tbody.querySelector("tr");
    if (firstRow) {
      const event = new MouseEvent("dblclick", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      setTimeout(() => {
        firstRow.dispatchEvent(event);
      }, 1550);
    }
  }
}

//
function getCurrentRoundAndPick(snakeDraftOrder, totalRounds, totalPlayers) {
  // Calculate the total number of picks
  const totalPicks = totalRounds * totalPlayers;

  // Determine the number of picks already made
  const picksMade = totalPicks - snakeDraftOrder.length;

  // Calculate the current round and pick number
  const currentRound = Math.floor(picksMade / totalPlayers) + 1;
  const currentPickInRound = Math.floor(picksMade % totalPlayers) + 1;

  document.getElementById("draftPick").textContent = "Round " + currentRound + " - Pick " + currentPickInRound;

  return { currentRound, currentPickInRound };
}

//
function getBestPick(currentTeam, availablePlayers) {
  // Define the roster structure for a typical PPR fantasy football team
  const rosterStructure = {
    QB: 1,
    WR: 2,
    RB: 2,
    TE: 1,
    FLEX: 1, // Flex can be WR, RB, or TE
    K: 1, // Kicker (if needed)
    DST: 1, // Defense/Special Teams (if needed)
  };

  // Calculate the current roster composition
  const currentRoster = {
    QB: 0,
    WR: 0,
    RB: 0,
    TE: 0,
    FLEX: 0,
    K: 0,
    DST: 0,
  };

  currentTeam.forEach((player) => {
    const position = player.posrank.replace(/[0-9]/g, "");
    if (currentRoster[position] !== undefined) {
      currentRoster[position]++;
    }
  });

  // Function to determine if a player can be picked
  function canPickPlayer(player) {
    const position = player.posrank.replace(/[0-9]/g, "");
    if (position === "QB" || position === "WR" || position === "RB" || position === "TE") {
      if (currentRoster[position] < rosterStructure[position]) {
        return true;
      } else if (position !== "QB" && currentRoster.FLEX < rosterStructure.FLEX) {
        return true;
      }
    }
    return false;
  }

  // Sort available players by rank
  availablePlayers.sort((a, b) => a.rank - b.rank);

  // Find the best available player based on the current team needs
  for (const player of availablePlayers) {
    if (canPickPlayer(player)) {
      return player;
    }
  }

  // If no optimal player is found, return the highest-ranked player available
  return availablePlayers[0];
}

//
function toggleDivs() {
  // Get selected value from dropdown
  const selectedValue = document.getElementById("dropdown").value;

  // Get all content divs
  const divs = document.querySelectorAll(".teamCards");

  // Loop through each div and toggle visibility
  divs.forEach((div) => {
    if (div.id === selectedValue) {
      div.classList.remove("d-none");
    } else {
      div.classList.add("d-none");
    }
  });
}

//
fetch("../keeper_draft/data/rankings.json")
  .then((response) => response.json())
  .then((data) => {
    // You can use the data here
    let currentPool = data,
      draftTable = document.getElementById("draft-table"),
      originalCt = data.length;

    let prevSettings = JSON.parse(localStorage.getItem("settings"));

    (numberOfTeams = prevSettings.numteams ?? 14), (numberOfRounds = prevSettings.numrounds ?? 14), ([teams, snakeDraftOrder] = createSnakeDraftOrderWithPlayer(numberOfTeams, numberOfRounds, prevSettings ?? false));
    // console.log(numberOfTeams, numberOfRounds, teams, snakeDraftOrder);

    //   "draft",
    //   JSON.stringify({
    //     teams: teams,
    //     rounds: snakeDraftOrder,
    //   })
    // );

    appendTeamCards(teams, "teamsDiv");
    appendButtonsToContainer(snakeDraftOrder);

    getCurrentRoundAndPick(snakeDraftOrder, numberOfRounds, numberOfTeams);

    let userTeamID;
    teams.forEach((team) => {
      if (team.isPlayer) userTeamID = team.id;
    });

    data.forEach((element) => {
      let tR = document.createElement("TR");
      tR.id = "row" + element.name;
      tR.addEventListener("dblclick", (event) => {

        // if next team up IS not the users team OR the event page XY are not 0,0
        if (snakeDraftOrder[0] === userTeamID || (event.pageX === 0 && event.pageY === 0)) {

          add2Team(event, element, tR, teams, snakeDraftOrder, currentPool, originalCt);

          getCurrentRoundAndPick(snakeDraftOrder, numberOfRounds, numberOfTeams);
        } else console.log("You can't draft next team up! fuck your ass!");
      });

      for (const key in element) {
        //
        let td = document.createElement("TD");

        td.textContent = element[key];

        tR.appendChild(td);
      }

      draftTable.appendChild(tR);
    });

    // start draft
    document.getElementById("startBtn").addEventListener("click", function () {
      document.querySelectorAll(".toggleStart").forEach((el) => el.classList.toggle("d-none"));

      // identify current team
      let currTeam;
      teams.forEach((team) => {
        if (team.id === snakeDraftOrder[0]) {
          currTeam = team;
        }
      });

      // check if current team is a player or a snake draft team
      if (snakeDraftOrder[0] === currTeam.id && !currTeam.isPlayer) {
        let nextPick = getBestPick(currTeam.roster, currentPool);
        let tR = document.createElement("TR");
        const event = new MouseEvent("dblclick", {
          bubbles: true,
          cancelable: true,
          view: window,
        });
        setTimeout(() => {
          document.getElementById("row" + nextPick.name).dispatchEvent(event);
        }, 2250);
      } else {
        // else current team is a player, so we should not draft any player
        const sound = new Audio('/keeper_draft/assets/sounds/quick_melody_alert_sound.mp3');
        sound.play();
      }
    });

  })
  .catch((error) => console.error("Error fetching JSON:", error));
