/**
 * Jobs are like long running processes, typically listening on a
 * distributed queue for incoming data, or periodically sleep and
 * perform various operations.
 * 
 * Make sure that your code responds and exits for thread interruptions
 * a bad responsive code can cause your rule to be suspended until it is fixed
*/

try{
	
	while(!THIS.isStopped()) {
		
		/**
		 *  Replace this with your logic
		 */
		
		log.info("I am running...");
		
		util.sleep(5000);
		
		log.info("Good bye.");
		
		return;
	}


}catch(Exception ex){
	log.error(ex);
	//log.insert(ex);
}
