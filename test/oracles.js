
var Test = require('../config/testConfig.js');
//var BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

contract('Oracles', async (accounts) => {

  const TEST_ORACLES_COUNT = 9;
  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);

    // Watch contract events
    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;

  });


  it('can register oracles', async () => {
    
 
    // ACT
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {      
      await config.flightSuretyApp.registerOracle({ from: accounts[a]});
      let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
	  console.log("accounts =",accounts[a]);
    }
	
  });


  it('can request flight status', async () => {
    
    // ARRANGE
    let flight = '130'; // Course number
    let timestamp = Math.floor(Date.now() / 1000);
	let key=0;
	let indexRequest=0;

    // Submit a request for oracles to get status information for a flight
    let tx=await config.flightSuretyApp.fetchFlightStatus(accounts[1], flight, timestamp);
    // ACT
	        truffleAssert.eventEmitted(tx, 'OracleRequest', (ev) => {
				 key=ev.key;
				 indexRequest=ev.index;
            return true;
        }, 'Oracle Request event error.');
		


    // Since the Index assigned to each test account is opaque by design
    // loop through all the accounts and for each account, all its Indexes (indices?)
    // and submit a response. The contract will reject a submission if it was
    // not requested so while sub-optimal, it's a good test of that feature
    for(let a=1; a<TEST_ORACLES_COUNT; a++) {
	let a=1;
      // Get oracle information
      let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a]});

    //  for(let idx=0;idx<3;idx++) {

        try {
          // Submit a response...it will only be accepted if there is an Index match
		 // console.log("oracleIndexes=",oracleIndexes[idx].toNumber());
          await config.flightSuretyApp.submitOracleResponse(oracleIndexes, flight, key, timestamp, 20, { from:accounts[a]});
		  
		     truffleAssert.eventEmitted(tx, 'FlightStatusInfo', (ev) => {
                    return(ev.key === key && ev.statusCode ==20);
                }, 'Flight Status Info event error.');
		    

        }
        catch(e) {
          // Enable this when debugging
        //   console.log('\nError',e, flight, timestamp);
        }

      }
  //  }


  });


 
});
