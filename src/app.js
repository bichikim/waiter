/**
 * @file Waiter.js
 * @module waiter
 */
//다음 할일 콜백 설정 할때 별다른 옵션없을 경우 바로 fuctionname(){} 이 렇게 쓸수 있게
//noinspection JSUnresolvedVariable
import _ from 'lodash';

export default class Waiter {

    constructor() {
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
    set defaultOperate(operate) {
        if (_.isBoolean(operate)) {
            this.defaultOperate = operate;
        }
    }

    /**
     * Get Callbacks
     * @returns {Array} See this._callbacks
     */
    get show() {
        return this._callbacks;
    }

    /**
     * Execute functions with this._callbacks options
     * @param {{ callback_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}} options Set how to deal each callback objects
     * @returns {{callback_name1: *, callback_name2: *, ...}} return results
     */
    execute(options = {}) {
        //Make Object to contain returning results with callback names
        const returnObject = {};

        //Execute all this._callbacks
        _.forEach(this._callbacks, function (callbackObject) {
            const name = callbackObject.name,
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
     * Execute all asynchronously. Results will be returned with callbacks.then
     * @param {[{ callback_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}, ...]} options Set how to deal each callback objects
     *              Or can be an object
     * @return {{then : Function, catch : Function, _result : Function, _reject : Function}} callback chain
     */
    executeAsync(options) {
        const callbacks = this._AsyncCallback();
        let groups;

        if (_.isArray(options)) {
            groups = options;
        } else if (_.isObject(options)) {
            groups = [options];
        } else {
            throw new Error('options must be Array or object');
        }

        //Make async function to execute all this._callbacks
        const async = async () => {
            //Promises to add in Promise.all to execute all asynchronously
            const length = groups.length;

            for (let i = 0; i < length; i += 1) {
                const promises = [],
                    //For returning result names
                    keys = [],
                    myOption = groups[i];
                let result;
                _.forEach(this._callbacks, (callbackObject) => {
                    const name = callbackObject.name,
                        option = myOption[name];
                    //If It should execute by option.
                    if (this._isExecute(myOption, name)) {

                        //Save keys for returning results
                        keys.push(name);

                        //Checks if a callback needs to make new promise or not
                        let refresh = false;
                        if (_.isNil(callbackObject.promise)) {
                            refresh = true;
                        } else if (_.isObject(option)) {
                            if (_.isObject(option.bind) || _.isObject(option.arguments)) {
                                refresh = true;
                            }
                        }
                        if (!refresh) {
                            promises.push(callbackObject.promise);
                        } else {
                            //Make and push Promise
                            callbackObject.promise = this._makePromise(
                                callbackObject,
                                this._assembleBind(callbackObject, option),
                                this._pickArguments(callbackObject, option)
                            );
                            promises.push(callbackObject.promise);
                        }
                    }
                });
                result = await Promise.all(promises)
                    .catch(reason => callbacks._reject(reason))
                    .then(results => callbacks._result(this._makeResultObject(keys, results)));
                if (i === length - 1) {
                    return result
                }
            }
        };

        //Execute all asynchronously//callbacks._result(results)
        async();
        //Remove doing ones ro etc
        this._removeOnes();
        return callbacks;
    }

    /**
     * Save many callbacks to operate at ones
     * @param {{ones: Boolean, bind: Object, arguments: Array}} objects
     * @returns {boolean}
     */
    saveMany(objects) {
        if (!_.isObject(objects)) {
            return false;
        }

        _.forEach(objects, function (value, key) {
            if (!_.isObject(value)) {
                return true;
            }

            if (!_.isFunction(value.callback)) {
                return true;
            }

            this.save(
                value.callback,
                key,
                value.ones,
                value.bind,
                value.arguments
            );
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
    save(callback, name, ones, my_bind_object, my_argument_array) {
        if (!_.isFunction(callback)) {
            return false;
        }
        this._callbacks.push({
            name: name,
            callback: callback,
            ones: _.isBoolean(ones) ? ones : false,
            bind: _.isObject(my_bind_object) ? my_bind_object : null,
            arguments: _.isArray(my_argument_array) ? my_argument_array : null,
            promise: null,
        });
        return true;
    }

    /**
     * Remove name of callback item
     * @param name
     */
    remove(name) {
        return _.remove(this._callbacks, function (value) {
            return value.name === name;
        });
    }

    /**
     * Register bind to bind it with callbacks when this waiter operate all this._callbacks
     * @param {Object} my_bind_object
     */
    bind(my_bind_object) {
        if (_.isObject(my_bind_object)) {
            this._bind = my_bind_object;
            return true;
        }

        return false;
    }

    /**
     * Register argument to use this when this waiter become fired
     * @param array
     */
    arguments(array) {
        if (_.isArray(array)) {
            this._arguments = array;
            return true;
        }

        return false;
    }

    /**
     * remove all clear
     * @return {Boolean}
     */
    clear() {
        return _.remove(this._callbacks, function () {
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
    _assembleBind(own = {}, options = {}) {
        const myBind = {};

        if (_.isObject(this._bind)) {
            _.forEach(this._bind, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isObject(own.bind)) {
            _.forEach(own.bind, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isObject(options.bind)) {
            _.forEach(options.bind, function (value, name) {
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
    _pickArguments(own = {}, options = {}) {
        let myArgument;

        if (_.isArray(options.arguments)) {
            myArgument = options.arguments
        } else if (_.isArray(own.arguments)) {
            myArgument = own.arguments;
        } else {
            myArgument = this._arguments;
        }

        if (_.isArray(options.additionalArguments)) {
            myArgument = _.union(myArgument, options.additionalArguments);
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
    _isExecute(options, name) {
        if (_.isObject(options)) {
            if (_.isObject(options[name])) {
                if (_.isBoolean(options[name].operate) && options[name].operate) {
                    return true;
                } else if (!_.isBoolean(options[name].operate)) {
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
    _removeOnes() {
        _.remove(this._callbacks, 'ones');
    }

    /**
     *
     * @param {Array} names
     * @param {Array} results
     * @return {Object}
     * @private
     */
    _makeResultObject(names, results) {
        const resultObject = {};
        _.forEach(results, (result, index) => {
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
    _makePromise(callback, myBind, myArguments) {
        return (function () {
            return new Promise((resolve, reject) => {
                let result = null;
                try {
                    //Execute One
                    result = callback.callback.apply(myBind, myArguments);
                } catch (reason) {
                    reason.name = callback.name;
                    reject(reason);
                }
                resolve(result);
            });
        })();
    }

    /**
     *
     * @return {*}
     * @private
     */
    _AsyncCallback() {
        return {
            thenList: [],
            catchList: [],
            then(callback){
                this.thenList.push(callback);
                return this;
            },
            catch(callback){
                this.catchList.push(callback);
                return this;
            },
            _result(results){
                if (this.thenList.length > 0) {
                    this.thenList.shift()(results);
                }
            },
            _reject(reason){
                if (this.catchList.length > 0) {
                    this.catchList.shift()(reason);
                }
            }
        }
    }

}