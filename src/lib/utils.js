const a = {
  type: 'Point',
  coordinates: [],
};

const getPoint = (upd, pointKey) => {
  let _pointKey = 'pointA';
  if (pointKey === 'B') {
    _pointKey = 'pointB';
  }
  const point = {...a};
  if (upd[_pointKey]) {
    if (typeof upd[_pointKey] === 'object' && upd[_pointKey].coordinates) {
      point.coordinates = upd[_pointKey].coordinates;
    } else if (Array.isArray(upd[_pointKey])) {
      point.coordinates = upd[_pointKey];
    } else {
      point.coordinates = upd[_pointKey].split(',').map(Number);
    }
  }
  return point;
};

module.exports.getPoint = getPoint;
