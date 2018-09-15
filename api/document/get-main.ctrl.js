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
const commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
/*
* Input: tx, uid
* Output: headGraph
*/
module.exports.getMain = (tx, uid)=>{
  return new Promise((resolve, reject)=>{
    let model_documentation = commonData.getModelByModule('document');
    // WITH split($model_documentation, ',') as list
    let query = `
      WITH $model_documentation as list
      MATCH (a:Person{uuid:$uid})-[]->(i:Index)-[]->(t:Title)
      WHERE i.model in list
      RETURN {index:{uuid:i.uuid, model:i.model}, title:{uuid:t.uuid, value:t.value, recallable:t.recallable, code_label:t.code_label}} `;

      // console.log('model_documentation', model_documentation)
      // console.log("query", query)
    tx.run(query, {model_documentation:model_documentation, uid:uid}).then(parser.parse)
    // .then(result=>{console.log(result); return result; })
    .then(result=>resolve(result) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/getMain.ctrl.js/getMain'}); })
  })
}
/*
* Input:
* Output: headGraph[]
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('ps main getMain', ps)

  this.getMain(tx, ps.uid)
  .then( data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/get-main.ctr.js/main'}, res, tx)} )

};
