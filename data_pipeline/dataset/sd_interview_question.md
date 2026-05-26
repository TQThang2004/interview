1. ### How would you design a parking lot?

    This question is one of the most common questions in a system design interview. The interviewer would like to hear the following points:
    
    Capacity
    
    Always consider the capacity of the parking lot before designing it. How many levels would it have? Also, what is the plan in case the parking lot becomes full?
    
    Types of vehicles
    
    The allocation of various parking areas for different vehicles is also to be justified.
    
    Flexibility of payment
    
    Different modes of payment such as cash, credit, and other online methods should be accepted. There should be different points where customers can pay.
    
    Pricing
    
    Pricing should be handled well. Covering this aspect is very necessary. Pricing can be accommodated according to hourly rates.
    

2. ### How do you design a mass social media platform?

    The aim of designing a mass social media platform such as Instagram, Facebook, and Twitter is to design a platform that enables its users to view a newsfeed with posts.
    
    The basic features required by the social media service are stated below:
    
    Users can make public as well as private posts.
    The option of commenting and liking a post is available to the users.
    It should accommodate multiple users at once.
    There should be a newsfeed and recommendation system.
    Privacy controls are also to be taken care of.
    Trending posts/tweets are supposed to be visible.
    The tools which are useful in the designing of the mass social media platform are as follows:
    
    To maximize the availability, rolling updates and replica nodes can be utilized.
    To recommend posts and news feeds, a trained machine learning algorithm can be used.
    A database schema can be created to store celebrities and some users separately.
    Some habits can be tracked using a social graph.

3. ### Design a global chat service.

    We need to design a service that enables users to chat with each other over a global platform. The form of conversations can be either one-to-one or group chats.
    
    Following are the required features of the chat service:
    
    The chat service must allow the transfer of media such as photos, videos, stickers, and GIFs.
    The sent message should be encrypted during transit and should be stored for later viewing.
    The chat service should support one-to-one as well as group chats.
    Following is the list of tools that can be considered while designing a chat service:
    
    The database schema can be split into multiple tables, namely a user table, a chat table, and a message table.
    For bi-directional connections between the device and the server, WebSocket can be used.
    Push Notifications are also a great tool to notify users even if they are offline.

4. ### How would you design Netflix?

    To design a video streaming service like Netflix, the main idea to keep in focus is that Netflix should be able to store and transmit video data.
    
    Basic features that are expected off of Netflix are listed down below:
    
    It should be able to upload videos on the internet.
    Uninterrupted video streaming should be available to the users.
    Other features such as comments and likes are also necessary.
    It should also support high traffic of multiple users.
    Following tools help design Netflix:
    
    Cloud technology can be used for storing and transmitting video data.
    To recommend new video-related content, Machine Learning can be used.
    Components in the designing of Netflix:
    
    OC – Content Delivery Network
    Backend – Database
    Client – Device to assess Netflix

5. ### How do you design a Tic-Tac-Toe game?

    Tic-tac-toe is a game that is meant to be played between two players. Here, one player is the computer itself. The rules of the game are simple. A player chooses ‘O’, and the other player chooses ‘X’ to mark their cells. If a player can fill a row, column, or diagonal of cells with their chosen character, the player wins.
    
    tic-tac-toe-game
    
    The implementation of the design can be done by using the rand() function, as the moves taken by the computer are completely random. This program can be updated so as the players play optimally.
    

6. ### Design a URL shortening service.

    A URL shortening service serves the dual purpose of:
    
    Generation of a unique short URL from a long URL
    Return of the shortened URL to its original form
    The required features of the URL shortening service are:
    
    The URL shortening service must return a URL that is shorter than the original URL.
    Redirects should be allowed by the shortened URL.
    The shortened URL must store the original URL.
    The shortened URL should be able to link to the original one.
    Following is a list of tools that can be considered while designing a URL shortening service:
    
    Multiple requests at once can be handled by the use of multithreading.
    To balance high traffic, REST API can be used. It will also help to handle front-end client communication.
    Hashing can be used to link old and new URLs.

