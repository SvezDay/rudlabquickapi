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
// const descendantReq = require('../_services/descendant.request');
// const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
const commonData=require('../_models/common.data');
// CONTROLLER ------------------------------------------------------------------


/*
* Input: tx, item_uuid
* Output: notes(code_label 8 language)
*/
module.exports.getColumnGraph = (tx, item_uuid)=>{
  return new Promise((resolve, reject)=>{
    let def;
    Promise.resolve()
    .then(()=>{ defCode = commonData.getLabelByDesignation("Definition").code_label })
    .then(()=>{
      let query = `
        MATCH (n:Note{uuid:$item_uuid})
        WITH n, [n] as list
        OPTIONAL MATCH (n)-[*]->(ns:Note) WHERE ns.code_label <> $defCode
        WITH list + COLLECT(DISTINCT ns) as list
        RETURN list `;
        // console.log("getColumnGraph query", query)
      return tx.run(query, {item_uuid:item_uuid, defCode:defCode}).then(parser.parse)
    })
    // tx.run(query).then(graph => {console.log('graph result column', graph); return graph}).then(parser.parse)
    .then(data => {console.log('graph result', data); return data})
    .then(data=>resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_dico/read-extend-column-graph.ctrl.js/getColumnGraph'}); })
  })
};
/*
* Input: tx, columnGraph
* Output: notes(code_label 8 language)
*/
module.exports.getRowGraph = (tx, columnGraph)=>{
  return new Promise((resolve, reject)=>{
    let def;
    let query =" WITH [] as list";
    Promise.resolve()
    .then(()=>{ def = commonData.getLabelByDesignation("Definition") })
    .then(()=>{
      if(!columnGraph.length){
        throw {status: 403, mess:'extend-column-graph.ctr.js / getRowGraph / columnGraph.length is false'}
      }
    })
    .then(()=>{
      Array.prototype.forEach.call(columnGraph, function(x, i){
        query += `
        MATCH (n${i}:Note{uuid:'${x.uuid}'})
        OPTIONAL MATCH (n${i})-[]->(d${i}:Note{code_label:$defCode})
        WITH list + {traduction:{uuid:n${i}.uuid, value:n${i}.value, code_label:n${i}.code_label},
        definition:{uuid:d${i}.uuid, value:d${i}.value, code_label:d${i}.code_label}} as list `;
      })
      query+= " RETURN list";
      // console.log('query', query)
      return tx.run(query, {defCode:defCode}).then(parser.parse);
    })
    .then(data=>{
      // cleaning definition object
      if(!data.length){
        return data;
      }else{
        Array.prototype.forEach.call(data[0], function(x, i){
          return x.definition.uuid==null ? x.definition = {} : null
        })
        return data;
      }
    })
    .then(data => {console.log('graph result', data[0]); return data})
    .then(data=>resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'dico/read-extend-column-graph.ctrl.js/getRowGraph'}); })

  })
};

/*
* Input: item_uuid
* Output: notes(code_label 8 language)
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  console.log('check headers', ps)

  validator.uuid(ps.item_uuid, 'ps.item_uuid')
  .then(() => miscellaneousReq.access2Note(tx, ps.uid, ps.item_uuid) )

  .then(() => this.getColumnGraph(tx, ps.item_uuid) )
  .then(data => this.getRowGraph(tx, data) )
  // Promise.resolve()
  .then(data=>utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'dico/read-extend-column-graph.ctr.js/main'}, res, tx)} )
};
