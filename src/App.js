import React, { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';
import axios from 'axios';

const App = () => {
  const { instance, accounts } = useMsal();
  const [groups, setGroups] = useState([]);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // State to hold the message input

  const handleLogin = () => {
    setLoading(true);
    instance.loginPopup(loginRequest)
      .then(response => {
        // Set the active account after login
        instance.setActiveAccount(response.account);

        return instance.acquireTokenSilent({
          account: response.account, // Use the account from the login response
          scopes: ["https://www.yammer.com/.default"]
        });
      })
      .then(tokenResponse => {
        const accessToken = tokenResponse.accessToken;
        setToken(accessToken)

        // Fetch the list of Yammer groups through the proxy server
        return axios.get('http://localhost:5000/yammer/groups', {
          params: {
            accessToken: accessToken
          }
        });
      })
      .then(response => {
        setGroups(response.data);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  };

  const handlePostMessage = (groupId) => {

    const accessToken = token;
    // console.log(accessToken);

    axios.post('http://localhost:5000/yammer/post', {
      accessToken: accessToken,
      body: message,
      group_id: groupId
    })
      .then(response => {
        alert(`Message posted to group ${groupId}: ${message}`);
      })
      .catch(error => {
        console.error('Error posting message:', error.response ? error.response.data : error.message);
      });
  };

  const handleLogout = () => {
    instance.logoutPopup().catch(e => {
      console.error(e);
    });
  };

  return (
    <div className="App">
      {accounts.length > 0 ? (
        <div className="content-box">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
          {loading ? (
            <p className="loading-text">Loading groups...</p>
          ) : (
            <ul className="group-list">
              {groups.map(group => (
                <li key={group.id} className="group-item">
                  <div className="group-info">
                    <span className="group-name">{group.full_name}</span>
                    <input
                      type="text"
                      className="message-input"
                      placeholder="Enter your message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <button
                      className="post-button"
                      onClick={() => handlePostMessage(group.id)}
                    >
                      Post
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="content-box">
          <button className="login-button" onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );

};

export default App;
