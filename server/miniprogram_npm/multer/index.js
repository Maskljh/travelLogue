module.exports = (function() {
var __MODS__ = {};
var __DEFINE__ = function(modId, func, req) { var m = { exports: {}, _tempexports: {} }; __MODS__[modId] = { status: 0, func: func, req: req, m: m }; };
var __REQUIRE__ = function(modId, source) { if(!__MODS__[modId]) return require(source); if(!__MODS__[modId].status) { var m = __MODS__[modId].m; m._exports = m._tempexports; var desp = Object.getOwnPropertyDescriptor(m, "exports"); if (desp && desp.configurable) Object.defineProperty(m, "exports", { set: function (val) { if(typeof val === "object" && val !== m._exports) { m._exports.__proto__ = val.__proto__; Object.keys(val).forEach(function (k) { m._exports[k] = val[k]; }); } m._tempexports = val }, get: function () { return m._tempexports; } }); __MODS__[modId].status = 1; __MODS__[modId].func(__MODS__[modId].req, m, m.exports); } return __MODS__[modId].m.exports; };
var __REQUIRE_WILDCARD__ = function(obj) { if(obj && obj.__esModule) { return obj; } else { var newObj = {}; if(obj != null) { for(var k in obj) { if (Object.prototype.hasOwnProperty.call(obj, k)) newObj[k] = obj[k]; } } newObj.default = obj; return newObj; } };
var __REQUIRE_DEFAULT__ = function(obj) { return obj && obj.__esModule ? obj.default : obj; };
__DEFINE__(1748917627847, function(require, module, exports) {
var makeMiddleware = require('./lib/make-middleware')

var diskStorage = require('./storage/disk')
var memoryStorage = require('./storage/memory')
var MulterError = require('./lib/multer-error')

function allowAll (req, file, cb) {
  cb(null, true)
}

function Multer (options) {
  if (options.storage) {
    this.storage = options.storage
  } else if (options.dest) {
    this.storage = diskStorage({ destination: options.dest })
  } else {
    this.storage = memoryStorage()
  }

  this.limits = options.limits
  this.preservePath = options.preservePath
  this.fileFilter = options.fileFilter || allowAll
}

Multer.prototype._makeMiddleware = function (fields, fileStrategy) {
  function setup () {
    var fileFilter = this.fileFilter
    var filesLeft = Object.create(null)

    fields.forEach(function (field) {
      if (typeof field.maxCount === 'number') {
        filesLeft[field.name] = field.maxCount
      } else {
        filesLeft[field.name] = Infinity
      }
    })

    function wrappedFileFilter (req, file, cb) {
      if ((filesLeft[file.fieldname] || 0) <= 0) {
        return cb(new MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname))
      }

      filesLeft[file.fieldname] -= 1
      fileFilter(req, file, cb)
    }

    return {
      limits: this.limits,
      preservePath: this.preservePath,
      storage: this.storage,
      fileFilter: wrappedFileFilter,
      fileStrategy: fileStrategy
    }
  }

  return makeMiddleware(setup.bind(this))
}

Multer.prototype.single = function (name) {
  return this._makeMiddleware([{ name: name, maxCount: 1 }], 'VALUE')
}

Multer.prototype.array = function (name, maxCount) {
  return this._makeMiddleware([{ name: name, maxCount: maxCount }], 'ARRAY')
}

Multer.prototype.fields = function (fields) {
  return this._makeMiddleware(fields, 'OBJECT')
}

Multer.prototype.none = function () {
  return this._makeMiddleware([], 'NONE')
}

Multer.prototype.any = function () {
  function setup () {
    return {
      limits: this.limits,
      preservePath: this.preservePath,
      storage: this.storage,
      fileFilter: this.fileFilter,
      fileStrategy: 'ARRAY'
    }
  }

  return makeMiddleware(setup.bind(this))
}

function multer (options) {
  if (options === undefined) {
    return new Multer({})
  }

  if (typeof options === 'object' && options !== null) {
    return new Multer(options)
  }

  throw new TypeError('Expected object for argument options')
}

module.exports = multer
module.exports.diskStorage = diskStorage
module.exports.memoryStorage = memoryStorage
module.exports.MulterError = MulterError

}, function(modId) {var map = {"./lib/make-middleware":1748917627848,"./storage/disk":1748917627853,"./storage/memory":1748917627854,"./lib/multer-error":1748917627850}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627848, function(require, module, exports) {
var is = require('type-is')
var Busboy = require('busboy')
var extend = require('xtend')
var appendField = require('append-field')

var Counter = require('./counter')
var MulterError = require('./multer-error')
var FileAppender = require('./file-appender')
var removeUploadedFiles = require('./remove-uploaded-files')

function makeMiddleware (setup) {
  return function multerMiddleware (req, res, next) {
    if (!is(req, ['multipart'])) return next()

    var options = setup()

    var limits = options.limits
    var storage = options.storage
    var fileFilter = options.fileFilter
    var fileStrategy = options.fileStrategy
    var preservePath = options.preservePath

    req.body = Object.create(null)

    var busboy

    try {
      busboy = Busboy({ headers: req.headers, limits: limits, preservePath: preservePath })
    } catch (err) {
      return next(err)
    }

    var appender = new FileAppender(fileStrategy, req)
    var isDone = false
    var readFinished = false
    var errorOccured = false
    var pendingWrites = new Counter()
    var uploadedFiles = []

    function done (err) {
      if (isDone) return
      isDone = true
      req.unpipe(busboy)
      process.nextTick(() => {
        busboy.removeAllListeners()
      })
      next(err)
    }

    function indicateDone () {
      if (readFinished && pendingWrites.isZero() && !errorOccured) done()
    }

    function abortWithError (uploadError) {
      if (errorOccured) return
      errorOccured = true

      pendingWrites.onceZero(function () {
        function remove (file, cb) {
          storage._removeFile(req, file, cb)
        }

        removeUploadedFiles(uploadedFiles, remove, function (err, storageErrors) {
          if (err) return done(err)

          uploadError.storageErrors = storageErrors
          done(uploadError)
        })
      })
    }

    function abortWithCode (code, optionalField) {
      abortWithError(new MulterError(code, optionalField))
    }

    // handle text field data
    busboy.on('field', function (fieldname, value, { nameTruncated, valueTruncated }) {
      if (fieldname == null) return abortWithCode('MISSING_FIELD_NAME')
      if (nameTruncated) return abortWithCode('LIMIT_FIELD_KEY')
      if (valueTruncated) return abortWithCode('LIMIT_FIELD_VALUE', fieldname)

      // Work around bug in Busboy (https://github.com/mscdex/busboy/issues/6)
      if (limits && Object.prototype.hasOwnProperty.call(limits, 'fieldNameSize')) {
        if (fieldname.length > limits.fieldNameSize) return abortWithCode('LIMIT_FIELD_KEY')
      }

      appendField(req.body, fieldname, value)
    })

    // handle files
    busboy.on('file', function (fieldname, fileStream, { filename, encoding, mimeType }) {
      // don't attach to the files object, if there is no file
      if (!filename) return fileStream.resume()

      // Work around bug in Busboy (https://github.com/mscdex/busboy/issues/6)
      if (limits && Object.prototype.hasOwnProperty.call(limits, 'fieldNameSize')) {
        if (fieldname.length > limits.fieldNameSize) return abortWithCode('LIMIT_FIELD_KEY')
      }

      var file = {
        fieldname: fieldname,
        originalname: filename,
        encoding: encoding,
        mimetype: mimeType
      }

      var placeholder = appender.insertPlaceholder(file)

      fileFilter(req, file, function (err, includeFile) {
        if (err) {
          appender.removePlaceholder(placeholder)
          return abortWithError(err)
        }

        if (!includeFile) {
          appender.removePlaceholder(placeholder)
          return fileStream.resume()
        }

        var aborting = false
        pendingWrites.increment()

        Object.defineProperty(file, 'stream', {
          configurable: true,
          enumerable: false,
          value: fileStream
        })

        fileStream.on('error', function (err) {
          pendingWrites.decrement()
          abortWithError(err)
        })

        fileStream.on('limit', function () {
          aborting = true
          abortWithCode('LIMIT_FILE_SIZE', fieldname)
        })

        storage._handleFile(req, file, function (err, info) {
          if (aborting) {
            appender.removePlaceholder(placeholder)
            uploadedFiles.push(extend(file, info))
            return pendingWrites.decrement()
          }

          if (err) {
            appender.removePlaceholder(placeholder)
            pendingWrites.decrement()
            return abortWithError(err)
          }

          var fileInfo = extend(file, info)

          appender.replacePlaceholder(placeholder, fileInfo)
          uploadedFiles.push(fileInfo)
          pendingWrites.decrement()
          indicateDone()
        })
      })
    })

    busboy.on('error', function (err) { abortWithError(err) })
    busboy.on('partsLimit', function () { abortWithCode('LIMIT_PART_COUNT') })
    busboy.on('filesLimit', function () { abortWithCode('LIMIT_FILE_COUNT') })
    busboy.on('fieldsLimit', function () { abortWithCode('LIMIT_FIELD_COUNT') })
    busboy.on('close', function () {
      readFinished = true
      indicateDone()
    })

    req.pipe(busboy)
  }
}

module.exports = makeMiddleware

}, function(modId) { var map = {"./counter":1748917627849,"./multer-error":1748917627850,"./file-appender":1748917627851,"./remove-uploaded-files":1748917627852}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627849, function(require, module, exports) {
var EventEmitter = require('events').EventEmitter

function Counter () {
  EventEmitter.call(this)
  this.value = 0
}

Counter.prototype = Object.create(EventEmitter.prototype)

Counter.prototype.increment = function increment () {
  this.value++
}

Counter.prototype.decrement = function decrement () {
  if (--this.value === 0) this.emit('zero')
}

Counter.prototype.isZero = function isZero () {
  return (this.value === 0)
}

Counter.prototype.onceZero = function onceZero (fn) {
  if (this.isZero()) return fn()

  this.once('zero', fn)
}

module.exports = Counter

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627850, function(require, module, exports) {
var util = require('util')

var errorMessages = {
  LIMIT_PART_COUNT: 'Too many parts',
  LIMIT_FILE_SIZE: 'File too large',
  LIMIT_FILE_COUNT: 'Too many files',
  LIMIT_FIELD_KEY: 'Field name too long',
  LIMIT_FIELD_VALUE: 'Field value too long',
  LIMIT_FIELD_COUNT: 'Too many fields',
  LIMIT_UNEXPECTED_FILE: 'Unexpected field',
  MISSING_FIELD_NAME: 'Field name missing'
}

function MulterError (code, field) {
  Error.captureStackTrace(this, this.constructor)
  this.name = this.constructor.name
  this.message = errorMessages[code]
  this.code = code
  if (field) this.field = field
}

util.inherits(MulterError, Error)

module.exports = MulterError

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627851, function(require, module, exports) {
var objectAssign = require('object-assign')

function arrayRemove (arr, item) {
  var idx = arr.indexOf(item)
  if (~idx) arr.splice(idx, 1)
}

function FileAppender (strategy, req) {
  this.strategy = strategy
  this.req = req

  switch (strategy) {
    case 'NONE': break
    case 'VALUE': break
    case 'ARRAY': req.files = []; break
    case 'OBJECT': req.files = Object.create(null); break
    default: throw new Error('Unknown file strategy: ' + strategy)
  }
}

FileAppender.prototype.insertPlaceholder = function (file) {
  var placeholder = {
    fieldname: file.fieldname
  }

  switch (this.strategy) {
    case 'NONE': break
    case 'VALUE': break
    case 'ARRAY': this.req.files.push(placeholder); break
    case 'OBJECT':
      if (this.req.files[file.fieldname]) {
        this.req.files[file.fieldname].push(placeholder)
      } else {
        this.req.files[file.fieldname] = [placeholder]
      }
      break
  }

  return placeholder
}

FileAppender.prototype.removePlaceholder = function (placeholder) {
  switch (this.strategy) {
    case 'NONE': break
    case 'VALUE': break
    case 'ARRAY': arrayRemove(this.req.files, placeholder); break
    case 'OBJECT':
      if (this.req.files[placeholder.fieldname].length === 1) {
        delete this.req.files[placeholder.fieldname]
      } else {
        arrayRemove(this.req.files[placeholder.fieldname], placeholder)
      }
      break
  }
}

FileAppender.prototype.replacePlaceholder = function (placeholder, file) {
  if (this.strategy === 'VALUE') {
    this.req.file = file
    return
  }

  delete placeholder.fieldname
  objectAssign(placeholder, file)
}

module.exports = FileAppender

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627852, function(require, module, exports) {
function removeUploadedFiles (uploadedFiles, remove, cb) {
  var length = uploadedFiles.length
  var errors = []

  if (length === 0) return cb(null, errors)

  function handleFile (idx) {
    var file = uploadedFiles[idx]

    remove(file, function (err) {
      if (err) {
        err.file = file
        err.field = file.fieldname
        errors.push(err)
      }

      if (idx < length - 1) {
        handleFile(idx + 1)
      } else {
        cb(null, errors)
      }
    })
  }

  handleFile(0)
}

module.exports = removeUploadedFiles

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627853, function(require, module, exports) {
var fs = require('fs')
var os = require('os')
var path = require('path')
var crypto = require('crypto')
var mkdirp = require('mkdirp')

function getFilename (req, file, cb) {
  crypto.randomBytes(16, function (err, raw) {
    cb(err, err ? undefined : raw.toString('hex'))
  })
}

function getDestination (req, file, cb) {
  cb(null, os.tmpdir())
}

function DiskStorage (opts) {
  this.getFilename = (opts.filename || getFilename)

  if (typeof opts.destination === 'string') {
    mkdirp.sync(opts.destination)
    this.getDestination = function ($0, $1, cb) { cb(null, opts.destination) }
  } else {
    this.getDestination = (opts.destination || getDestination)
  }
}

DiskStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  var that = this

  that.getDestination(req, file, function (err, destination) {
    if (err) return cb(err)

    that.getFilename(req, file, function (err, filename) {
      if (err) return cb(err)

      var finalPath = path.join(destination, filename)
      var outStream = fs.createWriteStream(finalPath)

      file.stream.pipe(outStream)
      outStream.on('error', cb)
      outStream.on('finish', function () {
        cb(null, {
          destination: destination,
          filename: filename,
          path: finalPath,
          size: outStream.bytesWritten
        })
      })
    })
  })
}

DiskStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  var path = file.path

  delete file.destination
  delete file.filename
  delete file.path

  fs.unlink(path, cb)
}

module.exports = function (opts) {
  return new DiskStorage(opts)
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
__DEFINE__(1748917627854, function(require, module, exports) {
var concat = require('concat-stream')

function MemoryStorage (opts) {}

MemoryStorage.prototype._handleFile = function _handleFile (req, file, cb) {
  file.stream.pipe(concat({ encoding: 'buffer' }, function (data) {
    cb(null, {
      buffer: data,
      size: data.length
    })
  }))
}

MemoryStorage.prototype._removeFile = function _removeFile (req, file, cb) {
  delete file.buffer
  cb(null)
}

module.exports = function (opts) {
  return new MemoryStorage(opts)
}

}, function(modId) { var map = {}; return __REQUIRE__(map[modId], modId); })
return __REQUIRE__(1748917627847);
})()
//miniprogram-npm-outsideDeps=["type-is","busboy","xtend","append-field","events","util","object-assign","fs","os","path","crypto","mkdirp","concat-stream"]
//# sourceMappingURL=index.js.map