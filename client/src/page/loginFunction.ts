import * as msal from "@azure/msal-browser";
import { UserAgentApplication } from "msal";

const msalConfig = {
  auth: {
    clientId: 'a0c66418-c902-439e-8bdb-1b35ed3b261d',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:5173/auth/callback',
  },
    cache: {
      cacheLocation: "sessionStorage" as 'localstorage',
      storeAuthStateInCookie: true,
    },
  };

// Create a new MSAL instance
export const msalInstance = new msal.PublicClientApplication(msalConfig);


export async function handleLogin () {
  try {
    await msalInstance.handleRedirectPromise();

    let account = msalInstance.getActiveAccount();
    if (!account) {
      // If there is no active account, open the login popup
      while (true) {
        const result = await msalInstance.loginPopup();
        if (result.account) {
          account = result.account;
          break;
        } else {
          // Exit the loop if the user closes the popup without authenticating
          break;
        }
      }
    }

    if (account) {
      // Use the authorization code to obtain an access token
      const tokenResult = await msalInstance.acquireTokenSilent({
        scopes: ['user.read'],
        account: account
      });

      // Use the access token to authenticate the user and access their Microsoft account information
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`
        }
      });
      const user = await response.json();
      // Store the login data in the localStorage
      localStorage.setItem("loginData", JSON.stringify(tokenResult));
      console.log("The token result of login is:", JSON.stringify(tokenResult.accessToken));
      return user;

    }
  } catch (error) {
    console.error(error);
  }
}

export const handleLogout = async () => {
  try {
    await msalInstance.logout();
  } catch (error) {
    console.error(error);
  }
};

export const getUserData = async () => {
  //get the session data from local storage
  var loginData = localStorage.getItem('loginData');

  if (loginData) {
      try {
          await msalInstance.handleRedirectPromise();
  
          // get and set active account.
          const account = msalInstance.getActiveAccount();
          msalInstance.setActiveAccount(account);
  
          // Check if the user is already logged in
          const accounts = await msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            // Use the access token to retrieve the user's profile information
            const tokenResult = await msalInstance.acquireTokenSilent({
              account: accounts[0],
              scopes: ['user.read']
            })
  
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`
              }
            });
            const user = await response.json();
            return user;
          }
    } catch (error) {
      console.error(error);
    }
  }
};