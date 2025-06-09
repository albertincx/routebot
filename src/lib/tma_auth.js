const {OAuth2Client} = require('google-auth-library');
const jwt = require('jsonwebtoken');
const {validate, parse} = require('@telegram-apps/init-data-node');

const {DEV} = require('../config/vars');
const {verifySignature} = require('./login');
const db = require('../api/utils/db');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const validateTmaAuth = (qUStrOrObj = '') => {
    let result = false;
    try {
        let url = new URLSearchParams(qUStrOrObj);
        const auth = url.get('auth');
        url.delete('auth');
        url.delete('ref');
        url.delete('v');
        result = Object.fromEntries(url);

        let isWidget = auth === 'widget';
        const botToken = process.env.TBTKN;

        if (!DEV) {
            if (isWidget) {
                const isValid = verifySignature(result, botToken);
                return isValid && result;
            } else {
                let q = url.toString();
                // console.log(q);
                validate(q, botToken, {expiresIn: 3600});
                // console.log('u');
                return parse(q).user;
            }
        }
    } catch (e) {
        console.log(e);
    }

    return result;
};

const auth = async (req, res, next) => {
    try {
        let authData = (req.headers.authorization || '').split(' ')[1];
        if (authData && !authData.match('user=')) {
            try {
                const userG = jwt.verify(authData, process.env.JWT_SECRET);
                const ticket = await client.verifyIdToken({
                    idToken: userG.token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                req.user = {
                    id: payload.sub,
                    email: payload.email,
                    name: payload.name,
                    picture: payload.picture,
                    google: 1,
                    loginTime: new Date()
                };
                // res.json({message: 'Protected data', user: payload.email});
                // throw new Error('Invalid request!');
                return next();
            } catch (e) {
                //
                res.status(401).json({error: new Error('Invalid request!')});
            }
        }
        if (!authData) return next();
        // console.log(authData)
        let validTgUser = false;
        if (process.env.DEV) {
            validTgUser = true;
        } else {
            validTgUser = validateTmaAuth(authData);
        }
        if (validTgUser) {
            const u = await db.GetUser(validTgUser.id);
            if (u) validTgUser.invitePoints = u.invitePoints;
            req.user = validTgUser;
            return next();
        }

        res.status(401).json({error: new Error('Invalid request!')});
    } catch (e) {
        next(e);
    }
};

const googleAuth = async (token) => {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const user = {
        id: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
        verified: payload['email_verified'],
        google: 1
    };

    await db.updateUser(user);

    return user
}

module.exports = {auth, validateTmaAuth, googleAuth};
