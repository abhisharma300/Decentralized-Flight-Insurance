
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  const fundingAmount = web3.toWei(1, "ether");
  
  before('setup contract', async () => {
    config = await Test.Config(accounts);

    //await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
  });
  
  

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

/*

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access not restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];

    // ACT
    try {
        await config.flightSuretyApp.registerAirline(newAirline, {from: config.firstAirline});
    }
    catch(e) {

    }
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

    // ASSERT
    assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

  });
  */

    it('Only Existing Airline can register new airline, if total airline less than 4', async () => {
	
	
	// First Airline is registered through constructor of App Contract
	// Fund the First Airline, so that it can register subsequent airlines
	await config.flightSuretyApp.fund.sendTransaction({from:config.owner, value: web3.toWei(3, 'ether')});
	
	//register seconnd airline
	 let secondAirlineAddress = accounts[1];
	// invoke second airline registration with first airline address
	await config.flightSuretyApp.registerAirline.sendTransaction("Second",secondAirlineAddress,{from:config.owner}); 
	
	const result = await config.flightSuretyData.getAirline.call(secondAirlineAddress);
	console.log("Second Airline Name from Blockchain=",result[0]);
	console.log("Second Airline isRegistered Status=",result[1].toNumber());
	console.log("Second Airline isFunded Status =",result[2].toNumber());
	console.log("Second Airline fundedAmount =",result[3].toNumber());
	
	let airlineCountAfterRegistration=await config.flightSuretyData.getAirlineCounter.call(); 

	
	assert.equal(result[0],"Second", 'Error: Invalid Airline Name');
	assert.equal(result[1],1, 'Error: Invalid IsRegistered');
    assert.equal(result[2],0, 'Error: Invalid IsFunded');
	assert.equal(result[3],0, 'Error: Invalid FundedAmount');
    assert.equal(airlineCountAfterRegistration,2, 'Error: Invalid Airline Count');
	
	// Fund the Second Airline, so that it can register subsequent airlines
	await config.flightSuretyApp.fund.sendTransaction({from:secondAirlineAddress, value: web3.toWei(3, 'ether')});

  });

  
   it('50 % of registered airline must vote to register new airline if, registered airline exceed 4', async () => {
		
	let secondAirlineAddress = accounts[1];
	let thirdAirlineAddress = accounts[2];
	let fourthAirlineAddress = accounts[3];
	let fifthAirlineAddress = accounts[4];

	
	//register&fund third,fourth airline
	await config.flightSuretyApp.registerAirline.sendTransaction("Third",thirdAirlineAddress,{from:secondAirlineAddress}); 
	await config.flightSuretyApp.fund.sendTransaction({from:thirdAirlineAddress, value: web3.toWei(3, 'ether')});
	await config.flightSuretyApp.registerAirline.sendTransaction("Fourth",fourthAirlineAddress,{from:thirdAirlineAddress});
    await config.flightSuretyApp.fund.sendTransaction({from:fourthAirlineAddress, value: web3.toWei(3, 'ether')});
	
	
	
	
	//Registered airline counter before vote
	let airlineCounterBeforeVote = await config.flightSuretyData.getAirlineCounter.call(); 
    console.log("Registered Airline Count before multi-consensus vote =",airlineCounterBeforeVote.toNumber());
	
    // 3 votes required for registering Fifth airline 
	// First vote for registering Fifth airline , by first airline
	
    await config.flightSuretyApp.registerAirline.sendTransaction("Fifth",fifthAirlineAddress,{from:config.owner});
	

	// Second vote for registering Fifth airline , by second airline
    await config.flightSuretyApp.registerAirline.sendTransaction("Fifth",fifthAirlineAddress,{from:secondAirlineAddress});
	
	// Third vote for registering Fifth airline , by third airline
    await config.flightSuretyApp.registerAirline.sendTransaction("Fifth",fifthAirlineAddress,{from:thirdAirlineAddress});
	
	airlineCounterAfterVote = await config.flightSuretyData.getAirlineCounter.call(); 
    console.log("Registered Airline Count after multi-consensus vote =",airlineCounterAfterVote.toNumber());
		
 });
  
 it(' Test for funding by airline', async () => {
	  
	let fifthAirlineAddress = accounts[4];
	
	// console log funding status before invoking fund method
	const result = await config.flightSuretyData.getAirline.call(fifthAirlineAddress);
	console.log("funding status of fifth airline before invoking fund method",result[2].toNumber());
	console.log("funding value before invoking fund method",result[3].toNumber());
	
	
	// log balance of data contract before invocation of fund method
	let dataContractBalanceBefore = await web3.eth.getBalance(config.flightSuretyData.address);
    console.log("data contract balance before invocation of fund method ",dataContractBalanceBefore.toNumber());
		
	// invoke fund method
	await config.flightSuretyApp.fund.sendTransaction({from:fifthAirlineAddress, value: web3.toWei(3, 'ether')});
	let dataContractBalanceAfter = await web3.eth.getBalance(config.flightSuretyData.address);
    console.log("data contract balance after invocation of fund method ",dataContractBalanceAfter.toNumber());
	
	// console log funding status after invoking fund method
	const result1 = await config.flightSuretyData.getAirline.call(fifthAirlineAddress);
	console.log("funding status of fifth airline after invoking fund method",result1[2].toNumber());
	console.log("funding value after invoking fund method",result1[3].toNumber());
    assert.equal(result1[2],1, 'Error: in Funding status of airline');
	assert.equal(result1[3],3, 'Error: in Fund Amount for airline');
		
  });
  
  
  
  it('buy insurance', async () => {
	  
	
    let passenger = accounts[2];

	// log balance of data contract before invocation of fund method
	let dataContractBalanceBefore = await web3.eth.getBalance(config.flightSuretyData.address);
    console.log("data contract balance before invocation of buy method ",dataContractBalanceBefore.toNumber());
		
	await config.flightSuretyApp.buy.sendTransaction(901,130,{from:passenger, value: web3.toWei(1, 'ether')});

	// log balance of data contract before invocation of buy method
    let dataContractBalanceAfter = await web3.eth.getBalance(config.flightSuretyData.address);
    console.log("data contract balance after invocation of buy method ",dataContractBalanceAfter.toNumber());

    //get insurance details stored by 
	
	const result = await config.flightSuretyData.getInsurance.call(passenger);

    console.log("From Blockchain flightId =",result[0].toNumber());
    console.log("From Blockchain flightTime =",result[1].toNumber());
    console.log("From Blockchain payoutApplicable=",result[2].toNumber());

	assert.equal(result[0],901, 'Error: in FLight id');
	assert.equal(result[1],130, 'Error: in FLight time');
		
  });
  
 /*
  it('credit insuree', async () => {
	  
	let passenger = accounts[5];
	
	// payout applicable value before invoking credit insuree
	
	const result = await config.flightSuretyData.getInsurance.call(passenger);
	console.log("payout applicable value before credit insuree =",result[3].toNumber());
	
    await config.flightSuretyData.creditInsurees.sendTransaction({from:passenger});
	
	// payout applicable value after invoking credit insuree
	const result1 = await config.flightSuretyData.getInsurance.call(passenger);
	console.log("payout applicable value after credit insuree",result1[3].toNumber());
	assert.equal(result1[3].toNumber(),1, 'Error: in Applicablel payout');
	
});
	

  it('pay', async () => {
	  
    let passenger = accounts[5];
	
    // payout applicable before after invoking payiut 
	const result = await config.flightSuretyData.getInsurance.call(passenger);
	console.log("payout applicable value before invoking payout=",result[3].toNumber());
	assert.equal(result[3].toNumber(),1, 'Error: in Applicable payout');

    // log balance of data contract before invocation of pay method
    let dataContractBalanceBefore = await web3.eth.getBalance(config.flightSuretyData.address);
    console.log("data contract balance before invocation of pay method ",dataContractBalanceBefore.toNumber());

	await config.flightSuretyApp.pay.sendTransaction({from:passenger});
		
	// log balance of data contract after invocation of fund method
	 let balanceAfter = await web3.eth.getBalance(config.flightSuretyData.address);
	 console.log("balance after payout",balanceAfter.toNumber());
	 
	 // payout applicable value after invoking payiut 
	const result1 = await config.flightSuretyData.getInsurance.call(passenger);
	console.log("payout applicable value after invoking payout=",result1[3].toNumber());
	assert.equal(result1[3].toNumber(),0, 'Error: in Applicable payout');
	});
	
*/

});



 