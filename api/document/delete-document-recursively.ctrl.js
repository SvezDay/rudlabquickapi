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
let deleteIndexRecall = require('../games/recall/delete-index-recall.ctrl').deleteIndexRecall;

module.exports.deleteDocument = (tx, idx_uuid)=>{ //  Input: tx, idx_uuid  |  Output: void
  return new Promise((resolve, reject)=>{

    let one = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    OPTIONAL MATCH p=(t)-[:Has*]->(ns:Note)
    DETACH DELETE ns, t, i
    `;
    tx.run(one, {idx_uuid:idx_uuid})
    .then(()=> deleteIndexRecall(tx, idx_uuid) )
    .then(()=> resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/deleteDocument'}); })
  })
}

module.exports.documentRecursivity = (tx, idx_uuid)=>{ //  Input: tx, idx_uuid  |  Output: idxList
  return new Promise((resolve, reject)=>{
    let idxList = [];

    let one = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    OPTIONAL MATCH p=(t)-[:Manage]->(is:Index)
    WITH COUNT(is) AS countis
    CALL apoc.do.when(countis>0
        ,'MATCH (i:Index{uuid:{idx_uuid}})-[]->(t:Title) OPTIONAL MATCH p2=(t)-[:Manage]->(is:Index) RETURN COLLECT(DISTINCT is) as children'
        ,'RETURN idx_uuid AS alone'
        ,{idx_uuid:$idx_uuid}) YIELD value
    RETURN value
      `;

    tx.run(one, {idx_uuid:idx_uuid}).then(parser.parse)
    // .then(data => {console.log(' ========================== data: ', data); return data; })
    .then(data=>{
      if(data[0].hasOwnProperty('children')){
        let promises = [];
        for(var i=0; i<data[0].children.length; i++){
          promises.push( this.documentRecursivity(tx, data[0].children[i].uuid) );
        }
        return Promise.all(promises).then(()=> {
          idxList.push(idx_uuid);
          this.deleteDocument(tx, idx_uuid)
        });
      }else if (data[0].hasOwnProperty('alone')) {
        idxList.push(idx_uuid);
        return this.deleteDocument(tx, data[0].alone);
      }else{
        throw {status: 400, mess: 'document/delete-document-recursively.ctrl.js/documentRecursivity/ returns value'}
      }
    })
    .then(()=> resolve(idxList) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/documentRecursivity'}); })
  })
}
module.exports.deleteIndexRecallList = (tx, idxList)=>{ //  Input: tx, idxList  |  Output: void
  return new Promise((resolve, reject)=>{

    Promise.resolve()
    .then(()=>{
      let promises = [];
      for(var i=0; i<idxList.length; i++){
        promises.push( deleteIndexRecall(tx, idxList[i]) );
      }
      return Promise.all(promises);
    })
    .then(()=> resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/deleteDocument'}); })
  })
}

module.exports.main = (req, res, next)=>{ //  Input: note_uuid  |  Output: void
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;

  validator.uuid(ps.idx_uuid, 'ps.idx_uuid')
  .then(()=> miscellaneousReq.access2Any(tx, ps.uid, ps.idx_uuid) )

  .then(()=>  this.documentRecursivity(tx, ps.idx_uuid))
  .then(idxList=> this.deleteIndexRecallList(tx, idxList))

  .then(()=> utils.commit(tx, res, ps.uid) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/main'}, res, tx)} )
};
