import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import DOM from './dom';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
      //  this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
		this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
		
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
           
            this.owner = accts[0];

            let counter = 1;
            
            while(this.airlines.length < 3) {
                this.airlines.push(accts[counter++]);
            }

            while(this.passengers.length < 3) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }
	
	claimApplicable(passengerAddress,callback) {
        let self = this;
		console.log("inside contract js claim applicable passenger address=",passengerAddress);
		this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("balance before claim withdraw =",receipt); });
		
		    self.flightSuretyApp.methods
            .isPayoutApplicable()
            .call({ from: passengerAddress}, callback);
		}


		withdrawClaim(passengerAddress,callback) {
			let self = this;
  
			console.log("inside contract js claim applicable passenger address=",passengerAddress);
			this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("balance before claim withdraw =",receipt); 
			
			 display1('Passenger Account Balance before withdrawl', 'Balance ', [ { label: 'Current balance', error: receipt, value: receipt} ]);
			});
			self.flightSuretyApp.methods.pay().send({ from:passengerAddress , gas:5000000}, callback);
			
	//		this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("balance before claim withdraw =",receipt); 
			
	//		 display1('Passenger Account Balance after withdrawl', 'Balance ', [ { label: 'Current balance', error: receipt, value: receipt} ]);
	//		});
			
		  }
		  
		  
		  
		  passengerBalance(passengerAddress,callback) {
			let self = this;
  

			this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("Current Balance =",receipt); 
			
			 display1('Current Balance', 'Balance ', [ { label: 'Current balance', error: receipt, value: receipt} ]);
			});

		 }
	   

/*

		withdrawClaim(passengerAddress,callback) {
			let self = this;
  
			console.log("inside contract js claim applicable passenger address=",passengerAddress);
			this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("balance before claim withdraw =",receipt); 
			
			 display1('Passenger Account Balance before withdrawl', 'Balance ', [ { label: 'Current balance', error: receipt, value: receipt} ]);
			});
			
			
			self.flightSuretyApp.methods.pay().send({ from:passengerAddress}, (error, result) => {

			this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("balance after claim withdraw =",receipt); 
			
			 display1('Passenger Account Balance before withdrawl', 'Balance ', [ { label: 'Current balance', error: receipt, value: receipt} ]);
			});

			callback(error,result);
            });
	
			
		  }
*/
	
	registerAirline(airlineName, airlineAddress,callback) {
        let self = this;
       
        self.flightSuretyApp.methods
            .registerAirline(airlineName, airlineAddress)
            .send({ from:self.owner}, (error, result) => {
          //      callback(error, payload);
		    console.log("inside contract js");
			console.log("airline getting registered=",airlineAddress);
			console.log("airline which is registering=",self.owner);
			console.log(error,result);
			callback(error,result);
            });
    }
	
	fund(airlineAddress,callback) {
        let self = this;
       	const amount = web3.toWei(3, 'ether');
		this.web3.eth.getBalance(airlineAddress).then(function(receipt){ console.log("balance before=",receipt); });
		
		/*
		this.web3.eth.getBalance(airlineAddress,function(balance){
		console.log("before fund=", balance);
		});
		*/
        self.flightSuretyApp.methods
            .fund().send({ from:airlineAddress, value:amount}, (error, result) => {
          //      callback(error, payload);
		    console.log("inside contract js");
			console.log("airline getting funded=",airlineAddress);
	//		 console.log("balance after",web3.eth.getBalance(airlineAddress));
			console.log(error,result);
			callback(error,result);
			this.web3.eth.getBalance(airlineAddress).then(function(receipt){ console.log("balance after=",receipt); });
            });
			
    }
	
	buy(flightId,flightTime,passengerAddress,callback) {
        let self = this;
       	const amount = web3.toWei(1, 'ether');
		console.log("inside contract js flight id=",flightId);
		console.log("inside contract js flight time=",flightTime);
		console.log("inside contract js passenger address=",passengerAddress);

	this.web3.eth.getBalance(passengerAddress).then(function(receipt){ console.log("balance before buy insurance=",receipt); });
        self.flightSuretyApp.methods
            .buy(flightId,flightTime).send({ from:passengerAddress, gas: 5000000,value:amount}, (error, result) => {
    		console.log(error,result);
			callback(error,result);
			this.web3.eth.getBalance(passengerAddress).then(function(receipt){ 
				console.log("balance after buy insurance=",receipt); });
            });

    }
	
	    fetchFlightStatus(airlineAddress,flightIdStatus,flightTimeStatus,callback) {
        let self = this;
		console.log("inside contract js flight statusid=",flightIdStatus);
		console.log("inside contract js flight timestatus =",flightTimeStatus);
		console.log("inside contract js airlineaddress =",airlineAddress);
  
        self.flightSuretyApp.methods
            .fetchFlightStatus(airlineAddress,flightIdStatus, flightTimeStatus)
            .send({ from: self.owner,gas: 500000}, (error, result) => {
                callback(error, result);
            });
    }
	

	
	
	  FlightStatusInfo(callback) {
        let self = this;
        self.flightSuretyApp.events.FlightStatusInfo({
            fromBlock: 'latest',
            toBlock: 'latest',
        }, (error, event) => {
			console.log("event info flight=",event.returnValues.flight);
			console.log("status info code=",event.returnValues.flightDelayStatus);
			console.log("time info stamp=",event.returnValues.timestamp);
            callback(error, event);
			
        });
    }
	
	    FlightInsurancePurchased(callback) {
        let self = this;
        self.flightSuretyApp.events.FlightInsurancePurchased({
            fromBlock: 'latest', 
            toBlock: 'latest'
          }, (error, event) => {
            callback(error, event);
        });
    }
	
		 AirlineFunded(callback) {
        let self = this;
        self.flightSuretyApp.events.AirlineFunded({
            fromBlock: 'latest', 
            toBlock: 'latest'
          }, (error, event) => {
            callback(error, event);
        });
    }
	
}

function display1(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper1");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
	
displayDiv.append(section);

}