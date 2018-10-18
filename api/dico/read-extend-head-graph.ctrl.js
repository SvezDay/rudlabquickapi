'use-strict';
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
const graphReq = require('../_services/graph.request');
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------


/*
* By:
* Input: tx, idx_uuid
* Output: index, title, notes(at relation r1)
*/
module.exports.getExtendHeadGraph = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    let query = `
      MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
      OPTIONAL MATCH (t)-[]->(ns:Note)
      RETURN {index:{uuid:i.uuid, model:i.model}, title:{uuid:t.uuid, value:t.value, recallable:t.recallable}, item:COLLECT(DISTINCT {uuid:ns.uuid, value:ns.value, code_label:ns.code_label})}
    `;
    // console.log('query', query)
    tx.run(query,{idx_uuid:idx_uuid}).then(parser.parse)
    .then(data => {
      // console.log('data', data[0])
      !data[0].item.length || !data[0].item[0].uuid ? data[0].item = [] : null
      return data[0];
    })
    .then(graph=>resolve(graph) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'dico/read-extend-head-graph.ctrl.js/getExtendHeadGraph'}); })
  })
};

/*
* Input: idx_uuid
* Output: index, title, notes(at relation r1)
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.idx_uuid)
  .then(() => miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )

  .then(() => this.getExtendHeadGraph(tx, ps.idx_uuid) )

  .then(graph=>utils.commit(session, tx, res, ps.uid, graph) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'dico/read-extend-head-graph.ctr.js/main'}, res, tx)} )
};
