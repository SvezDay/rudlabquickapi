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
// CONTROLLERS -----------------------------------------------------------------
let deleteIndexRecall = require('../games/recall/delete-index-recall.ctrl').deleteIndexRecall;

module.exports.delDocIndex = (tx, idx_uuid)=>{ // Input: idx_uuid || Output: {result:true or false}
  // DELETE DOC CONTAINER TITLE NODES
  return new Promise((resolve, reject)=>{
    const query = `
    MATCH (top)-[:Manage]->(idx:Index{uuid:$idx_uuid})-[:Has]->(t:Title)
    OPTIONAL MATCH (t)-[:Manage]->(tis:Index)
    WITH top, tis, count(tis) as countTis

        CALL apoc.do.when(countTis>0
          ,"MATCH (top) WHERE top={top} MATCH (tis) WHERE tis={tis} CREATE (top)-[:Manage]->(tis) RETURN true"
          ,"RETURN false",{top:top, tis:tis}) YIELD value
        WITH value as v1

    MATCH (top)-[:Manage]->(idx:Index{uuid:$idx_uuid})-[:Has]->(t:Title)
    OPTIONAL MATCH (t)-[:Has*]->(ns:Note)-[:Manage]->(nsis:Index)
    WITH top, nsis, count(nsis) as countNsis

        CALL apoc.do.when(countNsis>0
          ,"MATCH (top) WHERE top={top} MATCH (nsis) WHERE nsis={nsis} CREATE (top)-[:Manage]->(nsis) RETURN true"
          ,"RETURN false",{top:top, nsis:nsis}) YIELD value
        WITH value as v2

    MATCH (idx:Index{uuid:$idx_uuid})-[:Has]->(t:Title)
    OPTIONAL MATCH (t)-[:Has*]->(ns:Note)

        DETACH DELETE idx, t, ns

    RETURN true
    `;

    return tx.run(query, {idx_uuid:idx_uuid})
    .then(() => { resolve() })
    .catch(err =>{console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>',err); reject({status: err.status || 400, mess: err.mess || 'document/delete-document.ctrl.js/delDocIndex'}); })
  })
}


module.exports.main = (req, res, next)=>{ //  Input: idx_uuid  |  Output: true or false
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log(ps)

  validator.uuid(ps.idx_uuid, 'ps.idx_uuid')
  .then(()=> miscellaneousReq.access2Index(tx, ps.uid, ps.idx_uuid) )
  .then(()=> this.delDocIndex(tx, ps.idx_uuid) )
  .then(()=> deleteIndexRecall(tx, ps.idx_uuid) )
  .then(()=> utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log('||||||||||||||||||||||||||||||||||||||||||||||||',err); utils.fail({status: err.status || 400, mess: err.mess || 'document/delete-document.ctrl.js/main'}, res, tx)} )

};
