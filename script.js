function login() {
    user.name = document.querySelector(".load > input").value;
    const obj = {name: user.name};
    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants", obj);
    promise.then(startLoadingMessages).catch(showErrorMessages);
}

function startLoadingMessages() {
    loadMessages();
    user.messagesID = setInterval(loadMessages, 3000);
    user.loginID = setInterval(pingLogin, 4000);
}

function loadMessages() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/messages");
    promise.then(showAllMessages);
}

function showAllMessages(response) {
    const messagesList = response.data;
    messageBox.innerHTML = "";

    for (let i = 0; i < messagesList.length; i++) {
        if (messageIsToMe(messagesList[i])) {
            renderMessage(messagesList[i].type, messagesList[i].time, messagesList[i].from, messagesList[i].to, messagesList[i].text);
        }
    }
}

function messageIsToMe(message) {
    if (message.type !== "private_message" || message.to === user.name) {
        return true;
    }

    return false;
}

function renderMessage(type, timeStamp, sender, receiver, message) {
    let aux;

    if (type === "message") {
        aux = "";
        type = "public"
    } else if (type === "private_message") {
        aux = "reservadamente "
        type = "private"
    }

    if (type === "status") {
        messageBox.innerHTML += `
        <div class="msg ${type}">
            <span class="time-stamp">(${timeStamp})</span>
            <span class="sender">${sender}</span>
            <span class="content">${message}</span>
        </div>`;
    } else if (type === "public" || type === "private") {
        messageBox.innerHTML += `
        <div class="msg ${type}">
            <span class="time-stamp">(${timeStamp})</span>
            <span class="sender">${sender}</span>
            <span class="system">${aux}para</span>
            <span class="receiver">${receiver}</span>:
            <span class="content">${message}</span>
        </div>`;        
    } else {
        console.log("Unexpected type.");
    }

    scrollDown();
}

function showErrorMessages(error) {
    messageBox.innerHTML += `
        <div class="msg private">
            <span class="time-stamp">Algo deu errado!</span>
            <span class="sender">ERRO</span>
            <span class="receiver">${error.response.status}</span>:
            <span class="content">essa pessoa já está online!</span>
        </div>`;

    scrollDown();

    user.name = prompt("Este nome já está em uso, qual outro nome você deseja usar?");
    login(user);
}

function scrollDown() {
    messageBox.querySelector(".msg:last-child").scrollIntoView();
}

function pingLogin() {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status", {name: user.name});
}

function sendMessage() {
    const inputBox = document.querySelector(".input-msg input");
    if (inputBox.value !== "") {
        const obj = {
            from: user.name,
            to: "Todos",
            text: inputBox.value,
            type: "message"
        };
        const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/messages", obj);
        promise
            .then(() => {inputBox.value = "";})
            .catch(() => {
                inputBox.value = "";
                window.location.reload();
            });
    }
}

function showHideSideMenu() {
    document.querySelector(".overlay").classList.toggle("hidden");
}

function changeToWho() {
    const toWho = document.querySelector(".to-who");
    if (selectedVisibility.innerText.trim() == "Público") {
        toWho.innerText = `Enviando para ${selectedContact}`;
    } else {
        toWho.innerText = `Enviando para ${selectedContact} (reservadamente)`;
    }
}

function select(element) {
    element.querySelector(".checkmark").classList.remove("hidden");
    const toWho = document.querySelector(".to-who");

    if (document.querySelector(".contacts").contains(element)) {
        if (selectedContact === undefined) {
            selectedContact = element.innerText.trim();
            changeToWho();

            return;
        } else {
            if (selectedContact === element.innerText.trim()) {
                selectedContact = element.innerText.trim();
                changeToWho();

                return;
            }

            const contactsList = document.querySelectorAll(".contacts li");
            for (let i = 0; i < contactsList.length; i++) {
                if (contactsList[i].innerText.trim() === selectedContact) {
                    contactsList[i].querySelector(".checkmark").classList.add("hidden");
                    selectedContact = element.innerText.trim();
                    changeToWho();
                    break;
                }
            }

            return;
        }
    }

    if (selectedVisibility.innerText === element.innerText) {
        return;
    }

    selectedVisibility.querySelector(".checkmark").classList.add("hidden");
    selectedVisibility = element;
    changeToWho();
}

function loadParticipants() {
    const promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(refreshParticipantsList);
}

function refreshParticipantsList(response) {
    const participantsList = document.querySelector(".contacts");
    participantsList.innerHTML = `
    <li onclick="select(this)">
        <div class="name">
            <ion-icon name="people"></ion-icon>Todos
        </div>
        <ion-icon name="checkmark-outline" class="checkmark hidden"></ion-icon></ion-icon>
    </li>`;
    let lastSelected = selectedContact;
    selectedContact = undefined;

    let participant;

    for (let i = 0; i < response.data.length; i++) {
        renderParticipant(response.data[i]);
        participant = participantsList.querySelector("li:last-child");
        if (lastSelected !== undefined && participant.innerText.trim() === lastSelected) {
            select(participant);
        }
    }

    if (selectedContact === undefined) {
        const all = document.querySelector(".contacts li");
        select(all);
        selectedContact = all.innerText.trim();
    }
}

function renderParticipant(participant) {
    const participantsList = document.querySelector(".contacts");

    participantsList.innerHTML += `
    <li onclick="select(this)">
        <div class="name">
            <ion-icon name="person-circle"></ion-icon>${participant.name}
        </div>
        <ion-icon name="checkmark-outline" class="checkmark hidden"></ion-icon></ion-icon>
    </li>`;
}

function hideLogin() {
    document.querySelector(".load").classList.add("hidden");
    login();
}

const messageBox = document.querySelector(".msg-box");
let selectedContact = undefined;
let selectedVisibility = document.querySelector(".visibilities li");

loadParticipants();
let participantsID = setInterval(loadParticipants, 10000);
let user = {name: "dummy", messagesID: 1, loginID: 2};