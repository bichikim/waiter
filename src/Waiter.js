/**
 * @file Waiter.js
 * @module waiter
 */
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
    set defaultOperate(operate) {
        if (_.isBoolean(operate)) {
            this.defaultOperate = operate;
        }//else ... Need throw error
    }

    /**
     * Get Callbacks
     * @returns {Array} See this._callbacks
     */
    get show() {
        return this._callbacks;
    }

    /**
     * Execute functions in this._callbacks options
     * @returns {Object}
     *              Array structure => [ 'callbacks name 1' : 'result', 'callbacks name 2' : 'result', 'callbacks name 3' : 'result', ... ]
     * @param {{ operate : Object, arguments : Array, additionalArguments : Array, bind : Object }} [options]
     *              Object structure => { operate : 'operate or not', arguments : 'replace arguments', additionalArguments : 'add arguments', bind : 'overwrite bind' }
     */
    execute(options) {
        //Make Object to contain returning results with callback names
        const returnObject = {},
            executeOne = (value, options) => {
                const bindAndArguments = this._getBindAndArguments(value, options);
                return value.callback.apply(bindAndArguments.bind, bindAndArguments.arguments);
            };

        //Execute all this._callbacks
        _.forEach(this._callbacks, function (callback) {
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
    _getBindAndArguments(value, options) {
        let myArguments = null,
            myBind = null;
        if (_.isObject(options)) {
            myArguments = this._pickArguments(
                _.isArray(value.arguments) ? value.arguments : null,
                _.isArray(options.arguments) ? options.arguments : null,
                _.isArray(options.additionalArguments) ? options.additionalArguments : null);
            myBind = this._assembleBind(value.bind, _.isObject(options.bind) ? options.bind : null);
        } else {
            myArguments = this._pickArguments(value.arguments);
            myBind = this._assembleBind(value.bind);
        }
        return {
            arguments: myArguments,
            bind: myBind,
        }
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
    executeAsync(options, resultCallback, errorCallback) {
        //Keys to set name to make result Objects
        const keys = [];
        //Make async function to execute all this._callbacks
        const async = async () => {
            //Promises to add in Promise.all to execute all asynchronously
            const promises = [];

            _.forEach(this._callbacks, (callback) => {
                //If It should execute by option.
                if (this._isExecute(options, callback.name)) {
                    keys.push(callback.name);
                    //Assemble bind

                    //checking need to make new promise
                    let refresh = false;
                    if (_.isNil(callback.promise)) {
                        refresh = true;
                    } else if (_.isObject(options[callback.name])) {
                        if (_.isObject(options[callback.name.bind]) || _.isObject(options[callback.name.arguments])) {
                            refresh = true;
                        }
                    }

                    if (refresh) {
                        const bindAndArguments = this._getBindAndArguments(callback, options[callback.name]);

                        //Make and push Promise
                        const promise = (function () {
                            return new Promise((resolve, reject) => {
                                let result = null;
                                try {
                                    //Execute One
                                    result = callback.callback.apply(bindAndArguments.bind, bindAndArguments.arguments);
                                } catch (reason) {
                                    reason.name = callback.name;
                                    reject(reason);
                                }
                                resolve(result);
                            });
                        })();
                        callback.promise = promise;
                        promises.push(promise);
                    } else {
                        promises.push(callback.promise);
                    }
                }
            });
            //Execute all
            if(_.isFunction(errorCallback)){
                //There something wrong with async. It must be caught here not on afterAsync
                return await Promise.all(promises).catch(reason => errorCallback(reason));
            }
            return await Promise.all(promises);
        };


        //Execute all asynchronously
        let afterAsync = async();
        //Set result callback if it has
        if (_.isFunction(resultCallback)) {
            afterAsync.then((results) => {
                const returns = {};
                _.forEach(results, (result, index) => {
                    returns[keys[index]] = result;
                });
                resultCallback(returns);
                //Remove doing ones ro etc
                this._remove();
            });
        }
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
        })
    }

    /**
     * Register bind to bind it with callbacks when this waiter operate all this._callbacks
     * @param {Object} my_bind_object
     */
    bind(my_bind_object) {
        if (_.isObject(my_bind_object)) {
            this._bind_object = my_bind_object;
        }
    }

    /**
     * Register argument to use this when this waiter become fired
     * @param array
     */
    arguments(array) {
        if (_.isArray(array)) {
            this._arguments = array;
        }
    }

    /**
     * remove all clear
     * @return {Boolean}
     */
    clear() {
        _.remove(this._callbacks, function () {
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
    _assembleBind(ownBind, optionBind) {
        const myBind = {};

        if (_.isObject(this._bind_object)) {
            _.forEach(this._bind_object, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isObject(ownBind)) {
            _.forEach(ownBind, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isObject(optionBind)) {
            _.forEach(optionBind, function (value, name) {
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
    _pickArguments(ownArguments, optionArguments, optionAdditionalArguments) {
        let myArgument;
        if (_.isArray(optionArguments)) {
            myArgument = optionArguments
        } else if (_.isArray(ownArguments)) {
            myArgument = ownArguments;
        } else {
            myArgument = this._arguments;
        }

        if (_.isArray(optionAdditionalArguments)) {
            myArgument = _.union(myArgument, optionAdditionalArguments);
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
                }else if(!_.isBoolean(options[name].operate)){
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
    _remove() {
        _.remove(this._callbacks, 'ones');
    }

}