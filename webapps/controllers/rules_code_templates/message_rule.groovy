/**
* Message rules are automatically invoked by the platform as soon as a correponding messages arrives
* typically messages rules are the entry point to your business logic if you need to further process
* and extract information out of incoming messages
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
