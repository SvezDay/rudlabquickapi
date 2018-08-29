'use-strict';
const parser = require('parse-neo4j');

/*
* Used by: maj.Ctrl
* Input:
* Output: void
*/
module.exports.createRecall = (tx, uid, combs)=> { //comb as combinaison of q/a
    return new Promise((resolve, reject)=>{
      let now = new Date().getTime();
      // console.log('============================================================= ZZ')
      // console.log('createRecall', combs)

      let quer = `MATCH (p:Person{uuid:'${uid}'}) `
      for (let i = 0; i<combs.length; i++) {

        quer += `
        CREATE (r_${i}:Recall {from:'${combs[i].from}', to:'${combs[i].to}', idx_uuid:'${combs[i].idx_uuid}',
              level:0, deadline:toInteger(${now}), status:true, uuid:apoc.create.uuid()})
        CREATE (p)-[rel_${i}:Recall]->(r_${i}) `
      }
      // console.log('quer', quer)
      // resolve()
      tx.run(quer)
      .then(() =>{ resolve() })
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/recall.request.js/createRecall'}); })
    })
}
/*
* Used by: maj.Ctrl
* Input:
* Output: void
*/
module.exports.deleteRecall = (tx, recalls)=> {
    return new Promise((resolve, reject)=>{
      // console.log('hey recalls', recalls)
      let arr = recalls.map(x=>x.uuid.toString()) || [];
      let quer = `
        WITH split('${arr}', ',') as list
        MATCH (r:Recall)
        WHERE r.uuid IN list
        DETACH DELETE r
      `;
      // console.log("=============================================================== DELETE RECALL")
      // console.log(quer)
      tx.run(quer)
      .then(() =>{ resolve() })
      .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || '_services/recall.request.js/deleteRecall'}); })
    })
}
