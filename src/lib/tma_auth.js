const {validate} = require('@tma.js/init-data-node');

const validateTmaAuth = requestBody => {
  let result = false;

  try {
    result = validate(requestBody.query, process.env.TBTKN);
    // result = true;
  } catch (e) {
    // console.error(e);
  }

  return !!process.env.DEV || result;
};

module.exports = {
  validateTmaAuth,
};
