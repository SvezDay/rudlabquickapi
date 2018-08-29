module.exports = {
  labels: [
    {designation:"Undefined", type:"special", code_label:1.1}
    , {designation:"Title", type:"special", code_label:1.2}
    , {designation:"Reference", type:"who", code_label:2.1}
    , {designation:"Author", type:"who", code_label:2.2}
    , {designation:"Founder", type:"who", code_label:2.3}
    , {designation:"Owner", type:"who", code_label:2.4}
    , {designation:"Citation", type:"who", code_label:2.5}
    , {designation:"Origin", type:"who", code_label:2.6}
    , {designation:"Context", type:"what", code_label:3.1}
    , {designation:"Analogy", type:"what", code_label:3.2}
    , {designation:"Example", type:"what", code_label:3.3}
    , {designation:"Introduction", type:"what", code_label:3.4}
    , {designation:"Story", type:"what", code_label:3.5}
    , {designation:"Subject", type:"why", code_label:4.1}
    , {designation:"Goal", type:"why", code_label:4.2}
    , {designation:"Problem", type:"why", code_label:4.3}
    , {designation:"Synthese", type:"why", code_label:4.4}
    , {designation:"Principe", type:"how", code_label:5.1}
    , {designation:"Definition", type:"how", code_label:5.2}
    , {designation:"Property", type:"how", code_label:5.3}
    , {designation:"Theorem", type:"how", code_label:5.4}
    , {designation:"Rule", type:"how", code_label:5.5}
    , {designation:"Method", type:"how", code_label:5.6}
    , {designation:"Procedure", type:"how", code_label:5.7}
    , {designation:"Summary", type:"how", code_label:5.8}
    , {designation:"Date", type:"when", code_label:6.1}
    , {designation:"Duration", type:"when", code_label:6.2}
    , {designation:"Period", type:"when", code_label:6.3}
    , {designation:"Question", type:"extra", code_label:7.1}
    , {designation:"Exercice", type:"extra", code_label:7.2}
    , {designation:"Response", type:"extra", code_label:7.3}
    , {designation:"Solution", type:"extra", code_label:7.4}
    , {designation:"English", type:"language", code_label:8.1}
    , {designation:"French", type:"language", code_label:8.2}
    , {designation:"Spanish", type:"language", code_label:8.3}
    , {designation:"Portugese", type:"language", code_label:8.4}
    , {designation:"German", type:"language", code_label:8.5}
  ]
  ,labelsCombinaison: {
    blank:{
      1.1:[]
      ,1.2:[2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,2.1:[]
      ,2.2:[1.2, 2.3, 2.4, 2.5, 5.1, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,2.3:[1.2, 2.2, 2.4, 2.5, 5.1, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,2.4:[1.2, 2.2, 2.3, 2.5, 5.1, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,2.5:[2.2]
      ,2.6:[]
      ,3.1:[1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,3.2:[1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,3.3:[1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,3.4:[1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,3.5:[1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,3.6:[1.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,4.1:[1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,4.2:[1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,4.3:[1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,4.4:[1.2, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,5.1:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,5.2:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3,8.1,8.2,8.3]
      ,5.3:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.4, 5.5, 5.6,5.7,6.1,6.2,6.3]
      ,5.4:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3,  5.5, 5.6,5.7,6.1,6.2,6.3]
      ,5.5:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.6,5.7,6.1,6.2,6.3]
      ,5.6:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5,5.7,6.1,6.2,6.3]
      ,5.7:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,6.1,6.2,6.3]
      ,5.8:[1.2, 2.2]
      ,6.1:[]
      ,6.2:[]
      ,6.3:[]
      ,7.1:[7.3, 7.4]
      ,7.2:[7.3, 7.4]
      ,7.3:[7.1, 7.2]
      ,7.4:[7.1, 7.2]
    }
    ,dico: {
      8.1:[5.2, 8.2, 8.3, 8.4, 8.5]
      ,8.2:[5.2, 8.1, 8.3, 8.4, 8.5]
      ,8.3:[5.2, 8.1, 8.2, 8.4, 8.5]
      ,8.4:[5.2, 8.1, 8.2, 8.3, 8.5]
      ,8.5:[5.2, 8.1, 8.2, 8.3, 8.4]
    }
  }
  ,models: [
    {name:"blank", module:"document", labels:[1.2, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3, 7.1,7.2,7.3,7.4], native_label:[], optional_label:[2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3, 7.1,7.2,7.3,7.4]}
    ,{name:"dico", module:"document", labels:[5.2, 8.1,8.2,8.3, 8.4, 8.5], native_label:[], optional_label:[5.2,8.1,8.2,8.3,8.4,8.5]}
    ,{name:"book", module:"document", labels:[1.2, 2.2, 5.8], native_label:[2.2], optional_label:[2.1,2.5,5.8]}
    ,{name:"section-book", module:"document", native_label:[], optional_label:[2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2,5.3, 5.4, 5.5, 5.6,5.7,6.1,6.2,6.3, 7.1,7.2,7.3,7.4]}
    ,{name:"table", module:"document", labels:[], native_label:[], optional_label:[2.1]}
  ]

  //============================================================= MODELS
  // By:                  Input: model              Output: boolean
  ,includeInModel: function(model){
    return this.models.find(x=>x.name==model);
  }
  // By:                  Input: module              Output: name[]
  ,getModelByModule(module){
    return this.models.filter(x=>x.module==module).map(x=>x.name);
  }
  // By:                  Input:               Output: models[]
  ,getModels(){
    return this.models;
  }
  //============================================================= GRAPH
  // By:                  Input: graph              Output: boolean
  ,isGraphExist: function(graph){
    let found = false;
    for(var i = 0; i<this.models.length; i++){
      if(this.models[i].graph===graph){
        found=true;
        break;
      }
    }
    return found;
  }
  //============================================================= DESIGNATION

  //============================================================= LABELS
  // By:                  Input: code_label                 Output: label{}
  ,getLabelByCodeLabel(code_label){
    return this.labels.find(x=>x.code_label==code_label);
  }
  // By:                  Input:               Output:
  ,getLabelsByModelCode(model_code){
    let code_label_list = models.getModels().find(x=>x.code_name==model_code).labels;
    return this.labels.filter(x=> {
      return code_label_list.includes(x.code_label);
    });
  }
  // By:                  Input:               Output:
  ,getLabelsByType(type){
    return this.labels.filter(x=>x.type==type);
  }
  // By:                  Input: designation              Output: label
  ,getLabelByDesignation(designation){
    return this.labels.find(x=>x.designation==designation);
  }
  //============================================================= NATIVE_LABELS
  // By:                  Input: model              Output: native_label
  ,getNativeLabelByModel(model){
    return new Promise((resolve, reject)=>{
      console.log("model", model)
      let list = this.models.find(x=>x.name==model).native_label;
      Promise.resolve().then(() =>{
        resolve(list)
      }).catch(err=>{
        reject({status: 400, mess: 'commonData/getNativeLabelByModel'})
      });
    })
  }
  // By:                  Input: model              Output: native_label
  ,getNativeLabelByDesignation(designation){
    let list = this.models.find(x=>x.name==designation).native_label;
    return Promise.resolve(list);
  }
  //============================================================= OPTIONAL LABEL
  // By:                  Input: model              Output: boolean
  ,includeInOptionalLabel: function(model, code_label){
    let optionalLabel = this.models.find(x=>x.name==model).optional_label;
    return optionalLabel.find(x=>x==code_label);
  }

}
