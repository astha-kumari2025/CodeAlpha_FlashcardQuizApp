
const defaultCards = [
    {
        question: "What is HTML?",
        answer: "HTML stands for HyperText Markup Language. It structures content on web pages."
    },
    {
        question: "What is CSS?",
        answer: "CSS stands for Cascading Style Sheets. It styles and layouts web pages."
    },
    {
        question: "What is JavaScript?",
        answer: "JavaScript makes web pages interactive and dynamic."
    },
    {
        question: "What is a variable in programming?",
        answer: "A variable is a named container used to store data."
    },
    {
        question: "What does CPU stand for?",
        answer: "CPU stands for Central Processing Unit. It executes program instructions."
    }
];

const STORAGE_KEY = "flashlearn_cards_v1";

let cards = loadCards();
let currentIndex = 0;
let showingAnswer = false;
let editingIndex = null;

const cardLabel = document.getElementById("cardLabel");
const cardText = document.getElementById("cardText");
const cardHint = document.getElementById("cardHint");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const totalCards = document.getElementById("totalCards");
const currentCard = document.getElementById("currentCard");
const cardList = document.getElementById("cardList");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const cardForm = document.getElementById("cardForm");
const questionInput = document.getElementById("questionInput");
const answerInput = document.getElementById("answerInput");
const addCardBtn = document.getElementById("addCardBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");

function loadCards() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved !== null) {
            const parsed = JSON.parse(saved);

            if (
                Array.isArray(parsed) &&
                parsed.every(card =>
                    card &&
                    typeof card.question === "string" &&
                    typeof card.answer === "string"
                )
            ) {
                return parsed;
            }
        }
    } catch (error) {
        console.error("Could not load saved flashcards:", error);
    }

    return defaultCards.map(card => ({ ...card }));
}

function saveCards() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
        return true;
    } catch (error) {
        console.error("Could not save flashcards:", error);
        alert("Your changes could not be saved in browser storage.");
        return false;
    }
}

function renderCard() {
    const hasCards = cards.length > 0;

    totalCards.textContent = cards.length;
    currentCard.textContent = hasCards
        ? `${currentIndex + 1} / ${cards.length}`
        : "0 / 0";

    prevBtn.disabled = !hasCards || currentIndex === 0;
    nextBtn.disabled = !hasCards || currentIndex === cards.length - 1;

    prevBtn.style.opacity = prevBtn.disabled ? "0.5" : "1";
    nextBtn.style.opacity = nextBtn.disabled ? "0.5" : "1";

    if (!hasCards) {
        cardLabel.textContent = "NO FLASHCARDS";
        cardText.textContent = "Your learning journey starts here!";
        cardHint.textContent = "Add a flashcard to get started.";
        showAnswerBtn.classList.add("hidden");
        renderCardList();
        return;
    }

    const card = cards[currentIndex];

    cardLabel.textContent = showingAnswer ? "ANSWER" : "QUESTION";
    cardText.textContent = showingAnswer ? card.answer : card.question;
    cardHint.textContent = showingAnswer
        ? "Great! Ready for the next card?"
        : "Think about your answer first!";

    showAnswerBtn.textContent = showingAnswer
        ? "Show Question"
        : "Show Answer";

    showAnswerBtn.classList.remove("hidden");

    renderCardList();
}

function renderCardList() {
    cardList.replaceChildren();

    if (cards.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "No cards yet. Click + Add Flashcard to create one.";
        cardList.appendChild(empty);
        return;
    }

    cards.forEach((card, index) => {
        const item = document.createElement("article");
        item.className = "saved-card";

        const question = document.createElement("h3");
        question.textContent = `${index + 1}. ${card.question}`;

        const answer = document.createElement("p");
        answer.textContent = card.answer;

        const actions = document.createElement("div");
        actions.className = "card-actions";

        const studyBtn = document.createElement("button");
        studyBtn.type = "button";
        studyBtn.textContent = "Study";
        studyBtn.addEventListener("click", () => {
            currentIndex = index;
            showingAnswer = false;
            renderCard();
            document.getElementById("flashcard").scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => openEditModal(index));

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", () => deleteCard(index));

        actions.append(studyBtn, editBtn, deleteBtn);
        item.append(question, answer, actions);
        cardList.appendChild(item);
    });
}

function openAddModal() {
    editingIndex = null;
    modalTitle.textContent = "Add a Flashcard";
    cardForm.reset();
    modal.classList.remove("hidden");
    questionInput.focus();
}

function openEditModal(index) {
    editingIndex = index;
    modalTitle.textContent = "Edit Flashcard";
    questionInput.value = cards[index].question;
    answerInput.value = cards[index].answer;
    modal.classList.remove("hidden");
    questionInput.focus();
}

function closeModal() {
    modal.classList.add("hidden");
    cardForm.reset();
    editingIndex = null;
}

function deleteCard(index) {
    const confirmed = confirm(
        `Are you sure you want to delete flashcard ${index + 1}?`
    );

    if (!confirmed) return;

    const previousCards = cards;
    cards = cards.filter((_, i) => i !== index);

    if (!saveCards()) {
        cards = previousCards;
        return;
    }

    if (cards.length === 0) {
        currentIndex = 0;
    } else if (index < currentIndex) {
        currentIndex--;
    } else if (currentIndex >= cards.length) {
        currentIndex = cards.length - 1;
    }

    showingAnswer = false;
    renderCard();
}

showAnswerBtn.addEventListener("click", () => {
    if (cards.length === 0) return;

    showingAnswer = !showingAnswer;
    renderCard();
});

prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        showingAnswer = false;
        renderCard();
    }
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        showingAnswer = false;
        renderCard();
    }
});

addCardBtn.addEventListener("click", openAddModal);
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
    }
});

cardForm.addEventListener("submit", event => {
    event.preventDefault();

    const question = questionInput.value.trim();
    const answer = answerInput.value.trim();

    if (!question || !answer) {
        alert("Please enter both a question and an answer.");
        return;
    }

    const previousCards = cards;
    const wasEditing = editingIndex !== null;

    if (wasEditing) {
        cards = cards.map((card, index) =>
            index === editingIndex
                ? { question, answer }
                : card
        );
    } else {
        cards = [...cards, { question, answer }];
    }

    if (!saveCards()) {
        cards = previousCards;
        return;
    }

    if (wasEditing) {
        currentIndex = editingIndex;
    } else {
        currentIndex = cards.length - 1;
    }

    showingAnswer = false;
    closeModal();
    renderCard();
});

renderCard();
