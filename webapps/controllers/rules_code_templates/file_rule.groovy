/**
 * Binary Message rules are automatically invoked by the platform as soon as a 
 * file is dropped in to your domain's folder the path to the file is construcred like below
 * 
 * {YOUR_DATA_FOLDER_HOME}/filesroot/domain/{DOMAIN_KEY}/{THIS_RULE_TYPE}
 * 
 * Make sure that your code responds and exits for thread interruptions
 * a bad responsive code can cause your rule to be suspended until it is fixed
 * 
 */

try{

	//Your logic goes here
}catch(Exception ex){
	log.error(ex);
	//log.insert(ex);
}
