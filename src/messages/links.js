const CREATE_T_L_RU = process.env.LINK_TIP_CR_RU;
const CREATE_T_L_EN = process.env.LINK_TIP_CR_EN;

const POINT_T_L_RU = process.env.LINK_TIP_POINT_RU;
const POINT_T_L_EN = process.env.LINK_TIP_POINT_EN;

const SUBS_T_L_RU = process.env.LINK_TIP_SUBS_RU;
const SUBS_T_L_EN = process.env.LINK_TIP_SUBS_EN;
const W_RU = 'что это';
const W_EN = "what's it mean";

const _CREATE_TXT_L_RU = CREATE_T_L_RU ? `[${W_RU}?](${CREATE_T_L_RU})` : '';
const _CREATE_TXT_L_EN = CREATE_T_L_EN ? `[${W_EN}?](${CREATE_T_L_EN})` : '';

const _POINT_TXT_L_RU = POINT_T_L_RU ? `[${W_RU}?](${POINT_T_L_RU})` : '';
const _POINT_TXT_L_EN = POINT_T_L_EN ? `[${W_EN}?](${POINT_T_L_EN})` : '';

const _SUBS_L_RU = SUBS_T_L_RU ? `[${W_RU}?](${SUBS_T_L_RU})` : '';
const _SUBS_L_EN = SUBS_T_L_EN ? `[${W_EN}?](${SUBS_T_L_EN})` : '';

module.exports = {
  CREATE_TXT_L_RU: _CREATE_TXT_L_RU,
  CREATE_TXT_L_EN: _CREATE_TXT_L_EN,
  POINT_TXT_L_EN: _POINT_TXT_L_EN,
  POINT_TXT_L_RU: _POINT_TXT_L_RU,
  SUBS_L_RU: _SUBS_L_RU,
  SUBS_L_EN: _SUBS_L_EN,
};
