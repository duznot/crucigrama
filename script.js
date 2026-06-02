const puzzles = [
  {
    title: "Crucigrama 1",
    subtitle: "Asistentes de IA, investigación y documentos académicos.",
    category: "IA + academia",
    rows: 15,
    cols: 16,
    words: [
      {
        answer: "CHATGPT",
        row: 2,
        col: 3,
        dir: "across",
        clue: "Asistente conversacional que ayuda a redactar, explicar temas y generar ideas."
      },
      {
        answer: "GEMINI",
        row: 5,
        col: 0,
        dir: "across",
        clue: "Modelo generativo de Google que responde preguntas y apoya tareas creativas."
      },
      {
        answer: "SCITE",
        row: 7,
        col: 4,
        dir: "across",
        clue: "Herramienta académica que analiza citas científicas y su contexto."
      },
      {
        answer: "NOTEBOOKLM",
        row: 10,
        col: 6,
        dir: "across",
        clue: "Asistente de Google para trabajar con apuntes, fuentes y documentos propios."
      },
      {
        answer: "COPILOT",
        row: 2,
        col: 3,
        dir: "down",
        clue: "Asistente de Microsoft integrado en tareas de búsqueda, escritura y productividad."
      },
      {
        answer: "PERPLEXITY",
        row: 2,
        col: 8,
        dir: "down",
        clue: "Buscador con IA que entrega respuestas resumidas y fuentes consultables."
      },
      {
        answer: "CLAUDE",
        row: 9,
        col: 14,
        dir: "down",
        clue: "Asistente de IA usado para analizar textos extensos y apoyar la escritura."
      },
      {
        answer: "ZOTERO",
        row: 9,
        col: 7,
        dir: "down",
        clue: "Gestor bibliográfico para organizar referencias y crear citas académicas."
      }
    ]
  },
  {
    title: "Crucigrama 2",
    subtitle: "Diseño visual, multimedia, presentaciones y organización educativa.",
    category: "diseño + productividad",
    rows: 13,
    cols: 15,
    words: [
      {
        answer: "CANVA",
        row: 1,
        col: 3,
        dir: "across",
        clue: "Plataforma para crear diseños, infografías, pósteres y presentaciones."
      },
      {
        answer: "KAHOOT",
        row: 3,
        col: 8,
        dir: "across",
        clue: "Herramienta para crear cuestionarios interactivos y juegos de evaluación."
      },
      {
        answer: "PREZI",
        row: 5,
        col: 4,
        dir: "across",
        clue: "Aplicación para presentaciones dinámicas con recorridos visuales."
      },
      {
        answer: "GAMMA",
        row: 7,
        col: 4,
        dir: "across",
        clue: "Herramienta con IA para generar presentaciones y documentos visuales."
      },
      {
        answer: "CAPCUT",
        row: 1,
        col: 3,
        dir: "down",
        clue: "Editor de video usado para crear contenidos con efectos, subtítulos y música."
      },
      {
        answer: "TRELLO",
        row: 3,
        col: 13,
        dir: "down",
        clue: "Tablero digital para organizar tareas, proyectos y trabajo colaborativo."
      },
      {
        answer: "FIGMA",
        row: 7,
        col: 12,
        dir: "down",
        clue: "Herramienta de diseño colaborativo para interfaces, prototipos y recursos visuales."
      },
      {
        answer: "NOTION",
        row: 8,
        col: 9,
        dir: "across",
        clue: "Espacio de productividad para notas, bases de datos, planes y seguimiento de tareas."
      }
    ]
  }
];

let currentPuzzle = 0;
let activeWordId = null;

const board = document.querySelector("#board");
const acrossClues = document.querySelector("#acrossClues");
const downClues = document.querySelector("#downClues");
const progressText = document.querySelector("#progressText");
const puzzleTitle = document.querySelector("#puzzleTitle");
const puzzleSubtitle = document.querySelector("#puzzleSubtitle");
const categoryBadge = document.querySelector("#categoryBadge");

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentPuzzle = Number(tab.dataset.puzzle);
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    renderPuzzle();
  });
});

