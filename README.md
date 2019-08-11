# FlightSurety
This is a decentralized implementation of flight insurance. It consisits of smart contracts and oracles to provide auto claim disbursal to passengers in case of delay.

## Actors
There are following actors in this implementation:
Smart Contract: is split into APP Contract and Data Contract. The data contract captures the data structures for Airline & Insurance details.
	Airline
	Flight
	Passenger
Oracle:

## Airline
The first airline is registered in the constructor of the APP Contract.The address of the first airline will be APP Contract Owners

*  Only registered airline can register a new airline 
(This can be tested through truffle test)
"Only Existing Airline can register new airline, if total airline less than 4"

In this test, 
a. Since the first airline is registered through constructor.
b. We register the second airline through first airline (which is Existing Registered Airline). 
c. This test demonstrates the same. As the count of registered airline is less than '4'. The test demonstrates it successfully.

Reference;
(images/Truffle-Test-FightSurety.png)


*  After registration of 4 airlines it requires that 50% of registered airlines have voted for registration of new airline

(This can be tested through truffle test)
"50 % of registered airline must vote to register new airline if, registered airline exceed 4"

In this test,
a. First we register the Third and Fourth Airline to reach the airline count of "4".
b. To register the Fifth airline, we require '50 % votes" i.e. "3" votes. 
c. To rgister the Fifth airline, we invoke the registration method method through '3' existing registered airlines which records their votes
d. After third vote (50%) of existing airlines, the fifth airline is registered.

Reference;
(images/Truffle-Test-FightSurety.png)

** Airline can also be registered through DAPP UI, but multi-party consensus can be tested only through truffle test
Reference:
(images/Register-Airline.png)



*   Airline can be registered, but does not participate in contract until it submits funding of 3 ether (reduced from 10 to 3) due to gas constraints

This can be tested through truffle test, and through DAPP UI)

In this test,
a. We fund the Fifth airline by invoking Fund method and then retrieve the funding status of the airline from block-chain

Or we can invoke the method through DAPP UI

Reference:
(images/Fund-Airline-Invocation.png)
(images/Fund-Airline-Result.png)


## Flight
*  Flight registration is not mandatory to implement
*  Hence, flight have been hardcoded in DAPP Client
Flight ID's are hard coded as:
"901,902,903"
Flight Time are hard coded as:
"1300,1400,1500"


## Buy Insurance
*  A passenger can buy insurance by selecting the flight id & Flight schedule.
*  A passenger needs to pay upto 1 ether to buy insurance

This can be tested through DAPP:
The user needs to enter Passenger Address, Select flight time, flight id. Insurance cost as "1" ether is hardcoded on DAPP Client 

Reference:
(images/Purchase-Insurance-Invocation.png)
(images/Purchase-Insurance-Result.png)


## Oracles 
The FlightSurety DApp start "10" Oracle by registering with smart contract. The oracles are reduced to "10" due to gas constraints
The registered Oracles watch for the OracleRequest event and respond based on at least one match of their index to the request's index values. 
After at least two of the same responses are received by the FlightSuretyApp contract, the request is accepted as the flight status and the request is closed. 
To trigger the Oracle flight status request, click on the Submit to Oracles button. 

When it's determined via the Oracles that a flight is delayed, the FlightSuretyApp contract will automatically go through the list of insured passengers for the flight and will mark them as "Eligible For Payout".


The passenger is then able to initiate the payout withdrawal to transfer the funds to their account or wallet address. 

Reference:
(images/Registered-Oracles.png)


## Check Flight Status

This can be tested through DAPP:
The user needs to enter Airline Address, Select flight time, flight id and click on "Submit to Oracles" 

Since, we have reduced the oracles to "10" and if there is not match between index of the request and registered oracles. 
In that case, we may have to perfrom this step multipe time.

After consensus is acheived on Flight Status by two oracles, the request is closed. If the Status of the flight is delayed , then all passengers who had purchased the insurance for the flight
are marked as "Eligible for Payout"

Reference:
(images/Submit-To-Oracle-Invocation.png)
(images/Submit-To-Oracle-Invocation.png)


## Check Claim Status

The passengers, who had purchased insurance for the flight which got delayed based on response of flight status have been marked for payout.
The status of their Claim can be check through DAPP, with button "Check Claim Applicable"

Reference:
(images/Check-Claim-Applicable-Invocation.png)
(images/Check-Claim-Applicable-Result.png)


## Withdrawl

The passengers, who had been marked as eligible for Payout can withdraw claim amount to their wallet. This can be done by clicking on button "Withdraw Claim"
This method will transfer "1.5" ether to passenger account and reset passenger status to "Not eligible for payout"

steps to be executed:
"1"
a. Invoke "Withdraw Claim"
b. It will display passenger account balance before withdraw of "1.5" ether and will process the withdraw


"2"
a. Invoke "Check Balance" button to verify the passenger address is credited "1.5" ether

"3"
a. Invoke "Check Claim Applicable" button to verify passenger status to "Not eligible for payout" after withdrawl


Reference:
"1"
a. (images/Withdraw-Claim-Invocation.png)
b. (images/Balance-Before-Withdrawl.png)


"2"
(images/Check-Balance.png)
(images/Balance-After-Withdrawl.png)

"3"
(images/Check-Claim-Applicable-Invocation.png)
(images/Claim-Status-After-Withdrawl.png)



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


## Develop Client

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



