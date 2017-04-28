# The Waiter 
## When you need a solution to execute many functions at ones, it helps you!

## Installation
Please use ^1.0.14
````bash
npm install --save bichi-waiter
````
## use synchrony
```javascript
import Waiter from 'bichi-waiter';
const waiter = new Waiter();
const callbacks = {
    sayHello: {
        callback(){
            return 'Hello'
        }
    },
    sayHelloOnes: {
        callback(){
            return 'Hello'
        },
        ones: true,
    },
    sayHelloWithOperateFalseOption: {
        callback(){
            //It won't say hello
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
            name_local: 'foo_local'
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
        arguments:['Local argument 1', 'Local argument 2']
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
};

waiter.saveMany(callbacks);

//This is global bind
waiter.bind({
    name: 'Global bind'
});

waiter.arguments(['Global argument']);

const option = {
    sayHelloWithOperateFalseOption: {
        operate: false
    },
    sayHelloExecuteBind:{
        bind:{
            name : 'Execute bind'
        }
    },
    sayHelloExecuteArguments:{
        arguments:['Execute argument']
    },
    sayHelloExecuteAdditionalArguments:{
        additionalArguments :['Execute additional argument'],
    }
};


console.log(waiter.execute(option));

console.log('It will be shown after a result of execute!');
```
## use asynchronously
```javascript
import Waiter from 'bichi-waiter';
const waiter = new Waiter();
const callbacks = {
    sayHello: {
        callback(){
            return 'Hello'
        }
    },
    sayHelloOnes: {
        callback(){
            return 'Hello'
        },
        ones: true,
    },
    sayHelloWithOperateFalseOption: {
        callback(){
            //It won't say hello
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
            name_local: 'foo_local'
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
        arguments:['Local argument 1', 'Local argument 2']
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
            throw new Error('Hello');
        },
    },
};

waiter.saveMany(callbacks);

//This is global bind
waiter.bind({
    name: 'Global bind'
});

waiter.arguments(['Global argument']);

const option = {
    sayHelloWithOperateFalseOption: {
        operate: false
    },
    sayHelloExecuteBind:{
        bind:{
            name : 'Execute bind'
        }
    },
    sayHelloExecuteArguments:{
        arguments:['Execute argument']
    },
    sayHelloExecuteAdditionalArguments:{
        additionalArguments :['Execute additional argument'],
    }
};



 waiter.executeAsync(option, (result) => {
 console.log(result);
 },(reason)=>{
 console.error(reason);
 console.log(`Error from ${reason.name}`);
 });

//now you can use like this. ^1.0.17
 waiter.executeAsync(option)
     .then((result) => {
         window.console.log(result)
     })
     .catch((reason) => {
         window.console.log(reason);
         window.console.log(reason.name);
     });
 
console.log('It will be shown before a result of executeAsync!');
```