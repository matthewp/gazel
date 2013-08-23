Client.prototype.handleError = function() {
	var args = ['error'].concat(slice.call(arguments));
	this.emit.apply(this, args);	
};
