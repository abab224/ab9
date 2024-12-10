const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());

let users = {}; // マッチング許可状態の管理

// ランダムパスワード生成
function generatePassword() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    const number = Math.floor(1000 + Math.random() * 9000); // 4桁のランダム数字
    return `${letter}${number}`;
}

// クライアント接続時
io.on('connection', (socket) => {
    console.log('ユーザー接続:', socket.id);

    // マッチング許可
    socket.on('allowMatching', () => {
        users[socket.id] = socket.id;
        console.log('許可:', users);
    });

    // マッチング許可解除
    socket.on('disallowMatching', () => {
        delete users[socket.id];
        console.log('解除:', users);
    });

    // マッチング待ち人数
    socket.on('getCount', () => {
        const count = Object.keys(users).length;
        socket.emit('countResponse', count);
    });

    // マッチング開始
    socket.on('startMatching', () => {
        const availableUsers = Object.keys(users).filter((id) => id !== socket.id);
        if (availableUsers.length > 0) {
            const partnerId = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            const password = generatePassword();

            // マッチングメッセージを送信
            io.to(socket.id).emit('matchingResult', { success: true, partner: partnerId });
            io.to(partnerId).emit('matchingResult', { success: true, partner: socket.id });

            // DMで詳細を送信
            io.to(socket.id).emit('dm', `マッチングに成功しました！\nURL: https://ab7.onrender.com\nパスワード: ${password}`);
            io.to(partnerId).emit('dm', `マッチングに成功しました！\nURL: https://ab7.onrender.com\nパスワード: ${password}`);

            // 状態リセット
            delete users[socket.id];
            delete users[partnerId];
        } else {
            socket.emit('matchingResult', { success: false });
        }
    });

    // ユーザー切断時
    socket.on('disconnect', () => {
        delete users[socket.id];
        console.log('切断:', socket.id);
    });
});

// サーバー起動
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`サーバー起動: http://localhost:${PORT}`);
});
