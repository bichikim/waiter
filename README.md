# The Waiter 
## When you need a solution execute many function at one, it helps you!

##Installation
Please use ^1.0.9
````bash
npm install --save bichi-waiter
````
##use synchrony
```javascript
import Waiter from 'bichi-waiter';
const waiter = new Waiter();
const callbacks = {
    sayHello:{
        callback(){
            return 'Hello' 
        }
    },
    sayHelloOnes:{
        callback(){
             return 'Hello' 
        },
        ones: true,
    },
    wontSayHelloByExecuteOption:{
        callback(){
            return 'Hello' 
        },
    },
    sayHelloGlobalBind:{
        callback(){
            return `Hello ${this.name}`;
        }
    },
    sayHelloLocalBind:{
        callback(){
            return `Hello ${this.name_local}`;
        },
        bind:{
            name_local: 'foo_local'
        }
    },
    sayHelloGlobalArguments:{
        callback(name){
            return `hello ${name}`
        }
    }
};

//this is global bind
waiter.bind({
    name:'foo_global'
});

waiter.arguments(['Foo argument global']);

console.log(waiter.execute({
    wontSayHelloByExecuteOption:{
        operate: false
    }
}));
```
#use asynchronously
```javascript
import Waiter from 'bichi-waiter';
const waiter = new Waiter();
const callbacks = {
    sayHello:{
        callback(){
            return 'Hello' 
        }
    },
    sayHelloOnes:{
        callback(){
             return 'Hello' 
        },
        ones: true,
    },
    wontSayHelloByExecuteOption:{
        callback(){
            return 'Hello' 
        },
    },
    sayHelloGlobalBind:{
        callback(){
            return `Hello ${this.name}`;
        }
    },
    sayHelloLocalBind:{
        callback(){
            return `Hello ${this.name_local}`;
        },
        bind:{
            name_local: 'foo_local'
        }
    },
    sayHelloGlobalArguments:{
        callback(name){
            return `hello ${name}`
        }
    }
};

//this is global bind
waiter.bind({
    name:'foo_global'
});

waiter.arguments(['Foo argument global']);

waiter.executeAsync({}, (result) => {
    console.log(result);
});
```