1. ### What is Object-Oriented Programming (OOP)?

    OOP is a programming paradigm based on the concept of "objects". An object contains data (in the form of fields/attributes) and code (in the form of procedures/methods). OOP focuses on managing source code by breaking a system down into independent entities that can interact with each other, rather than focusing on procedural logic.

2. ### What is the main difference between a Class and an Object?

    * Class: A blueprint, template, or prototype that defines the common attributes and behaviors of a type. It does not occupy memory space when declared.Object: A concrete instance created from a Class. It holds real data and occupies space in the system memory.(Example: A Class is the blueprint of a car; an Object is a specific Tesla or Ford car driving on the street).

3. ### What is Encapsulation and why is it important?

    Encapsulation is the practice of bundling data (attributes) and the methods that operate on that data within a single class, while hiding the internal implementation details from the outside world. It is important because it protects data from unauthorized or accidental modification (data hiding) and reduces dependencies between different parts of the code.

4. ### How do you implement Encapsulation in code?

    By using Access Modifiers like private or protected for class attributes, and providing public getter and setter methods so the outside world can access or update the data in a controlled manner.

5. ### What is Inheritance?

    Inheritance is the capability of a new class (Subclass/Derived Class) to inherit properties and behaviors from an existing class (Superclass/Base Class). It promotes code reusability and establishes an "IS-A" relationship.

6. ### What is Polymorphism?

    Polymorphism allows an action to be performed in different ways depending on the actual object executing it. It enables a parent class reference variable to point to a child class object and call the overridden methods of that specific child class at runtime.

7. ### What is Abstraction?

    Abstraction is the process of hiding complex implementation details and showing only the essential features of an object. In programming, it is achieved using Abstract Classes and Interfaces to define a functional framework without writing the detailed underlying code.

8. ### Differentiate between the Access Modifiers: public, private, protected, and default.

    public: Accessible from anywhere within the project.private: Accessible only within the class it is declared.protected: Accessible within the same package and by subclasses even if they are in different packages.default (package-private / no keyword): Accessible only within the same package.

9. ### What is the difference between an Attribute and a Method?

    An attribute represents the state or data of an object (nouns, e.g., color, speed), whereas a method represents the behavior or actions that the object can perform (verbs, e.g., drive(), brake()).

10. ### What is the difference between an "IS-A" and a "HAS-A" relationship?

    IS-A: Represents an Inheritance relationship. Example: Dog IS-A Animal.HAS-A: Represents a Composition or Aggregation relationship (containment). Example: Car HAS-A Engine.

11. ### What is a Constructor? Does it have a return type?

    A constructor is a special method called automatically when a new object is instantiated. Its primary purpose is to initialize the object's attributes. A constructor does not have a return type (not even void) and its name must exactly match the Class name.

12. ### What is the difference between a Default Constructor and a Parameterized Constructor?

    Default Constructor: A constructor that accepts no arguments. If you do not explicitly define any constructor, the compiler automatically generates an empty default constructor.Parameterized Constructor: A constructor that accepts specific arguments, allowing you to initialize an object with custom data from the moment it is created.

13. ### What is a Destructor and how does it work?

    A destructor is a method responsible for cleaning up and freeing memory when an object is destroyed or goes out of scope. In languages like C++, you must write a destructor manually. In languages like Java or C#, memory cleanup is handled automatically by the Garbage Collector.

14. ### What are Static Variables and Static Methods?

    They are attributes and methods that belong to the Class itself rather than to any specific instance (Object). All instances of the class share the exact same static variable. Static methods can be invoked directly using the Class name without instantiating an object.

15. ### Why can't a static method directly call a non-static variable?

    Static resources are loaded into memory as soon as the Class is loaded by the compiler, at which point concrete objects may not even exist yet. Non-static variables only come into existence when an object is instantiated. Therefore, a static method cannot know which object's instance variable it should refer to.

## Section 2: Deep Dive into Polymorphism & Inheritance (Questions 16 - 30)



16. ### Differentiate between Compile-time Polymorphism and Runtime Polymorphism.

    Compile-time (Static Polymorphism): Achieved through Method Overloading. The compiler determines which method to call at the time of compilation.Runtime (Dynamic Polymorphism): Achieved through Method Overriding. The JVM/Runtime environment determines which method to call at execution time based on the actual object instance.

17. ### What is Method Overloading?

    Method Overloading occurs when a single Class has multiple methods with the exact same name but different method signatures (i.e., different number of parameters, different data types, or a different order of parameters). Return type alone cannot be used to overload a method.