## High-Level System Design Interview Questions and Answers

7. ### How would you design Uber?

    The architecture of Uber is monolithic or microservices.
    
    Following are the aspects to cover:
    
    Uber talks to the backend over the user’s mobile data.
    Location data drives the dispatch system.
    Maps and routes in Uber are to be considered as well.
    Appropriate storage is required for multiple geographical locations.
    Node.js can be used to build the dispatch.
    The business logic services can be written in python.
    Databases: Redis, Postgres, MySQL

8. ### Design an API Rate Limiter.

    The job of an AP Rate Limiter is to limit the number of API calls a particular service like Firebase can receive over a period to avoid overload.
    
    Following features are necessary to design an API Rate Limiter:
    
    The Limiter should notify the user if their request is denied.
    Devices are limited to a particular number of requests on an hourly basis.
    Following tools can help design an API Rate Limiter:
    
    Sliding time windows can be used to avoid hourly resets.
    Instead of saving space, a counter integer can be saved.

9. ### Design global file storage and sharing service.

    To design global file storage and sharing service, an asynchronous, cross-platform storage system is required in which users can store files and photos and assess them through multiple devices.
    
    The features necessary for designing the global file storage and sharing service are as follows:
    
    Old versions of the documents can be saved to rollback.
    All the files should be updated across devices in sync.
    Users can save, share, delete, and update files and photos over the internet.
    Tools that may help design the service are as follows:
    
    Chunking can be used to divide files into multiple sections.
    To handle internal databases, cloud storage can be used.
    Updates are to be kept in check.

10. ### How do you design a web crawler?

    A web crawler service collects information/crawl from the entire internet and fetches millions of web documents.
    
    Things to keep in mind while designing a web crawler are:
    
    The approach is taken to find new web pages
    The approach to prioritize web pages that can change in a dynamic way
    To ensure that the web crawler service is bounded on the same domain

11. ### Design Quora.

    Quora is a social network and message board service in which users can post links and questions. Users can also comment on the questions. Related questions and topics should also be accessible to the user.
    
    Features to include in the design of Quora are:
    
    Users can make posts with tags.
    The comment section to every post must be included.
    The app should support high traffic of posts and viewers.
    The list of tools that might help in the design of Quora is as follows:
    
    An SQL database can be used to map the relational data.
    Sharding can be used to break up the system.
    Multithreading and load balancer can be used to help support the high traffic.
    Machine learning can be used to find correlations between relations between tags.

12. ### Design a traffic control system.

    This question is one of the classic questions asked in a system design interview. The only aspect to cover here is the transition from RED to GREEN, etc.
    

## Object-Oriented System Design Interview Questions and Answers

13. ### What is encapsulation?

    In visual terms, we can say that encapsulation is the technique of inserting all the resources required to fulfil the job inside a capsule, which is further given to the user. All the unnecessary data is hidden to a regular user, and the required data is bound together.
    
    encapsulation
    

14. ### Differentiate between compile time polymorphism and runtime polymorphism.

    Compile Time Polymorphism	Runtime Polymorphism
    A. It is also called Static Polymorphism.
    B. This type of polymorphism happens at the compile time.
    C. The compiler gets to decide the shape or value that has to be taken by the entity in the photograph.	A. It is also called Dynamic Polymorphism.
    B. This type of polymorphism happens at the run time.
    C. Here, the shape or value that has to be taken by the entity in the picture is not decided by the compiler.

15. ### Name different types of constructors in C++.

    There are three types of constructors in C++, which are as follows:
    
    Default Constructors: It does not take any argument and has zero parameters.
    Parameterized Constructors: These types of constructors take some argument.
    Copy Constructors: It is a member function, and its basic function is to initialize the object using another object of the same class.

16. ### Can a Java application be created without implementing the OOPs concept?

    A Java application cannot be created without implementing the OOPs concept. Java applications are completely based on the Object-oriented programming concept.
    
    types of inheritance

17. ### What are the limitations of inheritance?

    Following are the limitations of inheritance:
    
    It is time-consuming because it needs to navigate through multiple classes for implementation.
    The child class and the base class are tightly packed, which makes it difficult to make changes.
    It is complex when it comes to implementation, which may result in errors if not implemented correctly.

