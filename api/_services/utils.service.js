'use-strict';
const tokenGen = require('./token.service');
const self = {
  expire: ()=>{
    return new Date().getTime() + (1000 * 60 * 60 * 24);
  }
  // ERROR HANDLE
  /*
  * route method: .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'create-note.ctrl.js/traduction'}, res, tx)} )
  * promise method: .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'extend-column-graph.ctr.js / getRowGraph / columnGraph.length is false'}); })
  * throw: {status:400, mess: 'extend-column-graph.ctr.js / getRowGraph / columnGraph.length is false'}
  */
  , fail: (e, res, tx)=>{
    console.log(' ===============================================ERROR MESSAGE: ');
    console.log(' STATUS: ',e.status);
    console.log(' MESSAGE: ',e.mess);
    if(tx) tx.rollback();
    // res.status(e.status || 400).json({mess: e.mess || null, error: e.err || e})
    res.status(e.status || 400).json(e);
  }
  , commit: (tx, res, id, p)=>{
    let exp = self.expire();
    let params = {
      token: tokenGen(id, exp),
      exp: exp,
      data: p
    };
    // console.log("in commit p", p.stat)
    tx.commit();
    // res.status(p && p.stat || 200).json(params);
    res.status(200).json(params);
  }
  , respond: (res, id, p)=>{ // This commit respond without any db transaction
    let exp = self.expire();
    let params = {
      token: tokenGen(id, exp),
      exp: exp,
      data: p
    };
    res.status(p && p.stat || 200).json(params);
  }
  // , sortLabel: (obj)=>{
  //   return new Promise((resolve)=>{
  //     if(obj.labels){
  //       obj.labels = obj.labels.filter(x => {return x != 'Prop'})[0];
  //     }else{
  //       for( let v in obj){
  //         if(typeof obj[v] == 'object'){
  //           self.sortLabel(obj[v]).then(res => {
  //             obj[v] = res;
  //             resolve()})
  //           }
  //         }
  //       }
  //       resolve(obj);
  //     })
  //   }

};

module.exports = self;
