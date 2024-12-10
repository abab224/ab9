const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // 静的ファイルの提供

let users = {}; // マッチング許可状態の管理

// ランダムパスワード生成
function generatePassword() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(1000 + Math.random() * 9000); // 4桁のランダム数字
    return `${letter}${number}`;
}

io.on('connection', (socket) => {
    console.log('ユーザー接続:', socket.id);

    // 初期化
    users[socket.id] = { allowMatching: false };
    console.log('現在の状態:', users);

    // マッチング許可
    socket.on('allowMatching', () => {
        users[socket.id].allowMatching = true;
        socket.emit('message', 'マッチングを許可しました。');
        console.log('許可:', users);
    });

    // マッチング許可解除
    socket.on('disallowMatching', () => {
        users[socket.id].allowMatching = false;
        socket.emit('message', 'マッチング許可を解除しました。');
        console.log('解除:', users);
    });

    // マッチング待ち人数
    socket.on('getCount', () => {
        const count = Object.values(users).filter((u) => u.allowMatching).length;
        socket.emit('message', `現在のマッチング待ち人数: ${count}人`);
    });

    // マッチング開始
    socket.on('startMatching', () => {
        const availableUsers = Object.keys(users).filter((id) => id !== socket.id && users[id].allowMatching);

        if (availableUsers.length > 0) {
            const partnerId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            const password = generatePassword();

            io.to(socket.id).emit('message', `マッチングに成功しました！\nURL: https://ab7.onrender.com\nパスワード: ${password}`);
            io.to(partnerId).emit('message', `マッチングに成功しました！\nURL: https://ab7.onrender.com\nパスワード: ${password}`);

            // 状態リセット
            users[socket.id].allowMatching = false;
            users[partnerId].allowMatching = false;

            console.log('マッチング成功:', socket.id, partnerId);
        } else {
            socket.emit('message', '現在マッチング可能なユーザーがいません。');
        }
    });

    // ユーザー切断時
    socket.on('disconnect', () => {
        delete users[socket.id];
        console.log('切断:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`サーバー起動: http://localhost:${PORT}`);
});
