import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header/Header';
import { Body } from './components/Body/Body';
import axios from 'axios';
import { useAuthStore, useMemberStore } from './store/store';
import { useEffect, useContext } from 'react';
import ChatApp from './components/ChatApp/ChatApp';
import { ChatsProvider } from './Context/ChatsContext';
import { host } from './config/config';

axios.defaults.withCredentials = true;

function App() {
  const { setLoginID } = useAuthStore();
  const {setMembers} = useMemberStore();
  
  useEffect(() => {
    setLoginID(sessionStorage.getItem("loginID"));
    axios.get(`http://${host}/members/selectAll`)
      .then((resp) => {
        setMembers(resp.data);
        console.log('Fetched Members:', resp.data);
      })
  }, [setMembers]); // 의존성 배열에 setMembers 추가

  return (
    <ChatsProvider>
      <Router>
        <div className="container">
          <Header />
          <Body />
          <ChatApp></ChatApp>
        </div>
      </Router>

    </ChatsProvider>
  );
}

export default App;
