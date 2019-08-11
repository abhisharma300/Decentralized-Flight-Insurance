pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */
contract FlightSuretyApp {
    using SafeMath for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
	
    address private contractOwner;          // Account used to deploy contract

    FlightSuretyData flightDataContract;	// Data contract reference
	
	event FlightInsurancePurchased(address passenger,uint flightId, uint flightTime );
	
	event AirlineFunded(address airlineAddress);
	


 
    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
         // Modify to call data contract's status
        require(true, "Contract is currently not operational");  
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }
	
	
	

	

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
    * @dev Contract constructor
    *
    */
    constructor
                                (
								 address dataContract
                                ) 
                                public 
    {
        contractOwner = msg.sender;
		flightDataContract= FlightSuretyData(dataContract);
		
		// Register first airline with app contract owner 
		registerAirline("First Airline",contractOwner);
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational() 
                            public 
                            pure 
                            returns(bool) 
    {
        return true;  // Modify to call data contract's status
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

  
   /**
    * @dev Register an airline , by invoking register airline of data contract
    *
    */   
    function registerAirline
                            (   string _airlineName, address _airlineAddress
                            )
                            
                            
                            returns(bool success, uint256 votes)
    {
	   // invoke register airline of data contract
	 
	   flightDataContract.registerAirline(_airlineName,_airlineAddress, msg.sender);

	   return (success, 0);
    }
	
	
	  /**
    * @dev Fund an airline , by invoking fund airline of data contract
    *
    */ 
	
	function fund
                            ( 
												
                            )
                            public
                            payable
    {
	   
		uint fundAmount = 3 ether;
	    require(msg.value >= fundAmount);	
		uint amountToTransfer = msg.value;
    	address(flightDataContract).transfer(amountToTransfer);
		flightDataContract.fund(msg.sender);
		
		address airlineAddress=msg.sender;
		
		 emit AirlineFunded(airlineAddress);
	
    }
	

	
	   /**
    * @dev Buy insurance for a flight, by invoking buy insurance of data contract
    *
    */   
    function buy
                            (   

							uint flightId,
							uint flightTime
                            )
                            external
                            payable
    {

	 uint maxInsurance = 1 ether;
	 require(msg.value<=maxInsurance,"amount greater than maxinsurance");
	 uint amountTransfer = msg.value;
	
	 address(flightDataContract).transfer(amountTransfer);
	 flightDataContract.buy(flightId,flightTime,msg.sender);
	 
	 address passenger = msg.sender;
	 
	  emit FlightInsurancePurchased(passenger, flightId,flightTime );
	 
	 }
	 
	 
	 
	    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
                            
    {
	

	 
	 flightDataContract.pay(msg.sender);
	 
    }

	/**
    * @dev Called after oracle has updated flight status
    *
    */  
    function processFlightStatus
                                (
                                    uint flightid,
                                    bytes32 key,
                                    uint8 statusCode
                                )
                                internal
                                
    {
		if (statusCode==20) {
		
	//	require(flightid==901,"FLight data id not equal to 901");
	
		flightDataContract.identifyPayout(flightid);
	
	
    }
}


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus
                        (
                            address airline,
                            uint flight,
                            uint256 timestamp                            
                        )
                        
    {


	
	    uint8 index = getRandomIndex(msg.sender);
		
		

        // Generate a unique key for storing the request
		
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight,timestamp));
		
        oracleResponses[key] = ResponseInfo({
                                                requester: msg.sender,
                                                isOpen: true
                                            });

        emit OracleRequest(index, flight, key, timestamp);
	
    }



	


// region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;    

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 2;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;        
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester;                              // Account that requested status
        bool isOpen;                                    // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses;          // Mapping key is the status code reported
                                                        // This lets us group responses and identify
                                                        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo( uint flight, uint timestamp, uint flightStatus);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint index, uint flight, bytes32 key , uint256 timestamp);


    // Register an oracle with the contract
    function registerOracle
                            (
                            )
                            external
                            payable
    {
  
	 
        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
                                        isRegistered: true,
                                        indexes: indexes
                                    });
    }

    function getMyIndexes
                            (
                            )
                            view
                            external
                            returns(uint8[3])
    {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }




    function submitOracleResponse
                        (
                            uint8[3] indexes,
							uint flight,
							bytes32 key,
                            uint256 timestamp,
                            uint8 flightStatus
                        )
                        external
    {
        require((oracles[msg.sender].indexes[0] == indexes[0]) || (oracles[msg.sender].indexes[1] == indexes[1]) || (oracles[msg.sender].indexes[2] == indexes[2]), "Index does not match oracle request");

		uint x=3;
    //    bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp)); 
        require(oracleResponses[key].isOpen, "Flight or timestamp do not match oracle request");

        oracleResponses[key].responses[flightStatus].push(msg.sender);

        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
    //    emit OracleReport(airline, flight, timestamp, status);
		
        if (oracleResponses[key].responses[flightStatus].length >= MIN_RESPONSES) {
		
		      // Close the flight status request
            oracleResponses[key].isOpen = false;

			delete oracleResponses[key].responses[0];
            delete oracleResponses[key].responses[10];
            delete oracleResponses[key].responses[20];
            delete oracleResponses[key].responses[30];
            delete oracleResponses[key].responses[40];
            delete oracleResponses[key].responses[50];

            emit FlightStatusInfo(flight, timestamp,flightStatus);

            // Handle flight status as appropriate
          //  processFlightStatus(flight, key, status);
			if(flightStatus!=20)
			flightDataContract.getSampleDataAirline(flight);

        }
    }


    function getFlightKey
                        (
                            address airline,
                            string flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes
                            (                       
                                address account         
                            )
                            internal
                            returns(uint8[3])
    {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);
        
        indexes[1] = indexes[0];
        while(indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex
                            (
                                address account
                            )
                            
                            returns (uint8)
    {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0;  // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

// endregion


	function isPayoutApplicable
                            (
                                
                            )   
                            returns (uint x)
							 
    {

       
		(x)=flightDataContract.isPayoutApplicable(msg.sender);
		
	
	
		return x;
	
		  
    }

}   

contract FlightSuretyData {
 function registerAirline ( string _airlineName, address _airlineAddress, address _sender);
 function fund(address _sender);
 function buy(uint flightId,uint flightTime, address _sender);
 function pay(address payoutAddress);
 function getSampleDataAirline(uint flightId);
 function identifyPayout(uint flightid);
  function isPayoutApplicable(address passenger) returns (uint x);
}
