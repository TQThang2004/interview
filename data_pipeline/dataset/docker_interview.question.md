1. ### What is Docker?

    Docker is an open-source platform for containerization. It allows developers to package an application and its dependencies into a lightweight, portable container that can run reliably across different computing environments.

2. ### What is the difference between a Docker container and a virtual machine (VM)?

    A VM includes a full OS and runs on a hypervisor, which consumes more resources. A Docker container shares the host OS kernel, is more lightweight, and starts much faster. Containers provide process-level isolation rather than hardware-level.

3. ### What is a Docker image?

    A Docker image is a read-only template that contains a filesystem snapshot, executable code, libraries, and dependencies needed to run an application. Images are used to create containers.

4. ### What is a Docker container?

    A container is a runnable instance of an image. It includes a runtime environment, file system, environment variables, and execution commands, isolated from other containers.

5. ### What is Docker Hub (or Docker Registry)?

    Docker Hub is a public registry for Docker images. It allows users to push, pull, and share images. A Docker registry more generally is a service that stores and distributes container images.

6. ### Explain the high-level architecture of Docker.

    Docker architecture includes the Docker client, Docker daemon (dockerd), Docker objects (images, containers, volumes, networks), and a registry. The client sends commands to the daemon, which builds, runs, and manages containers.

7. ### What is a Dockerfile?

    A Dockerfile is a text file that contains instructions to build a Docker image. It defines base image, copies files, sets environment variables, runs commands, and sets the container's entrypoint or CMD.

8. ### What is the difference between COPY and ADD in a Dockerfile?

    COPY is used to copy files or directories from the build context into the image. ADD can do the same plus additional things: it can unpack local tar archives and also fetch remote URLs — but using ADD for remote URLs is often discouraged due to unpredictability.

9. ### What is the difference between CMD and ENTRYPOINT?

    CMD provides default arguments for the container's run command but can be overridden when you run the container. ENTRYPOINT sets the command that will always be executed, and you can pass arguments to it. Combining both allows flexibility.

10. ### What is multi-stage build in Docker? Why is it useful?

    Multi-stage build uses multiple FROM statements in a single Dockerfile. One stage can build (compile) the application, another stage can produce the final runtime image. This results in a smaller final image and avoids shipping development dependencies.

11. ### How do you pass environment variables into a Docker container?

    You can pass env vars with docker run -e KEY=VALUE, or use --env-file to pass a file containing many environment variables.

12. ### What is a Docker volume? Why do you use it?

    A volume is a persistent storage mechanism managed by Docker. It allows data to persist beyond the lifecycle of a container. You use volumes to store databases, logs, or any stateful data outside the container's transient filesystem.

13. ### What types of Docker storage mechanisms are there?

    There are named volumes, anonymous volumes, bind mounts (mounting host directories), and tmpfs mounts.

14. ### Where are Docker volumes stored on the host?

    On Linux, Docker volumes are typically stored under /var/lib/docker/volumes.

15. ### How can a container lose data when it is removed?

    If the container uses only the container's writable layer (no volume or bind mount), when the container is deleted, all changes in the layer are gone. That's why persistent storage (volumes) is necessary.

16. ### What is Docker networking?

    Docker networking defines how containers communicate with each other and with the outside world. Docker supports several network drivers: bridge, host, overlay, none, and macvlan.

17. ### Explain Docker namespaces and how they help.

    Namespaces are Linux primitives that isolate containers' processes, network, mount points, PID, and user. They ensure each container has its own isolated environment even though they share the same kernel.

18. ### How does Docker isolate system resources (CPU, memory, I/O) per container?

    Docker uses cgroups (control groups) to limit and control how much CPU, memory, and I/O a container can use.

19. ### What is Docker Swarm, and how does it compare to Kubernetes?

    Docker Swarm is Docker's native orchestration tool. It supports clustering, service discovery, and scaling. Kubernetes is a more powerful and feature-rich orchestration system with a broader ecosystem, but it's more complex.

