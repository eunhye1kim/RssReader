(function () {
	var EJDB = require("ejdb");
	//Open zoo DB
	var jb = EJDB.open("zoo", EJDB.DEFAULT_OPEN_MODE | EJDB.JBOTRUNC);
	
	var parrot1 = {
	    "name" : "Grenny",
	    "type" : "African Grey",
	    "male" : true,
    	"age" : 1,
    	"birthdate" : new Date(),
    	"likes" : ["green color", "night", "toys"],
    	"extra1" : null
	};
	var parrot2 = {
	    "name" : "Bounty",
	    "type" : "Cockatoo",
	    "male" : false,
	    "age" : 15,
	    "birthdate" : new Date(),
	    "likes" : ["sugar cane"]
	};
	
    jb.find("zoo",
        {"likes" : "toys"},
        {"$orderby" : {"name" : 1}},
        function(err, cursor, count) {
 	        if (err) {
	            console.error(err);
	   	        return;
	   	    }
	       	console.log("Found " + count + " parrots");
	        while (cursor.next()) {}
       		cursor.close(); //It's not mandatory to close cursor explicitly
       		jb.close(); //Close the database
    	});
})();
