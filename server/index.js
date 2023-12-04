const express = require('express');
const http = require('http');
const { Server } = require('socket.io')
const cors = require('cors')
const route = require('./route');
const {connectUser, findUser, getRoomUsers, removeUser} = require("./users");

const app = express();

app.use(cors( { origin: "*" }));
app.use(route)

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }
});

io.on('connection', (socket) => {
  socket.on('join', ({ name, room}) => {
    socket.join(room);

    const {user, isExist} = connectUser({name, room})

    let userMessage = isExist ? `${user.name}, here you go again` : `I am your friend, ${user.name}`

      socket.emit('message', {
      data: {
        user: { name: "Admin", message: userMessage }
      }
    })

    socket.on('sendMessage', ({message, params}) => {
      const user = findUser(params);

      if (user) {
        io.to(user.room).emit('message', {data: {user: {...user, message}}})
      }
    })

    socket.on('leftRoom', ({params}) => {
      const user = removeUser(params);

      if (user) {
        const { room, name } = user;
        io.to(room).emit('message', {data: {user: {name: 'Admin', message: `${name} left the room`}}})
        io.to(room).emit('joinRoom', { data: {users: getRoomUsers(user.room)}})
      }
    })

    socket.broadcast.to(user.room).emit('message', {
      data: {
        user: {name: 'Admin', message: `${user.name} has joined`}
      }
    })

    io.to(user.room).emit('joinRoom', { data: {room: user.room, users: getRoomUsers(user.room)}})
  })

  io.on('disconnect', () => {
    console.log('Socket disconnected')
  })
})

server.listen(5005, () => {
  console.log('Server is running');
})