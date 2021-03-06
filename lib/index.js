'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _connect = require('connect');

var _connect2 = _interopRequireDefault(_connect);

var _getPort = require('get-port');

var _getPort2 = _interopRequireDefault(_getPort);

var _osHostname = require('os-hostname');

var _osHostname2 = _interopRequireDefault(_osHostname);

var _open = require('open');

var _open2 = _interopRequireDefault(_open);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

var _sprintf = require('zero-fmt/sprintf');

var _sprintf2 = _interopRequireDefault(_sprintf);

var _urlrouter = require('urlrouter');

var _urlrouter2 = _interopRequireDefault(_urlrouter);

var _zeroLang = require('zero-lang');

var _visualize = require('./controller/visualize');

var _visualize2 = _interopRequireDefault(_visualize);

var _dependencies = require('./controller/dependencies');

var _dependencies2 = _interopRequireDefault(_dependencies);

var _dependenciesSVG = require('./controller/dependenciesSVG');

var _dependenciesSVG2 = _interopRequireDefault(_dependenciesSVG);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * entry module.
 * @module ./index
 * @see module:./controller/visualize
 * @see module:./controller/dependenciesSVG
 */


var DEFAULT_CONFIG = {
  analyser: 'npm',
  root: process.cwd()
};

/** visualize. */


function startServer(server, config) {
  /**
   * start the web server.
   * @function
   * @param {object} server - a connect server.
   * @param {object} config - configuration.
   */
  (0, _osHostname2.default)(function (err, name) {
    if (err) {
      name = '127.0.0.1';
    }
    server.listen(config.port);
    var uri = (0, _sprintf2.default)('http://%s:%d/visualize', name, config.port);
    if (config.open) {
      (0, _open2.default)(uri);
    }
  });
}

exports.default = function () {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  /**
   * entry function.
   * @function
   * @param {object} config - configuration for starting a server.
   */
  config = (0, _zeroLang.extend)({}, DEFAULT_CONFIG, config);

  var server = (0, _connect2.default)();

  /** parsing body. */
  server.use(_bodyParser2.default.json()) // parse json body
  .use(_bodyParser2.default.urlencoded({
    extended: true
  })) // parse urlencoded body
  .use(_bodyParser2.default.raw()) // parse raw body
  .use(_bodyParser2.default.text()); // parse text body

  /** adding utils to request and response context. */
  server.use(function (req, res, next) {
    var urlInfo = _url2.default.parse(req.url, true);
    var query = urlInfo.query || {};
    var body = req.body || {};

    /** req.urlInfo */
    req.urlInfo = urlInfo;
    /** req.pathname */
    req.pathname = decodeURIComponent(urlInfo.pathname);

    /** req.params (combination of query and body) */
    req.params = (0, _zeroLang.extend)({}, query, body);
    /** req.query */
    req.query = query;
    /** req.body */
    req.body = body;

    /** res.jsonRes(data) (generate JSON response) **/
    res.jsonRes = function (data) {
      var buf = new Buffer(JSON.stringify(data), 'utf8');
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Length', buf.length);
      res.end(buf);
    };

    /** res.htmlRes(data) (generate HTML response) */
    res.htmlRes = function (data) {
      var buf = new Buffer(data);
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Length', buf.length);
      res.end(buf);
    };

    next();
  });

  /** serving the static files */
  server.use('/src/locale', (0, _serveStatic2.default)((0, _path.resolve)(__dirname, '../src/locale')));
  server.use('/dist', (0, _serveStatic2.default)((0, _path.resolve)(__dirname, '../dist')));

  /** routing */
  server.use((0, _urlrouter2.default)(function (app) {
    /** serving the visulizing page */
    app.get('/visualize', (0, _visualize2.default)(config)); // needed to pass configuration to the web app

    /** serving dependencies as json format */
    app.get('/dependencies', (0, _dependencies2.default)());

    /** TODO serving the .svg file */
    app.get('/dependencies.svg', (0, _dependenciesSVG2.default)());
  }));

  if (config.port) {
    /** starting server in a particular port */
    startServer(server, config);
  } else {
    /** starting server in a random available port */
    (0, _getPort2.default)().then(function (port) {
      config.port = port;
      startServer(server, config);
    }, function (err) {
      throw err;
    });
  }
};