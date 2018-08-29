'use-strict';
// Adding the Apoc procedures library at the end of neo4j conf/neo4j-conf
// dbms.security.procedures.whitelist=apoc.coll.*,apoc.load.*
// Then install the apoc plugin in neo4j/plugins
const neo4j = require('neo4j-driver').v1;
const conf = require('./secret').driver_local;
const url = process.env.GRAPHENEDB_BOLT_URL || conf.bolt;
const usr = process.env.GRAPHENEDB_BOLT_USER || conf.username;
const pwd = process.env.GRAPHENEDB_BOLT_PASSWORD || conf.password;

const driver = neo4j.driver(url, neo4j.auth.basic(usr, pwd));

// module.exports = driver.session();
module.exports = driver;
