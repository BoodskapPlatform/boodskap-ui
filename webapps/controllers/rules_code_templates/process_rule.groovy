/**
 * Process rules are special purpose code that will be invoked by Workflow engine
 * Each process may have input and outputs based on that the workflow navigation can be setup
 *
 * Make sure that your code responds and exits for thread interruptions
 * a bad responsive code can cause your rule to be suspended until it is fixed
 */

try{

	//Your logic goes here

	return [:];
	
}catch(Exception ex){
	log.error(ex);
	//log.insert(ex);
}
