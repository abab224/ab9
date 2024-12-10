const socket = io('http://localhost:3000'); // サーバーURL

const chatMessages = document.getElementById('chatMessages');

// メッセージを画面に追加
function addMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system';
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// マッチング許可
document.getElementById('allow').addEventListener('click', () => {
    socket.emit('allowMatching');
    addMessage('マッチングを許可しました。');
});

// マッチング許可解除
document.getElementById('disallow').addEventListener('click', () => {
    socket.emit('disallowMatching');
    addMessage('マッチング許可を解除しました。');
});

// マッチング待ち人数
document.getElementById('count').addEventListener('click', () => {
    socket.emit('getCount');
});

// サーバーから人数を受け取る
socket.on('countResponse', (count) => {
    if (count < 2) {
        addMessage('現在マッチング許可人数が2人未満です。');
    } else {
        addMessage(`現在のマッチング待ち人数: ${count}人`);
    }
});

// マッチング開始
document.getElementById('start').addEventListener('click', () => {
    socket.emit('startMatching');
});

// マッチング結果を受け取る
socket.on('matchingResult', (result) => {
    if (result.success) {
        addMessage(`マッチング成功！相手: ${result.partner}`);
        addMessage(`DMを確認してください！`);
    } else {
        addMessage('現在マッチング許可人数が2人未満です。');
    }
});
