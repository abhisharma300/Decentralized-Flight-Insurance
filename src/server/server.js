import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';



class OracleImplementation {

    constructor(network) {
		let self=this;
		//let count =5;
        let config = Config[network];
		this.oracles = [];
	
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
        this.web3.eth.defaultAccount = this.web3.eth.accounts[0];
		this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
      
		console.log("hello world");
		
		self.web3.eth.getAccounts().then((res)=>{
			
	//	console.log("accounts=",res);
		 
		for (let count=3;count<12;count++) {
	    this.flightSuretyApp.methods.registerOracle().send({ from: res[count], gas: 30000000 },(error,result)=> {

			 
		if(error)
			console.log("error inside register=",error);
		else{
				 self.flightSuretyApp.methods.getMyIndexes().call({from: res[count]}).then((response)=>{
				 
				 console.log("Registered Oracle ",res[count],"Indexes = ",response[0],response[1],response[2]);
				  self.oracles.push({ address: res[count], indexes: response});

				 });
				 }// end of else
      		}) // end of register oracle	
		}// end of for loop
	  }); // end of get accounts
	} // end of constructor


						// 



	initialize()
	{
		let self=this;
		this.flightSuretyApp.events.OracleRequest({
			toBlock: 'latest',
            fromBlock: 'latest'
		}, function (error, ev) {
		if (error) console.log(error)
			
			let payload = {
                index: ev.returnValues.index,
                flight: ev.returnValues.flight,
                key: ev.returnValues.key,
                timestamp: ev.returnValues.timestamp
			}
		
		// console.log("self array=",self.oracles[0].indexes[0]);
		// console.log("self array=",self.oracles[0].indexes[1]);
			
		 console.log("payload indexes",payload.index);
		// console.log("payload flight",payload.flight);
		// console.log("payload key",payload.key);
		// console.log("payload timestamp",payload.timestamp);

	     for (let o = 0; o < self.oracles.length; o++) {
			  let matches = 0;
			 // for (let i = 0; i < 3; i++) {
                if (payload.index === self.oracles[o].indexes[0] ||
                    payload.index === self.oracles[o].indexes[1] ||
                    payload.index === self.oracles[o].indexes[2]) {
                        matches++;
						
				console.log("o=",o,"index 0=",self.oracles[o].indexes[0],"index 1=",self.oracles[o].indexes[1],"index 2=",self.oracles[o].indexes[2]);
						
						
                } // end of if
         //  }	// end of for loop
			
			if (matches >= 1) {
				console.log("matches=",matches);
                // This Oracle's indexes match at least (1) of the indexes from the FlightSuretyApp oracle request
				matches=0;
				
             
			//	let status = Math.floor(Math.random() * 5) * 10; 
				 let status = Math.floor(Math.random() * 5) * 10;
				console.log("status=",status);
				
				try {
					
					 console.log("inside ");
			//		 console.log("oracle o=",o,"flight=",payload.flight,"key=",payload.key,"timestamp=",payload.timestamp,"status=",status);
                    // Submit Oracle response
                    self.flightSuretyApp.methods.submitOracleResponse
                            (
                                self.oracles[o].indexes,
                                payload.flight,
                                payload.key,
                                payload.timestamp,
                                status
                            ).send({ from: self.oracles[o].address, gas: 500000 }, (error, result) => {
                                //let oracle_msg = `(${self.oracles[o].address}, ${self.oracles[o].indexes}, - ${status})`;
								 console.log("inside callback indexes=",self.oracles[o].indexes,"address=",self.oracles[o].address);
								
                                if (error) {
                                    //console.log(error);
                                    console.log("inside error block");
                                }
                                
                                else {
                                    console.log("inside success block");
                                }
                            });   
                }
				catch(e) {
                    console.log(e.message);
                }
			}// end of if matches>=1



      	  } // end of for loop
	
	  } // end of callback method

	) // end of Oracle Request method
  } // end of initialize method



} //end of class


const app = express();

const contract = new OracleImplementation('localhost');
contract.initialize();

app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


