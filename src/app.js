//noinspection JSUnresolvedVariable
import _ from 'lodash';

/*
 {
 name: 'name',
 bind: {},
 callback: ()=>{}
 }
 */

export default class Waiter {
    constructor() {
        this._callbacks = [];
        this._arguments = [];
        this._bind_object = undefined;
        this._defaultOperate = true;
    }

    set defaultOperate(operate){
        if(_.isBoolean(operate)){
            this.defaultOperate = operate;
        }
    }

    /**
     *
     * @returns {{}}
     * @param option
     */
    execute(option) {
        //if Waiter has call_object to bind
        let isOption = _.isObject(option),
            returnObject = {};

        //모든 함수 실행
        _.forEach(this._callbacks, function (value) {
            let doExecute = false;
            if (isOption) {
                if (!_.isNil(option[value.name]) && option[value.name].operate) {
                    doExecute = true;
                }else if(_.isNil(option[value.name])){
                    doExecute = this._defaultOperate ;
                }
            } else {
                doExecute = true;
            }
            if (doExecute) {
                returnObject[value.name] = this._executeOne(value, _.isNil(option[value.name]) ? [] : option[value.name]);
            }
            return true;
        }.bind(this));


        _.remove(this._callbacks, 'ones');

        //return all result with each callback's name
        return returnObject;
    }

    /**
     * excute one of callbacks
     * @param value
     * @param option
     * @returns {*}
     * @private
     */
    _executeOne(value, option) {
        if (!_.isFunction(value.callback)) {

            value.ones = true;
            return true;
        }

        let myArgument,
            myBind = {};


        if (_.isObject(this._bind_object)) {
            _.forEach( this._bind_object, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isObject(value.bind)) {
            _.forEach( value.bind, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isObject(option.bind)) {
            _.forEach(option.bind, function (value, name) {
                myBind[name] = value;
            });
        }

        if (_.isArray(option.arguments)) {
            myArgument = option.arguments
        } else if (_.isArray(value.argument)) {
            myArgument = value.argument;
        } else {
            myArgument = this._arguments;
        }

        if (_.isArray(option.additionalArguments)) {
            myArgument = _.union(myArgument, option.additionalArguments);
        }


        //returned = value.callback.apply(value.bind, this._arguments);

        return value.callback.apply(myBind, myArgument);
    }

    show() {
        return this._callbacks;
    }

    /**
     * save many callbacks to fire
     * @param objects
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
                value.argument
            );
        }.bind(this));
        return true;
    }

    /**
     * save one callback to fire
     * @param callback
     * @param name
     * @param ones
     * @param my_bind_object
     * @param my_argument_object
     * @returns {boolean}
     */
    save(callback, name, ones, my_bind_object, my_argument_object) {
        if (!_.isFunction(callback)) {
            return false;
        }
        this._callbacks.push({
            name: name,
            callback: callback,
            ones: _.isBoolean(ones) ? ones : false,
            bind: _.isObject(my_bind_object) ? my_bind_object : null,
            argument: _.isObject(my_argument_object) ? my_argument_object : null
        });
        return true;
    }


    /**
     * bind to bind when this waiter become fired
     * @param my_bind_object
     */
    bind(my_bind_object) {
        if (_.isObject(my_bind_object)) {
            this._bind_object = my_bind_object;
        }
    }

    /**
     * regist argument to use this when this waiter become fired
     * @param array
     */
    arguments(array) {
        if (_.isArray(array)) {
            this._arguments = array;
        }
    }

    /**
     * remove all clear
     */
    clear() {
        _.remove(this._callbacks, function () {
            return true;
        });
    }
}