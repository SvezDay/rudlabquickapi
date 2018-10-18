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


module.exports.createActivity = (tx, uid)=>{
  // Create and Return an activity
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();
    let model = 'todo';
    let query = `
      MATCH (p:Person{uuid:$uid})
      CREATE (i:Index{uuid:apoc.create.uuid(), model:$model, commitList: [$now]})
      CREATE (t:Title{uuid:apoc.create.uuid(), value:"Undefined todo list"})
      CREATE (p)-[:Manage]->(i)-[:Has]->(t)
      RETURN {index:{uuid:i.uuid, model:i.model}, title:{uuid:t.uuid, value:t.value}} `;

      // console.log('model_documentation', model_documentation)
      // console.log("query", query)
    tx.run(query, {model:model, uid:uid, now:now}).then(parser.parse)
    // .then(result=>{console.log(result); return result; })
    .then(result=>resolve(result[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'activity/create-activity.ctrl.js/createActivity'}); })
  })
}

module.exports.main = (req, res, next)=>{
  // Return an activity
  let ps = req.headers;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.uid, 'ps.uid')
  .then(()=> this.createActivity(tx, ps.uid) )
  .then( data => utils.commit(session, tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'activity/create-activity.ctrl.js/main'}, res, tx)} )

};
