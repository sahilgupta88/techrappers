Description
-----------
This module help admins or user with similar admin privileges to change file upload limit on a website without changing php.ini file.

Features:
---------
  - Provides a simple UI to turn on/off module without going to modules page.
  - Provides seperate permissions for this module on permissions page(/admin/people/permissions).
  - It will help you to put configuration in your .htaccess file, so that you dont need to change your php.ini file and restart apache server.
  - Good for shared environments where users do not have access to php.ini file.
  - Useful for users with similar admin privileges which do not have permissions to go to module page.
  - You can increase global file limit on website but still can configure some fields different from this global limit. So if you define your 
	file upload size of your field in field configuration( Administration » Structure » Content types » YOUR CONTENT TYPE NAME » Manage fields) and edit that field,
	you can still define your custom limit in "Maximum upload size" section. But this limit should be less than the global limit that you set in this module.
	For example if you define global limit on this module's configuration page as 500 MB, you can still configure any other field seperately in "Maximum upload size"
	section but your limit should be less than global file limit which is 500 MB in this case.
	
  
Use Cases:
---------
  - This module is idle for the situation when you are hosting multiple websites on a single server and you want to increase the file limit inside one of your
	website. 
  - It is also useful in case when you are on shared server where you dont have access to php.ini file.
  - Even on dedicated server it can help because you dont need to modify your php.ini file and restart the server. It reduces the overhead of locating, changing
	and restarting the server.
  - Sometimes website owner do not have permission to go to modules page. Developers can assign permissions for this module to website owners so that they 
	can turn on/off this module by clicking checkbox and increase the global limit.
  - It can also be used on occasional purposes when you need to upload a huge file only few times (once or twice a year). In that case changing php.ini file
	is not a good approach.

Installation
------------
  Just drop this module to modules directory(/sites/all/modules).

Configuration
-------------
  To enable this module, visit administer -> modules, and enable Change File Upload Limit.

