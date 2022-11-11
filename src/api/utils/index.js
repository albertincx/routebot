const ADMINS = (process.env.ADMINS || '').split(',').filter(Boolean);

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
  let chatId;
  if (ctx.update.callback_query) {
    const msg = ctx.update.callback_query;
    const {message} = msg;
    const {
      chat: {id},
    } = message;
    chatId = id;
  } else {
    const {
      chat: {id},
    } = ctx.message;
    chatId = id;
  }

  return ADMINS.length && !ADMINS.includes(`${chatId}`);
}

const showError = e => console.log(e);

function matchEscapeRegex(str, search) {
  if (!str || !search) return null;
  return str.match(new RegExp(search.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')));
}

module.exports.checkAdmin = checkAdmin;
module.exports.check = check;
module.exports.timeout = timeout;
module.exports.checkData = checkData;
module.exports.showError = showError;
module.exports.matchEscapeRegex = matchEscapeRegex;
