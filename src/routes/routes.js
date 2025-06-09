const mongoose = require('mongoose');
const router = require('express')
    .Router();

const Route = mongoose.model('Route');

const {getPoint} = require('../lib/utils');

const db = require('../api/utils/db');
const {DIR_A} = require('../api/utils/db');
const BotHelper = require('../api/routes/bot/route');
const {maxRouteLimit, TGADMIN} = require('../config/vars');

const botHelper = new BotHelper();

// eslint-disable-next-line consistent-return
const getHour = v => {
    const timestamp = Date.parse(v);
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(timestamp) === false) {
        const d = new Date(timestamp);
        return parseFloat(`${d.getHours()}.${d.getMinutes()}`);
    }
};

const getData = body => {
    const update = {name, pointA, pointB} = body;
    const additionals = {hourA, hourB, status} = body;
    // console.log('update');
    // console.log(update, additionals);
    update.pointA = getPoint(update);
    update.pointB = getPoint(update, 'B');
    if (additionals.hourA) {
        const v = getHour(additionals.hourA);
        if (v) {
            update.hourA = v;
        }
    }
    if (additionals.hourB) {
        const v = getHour(additionals.hourB);
        if (v) {
            update.hourB = v;
        }
    }
    if (typeof additionals.status !== 'undefined') {
        update.status = additionals.status ? 1 : 0;
    }
    return update;
};

router.get('/:id', (req, res) => {
    const filter = {
        userId: req.user.id, _id: req.params.id,
    };
    Route.findOne(filter)
        .then(r => res.status(200)
            .json(r))
        .catch(err => {
            res.json({success: false, message: err});
        });
});

router.get('/', async (req, res) => {
    const {range = '[0,5]', filter: F} = req.query;
    let F2 = {};
    try {
        F2 = JSON.parse(F);
    } catch (e) {
        //
    }
    const _F2 = {status, name} = F2
    // console.log(req.user)
    if (!req.user) {
        return res.status(401)
            .json({success: false, message: 'not authorized'});
    }
    const filter = {userId: req.user?.id, ..._F2};

    let [skip, limit] = JSON.parse(range);

    if (limit > maxRouteLimit) {
        limit = maxRouteLimit;
    }

    const limit2 = limit - skip;
    const opts = {limit: limit2, skip};
    if (typeof F2.point !== 'undefined') {
        filter.pointA = {$exists: F2.point};
        filter.pointB = {$exists: F2.point};
    }
    if (filter.name) {
        filter.name = new RegExp(filter.name);
    }
    const countTotal = await Route.countDocuments(filter);
    Route.find(filter, 'id name createdAt status hourA hourB pointA pointB', opts)
        .then(r => res
            .set('Content-Range', `items ${skip}-${limit2}/${countTotal}`)
            .status(200)
            .json(r),);
});

router.post('/', // eslint-disable-next-line consistent-return
    async (req, res) => {
        const {id: userId} = req.user;
        const filter = {name: req.body.name, userId};
        const exists = await Route.findOne({
            ...filter, name: new RegExp(filter.name, 'i'),
        }, '_id');

        let error = '';
        let err_status = 403;
        if (exists) {
            err_status = 400;
            error = 'route with this name is already exists';
        } else {
            const totalUserCount = await Route.countDocuments({userId});
            if (totalUserCount >= maxRouteLimit && userId !== TGADMIN) error = 'limit routes';
        }

        if (error) {
            res.status(err_status)
                .json({success: false, message: error});
            return;
        }

        const update = getData({...req.body});
        update.userId = userId;

        const x = new Route(update);
        let sa = await x.save();
        // console.log('sa');
        // console.log(sa);
        let {
            _id: routeId, id, pointA, pointB, name, ...newRoute
        } = sa._doc;
        // console.log(newRoute, routeId);
        if (Object.keys(newRoute).length === 0) {
            res.status(400)
                .json({success: false, message: error});
            return;
        }

        newRoute.userId = userId;
        const routeData = {
            ...newRoute, userId, category: 'Routes', type: newRoute.type || 3, status: 0,
        };
        let aID;
        // let bID;
        try {
            // const {_id} = await db.addRoute({userId}, {name});
            aID = await db.addRouteA(routeData, pointA, DIR_A, name);
            // console.log('aID')
            // console.log(aID)
            // literally B
            const {lastUpdatedId} = await db.addRouteB(routeData, pointB, name);
            // bID = lastUpdatedId;
            const route = await Route.findOne({
                userId, _id: routeId
            });
            // console.log(route, userId, lastUpdatedId, aID)
            if (!route) {
                throw new Error('route not found');
            }
            route.success = true;
            res.json(route);
        } catch (err) {
            // if (bID) await db.deleteRoute(bID);
            // if (aID) await db.deleteRoute(aID);
            console.log('err')
            console.log(err)
            if (routeId) {
                await db.deleteRoute(routeId);
            }
            res.status(500).json({success: false, error: `${err}`});
        }
    },);

router.put('/:id', // eslint-disable-next-line consistent-return
    async (req, res) => {
        const {id: userId} = req.user;
        const {id: _id} = req.params;
        const update = getData(req.body);
        try {
            await botHelper.setFieldsRoute(userId, _id, update);
            res.json({...update, id: _id});
        } catch (err) {
            res.json({success: false, message: err});
        }
    },);

router.delete('/:id', // eslint-disable-next-line consistent-return
    async (req, res) => {
        const {id: userId} = req.user;
        const filter = {_id: req.params.id, userId};
        const exists = await Route.findOne(filter, '_id');
        if (!exists) {
            res.json({});
            return;
        }
        try {
            await db.deleteRoute(req.params.id);
            res.json({success: true});
        } catch (err) {
            res.json({success: false, msg: err});
        }
    },);
module.exports = router;
