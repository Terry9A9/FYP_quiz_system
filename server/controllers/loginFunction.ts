import * as msal from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: 'a0c66418-c902-439e-8bdb-1b35ed3b261d',
    authority: 'https://login.microsoftonline.com/common',
    redirectUri: 'http://localhost:5173/auth/callback',
  },
    cache: {
      cacheLocation: 'localStorage',
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
        const loginRequest = {scopes: ["User.Read"]}
        const result = await msalInstance.loginPopup(loginRequest);

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
        scopes: ['openid','offline_access', 'User.read'],
        account: account,
      });

      // Use the access token to authenticate the user and access their Microsoft account information
      const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${tokenResult.accessToken}`,
          grantType: 'authorization_code'
        }
      });
      const user = await response.json();

      // Store the login data in the localStorage
      localStorage.setItem("loginData", JSON.stringify(tokenResult));

      //send the data to server-side
      const roleRes = await fetch('http://localhost:3004/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idTokenClaims: JSON.stringify(tokenResult.idTokenClaims) , 
          user: JSON.stringify(user) })
      })

      //get and set the role of login user return from server
      const role = await roleRes.json();
      user["role"] = role.role;
      // console.log(`[loginfunction.ts] role: ${JSON.stringify(role.role)}`);
        
      return user;
    }
  } catch (error) {
    console.error(error);
  }
}

export const handleLogout = async () => {
  try {
    await msalInstance.logoutRedirect();
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
              scopes: ['User.read']
            })
            
            const response = await fetch('https://graph.microsoft.com/v1.0/me', {
              headers: {
                Authorization: `Bearer ${tokenResult.accessToken}`
              }
            });
            const user = await response.json();

            const roleRes = await fetch('http://localhost:3004/api/get-role', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                idTokenClaims: tokenResult.idTokenClaims,
              })
            })
            //get and set the role of login user return from server
            const role = await roleRes.json();
            user["role"] = role.role;
            console.log(`[loginfunction.ts] role: ${JSON.stringify(role.role)}`);
      
            return user;
          }
    } catch (error) {
      console.error(error);
    }
  }
};