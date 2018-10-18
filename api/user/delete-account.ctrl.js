'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../_services/token.service');
const driver = require('../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
// SERVICES --------------------------------------------------------------------
const utils = require('../_services/utils.service');
const validator = require('../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
const miscellaneousReq = require('../_services/miscellaneous.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLERS -----------------------------------------------------------------

/*
* Input:
* Output:
*/
module.exports.deleteAccount = (tx, uid)=>{
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    const query = `
      MATCH (p:Person{uuid:'${uid}'})
      OPTIONAL MATCH (p)-[]->(t:Todo)
      OPTIONAL MATCH (p)-[]->(b:Board_Activity)
      DETACH DELETE p, t, b
      `;
    tx.run(query)
    .then(() => { resolve() })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'user/delete-account.ctrl.js/deleteAccount'}); })
  })
}

/*
* Input: index
* Output: true
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let session = driver.session();
let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;

  Promise.resolve()
  .then(() => {return this.deleteAccount(tx, ps.uid) })
  .then(() => { utils.commit(session, tx, res, ps.uid) })
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'user/delete-account.ctrl.js/main'}, res, tx)} )

};
