'use-strict';
// CONFIG ----------------------------------------------------------------------
const tokenGen = require('../_services/token.service');
const driver = require('../../dbconnect');
// LIB ---------------------------------------------------------------------
const parser = require('parse-neo4j');
const bluemise = require('bluebird');
// SERVICES --------------------------------------------------------------------
const utils = require('../_services/utils.service');
const validator = require('../_services/validator.service');
// REQUEST ---------------------------------------------------------------------
// COMMON ----------------------------------------------------------------------
// CONTROLLER ------------------------------------------------------------------

/*
* Input:
* Output: list[{recall, from, to}]
*/
module.exports.main = (req, res, next)=>{
  let session = driver.session()
  let tx = session.beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;
  ps.now = new Date().getTime();
  console.log('ps', ps)

  Promise.resolve()
  .then(() => {
    let query = `
      MATCH (p:Person{uuid:'${ps.uid}'})-[]->(rs:Recall{status:false})
      RETURN rs`;
    return tx.run(query).then(parser.parse)
  })
  .then(result => {console.log('result of first part', result); return result})
  .then(recalls => {
    if(!recalls.length){throw{status:200, mess: "no more suspended card"}}
    let one = "WITH [] as list "
      , two = " RETURN list";
    recalls.forEach((r, i)=>{
      one += `
        MATCH (from_${r.id}{uuid:'${r.from}'})
        MATCH (to_${r.id}{uuid:'${r.to}'})
        MATCH (i_${r.id}:Index{uuid:'${r.idx_uuid}'})-[:Has]->(t_${r.id}:Title)
        WITH list + {
          from:{uuid:from_${r.id}.uuid, value:from_${r.id}.value, label:COALESCE(from_${r.id}.label, 'Title')}
          , to:{uuid:to_${r.id}.uuid, value:to_${r.id}.value, label:COALESCE(to_${r.id}.label, 'Title')}
          , recall:{uuid:'${r.uuid}', idx_uuid:'${r.idx_uuid}', tit_value:t_${r.id}.value}
        } as list
      `;
    })
    console.log("one+two", one+two)
    return tx.run(one+two).then(parser.parse)
  })
  .then(data => {console.log("data, after getFromTo ", data); return data})
  .then(data => utils.commit(session, tx, res, ps.uid, data[0]) )
  .catch(err =>{console.log(err); utils.fail(session, {status: err.status || 400, mess: err.mess || 'game/get-suspended.ctrl.js/main'}, res, tx)} )
};
