1. ### What are the possible ways to create objects in JavaScript
    There are many ways to create objects in javascript as mentioned below:
    1. **Object literal syntax:**
    2. **Object constructor:**
    3. **Object's create method:**
    4. **Function constructor:**
    5. **Function constructor with prototype:**
    6. **Object's assign method:**
    7. **ES6 Class syntax:**
    8. **Singleton pattern:**

2. ### What is a prototype chain

    The prototype chain is a core concept in JavaScript’s inheritance model. It allows objects to inherit properties and methods from other objects. When you try to access a property or method on an object, JavaScript first looks for it on that object itself. If it’s not found, the engine looks up the object's internal `[[Prototype]]` reference (accessible via `Object.getPrototypeOf(obj)` or the deprecated `__proto__` property) and continues searching up the chain until it finds the property or reaches the end (usually `null`).

3. ### What is the Difference Between `call`, `apply`, and `bind`

    In JavaScript, `call`, `apply`, and `bind` are methods that allow you to control the context (`this` value) in which a function is executed. While their purposes are similar, they differ in how they handle arguments and when the function is invoked.

    ---

    #### `call`

    - **Description:**  
    The `call()` method invokes a function immediately, allowing you to specify the value of `this` and pass arguments individually (comma-separated).

    - **Syntax:**  
    ```js
    func.call(thisArg, arg1, arg2, ...)
    ```


    ---

    #### `apply`

    - **Description:**  
    The `apply()` method is similar to `call()`, but it takes the function arguments as an array (or array-like object) instead of individual arguments.

    - **Syntax:**  
    ```js
    func.apply(thisArg, [argsArray])
    ```


    ---

    #### `bind`

    - **Description:**  
    The `bind()` method creates a new function with a specific `this` value and, optionally, preset initial arguments. Unlike `call` and `apply`, `bind` does **not** immediately invoke the function; instead, it returns a new function that you can call later.

    - **Syntax:**  
    ```js
    var boundFunc = func.bind(thisArg[, arg1[, arg2[, ...]]])
    ```

4. ### What is JSON and its common operations

    **JSON (JavaScript Object Notation)** is a lightweight, text-based data format that uses JavaScript object syntax for structuring data. It was popularized by Douglas Crockford and is widely used for transmitting data between a server and a client in web applications. JSON files typically have a `.json` extension and use the MIME type `application/json`. 

    #### Common Operations with JSON

    1. **Parsing**: Transforming a JSON-formatted string into a native JavaScript object.
      ```js
      const obj = JSON.parse(jsonString);
      ```

    2. **Stringification**: Converting a JavaScript object into a JSON-formatted string, commonly used for data transmission or storage.
      ```js
      const jsonString = JSON.stringify(object);
      ```


5. ### What is the purpose of the array slice method

    The `slice()` method in JavaScript is used to extract a section of an array, returning a new array containing the selected elements. It does not modify the original array. The method takes two arguments:

    - **start**: The index at which extraction begins (inclusive).
    - **end** (optional): The index before which to end extraction (exclusive). If omitted, extraction continues to the end of the array.

    You can also use negative indices, which count from the end of the array.


    **Note:**  
    The `slice()` method does **not** mutate (change) the original array; instead, it returns a new array containing the extracted elements.


6. ### What is the purpose of the array splice method

    The `splice()` method in JavaScript is used to add, remove, or replace elements within an array. Unlike `slice()`, which creates a shallow copy and does not alter the original array, `splice()` **modifies the original array in place** and returns an array containing the removed elements.

    #### Syntax

    ```javascript
    array.splice(start, deleteCount, item1, item2, ...)
    ```
    - **start:** The index at which to start changing the array.
    - **deleteCount:** (Optional) The number of elements to remove from the array. If omitted, all elements from the start index to the end of the array will be removed.
    - **item1, item2, ...:** (Optional) Elements to add to the array, starting at the start position.


    **Note:**  
    - The `splice()` method **modifies the original array**.
    - It returns an array containing the elements that were removed (if any).
    - You can use it both to remove and insert elements in a single operation.


7. ### What is the difference between slice and splice
   
    Here are the key differences between `slice()` and `splice()` methods in JavaScript arrays:

    | `slice()`                                         | `splice()`                                          |
    | ------------------------------------------------- | --------------------------------------------------- |
    | Does **not** modify the original array (immutable) | Modifies the original array (mutable)               |
    | Returns a **shallow copy** (subset) of selected elements | Returns an array of the **removed** elements           |
    | Used to **extract** elements from an array         | Used to **add**, **remove**, or **replace** elements in an array |
    | Syntax: `array.slice(start, end)`                  | Syntax: `array.splice(start, deleteCount, ...items)`             |

    **Summary:**  
    - Use `slice()` when you want to copy or extract elements without altering the original array.
    - Use `splice()` when you need to add, remove, or replace elements and want to change the original array.


8. ### How do you compare Object and Map

    **Objects** and **Maps** both allow you to associate keys with values, retrieve those values, delete keys, and check if a key exists. Historically, Objects have been used as Maps, but there are several key differences that make `Map` a better choice in certain scenarios:

    | Feature                  | Object                                              | Map                                                      |
    |--------------------------|-----------------------------------------------------|----------------------------------------------------------|
    | **Key Types**            | Only strings and symbols are valid keys             | Any value can be used as a key (objects, functions, primitives) |
    | **Key Order**            | Keys are unordered (in practice, insertion order is mostly preserved for string keys, but not guaranteed) | Keys are ordered by insertion; iteration follows insertion order |
    | **Size Property**        | No built-in way to get the number of keys; must use `Object.keys(obj).length` | Use the `.size` property for the number of entries        |
    | **Iterability**          | Not directly iterable; must use `Object.keys`, `Object.values`, or `Object.entries` | Directly iterable with `for...of`, `.keys()`, `.values()`, `.entries()` |
    | **Prototype**            | Has a prototype chain; may have default properties that can collide with custom keys (can be avoided with `Object.create(null)`) | Does not have a prototype, so there are no default keys   |
    | **Performance**          | May be less efficient for frequent additions/removals | Optimized for frequent additions and deletions            |
    | **Serialization**        | Can be easily serialized to JSON                    | Cannot be directly serialized to JSON                     |


9. ### What is the difference between == and === operators
    JavaScript provides two types of equality operators:

    - **Loose equality (`==`, `!=`)**: Performs type conversion if the types differ, comparing values after converting them to a common type.
    - **Strict equality (`===`, `!==`)**: Compares both value and type, without any type conversion.

    #### Strict Equality (`===`)
    - Two strings are strictly equal if they have exactly the same sequence of characters and length.
    - Two numbers are strictly equal if they have the same numeric value.
      - **Special cases:**
        - `NaN === NaN` is `false`
        - `+0 === -0` is `true`
    - Two booleans are strictly equal if both are `true` or both are `false`.
    - Two objects are strictly equal if they refer to the **same object** in memory.
    - `null` and `undefined` are **not** strictly equal.

    #### Loose Equality (`==`)
    - Converts operands to the same type before making the comparison.
    - `null == undefined` is `true`.
    - `"1" == 1` is `true` because the string is converted to a number.
    - `0 == false` is `true` because `false` is converted to `0`.


10. ### What are lambda expressions or arrow functions

    **Arrow functions** (also known as "lambda expressions") provide a concise syntax for writing function expressions in JavaScript. Introduced in ES6, arrow functions are often shorter and more readable, especially for simple operations or callbacks.

    #### Syntax Examples:

    ```javascript
    const arrowFunc1 = (a, b) => a + b;    // Multiple parameters, returns a + b
    const arrowFunc2 = a => a * 10;        // Single parameter (parentheses optional), returns a * 10
    const arrowFunc3 = () => {};           // No parameters, returns undefined
    const arrowFunc4 = (a, b) => {
      // Multiple statements require curly braces and explicit return
      const sum = a + b;
      return sum * 2;
    };
    ```


11. ### What is a first class function

    In JavaScript, **first-class functions(first-class citizens)** mean that functions are treated like any other variable. That means:

    1. You can assign a function to a variable.
    2. You can pass a function as an argument to another function.
    3. You can return a function from another function.

    This capability enables powerful patterns like callbacks, higher-order functions, event handling, and functional programming in JavaScript.
    


12. ### What is a first order function

    A first-order function is a function that doesn’t accept another function as an argument and doesn’t return a function as its return value. i.e,  It's a regular function that works with primitive or non-function values.

    ```javascript
    const firstOrder = () => console.log("I am a first order function!");
    ```


13. ### What is a higher order function

    A higher-order function is a function that either accepts another function as an argument, returns a function as its result, or both. This concept is a core part of JavaScript's functional programming capabilities and is widely used for creating modular, reusable, and expressive code.

    1. `firstOrderFunc` is a regular (first-order) function.

    2. `higherOrder` is a higher-order function because it takes another function as an argument.

    3. `firstOrderFunc` is also called a **callback function** because it is passed to and executed by another function.


14. ### What is a unary function

    A unary function (also known as a **monadic** function) is a function that **accepts exactly one argument**. The term "unary" simply refers to the function's arity—the number of arguments it takes.


    - `unaryFunction` takes a single parameter `a`, making it a unary function.
    - It performs a simple operation: adding 10 to the input and printing the result.


15. ### What is the currying function
    
    **Currying** is the process of transforming a function with **multiple arguments** into a sequence of **nested functions**, each accepting **only one argument** at a time.

    This concept is named after mathematician **Haskell Curry**, and is commonly used in functional programming to enhance modularity and reuse.


16. ### What is a pure function

    A **pure function** is a function whose output depends only on its input arguments and produces no side effects. This means that given the same inputs, a pure function will always return the same output, and it does not modify any external state or data.

    - `impureAddNumber` changes the external variable numberArray and returns the new length of the array, making it impure.
    - `pureAddNumber` creates a new array with the added number and does not modify the original array, making it pure.

17. ### What are the benefits of pure functions
    Some of the major benefits of pure functions are listed below,

    - **Easier testing:** Since output depends only on input, pure functions are simple to test.
    - **Predictability:** No hidden side effects make behavior easier to reason about.
    - **Immutability:** Pure functions align with ES6 best practices, such as preferring const over let, supporting safer and more maintainable code.
    - **No side effects:** Reduces bugs related to shared state or mutation.


18. ### What is the purpose of the let keyword

    The `let` keyword in JavaScript is used to declare a **block-scoped local variable**. This means that variables declared with `let` are only accessible within the block, statement, or expression where they are defined. This is a significant improvement over the older `var` keyword, which is function-scoped (or globally-scoped if declared outside a function), and does not respect block-level scoping.

    #### Key Features of `let`:
    - **Block Scope:** The variable exists only within the nearest enclosing block (e.g., inside an `{}` pair).
    - **No Hoisting Issues:** While `let` declarations are hoisted, they are not initialized until the code defining them is executed. Accessing them before declaration results in a ReferenceError (temporal dead zone).
    - **No Redeclaration:** The same variable cannot be declared twice in the same scope with `let`.



    In summary, you need to use `let` when you want variables to be limited to the block in which they are defined, preventing accidental overwrites and bugs related to variable scope.


19. ### What is the difference between let and var

    You can list out the differences in a tabular format

    | var                                                            | let                                           |
    | -------------------------------------------------------------- | --------------------------------------------- |
    | It has been available from the beginning of JavaScript         | Introduced as part of ES6                     |
    | It has function scope                                          | It has block scope                            |
    | Variable declaration will be hoisted, initialized as undefined | Hoisted but not initialized                   |
    | It is possible to re-declare the variable in the same scope    | It is not possible to re-declare the variable |



20. ### What is the reason to choose the name let as a keyword

    The keyword `let` was chosen because it originates from mathematical notation, where "let" is used to introduce new variables (for example, "let x = 5"). This term was adopted by several early programming languages such as Scheme and BASIC, establishing a tradition in computer science. JavaScript follows this convention by using `let` to declare variables with block scope, providing a modern alternative to `var`. The choice helps make the language more familiar to programmers coming from other languages and aligns with the mathematical practice of variable assignment.


21. ### How do you redeclare variables in a switch block without an error

    
    To avoid this error, you can create a new block scope within each `case` clause by wrapping the code in curly braces `{}`. This way, each `let` or `const` declaration is scoped only to that block, and redeclaration errors are avoided:
    
    ```javascript
    let counter = 1;
    switch (x) {
      case 0: {
        let name;
        // code for case 0
        break;
      }
      case 1: {
        let name; // No SyntaxError
        // code for case 1
        break;
      }
    }
    ```
    
    That means, to safely redeclare variables in different cases of a switch statement, wrap each case’s code in its own block using curly braces. This ensures each variable declaration is scoped to its specific case block.
    

22. ### What is the Temporal Dead Zone

    The **Temporal Dead Zone (TDZ)** refers to the period between the start of a block and the point where a variable declared with `let` or `const` is initialized. During this time, the variable exists in scope but **cannot be accessed**, and attempting to do so results in a `ReferenceError`.
    
    This behavior is part of **JavaScript's ES6 (ECMAScript 2015)** specification and applies **only to variables declared with `let` and `const`**, not `var`. Variables declared with `var` are **hoisted** and initialized with `undefined`, so accessing them before the declaration does not throw an error, though it can lead to unexpected results.
    


23. ### What is an IIFE (Immediately Invoked Function Expression)

    IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined. The signature of it would be as below,

    ```javascript
    (function () {
      // logic here
    })();
    ```

    The primary reason to use an IIFE is to obtain data privacy because any variables declared within the IIFE cannot be accessed by the outside world. i.e, If you try to access variables from the IIFE then it throws an error as below,

    ```javascript
    (function () {
      var message = "IIFE";
      console.log(message);
    })();
    console.log(message); //Error: message is not defined
    ```


24. ### How do you decode or encode a URL in JavaScript?

    `encodeURI()` function is used to encode an URL. This function requires a URL string as a parameter and return that encoded string.
    `decodeURI()` function is used to decode an URL. This function requires an encoded URL string as parameter and return that decoded string.

    **Note:** If you want to encode characters such as `/ ? : @ & = + $ #` then you need to use `encodeURIComponent()`.

    ```javascript
    let uri = "employeeDetails?name=john&occupation=manager";
    let encoded_uri = encodeURI(uri);
    let decoded_uri = decodeURI(encoded_uri);
    ```


25. ### What is memoization

    Memoization is a functional programming technique which attempts to increase a function’s performance by caching its previously computed results. Each time a memoized function is called, its parameters are used to index the cache. If the data is present, then it can be returned, without executing the entire function. Otherwise the function is executed and then the result is added to the cache.


26. ### What is Hoisting

 
Hoisting is JavaScript's default behavior where **variable and function declarations** are moved to the top of their scope before code execution. This means you can access certain variables and functions even before they are defined in the code.



```js
var message;
console.log(message); // undefined
message = "The variable has been hoisted";
```


Because of hoisting, functions can be used before they are declared.


27. ### What are classes in ES6

    In ES6, JavaScript classes are primarily syntactic sugar over JavaScript’s existing prototype-based inheritance.

    Whereas ES6 classes can be defined as an alternative

    ```javascript
    class Bike {
      constructor(color, model) {
        this.color = color;
        this.model = model;
      }

      getDetails() {
        return this.model + " bike has" + this.color + " color";
      }
    }
    ```


28. ### What are closures

    A closure is the combination of a function bundled(enclosed) together with its lexical environment within which that function was declared. i.e, It is an inner function that has access to the outer or enclosing function’s variables, functions and other data even after the outer function has finished its execution. The closure has three scope chains.

    1. Own scope where variables defined between its curly brackets
    2. Outer function's variables
    3. Global variables




29. ### What are modules

    Modules refer to small units of independent, reusable code and also act as the foundation of many JavaScript design patterns. Most of the JavaScript modules export an object literal, a function, or a constructor


30. ### Why do you need modules

    Below are the list of benefits using modules in javascript ecosystem

    1. Maintainability
    2. Reusability
    3. Namespacing


31. ### What is scope in javascript

    Scope is the accessibility of variables, functions, and objects in some particular part of your code during runtime. In other words, scope determines the visibility of variables and other resources in areas of your code.


32. ### What is a service worker

    A Service worker is basically a script (JavaScript file) that runs in the background, separate from a web page and provides features that don't need a web page or user interaction. Some of the major features of service workers are Rich offline experiences(offline first web application development), periodic background syncs, push notifications, intercept and handle network requests and programmatically managing a cache of responses.


33. ### How do you manipulate DOM using a service worker

    Service worker can't access the DOM directly. But it can communicate with the pages it controls by responding to messages sent via the `postMessage` interface, and those pages can manipulate the DOM.


34. ### How do you reuse information across service worker restarts

    The problem with service worker is that it gets terminated when not in use, and restarted when it's next needed, so you cannot rely on global state within a service worker's `onfetch` and `onmessage` handlers. In this case, service workers will have access to IndexedDB API in order to persist and reuse across restarts.


35. ### What is IndexedDB

    IndexedDB is a low-level API for client-side storage of larger amounts of structured data, including files/blobs. This API uses indexes to enable high-performance searches of this data.


36. ### What is web storage

    Web storage is an API that provides a mechanism by which browsers can store key/value pairs locally within the user's browser, in a much more intuitive fashion than using cookies. The web storage provides two mechanisms for storing data on the client.

    1. **Local storage:** It stores data for current origin with no expiration date.
    2. **Session storage:** It stores data for one session and the data is lost when the browser tab is closed.


37. ### What is a post message

    Post message is a method that enables cross-origin communication between Window objects.(i.e, between a page and a pop-up that it spawned, or between a page and an iframe embedded within it). Generally, scripts on different pages are allowed to access each other if and only if the pages follow same-origin policy(i.e, pages share the same protocol, port number, and host).


38. ### What is a Cookie

    A cookie is a piece of data that is stored on your computer to be accessed by your browser. Cookies are saved as key/value pairs.



39. ### Why do you need a Cookie

    Cookies are used to remember information about the user profile(such as username). It basically involves two steps,

    1. When a user visits a web page, the user profile can be stored in a cookie.
    2. Next time the user visits the page, the cookie remembers the user profile.


40. ### What are the options in a cookie

    There are few below options available for a cookie,

    1. By default, the cookie is deleted when the browser is closed but you can change this behavior by setting expiry date (in UTC time).

    ```javascript
    document.cookie = "username=John; expires=Sat, 8 Jun 2019 12:00:00 UTC";
    ```

    2. By default, the cookie belongs to a current page. But you can tell the browser what path the cookie belongs to using a path parameter.

    ```javascript
    document.cookie = "username=John; path=/services";
    ```


41. ### How do you delete a cookie

    You can delete a cookie by setting the expiry date as a passed date. You don't need to specify a cookie value in this case.

    **Note:** You should define the cookie path option to ensure that you delete the right cookie. Some browsers doesn't allow to delete a cookie unless you specify a path parameter.


42. ### What are the differences between cookie, local storage and session storage

    Below are some of the differences between cookie, local storage and session storage,

    | Feature                           | Cookie                                                                                                              | Local storage         | Session storage     |
    | --------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------- |
    | Accessed on client or server side | Both server-side & client-side. The `set-cookie` HTTP response header is used by server inorder to send it to user. | client-side only      | client-side only    |
    | Expiry                            | Manually configured using Expires option                                                                            | Forever until deleted | until tab is closed |
    | SSL support                       | Supported                                                                                                           | Not supported         | Not supported       |
    | Maximum data size                 | 4KB                                                                                                                 | 5 MB                  | 5MB                 |
    | Accessible from                   | Any window                                                                                                          | Any window            | Same tab            |
    | Sent with requests                | Yes                                                                                                                 | No                    | No                  |


43. ### What is the main difference between localStorage and sessionStorage

    LocalStorage is the same as SessionStorage but it persists the data even when the browser is closed and reopened(i.e it has no expiration time) whereas in sessionStorage data gets cleared when the page session ends.


44. ### How do you access web storage

    The Window object implements the `WindowLocalStorage` and `WindowSessionStorage` objects which has `localStorage`(window.localStorage) and `sessionStorage`(window.sessionStorage) properties respectively. These properties create an instance of the Storage object, through which data items can be set, retrieved and removed for a specific domain and storage type (session or local).


45. ### What are the methods available on session storage

    The session storage provided methods for reading, writing and clearing the session data

    ```javascript
    // Save data to sessionStorage
    sessionStorage.setItem("key", "value");

    // Get saved data from sessionStorage
    let data = sessionStorage.getItem("key");

    // Remove saved data from sessionStorage
    sessionStorage.removeItem("key");

    // Remove all saved data from sessionStorage
    sessionStorage.clear();
    ```


46. ### What is a storage event and its event handler

    The StorageEvent is an event that fires when a storage area has been changed in the context of another document. Whereas onstorage property is an EventHandler for processing storage events.



