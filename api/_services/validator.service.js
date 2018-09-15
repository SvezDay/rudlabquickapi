'use-strict';
const eval = require('email-validator');
const uuidval = require('uuid-validate');
const tokenGen = require('./token.service');

const self = {
  uuid: (data, name="Uuid")=>{
    return new Promise((resolve, reject)=>{
      !uuidval(data) ?
        reject({err:`${name} is not an uuid: ${data}`}) : resolve()
    });
  },
  uuidOrNull: (data, name="Uuid")=>{
    return new Promise((resolve, reject)=>{
      uuidval(data) ? resolve() :
          data==null ? resolve() : reject({err:`${name} is not an uuid: ${data}`})
    });
  },
  isUndefined: (data, name="Uuid")=>{
    return new Promise((resolve, reject)=>{
      data==undefined ? resolve(true) : resolve(false)
    });
  },
  email: (data, name="Email")=>{
    return new Promise((resolve, reject)=>{
      !eval.validate(data) ?
        reject({err:`${name} is not an email: ${data}`}) : resolve()
    });
  },
  str: (data, name="A Param")=>{
    return new Promise((resolve, reject)=>{
      // isNaN(name) ? name = "A PARAM" : null
       typeof data == 'string' && data.replace(" ","").length >= 1?
        resolve() :
        reject({err: `${name} is not a string: ${data}`})
    })
  },
  strOrNull: (data, name="A Param")=>{
    return new Promise((resolve, reject)=>{
      // isNaN(name) ? name = "A PARAM" : null
      !data || typeof data == 'string' ?
        resolve():
        reject({err: `${name} is not a string: ${data}`})
    })
  },
  num: (data, name="A Param")=>{
    return new Promise((resolve, reject)=>{
      isNaN(data) || typeof data != 'number' ?
        reject({err: `${name} is not a number: ${data}`}) : resolve()
    })
  },
  boolean: (data, name="A Param")=>{
    return new Promise((resolve, reject)=>{
      isNaN(data) || typeof data != 'boolean' ?
        reject({err: `${name} is not a boolean: ${data}`}) : resolve()
    })
  },
  enum: (data, enums,)=>{
    return new Promise((resolve, reject)=>{
      !enums.includes(data) ? reject({err: `This is not an enum: ${data}`}) : resolve()
    })
  },
  timestamp: (data, name="A Param")=>{
    return new Promise((resolve, reject)=>{
      if(isNaN(data) || typeof data != 'string'){
        reject({err: `${name} is not a timestamp: ${data}`})
      }else if(typeof JSON.parse(data) != 'number'){
        reject({err: `${name} is not a timestamp: ${data}`})
      }else {
        resolve()
      }

    })
  },
  retObjInField1: (data)=>{
    return new Promise((resolve, reject)=>{
      if(data.records.length && data.records[0]._fields.length == 1){
        return data.records[0]._fields[0];
      }else{
        reject({mess:"data doesn't return a single object form ._field[0]"}) }
    })
  },
  retArrInField1: (data)=>{
    return new Promise((resolve, reject)=>{
      if(data.records.length && data.records[0]._fields.length > 1){
        return data.records[0]._fields;
      }else{
        reject({mess:"data doesn't return an list array form ._field[0]"}) }
    })
  },
  retArrInField2: (data)=>{},
  retObjInRec: (data)=>{},
  retArrInRec: (data)=>{}

};

module.exports = self;
