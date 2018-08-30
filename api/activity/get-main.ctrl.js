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


module.exports.getMain = (tx, uid)=>{
  // Return toutes les fiches todo avec leur index et titre uniquement
  return new Promise((resolve, reject)=>{
    let model = 'todo';
    let query = `
      MATCH (a:Person{uuid:$uid})
      OPTIONAL MATCH (i:Index{model:$model})-[]->(t:Title)
      RETURN {index:{uuid:i.uuid, model:i.model}, title:{uuid:t.uuid, value:t.value}} `;

      // console.log('model_documentation', model_documentation)
      // console.log("query", query)
    tx.run(query, {model:model, uid:uid}).then(parser.parse)
    // .then(result=>{console.log(result); return result; })
    .then(result=>resolve(result[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'activity/getMain.ctrl.js/getMain'}); })
  })
}

module.exports.main = (req, res, next)=>{
  // Return list of index, title des activity todo
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.uid, 'ps.uid')
  .then(()=> this.getMain(tx, ps.uid) )
  .then( data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'activity/get-main.ctr.js/main'}, res, tx)} )

};
