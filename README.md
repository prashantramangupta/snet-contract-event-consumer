[![CircleCI](https://circleci.com/gh/singnet/snet-cli.svg?style=svg)](https://circleci.com/gh/singnet/snet-contract-event-consumer )	

## Getting Started  	
#### SingularityNET Contract Event Consumer  	
The consumer reads events from the registry and MPE contracts and records it on a persistent store which is used to build the index needed for other services.	
This repo is under active development and will see significant changes soon. As such this should be treated as a beta.	

### Development	
These instructions are intended to facilitate the development and testing of SingularityNET Contract Event Consumer.	

### Prerequisites	

* [node 8.10.0+](https://nodejs.org/en/download/)	
* [npm 3.5.2+](#)	
* Additionally you should install the following dependency package present in package.json.	

### Installation	
If you use Ubuntu (or any Linux distribution with APT package support) you should do the following:	

#### Clone the git repository	
```bash	
$ git clone git@github.com:singnet/snet-contract-event-consumer.git	
$ cd snet-contract-event-consumer	
```	

#### Install snet-contract-event-consumer dependency using npm	
```bash	
$ npm install	
```	
#### Environment variables	
Provide following Database details in config.js	

|key|value|	
|-----|-----|	
|host||	
|username||	
|password||	
|database||	
|port||	

Provide following IPFS details in config.js	

|key|value|	
|-----|-----|	
|url||	
|port||	
|protocol||	

Provide following Network details in config.js	

|key|value|	
|-----|-----|	
|name||	
|infura_ws||	