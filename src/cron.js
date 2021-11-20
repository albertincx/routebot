const fs = require('fs');
const {CronJob} = require('cron');

const {showError} = require('./api/utils');

const CRON_SEP = ':';
const JOB_SEP = ',';

function cron(crontime, tasks, botHelper) {
  // eslint-disable-next-line no-console
  showError(`init cron ${crontime} ${tasks}`);
  const job = new CronJob(`${crontime}`, async () => {
    if (process.env.DEV) {
      const d = new Date();
      // eslint-disable-next-line no-console
      showError(`created task ${crontime} `, d);
    }
    for (let i = 0; i < tasks.length; i += 1) {
      const taskName = tasks[i];
      try {
        // eslint-disable-next-line global-require,import/no-dynamic-require
        const microtasks = require(`./service/commands/${taskName}`);
        // eslint-disable-next-line no-await-in-loop
        await microtasks.run({cronJob: crontime}, botHelper);
      } catch (e) {
        if (process.env.DEV) {
          // eslint-disable-next-line no-console
          showError(`task error ${taskName}`);
          // eslint-disable-next-line no-console
          showError(e);
        }
      }
    }
  });
  job.start();
}

function init(botHelper) {
  const crontimes = process.env.NODE_CRON || '';
  const crontasks = process.env.CRON_TASKS || '';

  const crons = crontimes.split(CRON_SEP);
  const tasksMain = crontasks.split(CRON_SEP);

  try {
    if (crons && crons.length) {
      for (let i = 0; i < crons.length; i += 1) {
        const crontime = `${crons[i]}`
          .trim()
          .replace(/G/g, '*')
          .replace(/d/g, '/');
        if (crontime && tasksMain[i]) {
          const jobs = tasksMain[i].split(JOB_SEP);
          if (jobs && jobs.length) {
            const tasks = [];
            for (let t = 0; t < jobs.length; t += 1) {
              const taskName = `${jobs[t]}`.trim();
              const cmdPath = `${__dirname}/service/commands/${taskName}.js`;
              if (fs.existsSync(cmdPath)) {
                tasks.push(taskName);
              }
            }
            if (tasks.length) {
              cron(crontime, tasks, botHelper);
            }
          } else {
            // eslint-disable-next-line no-console
            showError(`no jobs ${crontime}`);
          }
        } else {
          // eslint-disable-next-line no-console
          showError(`empty ${crontime}`);
        }
      }
    } else {
      // eslint-disable-next-line no-console
      showError('no crons');
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    showError(e);
  }
}

module.exports = init;
