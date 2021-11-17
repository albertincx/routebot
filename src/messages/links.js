const CREATE_T_L_RU = process.env.CREATE_LINK_TIP_RU;
const CREATE_T_L_EN = process.env.CREATE_LINK_TIP_EN;
const POINT_T_L_RU = process.env.CREATE_LINK_TIP_RU;
const POINT_T_L_EN = process.env.CREATE_LINK_TIP_EN;

const W_RU = 'что это';
const W_EN = "what's it mean";

const CREATE_TXT_L_RU = CREATE_T_L_RU ? `[${W_RU}?](${CREATE_T_L_RU})` : '';
const CREATE_TXT_L_EN = CREATE_T_L_EN ? `[${W_EN}?](${CREATE_T_L_EN})` : '';

const POINT_TXT_L_RU = POINT_T_L_RU ? `[${W_RU}?](${POINT_T_L_RU})` : '';
const POINT_TXT_L_EN = POINT_T_L_EN ? `[${W_EN}?](${POINT_T_L_EN})` : '';

module.exports = {
  CREATE_TXT_L_RU,
  CREATE_TXT_L_EN,
  POINT_TXT_L_EN,
  POINT_TXT_L_RU,
};
