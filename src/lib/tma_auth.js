const {OAuth2Client} = require('google-auth-library');

const {DEV} = require('../config/vars');
const {verifySignature} = require('./login');
const {validate, parse} = require('@telegram-apps/init-data-node');
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
        const u = Object.fromEntries(url);

        let isWidget = auth === 'widget';
        const botToken = process.env.TBTKN;
        if (!DEV) {
            if (isWidget) {
                const isValid = verifySignature(u, botToken);
                return isValid && u;
            } else {
                let q = url.toString();
                // console.log(q);
                validate(q, botToken, {expiresIn: 3600});
                // console.log('u');
                return parse(q).user;
            }
        } else {
            // test id
            // u.id = 36058859;
            // u.id = 487323673;
        }
        return u;
    } catch (e) {
        console.log(e);
    }

    return result;
};

const auth = async (req, res, next) => {
    try {
        let authData = (req.headers.authorization || '').split(' ')[1];
        if (authData && !authData.match('user=')) {
            const userG = jwt.verify(authData, process.env.JWT_SECRET);
            const ticket = await client.verifyIdToken({
                idToken: userG.token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            try {
                const payload = ticket.getPayload();
                req.user = payload;
                // res.json({message: 'Protected data', user: payload.email});
                // throw new Error('Invalid request!');
                return next();
            } catch (e) {
                //
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
    const userId = payload['sub'];

    // Here you would typically:
    // 1. Check if user exists in your database
    // 2. Create user if they don't exist
    // 3. Generate your own JWT token or session

    const user = {
        id: userId,
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
        verified: payload['email_verified']
    };
    await db.updateUser({
        ...user,
        google: 1
    });

    return user
}

module.exports = {auth, validateTmaAuth, googleAuth};
