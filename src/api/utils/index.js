const ADMINS = (process.env.ADMINS || '').split(',');

function check(txt) {
  const m = txt.match(
    /(p_cache|content|custom|puppet|wget|cached)_force(.*?)$/,
  );
  if (m && m[1]) {
    return m[1];
  }
  return false;
}

function timeout(s) {
  const tm = r => setTimeout(() => r(true), s * 1000);
  // eslint-disable-next-line no-promise-executor-return
  return new Promise(r => tm(r));
}

function checkData(data, msg = 'missing data') {
  if (data) {
    throw Error(msg);
  }
}

function checkAdmin(ctx) {
<<<<<<< HEAD
  let chatId = '';
  
=======
  let chatId;
>>>>>>> 6225d648b0617b1757d92bf5fb39b33844f44f7b
  if (ctx.update.callback_query) {
    const msg = ctx.update.callback_query;
    const {message} = msg;
    const {
<<<<<<< HEAD
    chat: {id},
=======
      chat: {id},
>>>>>>> 6225d648b0617b1757d92bf5fb39b33844f44f7b
    } = message;
    chatId = id;
  } else {
    const {
<<<<<<< HEAD
    chat: {id},
=======
      chat: {id},
>>>>>>> 6225d648b0617b1757d92bf5fb39b33844f44f7b
    } = ctx.message;
    chatId = id;
  }
  return !(ADMINS.length && ADMINS.includes(`${chatId}`));
}

module.exports.checkAdmin = checkAdmin;
module.exports.check = check;
module.exports.timeout = timeout;
module.exports.checkData = checkData;