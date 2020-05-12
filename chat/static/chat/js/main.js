const host = window.location.host;
loadMessages();
const maxInputMessageLength = 64;
const userName = document.querySelector('#greeting').innerHTML.split(',')[1].trim();
const inputMessage = document.querySelector('#chat-message-input');
const chatWindow = document.querySelector('#chat-window');
const submitButton = document.querySelector('#chat-message-submit');


let chatSocket = new WebSocket(
    'ws://' + host + '/ws/api/chat/pretty_chat/'
);

chatSocket.onmessage = function (event) {
    let data = JSON.parse(event.data);
    let message = data['message'];
    let nickname = data['nickname'];
    let type = data['type'];
    let recipients = data['recipients'];

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
    chatSocket.send(JSON.stringify({
        'message': message,
        'nickname': userName
    }));
    saveMessage(message);
    inputMessage.value = '';
};


let tribute = new Tribute({
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
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
          var data = JSON.parse(xhr.response)['data'];
        cb(data);
      } else if (xhr.status === 403) {
        cb([]);
      }
    }
  };
  xhr.open("GET", "http://" + host + "/api/users/",true);
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

    let newParagraph = document.createElement("p");

    let newFirstSpan = document.createElement("span");
    newFirstSpan.setAttribute("id", "nickname");
    newFirstSpan.innerHTML = nickname + ': ';

    let newSecondSpan = document.createElement("span");
    newSecondSpan.setAttribute("id", "message");
    newSecondSpan.innerHTML = message;
    newSecondSpan.style.cssText = 'display: inline-block';

    newParagraph.appendChild(newFirstSpan);
    newParagraph.appendChild(newSecondSpan);

    newDiv.appendChild(newParagraph);

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
        submitButton.style.cssText = 'background-color: #4CAF50';
        inputMessage.style.cssText = 'border-color: initial; color:black;';
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
