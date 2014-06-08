'use strict';

var should = require('should');

var $Inject = require('../coverage/src/main');

describe('#inject', function () {
	describe('#Constructor', function () {
		it('should return a new object', function () {
			var i = new $Inject();
			i.should.be.an.object;
			i.should.have.property('has');
			i.should.have.property('keys');
			i.should.have.property('provider');
			i.should.have.property('factory');
			i.should.have.property('service');
			i.should.have.property('value');
			i.should.have.property('constant');
			i.should.have.property('remove');
		});
		
		it('should return a new object without new', function () {
			var i = $Inject();
			i.should.be.an.object;
			i.should.have.property('has');
			i.should.have.property('keys');
			i.should.have.property('provider');
			i.should.have.property('factory');
			i.should.have.property('service');
			i.should.have.property('value');
			i.should.have.property('constant');
			i.should.have.property('remove');
		});
	});
	
	describe('#has', function () {
		it('should return true when property exsists', function () {
			var i = new $Inject();
			i.has('$this').should.be.ok;
		});
		it('should return false when property exsists', function () {
			var i = new $Inject();
			i.has('say whuut?').should.not.be.ok;
		});
	});
	
	describe('#keys', function () {
		it('should return an array with strings with all property names', function () {
			var i = new $Inject(),
				keys = i.keys();
			
			keys.should.be.an.array;
			keys.should.be.eql(['$injector', '$this']);
		});
	});
	
	describe('#provider', function () {
		it('should create an new instance from a function $get factory method', function () {
			var i = new $Inject();
			i.provider('a', function () {
				return {
					$get: function () {
						return 123;
					}
				};
			});
			
			(i.cache.instanceCache.a === undefined).should.be.ok;
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get().should.be.eql(123);
		});
		
		it('should create an new instance from a array $get factory method', function () {
			var i = new $Inject();
			i.provider('a', [function () {
				return {
					$get: function () {
						return 123;
					}
				};
			}]);
			
			(i.cache.instanceCache.a === undefined).should.be.ok;
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get().should.be.eql(123);
		});
		
		it('should inject dependency into factory function', function () {
			var i = new $Inject();
			i.constant('b', 3.14);
			i.provider('a', function (b) {
				b.should.be.eql(3.14);
				return {
					$get: function () {
						return 123;
					}
				};
			});
			
			(i.cache.instanceCache.a === undefined).should.be.ok;
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get().should.be.eql(123);
		});
		
		it('should throw an error when $get is missing', function () {
			var i = new $Inject();
			(function () {
				i.provider('a', function () {
					return {};
				});
			}).should.throw('Provider \'a\' must define a $get factory method.');
		});
		
		it('should throw an error when an unknown provider is specified', function () {
			var i = new $Inject();
			(function () {
				i.provider('a', function (b) {
					return {$get: function () {}};
				});
			}).should.throw('Unknown provider: b');
		});
	});
	
	describe('#factory', function () {
		it('should create an new instance from a factory function', function () {
			var i = new $Inject();
			i.factory('a', function () {
				return 123;
			});
			
			(i.cache.instanceCache.a === undefined).should.be.ok;
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get().should.be.eql(123);
		});
	});
	
	describe('#service', function () {
		it('should create an new instance from a service function', function () {
			var i = new $Inject();
			i.service('a', function () {
				return 123;
			});
			
			
			i.inject(function (a) {
				a.should.be.eql(123);
			});
			
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get(i.cache.instanceCache.$injector).should.be.eql(123);
		});
	});
	
	describe('#value', function () {
		it('should create a value on namespace', function () {
			var i = new $Inject();
			i.value('a', 123);
			
			
			i.inject(function (a) {
				a.should.be.eql(123);
			});
			
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get(i.cache.instanceCache.$injector).should.be.eql(123);
		});
	});
	
	describe('#remove', function () {
		it('should create an new instance from a service function', function () {
			var i = new $Inject();
			i.service('a', function () {
				return 123;
			});
			
			
			i.inject(function (a) {
				a.should.be.eql(123);
			});
			
			i.cache.providerCache.aProvider.$get.should.be.an.function;
			i.cache.providerCache.aProvider.$get(i.cache.instanceCache.$injector).should.be.eql(123);
			
			i.remove('a');
			
			(i.cache.instanceCache.a === undefined).should.be.ok;
			(i.cache.providerCache.aProvider === undefined).should.be.ok;
		});
	});
});