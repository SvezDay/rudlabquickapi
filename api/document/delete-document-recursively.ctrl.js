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
* Input: tx, idx_uuid
* Output: model
*/
module.exports.deleteDocument = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    // console.log("Enter in deleteDocument with idx_uuid: ", idx_uuid)
    let now = new Date().getTime();

    let one = `
    MATCH (i:Index{uuid:$idx_uuid})-[]->(t:Title)
    OPTIONAL MATCH p=(t)-[:Has*]->(ns:Note)
    DETACH DELETE ns, t, i
    `;
    tx.run(one, {idx_uuid:idx_uuid, now:now})
    .then(()=> resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/deleteDocument'}); })
  })
}
/*
* By:
* Input: tx, idx_uuid
* Output: model
*/
module.exports.documentRecursivity = (tx, idx_uuid)=>{
  return new Promise((resolve, reject)=>{
    // console.log("Enter in documentRecursivity with idx_uuid: ", idx_uuid)
    let now = new Date().getTime();

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

    tx.run(one, {idx_uuid:idx_uuid, now:now}).then(parser.parse)
    // .then(data => {console.log(' ========================== data: ', data); return data; })
    .then(data=>{
      if(data[0].hasOwnProperty('children')){
        let promises = [];
        for(var i=0; i<data[0].children.length; i++){
          promises.push( this.documentRecursivity(tx, data[0].children[i].uuid) );
        }
        return Promise.all(promises).then(()=> this.deleteDocument(tx, idx_uuid));
      }else if (data[0].hasOwnProperty('alone')) {
        return this.deleteDocument(tx, data[0].alone);
      }else{
        throw {status: 400, mess: 'document/delete-document-recursively.ctrl.js/documentRecursivity/ returns value'}
      }
    })
    .then(()=> resolve() )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/documentRecursivity'}); })
  })
}
/*
* By:
* Input: note_uuid
* Output: void
*/
module.exports.main = (req, res, next)=>{
  let ps = req.headers;
  let tx = driver.session().beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log("ps", ps)

  validator.uuid(ps.idx_uuid, 'ps.idx_uuid')
  .then(()=> miscellaneousReq.access2Any(tx, ps.uid, ps.idx_uuid) )

  .then(()=>  this.documentRecursivity(tx, ps.idx_uuid))

  .then(data=> utils.commit(tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'document/delete-document-recursively.ctrl.js/main'}, res, tx)} )
};
