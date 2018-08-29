'use-strict';
const jwt = require('jsonwebtoken');
const token = require('../../secret').token_secret;

/*
* Input:
* Output:
*/
module.exports = (user_uuid, expire)=>{
  let t = jwt.sign({
    exp: expire,
    uuid: user_uuid
  },token.secret);
  return t;
};
