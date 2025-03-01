import React, { useState, useEffect, useCallback } from 'react';
import TaskManager from './TaskManager';
import { createUser, setAuthToken } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  const handleCredentialResponse = useCallback(async (response) => {
    const credential = response.credential;
    setAuthToken(credential);
    
    try {
      const decodedToken = JSON.parse(atob(credential.split('.')[1]));
      const res = await createUser({
        email: decodedToken.email,
        name: decodedToken.name
      });
      setUser(res.data);
    } catch (error) {
      console.error('Error creating user:', error);
      // You might want to show an error message to the user here
    }
  }, []);

  const renderGoogleSignInButton = useCallback(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: '564507615020-5a6gc9r1qn4sp1qjontrjh214list2bn.apps.googleusercontent.com',
        callback: handleCredentialResponse
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { 
          theme: 'outline', 
          size: 'large',
          width: 250,
          text: 'signin_with'
        }
      );
    }
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (!user) {
      renderGoogleSignInButton();
    }
  }, [user, renderGoogleSignInButton]);

  const handleSignOut = () => {
    setUser(null);
    setAuthToken(null);
    // Clear any Google Sign-In state
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <div className="App">
      {user ? (
        <div className="task-manager-container">
          <div className="user-info">
            <h2>Welcome, {user.name}</h2>
            <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
          </div>
          <TaskManager />
        </div>
      ) : (
        <div className="welcome-container">
          <h1>Welcome to To-Do List App</h1>
          <p>Sign in to manage your tasks</p>
          <div id="googleSignInDiv" align="center"></div>
        </div>
      )}
    </div>
  );
}

export default App;
