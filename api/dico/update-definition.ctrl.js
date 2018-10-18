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
// CONTROLLERS -----------------------------------------------------------------
const ehg=require('./read-extend-head-graph.ctrl');
const ecg=require('./read-extend-column-graph.ctrl');

/*
* Input: word
* Output: VocabularyGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('======================================================================')
  // console.log('ps', ps)

  validator.uuid(ps.def_uuid)
  .then(()=> validator.str(ps.value))
  .then(() => {return miscellaneousReq.access2Note(tx, ps.uid, ps.def_uuid) })
  .then(()=>{
    let query = `
      MATCH (def:Note{uuid:$def_uuid})
      SET def.value = $value
      RETURN {uuid:def.uuid, value:def.value, code_label:def.code_label}
    `;
    return tx.run(query, ps).then(parser.parse)
  })
  .then(data => {console.log('data result', data); return data})
  .then(data=>utils.commit(session, tx, res, ps.uid, data[0]) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/update-definition.ctr.js/main'}, res, tx)} )
};
