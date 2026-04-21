let players = [];
  let startingPlayer = 0;
  let currentPlayer = startingPlayer;
  let deck = [];
  let gameOver = false;

  function showFinalScores() {
  const medal = ["🥇", "🥈", "🥉"] || "";
  const dialog = document.getElementById("scoreDialog");
  const tbody = document.querySelector("#scoreTable tbody");

  // Spieler sortieren (höchste Punkte zuerst)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  tbody.innerHTML = "";

  sortedPlayers.forEach((p, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${medal[index] || ""} ${index + 1}</td>
      <td>${p.name}</td>
      <td>${p.score}</td>
    `;

    tbody.appendChild(row);
  });

  dialog.showModal();
}

  function getCardColor(card) {
    if (card.type === "bonus") return "#f39c12"; // orange
    if (card.type === "multiplier") return "#000"; // schwarz

    const colors = [
      "#6c757d",
      "#007bff",
      "#28a745",
      "#ffc107",
      "#dc3545",
      "#17a2b8",
      "#6610f2",
      "#fd7e14",
      "#20c997",
      "#e83e8c",
      "#343a40",
      "#ff5733",
      "#6f42c1"
    ];

    return colors[card.value] || "#999";
  }

  function renderNameInputs() {
    const count = parseInt(document.getElementById("playerCount").value);
    const container = document.getElementById("nameInputs");

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = `Spieler ${i + 1}`;
      input.id = `playerName${i}`;

      container.appendChild(input);
    }
  }

  function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  function createDeck() {
    deck = [];

    // Zahlenkarten
    for (let i = 0; i <= 12; i++) {
      let count = i === 0 ? 1 : i;

      for (let j = 0; j < count; j++) {
        deck.push({
          type: "number",
          value: i
        });
      }
    }

    // ➕ Sonderkarten (je 1x)
    const specials = [2, 4, 6, 8, 10];

    specials.forEach(val => {
      deck.push({
        type: "bonus",
        value: val
      });
    });

    deck.push({
      type: "multiplier",
      value: 2
    });

    shuffle(deck);
  }

  function startGame() {
    const count = parseInt(document.getElementById("playerCount").value);
    players = [];

    for (let i = 0; i < count; i++) {
      const nameInput = document.getElementById(`playerName${i}`);
      const name = nameInput.value.trim() || `Spieler ${i + 1}`;

      players.push({
        name: name,
        score: 0,
        roundCards: [],
        status: "active"
      });
    }

    createDeck();
    console.log("Verbleibende Karten: " + deck.length);

    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "block";

    startRound();
  }

  function startRound() {
    players.forEach(p => {
      p.roundCards = [];
      p.status = "active";
    });
    currentPlayer = startingPlayer;
    gameOver = false;
    updateUI();
  }

  function isDuplicateNumberCard(player, card) {
    if (card.type !== "number") return false;

    return player.roundCards.some(
      c => c.type === "number" && c.value === card.value
    );
}

  function drawCard() {
    if (gameOver) return;
    if (deck.length === 0) {
      alert("Deck ist leer! Neues Deck wird gemischt.");
      console.log("Deck ist leer! Neues Deck wird gemischt.");
      createDeck();
    }

    const player = players[currentPlayer];
    if (player.status !== "active") return;

    const card = deck.pop();


    if (isDuplicateNumberCard(player, card)) {
      player.roundCards.push(card); // Karte hinzufügen (WICHTIG)

      player.status = "bust";

      updateUI(); // 👉 UI sofort aktualisieren

      setTimeout(() => {
        alert(`${player.name} bust!`);
        console.log(`${player.name} bust!`);
        nextPlayer();
      }, 100);
      console.log("Verbleibende Karten: " + deck.length);
      return;
    }

    player.roundCards.push(card);

    const numberCards = player.roundCards.filter(c => c.type === "number");

    if (numberCards.length === 7) {
      alert(`${player.name} hat Flip 7!`);
      console.log(`${player.name} hat Flip 7!`);
      console.log("Verbleibende Karten: " + deck.length);
      endRound(currentPlayer);
      return;
    }

    nextPlayer();
    console.log("Verbleibende Karten: " + deck.length);
  }

  function stopTurn() {
    if (gameOver) return;

    const player = players[currentPlayer];
    player.status = "stopped";
    nextPlayer();
  }

  function calculatePoints(cards) {
    let numberSum = 0;
    let bonusSum = 0;
    let multiplier = 1;

    cards.forEach(card => {
      if (card.type === "number") {
        numberSum += card.value;
      }

      if (card.type === "bonus") {
        bonusSum += card.value;
      }

      if (card.type === "multiplier") {
        multiplier *= 2;
      }
    });

    return (numberSum * multiplier) + bonusSum;
  }

  function nextPlayer() {
    const activePlayers = players
      .map((p, i) => ({ ...p, index: i }))
      .filter(p => p.status === "active");

    // ❗ Runde endet nur wenn keiner mehr aktiv ist
    if (activePlayers.length === 0) {
      endRound();
      return;
    }

    // 👉 Wenn nur noch ein Spieler aktiv ist
    if (activePlayers.length === 1) {
      currentPlayer = activePlayers[0].index; // 🔥 WICHTIG!
      updateUI();
      return;
    }

    // 👉 Nächsten aktiven Spieler finden
    do {
      currentPlayer = (currentPlayer + 1) % players.length;
    } while (players[currentPlayer].status !== "active");

    updateUI();
  }

  function endRound(winner = null) {
    gameOver = true;

    players.forEach((p, i) => {
      if (p.status !== "bust") {
        let points = calculatePoints(p.roundCards);

        if (winner === i) {
          points += 15;
        }

        p.score += points;
      }
    });

    if (players.some(p => p.score >= 200)) {
  showFinalScores();
  return;
}
    // 👉 Startspieler wechseln
    startingPlayer = (startingPlayer + 1) % players.length;
    setTimeout(startRound, 2000);
  }

  function getCardLabel(card) {
    if (card.type === "number") return card.value;
    if (card.type === "bonus") return `+${card.value}`;
    if (card.type === "multiplier") return "x2";
  }

  function updateUI() {
    document.getElementById("status").innerText =
      players[currentPlayer].name + " ist am Zug";

    const container = document.getElementById("players");
    container.innerHTML = "";

    players.forEach((p, i) => {
      const div = document.createElement("div");
      div.classList.add("player");

      if (i === currentPlayer) div.classList.add("active");

      let statusText = "";
      if (p.status === "bust") statusText = "💥 Bust";
      if (p.status === "stopped") statusText = "🛑 Gestoppt";

      div.innerHTML = `
        <h3>${p.name} (Punkte: ${p.score}) ${statusText}</h3>

        <div class="cards">
          ${
            p.roundCards.length === 0
              ? `<span style="opacity:0.3;">(keine Karten)</span>`
              : p.roundCards.map((c, index, arr) => {
                  const isLast = index === arr.length - 1;

                  let angle = Math.random() * 20 - 10
                  let rotation = "${angle}deg";
                  let extraStyle = "";

                  if (p.status === "bust" && isLast) {
                    extraStyle = "border:4px solid red; transform:scale(1.1);";
                  }

                  if (p.roundCards.length === 7 && isLast) {
                    extraStyle = "outline:4px solid gold; transform:scale(1.1);";
                  }

                  return `
                    <span class="card" style="background:${getCardColor(c)}; ${extraStyle} transform: rotate(${angle}deg);">
                      ${getCardLabel(c)}
                    </span>
                  `;
                }).join("")
          }
        </div>
      `;

      container.appendChild(div);
    });
  }
  window.onload = renderNameInputs;