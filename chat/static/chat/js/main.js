const host = window.location.host;
loadMessages();
const maxInputMessageLength = 64;
const userName = document.querySelector('#greeting').innerHTML;
const inputMessage = document.querySelector('#chat-message-input');
const chatWindow = document.querySelector('.chat-window');
const submitButton = document.querySelector('#chat-message-submit');
const usersList = document.querySelector('.users');

var users = [];


let chatSocket = new WebSocket(
    'ws://' + host + '/ws/api/chat/pretty_chat/'
);

chatSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    let message = data['message'];
    let nickname = data['nickname'];
    let type = data['type'];
    let recipients = data['recipients'];
    let allUsers = data['all_users'];
    let onlineUsers = data['online_users'];

    for (let i = 0; i < allUsers.length; i++) {
        let user = allUsers[i];
        if (!users.includes(user) && user !== userName) {
            appendUser(user);
            users.push(user)
        }
        if (onlineUsers.includes(user)) {
            setUserOnline(user)
        } else {
            setUserOffline(user)
        }
    }


    if (type === 'information' && userName !== nickname) {
        let informationDom = buildInfo(nickname, message);
        chatWindow.appendChild(informationDom);
    } else if (type === 'message') {
        var messageDom = buildMessage(nickname, message, recipients);
        chatWindow.appendChild(messageDom);
    }

    if (type === 'message' && recipients.includes(userName)) {
        messageDom.style.cssText = 'font-style:italic;';
        sendToast(
            "We have new message for you!",
            "linear-gradient(to right, #00b09b, #96c93d)",
            5000
        );
    }
    scrollDown()
};

chatSocket.onclose = function () {
    console.error('Chat socket closed!')
};


inputMessage.focus();
inputMessage.onkeyup = function (event) {
    if (event.keyCode === 13) {
        submitButton.click()
    }
};
inputMessage.addEventListener('input', checkMessageLength);
inputMessage.maxLength = maxInputMessageLength;


submitButton.onclick = function () {
    let message = inputMessage.value;
    if (message.replace(/\s/g, '').length > 0) {
        chatSocket.send(JSON.stringify({
            'message': message,
            'nickname': userName
        }));
        saveMessage(message);
        inputMessage.value = '';
    }
};


let tribute = new Tribute({
    menuContainer: document.getElementsByClassName('suggestion')[0],
    positionMenu: false,
    menuItemLimit: 3,
    values: function (text, cb) {
        remoteUsersSearch(text, users => cb(users));
    },
});
tribute.attach(inputMessage);


function saveMessage(message) {
    let json = JSON.stringify({
        text: message
    });

    let request = generateRequest('POST', '/api/dialog/');
    request.send(json);
}

function loadMessages() {
    let request = generateRequest('GET', '/api/dialog/');
    request.send();

    request.onload = function () {
        let messages = JSON.parse(request.response)['data'];
        for (let i = 0; i < messages.length; i++) {
            let nickname = messages[i].user.username;
            let message = messages[i].text;
            let messageDom = buildMessage(nickname, message);
            chatWindow.appendChild(messageDom);
        }
        scrollDown();
    };

    request.onerror = function () {
        console.error(request.error)
    };

}

function remoteUsersSearch(text, cb) {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.response)['data'];
                cb(data);
            } else if (xhr.status === 403) {
                cb([]);
            }
        }
    };
    xhr.open("GET", "http://" + host + "/api/users/", true);
    xhr.send();
}

function generateRequest(method, url, async = true) {
    let csrfToken = getCookie('csrftoken');
    let request = new XMLHttpRequest();

    request.open(method, 'http://' + host + url, async);
    request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    request.setRequestHeader('X-CSRFToken', csrfToken);
    return request
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function scrollDown() {
    chatWindow.scrollTop = chatWindow.scrollHeight - chatWindow.clientHeight;
}

function buildMessage(nickname, message, recipients) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("id", "message");

    let nickName = document.createElement("span");
    nickName.setAttribute("id", "nickname");
    nickName.innerHTML = nickname + ':';

    let messsageSpan = document.createElement("span");
    messsageSpan.setAttribute("id", "msg");
    messsageSpan.innerHTML = message;
    messsageSpan.style.cssText = 'display:inline-block';
    if (nickname === userName) {
        messsageSpan.style.cssText += 'margin-left: auto;';
        newDiv.appendChild(messsageSpan);

        let img = document.createElement("img");
        img.setAttribute("class", "avatar");
        img.setAttribute("alt", "Italian Trulli");
        img.src = 'https://picsum.photos/seed/picsum/40/40';
    } else {
        newDiv.appendChild(nickName);
        newDiv.appendChild(messsageSpan);
    }

    return newDiv
}

function buildInfo(nickname, message) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("id", "information");


    let newParagraph = document.createElement("p");
    newParagraph.setAttribute("id", "info-paragraph");
    newParagraph.style.cssText = 'text-align:center;';
    newParagraph.innerHTML = nickname + ' ' + message;

    newDiv.appendChild(newParagraph);

    return newDiv
}

function checkMessageLength(event) {
    if (inputMessage.value.length > maxInputMessageLength) {
        submitButton.disabled = true;
        submitButton.style.cssText = 'background-color: #bbbbbb';
        console.error("The message won't save. Too long.");
        inputMessage.style.cssText = 'border-color: red; border-radius: 3px; color:red';
        sendToast(
            "The message won't save. Too long.",
            "linear-gradient(to right, #F16546, #F83C13)",
            3000,
        )
    } else {
        submitButton.disabled = false;
        inputMessage.style.cssText = 'color:black;';
    }
}

function sendToast(text, color, time = 5000, position = 'right', stopOnFocus = true) {
    let options = {
        text: text,
        duration: time,
        position: position,
        stopOnFocus: stopOnFocus,
        backgroundColor: color,
    };

    let myToast = Toastify(options);
    myToast.showToast();
}

function appendUser(user) {
    let newUser = document.createElement('div');
    newUser.setAttribute('class', 'user-data');

    let img = document.createElement('img');
    img.src = "https://picsum.photos/seed/picsum/40/40";
    img.setAttribute('class', 'avatar');
    img.style.cssText = 'border-color:#ffffff;';

    let userName = document.createElement('div');
    userName.innerHTML = user;
    userName.setAttribute('class', 'user-name');

    newUser.appendChild(img);
    newUser.appendChild(userName);

    usersList.appendChild(newUser);
}


function findUserAvatar(user) {
    let currentUser;
    let users = document.getElementsByClassName('user-name');

    for (var i = 0; i < users.length; i++) {
        if (users[i].textContent === user) {
            currentUser = users[i];
            break;
        }
    }
    return currentUser.parentNode.getElementsByTagName('img')[0];
}

function setUserOnline(user) {
    let img = findUserAvatar(user);
    img.style.cssText = 'border-color:#4CAF50;';
}

function setUserOffline(user) {
    let img = findUserAvatar(user);
    img.style.cssText = 'border-color:#ffffff;';
}