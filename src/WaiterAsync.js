import _ from 'lodash';
import Waiter from './Waiter';
export default class WaiterAsync extends Waiter {

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
        //eslint-disable-next-line one-var
        const async = async () => {
            //Promises to add in Promise.all to execute all asynchronously
            const {length} = groups,
                results = [];

            for (let i = 0; i < length; i += 1) {
                //For returning result names
                const keys = [],
                    myOption = groups[i],
                    promises = [];
                _.forEach(this._handlers, (callbackObject) => {
                    const {name} = callbackObject,
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
                        if (refresh) {
                            //Make and push Promise
                            callbackObject.promise = this._makePromise(
                                callbackObject,
                                this._assembleBind(callbackObject, option),
                                this._pickArguments(callbackObject, option)
                            );
                            promises.push(callbackObject.promise);
                        } else {
                            promises.push(callbackObject.promise);
                        }
                    }
                });
                //eslint-disable-next-line no-await-in-loop
                await Promise.all(promises)
                    .catch((reason) => callbacks._reject(reason))
                    .then((result) => {
                        const myResult = this._makeResultObject(keys, result);
                        results.push(myResult);
                        callbacks._result(myResult);
                    });
            }
            return results
        };

        //Execute all
        async().then((results) => callbacks._conclude(results));
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
        }());
    }

    /**
     *
     * @param {Array} names
     * @param {Array} results
     * @return {Object}
     * @private
     */
    //eslint-disable-next-line class-methods-use-this
    _makeResultObject(names, results) {
        const resultObject = {};
        _.forEach(results, (result, index) => {
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
    _AsyncCallback() {
        return {
            thenList: [],
            catchList: [],
            concludeCallback: null,
            then(callback){
                this.thenList.push(callback);
                return this;
            },
            catch(callback){
                this.catchList.push(callback);
                return this;
            },
            final(callback){
                if (_.isFunction(callback)) {
                    this.concludeCallback = callback;
                }
            },
            _result(result){
                if (this.thenList.length > 0) {
                    this.thenList.shift()(result);
                }
            },
            _reject(reason){
                if (this.catchList.length > 0) {
                    this.catchList.shift()(reason);
                }
            },
            _conclude(results){
                if (_.isFunction(this.concludeCallback)) {
                    this.concludeCallback(results);
                }
            },
        }
    }
}