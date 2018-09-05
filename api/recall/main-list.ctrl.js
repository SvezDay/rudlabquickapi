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
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------

module.exports.getList = (tx, uid)=>{
  // Return la list des index et title des document ayant course true and 1 ou plus de deadline
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    let idxList = [];

    let one = `
      MATCH (p:Person{uuid:$uid})
      OPTIONAL MATCH (p)-[]->(r:Recall)
      WHERE r.status = true
      AND r.deadline < ${now} `;

    .then(()=> tx.run(one+two, {uid:uid}) ).then(parser.parse)
    // .then(recall => { console.log('recall', recall); return recall} )
    // .then(recall => {if(!recall.length){throw {status: 204, mess: 'no more card'}}else{resolve(recall[0])}  })
    .then(data=>resolve(data[0]))
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game-recall-one/run.ctrl.js/getRecall'}); })
  })
}


/*
* Input:
* Output: {recall, from, to}
*/
module.exports.main = (req, res, next)=>{
  let tx = driver.session().beginTransaction();
  let ps = req.headers;
  ps.uid = req.decoded.uuid;

  this.getList(tx, ps.uid)
  .then(recall => {
    // console.log('recall 2', recall)
    if(!!recall.uuid){
       return this.getQA(tx, recall)
       .then(data => {
         data.recall = {uuid:recall.uuid, level:recall.level};
         return data;
       })
    }else{
      return {stat:204};
    }
  })
  .then(data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'games-recall-one/run.ctrl.js/main'}, res, tx)} )
};
