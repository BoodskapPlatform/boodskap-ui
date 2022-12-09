
/**
 * Named rules are like global functions, that can be shared across the entire Rules Engine subsystem
 * Generally it's a good practice to create one distinct functionality using one named rule
 * It's also a good practice to return an Json Object a.k.a Groovy Map
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
