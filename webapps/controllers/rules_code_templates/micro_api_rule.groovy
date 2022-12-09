/**
 * Micro APIs are like Lambda functions
 * You can create as many different API classes
 * Each class can have one or more exposed function
 * Each function that is decorated with @MicroApi can be invoked through REST calls
 *  
 * Make sure that your code responds and exits for thread interruptions
 * a bad responsive code can cause your rule to be suspended until it is fixed
 */

import io.boodskap.iot.MicroApi;

/**
 * params[]   -> Array of expected parameter names
 * type[] 	  -> If declared, make sure it matches the params[]
 * required[] -> List of required parameters from params[]
 * roles[]	  -> Domain rules,  empty roles for open access
 * slug		  -> Optional short name for the function
 * args		  -> Map object containing HTTP body or query parameters
 */

@MicroApi(desc = "My API method description", params = [], types = [], required = [], roles = [], slug = "")
def myApiMethod(def args) {
	
	def results = [:];
	
	try {
		
	}catch(Exception ex) {
		//log.error(ex);
		//log.insert(ex);
		//results['error'] = util.toString(ex);
	}

	return results;
}
