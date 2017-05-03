'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _Waiter2 = require('./Waiter');

var _Waiter3 = _interopRequireDefault(_Waiter2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WaiterAsync = function (_Waiter) {
    _inherits(WaiterAsync, _Waiter);

    function WaiterAsync() {
        _classCallCheck(this, WaiterAsync);

        return _possibleConstructorReturn(this, (WaiterAsync.__proto__ || Object.getPrototypeOf(WaiterAsync)).apply(this, arguments));
    }

    _createClass(WaiterAsync, [{
        key: 'executeAsync',


        /**
         * Execute all asynchronously. Results will be returned with callbacks.then
         * @param {[{ callback_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}, ...]} options Set how to deal each callback objects
         *              Or can be an object
         * @return {{then : Function, catch : Function, _result : Function, _reject : Function}} callback chain
         */
        value: function executeAsync(options) {
            var _this2 = this;

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
            //eslint-disable-next-line one-var
            var async = async function async() {
                //Promises to add in Promise.all to execute all asynchronously
                var _groups = groups,
                    length = _groups.length,
                    results = [];

                var _loop = async function _loop(i) {
                    //For returning result names
                    var keys = [],
                        myOption = groups[i],
                        promises = [];
                    _lodash2.default.forEach(_this2._handlers, function (callbackObject) {
                        var name = callbackObject.name,
                            option = myOption[name];
                        //If It should execute by option.
                        if (_this2._isExecute(myOption, name)) {

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
                            if (refresh) {
                                //Make and push Promise
                                callbackObject.promise = _this2._makePromise(callbackObject, _this2._assembleBind(callbackObject, option), _this2._pickArguments(callbackObject, option));
                                promises.push(callbackObject.promise);
                            } else {
                                promises.push(callbackObject.promise);
                            }
                        }
                    });
                    //eslint-disable-next-line no-await-in-loop
                    await Promise.all(promises).catch(function (reason) {
                        return callbacks._reject(reason);
                    }).then(function (result) {
                        var myResult = _this2._makeResultObject(keys, result);
                        results.push(myResult);
                        callbacks._result(myResult);
                    });
                };

                for (var i = 0; i < length; i += 1) {
                    await _loop(i);
                }
                return results;
            };

            //Execute all
            async().then(function (results) {
                return callbacks._conclude(results);
            });
            //Remove doing ones ro etc
            this._removeOnes();
            return callbacks;
        }

        /**
         *
         * @param callback
         * @param myBind
         * @param myArguments
         * @private
         */
        //eslint-disable-next-line class-methods-use-this

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
         * @param {Array} names
         * @param {Array} results
         * @return {Object}
         * @private
         */
        //eslint-disable-next-line class-methods-use-this

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
         * @return {*}
         * @private
         */
        //eslint-disable-next-line class-methods-use-this

    }, {
        key: '_AsyncCallback',
        value: function _AsyncCallback() {
            return {
                thenList: [],
                catchList: [],
                concludeCallback: null,
                then: function then(callback) {
                    this.thenList.push(callback);
                    return this;
                },
                catch: function _catch(callback) {
                    this.catchList.push(callback);
                    return this;
                },
                final: function final(callback) {
                    if (_lodash2.default.isFunction(callback)) {
                        this.concludeCallback = callback;
                    }
                },
                _result: function _result(result) {
                    if (this.thenList.length > 0) {
                        this.thenList.shift()(result);
                    }
                },
                _reject: function _reject(reason) {
                    if (this.catchList.length > 0) {
                        this.catchList.shift()(reason);
                    }
                },
                _conclude: function _conclude(results) {
                    if (_lodash2.default.isFunction(this.concludeCallback)) {
                        this.concludeCallback(results);
                    }
                }
            };
        }
    }]);

    return WaiterAsync;
}(_Waiter3.default);

exports.default = WaiterAsync;