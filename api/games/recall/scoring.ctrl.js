'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../../_services/token.service');
const driver = require('../../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
// SERVICES --------------------------------------------------------------------
const utils = require('../../_services/utils.service');
const validator = require('../../_services/validator.service');
let miscellaneous = require('../../_services/miscellaneous.request');
// REQUEST ---------------------------------------------------------------------
// const recallReq = require('../_services/recall.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------


module.exports.updateLevel = (tx, recall_uuid, newLevel, newDeadline)=>{ // Input: recall_uuid, newLevel, newDeadline  | Output: void
    return new Promise((resolve, reject)=>{
      let query = `
        MATCH (r:Recall{uuid:$recall_uuid})
        SET r.level = $newLevel
        SET r.deadline = toInteger($newDeadline) return r`;
    tx.run(query, {recall_uuid:recall_uuid, newLevel:newLevel, newDeadline:newDeadline})
    .then(parser.parse).then(data=>{console.log("data result of update: ", data)})
    .then(() => resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'games/recall/scoring.ctrl.js/updateLevel'}); })
  })
}

module.exports.scoring = (tx, state, recall_uuid, level)=>{ // Input: state, recall_uuid, level  |  Output: void
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    let newLevel;
    let newDeadline;

    Promise.resolve()
    .then(()=>{
      if(state=='win'){
        console.log("scoring WIN")
        console.log("level: ", level)
        // newLevel = 2 * !level ? 1 : level == 1 ? 2 : level // the level formula is: 0 1 2 4 8 16 32 ...
        newLevel = !level ? 1 : 2 * level // the level formula is: 0 1 2 4 8 16 32 ...
        newDeadline = JSON.stringify(now + (newLevel * 24 * 60 * 60 * 1000) )
      }else{
        console.log("scoring LOSE")
        newLevel = !level ? 1 : level == 1 ? 1 : level / 2
        newDeadline = JSON.stringify(now + (newLevel * 24 * 60 * 60 * 1000) )
      }
    })
    .then(()=> this.updateLevel(tx, recall_uuid, newLevel, newDeadline) )
    .then(()=> resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'games/recall/scoring.ctrl.js/scoring'}); })
  })
};


module.exports.main = (req, res, next)=>{ // Input: recall_uuid, level, state |  Output:  void
  let session = driver.session();
let tx = session.beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  console.log('ps', ps)

  validator.uuid( ps.recall_uuid, 'ps.recall_uuid')
  .then(() => validator.num(ps.level, 'ps.level') )
  .then(() => validator.enum(ps.state, ['win', 'lose']) )
  .then(()=> miscellaneous.access2Any(tx, ps.uid, ps.recall_uuid) )

  .then(()=> this.scoring(tx, ps.state, ps.recall_uuid, ps.level) )

  .then(() => utils.commit(session, tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'games/recall/scoring.ctrl.js/main'}, res, tx)} )
};
