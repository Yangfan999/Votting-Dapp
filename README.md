# APS1050 FINAL PROJECT DEV ENV SETUP GUIDE

## Required versions
Node.js version: v14.18.0
lite-server version: -
Solidity version: v0.5.16 (solc-js)
web3 version: v1.5.3
Truffle version: v5.4.24 (core: 5.4.24)
Ganache version: v2.5.4

## Steps to start dev environment

1. Start `Ganache`, config server hostname to `172.0.0.1`, port number to `8545` and network id to `5777`.
2. Start `truffle` by `truffle develop` in project directory, make sure port number in `truffle-config.js` is also `8545`.
3. Start react server by `npm start` in project/client directory, the website should open by itself, if it doesn't, open `http://localhost:3000`.
4. Config network on `Metamask`, Settings -> Networks -> Add Network: \
Network Name: test d vote \
New RPC URL: `http://127.0.0.1:8545` \
Chain ID 1337 \
Click `Save`
5. Import wallet to `Metamask`, copy account private key from `Ganache`, open `Metamask`, click import account, paste private key, click import.
6. Now you can start using the APP.
