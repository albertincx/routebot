<<<<<<< HEAD
=======
const ADMINS = (process.env.ADMINS || '').split(',');

>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e
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
  return new Promise(r => tm(r));
}

function checkData(data, msg = 'missing data') {
  if (data) {
    throw Error(msg);
  }
}
<<<<<<< HEAD

=======
function checkAdmin(ctx) {
  const {
    chat: {id: chatId},
  } = ctx.message;
  return !(ADMINS.length && ADMINS.includes(`${chatId}`));
}
module.exports.checkAdmin = checkAdmin;
>>>>>>> 7284fba8010dfc6892d6ddf149d16ae33318382e
module.exports.check = check;
module.exports.timeout = timeout;
module.exports.checkData = checkData;
