_.pick = function(obj) {
	var result = {},
		slice = Array.prototype.slice;
	_.each(_.flatten(slice.call(arguments, 1)), function(key) {
		if (key in obj) result[key] = obj[key];
	});
	return result;
};