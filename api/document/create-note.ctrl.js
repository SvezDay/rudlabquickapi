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
const commonData = require('../_models/common.data');
// CONTROLLERS -----------------------------------------------------------------

/*
* By:
* Input: tx, parent_uuid, code_label
* Output: model
*/
module.exports.createNote = (tx, parent_uuid, code_label)=>{
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();

    let one = `
      MATCH (parent{uuid:$parent_uuid})
      CREATE (new:Note {value:'', code_label:$code_label, uuid:apoc.create.uuid()})
      CREATE (parent)-[:Has]->(new)
      RETURN {uuid:new.uuid, value:new.value, code_label:new.code_label}
      `;

    tx.run(one, {parent_uuid:parent_uuid, code_label:code_label, now:now}).then(parser.parse)
    // .then(data => {console.log(' ========================== data: ', data); return data; })
    .then(data=> resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/create-note.ctrl.js/createNote'}); })
  })
}
/*
* By:
* Input: parent_uuid, model:string, code_label
* Output: model
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  // let tx = driver.session().beginTransaction();
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log("ps", ps)

  validator.uuid(ps.parent_uuid, 'ps.parent_uuid')
  .then(()=> validator.str(ps.model, 'ps.model'))
  .then(()=> commonData.includeInModel(ps.model))
  .then(()=> validator.num(ps.code_label, 'ps.code_label'))
  .then(()=> commonData.includeInOptionalLabel(ps.model, ps.code_label))
  .then(()=> miscellaneousReq.access2NoteOrTitle(tx, ps.uid, ps.parent_uuid) )

  .then(()=>  this.createNote(tx, ps.parent_uuid, ps.code_label))

  .then(data=> utils.commit(session, tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail(session,{status: err.status || 400, mess: err.mess || 'document/create-note.ctrl.js/main'}, res, tx)} )
};
