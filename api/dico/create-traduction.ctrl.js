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
// const ehg=require('./read-extend-head-graph.ctrl');
// const ecg=require('./read-extend-column-graph.ctrl');


/*
* By:
* Input: tx, item_uuid, code_label
* Output: traduction:Note
*/
module.exports.createTraduction = (tx, item_uuid, code_label)=>{
  return new Promise((resolve, reject)=>{
    let labelList = commonData.getLabelsByType("language").map(x=>x.code_label)
    // console.log(" ============================================================= labelList", labelList)

    let query = `
      MATCH (item:Note{uuid:$item_uuid})
      OPTIONAL MATCH p=(item)-[*]->(ns:Note) WHERE ns.code_label IN $labelList
      WITH item, size(collect( distinct ns)) AS sns, last( collect( distinct ns )) AS last
      CALL apoc.do.when(sns=0,
      "CREATE (new:Note {value:'Undefined', code_label:$code_label, uuid:apoc.create.uuid()}) CREATE (item)-[h:Has]->(new) RETURN new",
      "CREATE (new:Note {value:'Undefined', code_label:$code_label, uuid:apoc.create.uuid()}) CREATE (last)-[h:Has]->(new) RETURN new", {item:item, last:last, code_label:$code_label}) YIELD value
      RETURN value`;
    // console.log('query', query)

    tx.run(query, {item_uuid:item_uuid,code_label:code_label, labelList:labelList}).then(parser.parse)
    // .then(data=>{console.log('data data data data data', data); return data; })
    .then(data=>{delete data[0].new.id; resolve(data[0].new) })
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/create-traduction.ctrl.js/createTraduction'}); })
  })
};

/*
* Input: item_uuid,code_label
* Output: traduction:Note
*/
module.exports.main = (req, res, next)=>{
  let ps = req.body;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  // console.log("================================================================ CREATE TRADUCTION")
  // console.log('ps', ps)

  validator.uuid(ps.item_uuid, 'ps.item_uuid')
  .then(()=>validator.num(ps.code_label, 'ps.code_label') )
  .then(()=> miscellaneousReq.access2Note(tx, ps.uid, ps.item_uuid) )

  .then(() => this.createTraduction(tx, ps.item_uuid, ps.code_label) )

  // .then(() => ecg.getColumnGraph(tx, ps.uid, ps.item_uuid) )
  // .then(list => ecg.getRowGraph(tx, ps.uid, list) )
  .then( data => utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'dico/create-traduction.ctrl.js/main'}, res, tx)} )
};