18. ### What is Method Overriding?

    Method Overriding occurs when a subclass provides a specific implementation for a method that is already defined in its superclass. The overriding method must have the exact same name, same parameters, and the same (or covariant) return type as the parent class method.

19. ### Provide a quick comparison matrix between Overloading and Overriding.

    FeatureMethod OverloadingMethod OverridingLocationInside the same Class.Across two classes with an Inheritance relationship.ParametersMust be different.Must be exactly the same.Binding TimeCompile-time (Static).Runtime (Dynamic).

20. ### What is the purpose of the super keyword (or base in C#)?

    It is used within a subclass to refer directly to parent class members (attributes, methods, or constructors), such as invoking super.method() to execute a parent function, or super() to call the parent's constructor.

21. ### Why is Multiple Inheritance using Classes forbidden in Java and C#?

    To avoid the Diamond Problem. If Class A has a method foo(), and Classes B and C both inherit A and override foo() differently. If Class D is allowed to inherit from both B and C, calling foo() on D would cause an ambiguity error because the compiler wouldn't know whether to run B's or C's version.

22. ### How do modern OOP languages resolve the multiple inheritance problem?

    Instead of allowing multiple class inheritance, languages like Java and C# allow a class to implement multiple Interfaces simultaneously. Since interfaces traditionally contain only abstract method declarations without bodies, the subclass implements the final logic, avoiding any source code ambiguity.

23. ### What is an Abstract Class?

    An abstract class is a class declared with the abstract keyword. It cannot be directly instantiated using the new keyword. It can contain both abstract methods (methods without a body) and concrete methods (methods with full implementation details).

24. ### What is an Interface?

    An interface is a blueprint of a class that contains only abstract method signatures (without implementations). It acts as a strict contract; any concrete Class that implements an interface must provide the code block implementation for all of its declared methods.

25. ### Provide a detailed comparison between an Abstract Class and an Interface.

    FeatureAbstract ClassInterfaceInheritanceA class can extend only 1 abstract class.A class can implement multiple interfaces.MethodsCan have both abstract and concrete methods.Methods are implicitly abstract (except for default/static methods in newer versions).VariablesCan contain all types of variables (private, protected, instance, static, final).Variables are implicitly public static final (constants).IntentDefines identity / core nature (X is a Y).Defines capabilities / peripheral behaviors (X can do Y).

26. ### What is the concept behind "Upcasting" and "Downcasting"?

    Upcasting: Casting a child object reference to a parent class reference (always safe and performed implicitly).Downcasting: Casting a parent class reference back to a child class type. This is unsafe because the parent object might not actually be an instance of that specific child, requiring explicit casting and safety checks (like using instanceof) to avoid runtime errors.

27. ### What is a Pure Virtual Function?

    This is a term used in C++ that corresponds to an Abstract Method in Java. It is a function declared in a base class that has no implementation details and forces all derived child classes to override and implement it.

28. ### What is the effect of placing the final keyword (Java) or sealed keyword (C#) before a Class?

    It prevents the class from being inherited. No other class can extend a final class or sealed class. (e.g., the String class in Java is final to guarantee immutability and security).

29. ### What happens if you place the final keyword before a method?

    Subclasses inheriting from this class cannot override that method. It is used to lock a specific algorithm or logic defined by the parent class.

30. ### What is "Shadowing" (or Member Hiding) in inheritance?

    Shadowing occurs when a subclass defines an attribute or static method with the exact same name as one in the parent class, without overriding it. The subclass version hides (shadows) the parent class version within the scope of the subclass.

## Section 3: Memory Management & Advanced Mechanisms (Questions 31 - 40)



31. ### Where are OOP objects stored: Heap or Stack?

    The actual object data (including its instance variables) is always allocated on the Heap memory. Meanwhile, the reference variable (the variable name used to point to that object) is allocated on the Stack memory.

32. ### When does a Memory Leak occur in an OOP language?

    It occurs when objects that are no longer needed by the application are still referenced by active pointers, preventing the Garbage Collector from freeing their memory on the Heap. Over time, this consumes available system memory and leads to an OutOfMemoryError.

33. ### What is the difference between "Shallow Copy" and "Deep Copy"?

    Shallow Copy: Creates a new object, but copies references to the nested object attributes. Modifying the internal nested data in the new object will affect the original object.Deep Copy: Creates a completely independent copy of both the parent object and all nested child objects inside it, allocating entirely new memory addresses.

34. ### What is an Inner Class (or Nested Class) and why use it?

    An inner class is a class defined inside another enclosing class. It is used to logically group classes that are only used in one place, increasing encapsulation and making the codebase cleaner because the inner class can access private members of its outer class.

