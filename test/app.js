/*eslint-disable comma-dangle */
import Waiter from '../src/app';
const waiter = new Waiter();

//eslint-disable-next-line one-var
const callbacks = {
    sayHello: {
        callback(){
            return 'Hello'
        },
    },
    sayHelloOnes: {
        callback(){
            return 'Hello'
        },
        ones: true,
    },
    sayHelloWithOperateFalseOption: {
        callback(){
            //it won't say hello
            return 'Hello'
        },
    },
    sayHelloGlobalBind: {
        callback(){
            return `Hello ${this.name}`;
        },
    },
    sayHelloLocalBind: {
        callback(){
            return `Hello ${this.name_local}`;
        },
        bind: {
            name_local: 'foo_local',
        },
    },
    sayHelloGlobalArguments: {
        callback(name){
            return `Hello ${name}`
        },
    },
    sayHelloLoLocalArguments: {
        callback(name1, name2){
            return `hello ${name1}, ${name2}`
        },
        arguments: ['Local argument 1', 'Local argument 2'],
    },
    sayHelloExecuteBind: {
        callback(){
            return `Hello ${this.name}`
        },
    },
    sayHelloExecuteArguments: {
        callback(name){
            return `Hello ${name}`
        },
    },
    sayHelloExecuteAdditionalArguments: {
        callback(GlobalName, additionalName){
            return `Hello ${GlobalName}, ${additionalName}`
        },
    },
    sayHelloError: {
        callback(){
            //throw new Error('Hello');
        },
    },
};

waiter.saveMany(callbacks);

//this is global bind
waiter.bind({
    name: 'Global bind',
});

waiter.arguments(['Global argument']);

//eslint-disable-next-line one-var
const option = {
    sayHelloWithOperateFalseOption: {
        operate: false,
    },
    sayHelloExecuteBind: {
        bind: {
            name: 'Execute bind',
        },
    },
    sayHelloExecuteArguments: {
        arguments: ['Execute argument']
    },
    sayHelloExecuteAdditionalArguments: {
        additionalArguments: ['Execute additional argument'],
    },
};


waiter.executeAsync(option, (result) => {
    window.console.log(result);
}, (reason) => {
    window.console.log(reason);
    window.console.log(reason.name);
});

/*
 waiter.executeAsync(option, (result) => {
 console.log(result);
 });
 */

window.console.log('It will be shown before executeAsync result!');

setTimeout(() => {
    waiter.executeAsync(option, (result) => {
        window.console.log(result);
    }, (reason) => {
        window.console.log(reason);
        window.console.log(reason.name);
    });
    window.console.log(waiter.remove('sayHello'));
    window.console.log(waiter.show);
    waiter.clear();
    window.console.log(waiter.show);
//eslint-disable-next-line no-magic-numbers
}, 1000);