'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @file Waiter.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module waiter
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
//noinspection JSUnresolvedVariable


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
         *              Array structure => [ Object, Object, Object, ... ]
         *              Its object structure => { name : 'Name of callback. result will return by the name', callback : 'Execute function operate this', ones : 'Operating only one or not', bind : 'Bind data when its callback execute', argument: 'Set argument when its callback execute', promise: 'Saving  promise by this.executeAsync if it needs' }
         * @private
         */
        this._callbacks = [];
        /**
         *
         * @type {Array}
         * @private
         */
        this._arguments = [];
        /**
         *
         * @type {null}
         * @private
         */
        this._bind_object = null;
        /**
         *
         * @type {boolean}
         * @private
         */
        this._defaultOperate = true;
    }

    /**
     * When execute function has options, it does not mention to operate it or not it will be operated basically
     * However if make this false basically it won't be operated by the execute
     * @param {Object} operate
     */


    _createClass(Waiter, [{
        key: 'execute',


        /**
         * Execute functions in this._callbacks options
         * @returns {Object}
         *              Array structure => [ 'callbacks name 1' : 'result', 'callbacks name 2' : 'result', 'callbacks name 3' : 'result', ... ]
         * @param {{ operate : Object, arguments : Array, additionalArguments : Array, bind : Object }} [options]
         *              Object structure => { operate : 'operate or not', arguments : 'replace arguments', additionalArguments : 'add arguments', bind : 'overwrite bind' }
         */
        value: function execute(options) {
            var _this = this;

            //Make Object to contain returning results with callback names
            var returnObject = {},
                executeOne = function executeOne(value, options) {
                var bindAndArguments = _this._getBindAndArguments(value, options);
                return value.callback.apply(bindAndArguments.bind, bindAndArguments.arguments);
            };

            //Execute all this._callbacks
            _lodash2.default.forEach(this._callbacks, function (callback) {
                //If It should execute by option.
                if (this._isExecute(options, callback.name)) {
                    returnObject[callback.name] = executeOne(callback, options[callback.name]);
                }
                //Continue
                return true;
            }.bind(this));

            //Remove execute only things..
            this._remove();

            //return results
            return returnObject;
        }

        /**
         * Get bind and arguments
         * @param value
         * @param options
         * @return {{arguments: Array, bind: Object}}
         * @private
         */

    }, {
        key: '_getBindAndArguments',
        value: function _getBindAndArguments(value, options) {
            var myArguments = null,
                myBind = null;
            if (_lodash2.default.isObject(options)) {
                myArguments = this._pickArguments(_lodash2.default.isArray(value.arguments) ? value.arguments : null, _lodash2.default.isArray(options.arguments) ? options.arguments : null, _lodash2.default.isArray(options.additionalArguments) ? options.additionalArguments : null);
                myBind = this._assembleBind(value.bind, _lodash2.default.isObject(options.bind) ? options.bind : null);
            } else {
                myArguments = this._pickArguments(value.arguments);
                myBind = this._assembleBind(value.bind);
            }
            return {
                arguments: myArguments,
                bind: myBind
            };
        }

        /**
         * Execute all asynchronously. Result will return with resultCallback when the latest callback is done
         * @param {Object} options Same as the this.execute option parameter
         * @param {Function} [resultCallback]
         *                  Function structure => function(results) {}
         *                  Results parameter structure => Same as execute's returning object
         * @param {Function} [errorCallback]
         *                  Function structure => function(reason) {*}
         */

    }, {
        key: 'executeAsync',
        value: function executeAsync(options, resultCallback, errorCallback) {
            var _this2 = this;

            //Keys to set name to make result Objects
            var keys = [];
            //Make async function to execute all this._callbacks
            var async = async function async() {
                //Promises to add in Promise.all to execute all asynchronously
                var promises = [];
                _lodash2.default.forEach(_this2._callbacks, function (callback) {
                    //If It should execute by option.
                    if (_this2._isExecute(options, callback.name)) {
                        keys.push(callback.name);
                        //Assemble bind

                        //checking need to make new promise
                        var refresh = false;
                        if (_lodash2.default.isNil(callback.promise)) {
                            refresh = true;
                        } else if (_lodash2.default.isObject(options[callback.name])) {
                            if (_lodash2.default.isObject(options[callback.name.bind]) || _lodash2.default.isObject(options[callback.name.arguments])) {
                                refresh = true;
                            }
                        }

                        if (refresh) {
                            var bindAndArguments = _this2._getBindAndArguments(callback, options[callback.name]);

                            //Make and push Promise
                            var promise = function () {
                                return new Promise(function (resolve, reject) {
                                    var result = null;
                                    try {
                                        //Execute One
                                        result = callback.callback.apply(bindAndArguments.bind, bindAndArguments.arguments);
                                    } catch (reason) {
                                        reason.name = callback.name;
                                        reject(reason);
                                    }
                                    resolve(result);
                                });
                            }();
                            callback.promise = promise;
                            promises.push(promise);
                        } else {
                            promises.push(callback.promise);
                        }
                    }
                });
                //Execute all
                if (_lodash2.default.isFunction(errorCallback)) {
                    //There something wrong with async. It must be caught here not on afterAsync
                    return await Promise.all(promises).catch(function (reason) {
                        return errorCallback(reason);
                    });
                }
                return await Promise.all(promises);
            };

            //Execute all asynchronously
            var afterAsync = async();
            //Set result callback if it has
            if (_lodash2.default.isFunction(resultCallback)) {
                afterAsync.then(function (results) {
                    var returns = {};
                    _lodash2.default.forEach(results, function (result, index) {
                        returns[keys[index]] = result;
                    });
                    resultCallback(returns);
                    //Remove doing ones ro etc
                    _this2._remove();
                });
            }
        }

        /**
         * Save many callbacks to operate at ones
         * @param {{ones: Boolean, bind: Object, arguments: Array}} objects
         * @returns {boolean}
         */

    }, {
        key: 'saveMany',
        value: function saveMany(objects) {
            if (!_lodash2.default.isObject(objects)) {
                return false;
            }
            _lodash2.default.forEach(objects, function (value, key) {
                if (!_lodash2.default.isObject(value)) {
                    return true;
                }
                if (!_lodash2.default.isFunction(value.callback)) {
                    return true;
                }
                this.save(value.callback, key, value.ones, value.bind, value.arguments);
            }.bind(this));
            return true;
        }

        /**
         * Save one callback to fire
         * @param {Function} callback
         * @param {String} name
         * @param {Boolean} ones
         * @param {Object} my_bind_object
         * @param {Array} my_argument_array
         * @returns {boolean} Save or not
         */

    }, {
        key: 'save',
        value: function save(callback, name, ones, my_bind_object, my_argument_array) {
            if (!_lodash2.default.isFunction(callback)) {
                return false;
            }
            this._callbacks.push({
                name: name,
                callback: callback,
                ones: _lodash2.default.isBoolean(ones) ? ones : false,
                bind: _lodash2.default.isObject(my_bind_object) ? my_bind_object : null,
                arguments: _lodash2.default.isArray(my_argument_array) ? my_argument_array : null,
                promise: null
            });
            return true;
        }

        /**
         * Remove name of callback item
         * @param name
         */

    }, {
        key: 'remove',
        value: function remove(name) {
            return _lodash2.default.remove(this._callbacks, function (value) {
                return value.name === name;
            });
        }

        /**
         * Register bind to bind it with callbacks when this waiter operate all this._callbacks
         * @param {Object} my_bind_object
         */

    }, {
        key: 'bind',
        value: function bind(my_bind_object) {
            if (_lodash2.default.isObject(my_bind_object)) {
                this._bind_object = my_bind_object;
            }
        }

        /**
         * Register argument to use this when this waiter become fired
         * @param array
         */

    }, {
        key: 'arguments',
        value: function _arguments(array) {
            if (_lodash2.default.isArray(array)) {
                this._arguments = array;
            }
        }

        /**
         * remove all clear
         * @return {Boolean}
         */

    }, {
        key: 'clear',
        value: function clear() {
            _lodash2.default.remove(this._callbacks, function () {
                return true;
            });
            return false;
        }

        /**
         * Assemble Bind all this._bind, callback bind, option bind
         * @param ownBind
         * @param optionBind
         * @return {Object}
         * @private
         */

    }, {
        key: '_assembleBind',
        value: function _assembleBind(ownBind, optionBind) {
            var myBind = {};

            if (_lodash2.default.isObject(this._bind_object)) {
                _lodash2.default.forEach(this._bind_object, function (value, name) {
                    myBind[name] = value;
                });
            }

            if (_lodash2.default.isObject(ownBind)) {
                _lodash2.default.forEach(ownBind, function (value, name) {
                    myBind[name] = value;
                });
            }

            if (_lodash2.default.isObject(optionBind)) {
                _lodash2.default.forEach(optionBind, function (value, name) {
                    myBind[name] = value;
                });
            }
            return myBind;
        }

        /**
         * Pick one of argument from this_arguments, ownArguments, optionsArguments and and additionalArguments
         * @param ownArguments
         * @param optionArguments
         * @param optionAdditionalArguments
         * @return {Array}
         * @private
         */

    }, {
        key: '_pickArguments',
        value: function _pickArguments(ownArguments, optionArguments, optionAdditionalArguments) {
            var myArgument = void 0;
            if (_lodash2.default.isArray(optionArguments)) {
                myArgument = optionArguments;
            } else if (_lodash2.default.isArray(ownArguments)) {
                myArgument = ownArguments;
            } else {
                myArgument = this._arguments;
            }

            if (_lodash2.default.isArray(optionAdditionalArguments)) {
                myArgument = _lodash2.default.union(myArgument, optionAdditionalArguments);
            }
            return myArgument;
        }

        /**
         * Return It should to execute or not
         * @param options
         * @param name
         * @return {boolean}
         * @private
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
            }
            return true;
        }

        /**
         * Do Removing action
         * @private
         */

    }, {
        key: '_remove',
        value: function _remove() {
            _lodash2.default.remove(this._callbacks, 'ones');
        }
    }, {
        key: 'defaultOperate',
        set: function set(operate) {
            if (_lodash2.default.isBoolean(operate)) {
                this.defaultOperate = operate;
            } //else ... Need throw error
        }

        /**
         * Get Callbacks
         * @returns {Array} See this._callbacks
         */

    }, {
        key: 'show',
        get: function get() {
            return this._callbacks;
        }
    }]);

    return Waiter;
}();

exports.default = Waiter;
