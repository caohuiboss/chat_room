const express = require('express')
const path = require('path')
const http = require('http')
const app = express()
const socketIO = require('socket.io')
const server = http.createServer(app)
const { formatMessage, userJoin, getCurrentUser, userLeave,
    getRoomUsers } = require('./utils')

const io = socketIO(server)

app.use(express.static(path.join(__dirname, '/public')))

const botName = '小助手'
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room)
        socket.join(user.room)
        // 一对一发送
        socket.emit('message', formatMessage(botName, '欢迎加入课程'))
        // 消息的广播(除了自身以外其他都能收到)
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `欢迎${user.username}加入${user.room}房间`))
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg))
    })

    // 监听客户端是否断开连接（所有）
    socket.on('disconnect', () => {
        const user = userLeave(socket.id)
        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username}离开了房间`))
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    })
})

const PORT = process.env.PORT || 5001
server.listen(PORT, () => {
    console.log('listening 5001')
})