# Travnas Sync

A collection of webapps to help me and my family manage data on my NAS

# server

The server folder is what will be running on the NAS, it has the following responsibilities

- Serve static content (html, js, css)
- Store state (sqlite)
- Execute commands on the server (bash, sftp etc)

# client

The client folder contains the react app that is the user interface. It can be run from its folder in dev mode, however when running on the NAS the react app will be built into a bundle of static content files which are served from the server.


# pre-requisites

* bun 1.3.6 https://bun.com/docs/installation
* docker https://docs.docker.com/desktop/ (though if you're on linux you probably have better options) 

# execution

To build the docker container `bun run build.ts` from the project root.

To set up environment and compose:
```
cp .env.example .env
cp docker-compose.yml.example docker-compose.yml
```

modify both files to reference your own username, remote server, paths etc. then:

```
docker compose up
```

That will start two containers.  One has the client and server at http://localhost:3000 the other has a queue worker that will do the downloading.