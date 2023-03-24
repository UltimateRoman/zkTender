# zkTender

Sealed-bid e-tendering system using Blockchain and Zero-knowledge proofs (ZKP).

## Setup

Note: Use WSL or a Linux distro.

### Clone the repository

```
$ git clone https://github.com/UltimateRoman/zkTender.git
```

### Install dependencies

```
$ cd zkTender
$ npm i
$ npm run setup:circom
```

### Compile circuits and contracts

```
$ npm run compile:circuits
$ npm run compile:contracts
```

#### Fix solidity version of verifier smart contract

```
$ npm run version:fix
```

#### Add .env file

Create a .env file in /packages/hardhat directory based on [.env.example](https://github.com/UltimateRoman/zkTender/blob/main/packages/hardhat/.env.example)

### Deploy contracts

(Deploy locally)

```
$ npm run deploy:local
```

(or to Polygon Mumbai Testnet)

```
$ npm run deploy:mumbai
```

### Start the backend API

```
$ npm run start:api
```

#### Add .env.local file

Create a .env.local file in /packages/next-app directory based on [.env.local.example](https://github.com/UltimateRoman/zkTender/blob/main/packages/next-app/.env.local.example)

### Run the frontend application

```
$ npm run dev
```

Visit localhost:3000 in your web browser.
