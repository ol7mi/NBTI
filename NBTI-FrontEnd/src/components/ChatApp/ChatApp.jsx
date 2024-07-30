
import { Routes, Route, BrowserRouter as Router, Outlet, Link } from 'react-router-dom';

import Chat from './Chat/Chat';
import Home from './Home/Home';
import axios from 'axios';
import styles from './ChatApp.module.css';
import { ChatsContext } from '../../Context/ChatsContext';
import { useContext } from 'react';
import { useEffect } from 'react';
import { useAuthStore } from './../../store/store';
axios.defaults.withCredentials = true;

const ChatApp = ({websocketRef}) => {
    const { chatAppRef,chatNavi,ws,setChatNavi} = useContext(ChatsContext);
    const { loginID } = useAuthStore;
    ws.current=websocketRef.current;
    useEffect(()=>{
        if(loginID!==null){
          setChatNavi('chat');
          console.log("chat");
        }
    },[loginID])
 
    if(chatNavi===''){
        return false;
    }
    return (
      

        <div className={styles.container} ref={chatAppRef}>
            {chatNavi==='home' && <Home/>}
            {chatNavi==='chat' && <Chat/>}
        </div>
    );

}

export default ChatApp;