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
let deleteRecall = require('../games/recall/delete-recall.ctrl').deleteRecall;

module.exports.deleteNote = (tx, note_uuid)=>{ // Input: tx, note_uuid  | Output: model
  return new Promise((resolve, reject)=>{
    let now = new Date().getTime();

    let one = `
    MATCH (n:Note{uuid:$note_uuid})
    OPTIONAL MATCH p1=(n)-[:Manage]->(is:Index)
    WITH n, COUNT(is) AS countis

    CALL apoc.do.when(countis>0
        ,' MATCH (t:Title)-[*]->(n:Note)-[:Manage]->(is:Index) WHERE n={n} UNWIND is.uuid AS isu MATCH (isum:Index{uuid:is.uuid}) CREATE (t)-[:Manage]->(isum) RETURN n AS note'
        ,'MATCH (n) WHERE n={n} RETURN n AS note',{n:n}) YIELD value
    WITH value.note AS n
    OPTIONAL MATCH p2=(n)-[:Has]->(child:Note)
    WITH n, COUNT(child) AS countchild
    CALL apoc.do.when(countchild>0,
        ' MATCH (par)-[:Has]->(n:Note)-[:Has]->(ns:Note) WHERE n={n} UNWIND ns.uuid as nsu MATCH (nsum:Note{uuid:nsu}) CREATE (par)-[:Has]->(nsum) RETURN n AS note',
        'MATCH (n) WHERE n={n} RETURN n AS note',{n:n}) YIELD value
    WITH value.note as n
    OPTIONAL MATCH (n)-[:Linked]->(ns:Note)
    DETACH DELETE n, ns
      `;

    tx.run(one, {note_uuid:note_uuid, now:now}).then(parser.parse)
    // .then(data => {console.log(' ========================== data: ', data); return data; })
    .then(data=> resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'document/delete-note.ctrl.js/deleteNote'}); })
  })
}

module.exports.main = (req, res, next)=>{ // Input: note_uuid   |  Output: void
  let ps = req.headers;
  // let tx = driver.session().beginTransaction();
  let session = driver.session();
  let tx = session.beginTransaction();
  ps.uid = req.decoded.uuid;
  // console.log("ps", ps)

  validator.uuid(ps.note_uuid, 'ps.note_uuid')
  .then(()=> miscellaneousReq.access2Any(tx, ps.uid, ps.note_uuid) )

  .then(()=>  this.deleteNote(tx, ps.note_uuid))
  .then(()=> deleteRecall(tx, ps.note_uuid) )

  .then(data=> utils.commit(session, tx, res, ps.uid, data) )
  .catch(err =>{console.log(err); utils.fail(session,{status: err.status || 400, mess: err.mess || 'document/delete-note.ctrl.js/main'}, res, tx)} )
};
