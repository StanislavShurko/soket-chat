const {trimStr} = require('./helper')
let users = [];

const connectUser = (user) => {
  const existedUser = findUser(user)

  !existedUser && users.push(user);

  const currentUser = existedUser || user;

  return {isExist: !!existedUser, user: currentUser}
}

const findUser = (user) => {
  const userName = trimStr(user.name);
  const userRoom = trimStr(user.room);

  return users.find((u) => trimStr(u.name) === userName && trimStr(u.room) === userRoom);
}

const getRoomUsers = (room) => {
  return users.filter((user) => user.room === room);
}

const removeUser = (user) => {
  const foundUser = findUser(user);

  if (foundUser) {
    users = users.filter(({room, name}) => room === foundUser.room && name !== foundUser.name)
  }

  return foundUser;
}

module.exports = {connectUser, findUser, getRoomUsers, removeUser};