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
const descendantReq = require('../_services/descendant.request');
// COMMON ----------------------------------------------------------------------
const commonData = require('../_models/common.data');
// CONTROLLERS -----------------------------------------------------------------


/*
* By:
* Input: tx, node_uuid
* Output: definition
*/
module.exports.createDefinition = (tx, note_uuid)=>{
  return new Promise((resolve, reject)=>{
    let def_code = commonData.getLabelByDesignation("Definition").code_label;
    // console.log(" ============================================================= labelList", labelList)
    // SECURITY :: Ajouter un test qui vérifie qu'aucune définition n'existe déjà
    let query = `
      MATCH (n:Note{uuid:$note_uuid})
      CREATE (def:Note{uuid:apoc.create.uuid(), value:'Undefined', code_label:$def_code})
      CREATE (n)-[:Linked]->(def)
      RETURN {uuid:def.uuid, value:def.value, code_label:def.code_label}`;
    // console.log('query', query)

    tx.run(query, {note_uuid:note_uuid,def_code:def_code}).then(parser.parse)
    // .then(data=>{ delete data.id; return data; })
    // .then(data=>{console.log('data data data data data', data); return data;})
    .then(data =>{ resolve(data[0]) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/create-definition.ctrl.js/createDefinition'}); })
  })
};

/*
* Input: note_uuid
* Output: definition
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  // console.log("================================================================ CREATE TRADUCTION")
  // console.log('ps', ps)

  validator.uuid(ps.note_uuid, 'ps.note_uuid')
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.note_uuid) )

  .then(() => this.createDefinition(tx, ps.note_uuid) )

  .then( data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'dico/create-definition.ctrl.js/main'}, res, tx)} )
};
