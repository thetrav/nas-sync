# Travnas Sync

A collection of webapps to help me and my family manage data on my NAS

# server

The server folder is what will be running on the NAS, it has the following responsibilities

- Serve static content (html, js, css)
- Store state (sqlite)
- Execute commands on the server (bash, sftp etc)

# client

The client folder contains the react app that is the user interface. It can be run from its folder in dev mode, however when running on the NAS the react app will be built into a bundle of static content files which are served from the server.