35. ### What is an Anonymous Class?

    An anonymous class is an inner class without a name that is defined and instantiated simultaneously in place. It is typically used when you need a one-time-use object to implement an interface or extend a class without creating a separate dedicated file.

36. ### How does Garbage Collection (GC) determine if an object is "dead"?

    GC uses algorithms like Reference Counting or Reachability Analysis starting from defined Root nodes. If an object cannot be reached by any path of references originating from a root node, it is deemed unreachable (dead) and eligible for destruction.

37. ### Why is "Composition" preferred over "Inheritance"?

    A common design maxim states: "Favor composition over inheritance". Inheritance introduces tight coupling (White-box reuse); changes in a superclass can break subclasses. Composition (combining independent objects via interfaces) provides Loose Coupling, making the system flexible and allowing behaviors to be swapped dynamically at runtime without breaking structural integrity.

38. ### Differentiate between Aggregation and Composition.

    Both model a "HAS-A" relationship, but:Aggregation: Implies a loose relationship with independent lifecycles. If the parent is destroyed, the child entity can still exist. (Example: Department and Professor. If the Department closes, the Professor survives).Composition: Implies a strict, lifecycle-dependent relationship. If the parent entity is destroyed, the child entity is wiped out too. (Example: House and Room. If the House is demolished, the Rooms cease to exist).

39. ### What does the this keyword represent?

    The this keyword refers to the current object instance executing the method or constructor. It is most commonly used to resolve ambiguities when method parameters share the same names as class attributes.

40. ### What is Constructor Chaining?

    Constructor Chaining is a technique where a constructor calls another constructor within the same class (using this()) or calls a constructor of the superclass (using super()). This eliminates code duplication during data initialization.

## Section 4: SOLID Principles & System Design (Questions 41 - 50)



41. ### What are the SOLID Principles?

    SOLID is a set of 5 object-oriented design principles aimed at making software systems more understandable, maintainable, extendable, and flexible:Single Responsibility Principle.Open/Closed Principle.Liskov Substitution Principle.Interface Segregation Principle.Dependency Inversion Principle.

42. ### Explain the Single Responsibility Principle (SRP) and provide an example.

    A class should have only one reason to change, meaning it should have only one job or responsibility.Violation: A User class containing user details, database connection logic, and a method to dispatch notification emails.Correction: Split it into a User entity class, a UserRepository class for database interactions, and an EmailService class for notifications.

43. ### Explain the Open/Closed Principle (OCP).

    Software entities (classes, modules) should be open for extension but closed for modification. Instead of changing the source code of an existing method to add new logic, you should use abstraction and polymorphism to extend the class behavior by writing new code.

44. ### Explain the Liskov Substitution Principle (LSP).

    Objects of a superclass should be replaceable with objects of its subclasses without altering the correctness of the program. If a subclass inherits from a parent but turns off or breaks its core functionality (e.g., an Ostrich class inherits a Bird class but throws an exception on fly()), it violates LSP.

45. ### Explain the Interface Segregation Principle (ISP).

    A client should never be forced to depend on methods it does not use. Instead of creating one large monolithic interface, split it into multiple smaller, highly specific interfaces so implementing classes only care about methods relevant to them.

46. ### Explain the Dependency Inversion Principle (DIP).

    1. High-level modules should not depend on low-level modules. Both should depend on abstractions (interfaces).2. Abstractions should not depend on details; details should depend on abstractions.

47. ### What are "Coupling" and "Cohesion"? What is an ideal design?

    Coupling: The degree of interdependence between different classes. Good design requires Low Coupling (loose dependencies) so changes to one class don't break others.Cohesion: How focused and dedicated the methods inside a single class are to a single purpose. Good design requires High Cohesion (highly focused responsibilities).Summary: An optimal OOP architecture strives for Loose Coupling & High Cohesion.

48. ### What is the difference between Object-Oriented Programming and Object-Based Programming?

    Object-Based languages support encapsulation and the consumption of objects, but do not natively support inheritance and polymorphism (e.g., legacy JavaScript before ES6). A true OOP language (like Java, C++, C#) must fully support all 4 core pillars.

49. ### How can you prevent an object from being Cloned in Java?

    Do not implement the Cloneable interface, and explicitly override the clone() method to throw a CloneNotSupportedException.

50. ### How do you design a Class using the "Singleton Pattern" using OOP?

    The Singleton pattern ensures a class has only one instance throughout the application lifecycle. Implementation steps:Set the class constructor to private to prevent external initialization via new.Create a private static instance variable of that class within itself to hold the unique object.Expose a public static method (commonly called getInstance()) that returns the single managed instance.

