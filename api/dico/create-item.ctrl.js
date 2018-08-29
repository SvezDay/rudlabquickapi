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
const ehg=require('./read-extend-head-graph.ctrl');
const ecg=require('./read-extend-column-graph.ctrl');

/*
* By:
* Input: tx, idx_uuid, code_label
* Output: void
*/
module.exports.createItem = (tx, idx_uuid, code_label)=>{
  return new Promise((resolve, reject)=>{

    let query = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    CREATE (new:Note{uuid:apoc.create.uuid(), code_label:$code_label, value:"Undefined"})
    CREATE (t)-[h:Has]->(new)
    RETURN new`;
    // console.log('query', query)

    tx.run(query, {idx_uuid:idx_uuid, code_label:code_label}).then(parser.parse)
    // .then(data=>{console.log("new of createItem", data); return data; })
    .then(data => { delete data[0].id; return data; })
    .then((data) =>{ resolve(data[0]) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/create-item.ctrl.js/createItem'}); })
  })
};
/*
* Input: idx_uuid, code_label
* Output: ExtendHeadGraph
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log('====================================================================== create item')
  // console.log('ps', ps)

  validator.uuid(ps.idx_uuid, 'ps.idx_uuid')
  .then(() => validator.num(ps.code_label, 'ps.code_label') )
  .then(()=>{
    let languageCodes = commonData.getLabelsByType('language').map(x=>x.code_label);
    if(!languageCodes.includes(ps.code_label)){
      throw {status: 403, mess: '_dico/create-item.ctrl.js/main code_label is not on the list of language label'};
    }
  })
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )

  .then(() => this.createItem(tx, ps.idx_uuid, ps.code_label) )

  // .then(()=> ehg.getExtendHeadGraph(tx, ps.idx_uuid) )
  // .then(result => {console.log('data result', result); return result})
  .then(data=> utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'dico/create-item.ctrl.js/main'}, res, tx)} )
};
