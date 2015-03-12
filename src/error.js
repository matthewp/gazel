import slice from './slice';

export function handleError() {
	var args = ['error'].concat(slice.call(arguments));
	this.emit.apply(this, args);	
};
