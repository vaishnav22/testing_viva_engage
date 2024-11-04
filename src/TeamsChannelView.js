import React, { useEffect, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

const TeamsChannelView = () => {
    const { instance, accounts } = useMsal();
    const [teams, setTeams] = useState([]);
    const [channels, setChannels] = useState({});

    const fetchTeams = async (accessToken) => {
        try {
          const teamsResponse = await fetch("https://graph.microsoft.com/v1.0/me/joinedTeams", {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          const teamsData = await teamsResponse.json();
          setTeams(teamsData.value);
    
          const channelsData = {};
          for (const team of teamsData.value) {
            const channelsResponse = await fetch(`https://graph.microsoft.com/v1.0/teams/${team.id}/channels`, {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            });
            const channels = await channelsResponse.json();
            channelsData[team.id] = channels.value;
          }
          setChannels(channelsData);
        } catch (error) {
          console.error(error);
        }
    };

    useEffect(() => {
        if (accounts.length > 0) {
          instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
          }).then(response => {
            const accessToken = response.accessToken;
            fetchTeams(accessToken);
          }).catch(error => {
            console.error(error);
          });
        }
    }, [accounts, instance]);

    return (
        <div>
          <h1>Your Teams and Channels</h1>
          {teams.map(team => (
            <div key={team.id}>
              <h2>{team.displayName}</h2>
              <ul>
                {channels[team.id]?.map(channel => (
                  <li key={channel.id}>{channel.displayName}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
    );
};

export default TeamsChannelView;