/**
 * MQTT rules are automatically invoked by the platform as soon as a correponding messages arrives
 * in the configured external MQTT server's topic(s)
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
