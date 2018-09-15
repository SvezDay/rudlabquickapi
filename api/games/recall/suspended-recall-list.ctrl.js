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
let graph = require('../../_services/graph.request');

module.exports.updateStatusRecall = (tx, uid)=>{ // Input: none  | Output: [{recall,index, title, q, a}]
    return new Promise((resolve, reject)=>{
      let newList = [];
      let query = `
        MATCH (p:Person{uuid:$uid})
        OPTIONAL MATCH(p)-[:Recall]->(ir:IndexRecall)-[:Recall]->(rs:Recall{status:false})
        RETURN {index:{uuid:ir.uuid}, recall:{uuid:rs.uuid, q:rs.q, a:rs.a}}
        `;
    tx.run(query, {uid:uid}).then(parser.parse)
    .then(list => {
      let promises = [];
      for(var i=0; list.length; i++){
        let obj = {recall:list[i].recall};
        let p = graph.getHeadGraph(tx, list[i].index.uuid)
        .then(data => { Object.assign(obj, data)} )
        .then(()=> require('./run.ctrl').getQA(tx, obj.recall) )
        .then(data => { Object.assign(obj, data)} )
        promises.push(p);
      }
      return Promise.all(promises);
    })
    .then(() => resolve(newList) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'games/recall/suspended-recall-list.ctrl.js/suspendedRecallList'}); })
  })
}
module.exports.main = (req, res, next)=>{ // Input: recall_uuid, status |  Output:  [{recall,index, title, q, a}]

  let tx = driver.session().beginTransaction();
  let ps = req.body.recall;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();

  this.suspendedRecallList(tx, ps.uid)
  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games/recall/suspended-recall-list.ctrl.js/main'}, res, tx)} )
};
