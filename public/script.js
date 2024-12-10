const socket = io();

const chatMessages = document.getElementById('chatMessages');
const allowButton = document.getElementById('allow');
let isAllowed = false;

// メッセージを画面に追加
function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// マッチング許可・解除ボタンのトグル
allowButton.addEventListener('click', () => {
    if (isAllowed) {
        socket.emit('disallowMatching');
        allowButton.textContent = 'マッチングを許可する';
    } else {
        socket.emit('allowMatching');
        allowButton.textContent = 'マッチングを許可しない';
    }
    isAllowed = !isAllowed;
});

// 他のボタンのイベントリスナー
document.getElementById('count').addEventListener('click', () => {
    socket.emit('getCount');
});

document.getElementById('start').addEventListener('click', () => {
    socket.emit('startMatching');
});

// サーバーからのメッセージを受信
socket.on('message', (message) => {
    addMessage(message);
});
