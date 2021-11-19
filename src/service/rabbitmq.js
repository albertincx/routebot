const amqp = require('amqplib');

const logger = require('../api/utils/logger');
const {showError} = require('../api/utils');

const TASKS_CHANNEL = process.env.TASKS_DEV || 'route1';

const TASKS2_CHANNEL = process.env.TASKS2_DEV || 'route2';
let rchannel = null;

const RABBIT_1 = 'rabbit';
const RABBIT_2 = 'rabbit2';
const rabbits = {
  rabbit: process.hrtime(),
  rabbit2: process.hrtime(),
};
let availableOne = true;

const getRabbitName = q => {
  let s = RABBIT_1;
  switch (q) {
    case TASKS2_CHANNEL:
      s = RABBIT_2;
      break;
    default:
      break;
  }
  return s;
};
const elapsedSec = q => {
  const s = getRabbitName(q);
  logger(s);
  return process.hrtime(rabbits[s])[0];
};
const elapsedTime = (q = TASKS_CHANNEL) => {
  const s = getRabbitName(q);
  let elapsed = process.hrtime(rabbits[s])[1] / 1000000;
  elapsed = `${process.hrtime(rabbits[s])[0]}s, ${elapsed.toFixed(0)}`;
  return `${elapsed}ms ${q}`;
};
const resetTime = (q = TASKS_CHANNEL) => {
  const s = getRabbitName(q);
  logger(`reset ${s}`);
  rabbits[s] = process.hrtime();
};
let connection = null;
const createChannel = async (queueName = TASKS_CHANNEL) => {
  let channel;
  try {
    if (!connection) {
      connection = await amqp.connect(process.env.MESSAGE_QUEUE);
    }
    channel = await connection.createChannel();
    await channel.assertQueue(queueName, {durable: true});
  } catch (e) {
    showError(e);
    logger(e);
  }
  rchannel = channel;
  return channel;
};

const startChannel = (queueName = TASKS_CHANNEL) => {
  try {
    createChannel(queueName).then(channel => {
      rchannel = channel;
    });
  } catch (e) {
    logger(e);
  }
};

const run = async (job, qName) => {
  try {
    let queueName = qName;
    if (!queueName) {
      queueName = TASKS_CHANNEL;
    }
    const channel = await createChannel(queueName);
    await channel.prefetch(1);
    channel.consume(queueName, async message => {
      const content = message.content.toString();
      const task = JSON.parse(content);
      if (queueName !== TASKS_CHANNEL) task.q = queueName;
      await job(task);
      channel.ack(message);
    });
  } catch (e) {
    logger(e);
  }
};

const runSecond = job => run(job, TASKS2_CHANNEL);

const keys = [
  process.env.TGPHTOKEN_0,
  process.env.TGPHTOKEN_1,
  process.env.TGPHTOKEN_2,
  process.env.TGPHTOKEN_3,
  process.env.TGPHTOKEN_4,
  process.env.TGPHTOKEN_5,
  process.env.TGPHTOKEN_6,
];

function shuffle(arr) {
  let currentIndex = arr.length;
  let temporaryValue;
  let randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = arr[currentIndex];
    // eslint-disable-next-line no-param-reassign
    arr[currentIndex] = arr[randomIndex];
    // eslint-disable-next-line no-param-reassign
    arr[randomIndex] = temporaryValue;
  }

  return arr;
}

function getKey() {
  const h = new Date().getHours();
  const keys1 = shuffle(keys);
  return keys1.find((k, i) => h <= (24 / keys.length) * (i + 1)) || keys[0];
}

const getParams = (queueName = TASKS_CHANNEL) => {
  const isPuppet = false;
  let accessToken = getKey();
  if (queueName === TASKS2_CHANNEL) {
    accessToken = process.env.TGPHTOKEN2;
  }
  return {
    isPuppet,
    access_token: accessToken,
  };
};

const addToQueue = async (task, qName = TASKS_CHANNEL) => {
  if (rchannel) {
    let queueName = qName;
    const el = elapsedTime(queueName);
    const elTime = elapsedSec(queueName);
    logger(`availableOne ${availableOne}`);
    logger(`elTime ${elTime}`);
    if (queueName === TASKS_CHANNEL && !availableOne && elTime > 15) {
      queueName = chanSecond();
    }
    logger(el);
    await rchannel.sendToQueue(queueName, Buffer.from(JSON.stringify(task)), {
      contentType: 'application/json',
      persistent: true,
    });
  }
};
const chanSecond = () => TASKS2_CHANNEL;

const time = (queueName = TASKS_CHANNEL, start = false) => {
  if (queueName === TASKS_CHANNEL) {
    availableOne = !start;
  }
  const t = elapsedTime(queueName);
  if (start) {
    resetTime(queueName);
  }
  return t;
};
module.exports.createChannel = createChannel;
module.exports.startChannel = startChannel;
module.exports.addToQueue = addToQueue;
module.exports.runSecond = runSecond;
module.exports.chanSecond = chanSecond;
module.exports.getParams = getParams;
module.exports.time = time;
module.exports.run = run;