47. ### Why do you need web storage

    Web storage is more secure, and large amounts of data can be stored locally, without affecting website performance. Also, the information is never transferred to the server. Hence this is a more recommended approach than Cookies.


48. ### How do you check web storage browser support

    You need to check browser support for localStorage and sessionStorage before using web storage,

    ```javascript
    if (typeof Storage !== "undefined") {
      // Code for localStorage/sessionStorage.
    } else {
      // Sorry! No Web Storage support..
    }
    ```


49. ### How do you check web workers browser support

    You need to check browser support for web workers before using it

    ```javascript
    if (typeof Worker !== "undefined") {
      // code for Web worker support.
    } else {
      // Sorry! No Web Worker support..
    }
    ```



50. ### What are the restrictions of web workers on DOM

    WebWorkers don't have access to below javascript objects since they are defined in an external files

    1. Window object
    2. Document object
    3. Parent object


51. ### What is a promise
    A **Promise** is a JavaScript object that represents the eventual completion (or failure) of an asynchronous operation and its resulting value. It acts as a placeholder for a value that may not be available yet but will be resolved in the future.

    A Promise can be in one of **three states**:
    - `pending`: Initial state, neither fulfilled nor rejected.
    - `fulfilled`: The operation completed successfully.
    - `rejected`: The operation failed (e.g., due to a network error).



52. ### Why do you need a promise
    Promises are **used to handle asynchronous operations**, especially in languages like JavaScript, which often work with non-blocking operations such as network requests, file I/O, and timers. When an operation is asynchronous, it doesn't immediately return a result; instead, it works in the background and provides the result later. Handling this in a clean, organized way can be difficult without a structured approach.

    Promises are used to:

    1.  **Handle asynchronous operations**.
    2.  **Provide a cleaner alternative to callbacks**.
    3.  **Avoid callback hell**.
    4.  **Make code more readable and maintainable**.


53. ### Explain the three states of promise

    Promises have three states:

    1. **Pending:** This is an initial state of the Promise before an operation begins
    2. **Fulfilled:** This state indicates that the specified operation was completed.
    3. **Rejected:** This state indicates that the operation did not complete. In this case an error value will be thrown.


54. ### What is a callback function

    A callback function is a function passed into another function as an argument. This function is invoked inside the outer function to complete an action.


55. ### Why do we need callbacks

    The callbacks are needed because javascript is an event driven language. That means instead of waiting for a response, javascript will keep executing while listening for other events.

    As observed from the output, javascript didn't wait for the response of the first function and the remaining code block got executed. So callbacks are used in a way to make sure that certain code doesn’t execute until the other code finishes execution.


56. ### What is a callback hell

    Callback Hell is an anti-pattern with multiple nested callbacks which makes code hard to read and debug when dealing with asynchronous logic. The callback hell looks like below,

    ```javascript
    async1(function(){
        async2(function(){
            async3(function(){
                async4(function(){
                    ....
                });
            });
        });
    });
    ```


57. ### What are server-sent events

    Server-sent events (SSE) is a server push technology enabling a browser to receive automatic updates from a server via HTTP connection without resorting to polling. These are a one way communications channel - events flow from server to client only. This has been used in Facebook/Twitter/X updates, stock price updates, news feeds etc.



58. ### How do you check browser support for server-sent events

    You can perform browser support for server-sent events before using it as below,

    ```javascript
    if (typeof EventSource !== "undefined") {
      // Server-sent events supported. Let's have some code here!
    } else {
      // No server-sent events supported
    }
    ```


59. ### What are the events available for server sent events

    Below are the list of events available for server sent events
    | Event | Description |
    |---- | ---------
    | onopen | It is used when a connection to the server is opened |
    | onmessage | This event is used when a message is received |
    | onerror | It happens when an error occurs|


60. ### What are the main rules of promise

    A promise must follow a specific set of rules:

    1. A promise is an object that supplies a standard-compliant `.then()` method
    2. A pending promise may transition into either fulfilled or rejected state
    3. A fulfilled or rejected promise is settled and it must not transition into any other state.
    4. Once a promise is settled, the value must not change.