document.querySelector("#checkBtn").addEventListener("click", checkAnswers);
document.querySelector("#revealBtn").addEventListener("click", revealAnswers);
document.querySelector("#clearBtn").addEventListener("click", clearAnswers);

function renderPuzzle() {
  const puzzle = puzzles[currentPuzzle];
  const placed = buildGrid(puzzle);
  activeWordId = null;

  puzzleTitle.textContent = puzzle.title;
  puzzleSubtitle.textContent = puzzle.subtitle;
  categoryBadge.textContent = puzzle.category;

  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${puzzle.cols}, var(--cell))`;
  board.style.gridTemplateRows = `repeat(${puzzle.rows}, var(--cell))`;

  for (let row = 0; row < puzzle.rows; row += 1) {
    for (let col = 0; col < puzzle.cols; col += 1) {
      const key = cellKey(row, col);
      const data = placed.cells.get(key);
      const cell = document.createElement("div");
      cell.className = data ? "cell" : "cell block";

      if (data) {
        const number = placed.numberMap.get(key);
        if (number) {
          const marker = document.createElement("span");
          marker.className = "number";
          marker.textContent = number;
          cell.appendChild(marker);
        }

        const input = document.createElement("input");
        input.maxLength = 1;
        input.autocomplete = "off";
        input.inputMode = "text";
        input.dataset.answer = data.letter;
        input.dataset.row = row;
        input.dataset.col = col;
        input.dataset.words = data.wordIds.join(",");
        input.setAttribute("aria-label", `Fila ${row + 1}, columna ${col + 1}`);
        input.addEventListener("input", handleInput);
        input.addEventListener("keydown", handleKeydown);
        input.addEventListener("focus", () => setActiveWord(input));
        cell.appendChild(input);
      }

      board.appendChild(cell);
    }
  }

  renderClues(puzzle, placed);
  updateProgress();
}

function buildGrid(puzzle) {
  const cells = new Map();
  const numberMap = new Map();
  let clueNumber = 1;

  puzzle.words.forEach((word, id) => {
    word.id = id;
    for (let index = 0; index < word.answer.length; index += 1) {
      const row = word.row + (word.dir === "down" ? index : 0);
      const col = word.col + (word.dir === "across" ? index : 0);
      const key = cellKey(row, col);
      const existing = cells.get(key);
      if (row < 0 || row >= puzzle.rows || col < 0 || col >= puzzle.cols) {
        throw new Error(`La palabra ${word.answer} se sale del tablero en ${key}`);
      }
      if (existing && existing.letter !== word.answer[index]) {
        throw new Error(`Cruce inválido en ${key}`);
      }
      cells.set(key, {
        letter: word.answer[index],
        wordIds: existing ? [...existing.wordIds, id] : [id]
      });
    }
  });

  puzzle.words.forEach((word) => {
    const key = cellKey(word.row, word.col);
    if (!numberMap.has(key)) {
      numberMap.set(key, clueNumber);
      clueNumber += 1;
    }
    word.number = numberMap.get(key);
  });

  return { cells, numberMap };
}

function renderClues(puzzle) {
  acrossClues.innerHTML = "";
  downClues.innerHTML = "";

  puzzle.words
    .slice()
    .sort((a, b) => a.number - b.number)
    .forEach((word) => {
      const item = document.createElement("li");
      item.value = word.number;
      item.textContent = word.clue;
      item.dataset.wordId = word.id;
      item.addEventListener("click", () => focusWord(word.id));
      if (word.dir === "across") {
        acrossClues.appendChild(item);
      } else {
        downClues.appendChild(item);
      }
    });
}

function handleInput(event) {
  const input = event.target;
  input.value = input.value.toUpperCase().replace(/[^A-Z]/g, "");
  validateCell(input);
  updateCompletedWords();
  if (input.value) moveToNext(input);
  updateProgress();
}

function handleKeydown(event) {
  const input = event.target;
  if (event.key === "Backspace" && !input.value) {
    moveToPrevious(input);
  }
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    moveByArrow(input, event.key);
  }
}

function setActiveWord(input) {
  const ids = input.dataset.words.split(",").map(Number);
  activeWordId = activeWordId && ids.includes(activeWordId) ? activeWordId : ids[0];
  markActiveClue();
}

function focusWord(wordId) {
  const word = puzzles[currentPuzzle].words[wordId];
  const selector = `[data-row="${word.row}"][data-col="${word.col}"]`;
  activeWordId = wordId;
  document.querySelector(selector)?.focus();
  markActiveClue();
}

function markActiveClue() {
  document.querySelectorAll(".clues li").forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.wordId) === activeWordId);
  });
}

function moveToNext(input) {
  const word = puzzles[currentPuzzle].words[activeWordId ?? Number(input.dataset.words.split(",")[0])];
  const row = Number(input.dataset.row) + (word.dir === "down" ? 1 : 0);
  const col = Number(input.dataset.col) + (word.dir === "across" ? 1 : 0);
  document.querySelector(`[data-row="${row}"][data-col="${col}"]`)?.focus();
}

function moveToPrevious(input) {
  const word = puzzles[currentPuzzle].words[activeWordId ?? Number(input.dataset.words.split(",")[0])];
  const row = Number(input.dataset.row) - (word.dir === "down" ? 1 : 0);
  const col = Number(input.dataset.col) - (word.dir === "across" ? 1 : 0);
  document.querySelector(`[data-row="${row}"][data-col="${col}"]`)?.focus();
}

function moveByArrow(input, key) {
  const row = Number(input.dataset.row);
  const col = Number(input.dataset.col);
  const delta = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1]
  }[key];
  document.querySelector(`[data-row="${row + delta[0]}"][data-col="${col + delta[1]}"]`)?.focus();
}

function checkAnswers() {
  board.querySelectorAll("input").forEach((input) => {
    validateCell(input);
  });
  updateCompletedWords();
  updateProgress();
}

function revealAnswers() {
  board.querySelectorAll("input").forEach((input) => {
    input.value = input.dataset.answer;
    validateCell(input);
  });
  updateCompletedWords();
  updateProgress();
}

function clearAnswers() {
  board.querySelectorAll("input").forEach((input) => {
    input.value = "";
    input.readOnly = false;
    input.parentElement.classList.remove("correct", "wrong", "locked");
  });
  document.querySelectorAll(".clues li").forEach((item) => item.classList.remove("completed"));
  updateProgress();
}

function validateCell(input) {
  const cell = input.parentElement;
  cell.classList.remove("correct", "wrong");
  if (!input.value) return;
  cell.classList.add(input.value === input.dataset.answer ? "correct" : "wrong");
}

function updateCompletedWords() {
  board.querySelectorAll("input").forEach((input) => {
    input.readOnly = false;
    input.parentElement.classList.remove("locked");
  });

  puzzles[currentPuzzle].words.forEach((word) => {
    const inputs = getWordInputs(word);
    const completed = inputs.every((input) => input.value === input.dataset.answer);
    const clue = document.querySelector(`.clues li[data-word-id="${word.id}"]`);
    clue?.classList.toggle("completed", completed);

    if (completed) {
      inputs.forEach((input) => {
        input.readOnly = true;
        input.parentElement.classList.add("correct", "locked");
      });
    }
  });
}

function getWordInputs(word) {
  return [...word.answer].map((_, index) => {
    const row = word.row + (word.dir === "down" ? index : 0);
    const col = word.col + (word.dir === "across" ? index : 0);
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  });
}

function updateProgress() {
  const inputs = [...board.querySelectorAll("input")];
  const correct = inputs.filter((input) => input.value === input.dataset.answer).length;
  const percent = inputs.length ? Math.round((correct / inputs.length) * 100) : 0;
  progressText.textContent = `${percent}%`;
}

function cellKey(row, col) {
  return `${row},${col}`;
}

renderPuzzle();
