/**
 * TCP rules are automatically invoked by the platform as soon as a socket client opens connection
 * in the configured port
 * 
 * Make sure that your code responds and exits for thread interruptions
 * a bad responsive code can cause your rule to be suspended until it is fixed
 */

try{

	//Your logic goes here
}catch(Exception ex){
	log.error(ex);
	//log.insert(ex);
}