61. ### What is callback in callback

    You can nest one callback inside in another callback to execute the actions sequentially one by one. This is known as callbacks in callbacks. Beware, too many levels of nesting lead to [Callback hell](https://github.com/sudheerj/javascript-interview-questions?tab=readme-ov-file#what-is-a-callback-hell)

    ```javascript
    loadScript("/script1.js", function (script) {
      console.log("first script is loaded");

      loadScript("/script2.js", function (script) {
        console.log("second script is loaded");

        loadScript("/script3.js", function (script) {
          console.log("third script is loaded");
          // after all scripts are loaded
        });
      });
    });
    ```


62. ### What is promise chaining


    In the above handlers, the result is passed to the chain of .then() handlers with the below work flow,

    1. The initial promise resolves in 1 second,
    2. After that `.then` handler is called by logging the result(1) and then return a promise with the value of result \* 2.
    3. After that the value passed to the next `.then` handler by logging the result(2) and return a promise with result \* 3.
    4. Finally the value passed to the last `.then` handler by logging the result(6) and return a promise with result \* 4.


63. ### What is promise.all


    **Note:** Remember that the order of the promises(output the result) is maintained as per input order.



64. ### What is a strict mode in javascript

    JavaScript’s "use strict" directive is used to opt into a stricter parsing and error-handling mode for your scripts or functions. It helps catch common bugs, makes your code more secure, and prepares it for future versions of JavaScript.

    Strict Mode is a new feature in ECMAScript 5 that allows you to place a program, or a function, in a “strict” operating context. This way it prevents certain actions from being taken and throws more exceptions. The literal expression `"use strict";` instructs the browser to use the javascript code in the Strict mode. This also enables block-scoped variables.


65. ### Why do you need strict mode

    Strict mode is useful to write "secure" JavaScript by notifying "bad syntax" into real errors. For example, it eliminates accidentally creating a global variable by throwing an error and also throws an error for assignment to a non-writable property, a getter-only property, a non-existing property, a non-existing variable, or a non-existing object.


66. ### How do you declare strict mode

    The strict mode is declared by adding "use strict"; to the beginning of a script or a function.
    If declared at the beginning of a script, it has global scope.

    ```javascript
    "use strict";
    x = 3.14; // This will cause an error because x is not declared
    ```

    and if you declare inside a function, it has local scope

    ```javascript
    x = 3.14; // This will not cause an error.
    myFunction();

    function myFunction() {
      "use strict";
      y = 3.14; // This will cause an error
    }
    ```


67. ### What is the purpose of double exclamation

    The double exclamation or negation(!!) ensures the resulting type is a boolean. If it was falsey (e.g. 0, null, undefined, etc.), it will be false, otherwise, it will be true.

    If you don't use this expression then it returns the original value.

    ```javascript
    console.log(navigator.userAgent.match(/MSIE 8.0/)); // returns either an Array or null
    ```

    **Note:** The expression !! is not an operator, but it is just twice of ! operator.


68. ### What is the purpose of the delete operator

    The delete operator is used to delete the property as well as its value.

    ```javascript
    var user = { firstName: "John", lastName: "Doe", age: 20 };
    delete user.age;

    console.log(user); // {firstName: "John", lastName:"Doe"}
    ```


69. ### What is typeof operator

    You can use the JavaScript typeof operator to find the type of a JavaScript variable. It returns the type of a variable or an expression.

    ```javascript
    typeof "John Abraham"; // Returns "string"
    typeof (1 + 2); // Returns "number"
    typeof [1, 2, 3]; // Returns "object" because all arrays are also objects
    ```


70. ### What is undefined property

    The undefined property indicates that a variable has not been assigned a value, or declared but not initialized at all. The type of undefined value is undefined too.

    ```javascript
    var user; // Value is undefined, type is undefined
    console.log(typeof user); //undefined
    ```

    Any variable can be emptied by setting the value to undefined.

    ```javascript
    user = undefined;
    ```


71. ### What is null value

    The value null represents the intentional absence of any object value. It is one of JavaScript's primitive values. The type of null value is object.
    You can empty the variable by setting the value to null.

    ```javascript
    var user = null;
    console.log(typeof user); //object
    ```


72. ### What is the difference between null and undefined

    Below are the main differences between null and undefined,

    | Null                                                                                            | Undefined                                                                                               |
    | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
    | It is an assignment value which indicates that variable points to no object.                    | It is not an assignment value where a variable has been declared but has not yet been assigned a value. |
    | Type of null is object                                                                          | Type of undefined is undefined                                                                          |
    | The null value is a primitive value that represents the null, empty, or non-existent reference. | The undefined value is a primitive value used when a variable has not been assigned a value.            |
    | Indicates the absence of a value for a variable                                                 | Indicates absence of variable itself                                                                    |
    | Converted to zero (0) while performing primitive operations                                     | Converted to NaN while performing primitive operations                                                  |


73. ### What is eval

    The eval() function evaluates JavaScript code represented as a string. The string can be a JavaScript expression, variable, statement, or sequence of statements.

    ```javascript
    console.log(eval("1 + 2")); //  3
    ```


74. ### How do you access history in javascript

    The window.history object contains the browser's history. You can load previous and next URLs in the history using back() and next() methods.

    ```javascript
    function goBack() {
      window.history.back();
    }
    function goForward() {
      window.history.forward();
    }
    ```

    **Note:** You can also access history without window prefix.


75. ### How do you detect caps lock key turned on or not

    The `mouseEvent getModifierState()` is used to return a boolean value that indicates whether the specified modifier key is activated or not. The modifiers such as CapsLock, ScrollLock and NumLock are activated when they are clicked, and deactivated when they are clicked again.



76. ### What is isNaN

    The isNaN() function is used to determine whether a value is an illegal number (Not-a-Number) or not. i.e, This function returns true if the value equates to NaN. Otherwise it returns false.

    ```javascript
    isNaN("Hello"); //true
    isNaN("100"); //false
    ```


77. ### What are global variables

    Global variables are those that are available throughout the length of the code without any scope. The var keyword is used to declare a local variable but if you omit it then it will become global variable

    ```javascript
    msg = "Hello"; // var is missing, it becomes global variable
    ```


78. ### What are the problems with global variables

    The problem with global variables is the conflict of variable names of local and global scope. It is also difficult to debug and test the code that relies on global variables.


79. ### What is NaN property

    The NaN property is a global property that represents "Not-a-Number" value. i.e, It indicates that a value is not a legal number. It is very rare to use NaN in a program but it can be used as return value for few cases

    ```javascript
    Math.sqrt(-1);
    parseInt("Hello");
    ```


80. ### What is the purpose of isFinite function

    The isFinite() function is used to determine whether a number is a finite, legal number. It returns false if the value is +infinity, -infinity, or NaN (Not-a-Number), otherwise it returns true.

    ```javascript
    isFinite(Infinity); // false
    isFinite(NaN); // false
    isFinite(-Infinity); // false

    isFinite(100); // true
    ```


81. ### What is an event flow

    Event flow refers to the order in which events are handled in the browser when a user interacts with elements on a webpage like clicking, typing, hovering, etc.

    When you click an element that is nested in various other elements, before your click actually reaches its destination, or target element, it must trigger the click event for each of its parent elements first, starting at the top with the global window object.

    Hence, there are three phases in JavaScript’s event flow:

    1. Event Capturing(Top to Bottom): The event starts from the window/document and moves down the DOM tree toward the target element.
    2. Target phase: The event reaches the target element — the element that was actually interacted with.
    3. Event Bubbling(Bottom to Top): The event then bubbles back up from the target element to the root.


82. ### What is event capturing

    Event capturing is a phase of event propagation in which an event is first intercepted by the outermost ancestor element, then travels downward through the DOM hierarchy until it reaches the target (innermost) element.

    To handle events during the capturing phase, you need to pass `true` as the third argument to the `addEventListener` method.


83. ### What is event bubbling

    Event bubbling is a type of event propagation in which an event first triggers on the innermost target element (the one the user interacted with), and then bubbles up through its ancestors in the DOM hierarchy — eventually reaching the outermost elements, like the document or window.


84. ### How do you submit a form using JavaScript

    You can submit a form using `document.forms[0].submit()`. All the form input's information is submitted using onsubmit event handler

    ```javascript
    function submit() {
      document.forms[0].submit();
    }
    ```


85. ### How do you find operating system details

    The window.navigator object contains information about the visitor's browser OS details. Some of the OS properties are available under platform property,

    ```javascript
    console.log(navigator.platform);
    ```


86. ### What is the difference between document load and DOMContentLoaded events

    The `DOMContentLoaded` event is fired when the initial HTML document has been completely loaded and parsed, without waiting for assets(stylesheets, images, and subframes) to finish loading. Whereas The load event is fired when the whole page has loaded, including all dependent resources(stylesheets, images).


87. ### What is the difference between native, host and user objects

    `Native objects` are objects that are part of the JavaScript language defined by the ECMAScript specification. For example, String, Math, RegExp, Object, Function etc core objects defined in the ECMAScript spec.
    `Host objects` are objects provided by the browser or runtime environment (Node).

    For example, window, XmlHttpRequest, DOM nodes etc are considered as host objects.
    `User objects` are objects defined in the javascript code. For example, User objects created for profile information.


88. ### What are the tools or techniques used for debugging JavaScript code

    You can use below tools or techniques for debugging javascript

    1. Chrome Devtools
    2. debugger statement
    3. Good old console.log statement


89. ### What are the pros and cons of promises over callbacks

    Below are the list of pros and cons of promises over callbacks,

    **Pros:**

    1. It avoids callback hell which is unreadable
    2. Easy to write sequential asynchronous code with .then()
    3. Easy to write parallel asynchronous code with Promise.all()
    4. Solves some of the common problems of callbacks(call the callback too late, too early, many times and swallow errors/exceptions)

    **Cons:**

    5. It makes little complex code
    6. You need to load a polyfill if ES6 is not supported


90. ### What is the difference between an attribute and a property



    And after you change the value of the text field to "Good evening", it becomes like

    ```javascript
    console.log(input.getAttribute("value")); // Good evening
    console.log(input.value); // Good evening
    ```


91. ### What is same-origin policy

    The same-origin policy is a policy that prevents JavaScript from making requests across domain boundaries. An origin is defined as a combination of URI scheme, hostname, and port number. If you enable this policy then it prevents a malicious script on one page from obtaining access to sensitive data on another web page using Document Object Model(DOM).


92. ### What is the purpose of void 0

    Void(0) is used to prevent the page from refreshing. This will be helpful to eliminate the unwanted side-effect, because it will return the undefined primitive value. It is commonly used for HTML documents that use href="JavaScript:Void(0);" within an `<a>` element. i.e, when you click a link, the browser loads a new page or refreshes the same page. But this behavior will be prevented using this expression.


93. ### Is JavaScript a compiled or interpreted language

    JavaScript is an interpreted language, not a compiled language. An interpreter in the browser reads over the JavaScript code, interprets each line, and runs it. Nowadays modern browsers use a technology known as Just-In-Time (JIT) compilation, which compiles JavaScript to executable bytecode just as it is about to run.


94. ### Is JavaScript a case-sensitive language

    Yes, JavaScript is a case sensitive language. The language keywords, variables, function & object names, and any other identifiers must always be typed with a consistent capitalization of letters.


95. ### Is there any relation between Java and JavaScript

      No, they are entirely two different programming languages and have nothing to do with each other. But both of them are Object Oriented Programming languages and like many other languages, they follow similar syntax for basic features(if, else, for, switch, break, continue etc).


96. ### What are events

      Events are "things" that happen to HTML elements. When JavaScript is used in HTML pages, JavaScript can `react` on these events. Some of the examples of HTML events are,

      1. Web page has finished loading
      2. Input field was changed
      3. Button was clicked


97. ### Who created javascript

      JavaScript was created by Brendan Eich in 1995 during his time at Netscape Communications. Initially it was developed under the name `Mocha`, but later the language was officially called `LiveScript` when it first shipped in beta releases of Netscape.


98. ### What is the use of preventDefault method


      **Note:** Remember that not all events are cancelable.


99. ### What are the steps involved in return false usage

      The return false statement in event handlers performs the below steps,

      1. First it stops the browser's default action or behaviour.
      2. It prevents the event from propagating the DOM
      3. Stops callback execution and returns immediately when called.


100. ### What is BOM

      The Browser Object Model (BOM) allows JavaScript to "talk to" the browser. It consists of the objects navigator, history, screen, location and document which are children of the window. The Browser Object Model is not standardized and can change based on different browsers.



101. ### Why is JavaScript treated as Single threaded

      JavaScript is a single-threaded language. Because the language specification does not allow the programmer to write code so that the interpreter can run parts of it in parallel in multiple threads or processes. Whereas languages like java, go, C++ can make multi-threaded and multi-process programs.


102. ### What is an event delegation

      Event delegation is a technique for listening to events where you delegate a parent element as the listener for all of the events that happen inside it.



103. ### What is ECMAScript

      ECMAScript is the scripting language that forms the basis of JavaScript. ECMAScript standardized by the ECMA International standards organization in the ECMA-262 and ECMA-402 specifications. The first edition of ECMAScript was released in 1997.


104. ### What is JSON

      JSON (JavaScript Object Notation) is a lightweight format that is used for data interchanging. It is based on a subset of JavaScript language in the way objects are built in JavaScript.


105. ### What are the syntax rules of JSON

      Below are the list of syntax rules of JSON

      1. The data is in name/value pairs
      2. The data is separated by commas
      3. Curly braces hold objects
      4. Square brackets hold arrays


106. ### What is the purpose JSON stringify

      When sending data to a web server, the data has to be in a string format. You can achieve this by converting JSON object into a string using stringify() method.

      ```javascript
      var userJSON = { name: "John", age: 31 };
      var userString = JSON.stringify(userJSON);
      console.log(userString); //"{"name":"John","age":31}"
      ```


107. ### How do you parse JSON string

      When receiving the data from a web server, the data is always in a string format. But you can convert this string value to a javascript object using parse() method.

      ```javascript
      var userString = '{"name":"John","age":31}';
      var userJSON = JSON.parse(userString);
      console.log(userJSON); // {name: "John", age: 31}
      ```


108. ### Why do you need JSON

      When exchanging data between a browser and a server, the data can only be text. Since JSON is text only, it can easily be sent to and from a server, and used as a data format by any programming language.


109. ### What are PWAs

      Progressive web applications (PWAs) are a type of mobile app delivered through the web, built using common web technologies including HTML, CSS and JavaScript. These PWAs are deployed to servers, accessible through URLs, and indexed by search engines.


110. ### What is the purpose of clearTimeout method

      The clearTimeout() function is used in javascript to clear the timeout which has been set by setTimeout()function before that. i.e, The return value of setTimeout() function is stored in a variable and it’s passed into the clearTimeout() function to clear the timer.



111. ### What is the purpose of clearInterval method

      The clearInterval() function is used in javascript to clear the interval which has been set by setInterval() function. i.e, The return value returned by setInterval() function is stored in a variable and it’s passed into the clearInterval() function to clear the interval.



112. ### How do you redirect new page in javascript

      In vanilla javascript, you can redirect to a new page using the `location` property of window object. The syntax would be as follows,

      ```javascript
      function redirect() {
        window.location.href = "newPage.html";
      }
      ```


113. ### How do you check whether a string contains a substring

      There are 3 possible ways to check whether a string contains a substring or not,

      1. **Using includes:** ES6 provided `String.prototype.includes` method to test a string contains a substring

      ```javascript
      var mainString = "hello",
        subString = "hell";
      mainString.includes(subString);
      ```

      2. **Using indexOf:** In an ES5 or older environment, you can use `String.prototype.indexOf` which returns the index of a substring. If the index value is not equal to -1 then it means the substring exists in the main string.

      ```javascript
      var mainString = "hello",
        subString = "hell";
      mainString.indexOf(subString) !== -1;
      ```

      3. **Using RegEx:** The advanced solution is using Regular expression's test method(`RegExp.test`), which allows for testing for against regular expressions

      ```javascript
      var mainString = "hello",
        regex = /hell/;
      regex.test(mainString);
      ```


114. ### How do you validate an email in javascript

      You can validate an email in javascript using regular expressions. It is recommended to do validations on the server side instead of the client side. Because the javascript can be disabled on the client side.

      ```javascript
      function validateEmail(email) {
        var re =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }
      ```


      The above regular expression accepts unicode characters.

115. ### How do you get the current url with javascript

      You can use `window.location.href` expression to get the current url path and you can use the same expression for updating the URL too. You can also use `document.URL` for read-only purposes but this solution has issues in FF.

      ```javascript
      console.log("location.href", window.location.href); // Returns full URL
      ```


116. ### What are the various url properties of location object

      The below `Location` object properties can be used to access URL components of the page,

      1. href - The entire URL
      2. protocol - The protocol of the URL
      3. host - The hostname and port of the URL
      4. hostname - The hostname of the URL
      5. port - The port number in the URL
      6. pathname - The path name of the URL
      7. search - The query portion of the URL
      8. hash - The anchor portion of the URL


117. ### How do you check if a key exists in an object

      You can check whether a key exists in an object or not using three approaches,

      1. **Using in operator:** You can use the in operator whether a key exists in an object or not

         ```javascript
         "key" in obj;
         ```

         and If you want to check if a key doesn't exist, remember to use parenthesis,

         ```javascript
         !("key" in obj);
         ```

      2. **Using hasOwnProperty method:** You can use `hasOwnProperty` to particularly test for properties of the object instance (and not inherited properties)

         ```javascript
         obj.hasOwnProperty("key"); // true
         ```

      3. **Using undefined comparison:** If you access a non-existing property from an object, the result is undefined. Let’s compare the properties against undefined to determine the existence of the property.

         ```javascript
         const user = {
           name: "John",
         };

         console.log(user.name !== undefined); // true
         console.log(user.nickName !== undefined); // false
         ```


118. ### How do you loop through or enumerate javascript object

      You can use the `for-in` loop to loop through javascript object. You can also make sure that the key you get is an actual property of an object, and doesn't come from the prototype using `hasOwnProperty` method.

      ```javascript
      var object = {
        k1: "value1",
        k2: "value2",
        k3: "value3",
      };

      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          console.log(key + " -> " + object[key]); // k1 -> value1 ...
        }
      }
      ```


119. ### How do you test for an empty object

      There are different solutions based on ECMAScript versions

      1. **Using Object entries(ECMA 7+):** You can use object entries length along with constructor type.

      ```javascript
      Object.entries(obj).length === 0 && obj.constructor === Object; // Since date object length is 0, you need to check constructor check as well
      ```

      2. **Using Object keys(ECMA 5+):** You can use object keys length along with constructor type.

      ```javascript
      Object.keys(obj).length === 0 && obj.constructor === Object; // Since date object length is 0, you need to check constructor check as well
      ```

      3. **Using for-in with hasOwnProperty(Pre-ECMA 5):** You can use a for-in loop along with hasOwnProperty.

      ```javascript
      function isEmpty(obj) {
        for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
            return false;
          }
        }

        return JSON.stringify(obj) === JSON.stringify({});
      }
      ```


120. ### What is an arguments object


      **Note:** You can't apply array methods on arguments object. But you can convert into a regular array as below.

      ```javascript
      var argsArray = Array.prototype.slice.call(arguments);
      ```


121. ### How do you make first letter of the string in an uppercase

      You can create a function which uses a chain of string methods such as charAt, toUpperCase and slice methods to generate a string with the first letter in uppercase.

      ```javascript
      function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      }
      ```


122. ### What are the pros and cons of for loops

      The for-loop is a commonly used iteration syntax in javascript. It has both pros and cons

      #### Pros

      1. Works on every environment
      2. You can use break and continue flow control statements

      #### Cons

      3. Too verbose
      4. Imperative
      5. You might face off-by-one errors.

123. ### How do you compare two date objects

      You need to use date.getTime() method in order to compare unix timestamp values

      ```javascript
      var d1 = new Date();
      var d2 = new Date(d1);
      console.log(d1.getTime() === d2.getTime()); //True
      console.log(d1 === d2); // False
      ```


124. ### How do you trim a string in javascript

      JavaScript provided a trim method on string types to trim any whitespaces present at the beginning or ending of the string.

      ```javascript
      "  Hello World   ".trim(); //Hello World
      ```

      If your browser(<IE9) doesn't support this method then you can use below polyfill.

      ```javascript
      if (!String.prototype.trim) {
        (function () {
          // Make sure we trim BOM and NBSP
          var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
          String.prototype.trim = function () {
            return this.replace(rtrim, "");
          };
        })();
      }
      ```


125. ### How do you add a key value pair in javascript

      There are two possible solutions to add new properties to an object.


      1. **Using dot notation:** This solution is useful when you know the name of the property

      ```javascript
      object.key3 = "value3";
      ```

      2. **Using square bracket notation:** This solution is useful when the name of the property is dynamically determined or the key's name is non-JS like "user-name"

      ```javascript
      obj["key3"] = "value3";
      ```


126. ### Is the !-- notation represents a special operator

      No,that's not a special operator. But it is a combination of 2 standard operators one after the other,

      1. A logical not (!)
      2. A prefix decrement (--)

      At first, the value decremented by one and then tested to see if it is equal to zero or not for determining the truthy/falsy value.


127. ### How do you assign default values to variables

      You can use the logical or operator `||` in an assignment expression to provide a default value. The syntax looks like as below,

      ```javascript
      var a = b || c;
      ```

      As per the above expression, variable 'a 'will get the value of 'c' only if 'b' is falsy (if is null, false, undefined, 0, empty string, or NaN), otherwise 'a' will get the value of 'b'.


128. ### How do you define multiline strings

      You can define multiline string literals using the '\n' character followed by line terminator('\').

      ```javascript
      var str = "This is a \n very lengthy \n sentence!";
      console.log(str);
      ```

      But if you have a space after the '\n' character, there will be indentation inconsistencies.


129. ### What is an app shell model

      An application shell (or app shell) architecture is one way to build a Progressive Web App that reliably and instantly loads on your users' screens, similar to what you see in native applications. It is useful for getting some initial HTML to the screen fast without a network.


130. ### Can we define properties for functions

      Yes, we can define properties for functions because functions are also objects.

      ```javascript
      fn = function (x) {
        //Function code goes here
      };

      fn.name = "John";

      fn.profile = function (y) {
        //Profile code goes here
      };
      ```



131. ### What is a polyfill

      A polyfill is a piece of JS code used to provide modern functionality on older browsers that do not natively support it. For example, Silverlight plugin polyfill can be used to mimic the functionality of an HTML Canvas element on Microsoft Internet Explorer 7.

      There are two main polyfill libraries available,

      1. **Core.js**: It is a modular javascript library used for cutting-edge ECMAScript features.
      2. **Polyfill.io:** It provides polyfills that are required for browser needs.


132. ### What are break and continue statements

      The break statement is used to "jump out" of a loop. i.e, It breaks the loop and continues executing the code after the loop.

      ```javascript
      for (i = 0; i < 10; i++) {
        if (i === 5) {
          break;
        }
        text += "Number: " + i + "<br>";
      }
      ```

      The continue statement is used to "jump over" one iteration in the loop. i.e, It breaks one iteration (in the loop), if a specified condition occurs, and continues with the next iteration in the loop.

      ```javascript
      for (i = 0; i < 10; i++) {
        if (i === 5) {
          continue;
        }
        text += "Number: " + i + "<br>";
      }
      ```



133. ### What are the benefits of keeping declarations at the top

      It is recommended to keep all declarations at the top of each script or function. The benefits of doing this are,

      1. Gives cleaner code
      2. It provides a single place to look for local variables
      3. Easy to avoid unwanted global variables
      4. It reduces the possibility of unwanted re-declarations


134. ### What are the benefits of initializing variables

      It is recommended to initialize variables because of the below benefits,

      1. It gives cleaner code
      2. It provides a single place to initialize variables
      3. Avoid undefined values in the code


135. ### What are the recommendations to create new object

      It is recommended to avoid creating new objects using `new Object()`. Instead you can initialize values based on it's type to create the objects.

      1. Assign {} instead of new Object()
      2. Assign "" instead of new String()
      3. Assign 0 instead of new Number()
      4. Assign false instead of new Boolean()
      5. Assign [] instead of new Array()
      6. Assign /()/ instead of new RegExp()
      7. Assign function (){} instead of new Function()


136. ### How do you generate random integers


      **Note:** `Math.random()` returns a random number between 0 (inclusive), and 1 (exclusive)


137. ### Can you write a random integers function to print integers within a range

      Yes, you can create a proper random function to return a random number between min and max (both included)

      ```javascript
      function randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      randomInteger(1, 100); // returns a random integer from 1 to 100
      randomInteger(1, 1000); // returns a random integer from 1 to 1000
      ```


138. ### What is tree shaking

      Tree shaking is a form of dead code elimination. It means that unused modules will not be included in the bundle during the build process and for that it relies on the static structure of ES2015 module syntax,( i.e. import and export). Initially this has been popularized by the ES2015 module bundler `rollup`, these days practically all bundlers use this technique.


139. ### What is the need of tree shaking

      Tree Shaking can significantly reduce the code size in any application. i.e, The less code we send over the wire the more performant the application will be. For example, if we just want to create a “Hello World” Application using SPA frameworks then it will take around a few MBs, but by tree shaking it can bring down the size to just a few hundred KBs. Tree shaking is implemented in Rollup and Webpack bundlers.


140. ### Is it recommended to use eval

      No, it allows arbitrary code to be run which causes a security problem. As we know that the eval() function is used to run text as code. In most of the cases, it should not be necessary to use it.


141. ### What is a Regular Expression

      A regular expression is a sequence of characters that forms a search pattern. You can use this search pattern for searching data in a text. These can be used to perform all types of text search and text replace operations. Let's see the syntax format now,

      ```javascript
      /pattern/modifiers;
      ```


142. ### What are modifiers in regular expression

      Modifiers can be used to perform case-insensitive and global searches. Let's list some of the modifiers,

      | Modifier | Description                                             |
      | -------- | ------------------------------------------------------- |
      | i        | Perform case-insensitive matching                       |
      | g        | Perform a global match rather than stops at first match |
      | m        | Perform multiline matching                              |



143. ### What are regular expression patterns

      Regular Expressions provide a group of patterns in order to match characters. Basically they are categorized into 3 types,

      1. **Brackets:** These are used to find a range of characters.
         For example, below are some use cases,
         1. [abc]: Used to find any of the characters between the brackets(a,b,c)
         2. [0-9]: Used to find any of the digits between the brackets
         3. (a|b): Used to find any of the alternatives separated with |
      2. **Metacharacters:** These are characters with a special meaning.
         For example, below are some use cases,
         1. \\d: Used to find a digit
         2. \\s: Used to find a whitespace character
         3. \\b: Used to find a match at the beginning or ending of a word
      3. **Quantifiers:** These are useful to define quantities.
         For example, below are some use cases,
         1. n+: Used to find matches for any string that contains at least one n
         2. n\*: Used to find matches for any string that contains zero or more occurrences of n
         3. n?: Used to find matches for any string that contains zero or one occurrences of n



144. ### How do you search a string for a pattern

      You can use the `test()` method of regular expression in order to search a string for a pattern, and return true or false depending on the result.

      ```javascript
      var pattern = /you/;
      console.log(pattern.test("How are you?")); //true
      ```


145. ### What is the purpose of exec method

      The purpose of exec method is similar to test method but it executes a search for a match in a specified string and returns a result array, or null instead of returning true/false.

      ```javascript
      var pattern = /you/;
      console.log(pattern.exec("How are you?")); //["you", index: 8, input: "How are you?", groups: undefined]
      ```


146. ### How do you change the style of a HTML element

      You can change inline style or classname of a HTML element using javascript DOM-manipulation

      1. **Using style property:** You can modify inline style using style property

      ```javascript
      document.getElementById("title").style.fontSize = "30px";
      ```

      2. **Using ClassName property:** It is easy to modify element class using className property

      ```javascript
      document.getElementById("title").className = "custom-title";
      ```


147. ### What would be the result of 1+2+'3'

      The output is going to be `33`. Since `1` and `2` are numeric values, the result of the first two digits is going to be a numeric value `3`. The next digit is a string type value because of that the addition of numeric value `3` and string type value `3` is just going to be a concatenation value `33`. Other operations like `3 * '3'` do yield correct results because the string is coerced into a number.


148. ### What is a debugger statement

      The debugger statement invokes any available debugging functionality, such as setting a breakpoint. If no debugging functionality is available, this statement has no effect.


149. ### What is the purpose of breakpoints in debugging

      You can set breakpoints in the javascript code once the debugger statement is executed and the debugger window pops up. At each breakpoint, javascript will stop executing, and let you examine the JavaScript values. After examining values, you can resume the execution of code using the play button.


150. ### How do you get the image width and height using JS

      You can programmatically get the image and check the dimensions(width and height) using JavaScript.

      ```javascript
      var img = new Image();
      img.onload = function () {
        console.log(this.width + "x" + this.height);
      };
      img.src = "http://www.google.com/intl/en_ALL/images/logo.gif";
      ```


151. ### How do you make synchronous HTTP request

      Browsers provide an XMLHttpRequest object which can be used to make synchronous HTTP requests from JavaScript.

      ```javascript
      function httpGet(theUrl) {
        var xmlHttpReq = new XMLHttpRequest();
        xmlHttpReq.open("GET", theUrl, false); // false for synchronous request
        xmlHttpReq.send(null);
        return xmlHttpReq.responseText;
      }
      ```


152. ### How do you make asynchronous HTTP request

      Browsers provide an XMLHttpRequest object which can be used to make asynchronous HTTP requests from JavaScript by passing the 3rd parameter as true.

153. ### What are the properties used to get size of window

      You can use innerWidth, innerHeight, clientWidth, clientHeight properties of windows, document element and document body objects to find the size of a window. Let's use a combination of these properties to calculate the size of a window or document,

      ```javascript
      var width =
        window.innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth;

      var height =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;
      ```


154. ### What is a conditional operator in javascript

      The conditional (ternary) operator is the only JavaScript operator that takes three operands which acts as a shortcut for `if` statements.

      ```javascript
      var isAuthenticated = false;
      console.log(
        isAuthenticated ? "Hello, welcome" : "Sorry, you are not authenticated"
      ); // Sorry, you are not authenticated
      ```


155. ### Can you apply chaining on conditional operator

      Yes, you can apply chaining on conditional operators similar to **`if … else if … else if … else`** chain. The syntax is going to be as below,


156. ### What are the ways to execute javascript after a page load

      You can execute javascript after page load in many different ways,

      1. **window.onload:**

      ```javascript
      window.onload = function ...
      ```

      2. **document.onload:**

      ```javascript
      document.onload = function ...
      ```

      3. **body onload:**

      ```javascript
      <body onload="script();">
      ```


157. ### What is the difference between proto and prototype

      The `__proto__` object is the actual object that is used in the lookup chain to resolve methods, etc. Whereas `prototype` is the object that is used to build `__proto__` when you create an object with the `new` operator (a special variant of a function call).

158. ### What is the freeze method

      The **`freeze()`** method is used to freeze an object. Freezing an object does not allow adding new properties to an object, prevents removing, and prevents changing the enumerability, configurability, or writability of existing properties. i.e. It returns the passed object and does not create a frozen copy.

      ```javascript
      const obj = {
        prop: 100,
      };

      Object.freeze(obj);
      obj.prop = 200; // Throws an error in strict mode

      console.log(obj.prop); //100
      ```

      Remember freezing is only applied to the top-level properties in objects but not for nested objects.

      **Note:** It causes a TypeError if the argument passed is not an object.


159. ### What is the purpose of the freeze method

      Below are the main benefits of using freeze method,

      1. It is used for freezing objects and arrays.
      2. It is used to make an object immutable.


160. ### Why do I need to use the freeze method

      In the Object-oriented paradigm, an existing API contains certain elements that are not intended to be extended, modified, or re-used outside of their current context. Hence it works as the `final` keyword which is used in various languages.


161. ### How do you detect a browser language preference

      You can use the navigator object to detect a browser language preference as below,

      ```javascript
      var language =
        (navigator.languages && navigator.languages[0]) || // Chrome / Firefox
        navigator.language || // All browsers
        navigator.userLanguage; // IE <= 10

      console.log(language);
      ```


162. ### How to convert a string to title case with javascript

      Title case means that the first letter of each word is capitalized. You can convert a string to title case using the below function,

      ```javascript
      function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) {
          return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
        });
      }
      toTitleCase("good morning john"); // Good Morning John
      ```


163. ### How do you detect if javascript is disabled on the page

      You can use the `<noscript>` tag to detect javascript disabled or not. The code block inside `<noscript>` gets executed when JavaScript is disabled, and is typically used to display alternative content when the page generated in JavaScript.

      ```javascript
      <script type="javascript">
          // JS related code goes here
      </script>
      <noscript>
          <a href="next_page.html?noJS=true">JavaScript is disabled in the page. Please click Next Page</a>
      </noscript>
      ```


164. ### What are various operators supported by javascript

      An operator is capable of manipulating(mathematical and logical computations) a certain value or operand. There are various operators supported by JavaScript as below,

      1. **Arithmetic Operators:** Includes + (Addition), – (Subtraction), \* (Multiplication), / (Division), % (Modulus), ++ (Increment) and – – (Decrement)
      2. **Comparison Operators:** Includes == (Equal), != (Not Equal), === (Equal with type), > (Greater than), >= (Greater than or Equal to), < (Less than), <= (Less than or Equal to)
      3. **Logical Operators:** Includes && (Logical AND), || (Logical OR), ! (Logical NOT)
      4. **Assignment Operators:** Includes = (Assignment Operator), += (Add and Assignment Operator), –= (Subtract and Assignment Operator), \*= (Multiply and Assignment), /= (Divide and Assignment), %= (Modules and Assignment)
      5. **Ternary Operators:** It includes conditional(: ?) Operator
      6. **typeof Operator:** It uses to find type of variable. The syntax looks like `typeof variable`


165. ### What is a rest parameter

      Rest parameter is an improved way to handle function parameters which allows us to represent an indefinite number of arguments as an array. The syntax would be as below,

      ```javascript
      function f(a, b, ...theArgs) {
        // ...
      }
      ```


      **Note:** Rest parameter is added in ES2015 or ES6


166. ### What are the bitwise operators available in javascript

      Below are the list of bitwise logical operators used in JavaScript

      1. Bitwise AND ( & )
      2. Bitwise OR ( | )
      3. Bitwise XOR ( ^ )
      4. Bitwise NOT ( ~ )
      5. Left Shift ( << )
      6. Sign Propagating Right Shift ( >> )
      7. Zero fill Right Shift ( >>> )


167. ### How do you determine whether object is frozen or not

      `Object.isFrozen()` method is used to determine if an object is frozen or not.An object is frozen if all of the below conditions hold true,

      1. If it is not extensible.
      2. If all of its properties are non-configurable.
      3. If all its data properties are non-writable.


168. ### How do you determine two values same or not using object


      Two values are considered identical if one of the following holds:

      1. both undefined
      2. both null
      3. both true or both false
      4. both strings of the same length with the same characters in the same order
      5. both the same object (means both object have same reference)
      6. both numbers and
         both +0
         both -0
         both NaN
         both non-zero and both not NaN and both have the same value.


169. ### What is the purpose of using object is method

      Some of the applications of Object's `is` method are follows,

      1. It is used for comparison of two strings.
      2. It is used for comparison of two numbers.
      3. It is used for comparing the polarity of two numbers.
      4. It is used for comparison of two objects.


170. ### How do you copy properties from one object to other

      You can use the `Object.assign()` method which is used to copy the values and properties from one or more source objects to a target object. It returns the target object which has properties and values copied from the source objects. The syntax would be as below,

      ```javascript
      Object.assign(target, ...sources);
      ```


      As observed in the above code, there is a common property(`b`) from source to target so it's value has been overwritten.


171. ### What are the applications of the assign method

      Below are the some of main applications of `Object.assign()` method,

      1. It is used for cloning an object.
      2. It is used to merge objects with the same properties.


172. ### What is a proxy object

      The Proxy object is used to define custom behavior for fundamental operations such as property lookup, assignment, enumeration, function invocation, etc.

      A proxy is created with two parameters: a target object which you want to proxy and a handler object which contains methods to intercept fundamental operations. The syntax would be as follows,

      ```javascript
      var p = new Proxy(target, handler);
      ```


      In the above code, it uses `get` handler which define the behavior of the proxy when an operation is performed on it. These proxies are mainly used for some of the below cross-cutting concerns.

      1. Logging
      2. Authentication or Authorization
      3. Data binding and observables
      4. Function parameter validation

      **Note:** This feature was introduced with ES6.


173. ### What are the applications of the seal method

      Below are the main applications of `Object.seal()` method,

      1. It is used for sealing objects and arrays.
      2. It is used to make properties of an object non-configurable.


174. ### What are the differences between the freeze and seal methods

      If an object is frozen using the `Object.freeze()` method then its properties become immutable and no changes can be made in them whereas if an object is sealed using the `Object.seal()` method then the changes can be made in the existing properties of the object.


175. ### How do you determine if an object is sealed or not

      The `Object.isSealed()` method is used to determine if an object is sealed or not. An object is sealed if all of the below conditions hold true

      1. If it is not extensible.
      2. If all of its properties are non-configurable.
      3. If it is not removable (but not necessarily non-writable).
         Let's see it in the action

      ```javascript
      const object = {
        property: "Hello, Good morning",
      };

      Object.seal(object); // Using seal() method to seal the object

      console.log(Object.isSealed(object)); // checking whether the object is sealed or not
      ```


176. ### How do you get enumerable key and value pairs


      **Note:** The order is not guaranteed as object defined.


177. ### What is the main difference between Object.values and Object.entries method

      The `Object.values()` method's behavior is similar to `Object.entries()` method but it returns an array of values instead [key,value] pairs.

      ```javascript
      const object = {
        a: "Good morning",
        b: 100,
      };

      for (let value of Object.values(object)) {
        console.log(`${value}`); // 'Good morning \n100'
      }
      ```


178. ### How do you create an object with a prototype

      The `Object.create()` method is used to create a new object with the specified prototype object and properties. i.e, It uses an existing object as the prototype of the newly created object. It returns a new object with the specified prototype object and properties.

      ```javascript
      const user = {
        name: "John",
        printInfo: function () {
          console.log(`My name is ${this.name}.`);
        },
      };

      const admin = Object.create(user);

      admin.name = "Nick"; // Remember that "name" is a property set on "admin" but not on "user" object

      admin.printInfo(); // My name is Nick
      ```


179. ### What is a WeakSet

      A `WeakSet` is used to store a collection of weakly(weak references) held objects. The syntax would be as follows,

      ```javascript
      new WeakSet([iterable]);
      ```



180. ### What are the differences between WeakSet and Set

      The main difference is that references to objects in `Set` are strong while references to objects in `WeakSet` are weak. i.e, An object in `WeakSet` can be garbage collected if there is no other reference to it.
      Other differences are:

      1. `Set` can store any value whereas `WeakSet` can store only collections of objects
      2. `WeakSet` does not have size property unlike `Set`
      3. `WeakSet` does not have methods such as clear, keys, values, entries, forEach.
      4. `WeakSet` is not iterable.


181. ### List down the collection of methods available on WeakSet

      Below are the list of methods available on `WeakSet`,

      1. `add(value)`: A new object is appended with the given value
      2. `delete(value)`: Deletes the value from the collection.
      3. `has(value)`: It returns true if the value is present in the collection, otherwise it returns false.



182. ### What is a WeakMap

      A `WeakMap` object is a collection of key/value pairs in which the keys are weakly referenced. In this case, keys must be objects and the values can be arbitrary values. The syntax looks like the following:

      ```javascript
      new WeakMap([iterable]);
      ```



183. ### What are the differences between WeakMap and Map

      The main difference is that references to key objects in `Map` are strong while references to key objects in `WeakMap` are weak. i.e, A key object in `WeakMap` can be garbage collected if there is no other reference to it.
      Other differences are,

      1. `Map` can store any key type whereas `WeakMap` can store only collections of key objects
      2. `WeakMap` does not have size property unlike `Map`
      3. `WeakMap` does not have methods such as clear, keys, values, entries, forEach.
      4. `WeakMap` is not iterable.


184. ### List down the collection of methods available on WeakMap

      Below are the list of methods available on `WeakMap`,

      1. `set(key, value)`: Sets the value for the key in the `WeakMap` object. Returns the `WeakMap` object.
      2. `delete(key)`: Removes any value associated to the key.
      3. `has(key)`: Returns a Boolean asserting whether a value has been associated to the key in the `WeakMap` object or not.
      4. `get(key)`: Returns the value associated to the key, or undefined if there is none.


185. ### What is the purpose of uneval


      The `uneval()` function has been deprecated. It is recommended to use `toString()` for functions and `JSON.stringify()` for other cases.

      ```javascript
      function user() {}
      console.log(user.toString()); // returns "(function user(){})"
      ```


186. ### How do you encode an URL

      The `encodeURI()` function is used to encode complete URI which has special characters except (, / ? : @ & = + $ #) characters.

      ```javascript
      var uri = "https://mozilla.org/?x=шеллы";
      var encoded = encodeURI(uri);
      console.log(encoded); // https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B
      ```


187. ### How do you decode an URL

      The `decodeURI()` function is used to decode a Uniform Resource Identifier (URI) previously created by `encodeURI()`.

      ```javascript
      var uri = "https://mozilla.org/?x=шеллы";
      var encoded = encodeURI(uri);
      console.log(encoded); // https://mozilla.org/?x=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B
      try {
        console.log(decodeURI(encoded)); // "https://mozilla.org/?x=шеллы"
      } catch (e) {
        // catches a malformed URI
        console.error(e);
      }
      ```


188. ### How do you print the contents of web page


      **Note:** In most browsers, it will block while the print dialog is open.


189. ### What is an anonymous function

      An anonymous function is a function without a name! Anonymous functions are commonly assigned to a variable name or used as a callback function. The syntax would be as below,

      ```javascript
      function (optionalParameters) {
        //do something
      }

      const myFunction = function(){ //Anonymous function assigned to a variable
        //do something
      };

      [1, 2, 3].map(function(element){ //Anonymous function used as a callback function
        //do something
      });
      ```



190. ### What are javascript accessors

      ECMAScript 5 introduced javascript object accessors or computed properties through getters and setters. Getters uses the `get` keyword whereas Setters uses the `set` keyword.

      ```javascript
      var user = {
        firstName: "John",
        lastName: "Abraham",
        language: "en",
        get lang() {
          return this.language;
        },
        set lang(lang) {
          this.language = lang;
        },
      };
      console.log(user.lang); // getter access lang as en
      user.lang = "fr";
      console.log(user.lang); // setter used to set lang as fr
      ```


191. ### What is the difference between get and defineProperty

      Both have similar results unless you use classes. If you use `get` the property will be defined on the prototype of the object whereas using `Object.defineProperty()` the property will be defined on the instance it is applied to.


192. ### What are the advantages of Getters and Setters

      Below are the list of benefits of Getters and Setters,

      1. They provide simpler syntax
      2. They are used for defining computed properties, or accessors in JS.
      3. Useful to provide equivalence relation between properties and methods
      4. They can provide better data quality
      5. Useful for doing things behind the scenes with the encapsulated logic.


193. ### What is the purpose of switch-case

      The `switch case` statement in JavaScript is used for decision making purposes. In a few cases, using the `switch case` statement is going to be more convenient than `if-else` statements. The syntax would be as below,

      ```javascript
      switch (expression)
      {
          case value1:
              statement1;
              break;
          case value2:
              statement2;
              break;
          .
          .
          case valueN:
              statementN;
              break;
          default:
              statementDefault;
      }
      ```

      The above multi-way branch statement provides an easy way to dispatch execution to different parts of code based on the value of the expression.


194. ### What are the conventions to be followed for the usage of switch case

      Below are the list of conventions should be taken care,

      1. The expression can be of type either number or string.
      2. Duplicate values are not allowed for the expression.
      3. The default statement is optional. If the expression passed to switch does not match with any case value then the statement within default case will be executed.
      4. The break statement is used inside the switch to terminate a statement sequence.
      5. The break statement is optional. But if it is omitted, the execution will continue on into the next case.


195. ### What are primitive data types

      A primitive data type is data that has a primitive value (which has no properties or methods). There are 7 types of primitive data types.

      1. string
      2. number
      3. boolean
      4. null
      5. undefined
      6. bigint
      7. symbol


196. ### What are the different ways to access object properties

      There are 3 possible ways for accessing the property of an object.

      1. **Dot notation:** It uses dot for accessing the properties

      ```javascript
      objectName.property;
      ```

      2. **Square brackets notation:** It uses square brackets for property access

      ```javascript
      objectName["property"];
      ```

      3. **Expression notation:** It uses expression in the square brackets

      ```javascript
      objectName[expression];
      ```


197. ### What are the function parameter rules

      JavaScript functions follow below rules for parameters,

      1. The function definitions do not specify data types for parameters.
      2. Do not perform type checking on the passed arguments.
      3. Do not check the number of arguments received.
         i.e, The below function follows the above rules,

      ```javascript
      function functionName(parameter1, parameter2, parameter3) {
        console.log(parameter1); // 1
      }
      functionName(1);
      ```


198. ### What are the different error names from error object

      There are 7 different types of error names returned from error object,
      | Error Name | Description |
      |---- | ---------
      | `AggregateError` | An error indicating that multiple errors occurred |
      | `EvalError` | An error has occurred in the eval() function |
      | `RangeError` | An error has occurred with a number "out of range" |
      | `ReferenceError` | An error due to an illegal reference|
      | `SyntaxError` | An error due to a syntax error|
      | `TypeError` | An error due to a type error |
      | `URIError` | An error due to encodeURI() |


199. ### What are the various statements in error handling

      Below are the list of statements used in an error handling,

      1. **try:** This statement is used to test a block of code for errors
      2. **catch:** This statement is used to handle the error
      3. **throw:** This statement is used to create custom errors.
      4. **finally:** This statement is used to execute code after try and catch regardless of the result.


200. ### What are the two types of loops in javascript

      1. **Entry Controlled loops:** In this kind of loop type, the test condition is tested before entering the loop body. For example, For Loop and While Loop comes under this category.
      2. **Exit Controlled Loops:** In this kind of loop type, the test condition is tested or evaluated at the end of the loop body. i.e, the loop body will execute at least once irrespective of test condition true or false. For example, do-while loop comes under this category.


201. ### What is nodejs

      Node.js is a server-side platform built on Chrome's JavaScript runtime for easily building fast and scalable network applications. It is an event-based, non-blocking, asynchronous I/O runtime that uses Google's V8 JavaScript engine and libuv library.


202. ### What is the Intl object

      The `Intl` object is the namespace for the ECMAScript Internationalization API, which provides language sensitive string comparison, number formatting, and date and time formatting. It provides access to several constructors and language sensitive functions.


203. ### What is an Iterator

      An iterator is an object which defines a sequence and a return value upon its termination. It implements the Iterator protocol with a `next()` method which returns an object with two properties: `value` (the next value in the sequence) and `done` (which is true if the last value in the sequence has been consumed).


204. ### How does synchronous iteration works

      Synchronous iteration was introduced in ES6 and it works with below set of components,

      **Iterable:** It is an object which can be iterated over via a method whose key is Symbol.iterator.

      **Iterator:** It is an object returned by invoking `[Symbol.iterator]()` on an iterable. This iterator object wraps each iterated element in an object and returns it via `next()` method one by one.

      **IteratorResult:** It is an object returned by `next()` method. The object contains two properties; the `value` property contains an iterated element and the `done` property determines whether the element is the last element or not.



205. ### What is the event loop

      The event loop is a process that continuously monitors both the call stack and the event queue and checks whether or not the call stack is empty. If the call stack is empty and there are pending events in the event queue, the event loop dequeues the event from the event queue and pushes it to the call stack. The call stack executes the event, and any additional events generated during the execution are added to the end of the event queue.

      **Note:** The event loop allows Node.js to perform non-blocking I/O operations, even though JavaScript is single-threaded, by offloading operations to the system kernel whenever possible. Since most modern kernels are multi-threaded, they can handle multiple operations executing in the background.


206. ### What is the call stack

      Call Stack is a data structure for javascript interpreters to keep track of function calls(creates execution context) in the program. It has two major actions,

      1. Whenever you call a function for its execution, you are pushing it to the stack.
      2. Whenever the execution is completed, the function is popped out of the stack.


      The above code processed in a call stack as below,

      3. Add the `hungry()` function to the call stack list and execute the code.
      4. Add the `eatFruits()` function to the call stack list and execute the code.
      5. Delete the `eatFruits()` function from our call stack list.
      6. Delete the `hungry()` function from the call stack list since there are no items anymore.



207. ### What is the event queue

      The event queue follows the queue data structure. It stores async callbacks to be added to the call stack. It is also known as the Callback Queue or Macrotask Queue.

      Whenever the call stack receives an async function, it is moved into the Web API. Based on the function, Web API executes it and awaits the result. Once it is finished, it moves the callback into the event queue (the callback of a promise is moved into the microtask queue).

      The event loop constantly checks whether or not the call stack is empty. Once the call stack is empty and there is a callback in the event queue, the event loop moves the callback into the call stack. But if there is a callback in the microtask queue as well, it is moved first. The microtask queue has a higher priority than the event queue.


208. ### What is a decorator

      A decorator is an expression that evaluates to a function and that takes the target, name, and decorator descriptor as arguments. Also, it optionally returns a decorator descriptor to install on the target object. Let's define admin decorator for user class at design time,

      ```javascript
      function admin(isAdmin) {
         return function(target) {
             target.isAdmin = isAdmin;
         }
      }

      @admin(true)
      class User() {
      }
      console.log(User.isAdmin); //true

       @admin(false)
       class User() {
       }
       console.log(User.isAdmin); //false
      ```


209. ### What are the properties of the Intl object

      Below are the list of properties available on the `Intl` object,

      1. **Collator:** These are the objects that enable language-sensitive string comparison.
      2. **DateTimeFormat:** These are the objects that enable language-sensitive date and time formatting.
      3. **ListFormat:** These are the objects that enable language-sensitive list formatting.
      4. **NumberFormat:** Objects that enable language-sensitive number formatting.
      5. **PluralRules:** Objects that enable plural-sensitive formatting and language-specific rules for plurals.
      6. **RelativeTimeFormat:** Objects that enable language-sensitive relative time formatting.


210. ### What is an Unary operator

      The unary(+) operator is used to convert a variable to a number.If the variable cannot be converted, it will still become a number but with the value NaN. Let's see this behavior in an action.

      ```javascript
      var x = "100";
      var y = +x;
      console.log(typeof x, typeof y); // string, number

      var a = "Hello";
      var b = +a;
      console.log(typeof a, typeof b, b); // string, number, NaN
      ```


211. ### How do you sort elements in an array


      **Beware:** `sort()` is changing the original array.


212. ### What is the purpose of compareFunction while sorting arrays

      The compareFunction is used to define the sort order. If omitted, the array elements are converted to strings, then sorted according to each character's Unicode code point value.


213. ### How do you find the min and max values in an array

      You can use `Math.min` and `Math.max` methods on array variables to find the minimum and maximum elements within an array. Let's create two functions to find the min and max value with in an array,

      ```javascript
      var marks = [50, 20, 70, 60, 45, 30];
      function findMin(arr) {
        return Math.min.apply(null, arr);
      }
      function findMax(arr) {
        return Math.max.apply(null, arr);
      }

      console.log(findMin(marks));
      console.log(findMax(marks));
      ```


214. ### How do you find the min and max values without Math functions

      You can write functions which loop through an array comparing each value with the lowest value or highest value to find the min and max values. Let's create those functions to find min and max values,

      ```javascript
      var marks = [50, 20, 70, 60, 45, 30];
      function findMin(arr) {
        var length = arr.length;
        var min = Infinity;
        while (length--) {
          if (arr[length] < min) {
            min = arr[length];
          }
        }
        return min;
      }

      function findMax(arr) {
        var length = arr.length;
        var max = -Infinity;
        while (length--) {
          if (arr[length] > max) {
            max = arr[length];
          }
        }
        return max;
      }

      console.log(findMin(marks));
      console.log(findMax(marks));
      ```


215. ### How do you get the metadata of a module

      You can use the `import.meta` object which is a meta-property exposing context-specific meta data to a JavaScript module. It contains information about the current module, such as the module's URL. In browsers, you might get different meta data than NodeJS.

      ```javascript
      <script type="module" src="welcome-module.js"></script>;
      console.log(import.meta); // { url: "file:///home/user/welcome-module.js" }
      ```


216. ### What is the advantage of the comma operator


      You can also use the comma operator in a return statement where it processes before returning.

      ```javascript
      function myFunction() {
        var a = 1;
        return (a += 10), a; // 11
      }
      ```


217. ### What is typescript

      TypeScript is a typed superset of JavaScript created by Microsoft that adds optional types, classes
      and many other features, and compiles to plain JavaScript. Angular is built entirely in TypeScript and it is used as the primary language there. You can install it globally as

      ```bash
      npm install -g typescript
      ```


      The greeting method allows only string type as argument.


218. ### What are the differences between javascript and typescript

      Below are the list of differences between javascript and typescript,

      | feature             | typescript                            | javascript                                      |
      | ------------------- | ------------------------------------- | ----------------------------------------------- |
      | Language paradigm   | Object oriented programming language  | Multi-paradigm language                         |
      | Typing support      | Supports static typing                | Dynamic typing                                  |
      | Modules             | Supported                             | Not supported                                   |
      | Interface           | It has interfaces concept             | Doesn't support interfaces                      |
      | Optional parameters | Functions support optional parameters | No support of optional parameters for functions |


219. ### What are the advantages of typescript over javascript

      Below are some of the advantages of typescript over javascript,

      1. TypeScript is able to find compile time errors at the development time only and it makes sures less runtime errors. Whereas javascript is an interpreted language.
      2. TypeScript is strongly-typed or supports static typing which allows for checking type correctness at compile time. This is not available in javascript.
      3. TypeScript compiler can compile the .ts files into ES3,ES4 and ES5 unlike ES6 features of javascript which may not be supported in some browsers.


220. ### What is an object initializer

      An object initializer is an expression that describes the initialization of an Object. The syntax for this expression is represented as a comma-delimited list of zero or more pairs of property names and associated values of an object, enclosed in curly braces ({}). This is also known as literal notation. It is one of the ways to create an object.

      ```javascript
      var initObject = { a: "John", b: 50, c: {} };

      console.log(initObject.a); // John
      ```

221. ### What happens if you write constructor more than once in a class

      The "constructor" in a class is a special method and it should be defined only once in a class. i.e, If you write a constructor method more than once in a class it will throw a `SyntaxError` error.

      ```javascript
       class Employee {
         constructor() {
           this.name = "John";
         }
         constructor() {   //  Uncaught SyntaxError: A class may only have one constructor
           this.age = 30;
         }
       }

       var employeeObject = new Employee();

       console.log(employeeObject.name);
      ```

      This constructor is called by using the special function call `new` (see example above).


222. ### How do you get the prototype of an object

      You can use the `Object.getPrototypeOf(obj)` method to return the prototype of the specified object. i.e. The value of the internal `prototype` property. If there are no inherited properties then `null` value is returned.

      ```javascript
      const newPrototype = {};
      const newObject = Object.create(newPrototype);

      console.log(Object.getPrototypeOf(newObject) === newPrototype); // true
      ```


223. ### What happens If I pass string type for getPrototype method

      In ES5, it will throw a TypeError exception if the obj parameter isn't an object. Whereas in ES2015, the parameter will be coerced to an `Object`.

      ```javascript
      // ES5
      Object.getPrototypeOf("James"); // TypeError: "James" is not an object
      // ES2015
      Object.getPrototypeOf("James"); // String.prototype
      ```


224. ### How do you check whether an object can be extended or not

      The `Object.isExtensible()` method is used to determine if an object is extendable or not. i.e, Whether it can have new properties added to it or not.

      ```javascript
      const newObject = {};
      console.log(Object.isExtensible(newObject)); //true
      ```

      **Note:** By default, all the objects are extendable. i.e, The new properties can be added or modified.


225. ### What are the different ways to make an object non-extensible

      You can mark an object non-extensible in 3 ways,

      1. `Object.preventExtensions`
      2. `Object.seal`
      3. `Object.freeze`

      ```javascript
      var newObject = {};

      Object.preventExtensions(newObject); // Prevent objects are non-extensible
      Object.isExtensible(newObject); // false

      var sealedObject = Object.seal({}); // Sealed objects are non-extensible
      Object.isExtensible(sealedObject); // false

      var frozenObject = Object.freeze({}); // Frozen objects are non-extensible
      Object.isExtensible(frozenObject); // false
      ```


226. ### How do you define multiple properties on an object

      The `Object.defineProperties()` method is used to define new or modify existing properties directly on an object and returning the object. Let's define multiple properties on an empty object,

      ```javascript
      const newObject = {};

      Object.defineProperties(newObject, {
        newProperty1: {
          value: "John",
          writable: true,
        },
        newProperty2: {},
      });
      ```


227. ### What is the MEAN stack

      The MEAN (MongoDB, Express, AngularJS, and Node.js) stack is the most popular open-source JavaScript software tech stack available for building dynamic web apps where you can write both the server-side and client-side halves of the web project entirely in JavaScript.


228. ### What is obfuscation in javascript

      Obfuscation is the deliberate act of creating obfuscated javascript code(i.e, source or machine code) that is difficult for humans to understand. It is something similar to encryption, but a machine can understand the code and execute it.
      Let's see the below function before Obfuscation,

      ```javascript
      function greeting() {
        console.log("Hello, welcome to JS world");
      }
      ```

      And after the code Obfuscation, it would be appeared as below,

      ```javascript
      eval(
        (function (p, a, c, k, e, d) {
          e = function (c) {
            return c;
          };
          if (!"".replace(/^/, String)) {
            while (c--) {
              d[c] = k[c] || c;
            }
            k = [
              function (e) {
                return d[e];
              },
            ];
            e = function () {
              return "\\w+";
            };
            c = 1;
          }
          while (c--) {
            if (k[c]) {
              p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c]);
            }
          }
          return p;
        })(
          "2 1(){0.3('4, 7 6 5 8')}",
          9,
          9,
          "console|greeting|function|log|Hello|JS|to|welcome|world".split("|"),
          0,
          {}
        )
      );
      ```


229. ### Why do you need Obfuscation

      Below are the few reasons for Obfuscation,

      1. The Code size will be reduced. So data transfers between server and client will be fast.
      2. It hides the business logic from outside world and protects the code from others
      3. Reverse engineering is highly difficult
      4. The download time will be reduced


230. ### What is Minification

      Minification is the process of removing all unnecessary characters(empty spaces are removed) and variables will be renamed without changing it's functionality. It is also a type of obfuscation .


231. ### What are the advantages of minification

      Normally it is recommended to use minification for heavy traffic and intensive requirements of resources. It reduces file sizes with below benefits,

      1. Decreases loading times of a web page
      2. Saves bandwidth usages


232. ### What are the differences between obfuscation and Encryption

      Below are the main differences between obfuscation and encryption,

      | Feature            | Obfuscation                                     | Encryption                                                              |
      | ------------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
      | Definition         | Changing the form of any data in any other form | Changing the form of information to an unreadable format by using a key |
      | A key to decode    | It can be decoded without any key               | It is required                                                          |
      | Target data format | It will be converted to a complex form          | Converted into an unreadable format                                     |


233. ### What are the common tools used for minification

      There are many online/offline tools to minify the javascript files,

      1. Google's Closure Compiler
      2. UglifyJS2
      3. jsmin
      4. javascript-minifier.com/
      5. prettydiff.com


234. ### How do you perform form validation using javascript


      And the validation on user login is below,

      ```javascript
      function validateForm() {
        var x = document.forms["myForm"]["uname"].value;
        if (x == "") {
          alert("The username shouldn't be empty");
          return false;
        }
      }
      ```


235. ### How do you perform form validation without javascript

      You can perform HTML form validation automatically without using javascript. The validation enabled by applying the `required` attribute to prevent form submission when the input is empty.

      ```html
      <form method="post">
        <input type="text" name="uname" required />
        <input type="submit" value="Submit" />
      </form>
      ```

      **Note:** Automatic form validation does not work in Internet Explorer 9 or earlier.


236. ### What are the DOM methods available for constraint validation

      The below DOM methods are available for constraint validation on an invalid input,

      1. `checkValidity()`: It returns true if an input element contains valid data.
      2. `setCustomValidity()`: It is used to set the `validationMessage` property of an input element.


237. ### What are the available constraint validation DOM properties

      Below are the list of some of the constraint validation DOM properties available,

      1. `validity`: It provides a list of boolean properties related to the validity of an input element.
      2. `validationMessage`: It displays the message when the validity is false.
      3. `willValidate`: It indicates if an input element will be validated or not.


238. ### What are the validity properties

      The validity property of an input element provides a set of properties related to the validity of data.

      1. `customError`: It returns true, if a custom validity message is set.
      2. `patternMismatch`: It returns true, if an element's value does not match its pattern attribute.
      3. `rangeOverflow`: It returns true, if an element's value is greater than its max attribute.
      4. `rangeUnderflow`: It returns true, if an element's value is less than its min attribute.
      5. `stepMismatch`: It returns true, if an element's value is invalid according to step attribute.
      6. `tooLong`: It returns true, if an element's value exceeds its maxLength attribute.
      7. `typeMismatch`: It returns true, if an element's value is invalid according to type attribute.
      8. `valueMissing`: It returns true, if an element with a required attribute has no value.
      9. `valid`: It returns true, if an element's value is valid.



      ```javascript
      function myOverflowFunction() {
        if (document.getElementById("age").validity.rangeOverflow) {
          alert("The mentioned age is not allowed");
        }
      }
      ```

239. ### What is an enum

      An enum is a type restricting variables to one value from a predefined set of constants. JavaScript has no enums but typescript provides built-in enum support.

      ```javascript
      enum Color {
       RED, GREEN, BLUE
      }
      ```

240. ### What are the attributes provided by a property descriptor

      A property descriptor is a record which has the following attributes

      1. `value`: The value associated with the property
      2. `writable`: Determines whether the value associated with the property can be changed or not
      3. `configurable`: Returns true if the type of this property descriptor can be changed and if the property can be deleted from the corresponding object.
      4. `enumerable`: Determines whether the property appears during enumeration of the properties on the corresponding object or not.
      5. `set`: A function which serves as a setter for the property
      6. `get`: A function which serves as a getter for the property


241. ### How do you extend classes

      The `extends` keyword is used in class declarations/expressions to create a class which is a child of another class. It can be used to subclass custom classes as well as built-in objects. The syntax would be as below,

      ```javascript
      class ChildClass extends ParentClass { ... }
      ```



242. ### How do I modify the url without reloading the page


      This mechanism is used by routing libraries of frameworks like React and Angular in order to simulate the behaviour of a multi-page-website, even though they are only SPA (Single Page Applications).


243. ### How do you compare scalar arrays

      You can use length and every method of arrays to compare two scalars (compared directly using `===`) arrays. The combination of these expressions can give the expected result,

      ```javascript
      const arrayFirst = [1, 2, 3, 4, 5];
      const arraySecond = [1, 2, 3, 4, 5];
      console.log(
        arrayFirst.length === arraySecond.length &&
          arrayFirst.every((value, index) => value === arraySecond[index])
      ); // true
      ```

      If you would like to compare arrays irrespective of order then you should sort them before,

      ```javascript
      const arrayFirst = [2, 3, 1, 4, 5];
      const arraySecond = [1, 2, 3, 4, 5];
      console.log(
        arrayFirst.length === arraySecond.length &&
          arrayFirst
            .sort()
            .every((value, index) => value === arraySecond[index])
      ); //true
      ```


244. ### How to get the value from get parameters

      The `new URL()` object accepts the url string and `searchParams` property of this object can be used to access the get parameters.

      ```javascript
      let urlString = "http://www.some-domain.com/about.html?x=1&y=2&z=3"; //window.location.href
      let url = new URL(urlString);
      let parameterZ = url.searchParams.get("z");
      console.log(parameterZ); // 3
      ```


245. ### How do you print numbers with commas as thousand separators

      You can use the `Number.prototype.toLocaleString()` method which returns a string with a language-sensitive representation such as thousand separator, currency etc. of this number.

      ```javascript
      function convertToThousandFormat(x) {
        return x.toLocaleString(); // 12,345.679
      }

      console.log(convertToThousandFormat(12345.6789));
      ```


246. ### What is the difference between java and javascript

      Both are totally unrelated programming languages and no relation between them. Java is statically typed, compiled, runs on its own VM. Whereas JavaScript is dynamically typed, interpreted, and runs in a browser and nodejs environments. Let's see the major differences in a tabular format,
      | Feature | Java | JavaScript |
      |---- | ---- | -----
      | Typed | It's a strongly typed language | It's a dynamic typed language |
      | Paradigm | Object oriented programming | Prototype based programming |
      | Scoping | Block scoped | Function-scoped, block scoped since ES6 |
      | Concurrency | Thread based | event based |


247. ### Does JavaScript support namespaces


      It always calls the second function definition. In this case, namespaces will solve the name collision problem.


248. ### How do you declare a namespace

      Even though JavaScript lacks namespaces, we can use Objects, an IIFE (Immediately Invoked Function Expression) or `let`/`const` to create namespaces.

      1. **Using Object Literal Notation:** Let's wrap variables and functions inside an Object literal which acts as a namespace. After that you can access them using object notation

         ```javascript
         var namespaceOne = {
             function func1() {
                 console.log("This is a first definition");
             }
         }
         var namespaceTwo = {
               function func1() {
                   console.log("This is a second definition");
               }
           }
         namespaceOne.func1(); // This is a first definition
         namespaceTwo.func1(); // This is a second definition
         ```

      2. **Using IIFE (Immediately invoked function expression):** The outer pair of parentheses of IIFE creates a local scope for all the code inside of it and makes the anonymous function a function expression. Due to that, you can create the same function in two different function expressions to act as a namespace.

         ```javascript
         (function () {
           function fun1() {
             console.log("This is a first definition");
           }
           fun1();
         })();

         (function () {
           function fun1() {
             console.log("This is a second definition");
           }
           fun1();
         })();
         ```

      3. **Using a block and a let/const declaration:** In ECMAScript 6, you can simply use a block and a let declaration to restrict the scope of a variable to a block.

         ```javascript
         {
           let myFunction = function fun1() {
             console.log("This is a first definition");
           };
           myFunction();
         }
         //myFunction(): ReferenceError: myFunction is not defined.

         {
           let myFunction = function fun1() {
             console.log("This is a second definition");
           };
           myFunction();
         }
         //myFunction(): ReferenceError: myFunction is not defined.
         ```


249. ### How do you invoke javascript code in an iframe from the parent page

      Initially iFrame needs to be accessed using either `document.getElementBy` or `window.frames`. After that `contentWindow` property of iFrame gives the access for targetFunction

      ```javascript
      document.getElementById("targetFrame").contentWindow.targetFunction();
      window.frames[0].frameElement.contentWindow.targetFunction(); // Accessing iframe this way may not work in latest versions chrome and firefox
      ```


250. ### How do you get the timezone offset of a date object

      You can use the `getTimezoneOffset` method of the date object. This method returns the time zone difference, in minutes, from current locale (host system settings) to UTC

      ```javascript
      var offset = new Date().getTimezoneOffset();
      console.log(offset); // -480
      ```


251. ### How do you load CSS and JS files dynamically

      You can create both link and script elements in the DOM and append them as child to head tag. Let's create a function to add script and style resources as below,

      ```javascript
      function loadAssets(filename, filetype) {
        if (filetype == "css") {
          // External CSS file
          var fileReference = document.createElement("link");
          fileReference.setAttribute("rel", "stylesheet");
          fileReference.setAttribute("type", "text/css");
          fileReference.setAttribute("href", filename);
        } else if (filetype == "js") {
          // External JavaScript file
          var fileReference = document.createElement("script");
          fileReference.setAttribute("type", "text/javascript");
          fileReference.setAttribute("src", filename);
        }
        if (typeof fileReference != "undefined")
          document.getElementsByTagName("head")[0].appendChild(fileReference);
      }
      ```


252. ### What are the different methods to find HTML elements in DOM

      If you want to access any element in an HTML page, you need to start with accessing the document object. Later you can use any of the below methods to find the HTML element,

      1. `document.getElementById(id)`: It finds an element by Id
      2. `document.getElementsByTagName(name)`: It finds an element by tag name (returns an node list)
      3. `document.getElementsByClassName(name)`: It finds an element by class name (returns an node list)
      4. `document.querySelector(cssSelector)`: It finds an element by css selector
      5. `document.querySelectorAll(cssSelector)`: It finds all elements by css selector (returns a node list)


253. ### What is jQuery


      **Note:** You can download it from jquery's official site or install it from CDNs, like google.


254. ### What is V8 JavaScript engine

      V8 is an open source high-performance JavaScript engine used by the Google Chrome browser, written in C++. It is also being used in the node.js project. It implements ECMAScript and WebAssembly, and runs on Windows 7 or later, macOS 10.12+, and Linux systems that use x64, IA-32, ARM, or MIPS processors.
      **Note:** It can run standalone, or can be embedded into any C++ application.


255. ### Why do we call javascript as dynamic language

      JavaScript is a loosely typed or a dynamic language because variables in JavaScript are not directly associated with any particular value type, and any variable can be assigned/reassigned with values of all types.

      ```javascript
      let age = 50; // age is a number now
      age = "old"; // age is a string now
      age = true; // age is a boolean
      ```


256. ### What is a void operator

      The `void` operator evaluates the given expression and then returns `undefined` (i.e, without returning value). The syntax would be as below,

      ```javascript
      void expression;
      void expression;
      ```

      Let's display a message without any redirection or reload

      ```javascript
      <a href="javascript:void(alert('Welcome to JS world'))">
        Click here to see a message
      </a>
      ```

      **Note:** This operator is often used to obtain the undefined primitive value, using `void(0)`. Also it can be used to call asynchronous functions without waiting for the result.


257. ### How to set the cursor to wait

      The cursor can be set to wait in JavaScript by using the property `cursor`. Let's perform this behavior on page load using the below function.

      ```javascript
      function myFunction() {
        window.document.body.style.cursor = "wait";
      }
      ```

      and this function invoked on page load

      ```html
      <body onload="myFunction()"></body>
      ```


258. ### How do you create an infinite loop

      You can create infinite loops using for and while loops without using any expressions. The for loop construct or syntax is better approach in terms of ESLint and code optimizer tools,

      ```javascript
      for (;;) {}
      while (true) {}
      ```


259. ### Why do you need to avoid with statement


      Using `with` it turns this into:

      ```javascript
      with (a.b.c) {
        greeting = "welcome";
        age = 32;
      }
      ```

      But this `with` statement creates performance problems since one cannot predict whether an argument will refer to a real variable or to a property inside the with argument.


260. ### List down some of the features of ES6

      Below are the list of some new features of ES6,

      1. Support for constants or immutable variables
      2. Block-scope support for variables, constants and functions
      3. Arrow functions
      4. Default parameters
      5. Rest and Spread Parameters
      6. Template Literals
      7. Multi-line Strings
      8. Destructuring Assignment
      9. Enhanced Object Literals
      10. Promises
      11. Classes
      12. Modules


261. ### What is ES6

      ES6 is the sixth edition of the javascript language and it was released in June 2015. It was initially known as ECMAScript 6 (ES6) and later renamed to ECMAScript 2015. Almost all the modern browsers support ES6 but for the old browsers there are many transpilers, like Babel.js etc.


262. ### Can I redeclare let and const variables

      No, you cannot redeclare let and const variables. If you do, it throws below error

      ```bash
      Uncaught SyntaxError: Identifier 'someVariable' has already been declared
      ```


      The block-scoped multi-declaration throws syntax error,

      ```javascript
      let name = "John";
      function myFunc() {
        let name = "Nick";
        let name = "Abraham"; // Uncaught SyntaxError: Identifier 'name' has already been declared
        alert(name);
      }

      myFunc();
      alert(name);
      ```


263. ### Does the `const` variable make the value immutable

      No, the `const` variable doesn't make the value immutable. But it disallows subsequent assignments(i.e, You can declare with assignment but can't assign another value later)

      ```javascript
      const userList = [];
      userList.push("John"); // Can mutate even though it can't re-assign
      console.log(userList); // ['John']
      ```


264. ### What are default parameters

      In ES5, we need to depend on logical OR operators to handle default values of function parameters. Whereas in ES6, Default function parameters feature allows parameters to be initialized with default values if no value or undefined is passed. Let's compare the behavior with an examples,

      ```javascript
      //ES5
      var calculateArea = function (height, width) {
        height = height || 50;
        width = width || 60;

        return width * height;
      };
      console.log(calculateArea()); //300
      ```

      The default parameters makes the initialization more simpler,

      ```javascript
      //ES6
      var calculateArea = function (height = 50, width = 60) {
        return width * height;
      };

      console.log(calculateArea()); //300
      ```


265. ### What are template literals

      Template literals or template strings are string literals allowing embedded expressions. These are enclosed by the back-tick (`) character instead of double or single quotes.
      In ES6, this feature enables using dynamic expressions as below,

      ```javascript
      var greeting = `Welcome to JS World, Mr. ${firstName} ${lastName}.`;
      ```

      In ES5, you need break string like below,

      ```javascript
      var greeting = 'Welcome to JS World, Mr. ' + firstName + ' ' + lastName.`
      ```

      **Note:** You can use multi-line strings and string interpolation features with template literals.


266. ### How do you write multi-line strings in template literals

      In ES5, you would have to use newline escape characters('\\n') and concatenation symbols(+) in order to get multi-line strings.

      ```javascript
      console.log("This is string sentence 1\n" + "This is string sentence 2");
      ```

      Whereas in ES6, You don't need to mention any newline sequence character,

      ```javascript
      console.log(`This is string sentence
      'This is string sentence 2`);
      ```


267. ### What are nesting templates


      You can write the above use case without nesting template features as well. However, the nesting template feature is more compact and readable.

      ```javascript
      //Without nesting templates
      const iconStyles = `icon ${
        isMobilePlatform()
          ? ""
          : user.isAuthorized
          ? "icon-submit"
          : "icon-disabled"
      }`;
      ```
268. ### What are raw strings


      If you don't use raw strings, the newline character sequence will be processed by displaying the output in multiple lines

      ```javascript
      var calculationString = `The sum of numbers is \n${1 + 2 + 3 + 4}!`;
      console.log(calculationString);
      // The sum of numbers is
      // 10!
      ```

      Also, the raw property is available on the first argument to the tag function

      ```javascript
      function tag(strings) {
        console.log(strings.raw[0]);
      }
      ```


269. ### What is destructuring assignment

      The destructuring assignment is a JavaScript expression that makes it possible to unpack values from arrays or properties from objects into distinct variables.
      Let's get the month values from an array using destructuring assignment

      ```javascript
      var [one, two, three] = ["JAN", "FEB", "MARCH"];

      console.log(one); // "JAN"
      console.log(two); // "FEB"
      console.log(three); // "MARCH"
      ```

      and you can get user properties of an object using destructuring assignment,

      ```javascript
      var { name, age } = { name: "John", age: 32 };

      console.log(name); // John
      console.log(age); // 32
      ```


270. ### What are default values in destructuring assignment


      **Objects destructuring:**

      ```javascript
      var { x = 2, y = 4, z = 6 } = { x: 10 };

      console.log(x); // 10
      console.log(y); // 4
      console.log(z); // 6
      ```


271. ### How do you swap variables in destructuring assignment

      If you don't use destructuring assignment, swapping two values requires a temporary variable. Whereas using a destructuring feature, two variable values can be swapped in one destructuring expression. Let's swap two number variables in array destructuring assignment,

      ```javascript
      var x = 10,
        y = 20;

      [x, y] = [y, x];
      console.log(x); // 20
      console.log(y); // 10
      ```


272. ### What are dynamic imports

      The dynamic imports using `import()` function syntax allows us to load modules on demand by using promises or the async/await syntax. Currently this feature is in [stage4 proposal](https://github.com/tc39/proposal-dynamic-import). The main advantage of dynamic imports is reduction of our bundle's sizes, the size/payload response of our requests and overall improvements in the user experience.
      The syntax of dynamic imports would be as below,

      ```javascript
      import("./Module").then((Module) => Module.method());
      ```


273. ### What are the use cases for dynamic imports

      Below are some of the use cases of using dynamic imports over static imports,



      3. Import a module from within a regular script instead a module.


274. ### What are typed arrays

      Typed arrays are array-like objects from ECMAScript 6 API for handling binary data. JavaScript provides 12 Typed array types,

      1. Int8Array: An array of 8-bit signed integers
      2. Uint8Array: An array of 8-bit unsigned integers
      3. Uint8ClampedArray: An array of 8-bit unsigned integers clamped to 0-255
      4. Int16Array: An array of 16-bit signed integers
      5. Uint16Array: An array of 16-bit unsigned integers
      6. Int32Array: An array of 32-bit signed integers
      7. Uint32Array: An array of 32-bit unsigned integers
      8. BigInt64Array: An array of 64-bit signed BigInts
      9. BigUint64Array: An array of 64-bit unsigned BigInts
      10. Float16Array: An array of 16-bit floating point numbers
      11. Float32Array: An array of 32-bit floating point numbers
      12. Float64Array: An array of 64-bit floating point numbers



275. ### What are the advantages of module loaders

      The module loaders provides the below features,

      1. Dynamic loading
      2. State isolation
      3. Global namespace isolation
      4. Compilation hooks
      5. Nested virtualization


276. ### What is collation


      2. **Sorting:**

      ```javascript
      var list = ["ä", "a", "z"]; // In German,  "ä" sorts with "a" Whereas in Swedish, "ä" sorts after "z"
      var l10nDE = new Intl.Collator("de");
      var l10nSV = new Intl.Collator("sv");
      console.log(list.sort(l10nDE.compare)); // [ "a", "ä", "z" ]
      console.log(list.sort(l10nSV.compare)); // [ "a", "z", "ä" ]
      ```


277. ### What is the output of below spread operator array

      ```javascript
      [..."John Resig"];
      ```

      The output of the array is ['J', 'o', 'h', 'n', ' ', 'R', 'e', 's', 'i', 'g']

      **Explanation:** The string is an iterable type and the spread operator within an array maps every character of an iterable to one element. Hence, each character of a string becomes an element within an Array.


278. ### Is PostMessage secure

      Yes, postMessages can be considered very secure as long as the programmer/developer is careful about checking the origin and source of an arriving message. But if you try to send/receive a message without verifying its source will create cross-site scripting attacks.


279. ### What are the problems with postmessage target origin as wildcard

      The second argument of postMessage method specifies which origin is allowed to receive the message. If you use the wildcard “\*” as an argument then any origin is allowed to receive the message. In this case, there is no way for the sender window to know if the target window is at the target origin when sending the message. If the target window has been navigated to another origin, the other origin would receive the data. Hence, this may lead to XSS vulnerabilities.

      ```javascript
      targetWindow.postMessage(message, "*");
      ```


280. ### How do you avoid receiving postMessages from attackers

      Since the listener listens for any message, an attacker can trick the application by sending a message from the attacker’s origin, which gives an impression that the receiver received the message from the actual sender’s window. You can avoid this issue by validating the origin of the message on the receiver's end using the “message.origin” attribute.



281. ### Can I avoid using postMessages completely

      You cannot avoid using postMessages completely(or 100%). Even though your application doesn’t use postMessage considering the risks, a lot of third party scripts use postMessage to communicate with the third party service. So your application might be using postMessage without your knowledge.


282. ### Is postMessages synchronous

      The postMessages are synchronous in IE8 browser but they are asynchronous in IE9 and all other modern browsers (i.e, IE9+, Firefox, Chrome, Safari).Due to this asynchronous behaviour, we use a callback mechanism when the postMessage is returned.


283. ### What paradigm is Javascript

      JavaScript is a multi-paradigm language, supporting imperative/procedural programming, Object-Oriented Programming and functional programming. JavaScript supports Object-Oriented Programming with prototypical inheritance.


284. ### What is the difference between internal and external javascript

      **Internal JavaScript:** It is the source code within the script tag.
      **External JavaScript:** The source code is stored in an external file(stored with .js extension) and referred with in the tag.


285. ### Is JavaScript faster than server side script

      Yes, JavaScript is faster than server side scripts. Because JavaScript is a client-side script it does not require any web server’s help for its computation or calculation. So JavaScript is always faster than any server-side script like ASP, PHP, etc.


286. ### How do you get the status of a checkbox


      ```javascript
      console.log(document.getElementById(‘checkboxname’).checked); // true or false
      ```


287. ### What is the purpose of double tilde operator

      The double tilde operator(~~) is known as double NOT bitwise operator. This operator is a slightly quicker substitute for Math.floor().


288. ### How do you convert character to ASCII code


      Whereas `String.fromCharCode()` method converts numbers to equal ASCII characters.

      ```javascript
      String.fromCharCode(65, 66, 67); // returns 'ABC'
      ```


289. ### What is ArrayBuffer

      An ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You can create it as below,

      ```javascript
      let buffer = new ArrayBuffer(16); // create a buffer of length 16
      alert(buffer.byteLength); // 16
      ```

      To manipulate an ArrayBuffer, we need to use a “view” object.

      ```javascript
      //Create a DataView referring to the buffer
      let view = new DataView(buffer);
      ```


290. ### What is the output of below string expression

      ```javascript
      console.log("Welcome to JS world"[0]);
      ```

      The output of the above expression is "W".
      **Explanation:** The bracket notation with specific index on a string returns the character at a specific location. Hence, it returns the character "W" of the string. Since this is not supported in IE7 and below versions, you may need to use the .charAt() method to get the desired result.


291. ### What is the purpose of Error object

      The Error constructor creates an error object and the instances of error objects are thrown when runtime errors occur. The Error object can also be used as a base object for user-defined exceptions. The syntax of error object would be as below,

      ```javascript
      new Error([message[, fileName[, lineNumber]]])
      ```

      You can throw user defined exceptions or errors using Error object in try...catch block as below,

      ```javascript
      try {
        if (withdraw > balance)
          throw new Error("Oops! You don't have enough balance");
      } catch (e) {
        console.log(e.name + ": " + e.message);
      }
      ```


292. ### What is the purpose of EvalError object

      The EvalError object indicates an error regarding the global `eval()` function. Even though this exception is not thrown by JavaScript anymore, the EvalError object remains for compatibility. The syntax of this expression would be as below,

      ```javascript
      new EvalError([message[, fileName[, lineNumber]]])
      ```

      You can throw EvalError with in try...catch block as below,

      ```javascript
      try {
        throw new EvalError('Eval function error', 'someFile.js', 100);
      } catch (e) {
        console.log(e.message, e.name, e.fileName);              // "Eval function error", "EvalError", "someFile.js"
      ```


293. ### What are the list of cases error thrown from non-strict mode to strict mode

      When you apply 'use strict'; syntax, some of the below cases will throw a SyntaxError before executing the script

      1. When you use Octal syntax

      ```javascript
      var n = 022;
      ```

      2. Using `with` statement
      3. When you use delete operator on a variable name
      4. Using eval or arguments as variable or function argument name
      5. When you use newly reserved keywords
      6. When you declare a function in a block and access it from outside of the block

      ```javascript
      if (someCondition) {
        function f() {}
      }
      f(); // ReferenceError: f is not defined
      ```

      Hence, the errors from above cases are helpful to avoid errors in development/production environments.


294. ### Do all objects have prototypes

      No. All objects have prototypes except two exceptions:
      *  **Object.prototype** itself — This is the base object in the prototype chain, and **its prototype is** `null`.
      *   **Objects created with** `**Object.create(null)**` — These are deliberately created with **no prototype**, so they don’t inherit from `Object.prototype`.

      All other standard objects do have a prototype.  


295. ### What is the difference between a parameter and an argument

      Parameter is the variable name of a function definition whereas an argument represents the value given to a function when it is invoked. Let's explain this with a simple function

      ```javascript
      function myFunction(parameter1, parameter2, parameter3) {
        console.log(arguments[0]); // "argument1"
        console.log(arguments[1]); // "argument2"
        console.log(arguments[2]); // "argument3"
      }
      myFunction("argument1", "argument2", "argument3");
      ```

296. ### How do you combine two or more arrays

      The concat() method is used to join two or more arrays by returning a new array containing all the elements. The syntax would be as below,

      ```javascript
      array1.concat(array2, array3, ..., arrayX)
      ```



297. ### What is the difference between Shallow and Deep copy

      There are two ways to copy an object,

      **Shallow Copy:**
      Shallow copy is a bitwise copy of an object. A new object is created that has an exact copy of the values in the original object. If any of the fields of the object are references to other objects, just the reference addresses are copied i.e., only the memory address is copied.


      to create a duplicate

      ```javascript
      var empDetailsShallowCopy = empDetails; //Shallow copying!
      ```

      if we change some property value in the duplicate one like this:

      ```javascript
      empDetailsShallowCopy.name = "Johnson";
      ```

      The above statement will also change the name of `empDetails`, since we have a shallow copy. That means we're losing the original data as well.

      **Deep copy:**
      A deep copy copies all fields, and makes copies of dynamically allocated memory pointed to by the fields. A deep copy occurs when an object is copied along with the objects to which it refers.


      Create a deep copy by using the properties from the original object into new variable

      ```javascript
      var empDetailsDeepCopy = {
        name: empDetails.name,
        age: empDetails.age,
        expertise: empDetails.expertise,
      };
      ```

      Now if you change `empDetailsDeepCopy.name`, it will only affect `empDetailsDeepCopy` & not `empDetails`


298. ### How do you create specific number of copies of a string

      The `repeat()` method is used to construct and return a new string which contains the specified number of copies of the string on which it was called, concatenated together. Remember that this method has been added to the ECMAScript 2015 specification.


299. ### Does javascript uses mixins

      JavaScript does not have built-in support for mixins as a formal language feature. However, developers commonly implement mixins using various patterns to enable code reuse and composition.

      A mixin is a way to add reusable functionality from one or more objects into a class or another object, without using classical inheritance. It promotes object composition by combining behaviors or properties from different sources into a single destination.

300. ### Benefits
      - Avoids deep inheritance hierarchies
      - Encourages composition over inheritance
      - Promotes reusable and modular code
  
      Modern JavaScript favors mixin alternatives like composition, delegation, higher-order functions, and class mixins to promote reusable and modular code. Libraries like Lodash offer utilities for object composition, while frameworks like Vue.js provide built-in mixin features to promote reusable and modular code.


301. ### What are asynchronous thunks

      The `getData` function won't be called immediately but it will be invoked only when the data is available from API endpoint. The setTimeout function is also used to make our code asynchronous. The best real time example is redux state management library which uses the asynchronous thunks to delay the actions to dispatch.


302. ### How to remove all line breaks from a string

      The easiest approach is using regular expressions to detect and replace newlines in the string. In this case, we use replace function along with string to replace with, which in our case is an empty string.

      ```javascript
      function remove_linebreaks( var message ) {
          return message.replace( /[\r\n]+/gm, "" );
      }
      ```

      In the above expression, g and m are for global and multiline flags.


303. ### What is the difference between reflow and repaint

      A _repaint_ occurs when changes are made which affect the visibility of an element, but not its layout. Examples of this include outline, visibility, or background color. A _reflow_ involves changes that affect the layout of a portion of the page (or the whole page). Resizing the browser window, changing the font, content changing (such as user typing text), using JavaScript methods involving computed styles, adding or removing elements from the DOM, and changing an element's classes are a few of the things that can trigger reflow. Reflow of an element causes the subsequent reflow of all child and ancestor elements as well as any elements following it in the DOM.


304. ### What happens with negating an array

      Negating an array with `!` character will coerce the array into a boolean. Since Arrays are considered to be truthy So negating it will return `false`.

      ```javascript
      console.log(![]); // false
      ```


305. ### What is the output of prepend additive operator on falsy values

      If you prepend the additive(+) operator on falsy values(null, undefined, NaN, false, ""), the falsy value converts to a number value zero. Let's display them on browser console as below,

      ```javascript
      console.log(+null); // 0
      console.log(+undefined); // NaN
      console.log(+false); // 0
      console.log(+NaN); // NaN
      console.log(+""); // 0
      ```

306. ### How do you remove falsy values from an array

      You can apply the filter method on the array by passing Boolean as a parameter. This way it removes all falsy values(0, undefined, null, false and "") from the array.

      ```javascript
      const myArray = [false, null, 1, 5, undefined];
      myArray.filter(Boolean); // [1, 5] // is same as myArray.filter(x => x);
      ```


307. ### How do you get unique values of an array

      You can get unique values of an array with the combination of `Set` and rest expression/spread(...) syntax.

      ```javascript
      console.log([...new Set([1, 2, 4, 4, 3])]); // [1, 2, 4, 3]
      ```


308. ### What is destructuring aliases

      Sometimes you would like to have a destructured variable with a different name than the property name. In that case, you'll use a `: newName` to specify a name for the variable. This process is called destructuring aliases.

      ```javascript
      const obj = { x: 1 };
      // Grabs obj.x as { otherName }
      const { x: otherName } = obj;
      ```


309. ### How do you map the array values without using map method

      You can map the array values without using the `map` method by just using the `from` method of Array. Let's map city names from Countries array,

      ```javascript
      const countries = [
        { name: "India", capital: "Delhi" },
        { name: "US", capital: "Washington" },
        { name: "Russia", capital: "Moscow" },
        { name: "Singapore", capital: "Singapore" },
        { name: "China", capital: "Beijing" },
        { name: "France", capital: "Paris" },
      ];

      const cityNames = Array.from(countries, ({ capital }) => capital);
      console.log(cityNames); // ['Delhi, 'Washington', 'Moscow', 'Singapore', 'Beijing', 'Paris']
      ```


310. ### How do you empty an array

      You can empty an array quickly by setting the array length to zero.

      ```javascript
      let cities = ["Singapore", "Delhi", "London"];
      cities.length = 0; // cities becomes []
      ```


311. ### How do you round numbers to certain decimals

      You can round numbers to a certain number of decimals using `toFixed` method from native javascript.

      ```javascript
      let pie = 3.141592653;
      pie = pie.toFixed(3); // 3.142
      ```


312. ### What is the easiest way to convert an array to an object

      You can convert an array to an object with the same data using spread(...) operator.

      ```javascript
      var fruits = ["banana", "apple", "orange", "watermelon"];
      var fruitsObject = { ...fruits };
      console.log(fruitsObject); // {0: "banana", 1: "apple", 2: "orange", 3: "watermelon"}
      ```


313. ### How do you create an array with some data

      You can create an array with some data or an array with the same values using `fill` method.

      ```javascript
      var newArray = new Array(5).fill("0");
      console.log(newArray); // ["0", "0", "0", "0", "0"]
      ```


314. ### What are the placeholders from console object

      Below are the list of placeholders available from console object,

      1. %o — It takes an object,
      2. %s — It takes a string,
      3. %d — It is used for a decimal or integer


315. ### Is it possible to add CSS to console messages

      Yes, you can apply CSS styles to console messages similar to html text on the web page.

      ```javascript
      console.log(
        "%c The text has blue color, with large font and red background",
        "color: blue; font-size: x-large; background: red"
      );
      ```

      The text will be displayed as below,

      **Note:** All CSS styles can be applied to console messages.


316. ### What is the purpose of dir method of console object

      The `console.dir()` is used to display an interactive list of the properties of the specified JavaScript object as JSON.

      ```javascript
      const user = { name: "John", id: 1, city: "Delhi" };
      console.dir(user);
      ```

      The user object displayed in JSON representation


317. ### Is it possible to debug HTML elements in console

      Yes, it is possible to get and debug HTML elements in the console just like inspecting elements.

      ```javascript
      const element = document.getElementsByTagName("body")[0];
      console.log(element);
      ```

      It prints the HTML element in the console,



318. ### How do you display data in a tabular format using console object

      The `console.table()` is used to display data in the console in a tabular format to visualize complex arrays or objects.

      ```js
      const users = [
        { name: "John", id: 1, city: "Delhi" },
        { name: "Max", id: 2, city: "London" },
        { name: "Rod", id: 3, city: "Paris" },
      ];
      console.table(users);
      ```

      The data visualized in a table format,

      **Not:** Remember that `console.table()` is not supported in IE.


319. ### How do you verify that an argument is a Number or not

      The combination of IsNaN and isFinite methods are used to confirm whether an argument is a number or not.

      ```javascript
      function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
      ```


320. ### How do you create copy to clipboard button

      You need to select the content(using .select() method) of the input element and execute the copy command with execCommand (i.e, execCommand('copy')). You can also execute other system commands like cut and paste.

      ```javascript
      document.querySelector("#copy-button").onclick = function () {
        // Select the content
        document.querySelector("#copy-input").select();
        // Copy to the clipboard
        document.execCommand("copy");
      };
      ```


321. ### What is the shortcut to get timestamp

      You can use `new Date().getTime()` to get the current timestamp. There is an alternative shortcut to get the value.

      ```javascript
      console.log(+new Date());
      console.log(Date.now());
      ```


322. ### What is the easiest multi condition checking

      You can use `indexOf` to compare input with multiple values instead of checking each value as one condition.

      ```javascript
      // Verbose approach
      if (
        input === "first" ||
        input === 1 ||
        input === "second" ||
        input === 2
      ) {
        someFunction();
      }
      // Shortcut
      if (["first", 1, "second", 2].indexOf(input) !== -1) {
        someFunction();
      }
      ```


323. ### How do you capture browser back button

      The `beforeunload` event is triggered when the window, the document and its resources are about to be unloaded. This event is helpful to warn users about losing the current data and detect back button event.

      ```javascript
      window.addEventListener("beforeunload", () => {
        console.log("Clicked browser back button");
      });
      ```

      You can also use `popstate` event to detect the browser back button.
      **Note:** The history entry has been activated using `history.pushState` method.

      ```javascript
      window.addEventListener("popstate", () => {
        console.log("Clicked browser back button");
        box.style.backgroundColor = "white";
      });

      const box = document.getElementById("div");

      box.addEventListener("click", () => {
        box.style.backgroundColor = "blue";
        window.history.pushState({}, null, null);
      });
      ```


    In the preceeding code, When the box element clicked, its background color appears in blue color and changed to while color upon clicking the browser back button using `popstate` event handler. The `state` property of `popstate` contains the copy of history entry's state object.


324. ### How do you disable right click in the web page

     The right click on the page can be disabled by returning false from the `oncontextmenu` attribute on the body element.

     ```html
     <body oncontextmenu="return false;"></body>
     ```


325. ### What are wrapper objects


     i.e, Every primitive except null and undefined have Wrapper Objects and the list of wrapper objects are String,Number,Boolean,Symbol and BigInt.


326. ### What is AJAX

     AJAX stands for Asynchronous JavaScript and XML and it is a group of related technologies(HTML, CSS, JavaScript, XMLHttpRequest API etc) used to display data asynchronously. i.e. We can send data to the server and get data from the server without reloading the web page.


327. ### What are the different ways to deal with Asynchronous Code

     Below are the list of different ways to deal with Asynchronous code.

     1. Callbacks
     2. Promises
     3. Async/await
     4. Third-party libraries such as async.js,bluebird etc


328. ### How to cancel a fetch request

     Until a few days back, One shortcoming of native promises is no direct way to cancel a fetch request. But the new `AbortController` from js specification allows you to use a signal to abort one or multiple fetch calls.
     The basic flow of cancelling a fetch request would be as below,

     1. Create an `AbortController` instance
     2. Get the signal property of an instance and pass the signal as a fetch option for signal
     3. Call the AbortController's abort property to cancel all fetches that use that signal


329. ### What is web speech API

     Web speech API is used to enable modern browsers recognize and synthesize speech(i.e, voice data into web apps). This API was introduced by W3C Community in the year 2012. It has two main parts:

     1. **SpeechRecognition (Asynchronous Speech Recognition or Speech-to-Text):** It provides the ability to recognize voice context from an audio input and respond accordingly. This is accessed by the `SpeechRecognition` interface.

     In this API, browser is going to ask you for permission to use your microphone

     2. **SpeechSynthesis (Text-to-Speech):** It provides the ability to recognize voice context from an audio input and respond. This is accessed by the `SpeechSynthesis` interface.

     The above examples can be tested on chrome(33+) browser's developer console.
     **Note:** This API is still a working draft and only available in Chrome and Firefox browsers(ofcourse Chrome only implemented the specification)


330. ### What is minimum timeout throttling

     Both browser and NodeJS javascript environments throttles with a minimum delay that is greater than 0ms. That means even though setting a delay of 0ms will not happen instantaneously.
     **Browsers:** They have a minimum delay of 4ms. This throttle occurs when successive calls are triggered due to callback nesting(certain depth) or after a certain number of successive intervals.
     Note: The older browsers have a minimum delay of 10ms.
     **Nodejs:** They have a minimum delay of 1ms. This throttle happens when the delay is larger than 2147483647 or less than 1.

     and the output would be in

     ```cmd
     Script loaded
     My script is initialized
     ```

     If you don't use `setTimeout`, the order of logs will be sequential.

     ```javascript
     function runMeFirst() {
       console.log("My script is initialized");
     }
     runMeFirst();
     console.log("Script loaded");
     ```

     and the output is,

     ```cmd
     My script is initialized
     Script loaded
     ```


331. ### How do you implement zero timeout in modern browsers

     You can't use setTimeout(fn, 0) to execute the code immediately due to minimum delay of greater than 0ms. But you can use window.postMessage() to achieve this behavior.


332. ### What are tasks in event loop

     A task is any javascript code/program which is scheduled to be run by the standard mechanisms such as initially starting to run a program, run an event callback, or an interval or timeout being fired. All these tasks are scheduled on a task queue.
     Below are the list of use cases to add tasks to the task queue,

     1. When a new javascript program is executed directly from console or running by the `<script>` element, the task will be added to the task queue.
     2. When an event fires, the event callback added to task queue
     3. When a setTimeout or setInterval is reached, the corresponding callback added to task queue


333. ### What is microtask
     
     A microtask is a type of JavaScript callback that is scheduled to run immediately after the currently executing script and before the next event loop tick. Microtasks are executed after the current task completes and before any new tasks (macrotasks) are run. This ensures a fast and predictable update cycle.

     Common sources of microtasks stored in the microtask queue include:

      1. **Promises:**
      2. **queueMicrotask():**
      3. **MutationObserver callbacks:**
      4. **await:**  


334. ### What are different event loops

     In JavaScript, there are multiple event loops that can be used depending on the context of your application. The most common event loops are:

     1. The Browser Event Loop
     2. The Node.js Event Loop

- Browser Event Loop: The Browser Event Loop is used in client-side JavaScript applications and is responsible for handling events that occur within the browser environment, such as user interactions (clicks, keypresses, etc.), HTTP requests, and other asynchronous actions.

- The Node.js Event Loop is used in server-side JavaScript applications and is responsible for handling events that occur within the Node.js runtime environment, such as file I/O, network I/O, and other asynchronous actions.


335. ### What is the purpose of queueMicrotask

     The `queueMicrotask` function is used to schedule a microtask, which is a function that will be executed asynchronously in the microtask queue. The purpose of `queueMicrotask` is to ensure that a function is executed after the current task has finished, but before the browser performs any rendering or handles user events.


     By using queueMicrotask, you can ensure that certain tasks or callbacks are executed at the earliest opportunity during the JavaScript event loop, making it useful for performing work that needs to be done asynchronously but with higher priority than regular `setTimeout` or `setInterval` callbacks.


336. ### How do you use javascript libraries in typescript file


     In the runtime, typescript will provide the type to the `customLibrary` variable as `any` type. The another alternative without using declare keyword is below

     ```javascript
     var customLibrary: any;
     ```


337. ### What are the differences between promises and observables

     Some of the major difference in a tabular form

     | Promises                                                           | Observables                                                                              |
     | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
     | Emits only a single value at a time                                | Emits multiple values over a period of time(stream of values ranging from 0 to multiple) |
     | Eager in nature; they are going to be called immediately           | Lazy in nature; they require subscription to be invoked                                  |
     | Promise is always asynchronous even though it resolved immediately | Observable can be either synchronous or asynchronous                                     |
     | Doesn't provide any operators                                      | Provides operators such as map, forEach, filter, reduce, retry, and retryWhen etc        |
     | Cannot be canceled                                                 | Canceled by using unsubscribe() method                                                   |


338. ### What is heap

     Heap(Or memory heap) is the memory location where objects are stored when we define variables. i.e, This is the place where all the memory allocations and de-allocation take place. Both heap and call-stack are two containers of JS runtime.
     Whenever runtime comes across variables and function declarations in the code it stores them in the Heap.



339. ### What is an event table

     Event Table is a data structure that stores and keeps track of all the events which will be executed asynchronously like after some time interval or after the resolution of some API requests. i.e Whenever you call a setTimeout function or invoke async operation, it is added to the Event Table.
     It doesn't not execute functions on it’s own. The main purpose of the event table is to keep track of events and send them to the Event Queue as shown in the below diagram.



340. ### What is a microTask queue

     Microtask Queue is the new queue where all the tasks initiated by promise objects get processed before the callback queue.
     The microtasks queue are processed before the next rendering and painting jobs. But if these microtasks are running for a long time then it leads to visual degradation.


341. ### What is the difference between shim and polyfill

     A shim is a library that brings a new API to an older environment, using only the means of that environment. It isn't necessarily restricted to a web application. For example, es5-shim.js is used to emulate ES5 features on older browsers (mainly pre IE9).
     Whereas polyfill is a piece of code (or plugin) that provides the technology that you, the developer, expect the browser to provide natively.
     In a simple sentence, a polyfill is a shim for a browser API.


342. ### How do you detect primitive or non primitive value type

     In JavaScript, primitive types include boolean, string, number, BigInt, null, Symbol and undefined. Whereas non-primitive types include the Objects. But you can easily identify them with the below function,

     ```javascript
     var myPrimitive = 30;
     var myNonPrimitive = {};
     function isPrimitive(val) {
       return Object(val) !== val;
     }

     isPrimitive(myPrimitive);
     isPrimitive(myNonPrimitive);
     ```

     If the value is a primitive data type, the Object constructor creates a new wrapper object for the value. But If the value is a non-primitive data type (an object), the Object constructor will give the same object.


343. ### What is babel

     Babel is a JavaScript transpiler to convert ECMAScript 2015+ code into a backwards compatible version of JavaScript in current and older browsers or environments. Some of the main features are listed below,

     1. Transform syntax
     2. Polyfill features that are missing in your target environment (using @babel/polyfill)
     3. Source code transformations (or codemods)


344. ### Is Node.js completely single threaded

     Node is a single thread, but some of the functions included in the Node.js standard library(e.g, fs module functions) are not single threaded. i.e, Their logic runs outside of the Node.js single thread to improve the speed and performance of a program.


345. ### What are the common use cases of observables

     Some of the most common use cases of observables are web sockets with push notifications, user input changes, repeating intervals, etc


346. ### What is RxJS

     RxJS (Reactive Extensions for JavaScript) is a library for implementing reactive programming using observables that makes it easier to compose asynchronous or callback-based code. It also provides utility functions for creating and working with observables.


347. ### What is the difference between Function constructor and function declaration

     The functions which are created with `Function constructor` do not create closures to their creation contexts but they are always created in the global scope. i.e, the function can access its own local variables and global scope variables only. Whereas function declarations can access outer function variables(closures) too.


     **Function declaration:**

     ```javascript
     var a = 100;
     function createFunction() {
       var a = 200;
       return function func() {
         return a;
       };
     }
     console.log(createFunction()()); // 200
     ```


348. ### What is a Short circuit condition


     Since the javascript logical operators evaluated from left to right, the above expression can be simplified using && logical operator

     ```javascript
     authenticate && loginToPorta();
     ```


349. ### What is the easiest way to resize an array

     The length property of an array is useful to resize or empty an array quickly. Let's apply length property on number array to resize the number of elements from 5 to 2,

     ```javascript
     var array = [1, 2, 3, 4, 5];
     console.log(array.length); // 5

     array.length = 2;
     console.log(array.length); // 2
     console.log(array); // [1,2]
     ```

     and the array can be emptied too

     ```javascript
     var array = [1, 2, 3, 4, 5];
     array.length = 0;
     console.log(array.length); // 0
     console.log(array); // []
     ```


350. ### What is an observable

     An Observable is basically a function that can return a stream of values either synchronously or asynchronously to an observer over time. The consumer can get the value by calling `subscribe()` method.


     **Note:** Observables are not part of the JavaScript language yet but they are being proposed to be added to the language


351. ### What is the difference between function and class declarations

     The main difference between function declarations and class declarations is `hoisting`. The function declarations are hoisted but not class declarations.

     **Classes:**

     ```javascript
     const user = new User(); // ReferenceError

     class User {}
     ```

     **Constructor Function:**

     ```javascript
     const user = new User(); // No error

     function User() {}
     ```


352. ### What is an async function

     An async function is a function declared with the `async` keyword which enables asynchronous, promise-based behavior to be written in a cleaner style by avoiding promise chains. These functions can contain zero or more `await` expressions.


     It is basically syntax sugar over ES2015 promises and generators.


353. ### What is deno

     Deno is a simple, modern and secure runtime for JavaScript and TypeScript that uses V8 JavaScript engine and the Rust programming language. It solves the inherent problems of Node.Js and has been officially released in May 2018. Unlike Node.JS, by default Deno executes the code in a sandbox, which means that runtime has no access to below areas:

     1. The file system
     2. The network
     3. Execution of other scripts
     4. The environment variables


354. ### How do you make an object iterable in javascript

     By default, plain objects are not iterable. But you can make the object iterable by defining a `Symbol.iterator` property on it.


     The above process can be simplified using a generator function,

     ```javascript
     const collection = {
       one: 1,
       two: 2,
       three: 3,
       [Symbol.iterator]: function* () {
         for (let key in this) {
           yield this[key];
         }
       },
     };
     const iterator = collection[Symbol.iterator]();
     console.log(iterator.next()); // {value: 1, done: false}
     console.log(iterator.next()); // {value: 2, done: false}
     console.log(iterator.next()); // {value: 3, done: false}
     console.log(iterator.next()); // {value: undefined, done: true}
     ```


355. ### What is a Proper Tail Call

     First, we should know about tail call before talking about "Proper Tail Call". A tail call is a subroutine or function call performed as the final action of a calling function. Whereas **Proper tail call(PTC)** is a technique where the program or code will not create additional stack frames for a recursion when the function call is a tail call.


     But if you use Tail recursion functions, they keep passing all the necessary data it needs down the recursion without relying on the stack.

     ```javascript
     function factorial(n, acc = 1) {
       if (n === 0) {
         return acc;
       }
       return factorial(n - 1, n * acc);
     }
     console.log(factorial(5)); //120
     ```

     The above pattern returns the same output as the first one. But the accumulator keeps track of total as an argument without using stack memory on recursive calls.


356. ### How do you check an object is a promise or not

     If you don't know if a value is a promise or not, wrapping the value as `Promise.resolve(value)` which returns a promise

     ```javascript
     function isPromise(object) {
       if (Promise && Promise.resolve) {
         return Promise.resolve(object) == object;
       } else {
         throw "Promise not supported in your environment";
       }
     }

     var i = 1;
     var promise = new Promise(function (resolve, reject) {
       resolve();
     });

     console.log(isPromise(i)); // false
     console.log(isPromise(promise)); // true
     ```

     Another way is to check for `.then()` handler type

     ```javascript
     function isPromise(value) {
       return Boolean(value && typeof value.then === "function");
     }
     var i = 1;
     var promise = new Promise(function (resolve, reject) {
       resolve();
     });

     console.log(isPromise(i)); // false
     console.log(isPromise(promise)); // true
     ```


357. ### How to detect if a function is called as constructor

     You can use `new.target` pseudo-property to detect whether a function was called as a constructor(using the new operator) or as a regular function call.

     1. If a constructor or function invoked using the new operator, new.target returns a reference to the constructor or function.
     2. For function calls, new.target is undefined.

     ```javascript
     function Myfunc() {
       if (new.target) {
         console.log("called with new");
       } else {
         console.log("not called with new");
       }
     }

     new Myfunc(); // called with new
     Myfunc(); // not called with new
     Myfunc.call({}); // not called with new
     ```


358. ### What are the differences between arguments object and rest parameter

     There are three main differences between arguments object and rest parameters

     1. The arguments object is an array-like but not an array. Whereas the rest parameters are array instances.
     2. The arguments object does not support methods such as sort, map, forEach, or pop. Whereas these methods can be used in rest parameters.
     3. The rest parameters are only the ones that haven’t been given a separate name, while the arguments object contains all arguments passed to the function


359. ### What are the differences between spread operator and rest parameter

     Rest parameter collects all remaining elements into an array. Whereas Spread operator allows iterables( arrays / objects / strings ) to be expanded into single arguments/elements. i.e, Rest parameter is opposite to the spread operator.


360. ### What are the different kinds of generators

     There are five kinds of generators,

     1. **Generator function declaration:**

        ```javascript
        function* myGenFunc() {
          yield 1;
          yield 2;
          yield 3;
        }
        const genObj = myGenFunc();
        ```

     2. **Generator function expressions:**

        ```javascript
        const myGenFunc = function* () {
          yield 1;
          yield 2;
          yield 3;
        };
        const genObj = myGenFunc();
        ```

     3. **Generator method definitions in object literals:**

        ```javascript
        const myObj = {
          *myGeneratorMethod() {
            yield 1;
            yield 2;
            yield 3;
          },
        };
        const genObj = myObj.myGeneratorMethod();
        ```

     4. **Generator method definitions in class:**

        ```javascript
        class MyClass {
          *myGeneratorMethod() {
            yield 1;
            yield 2;
            yield 3;
          }
        }
        const myObject = new MyClass();
        const genObj = myObject.myGeneratorMethod();
        ```

     5. **Generator as a computed property:**

        ```javascript
        const SomeObj = {
          *[Symbol.iterator]() {
            yield 1;
            yield 2;
            yield 3;
          },
        };

        console.log(Array.from(SomeObj)); // [ 1, 2, 3 ]
        ```


361. ### What are the built-in iterables

     Below are the list of built-in iterables in javascript,

     1. Arrays and TypedArrays
     2. Strings: Iterate over each character or Unicode code-points
     3. Maps: iterate over its key-value pairs
     4. Sets: iterates over their elements
     5. arguments: An array-like special variable in functions
     6. DOM collection such as NodeList


362. ### What are the differences between for...of and for...in statements

     Both for...in and for...of statements iterate over js data structures. The only difference is over what they iterate:

     1. for..in iterates over all enumerable property keys of an object
     2. for..of iterates over the values of an iterable object.


     Since for..in loop iterates over the keys of the object, the first loop logs 0, 1, 2 and newProp while iterating over the array object. The for..of loop iterates over the values of a arr data structure and logs a, b, c in the console.


363. ### How do you define instance and non-instance properties


     But Static(class) and prototype data properties must be defined outside of the ClassBody declaration. Let's assign the age value for Person class as below,

     ```javascript
     Person.staticAge = 30;
     Person.prototype.prototypeAge = 40;
     ```


364. ### What is the difference between isNaN and Number.isNaN?

     1. **isNaN**: The global function `isNaN` converts the argument to a Number and returns true if the resulting value is NaN.
     2. **Number.isNaN**: This method does not convert the argument. But it returns true when the type is a Number and value is NaN.



365. ### How to invoke an IIFE without any extra brackets?

     Immediately Invoked Function Expressions(IIFE) requires a pair of parenthesis to wrap the function which contains set of statements.

     ```js
     (function (dt) {
       console.log(dt.toLocaleTimeString());
     })(new Date());
     ```

     Since both IIFE and void operator discard the result of an expression, you can avoid the extra brackets using `void operator` for IIFE as below,

     ```js
     void (function (dt) {
       console.log(dt.toLocaleTimeString());
     })(new Date());
     ```


366. ### What is the easiest way to ignore promise errors?

     The easiest and safest way to ignore promise errors is void that error. This approach is ESLint friendly too.

     ```js
     await promise.catch((e) => void e);
     ```


367. ### How do style the console output using CSS?

     You can add CSS styling to the console output using the CSS format content specifier %c. The console string message can be appended after the specifier and CSS style in another argument. Let's print the red color text using console.log and CSS specifier as below,

     ```js
     console.log("%cThis is a red text", "color:red");
     ```



368. ### What is nullish coalescing operator (??)?

     It is a logical operator that returns its right-hand side operand when its left-hand side operand is null or undefined, and otherwise returns its left-hand side operand. This can be contrasted with the logical OR (||) operator, which returns the right-hand side operand if the left operand is any falsy value, not only null or undefined.

     ```js
     console.log(null ?? true); // true
     console.log(false ?? true); // false
     console.log(undefined ?? true); // true
     ```


369. ### How do you group and nest console output?

     The `console.group()` can be used to group related log messages to be able to easily read the logs and use console.groupEnd()to close the group. Along with this, you can also nest groups which allows to output message in hierarchical manner.


     You can also use `console.groupCollapsed()` instead of `console.group()` if you want the groups to be collapsed by default.


370. ### What is the difference between dense and sparse arrays?

     An array contains items at each index starting from first(0) to last(array.length - 1) is called as Dense array. Whereas if at least one item is missing at any index, the array is called as sparse.

     Let's see the below two kind of arrays,

     ```js
     const avengers = ["Ironman", "Hulk", "CaptainAmerica"];
     console.log(avengers[0]); // 'Ironman'
     console.log(avengers[1]); // 'Hulk'
     console.log(avengers[2]); // 'CaptainAmerica'
     console.log(avengers.length); // 3

     const justiceLeague = ["Superman", "Aquaman", , "Batman"];
     console.log(justiceLeague[0]); // 'Superman'
     console.log(justiceLeague[1]); // 'Aquaman'
     console.log(justiceLeague[2]); // undefined
     console.log(justiceLeague[3]); // 'Batman'
     console.log(justiceLeague.length); // 4
     ```


371. ### What are the different ways to create sparse arrays?

     There are 4 different ways to create sparse arrays in JavaScript

     1. **Array literal:** Omit a value when using the array literal
        ```js
        const justiceLeague = ["Superman", "Aquaman", , "Batman"];
        console.log(justiceLeague); // ['Superman', 'Aquaman', empty ,'Batman']
        ```
     2. **Array() constructor:** Invoking Array(length) or new Array(length)
        ```js
        const array = Array(3);
        console.log(array); // [empty, empty ,empty]
        ```
     3. **Delete operator:** Using delete array[index] operator on the array
        ```js
        const justiceLeague = ["Superman", "Aquaman", "Batman"];
        delete justiceLeague[1];
        console.log(justiceLeague); // ['Superman', empty, ,'Batman']
        ```
     4. **Increase length property:** Increasing length property of an array
        ```js
        const justiceLeague = ["Superman", "Aquaman", "Batman"];
        justiceLeague.length = 5;
        console.log(justiceLeague); // ['Superman', 'Aquaman', 'Batman', empty, empty]
        ```


372. ### What is the difference between setTimeout, setImmediate and process.nextTick?

     1. **Set Timeout:** setTimeout() is to schedule execution of a one-time callback after delay milliseconds.
     2. **Set Immediate:** The setImmediate function is used to execute a function right after the current event loop finishes.
     3. **Process NextTick:** If process.nextTick() is called in a given phase, all the callbacks passed to process.nextTick() will be resolved before the event loop continues. This will block the event loop and create I/O Starvation if process.nextTick() is called recursively.


373. ### How do you reverse an array without modifying original array?



     2. **Using spread and reverse methods:**
        In this case, let's use the spread syntax (...) to create a copy of the array followed by `reverse()` method call on the copy.

        ```javascript
        const originalArray = [1, 2, 3, 4, 5];
        const newArray = [...originalArray].reverse();

        console.log(originalArray); // [1, 2, 3, 4, 5]
        console.log(newArray); // [ 5, 4, 3, 2, 1]
        ```

     3. **Using reduce and spread methods:**
        Here execute a reducer function on an array elements and append the accumulated array on right side using spread syntax

        ```javascript
        const originalArray = [1, 2, 3, 4, 5];
        const newArray = originalArray.reduce((accumulator, value) => {
          return [value, ...accumulator];
        }, []);

        console.log(originalArray); // [1, 2, 3, 4, 5]
        console.log(newArray); // [ 5, 4, 3, 2, 1]
        ```

     4. **Using reduceRight and spread methods:**
        Here execute a right reducer function(i.e. opposite direction of reduce method) on an array elements and append the accumulated array on left side using spread syntax

        ```javascript
        const originalArray = [1, 2, 3, 4, 5];
        const newArray = originalArray.reduceRight((accumulator, value) => {
          return [...accumulator, value];
        }, []);

        console.log(originalArray); // [1, 2, 3, 4, 5]
        console.log(newArray); // [ 5, 4, 3, 2, 1]
        ```

     5. **Using reduceRight and push methods:**
        Here execute a right reducer function(i.e. opposite direction of reduce method) on an array elements and push the iterated value to the accumulator

        ```javascript
        const originalArray = [1, 2, 3, 4, 5];
        const newArray = originalArray.reduceRight((accumulator, value) => {
          accumulator.push(value);
          return accumulator;
        }, []);

        console.log(originalArray); // [1, 2, 3, 4, 5]
        console.log(newArray); // [ 5, 4, 3, 2, 1]
        ```


374. ### How do you create custom HTML element?

     The creation of custom HTML elements involves two main steps,

     1. **Define your custom HTML element:** First you need to define some custom class by extending HTMLElement class.
        After that define your component properties (styles,text etc) using `connectedCallback` method.
        **Note:** The browser exposes a function called `customElements.define` inorder to reuse the element.
        ```javascript
        class CustomElement extends HTMLElement {
          connectedCallback() {
            this.innerHTML = "This is a custom element";
          }
        }
        customElements.define("custom-element", CustomElement);
        ```
     2. **Use custom element just like other HTML element:** Declare your custom element as a HTML tag.

     ```javascript
        <body>
             <custom-element>
        </body>
     ```


375. ### What is global execution context?

     The global execution context is the default or first execution context that is created by the JavaScript engine before any code is executed(i.e, when the file first loads in the browser). All the global code that is not inside a function or object will be executed inside this global execution context. Since JS engine is single threaded there will be only one global environment and there will be only one global execution context.



376. ### What is function execution context?

     Whenever a function is invoked, the JavaScript engine creates a different type of Execution Context known as a Function Execution Context (FEC) within the Global Execution Context (GEC) to evaluate and execute the code within that function.


377. ### What is debouncing?

    Debouncing is a programming technique used to limit how often a function is executed. Specifically, it ensures that a function is only triggered after a certain amount of time has passed since it was last invoked. This prevents unnecessary or excessive function calls, which can help optimize performance and reduce unnecessary CPU usage or API requests.


378. ### What is throttling?
      Throttling is a programming technique used to control the rate at which a function is executed. When an event is triggered continuously—such as during window resizing, scrolling, or mouse movement—throttling ensures that the associated event handler is not called more often than a specified interval. This helps improve performance by reducing the number of expensive function calls and preventing performance bottlenecks.

      **Common use cases:**

      *   Window resize events
      *   Scroll events
      *   Mouse movement or drag events
      *   API rate limiting

      **How does throttling work?**  
      Throttling will execute the function at most once every specified time interval, ignoring additional calls until the interval has passed.


379. ### What is optional chaining?

     According to MDN official docs, the optional chaining operator (?.) permits reading the value of a property located deep within a chain of connected objects without having to expressly validate that each reference in the chain is valid.

     The ?. operator is like the . chaining operator, except that instead of causing an error if a reference is nullish (null or undefined), the expression short-circuits with a return value of undefined. When used with function calls, it returns undefined if the given function does not exist.

     ```js
     const adventurer = {
       name: "Alice",
       cat: {
         name: "Dinah",
       },
     };

     const dogName = adventurer.dog?.name;
     console.log(dogName);
     // expected output: undefined

     console.log(adventurer.someNonExistentMethod?.());
     // expected output: undefined
     ```


380. ### How to verify if a variable is an array?

     It is possible to check if a variable is an array instance using 3 different ways,

     1. Array.isArray() method:

        The `Array.isArray(value)` utility function is used to determine whether value is an array or not. This function returns a true boolean value if the variable is an array and a false value if it is not.

        ```javascript
        const numbers = [1, 2, 3];
        const user = { name: "John" };
        Array.isArray(numbers); // true
        Array.isArray(user); //false
        ```

     2. instanceof operator:

        The instanceof operator is used to check the type of an array at run time. It returns true if the type of a variable is an Array other false for other type.

        ```javascript
        const numbers = [1, 2, 3];
        const user = { name: "John" };
        console.log(numbers instanceof Array); // true
        console.log(user instanceof Array); // false
        ```

     3. Checking constructor type:

        The constructor property of the variable is used to determine whether the variable Array type or not.

        ```javascript
        const numbers = [1, 2, 3];
        const user = { name: "John" };
        console.log(numbers.constructor === Array); // true
        console.log(user.constructor === Array); // false
        ```


381. ### What is pass by value and pass by reference?

     Pass-by-value creates a new space in memory and makes a copy of a value. Primitives such as string, number, boolean etc will actually create a new copy. Hence, updating one value doesn't impact the other value. i.e, The values are independent of each other.

     ```javascript
     let a = 5;
     let b = a;

     b++;
     console.log(a, b); //5, 6
     ```

     In the above code snippet, the value of `a` is assigned to `b` and the variable `b` has been incremented. Since there is a new space created for variable `b`, any update on this variable doesn't impact the variable `a`.

     Pass by reference doesn't create a new space in memory but the new variable adopts a memory address of an initial variable. Non-primitives such as objects, arrays and functions gets the reference of the initiable variable. i.e, updating one value will impact the other variable.

     ```javascript
     let user1 = {
       name: "John",
       age: 27,
     };
     let user2 = user1;
     user2.age = 30;

     console.log(user1.age, user2.age); // 30, 30
     ```

     In the above code snippet, updating the `age` property of one object will impact the other property due to the same reference.


382. ### What are the differences between primitives and non-primitives?

     JavaScript language has both primitives and non-primitives but there are few differences between them as below,

     | Primitives                 | Non-primitives       |
     | -------------------------- | -------------------- |
     | These types are predefined | Created by developer |
     | These are immutable        | Mutable              |
     | Compare by value           | Compare by reference |
     | Stored in Stack            | Stored in heap       |
     | Contain certain value      | Can contain NULL too |


383. ### How do you create your own bind method using either call or apply method?

     The custom bind function needs to be created on Function prototype inorder to use it as other builtin functions. This custom function should return a function similar to original bind method and the implementation of inner function needs to use apply method call.

     The function which is going to bind using custom `myOwnBind` method act as the attached function(`boundTargetFunction`) and argument as the object for `apply` method call.

     ```js
     Function.prototype.myOwnBind = function (whoIsCallingMe) {
       if (typeof this !== "function") {
         throw new Error(this + "cannot be bound as it's not callable");
       }
       const boundTargetFunction = this;
       return function () {
         boundTargetFunction.apply(whoIsCallingMe, arguments);
       };
     };
     ```


384. ### What are the differences between pure and impure functions?

     Some of the major differences between pure and impure function are as below,

| Pure function                       | Impure function                                                        |
| ----------------------------------- | ---------------------------------------------------------------------- |
| It has no side effects              | It causes side effects                                                 |
| It is always return the same result | It returns different result on each call                               |
| Easy to read and debug              | Difficult to read and debug because they are affected by external code |


385. ### What is referential transparency?

An expression in javascript that can be replaced by its value without affecting the behaviour of the program is called referential transparency. Pure functions are referentially transparent.

```javascript
const add = (x, y) => x + y;
const multiplyBy2 = (x) => x * 2;

//Now add (2, 3) can be replaced by 5.

multiplyBy2(add(2, 3));
```


386. ### What are the possible side-effects in javascript?

     A side effect is the modification of the state through the invocation of a function or expression. These side effects make our function impure by default. Below are some side effects which make function impure,

- Making an HTTP request. Asynchronous functions such as fetch and promise are impure.
- DOM manipulations
- Mutating the input data
- Printing to a screen or console: For example, console.log() and alert()
- Fetching the current time
- Math.random() calls: Modifies the internal state of Math object


387. ### What are compose and pipe functions?

     The "compose" and "pipe" are two techniques commonly used in functional programming to simplify complex operations and make code more readable. They are not native to JavaScript and higher-order functions. the `compose()` applies right to left any number of functions to the output of the previous function.


388. ### What is module pattern?

     Module pattern is a designed pattern used to wrap a set of variables and functions together in a single scope returned as an object. JavaScript doesn't have access specifiers similar to other languages(Java, Python, etc) to provide private scope. It uses IIFE (Immediately invoked function expression) to allow for private scopes. i.e., a closure that protect variables and methods.

     The module pattern looks like below,

     ```javascript
     (function () {
       // Private variables or functions goes here.

       return {
         // Return public variables or functions here.
       };
     })();
     ```


     **Note:** It mimic the concepts of classes with private variables and methods.


389. ### What is Function Composition?

     It is an approach where the result of one function is passed on to the next function, which is passed to another until the final function is executed for the final result.

     ```javascript
     //example
     const double = (x) => x * 2;
     const square = (x) => x * x;

     var output1 = double(2);
     var output2 = square(output1);
     console.log(output2);

     var output_final = square(double(2));
     console.log(output_final);
     ```


390. ### How to use await outside of async function prior to ES2022?

     Prior to ES2022, if you attempted to use an await outside of an async function resulted in a SyntaxError.

     ```javascript
     await Promise.resolve(console.log("Hello await")); // SyntaxError: await is only valid in async function
     ```

     But you can fix this issue with an alternative IIFE (Immediately Invoked Function Expression) to get access to the feature.

     ```javascript
     (async function () {
       await Promise.resolve(console.log("Hello await")); // Hello await
     })();
     ```

     In ES2022, you can write top-level await without writing any hacks.

     ```javascript
     await Promise.resolve(console.log("Hello await")); //Hello await
     ```


391. ### What is the purpose of the this keyword in JavaScript?
The `this` keyword in JavaScript refers to **the object that is executing the current function**. Its value is determined by **how a function is called**, not where it is defined.  `this` is essential for writing object-oriented and event-driven code, as it allows methods to interact with the data of the object they belong to.

    - In a global context, this refers to the global object (e.g., window in a browser).
    - In a regular function, this refers to the global object(window in browser and global in nodejs) for non-strict mode.  In strict mode, it's value is undefined.
    - In a method, this refers to the object that owns the method (person in the case).
    - In an event handler, this refers to the element that triggered the event (the button in this case).
    - Arrow functions do not have their own `this` binding; they inherit it from their surrounding (lexical) context.

    - When used with new, this refers to the newly created object.


392. ### What are the uses of closures?
     Closures are a powerful feature in programming languages like JavaScript. They allow functions to retain access to variables from their containing (enclosing) scope even after the outer function has finished executing. This means that a function defined within another function can access variables from the outer function, even if the outer function has already returned.
     Here are some common use cases of closures:

- Data Privacy: Closures can be used to create private variables and methods. By defining variables within a function's scope and returning inner functions that have access to those variables, you can create a form of encapsulation, limiting access to certain data or functionality.

- Function Factories: Closures are often used to create functions with pre-set parameters. This is useful when you need to create multiple functions with similar behavior but different configurations.

- Callback Functions: Closures are frequently used in asynchronous programming, such as handling event listeners or AJAX requests. The inner function captures variables from the outer scope and can access them when the callback is invoked.

- Memoization: Closures can be used for memoization, a technique to optimize performance by caching the results of expensive function calls. The inner function can remember the results of previous calls and return the cached result if the same input is provided again.

- iterators and Generators: Closures can be used to create iterators and generators, which are essential for working with collections of data in modern JavaScript.


393. ### What are the phases of execution context?
     The execution context in JavaScript is a data structure that stores the information necessary for executing a piece of code. It includes the code itself, the values of the variables used in the code, and the scope chain. The scope chain is a list of objects that are used to resolve variable names.

The execution context has two phases:

- Creation phase: In this phase, the JavaScript engine creates the execution context and sets up the script's environment. This includes creating the variable object and the scope chain.
- Execution phase: In this phase, the JavaScript engine executes the code in the execution context. This includes evaluating expressions, assigning values to variables, and calling functions.

The execution context is created when a function is called. The function's code is then executed in the execution context. When the function returns, the execution context is destroyed.


394. ### What are the possible reasons for memory leaks?

     Memory leaks can lead to poor performance, slow loading times and even crashes in web applications. Some of the common causes of memory leaks are listed below,

     1. The execessive usage of global variables or omitting the `var` keyword in local scope.
     2. Forgetting to clear the timers set up by `setTimeout` or `setInterval`.
     3. Closures retain references to variables from their parent scope, which leads to variables might not garbage collected even they are no longer used.

395. ### What are the optimization techniques of V8 engine?

     V8 engine uses the below optimization techniques.

     1. **Inline expansion:** It is a compiler optimization by replacing the function calls with the corresponding function blocks.
     2. **Copy elision:** This is a compiler optimization method to prevent expensive extra objects from being duplicated or copied.
     3. **Inline caching:** It is a runtime optimization technique where it caches the execution of older tasks those can be lookup while executing the same task in the future.


396. ### What are the examples of built-in higher order functions?

     There are several built-in higher order functions exists on arrays, strings, DOM and promise methods in javascript. These higher order functions provides significant level of abstraction. The list of functions on these categories are listed below,

     1. **arrays:** map, filter, reduce, sort, forEach, some etc.
     2. **DOM**: The DOM method `element.addEventListener(type, handler)` also accepts the function handler as a second argument.
     3. **Strings:** replace() method.


397. ### What are the benefits higher order functions?
     The main benefits of higher order functions are:
     1. Abstraction
     2. Reusability
     3. Immutability
     4. Modularity


398. ### What is the difference between map and forEach functions?

    Both map and forEach functions are used to iterate over an arrays but there are some differences in their functionality.

    1. **Returning values:** The `map` method returns a new array with transformed elements whereas `forEach` method returns `undefined` even though both of them are doing the same job.

    ```javascript
      const arr = [1, 2, 3, 4, 5];
      arr.map(x => x * x); // [1, 4, 9, 16, 25]
      arr.forEach(x => x * x); //

      The `forEach()` method in JavaScript always returns undefined. This is because forEach() is used to iterate over arrays and perform side effects on each element, rather than returning a `new array or transforming the original array`
    ```

    2. **Chaining methods:** The `map` method is chainable. i.e, It can be attached with `reduce`, `filter`, `sort` and other methods as well. Whereas `forEach` cannot be attached with any other methods because it returns `undefined` value.

    ```javascript
    const arr = [1, 2, 3, 4, 5];
    arr.map((x) => x * x).reduce((total, cur) => total + cur); // 55
    arr.forEach((x) => x * x).reduce((total, cur) => total + cur); //Uncaught TypeError: Cannot read properties of undefine(reading 'reduce')
    ```

    3. **Mutation:** The `map` method doesn't mutate the original array by returning new array. Whereas `forEach` method also doesn't mutate the original array but it's callback is allowed to mutate the original array.

    **Note:** Both these methods existed since ES5 onwards.


399. ### Give an example of statements affected by automatic semicolon insertion?

     The javascript parser will automatically add a semicolon while parsing the source code. For example, the below common statements affected by Automatic Semicolon Insertion(ASI).

     1. An empty statement
     2. var statement
     3. An expression statement
     4. do-while statement
     5. continue statement
     6. break statement
     7. return statement
     8. throw statement


400. ### What are the event phases of a browser?

     There are 3 phases in the lifecycle of an event propagation in JavaScript,

     1. **Capturing phase:** This phase goes down gradually from the top of the DOM tree to the target element when a nested element clicked. Before the click event reaching the final destination element, the click event of each parent's element must be triggered.

     2. **Target phase:** This is the phase where the event originally occurred reached the target element .

     3. **Bubbling phase:** This is reverse of the capturing phase. In this pase, the event bubbles up from the target element through it's parent element, an ancestor and goes all the way to the global window object.

     The pictorial representation of these 3 event phases in DOM looks like below,



401. ### What are the real world use cases of proxy?

     Proxies are not used in regular day to day JavaScript work but they enabled many exciting programming patterns. Some of the real world use cases are listed below,

     1. Vue3 used proxy concept to implement reactive state
     2. SolidJS implemented reactive stores
     3. Immerjs built upon proxy to track updates to immutable updates
     4. ZenStack improved Prisma ORM for access control layer



402. ### What is inline caching?

Inline caching is an optimization technique based on the observation that repeated calls to same function tends to occur on same type of objects. The V8 compiler stores a cache of the type of objects that were passed as a parameter in recent method calls. Upon next time when same function is called, compiler can directly search for the type in cache.


After few successful calls of the same area method to its same hidden class, V8 engine omits the hidden class lookup and simply adds the offset of the property to the object pointer itself. As a result, it increases the execution speed.

There are mainly 3 types of inline caching possible:

1. Monomorphic: This is a optimized caching technique in which there can be always same type of objects passed.
2. Polymorphic: This ia slightly optimized caching technique in which limited number of different types of objects can be passed.
3. Megamorphic: It is an unoptimized caching in which any number of different objects can be passed.


403. ### What are the different ways to execute external scripts?

     There are three different ways to execute external scripts,

     1. async: The script is downloaded in parallel to parsing the page, and executed as soon as it is available even before parsing completes. The parsing of the page is going to be interuppted once the script is downloaded completely and then the script is executed. Thereafter, the parsing of the remaining page will continue.


     2. defer: The script is downloaded in parallel to parsing the page, and executed after the page has finished parsing.


     3. Neither async or defer: The script is downloaded and executed immediately by blocking parsing of the page until the script execution is completed.

     **Note:** You should only use either async or defer attribute if the `src` attribute is present.


404. ### What is Lexical Scope?

     Lexical scope is the ability for a function scope to access variables from the parent scope.

     ```js
     <script>
             function x(){
               var a=10;
               function y(){
                   console.log(a); // will print a , because of lexical scope, it will first look 'a' in
               //its local memory space and then in its parent functions memory space
               }
               y();
           }
           x();
     </script>
     ```


405. ### How to detect system dark mode in javascript?

     The combination of `Window.matchMedia()` utility method along with media query is used to check if the user has selected a dark color scheme in their operating system settings or not. The CSS media query `prefers-color-scheme` needs to be passed to identify system color theme.


406. ### What is the purpose of requestAnimationFrame method?
     The requestAnimationFrame() method in JavaScript is used to schedule a function to be called before the next repaint of the browser window, allowing you to create smooth, efficient animations. It's primarily used for animations and visual updates, making it an essential tool for improving performance when you're animating elements on the web.


407. ### What is the difference between substring and substr methods?

     Both `substring` and `substr` are used to extract parts of a string, but there are subtle differences between the substring() and substr() methods in terms of **syntax** and **behavior**.

     1. `substring(start, end)`
         - **Parameters:**
             - `start`: The index to start extracting (inclusive).
             - `end`: The index to stop extracting (exclusive).
         - **Behavior:**
             - If `start > end`, it **swaps the arguments**.
             - Negative values are treated as `0`.

         ```javascript
          let str = "Hello World";
          console.log(str.substring(0, 5));   // "Hello"
          console.log(str.substring(5, 0));   // "Hello" (swapped)
          console.log(str.substring(-3, 4));  // "Hell" (negative = 0)
         ```
     2. `substr(start, length)` _(Deprecated)_

         - **Parameters:**
           - `start`: The index to start extracting.
           - `length`: The number of characters to extract.
         - **Behavior:**
           - If `start` is negative, it counts from the **end** of the string.
           - If `length` is omitted, it extracts to the end of the string.

         ```javascript
         let str = "Hello World"; console.log(str.substr(0, 5)); // "Hello" 
         console.log(str.substr(-5, 3)); // "Wor" (starts from 'W')`
         ```
         **Note:** substr() is considered a legacy feature in ECMAScript, so it is best to avoid using it if possible.



408. ### How to find the number of parameters expected by a function?

But there are few important rules which needs to be noted while using length property.

1. **Default values:** Only the parameters which exists before a default value are considered.
    ```javascript
    function sum(a, b = 2, c = 3) {
     return a + b + c;
    }
    console.log(sum.length); // 1
    ```
2. **Rest params:** The rest parameters are excluded with in length property.
    ```javascript
    function sum(a, b, ...moreArgs) {
     let total = a + b;
     for (const arg of moreArgs) {
       total += arg;
     }
     return total;
    }
    console.log(sum.length); // 2
    ```
3. **Destructuring patterns:** Each destructuring pattern counted as a single parameter.

    ```javascript
    function func([a, b], { x, y }) {
     console.log(a + b, x, y);
    }

    console.log(func.length); // 2
    ```

**Note:** The Function constructor is itself a function object and it has a length property of 1.


409. ### What is globalThis, and what is the importance of it?

     Nowadays JavaScript language is used in a wide variety of environments and each environment has its own object model. Due to this fact, there are different ways(syntax) to access the global object.

     1. In web browser, the global object is accessible via `window`, `self`, or `frames`.
     2. In Node environment, you have to use `global`.
     3. In Web workers, the global object is available through `self`.



410. ### What are the array mutation methods?
     JavaScript array methods can be categorized into two groups:
      1. Mutating methods: These are the methods that directly modify the original array.
      1. Non-mutating methods: These methods return a new array without altering the original one.

      There are 9 methods in total that mutate the arrays,

      1.  **push:** Adds one or more elements to the end of the array and returns the new length.
      2.  **pop:** Removes the last element from the array and returns that element.
      3.  **unshift:** Adds one or more elements to the beginning of the array and returns the new length..
      4.  **shift:** Removes the first element from the array and returns that element.
      5.  **splice:** Adds or removes elements from the array at a specific index position.
      6.  **sort:** Sorts the elements of the array in-place based on a given sorting criteria.
      7.  **reverse:** Reverses the order of elements in the given array.
      8.  **fill:** Fills all elements of the array with a specific value.
      9.  **copyWithIn:** Copies a sequence of elements within the array to a specified target index in the same array.


411. ### What is module scope in JavaScript?
     Module scope is a feature introduced with ES6 (ES2015) modules that creates a scope specific to a module file, isolating variables and functions declared within it from the global scope and other modules. Variables and functions declared in a module are private by default and can only be accessed by other modules if they are explicitly exported.


412. ### What are shadowing and illegal shadowing?
     
     Both **shadowing** and **illegal shadowing** refer to how variable names can "hide" or override others within nested scopes.

     **Shadowing** occurs when a variable declared within a certain scope (like a function or block) has the same name as a variable declared in an outer scope. The inner variable shadows the outer one — meaning, the inner variable takes precedence in its own scope.


     **Illegal shadowing** in JavaScript refers to a syntax error that happens when you try to declare a block-scoped variable (`let` or `const`) with the same name as a variable declared using `var` in the same or an overlapping scope. 

    

413. ### Why is it important to remove event listeners after use?
     
    In JavaScript, you need to be mindful of removing event listeners to avoid memory leaks — especially in long-lived apps like single-page applications (SPAs) or when working with frameworks/libraries. Eventhough JavaScript has automatic garbage collection, memory leaks can still happen if:

    1. A DOM element is removed, but a listener still references it.
    2. A callback (event listener) holds a reference to a large object or closure that can't be cleaned up.
    3. Global objects like window, document etc retain listeners indefinitely unless manually removed.


  
414. ### What is structuredClone and how is it used for deep copying objects?

      In JavaScript, `structuredClone()` is a built-in method used to create a **deep copy** of a value. It safely clones nested objects, arrays, Maps, Sets, Dates, TypedArrays, and even circular references — without sharing references to the original value. This prevents accidental mutations and makes it useful for state management and data processing.

415. ### What is the difference between const and Object.freeze

     The main difference is that `const` applies to **variables** (bindings), while `Object.freeze()` applies to **values** (objects).

     1. **`const`**: Prevents the reassignment of a variable identifier. It ensures that the variable name always points to the same memory reference. However, if the variable holds an object or array, the *contents* of that object can still be modified.
     2. **`Object.freeze()`**: Prevents the modification of an object's properties. It makes the object immutable (you cannot add, remove, or change properties), but it does not affect the variable assignment itself (unless the variable is also declared with `const`).
