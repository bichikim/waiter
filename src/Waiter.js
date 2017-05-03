//eslint-disable-next-line max-lines
import _ from 'lodash';

export default class Waiter {

    constructor() {
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
    get _handlers(){
        return this._handlerData;
    }

    /**
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
        return this._handlerData;
    }

    /**
     * Execute handlers
     * @param {{ handler_name : { [bind : Object, [arguments]: Array}, [additionalArguments]: Array, [operate]: Boolean, ...}} options Set how to deal each callback objects
     * @returns {{handler_name1: *, handler_name1: *, ...}} return results
     */
    execute(options = {}) {
        //Make Object to contain returning results with callback names
        const returnObject = {};

        //Execute all this._callbacks
        _.forEach(this._handlerData, function (callbackObject) {
            const {name} = callbackObject,
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
    saveMany(objects) {
        if (!_.isObject(objects)) {
            return false;
        }

        _.forEach(objects, function (value, key) {
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
    save(object) {
        if (!_.isObject(object)) {
            return false;
        }

        if (!_.isFunction(object.handler)) {
            return false;
        }

        if (!_.isString(object.name)) {
            return false;
        }

        this._handlerData.push({
            name: object.name,
            callback: object.handler,
            ones: _.isBoolean(object.ones) ? object.ones : false,
            bind: _.isObject(object.bind) ? object.bind : null,
            arguments: _.isArray(object.arguments) ? object.arguments : null,
            promise: null,
        });
        return true;
    }

    /**
     * Remove name of handler
     * @param {String} name
     */
    remove(name) {
        return _.remove(this._handlerData, function (value) {
            return value.name === name;
        });
    }

    /**
     * Register bind
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
     * Register arguments
     * @param {Array} argumentsArray
     */
    arguments(argumentsArray) {
        if (_.isArray(argumentsArray)) {
            this._arguments = argumentsArray;
            return true;
        }

        return false;
    }

    /**
     * Remove all handlers
     * @return {Boolean}
     */
    clear() {
        return _.remove(this._handlerData, function () {
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
     * Pick one of arguments from this arguments, handler arguments, option arguments and add additionalArguments
     * @param {Object} own
     * @param {Object} options
     * @return {*}
     * @protected
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
     * Should execute or not
     * @param {Object} options
     * @param {String} name
     * @return {boolean}
     * @protected
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
     * Remove callbacks which should operate one time;
     * @protected
     */
    _removeOnes() {
        _.remove(this._handlerData, 'ones');
    }
}