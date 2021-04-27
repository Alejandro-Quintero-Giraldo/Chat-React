
import './App.css';
import React, { useEffect, useRef, useState } from "react";

import firebase from 'firebase/app';
import "firebase/firestore";
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyA39X_WdIBENbw2vJBTjZGjckHyCxSpzug",
  authDomain: "chat-alejo-team.firebaseapp.com",
  projectId: "chat-alejo-team",
  storageBucket: "chat-alejo-team.appspot.com",
  messagingSenderId: "699546108857",
  appId: "1:699546108857:web:5d6e223a3156454060ec68",
});

const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header>
        <h1>Sofka - Chat</h1>
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function ChatRoom() {
  const messageRef = firestore.collection("messages");
  const query = messageRef.orderBy("createdAt").limitToLast(30);
  const [messages] = useCollectionData(query, { idField: 'id' });
  const dummy = useRef();

  const [formValue, setFormValue] = useState('');

  useEffect(()=> {
    dummy.current.scrollIntoView({behavior: 'smooth'})
  });
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL, displayName } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      displayName,
      photoURL,
    });
    setFormValue('');
  };
  return (
  <main>
    <div className="messages">
      {messages && messages.map((msn) => <ChatMessage key={msn.id} message={msn} />)}

      
    </div>
    <div>
      <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => {
            setFormValue(e.target.value);
          }}
            placeholder="Escribe aquí"
          />
          <button type="submit" disabled={!formValue}>Send</button>
      </form>
      <SignOut />
    </div>
    <span ref={dummy}></span>
  </main>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, displayName } = message;

  const messageOrderClass = uid === auth.currentUser.uid ? "send" : "received";

  return (<div  className="messageSend" children={"message " + messageOrderClass}>
    <img src={photoURL} alt={"avatar"} /><br/>
    <small>{displayName}</small>
    <p>{text}</p>
  </div>
  );
}

function SignIn() {
  const singInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return <button onClick={singInWithGoogle}>Sign in with Google</button>
}

function SignOut() {
  return auth.currentUser && (
    <button className="SignOut" onClick={() => {
      auth.signOut();
    }}>Sign out</button>
  );
}
export default App;