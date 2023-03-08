import React, { useState, useEffect } from 'react';
import { UserAgentApplication } from 'msal';
import { useNavigate  } from 'react-router-dom';
import { msalInstance } from '../state';

export function loginFunction() {
  var [user, setUser] = useState(null);
      const navigate = useNavigate();
  
    useEffect(() => {
      const getUser = async () => {
        try {
          const response = await msalInstance.acquireTokenSilent({
            scopes: ['https://graph.microsoft.com/user.read'],
          });
          const user = await msalInstance.getAccount();
          setUser(user);
          console.log(response);
        } catch (error) {
          console.log(error);
        }
      };
  
      getUser();
    }, []);
}

