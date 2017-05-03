'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //eslint-disable-next-line max-lines


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Waiter = function () {
    function Waiter() {
        _classCallCheck(this, Waiter);

        /**
         * Objects which have one callbacks and etc.
         * @type {Array}
         * @private
         */
        this._handlerData = [];
        /**
         *
         * @type {Array}
         * @private
         */
        this._arguments = [];
        /**
         *
         * @type {Object | null}
         * @private
         */
        this._bind = null;
        /**
         *
         * @type {boolean}
         * @private
         */
        this._defaultOperate = true;
    }

    /**
     * @return {Array}
     * @protected
     */


    _createClass(Waiter, [{
        key: 'execute',


        /**
         * Execute handlers
         * @param {{ handler_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}} options Set how to deal each callback objects
         * @returns {{handler_name1: *, handler_name1: *, ...}} return results
         */
        value: function execute() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            //Make Object to contain returning results with callback names
            var returnObject = {};

            //Execute all this._callbacks
            _lodash2.default.forEach(this._handlerData, function (callbackObject) {
                var name = callbackObject.name,
                    option = options[name];
                //If It should execute by option.
                if (this._isExecute(options, name)) {
                    returnObject[name] = callbackObject.callback.apply(this._assembleBind(callbackObject, option), this._pickArguments(callbackObject, option));
                }
                //Continue
                return true;
            }.bind(this));

            //Remove execute only things..
            this._removeOnes();

            //return results
            return returnObject;
        }

        /**
         * Save many handlers
         * @param {{handler_name: {handler: Function, [ones]: Boolean, [bind]: Object, [arguments]: Array}, ...}} objects
         * @returns {boolean}
         */

    }, {
        key: 'saveMany',
        value: function saveMany(objects) {
            if (!_lodash2.default.isObject(objects)) {
                return false;
            }

            _lodash2.default.forEach(objects, function (value, key) {
                value.name = key;
                this.save(value);
            }.bind(this));

            return true;
        }

        /**
         * Save one handler
         * @returns {boolean} Save or not
         * @param {{handler: Function, name: String, [ones]: Boolean, [bind]: Object, [arguments]: Array}} object
         */

    }, {
        key: 'save',
        value: function save(object) {
            if (!_lodash2.default.isObject(object)) {
                return false;
            }

            if (!_lodash2.default.isFunction(object.handler)) {
                return false;
            }

            if (!_lodash2.default.isString(object.name)) {
                return false;
            }

            this._handlerData.push({
                name: object.name,
                callback: object.handler,
                ones: _lodash2.default.isBoolean(object.ones) ? object.ones : false,
                bind: _lodash2.default.isObject(object.bind) ? object.bind : null,
                arguments: _lodash2.default.isArray(object.arguments) ? object.arguments : null,
                promise: null
            });
            return true;
        }

        /**
         * Remove name of handler
         * @param {String} name
         */

    }, {
        key: 'remove',
        value: function remove(name) {
            return _lodash2.default.remove(this._handlerData, function (value) {
                return value.name === name;
            });
        }

        /**
         * Register bind
         * @param {Object} my_bind_object
         */

    }, {
        key: 'bind',
        value: function bind(my_bind_object) {
            if (_lodash2.default.isObject(my_bind_object)) {
                this._bind = my_bind_object;
                return true;
            }

            return false;
        }

        /**
         * Register arguments
         * @param {Array} argumentsArray
         */

    }, {
        key: 'arguments',
        value: function _arguments(argumentsArray) {
            if (_lodash2.default.isArray(argumentsArray)) {
                this._arguments = argumentsArray;
                return true;
            }

            return false;
        }

        /**
         * Remove all handlers
         * @return {Boolean}
         */

    }, {
        key: 'clear',
        value: function clear() {
            return _lodash2.default.remove(this._handlerData, function () {
                return true;
            });
        }

        /**
         * Assemble Bind all this bind, handler bind and option bind
         * @param {Object} own
         * @param {Object} options
         * @return {Object}
         * @protected
         */

    }, {
        key: '_assembleBind',
        value: function _assembleBind() {
            var own = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var myBind = {};

            if (_lodash2.default.isObject(this._bind)) {
                _lodash2.default.forEach(this._bind, function (value, name) {
                    myBind[name] = value;
                });
            }

            if (_lodash2.default.isObject(own.bind)) {
                _lodash2.default.forEach(own.bind, function (value, name) {
                    myBind[name] = value;
                });
            }

            if (_lodash2.default.isObject(options.bind)) {
                _lodash2.default.forEach(options.bind, function (value, name) {
                    myBind[name] = value;
                });
            }

            return myBind;
        }

        /**
         * Pick one of arguments from this arguments, handler arguments, option arguments and add additionalArguments
         * @param {Object} own
         * @param {Object} options
         * @return {*}
         * @protected
         */

    }, {
        key: '_pickArguments',
        value: function _pickArguments() {
            var own = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            var myArgument = void 0;

            if (_lodash2.default.isArray(options.arguments)) {
                myArgument = options.arguments;
            } else if (_lodash2.default.isArray(own.arguments)) {
                myArgument = own.arguments;
            } else {
                myArgument = this._arguments;
            }

            if (_lodash2.default.isArray(options.additionalArguments)) {
                myArgument = _lodash2.default.union(myArgument, options.additionalArguments);
            }

            return myArgument;
        }

        /**
         * Should execute or not
         * @param {Object} options
         * @param {String} name
         * @return {boolean}
         * @protected
         */

    }, {
        key: '_isExecute',
        value: function _isExecute(options, name) {
            if (_lodash2.default.isObject(options)) {
                if (_lodash2.default.isObject(options[name])) {
                    if (_lodash2.default.isBoolean(options[name].operate) && options[name].operate) {
                        return true;
                    } else if (!_lodash2.default.isBoolean(options[name].operate)) {
                        return this._defaultOperate;
                    }
                    return false;
                }
                return this._defaultOperate;
            }
            return true;
        }

        /**
         * Remove callbacks which should operate one time;
         * @protected
         */

    }, {
        key: '_removeOnes',
        value: function _removeOnes() {
            _lodash2.default.remove(this._handlerData, 'ones');
        }
    }, {
        key: '_handlers',
        get: function get() {
            return this._handlerData;
        }

        /**
         * @param {Object} operate
         */

    }, {
        key: 'defaultOperate',
        set: function set(operate) {
            if (_lodash2.default.isBoolean(operate)) {
                this.defaultOperate = operate;
            }
        }

        /**
         * Get Callbacks
         * @returns {Array} See this._callbacks
         */

    }, {
        key: 'show',
        get: function get() {
            return this._handlerData;
        }
    }]);

    return Waiter;
}();

exports.default = Waiter;