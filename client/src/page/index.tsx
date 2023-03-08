/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

function signIn (req, res, next) {
    const title = 'MSAL Node & Express Web App';
    const isAuthenticated = req.session.isAuthenticated;
    const username = req.session.account?.username;
    return (
        <div>
          {isAuthenticated ? (
            <div>
                <p>Hi {username}!</p>
                <a href="/users/id">View ID token claims</a>
                <a href="/auth/acquireToken">Acquire a token to call the Microsoft Graph API</a>
                <a href="/auth/signout">Sign out</a>
            </div>
          ) : (
              <div>
                  <p>You are not logged in.</p>
                  <a href="/auth/signin">Sign in</a>
              </div>
          )}
        </div>
      );
    }

export default signIn;
