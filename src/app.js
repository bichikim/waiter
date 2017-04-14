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
    }

    /**
     * 모든 함수 시작
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
            if(isOption){
                if(!_.isNil(option[value.name]) && option[value.name].operate){
                    doExecute = true;
                }
            }else{
                doExecute = true;
            }
            if(doExecute){
                returnObject[value.name] = this._executeOne(value, _.isNil(option[value.name])?[]:option[value.name]);
            }
            return true;
        }.bind(this));

        //오브젝트 자식 값이 ones 가 참인 것은 한번만 실행 함으로 제거
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
            //만약 callback이 함수가 아니라 작동이 안되면 한번만 실행 한는 것을 무조건 참으로 바꾸어
            //마지막 fire가 끝나고 삭제 되도록 한다.
            value.ones = true;
            return true;
        }

        let myArgument,
            myBind;
        //내장 바인드 > 전역 바인드
        if (_.isObject(value.bind)) {
            myBind = value.bind;
        } else {
            myBind = this._bind_object;
        }

        if(_.isArray(option.arguments)){
            myArgument = option.arguments
        }else if(_.isArray(value.argument)){
            myArgument = value.argument;
        }else {
            myArgument = this._arguments;
        }

        if(_.isArray(option.additionalArguments)){
            myArgument = _.union(myArgument,option.additionalArguments);
        }


        if(_.isObject(option.bind)){
            _.forEach(option.bind, function (value, name) {
                myBind[name] = value;
            });
        }

        //returned = value.callback.apply(value.bind, this._arguments);
        //함수 실행 후 리턴 값
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
    save(callback, name, ones, my_bind_object,my_argument_object) {
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