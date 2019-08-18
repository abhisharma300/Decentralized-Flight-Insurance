# FlightSurety: Flight Delay Insurance DAPP

## Concept:
This is a decentralized implementation of flight delay insurance. 
It consists of smart contract on Ethereum coupled with Oracles to provide auto claim disbursal to passengers in case of delay.

### Below are the key attributes

a. Managed as collaboration between multiple airlines

b. Passengers can purchase insurance prior to a Flight

c. If the flight is delayed to airline Fault, passengers are paid the 1.5 times the amount paid for insurance

d. Oracles provide flight status information into Smart Contract


### Architecture: is divided into on-chain & off-chain as below: 
a. Smart Contracts: are split into following :
  - App Contract (Upgradable Business Logic)
  - Data Contract (Captures Persistent d data structures for Airline, Flight, Passenger & Insurance details.

b. Oracle: server application which will provide flight status to smart contract

c. DAPP Client


![Screenshot](Images/Architecture.png)
## Actors

### Airline
Data structure for Airlines is defined in Data Contract. The first airline is registered & funded during deployment of the contract through constructor. The 1st truffle ganache account is used for the deployment of the smart contracts and is the contract owner.
Further airlines can be registered through DAPP. The 1st truffle ganache account is used to add the initial airline

Below business rules are implemented for Registering of New Airlines:

1. Only Existing Airline can register a new Airline until there are atleast 4 airlines registered.
2. Multi Party Consensus: Registration of Fifth & subsequent Airline requires multi-party consensus of 50% of registered airlines

![Screenshot](Images/Register-Airline.png)

### Flight
Flight ID's are hard coded as: "901,902,903"
Flight Time are hard coded as: "1300,1400,1500"


### Purchase Insurance
*  A passenger can buy insurance by selecting the flight id & Flight schedule.
*  A passenger needs to pay upto 1 ether to buy insurance
*  Event is emitted by the contract on successful execution of purchase insurance


![Screenshot](Images/Purchase-Insurance-Invocation.png)
![Screenshot](Images/Purchase-Insurance-Result.png)


### Oracles 
Oracles are used to provide flight status information (i.e. external data ) into smart contract. Oracles are implemented as server application. Multiple oralces are registred with Smart Contract to decentralize trust. 

**Register Oracle**
10+ oracles are initiated at project start-up and register with App Smart Contract by paying fee of 1 ether. Each Oracle that is registered is assigned a set of 3 indexes by the Smart Contract. 

The registered Oracles watch for the OracleRequest event and respond based on at least one match of their index to the request's index values. Once registered via the Oracle server simulator you can use the DApp UI to trigger the request for flight status information. 

![Screenshot](Images/Registered-Oracles.png)



Flight Status Request Event: is trigerred through DAPP UI, interacts with smart contract and generates request to Oracle to fetch flight status. In real tme scenario, it would be an API notifying the oracle for delay in flight.

After consensus is acheived on Flight Status by two oracles, the request is closed. If the Status of the flight is delayed , then all passengers who had purchased the insurance for the flight
are marked as "Eligible for Payout


### Check Claim Status

The passengers, who had purchased insurance for the flight which got delayed based on response of flight status have been marked for payout. The status of their Claim can be check through DAPP, with button "Check Claim Applicable"


### Withdrawl

The passengers, who had been marked as eligible for Payout can withdraw claim amount to their wallet. This can be done by clicking on button "Withdraw Claim"
This method will transfer "1.5" ether to passenger account and reset passenger status to "Not eligible for payout"







## Install

Change directory to the ```flight-surety``` folder and install all requisite npm packages (as listed in ```package.json```):''

```
cd flight-surety
npm install

compile and deploy on local ganache

truffle migrate --reset
```


versions:
Truffle v4.1.15 (core: 4.1.15)

Node Version
v10.15.3

Solidity v0.4.25 (solc-js)


### Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp`



