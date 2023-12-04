import React, {useEffect, useState} from 'react';
import io from 'socket.io-client';
import {useLocation, useNavigate} from "react-router-dom";
import styles from '../styles/Chat.module.css'
import EmojiPicker from "emoji-picker-react";
import Messages from "./Messages";

const socket = io.connect('http://localhost:5005');

const Chat = () => {
  const [state, setState] = useState([]);
  const navigate = useNavigate();
  const {search} = useLocation();
  const [params, setParams] = useState({room: '', user: ''});
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [usersAmount, setUsersAmount] = useState(0);

  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search));
    setParams(searchParams);
    socket.emit("join", searchParams);
  }, [search]);

  useEffect(() => {
    socket.on('message', ({data}) => {
      setState((_state) => [..._state, data])
    })
  }, [])

  useEffect(() => {
    socket.on('joinRoom', ({data}) => {
      setUsersAmount(data.users.length);
    })
  }, [])

  const leftRoom = (e) => {
    socket.emit('leftRoom', {params})
    navigate('/');
  }

  const handleChange = ({ target: { value } }) => setMessage(value);

  const onEmojiClick = ({emoji}) => {
    setMessage(`${message}${emoji}`)
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message) return;

    socket.emit('sendMessage', {message, params})

    setMessage('');
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.title}>
          {params.room}
        </div>
        <div>
          {usersAmount} users in this room
        </div>
        <button className={styles.left} onClick={leftRoom}>
          Left the room
        </button>
      </div>
      <div className={styles.messages}>
        <Messages messages={state} name={params.name}></Messages>
      </div>
      <form action="" className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.input}>
          <input
            autoComplete={"off"}
            type="text"
            name={"message"}
            placeholder={"Message..."}
            value={message}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.emoji}>
          <div className={styles.button} onClick={() => setIsOpen(!isOpen)}>Add emoji</div>
          {isOpen &&
            <div className={styles.emojies}>
              <EmojiPicker onEmojiClick={onEmojiClick}></EmojiPicker>
            </div>
          }
        </div>

        <div className={styles.button}>
          <input type="submit" value={"Send message"} onSubmit={handleSubmit}/>
        </div>
      </form>
    </div>
  );
};

export default Chat;