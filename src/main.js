'use strict';

var Namespace = require('symphony-namespace');
var internalInjector = require('symphony-internalinjector');


function $Inject() {
	if (!(this instanceof $Inject)) {
		return new $Inject();
	}
	
	this._path = [];
	this._config = {
		INSTANTIATING: Object.create(null),
		providerSuffix: 'Provider'
	};
	
	this.cache = {
		providerCache: {},
		instanceCache: {}
	};

	
	//Only run once on namespace
	this.instantiateInjector();
	this.instantiateBuiltinServices();
}

$Inject.prototype.instantiateInjector = function () {
	var me = this,
		pc = this.cache.providerCache,
		ic = this.cache.instanceCache;

	pc.$injector =
		internalInjector(this._config, pc, this._path)(pc, function () {
			throw new Error('Unknown provider: ' + me._path.join(' <- '));
		});

	ic.$injector =
		internalInjector(this._config, pc, me._path)(ic, function (servicename) {
			var provider = pc[servicename + me._config.providerSuffix];
			return ic.$injector.invoke(provider.$get, provider);
		});
};

$Inject.prototype.instantiateBuiltinServices = function () {
	//[FIXME] - Better solution for global access of adding values to namespace
	
	this.constant('$this',	this);
};

$Inject.prototype.provider = function (name, provider) {
	var providerCache = this.cache.providerCache;

	if (typeof provider === 'function' || Array.isArray(provider)) {
		provider = providerCache.$injector.instantiate(provider);
	}
	if (!provider.$get) {
		throw new Error(this._config.providerSuffix + ' \'' + name + '\' must define a $get factory method.');
	}
	
	providerCache[name + this._config.providerSuffix] = provider;

	return provider;
};

$Inject.prototype.factory = function (name, factoryFn) {
	return this.provider(name, {
		$get: factoryFn
	});
};

$Inject.prototype.service = function (name, factoryFn) {
	return this.factory(name, function ($injector) {
		return $injector.instantiate(factoryFn);
	});
};

$Inject.prototype.value = function (name, value) {
	return this.factory(name, function () {
		return value;
	});
};

$Inject.prototype.constant = function (name, value) {
	this.cache.providerCache[name] = value;
	this.cache.instanceCache[name] = value;
};


$Inject.prototype.remove = function (name) {
	//Delete from cache
	this.cache.instanceCache[name] = undefined;
	this.cache.providerCache[name + this._config.providerSuffix] = undefined;
};

$Inject.prototype.keys = function () {
	return Object.keys(this.cache.instanceCache);
};


$Inject.prototype.has = function (name) {
	return this.cache.instanceCache.$injector.has(name);
};

$Inject.prototype.inject = function (fn, params) {
	return this.cache.instanceCache.$injector.invoke(fn, undefined, params);
};

module.exports = $Inject;
