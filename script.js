function login(person) {
    const obj = {name: person.name};
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
        .then(function () {
            inputBox.value = "";
        })
        .catch(function () {
            inputBox.value = "";
            window.location.reload();
        });
    }
}

const messageBox = document.querySelector(".msg-box");
let user = {name: prompt("Qual seu nome?"), messagesID: 1, loginID: 2};

login(user);