18. ### What feature allows one class to derive features from another class?

    The Inheritance feature allows one class to derive features from another class.
    

19. ### Which language was the first language to be developed as a purely object-oriented programming language?

    Smalltalk was the first programming language to be developed as a purely object-oriented programming language.
    

20. ### Which is an OOPs language but does not support all inheritance types?

    Java is an OOPS programming language, but it does not support all inheritance types.
    

21. ### Name different types of Operating Systems. Also, mention one disadvantage of each type.

    There are five types of Operating Systems, which are as follows:
    
    Real-Time Operating System
    
    This kind of OS is used while dealing with real-time data. As soon as the data arrives, the execution of the process should be done without any delay. Its main disadvantage is the complexity of the algorithms used.
    
    Embedded Operating System
    
    Embedded operating systems are used to perform certain tasks for a specific device (not a computer). For example, the embedded OS is used for the functioning of the lift system. The disadvantage of the embedded operating system is that only one task can be performed.
    
    Time-Sharing Operating System
    
    It is also called a Multitasking Operating System. Multiple processes are performed at the same time. Its disadvantage is that prioritized tasks are not performed first. All tasks are given equal priority.
    
    Batch Operating System
    
    Similar tasks are grouped into batches, and the batches are executed one by one. The disadvantage of this type of Operating System is the manual intervention required between two batches.
    
    Distributed Operating System
    
    As the name suggests, the distributed operating system has different systems having their individual
    
    CPU, memory, and other resources. Its main disadvantage is that extra effort is required for the security of data due to shared data.
    

22. ### Define RAID?

    RAID stands for a redundant array of independent disks. RAID is the technology that specializes in data storage that combines various physical disk drive components within one or numerous logical units as data redundancy and performance improvement.
    

23. ### State the meaning of IPC along with different IPC mechanisms.

    IPC stands for Inter-Process Communication. It is a mechanism that needs the use of elements that are shared between threads or processes. In simpler terms, IPC is used to share data across various threads. Following are the various IPC mechanisms:
    
    Message queuing
    Shared Memory
    Semaphores
    Sockets
    Signals

24. ### List 5 examples of OS.

    A few examples of Operating Systems are listed below:
    
    Mac Operating System
    MS-Windows
    Android
    Chrome Operating System
    Free BSD

25. ### What is a process, and what are its different states?

    A process is nothing but a program that is being executed. One of the main functions of an Operating System is to supervise the processes. A process can be divided into the following sections:
    
    Stack
    Heap
    Text
    Data
    A process goes through various stages, which are:
    
    New state: It marks the beginning of the process.
    Running: The instructions of the process are followed by the CPU.
    Waiting: The process is at a momentary pause as it waits for an event to occur.
    Ready: At this stage, a process is waiting to get assigned by a processor even though it has all available resources to run.
    Terminate: The process has ended when it reaches this state.

26. ### What are the prerequisite requirements to achieve a deadlock?

    In an OS, a deadlock happens when a process enters a state of pause because a requested system resource is held by another waiting system, which in turn is waiting for another resource held by another waiting process, and so on.
    
    Following are the necessary conditions to achieve a deadlock:
    
    Mutual Exclusion
    Hold and Wait
    No Preemption
    Circular Wait

27. ### Explain fragmentation and state types of fragmentation that take place in the operating system?

    The process of fragmentation decreases the capacity and performance because space has been used inefficiently.
    
    In an operating system, two types of fragmentation take place:
    
    Internal fragmentation: This type of fragmentation occurs when those systems which have fixed size allocation units are dealt with.
    External fragmentation: External fragmentation occurs when we deal with systems that have variable-size allocation units.

28. ### What is starvation and aging in the Operating System?

    When a process has not been able to acquire the resources it requires for progress with its execution for an extended period, this situation is referred to as starvation.
    
    Aging, on the other hand, is the solution to starvation. The technique of aging increases the priority of certain processes that are waiting for resources for a long period.

