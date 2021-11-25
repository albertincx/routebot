const W_RU = 'что это';
const W_EN = "what's it mean";

global.globalSUPPLINKS = {};
const getENV = vari => {
  let la = '';
  if (globalSUPPLINKS[vari]) {
    la = `${globalSUPPLINKS[vari]}`;
    la = `([${vari.match('_RU') ? W_RU : W_EN}?](${globalSUPPLINKS[vari]}))`;
  }
  return la;
};
module.exports = getENV;
