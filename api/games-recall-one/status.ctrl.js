'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../_services/token.service');
const driver = require('../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
const bluemise = require('bluebird');
// SERVICES --------------------------------------------------------------------
const utils = require('../_services/utils.service');
const validator = require('../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
const miscellaneousReq = require('../_services/miscellaneous.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------
const run = require('./run.ctrl');


/*
* Input: idx_uuid, status(boolean), des(boolean) as descendant
* Output: void
*/
module.exports.main = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  console.log("ps", typeof ps.status)

  validator.uuid(ps.idx_uuid, "ps.idx_uuid")
  .then(() => validator.boolean(ps.status, "ps.status") )
  .then(() => validator.boolean(ps.descendant, "ps.descendant") )
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(() => {
    let one = ` MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title) SET t.course = $status`;
    return tx.run(one, {idx_uuid:ps.idx_uuid, status:ps.status})
  })
  .then(() => {
    if(ps.des){
      let two = ` MATCH (i:Index{uuid:$idx_uuid})-[*]->(is:Index)-[]->(ts:Title) SET ts.course = $status`;
      return tx.run(two, {idx_uuid:ps.idx_uuid, status:ps.status})
    }
  })
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/status.ctrl.js/main'}, res, tx)} )
};

/*
* Input: recall{uuid}, status
* Output: void
*/
module.exports.recallStatus = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  console.log('ps', ps)

  validator.uuid('ps.recall.uuid', ps.recall.uuid)
  .then(() => validator.boolean(ps.status, "ps.status") )
  .then(() => {
    let one = `
      MATCH (p:Person{uuid:'${ps.uid}'})-[]->(r:Recall{uuid:'${ps.recall.uuid}'})
      SET r.status = ${ps.status}`;
    return tx.run(one)
  })
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/status.ctrl.js/recallStatus'}); })
};
