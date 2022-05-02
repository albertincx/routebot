const amqp = require('amqplib');

const logger = require('../api/utils/logger');
const {showError} = require('../api/utils');

const TASKS_CHANNEL = process.env.TASKS_DEV || 'routes_tasks';

const TASKS2_CHANNEL = process.env.TASKS2_DEV || 'routes2_tasks';
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
module.exports.time = time;
module.exports.run = run;
