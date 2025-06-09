const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

// Must first load the models
require('./models/user');

const routes = require('./routes');
const {auth, googleAuth} = require('./lib/tma_auth');

/**
 * -------------- GENERAL SETUP ----------------
 */

module.exports.setup = function setup(app) {
    // Instead of using body-parser middleware, use the new Express implementation of the same thing
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    // Allows our Angular application to make HTTP requests to Express application
    app.use(cors({
        origin: 'https://web.route.cab',
        credentials: true,
    }));
    app.use(auth);
    app.use((req, res, next) => {
        // res.append('Access-Control-Allow-Origin', ['*']);
        // res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.append('Access-Control-Allow-Headers', 'Content-Range');
        res.append('Access-Control-Expose-Headers', 'Content-Range');
        next();
    });
    // Where Angular builds to - In the ./angular/angular.json file, you will find this configuration
    // at the property: projects.angular.architect.build.options.outputPath
    // When you run `ng build`, the output will go to the ./public directory
    app.use(express.static(path.join(__dirname, 'public')));
    /**
     * -------------- ROUTES ----------------
     */
    // Imports all of the routes from ./routes/index.js
    app.use(routes);

// Serve a simple HTML page with Google Sign-In button
    app.get('/google/auth', (req, res) => {
        res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="google-signin-client_id" content="${process.env.GOOGLE_CLIENT_ID}">
        <script src="https://apis.google.com/js/platform.js" async defer></script>
    </head>
    <body>
        <div class="g-signin2" data-onsuccess="onSignIn"></div>
        <button onclick="signOut();">Sign out</button>
        <script>
            function onSignIn(googleUser) {
                const profile = googleUser.getBasicProfile();
                const id_token = googleUser.getAuthResponse().id_token;
                // Store Google token in localStorage
            localStorage.setItem('googleToken', id_token);
                // Send the token to your backend
                fetch('/auth/google', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({token: id_token })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    document.body.innerHTML = '<h1>Welcome, ' + data.name + '!</h1><img src="' + data.picture + '" style="width: 100px; border-radius: 50%;"><p>Email: ' + data.email + '</p>';
                });
            }
            
            function signOut() {
                const auth2 = gapi.auth2.getAuthInstance();
                                localStorage.removeItem('googleToken');
                auth2.signOut().then(() => {
                    console.log('User signed out.');
                    location.reload();
                });
            }
        </script>
    </body>
    </html>
  `);
    });

// Verify Google token endpoint
    app.post('/auth/google', async (req, res) => {
        const {token} = req.body;
        try {
            const user = await googleAuth(token)
            const userJwt = jwt.sign(
                {...user, token: token},
                process.env.JWT_SECRET,
                {expiresIn: '1h'}
            );

            // 3. Set it as HttpOnly cookie
            // res.cookie('token', userJwt, {
            //     httpOnly: true,
            //     secure: true,
            //     sameSite: 'None',
            //     domain: 'route.cab', // ensures cookie works on both web.route.cab and api.route.cab
            //     maxAge: 600 * 1000, // 1 hour
            // });
            res.json({
                success: true,
                token: userJwt,
                user: user
            });

        } catch (error) {
            console.error('Error verifying token:', error);
            res.status(401).json({success: false, error: 'Invalid token'});
        }
    });
};
