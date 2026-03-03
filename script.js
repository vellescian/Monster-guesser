let monsters = [];
let targetMonster = null;

fetch("monsters.json")
  .then(response => response.json())
  .then(data => {

    monsters = data.map(monster => {

      const metaData = parseMeta(monster.meta);

      return {
        name: monster.name,
        size: metaData.size,
        type: metaData.type,
        alignment: metaData.alignment,
        cr: extractCR(monster.Challenge)
      };
    });
    const datalist = document.getElementById("monsterList");

    monsters.forEach(monster => {
      const option = document.createElement("option");
      option.value = monster.name;
      datalist.appendChild(option);
    });
    pickRandomMonster();
    console.log("Target:", targetMonster);
    console.log(monsters);
  });

function pickRandomMonster() {
  const randomIndex = Math.floor(Math.random() * monsters.length);
  targetMonster = monsters[randomIndex];
}

function extractCR(challengeString) {
  const crPart = challengeString.split(" ")[0];

  if (crPart.includes("/")) {
    const [num, denom] = crPart.split("/");
    return parseFloat(num) / parseFloat(denom);
  }

  return parseFloat(crPart);
}

function parseMeta(metaString) {
  // Split into "Large aberration" and "lawful evil"
  const parts = metaString.split(",");

  const sizeAndType = parts[0].trim();
  const alignment = parts[1] ? parts[1].trim() : "Unknown";

  // Split size and type
  const words = sizeAndType.split(" ");

  const size = words[0];

  // Everything after size is the type
  const type = words.slice(1).join(" ");

  return {
    size: capitalize(size),
    type: capitalizeWords(type),
    alignment: capitalizeWords(alignment)
  };
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function capitalizeWords(str) {
  return str.split(" ")
            .map(word => capitalize(word))
            .join(" ");
}
function parseAlignment(alignmentString) {

  const lower = alignmentString.toLowerCase();

  if (lower === "unaligned") {
    return { lawChaos: null, goodEvil: null, special: "unaligned" };
  }

  if (lower === "neutral") {
    return { lawChaos: 0, goodEvil: 0, special: "true neutral" };
  }

  let lawChaos = 0;  // -1 chaotic, 0 neutral, +1 lawful
  let goodEvil = 0;  // -1 evil, 0 neutral, +1 good

  if (lower.includes("lawful")) lawChaos = 1;
  if (lower.includes("chaotic")) lawChaos = -1;

  if (lower.includes("good")) goodEvil = 1;
  if (lower.includes("evil")) goodEvil = -1;

  return { lawChaos, goodEvil, special: null };
}
function parseSize(sizeString) {

  const sizelist = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
  let sizemod = sizelist.indexOf(sizeString);
  return { sizemod };
}

function checkGuess() {
  const input = document.getElementById("guessInput").value.trim();

  if (!input) return;

  const match = monsters.find(monster =>
    monster.name.toLowerCase() === input.toLowerCase()
  );

  if (!match) {
    document.getElementById("result").textContent = "Monster not found!";
    return;
  }

	if (match.name === targetMonster.name) {
  document.getElementById("result").textContent = "Correct! 🎉";
  } else {

  let hintLines = [];

  if (match.cr > targetMonster.cr + 5) {
    hintLines.push("CR is MUCH too high.\n");
  } else if (match.cr > targetMonster.cr) {
    hintLines.push("CR is too high.\n");
  } else if (match.cr < targetMonster.cr) {
    hintLines.push("CR is too low.\n");
  } else if (match.cr < targetMonster.cr - 5) {
    hintLines.push("CR is MUCH too low.\n");
  } else {
    hintLines.push("CR matches!\n");
  }
  if (match.type === targetMonster.type) {
  hintLines.push("Type matches!\n");
  }
  const guessSize = parseSize(match.size);
  const targetSize = parseSize(targetMonster.size);

  if (match.size === targetMonster.size) {
     hintLines.push("Size matches!\n");
  } else if (guessSize.sizemod > targetSize.sizemod + 2) {
    hintLines.push("Size is MUCH too big!\n");
  } else if (guessSize.sizemod > targetSize.sizemod) {
    hintLines.push("Size is too big!\n");
  } else if (guessSize.sizemod < targetSize.sizemod - 2) {
    hintLines.push("Size is MUCH too small!\n");
  } else if (guessSize.sizemod < targetSize.sizemod) {
    hintLines.push("Size is too small!\n");
  }
  const guessAlign = parseAlignment(match.alignment);
  const targetAlign = parseAlignment(targetMonster.alignment);

 hintLines.push("\nAlignment:\n");

if (targetAlign.special === "unaligned") {

  if (guessAlign.special === "unaligned") {
    hintLines.push("Alignment matches (Unaligned).\n");
  } else {
    hintLines.push("Should be more unaligned.\n");
  }

} else if (guessAlign.special === "unaligned") {

  hintLines.push("Too unaligned.\n");

} else {

  // Law/Chaos axis
  if (guessAlign.lawChaos > targetAlign.lawChaos) {
    hintLines.push("Too lawful.\n");
  } else if (guessAlign.lawChaos < targetAlign.lawChaos) {
    hintLines.push("Too chaotic.\n");
  } else {
    hintLines.push("Law/Chaos axis matches.\n");
  }

  // Good/Evil axis
  if (guessAlign.goodEvil > targetAlign.goodEvil) {
    hintLines.push("Too good.\n");
  } else if (guessAlign.goodEvil < targetAlign.goodEvil) {
    hintLines.push("Too evil.\n");
  } else {
    hintLines.push("Good/Evil axis matches.\n");
  }
}
  addHistoryEntry(match, hintLines);
  document.getElementById("result").textContent = "Wrong! See history below.";
}
  }

function addHistoryEntry(guess, hintLines) {

  const historyDiv = document.getElementById("history");

  const entry = document.createElement("div");
  entry.classList.add("history-entry");

  const title = document.createElement("strong");
  title.textContent = guess.name;

  entry.appendChild(title);

  const ul = document.createElement("ul");

  hintLines.forEach(line => {
    const li = document.createElement("li");
    li.textContent = line;
    ul.appendChild(li);
  });

  entry.appendChild(ul);

  historyDiv.prepend(entry); // newest on top
}