20. ### What is Docker Machine?

    Docker Machine is a tool for provisioning and managing Docker hosts on local or cloud environments (e.g., VirtualBox, AWS). It helps create Docker-ready VMs automatically.

21. ### What is Docker Compose?

    Docker Compose is a tool to define and run multi-container Docker applications using a YAML file (docker-compose.yml). It defines services, networks, volumes, and their relationships.

22. ### What is the difference between docker-compose up, docker-compose run, and docker-compose start?

    docker-compose up: creates, (re)creates, starts, and attaches to containers for a service.
    docker-compose run: runs a one-off command (like bash) in a new container for a service.
    docker-compose start: starts existing containers but does not rebuild or recreate them.

23. ### How do you export and import a Docker image?

    Use docker save -o image.tar image_name to export, and docker load -i image.tar to import on another host.

24. ### How can you check logs of a running Docker container?

    Use docker logs <container_id_or_name> to view the container's stdout and stderr.

25. ### Can Docker containers auto-restart? How?

    Yes. Use --restart policies when running: no (default), on-failure, always, unless-stopped.
    
26. ### Describe the lifecycle of a Docker container.

    The lifecycle: Create (container created but not started), Start (running), Pause (suspended), Stop (graceful shutdown), Kill (force stop), Remove (container deleted).

27. ### What is Docker Engine?

    Docker Engine is the runtime that builds and runs containers. It includes the Docker daemon, REST API, and CLI.

28. ### How do you optimize Docker image size?

    Use multi-stage builds, choose minimal base images (like alpine), combine RUN commands to reduce number of layers, remove cache/temp files in build, and .dockerignore to exclude unnecessary files.

29. ### What is Docker Content Trust (DCT)?

    Docker Content Trust enables image signing and verification, so you can ensure images are from a trusted source and haven't been tampered with.

30. ### What is HEALTHCHECK in Docker?

    HEALTHCHECK in a Dockerfile defines a command that Docker will run inside the container at intervals to check if the container is healthy. If the check fails, Docker can mark the container as unhealthy.

31. ### How do you monitor Docker containers in production?

    Options: docker stats for live resource usage, docker events for event stream, or using tools like cAdvisor + Prometheus + Grafana, ELK stack, or container-native monitoring solutions.

32. ### How can you secure Docker containers?

    Use namespaces, cgroups, drop unnecessary capabilities, use user namespaces, scan images for vulnerabilities, sign images, and run containers with least privilege.

33. ### What is the difference between daemon logging and container logging?

    Container logging is the logs generated by processes in the container (stdout/stderr). Daemon logging is the Docker engine's own logs (events, errors) about managing containers, images, and network.

34. ### Can you use JSON instead of YAML for a Docker Compose file?

    Yes, the Compose specification supports both YAML and JSON, though YAML is more commonly used and more readable.

35. ### How do you scale a Docker service?

    In Docker Swarm, you can scale services using docker service scale <service_name>=<replica_count>. In Compose v3 (with Swarm mode), you can also set replicas in your docker-compose.yml.

36. ### What challenges might you face when using Docker in a large-scale environment?

    Challenges include image sprawl, container orchestration (networking, scaling), persistent storage, security, logging/monitoring, data management, and CI/CD integration.

37. ### How does Docker integrate with CI/CD pipelines?

    Docker images can be built in CI (e.g., Jenkins, GitHub Actions), tested in containers, and then pushed to a registry. In CD, orchestration tools (like Swarm, Kubernetes, ECS) pull the images and deploy them.

38. ### What is an overlay network in Docker? When do you use it?

    An overlay network allows containers on different Docker hosts to communicate securely as if they were on the same network. This is useful in clustered or swarm environments.

39. ### When should you not use Docker?

    Situations where Docker might not be ideal: extremely latency-sensitive applications, very small/simple scripts where container overhead is not justifiable, or when you need full kernel-level customization that containers can't provide.

40. ### What are best practices when writing a Dockerfile?

    Use small base images, multi-stage builds, minimize number of layers, clean up after install (remove cache), use .dockerignore, avoid running as root, and make sure your image is secure (scan and sign).

