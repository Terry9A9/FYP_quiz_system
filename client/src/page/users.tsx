/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var fetchLoginData = require('../fetchLoginData');

var { GRAPH_ME_ENDPOINT } = require('../authConfig');

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

async function IDpage (req, res, next) {
    isAuthenticated(req, res, next);
    const idTokenClaims = req.session.account.idTokenClaims;
    if (!idTokenClaims) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }else {
        return (
            <>
                <h1>Azure AD</h1>
                <h3>ID Token</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>{idTokenClaims.email}</td>
                            <td>{idTokenClaims.name}</td>
                        </tr>
                    </tbody>
                </table>
                <div>
                <a href="/">Go back</a>
                </div>
                </>
        )
    };
};

export default IDpage;
