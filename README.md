# The Waiter 
## When you need a solution execute many function at one, it helps you!

##Installation
Must use ^1.0.6
````bash
npm install --save bichi-waiter
````
##use 
```javascript
import Waiter from 'bichi-waiter';
const waiter = new Waiter();
const object = {
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
}

//this is global bind
waiter.bind({
    name:'foo_global'
});

waiter.arguments(['Foo argument global'])

const results = waiter.execute({
    sayHello:{
        operate: false
    }
})
```