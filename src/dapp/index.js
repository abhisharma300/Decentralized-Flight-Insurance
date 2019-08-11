
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';


(async() => {

    let result = null;

    let contract = new Contract('localhost', () => {
		
		var claimStatus = new Map();
		claimStatus.set(0, "Not Eligible for Claim Amount Withdrawl");
		claimStatus.set(1, "Eligible for Claim Amount Withdrawl");
		
		var myMap = new Map();
		myMap.set(0, "Flight Status Unknown");
		myMap.set(10, "Flight Status ON TIME");
		myMap.set(20, "Flight Status Late AIRLINE");
		myMap.set(20, "Flight Status Late WEATHER");
		myMap.set(20, "Flight Status Late TECHNICAL");
		myMap.set(20, "Flight Status Late OTHER");
		

        // Read transaction
        contract.isOperational((error, result) => {
            console.log(error,result);
			console.log("is operational=",result);
            display1('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
			  //   display('Operations', 'Status', [ { label: 'Unknown Error', error: error, value: 'must be in test mode'} ]);
        });
    
	
		// transaction for checking claim applicable
		DOM.elid('claim-applicable').addEventListener('click', () => {

 			let passengerAddress = DOM.elid('passenger-claimcheck').value;
            // Write transaction
            contract.claimApplicable(passengerAddress,(error,result) => {
				console.log("inside claim applicable",result);

			var integer = parseInt(result, 10);
			let strs=claimStatus.get(integer);

			console.log("claim text=",strs);
					
              display1('Claim Applicability', 'Eligility ', [ { label: 'Claim applicable', error: error, value: strs} ]);
            });
        })
	
	
		
		// transaction for withdrawing claim amount
		DOM.elid('claim-withdraw').addEventListener('click', () => {

 			let passengerAddress = DOM.elid('passenger-withdraw').value;
            // Write transaction
            contract.withdrawClaim(passengerAddress,(error,result) => {
				
				
				console.log("inside claim withdraw",result);
  
            });
        })
	
	
	   // get passenger account balance
	   
	   		DOM.elid('passenger-balance').addEventListener('click', () => {

 			let passengerAddress = DOM.elid('passenger-address-balance').value;
            // Write transaction
            contract.passengerBalance(passengerAddress,(error,result) => {
  
            });
        })
	
	

        // User-submitted transaction
        DOM.elid('submit-oracle').addEventListener('click', () => {
         
            // Write transaction
			
		let airlineAddress = DOM.elid('airline-address-fltstatus').value;
				
		var e = document.getElementById("FlightIdStatus");
			var flightIdStatus = e.options[e.selectedIndex].text;
			console.log("Selected FlightIdStatus =",flightIdStatus);
			
		var f = document.getElementById("FlightTimeStatus");
			var flightTimeStatus = f.options[f.selectedIndex].text;
			console.log("Selected Flight TimeStatus=",flightTimeStatus);
			
				
        contract.fetchFlightStatus(airlineAddress,flightIdStatus,flightTimeStatus,(error, result) => {
          //      display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })
		
		// transaction for registration of airline
		DOM.elid('register-airline').addEventListener('click', () => {
            let airlineName = DOM.elid('airline-name').value;
			let airlineAddress = DOM.elid('airline-address').value;
			console.log("before register");
            // Write transaction
            contract.registerAirline(airlineName,airlineAddress,(error,result) => {
				console.log("inside register",result);
             //  display('register', 'Register Airlines', [ { label: 'Fetch reguster status Status', error: error, value: result} ]);
            });
        })
		
		// transaction for funding of airline
		DOM.elid('fund-airline').addEventListener('click', () => {

 			let airlineAddress = DOM.elid('funded-airline').value;
			console.log("before fund");
            // Write transaction
            contract.fund(airlineAddress,(error,result) => {
				console.log("inside fund",result);
   //            display('register', 'Register Airlines', [ { label: 'Fetch reguster status Status', error: error, value: result} ]);
            });
        })
		


		
	 // FlightInsurancePurchased event
        contract.FlightInsurancePurchased((error, event) => {
            event.returnValues['blockNumber'] = event.blockNumber;
            display('Flight Events', 'FlightInsurancePurchased', [ { label: 'Result', error: error, value: event.returnValues } ]);
        });



		 // FlightStatusInfo event
        contract.FlightStatusInfo((error, event) => {
            event.returnValues['blockNumber'] = event.blockNumber;
			console.log("event flight=",event.returnValues.flight);
			console.log("status info code=",event.returnValues.flightDelayStatus);
			console.log("time stamp=",event.returnValues.timestamp) 
			display('Oracle Events', 'FlightStatusInfo', [ { label: 'Result', error: error, value: event.returnValues} ]); 
        });
		
			 // Airline Funding event
        contract.AirlineFunded((error, event) => {
            event.returnValues['blockNumber'] = event.blockNumber;
            display('Airline Events', 'Airline Funded', [ { label: 'Result', error: error, value: event.returnValues } ]);
        });
		
		
		
		
		
		// transaction for purchasing of insurance
		DOM.elid('purchase-insurance').addEventListener('click', () => {
			
		let passengerAddress = DOM.elid('passenger-address-buy').value;

 		//	let flightId = DOM.elid('FlightId');
		var e = document.getElementById("FlightId");
			var flightId = e.options[e.selectedIndex].text;
			console.log("Selected Flight Id=",flightId);
			
		var f = document.getElementById("FlightTime");
			var flightTime = f.options[f.selectedIndex].text;
			console.log("Selected Flight Time=",flightTime);
			
				console.log("Passenger address=",passengerAddress);
            // Write transaction
           contract.buy(flightId,flightTime,passengerAddress,(error,result) => {
			//	console.log("inside fund",passengerAddress);
   
           });
        })
    
    });
    

})();

function display(title, description, results) {
	
	var myMap = new Map();
	myMap.set(0, "Flight Status Unknown");
	myMap.set(10, "Flight Status ON TIME");
	myMap.set(20, "Flight Status Late AIRLINE");
	myMap.set(30, "Flight Status Late WEATHER");
	myMap.set(40, "Flight Status Late TECHNICAL");
	myMap.set(50, "Flight Status Late OTHER");
		
    let displayDiv = DOM.elid("display-wrapper1");
    let section = DOM.section();

    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));

    results.map((result) => {   
        let row = section.appendChild(DOM.div({className:'row'}));

        if (result.error) {
            row.appendChild(DOM.div({className: 'col-sm-2 field'}, result.label));
            row.appendChild(DOM.div({className: 'col-sm-10 field-value'}, String(result.error)));
        }

        // If result contains an error, there won't be a value
        if (result.value === null)
            return;
     
        if (typeof result.value === 'object') {
            // convert event object to array of event info
            // https://stackoverflow.com/questions/38824349/how-to-convert-an-object-to-an-array-of-key-value-pairs-in-javascript
            let resultInfo = Object.keys(result.value).map(function(key) {
                
                // Don't process keys that contain numbers
                if (!hasNumber(key)) {
                    row.appendChild(DOM.div({className: 'col-sm-2 field'}, key));
					if(key=='flightStatus')
					{
						
						let strs=result.value[key];
						var integer = parseInt(strs, 10);
						strs=myMap.get(integer);
						console.log("strs=",strs);
						console.log("strs=",strs);
						row.appendChild(DOM.div({className: 'col-sm-10 field-value'}, strs));
					}
					else {
                    row.appendChild(DOM.div({className: 'col-sm-10 field-value'}, String(result.value[key])));
                    section.appendChild(row);
					}
                }
            });
        } else {
            row.appendChild(DOM.div({className: 'col-sm-10 field-value'}, String(result.value)));
        }
        
        section.appendChild(row);
    })
    displayDiv.append(section);
    
    top();
}

function top() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

function hasNumber(value) {
    return /\d/.test(value);
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







