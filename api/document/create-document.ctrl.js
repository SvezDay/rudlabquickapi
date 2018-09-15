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
const graphReq = require('../_services/graph.request');
const miscellaneousReq = require('../_services/miscellaneous.request');
// COMMON ----------------------------------------------------------------------
const commonData = require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------
// const root = require('./get-main.ctrl');

/*
* Input: tx, parent_uuid, model:string
* Output: void
*/
module.exports.createDocument = (tx, model, parent_uuid)=>{
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();

    commonData.getNativeLabelByModel(model)
    .then(nativeLabel =>{
      // console.log('nativeLabel ==============', nativeLabel)
      let one = `
      MATCH (parent{uuid:$parent_uuid})
      CREATE (idx:Index{commitList: [$now], model: $model, uuid:apoc.create.uuid()})
      CREATE (t:Title {value:'Undefined', uuid:apoc.create.uuid(), recallable: false, code_label:1.2})`;

      let two=` CREATE (parent)-[:Manage]->(idx)-[:Has{commit:$now}]->(t)`;
      for(var i = 0; i<nativeLabel.length; i++){
        one+=` CREATE (n${i}:Note{uuid:apoc.create.uuid(), code_label:${nativeLabel[i]}, value:'Undefined'}) `;
        two+=`-[:Has{commit:$now}]->(n${i})`
      }
      two += ' RETURN {index:{uuid:idx.uuid, model:idx.model}, title:{uuid:t.uuid, value:t.value, recallable:t.recallable, code_label:t.code_label}}'
      // console.log("query", one+two)
      return tx.run(one+two, {parent_uuid:parent_uuid, model:model, now:now}).then(parser.parse)
    })
    // .then(data => {console.log(data); return data; })
    .then(data=> resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'model-defined/create.ctrl.js/createModel'}); })
  })
}
/*
* Input: model, parent_uuid
* Output: headGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('=============================================================', ps)

  validator.uuidOrNull(ps.parent_uuid)
  .then(()=> miscellaneousReq.access2NoteOrTitleOrNull(tx, ps.uid, ps.parent_uuid) )
  .then(()=> validator.str(ps.model))
  .then(()=> commonData.includeInModel(ps.model))
  .then(()=> {
    ps.parent_uuid ?  null : ps['parent_uuid']=ps.uid
    return this.createDocument(tx, ps.model, ps.parent_uuid)
  })
  // .then(data => {console.log('data of main()',data); return data; })
  .then(data=> utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/create-document.ctr.js/main'}, res, tx)} )
};
