/**
 * Domain rule is like a initialization script
 * If you want to do some snaity and housekeeping precheck everytime the platform reboots
 * write the logic here, it's guranteed to run only once when the platform reboots
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
