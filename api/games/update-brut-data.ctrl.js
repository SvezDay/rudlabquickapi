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

module.exports.ubd = (tx, uid, file)=>{
  return new Promise((resolve, reject)=>{
    let dcd = require('../document/create-document.ctrl').createDocumentWithTitle;
    let dcid = require('../dico/create-item-and-defintion.ctrl.js').createItemAndDefintion;

    let datas = require(`../_datas/${file}`).data;
    let dico;
    
    dcd(tx, 'dico', uid, file.match(/([a-zA-Z0-9]{1,})/g)[0])
    // .then(data => {console.log('data', data); dico = data; })
    // .then(data=> dico = data )
    .then(data=>{
      // console.log('data', data);
      dico = data;
      let promises = [];
      for(var i=0; i<datas.length; i++){
        promises.push( dcid(tx, dico.index.uuid, 8.1, datas[i].english, 8.2, datas[i].french) )
      }
      return Promise.all(promises).then(()=>{console.log('all promises done')});
    })
    .then(() => resolve(dico) )
    .catch(err =>{console.log(err); reject({status: err.status || 400, mess: err.mess || 'game/get-suspended.ctrl.js/ubd'})} )
  })
}

module.exports.main = (req, res, next)=>{
  // permet d'implémenter manuellement une grande quantité de données
  let tx = driver.session().beginTransaction();
  let ps = req.body;
  ps.uid = req.decoded.uuid;

  this.ubd(tx, ps.uid, ps.file)
  .then(dico => utils.commit(tx, res, ps.uid, dico) )
  .catch(err =>{console.log(err); utils.fail({status: err.status || 400, mess: err.mess || 'game/get-suspended.ctrl.js/main'}, res, tx)} )
};
