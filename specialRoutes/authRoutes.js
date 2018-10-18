'use-strict';
const parser = require('parse-neo4j');
const driver = require('../dbconnect');
const utils = require('../api/_services/utils.service');
const validator = require('../api/_services/validator.service');
let tokenGen = require('../api/_services/token.service');



// @Params:ps [text:email, text:password, text:first, text:last]
module.exports.manual_register = (req, res, next)=>{
  let ps = req.body;
  let session = driver.session();
let tx = session.beginTransaction();

  let query = `
  MATCH (a:Person{email:$email})
  WITH COUNT(a) AS numb
  CALL apoc.do.when(
    numb=1,
    "RETURN {error: $email+' already exists'} AS data",
    "CREATE (a:Person)
    SET a.uuid = apoc.create.uuid(),
    a.email = $email,
    a.password = $password,
    a.first = $first,
    a.last = $last,
    a.admin = 'user',
    a.subscription_commit_length = ''
    CREATE (b:Board_Activity{course_wait_recall:[], uuid:apoc.create.uuid()})
    CREATE (t:Todo{uuid:apoc.create.uuid()})
    CREATE (t)<-[:Linked]-(a)-[:Linked]->(b)
    RETURN {uuid:a.uuid, first:a.first} AS data",
    {email:$email, password:$password, first:$first, last:$last}
  ) YIELD value
  RETURN value.data
  `;

  validator.email(ps.email)
  .then(()=>{ return validator.str(ps.password)})
  .then(()=>{ return validator.str(ps.first)})
  .then(()=>{ return validator.str(ps.last)})
  .then(()=>{ return tx.run(query, ps) }).then(parser.parse)
  .then( data => {
    if(data[0].uuid && data[0].first){
      utils.commit(session, tx, res, data[0].uuid,{first:data[0].first})
    }else {
      throw {status: 403, mess: data.error || 'no data returned after manual_register'};
    }
  })
  .catch(e => { utils.fail(ession, e, res, tx) })
};


// @Params:ps [text:email, text:password]
module.exports.manual_authenticate = (req, res, next)=>{
  let ps = req.body;
  let session = driver.session();
let tx = session.beginTransaction();

  let query = `
  MATCH (a:Person{email:$email, password:$password})
  RETURN {uuid:a.uuid, first:a.first} AS data
  `;

  validator.email(ps.email)
  .then(()=>{ return validator.str(ps.password)})
  .then(()=>{ return tx.run(query, ps) }).then(parser.parse)
  .then( data => {
    // console.log('====================================================== manual_authenticate')
    // console.log('data', data)
    if(data[0].uuid && data[0].first){
      utils.commit(session, tx, res, data[0].uuid,{first:data[0].first})
    }else {
      throw {
        status: 403,
        mess: data.error || 'no data returned after manual_authenticate'
      };
    }
  })
  .catch(e => { console.log('check', e); utils.fail(session, e, res, tx) })
};
