const socket = io();

const chatMessages = document.querySelector('.chat-container');
const startButton = document.getElementById('start');

// メッセージを画面に追加
function addMessage(message, type = 'system') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// マッチング許可
document.getElementById('allow').addEventListener('click', () => {
    socket.emit('allowMatching');
});

// マッチング許可解除
document.getElementById('disallow').addEventListener('click', () => {
    socket.emit('disallowMatching');
});

// マッチング待ち人数
document.getElementById('count').addEventListener('click', () => {
    socket.emit('getCount');
});

// サーバーから人数を受け取る
socket.on('countResponse', (count) => {
    addMessage(`現在のマッチング待ち人数: ${count}人`);
    startButton.disabled = count < 2;
});

// マッチング開始
startButton.addEventListener('click', () => {
    socket.emit('startMatching');
});

// サーバーからのメッセージを受信
socket.on('message', (message) => {
    addMessage(message);
});
