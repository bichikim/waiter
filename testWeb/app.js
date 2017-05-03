/*eslint-disable comma-dangle */
import {WaiterAsync} from '../src/app';
const waiter = new WaiterAsync();

//eslint-disable-next-line one-var
waiter.saveMany({
    sayHello: {
        handler(){
            return 'Hello'
        },
    },
    sayHelloOnes: {
        handler(){
            return 'Hello'
        },
        ones: true,
    },
    sayHelloWithOperateFalseOption: {
        handler(){
            //it won't say hello
            return 'Hello'
        },
    },
    sayHelloGlobalBind: {
        handler(){
            return `Hello ${this.name}`;
        },
    },
    sayHelloLocalBind: {
        handler(){
            return `Hello ${this.name_local}`;
        },
        bind: {
            name_local: 'foo_local',
        },
    },
    sayHelloGlobalArguments: {
        handler(name){
            return `Hello ${name}`
        },
    },
    sayHelloLoLocalArguments: {
        handler(name1, name2){
            return `hello ${name1}, ${name2}`
        },
        arguments: ['Local argument 1', 'Local argument 2'],
    },
    sayHelloExecuteBind: {
        handler(){
            return `Hello ${this.name}`
        },
    },
    sayHelloExecuteArguments: {
        handler(name){
            return `Hello ${name}`
        },
    },
    sayHelloExecuteAdditionalArguments: {
        handler(GlobalName, additionalName){
            return `Hello ${GlobalName}, ${additionalName}`
        },
    },
    sayHelloError: {
        handler(){
            //throw new Error('Hello');
        },
    },
});

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
//eslint-disable-next-line one-var
const options = [
    option,
    {
        sayHelloWithOperateFalseOption: {
            operate: true,
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
    }
];

//window.console.log(waiter.execute(option));

/*waiter.executeAsync(option)
    .then((result) => {
        window.console.log(result)
    })
    .catch((reason) => {
        window.console.log(reason);
        window.console.log(reason.name);
    })
    .then((result) => {
        window.console.log(result)
    });*/

waiter.executeAsync(options)
    .then((result) => {
        window.console.log(result)
    })
    .catch((reason) => {
        window.console.log(reason);
        window.console.log(reason.name);
    })
    .then((result) => {
        window.console.log(result)
    })
    .final((results) => {
        window.console.log(results);
    });


/*waiter.executeAsync(option, (result) => {
 window.console.log(result);
 }, (reason) => {
 window.console.log(reason);
 window.console.log(reason.name);
 });*/

/*
 waiter.executeAsync(option, (result) => {
 console.log(result);
 });
 */

window.console.log('It will be shown before executeAsync result!');

setTimeout(() => {
    waiter.remove('sayHello');
    //window.console.log();
    //window.console.log(waiter.show);
    waiter.clear();
    //window.console.log(waiter.show);
//eslint-disable-next-line no-magic-numbers
}, 1000);
