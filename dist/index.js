'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @file Waiter.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @module waiter
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
//다음 할일 콜백 설정 할때 별다른 옵션없을 경우 바로 fuctionname(){} 이 렇게 쓸수 있게
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
        this._bind = null;
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
         * @param {{ callback_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}} options Set how to deal each callback objects
         * @returns {{callback_name1: *, callback_name2: *, ...}} return results
         */
        value: function execute() {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            //Make Object to contain returning results with callback names
            var returnObject = {};

            //Execute all this._callbacks
            _lodash2.default.forEach(this._callbacks, function (callbackObject) {
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
         * Execute all asynchronously. Result will return with resultCallback when the latest callback is done
         * @param {[{ callback_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}, ...]} options Set how to deal each callback objects
         *              Or can be an object
         * @return {{then : Function, catch : Function, _result : Function, _reject : Function}} callback chain
         */

    }, {
        key: 'executeAsync',
        value: function executeAsync(options) {
            var _this = this;

            var callbacks = this._AsyncCallback();
            var groups = void 0;

            if (_lodash2.default.isArray(options)) {
                groups = options;
            } else if (_lodash2.default.isObject(options)) {
                groups = [options];
            } else {
                throw new Error('options must be Array or object');
            }

            //Make async function to execute all this._callbacks
            var async = async function async() {
                //Promises to add in Promise.all to execute all asynchronously
                var length = groups.length;

                var _loop = async function _loop(i) {
                    var promises = [],

                    //For returning result names
                    keys = [],
                        myOption = groups[i];
                    var result = void 0;
                    _lodash2.default.forEach(_this._callbacks, function (callbackObject) {
                        var name = callbackObject.name,
                            option = myOption[name];
                        //If It should execute by option.
                        if (_this._isExecute(myOption, name)) {

                            //Save keys for returning results
                            keys.push(name);

                            //Checks if a callback needs to make new promise or not
                            var refresh = false;
                            if (_lodash2.default.isNil(callbackObject.promise)) {
                                refresh = true;
                            } else if (_lodash2.default.isObject(option)) {
                                if (_lodash2.default.isObject(option.bind) || _lodash2.default.isObject(option.arguments)) {
                                    refresh = true;
                                }
                            }
                            if (!refresh) {
                                promises.push(callbackObject.promise);
                            } else {
                                //Make and push Promise
                                callbackObject.promise = _this._makePromise(callbackObject, _this._assembleBind(callbackObject, option), _this._pickArguments(callbackObject, option));
                                promises.push(callbackObject.promise);
                            }
                        }
                    });
                    result = await Promise.all(promises).catch(function (reason) {
                        return callbacks._reject(reason);
                    }).then(function (results) {
                        return callbacks._result(_this._makeResultObject(keys, results));
                    });
                    if (i === length - 1) {
                        return {
                            v: result
                        };
                    }
                };

                for (var i = 0; i < length; i += 1) {
                    var _ret = await _loop(i);

                    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }
            };

            //Execute all asynchronously//callbacks._result(results)
            async();
            //Remove doing ones ro etc
            this._removeOnes();
            return callbacks;
        }

        /**
         *
         * @param {Array} names
         * @param {Array} results
         * @return {Object}
         * @private
         */

    }, {
        key: '_makeResultObject',
        value: function _makeResultObject(names, results) {
            var resultObject = {};
            _lodash2.default.forEach(results, function (result, index) {
                resultObject[names[index]] = result;
            });
            return resultObject;
        }

        /**
         *
         * @param callback
         * @param myBind
         * @param myArguments
         * @private
         */

    }, {
        key: '_makePromise',
        value: function _makePromise(callback, myBind, myArguments) {
            return function () {
                return new Promise(function (resolve, reject) {
                    var result = null;
                    try {
                        //Execute One
                        result = callback.callback.apply(myBind, myArguments);
                    } catch (reason) {
                        reason.name = callback.name;
                        reject(reason);
                    }
                    resolve(result);
                });
            }();
        }

        /**
         *
         * @return {*}
         * @private
         */

    }, {
        key: '_AsyncCallback',
        value: function _AsyncCallback() {
            return {
                thenList: [],
                catchList: [],
                then: function then(callback) {
                    this.thenList.push(callback);
                    return this;
                },
                catch: function _catch(callback) {
                    this.catchList.push(callback);
                    return this;
                },
                _result: function _result(results) {
                    if (this.thenList.length > 0) {
                        this.thenList.shift()(results);
                    }
                },
                _reject: function _reject(reason) {
                    if (this.catchList.length > 0) {
                        this.catchList.shift()(reason);
                    }
                }
            };
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
                this._bind = my_bind_object;
                return true;
            }

            return false;
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
                return true;
            }

            return false;
        }

        /**
         * remove all clear
         * @return {Boolean}
         */

    }, {
        key: 'clear',
        value: function clear() {
            return _lodash2.default.remove(this._callbacks, function () {
                return true;
            });
        }

        /**
         * Assemble Bind all this._bind, callback bind, option bind
         * @param own
         * @param options
         * @return {Object}
         * @private
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
         * Pick one of argument from this_arguments, ownArguments, optionsArguments and and additionalArguments
         * @param own
         * @param options
         * @return {*}
         * @private
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
                return this._defaultOperate;
            }
            return true;
        }

        /**
         * Remove callbacks which operate one time;
         * @private
         */

    }, {
        key: '_removeOnes',
        value: function _removeOnes() {
            _lodash2.default.remove(this._callbacks, 'ones');
        }
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
            return this._callbacks;
        }
    }]);

    return Waiter;
}();

exports.default = Waiter;
