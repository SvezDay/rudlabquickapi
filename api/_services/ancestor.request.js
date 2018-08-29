'use-strict';
const parser = require('parse-neo4j');
const utils = require('./utils.service');

/*
* Input: tx, uid, idx_uuid
* Output: ancestor[headGraph]
*/
module.exports.getAncestor = (tx, uid, idx_uuid)=>{
  // GET CONTAINER'S TITLE AND NODES
  return new Promise((resolve, reject)=>{
    // "MATCH (idx:Index)-[]->(title:Title) WHERE idx.uuid IN {ances_uuid} RETURN idx, title",
      // let query = `
      //   MATCH (p:Person{uuid:'${uid}'})
      //   MATCH path=(p)-[*]->(io:Index{uuid:'${idx_uuid}'})
      //   WITH p, io, SIZE(relationships(path)) AS relSize
      //   CALL apoc.do.when(relSize>1,
      //     "MATCH (p)-[*]->(ances:Index)-[*]->(io) WHERE p=p AND io=io RETURN collect(distinct ances.uuid) as ancestorIndex",
      //     "RETURN null", {p:p, io:io}
      //   ) YIELD value as result
      //   CALL apoc.do.when(relSize>1,
      //     "MATCH (idx:Index)-[]->(title:Title) WHERE idx.uuid IN {ances_uuid} RETURN {index:{uuid:idx.uuid, model:idx.model}, title:{uuid:title.uuid, value:title.value}} as result",
      //     "RETURN null as result", {ances_uuid:result.ancestorIndex}
      //   ) YIELD value as ancestor
      //   return collect( distinct ancestor) as ancestors
      // `;
      let query = `
        MATCH (i:Index{uuid:'${idx_uuid}'})
        OPTIONAL MATCH (i)<-[*]-(title:Title)<-[]-(index:Index)
        RETURN index, title LIMIT 1  `;


    tx.run(query)
    .then(parser.parse)
    // .then(data => {console.log("getAncestor", data); return data} )
    // .then(data => {
    //   // !data[0][0].result ? resolve([]) : resolve( data[0].map(x => x.result) )
    //   if(!data[0][0].result){
    //     // console.log('no ancestor')
    //     resolve([]);
    //   }else{
    //     // console.log('yes ancestor')
    //     resolve( data[0].map(x => x.result) )
    //   }
    // })
    .then(data => resolve(data[0]) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/ancestor.request.js/getAncestor'}); })
  })
}
