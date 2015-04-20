//////////////////////////////////////////////////////////////////////////////
// SERVER SIDE
// Configure how we use fields in our MongoDB collections.
	
	
	var mongoose = require('mongoose');
	
	
	var ManifestSchema = new mongoose.Schema({
			_id: String, /* /server.js */
			icon: String, /* js -> js.svg */
			desc: String /* "The main app file that Node runs" */
		}, {
			collection: 'manifest'
		}
	);
	mongoose.model('Manifest', ManifestSchema);


	var UsersSchema = new mongoose.Schema({
			_id: String,
			password: String
		}, {
			collection: 'users'
		}
	);
	mongoose.model('Users', UsersSchema);