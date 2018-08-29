const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const _ = require('lodash');
const path = require('path');
const favicon = require('serve-favicon');
const chokidar = require('chokidar');

const AuthRoutes = require('./specialRoutes/authRoutes');
const appRoutes = require('./api/appRoutes');
const tokenRoutes = require('./api/tokenRoutes');
const watcher = chokidar.watch('./api');

const app = express();
const port = process.env.PORT || 3200;

app.listen(port);

let allowCrossDomain = (req, res, next)=>{
   res.header("Access-Control-Allow-Origin", "http://localhost:5000", "http://localhost:4200", "https://rudlabquickapp2.herokuapp.com");
   res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, x-access-token");
   next();
};
let whitelist = ["http://localhost:4200", "http://localhost:5000", "https://rudlabquickapp2.herokuapp.com"];

let corsOptions = {
  origin: (origin, callback)=>{
    if(origin == undefined){
      callback(null, true) ;
    } else if(whitelist.indexOf(origin) !== -1){
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// return error message for unauthorized requests
let handleError = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({message:'Missing or invalid token'});
  }
  // res.status(500).json(err)
};

// app.use({$$DIRNAME:_dirname})
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'favicon.ico')));

app.use(allowCrossDomain);
app.options('*', cors())
app.use(handleError);
app.use(cors(corsOptions));

// Add cors protection
// Add the bodyParser limits
// Add the error module
// Add the scope checking


app.get('/', function(req, res){
  res.status(200).send('Access granted -- process.env.GRAPHENEDB_BOLT_URL: ');
});
app.post('/manual_authenticate', AuthRoutes.manual_authenticate);
app.post('/manual_register', AuthRoutes.manual_register);

// use "glob" to avoid to manage the appRoutes file, but directly in each file
// const docsRoutes = require('./api/docs');
// app.use('/api', docsRoutes);

app.use('/api', tokenRoutes.tokenDecoding, appRoutes());

if(process.env.NODE_ENV=='dev'){
  app.use('/dev', require('./devRoutes/routes.dev')());
  app.use('/devUid', tokenRoutes.tokenDecoding, require('./devRoutes/methodTesting.dev')());
}

if(process.env.NODE_ENV !== 'production'){
  watcher.on('ready', function(){
    watcher.on('all', function(){
      // console.log("Clearing /dist/ module cache from server")
      Object.keys(require.cache).forEach(function(id) {
        if (/[\/\\]app[\/\\]/.test(id)) delete require.cache[id]
      })
    })
  })
}


console.log('API server started on: localhost:' + port);
