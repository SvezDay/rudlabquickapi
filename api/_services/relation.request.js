'use-strict';
const parser = require('parse-neo4j');

/*
* Input: tx, topid bottid
* Output: void
*/
module.exports.attachNotes = (tx, topid, bottid)=>{
  // ATTACH 2 NODES
  return new Promise((resolve, reject)=>{
      let attach = `
        MATCH (top{uuid:'${topid}'})
        MATCH (bott{uuid:'${bottid}'})
        MERGE (top)-[:Has]->(bott)
      `;
      tx.run(attach).then(parser.parse)
      .then( result =>{ resolve(result) })
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/relation.request.js/attachNotes'}); })
  })
}
