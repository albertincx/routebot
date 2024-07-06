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
    if (typeof upd[_pointKey] === 'object') {
      point.coordinates = upd[_pointKey].coordinates;
    } else {
      point.coordinates = upd[_pointKey].split(',').map(Number);
    }
  }
  return point;
};

module.exports.getPoint = getPoint;
