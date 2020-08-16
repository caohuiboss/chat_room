const socket = io()
const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.querySelector('#room-name')
const userList = document.querySelector('#users')

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })
// console.log(username, room )

// join room
socket.emit('joinRoom', { username, room })

socket.on('roomUsers', ({ room, users }) => {
    outRoomName(room)
    outRoomUsers(users)
})

socket.on('message', (msg) => {
    // console.log(msg)
    outPutMessage(msg)
    chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = e.target.elements.msg.value
    socket.emit('chatMessage', msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})

function outPutMessage({ username, text, time }) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `
    <p class="meta"> ${username}<span> ${time}</span></p>
    <p class="text">
      ${text}
    </p>
    `
    chatMessages.appendChild(div)
}

function outRoomName(room) {
    roomName.innerHTML = room
}
function outRoomUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}