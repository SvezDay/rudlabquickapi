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
// const recallReq = require('../_services/recall.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------

/*
* Input: tx, ps{uid, uuid, newLevel, newDeadline}
* Output: void
*/
module.exports.updateRecall = (tx, ps)=>{
    return new Promise((resolve, reject)=>{
      let query = `
        MATCH (p:Person{uuid:$uid})
        MATCH (p)-[]->(r:Recall{uuid:$uuid})
        SET r.level = $newLevel
        SET r.deadline = toInteger($newDeadline)  `;
    tx.run(query, {uid:ps.uid, uuid:ps.uuid, newLevel:ps.newLevel, newDeadline:ps.newDeadline})
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/recall.request.js/createupdateRecall'}); })
  })
}

/*
* Input:
* Output: void
*/
module.exports.win = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.body.recall;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  validator.uuid(ps.uuid)
  .then(() => validator.num(ps.level) )
  .then(() => {
      ps.newLevel = 2 * !ps.level ? 1 : ps.level == 1 ? 2 : ps.level // the level formula is: 0 1 2 4 8 16 32 ...
      ps.newDeadline = JSON.stringify(ps.now + (ps.newLevel * 24 * 60 * 60 * 1000) )
      return this.updateRecall(tx, ps);
  })
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/scoring.ctrl.js/win'}, res, tx)} )
};

/*
* Input:
* Output: void
*/
module.exports.lose = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.body.recall;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  validator.uuid(ps.uuid)
  .then(() => validator.num(ps.level) )
  .then(() => {
      ps.newLevel = !ps.level ? 1 : ps.level == 1 ? 1 : ps.level / 2
      ps.newDeadline = JSON.stringify(ps.now + (ps.newLevel * 24 * 60 * 60 * 1000) )
      return this.updateRecall(tx, ps);
  })
  .then(() => utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/scoring.ctrl.js/lose'}, res, tx)} )
};
