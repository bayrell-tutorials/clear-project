"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.rtl = function()
{
};
Object.assign(Runtime.rtl.prototype,
{
	/**
	 * Debug
	 */
	trace: function()
	{
	},
	getClassName: function()
	{
		return "Runtime.rtl";
	},
});
Object.assign(Runtime.rtl,
{
	LOG_FATAL: 0,
	LOG_CRITICAL: 2,
	LOG_ERROR: 4,
	LOG_WARNING: 6,
	LOG_INFO: 8,
	LOG_DEBUG: 10,
	LOG_DEBUG2: 12,
	STATUS_PLAN: 0,
	STATUS_DONE: 1,
	STATUS_PROCESS: 100,
	STATUS_FAIL: -1,
	ERROR_NULL: 0,
	ERROR_OK: 1,
	ERROR_PROCCESS: 100,
	ERROR_FALSE: -100,
	ERROR_UNKNOWN: -1,
	ERROR_INDEX_OUT_OF_RANGE: -2,
	ERROR_KEY_NOT_FOUND: -3,
	ERROR_STOP_ITERATION: -4,
	ERROR_FILE_NOT_FOUND: -5,
	ERROR_ITEM_NOT_FOUND: -5,
	ERROR_OBJECT_DOES_NOT_EXISTS: -5,
	ERROR_OBJECT_ALLREADY_EXISTS: -6,
	ERROR_ASSERT: -7,
	ERROR_REQUEST: -8,
	ERROR_RESPONSE: -9,
	ERROR_CSRF_TOKEN: -10,
	ERROR_RUNTIME: -11,
	ERROR_VALIDATION: -12,
	ERROR_PARSE_SERIALIZATION_ERROR: -14,
	ERROR_ASSIGN_DATA_STRUCT_VALUE: -15,
	ERROR_AUTH: -16,
	ERROR_DUPLICATE: -17,
	ERROR_API_NOT_FOUND: -18,
	ERROR_API_WRONG_FORMAT: -19,
	ERROR_API_WRONG_APP_NAME: -20,
	ERROR_FATAL: -99,
	ERROR_HTTP_CONTINUE: -100,
	ERROR_HTTP_SWITCH: -101,
	ERROR_HTTP_PROCESSING: -102,
	ERROR_HTTP_OK: -200,
	ERROR_HTTP_BAD_GATEWAY: -502,
	_memorize_cache: null,
	_memorize_not_found: null,
	_memorize_hkey: null,
	_global_context: null,
	/**
	 * Define class
	 */
	defClass: function(obj)
	{
		if (Runtime.rtl._classes == undefined) Runtime.rtl._classes = {};
		Runtime.rtl._classes[obj.getCurrentClassName()] = obj;
	},
	/**
	 * Find class instance by name. If class does not exists return null.
	 * @return var - class instance
	 */
	find_class: function(class_name)
	{
		if (class_name instanceof Function)
			return class_name;
		
		if (window[class_name] != undefined)
			return window[class_name];
			
		return Runtime.rtl._classes[class_name];
		
		if (class_name instanceof Runtime.BaseObject) class_name = class_name.getClassName();
		else if (class_name instanceof Object) class_name = class_name.constructor.name;
		
		if (Runtime.rtl._classes==undefined) Runtime.rtl._classes = {};
		if (Runtime.rtl._classes[class_name]!=undefined) return Runtime.rtl._classes[class_name];
		
		var arr = class_name.split('.');
		var obj = window;
		
		for (var i=0; i<arr.length; i++){
			var key = arr[i];
			if (obj[key] == undefined)
				return null;
			obj = obj[key];
		}
		
		Runtime.rtl._classes[class_name] = obj;
		return obj;
	},
	/**
	 * Returns true if class instanceof class_name
	 * @return bool
	 */
	is_instanceof: function(obj, class_name)
	{
		var c = this.find_class(class_name);
		if (c == null) return false;
		return c.prototype.isPrototypeOf(obj);
	},
	/**
	 * Returns true if obj implements interface_name
	 * @return bool
	 */
	is_implements: function(obj, interface_name)
	{
		if (obj == undefined) return false;
		if (obj.constructor.__implements__ == undefined) return false;
		return obj.constructor.__implements__.indexOf(interface_name) != -1;
	},
	/**
	 * Returns true if class exists
	 * @return bool
	 */
	class_exists: function(class_name)
	{
		var obj = this.find_class(class_name);
		if (!this.exists(obj)) return false;
		return true;
	},
	/**
	 * Returns true if class exists
	 * @return bool
	 */
	class_implements: function(class_name, interface_name)
	{
		var obj = this.find_class(class_name);
		var obj2 = this.find_class(interface_name);
		
		while (obj != null){
			if (obj.__implements__){
				if (obj.__implements__.indexOf( obj2 ) > -1 ){
					return true;
				}
			}
			obj = obj.__proto__;
		}
		
		return false;
	},
	/**
	 * Returns interface of class
	 * @param string class_name
	 * @return Collection<string>
	 */
	getInterfaces: function(class_name)
	{
		return this.find_class(class_name).__implements__;
	},
	/**
	 * Returns true if class exists
	 * @return bool
	 */
	method_exists: function(class_name, method_name)
	{
		if (typeof(class_name) == "object")
		{
			if (class_name[method_name] != undefined) return true;
			return false;
		}
		
		var obj = this.find_class(class_name);
		if (!this.exists(obj)) return false;
		if (this.exists(obj[method_name])) return true;
		return false;
	},
	/**
	 * Create object by class_name. If class name does not exists return null
	 * @return Object
	 */
	newInstance: function(class_name, args)
	{
		if (args == undefined) args = null;
		var obj = this.find_class(class_name);
		if (!this.exists(obj)) return null;
		if (!(obj instanceof Function)) return null;
		if (args == undefined || args == null){ args = []; } else { args = args.toArray(); }
		args = args.slice(); 
		args.unshift();
		args.unshift(null);
		var f = Function.prototype.bind.apply(obj, args);
		return new f;
	},
	/**
	 * Returns callback
	 * @return fn
	 */
	method: function(obj, method_name)
	{
		var save = obj;
		if (!(obj instanceof Object))
		{
			var find_obj = this.find_class(obj);
			if (find_obj == null)
			{
				throw new Error("Object " + obj + " not found");
			}
			obj = find_obj;
		}
		
		if (obj[method_name] == null || obj[method_name] == "undefined")
		{
			var class_name = "";
			if (obj.getClassName != undefined) class_name = obj.getClassName();
			else if (obj.getCurrentClassName != undefined) class_name = obj.getCurrentClassName();
			else class_name = save;
			throw new Error("Method " + method_name + " not found in " + class_name);
		}
		
		return obj[method_name].bind(obj);
		return function(obj, method_name){ return function () {
			return obj[method_name].apply(obj, arguments);
		}}(obj, method_name);
	},
	/**
	 * Returns callback
	 * @return fn
	 */
	apply: function(f, args)
	{
		var is_ctx = false;
		var res;
		if (args == null) args = [];
		else args = Array.prototype.slice.call(args);
		
		if (typeof ctx != "undefined") args.unshift();
		if (this.isString(f))
		{
			var a = f.split("::");
			var c = a[0]; var m = a[1];
			c = this.find_class(c);
			f = c[m];
			res = f.apply(c, args);
		}
		else
		{
			res = f.apply(null, args);
		}
		
		return res;
	},
	/**
	 * Call await method
	 * @return fn
	 */
	applyAsync: async function(f, args)
	{
		var res;
		if (args == null) args = [];
		else args = Array.prototype.slice.call(args);
		
		if (typeof ctx != "undefined") args.unshift();
		if (this.isString(f))
		{
			var a = f.split("::");
			var c = a[0]; var m = a[1];
			c = this.find_class(c);
			f = c[m];
			res = await f.apply(c, args);
		}
		else
		{
			res = await f.apply(null, args);
		}
		
		return res;
	},
	/**
	 * Apply method
	 * @return var
	 */
	methodApply: function(class_name, method_name, args)
	{
		if (args == undefined) args = null;
		var f = Runtime.rtl.method(class_name, method_name);
		return Runtime.rtl.apply(f, args);
	},
	applyMethod: function(class_name, method_name, args)
	{
		if (args == undefined) args = null;
		return this.methodApply(class_name, method_name, args);
	},
	/**
	 * Apply method async
	 * @return var
	 */
	methodApplyAsync: async function(class_name, method_name, args)
	{
		if (args == undefined) args = null;
		var f = Runtime.rtl.method(class_name, method_name);
		return Promise.resolve(await Runtime.rtl.applyAsync(f, args));
	},
	applyMethodAsync: async function(class_name, method_name, args)
	{
		if (args == undefined) args = null;
		return await this.methodApplyAsync(class_name, method_name, args);
	},
	/**
	 * Returns value
	 */
	get: function(item, key, def_val)
	{
		if (def_val == undefined) def_val = null;
		return this.attr(item, key, def_val);
	},
	/**
	 * Returns callback
	 * @return var
	 */
	attr: function(item, path, def_val)
	{
		if (def_val == undefined) def_val = null;
		if (path === null)
		{
			return def_val;
		}
		var Collection = use("Runtime.Collection");
		var Dict = use("Runtime.Dict");
		var BaseStruct = use("Runtime.BaseStruct");
		
		if (def_val == undefined) def_val = null;
		if (item === null) return def_val;
		if (item === undefined) return def_val;
		if (Array.isArray(path) && path.count == undefined) path = Collection.from(path);
		if (this.isScalarValue(path)) path = Collection.from([path]);
		if (!(path instanceof Collection)) return def_val;
		if (path.count() == 0)
		{
			return item;
		}
		var key = path.first();
		var path = path.removeFirstIm();
		var val = def_val;
		if (item instanceof Dict || item instanceof Collection)
		{
			var new_item = item.get(key, def_val);
			val = this.attr(new_item, path, def_val);
			return val;
		}
		else if (item instanceof BaseStruct)
		{
			var new_item = item.get(key, def_val);
			val = this.attr(new_item, path, def_val);
			return val;
		}
		else
		{
			var new_item = item[key] || def_val;
			val = this.attr(new_item, path, def_val);
			return val;
		}
		return val;
	},
	/**
	 * Update current item
	 * @return var
	 */
	setAttr: function(item, attrs, new_value)
	{
		if (attrs == null)
		{
			return item;
		}
		var Collection = use("Runtime.Collection");
		if (typeof attrs == "string") attrs = Collection.from([attrs]);
		else if (Array.isArray(attrs) && attrs.count == undefined) attrs = Collection.from(attrs);
		var f = (attrs, data, new_value, f) => 
		{
			if (attrs.count() == 0)
			{
				return new_value;
			}
			if (data == null)
			{
				data = Runtime.Dict.from({});
			}
			var new_data = null;
			var attr_name = attrs.first();
			if (data instanceof Runtime.BaseStruct)
			{
				var attr_data = data.get(attr_name, null);
				var res = f(attrs.removeFirstIm(), attr_data, new_value, f);
				new_data = data.copy((new Runtime.Map()).setValue(attr_name, res));
			}
			else if (data instanceof Runtime.Dict)
			{
				var attr_data = data.get(attr_name, null);
				var res = f(attrs.removeFirstIm(), attr_data, new_value, f);
				new_data = data.setIm(attr_name, res);
			}
			else if (data instanceof Runtime.Collection)
			{
				var attr_data = data.get(attr_name, null);
				var res = f(attrs.removeFirstIm(), attr_data, new_value, f);
				new_data = data.setIm(attr_name, res);
			}
			return new_data;
		};
		var new_item = f(attrs, item, new_value, f);
		return new_item;
	},
	/**
	 * Returns value
	 * @param var value
	 * @param var def_val
	 * @param var obj
	 * @return var
	 */
	to: function(v, o)
	{
		var e = o.e;
		if (e == "mixed" || e == "primitive" || e == "var" || e == "fn" || e == "callback")
		{
			return v;
		}
		if (e == "bool")
		{
			return this.toBool(null, v);
		}
		else if (e == "string")
		{
			return this.toString(null, v);
		}
		else if (e == "int")
		{
			return this.toInt(null, v);
		}
		else if (e == "float")
		{
			return this.toFloat(null, v);
		}
		else if (Runtime.rtl.is_instanceof(null, v, e))
		{
			return v;
		}
		return v;
	},
	/**
	 * Convert monad by type
	 */
	m_to: function(type_value, def_value)
	{
		if (def_value == undefined) def_value = null;
		return (m) => 
		{
			return new Runtime.Monad((m.err == null) ? (this.convert(m.val, type_value, def_value)) : (def_value));
		};
	},
	/**
	 * Convert monad to default value
	 */
	m_def: function(def_value)
	{
		if (def_value == undefined) def_value = null;
		return (m) => 
		{
			return (m.err != null || m.val === null) ? (new Runtime.Monad(def_value)) : (m);
		};
	},
	/**
	 * Returns value if value instanceof type_value, else returns def_value
	 * @param var value
	 * @param string type_value
	 * @param var def_value
	 * @param var type_template
	 * @return var
	 */
	convert: function(v, t, d)
	{
		if (d == undefined) d = null;
		if (v === null)
		{
			return d;
		}
		if (t == "mixed" || t == "primitive" || t == "var" || t == "fn" || t == "callback")
		{
			return v;
		}
		if (t == "bool" || t == "boolean")
		{
			return this.toBool(v);
		}
		else if (t == "string")
		{
			return this.toString(v);
		}
		else if (t == "int")
		{
			return this.toInt(v);
		}
		else if (t == "float" || t == "double")
		{
			return this.toFloat(v);
		}
		else if (this.is_instanceof(v, t))
		{
			return v;
		}
		return this.toObject(v, t, d);
	},
	/**
	 * Returns true if value instanceof tp
	 * @param var value
	 * @param string tp
	 * @return bool
	 */
	checkValue: function(value, tp)
	{
		if (tp == "int")
		{
			return Runtime.rtl.isInt(value);
		}
		if (tp == "float" || tp == "double")
		{
			return Runtime.rtl.isDouble(value);
		}
		if (tp == "string")
		{
			return Runtime.rtl.isString(value);
		}
		if (tp == "bool" || tp == "boolean")
		{
			return Runtime.rtl.isBoolean(value);
		}
		if (Runtime.rtl.is_instanceof(value, tp))
		{
			return true;
		}
		return false;
	},
	/**
	 * Return true if value is empty
	 * @param var value
	 * @return bool
	 */
	isEmpty: function(value)
	{
		return !this.exists(value) || value === null || value === "" || value === false || value === 0;
	},
	/**
	 * Return true if value is exists
	 * @param var value
	 * @return bool
	 */
	exists: function(value)
	{
		return (value != null) && (value != undefined);
	},
	/**
	 * Returns true if value is scalar value
	 * @return bool 
	 */
	isScalarValue: function(value)
	{
		if (value == null)
		{
			return true;
		}
		if (Runtime.rtl.isString(value))
		{
			return true;
		}
		if (Runtime.rtl.isNumber(value))
		{
			return true;
		}
		if (Runtime.rtl.isBoolean(value))
		{
			return true;
		}
		return false;
	},
	/**
	 * Return true if value is boolean
	 * @param var value
	 * @return bool
	 */
	isBoolean: function(value)
	{
		if (value === false || value === true)
		{
			return true;
		}
		return false;
	},
	/**
	 * Return true if value is boolean
	 * @param var value
	 * @return bool
	 */
	isBool: function(value)
	{
		return this.isBoolean(value);
	},
	/**
	 * Return true if value is number
	 * @param var value
	 * @return bool
	 */
	isInt: function(value)
	{
		if (typeof value != "number") return false;
		if (value % 1 !== 0) return false;
		return true;
	},
	/**
	 * Return true if value is number
	 * @param var value
	 * @return bool
	 */
	isDouble: function(value)
	{
		if (typeof value == "number") return true;
		return false;
	},
	/**
	 * Return true if value is number
	 * @param var value
	 * @return bool
	 */
	isNumber: function(value)
	{
		if (typeof value == "number") return true;
		return false;
	},
	/**
	 * Return true if value is string
	 * @param var value
	 * @return bool
	 */
	isString: function(value)
	{
		if (typeof value == 'string') return true;
		else if (value instanceof String) return true;
		return false;
	},
	/**
	 * Return true if value is function
	 * @param var value
	 * @return bool
	 */
	isFn: function(value)
	{
		if (typeof(value) == 'function') return true;
		return false;
	},
	/**
	 * Convert value to string
	 * @param var value
	 * @return string
	 */
	toString: function(value)
	{
		var _StringInterface = use("Runtime.Interfaces.StringInterface");
		
		if (value === null) return "";
		if (typeof value == 'string') return value;
		if (value instanceof String) return "" + value;
		if (this.is_implements(null, value, _StringInterface)) return value.toString();
		return ""+value;
	},
	/**
	 * Convert value to string
	 * @param var value
	 * @return string
	 */
	toStr: function(value)
	{
		return this.toString(value);
	},
	/**
	 * Convert value to int
	 * @param var value
	 * @return int
	 */
	toInt: function(val)
	{
		var res = parseInt(val);
		var s_res = new String(res);
		var s_val = new String(val);
		if (s_res.localeCompare(s_val) == 0)
			return res;
		return 0;
	},
	/**
	 * Convert value to boolean
	 * @param var value
	 * @return bool
	 */
	toBool: function(val)
	{
		var res = false;
		if (val == false || val == 'false') return false;
		if (val == true || val == 'true') return true;
		var s_res = new String(res);
		var s_val = new String(val);
		if (s_res.localeCompare(s_val) == 0)
			return res;
		return false;
	},
	/**
	 * Convert value to float
	 * @param var value
	 * @return float
	 */
	toFloat: function(val)
	{
		var res = parseFloat(val);
		var s_res = new String(res);
		var s_val = new String(val);
		if (s_res.localeCompare(s_val) == 0)
			return res;
		return 0;
	},
	/**
	 * Convert to object
	 */
	toObject: function(v, t, d)
	{
		if (d == undefined) d = null;
		if (this.is_instanceof(v, t))
		{
			return v;
		}
		if (t == "Runtime.Collection")
		{
			return Runtime.Collection.from(v);
		}
		if (t == "Runtime.Vector")
		{
			return Runtime.Vector.from(v);
		}
		if (t == "Runtime.Dict")
		{
			return Runtime.Dict.from(v);
		}
		if (t == "Runtime.Map")
		{
			return Runtime.Map.from(v);
		}
		try
		{
			var newInstance = this.method(t, "newInstance");
			return newInstance(v);
		}
		catch (_ex)
		{
			if (true)
			{
				var e = _ex;
			}
			else
			{
				throw _ex;
			}
		}
		return d;
	},
	/**
	 * Round up
	 * @param double value
	 * @return int
	 */
	ceil: function(value)
	{
		return Math.ceil(value);
	},
	/**
	 * Round down
	 * @param double value
	 * @return int
	 */
	floor: function(value)
	{
		return Math.floor(value);
	},
	/**
	 * Round down
	 * @param double value
	 * @return int
	 */
	round: function(value)
	{
		return Math.round(value);
	},
	_memorizeValidHKey: function(hkey, key)
	{
	},
	/**
	 * Clear memorize cache
	 */
	_memorizeClear: function()
	{
		this._memorize_cache = null;
	},
	/**
	 * Returns cached value
	 */
	_memorizeValue: function(name, args)
	{
		if (this._memorize_cache == null) return this._memorize_not_found;
		if (this._memorize_cache[name] == undefined) return this._memorize_not_found;
		var arr = this._memorize_cache[name];
		var sz = args.length;
		for (var i=0; i<sz; i++)
		{
			var key = args[i];
			var hkey = null;
			if (key != null && typeof key == 'object')
			{
				if (key.__uq__ != undefined) hkey = key.__uq__;
				else return this._memorize_not_found;
			}
			else if (typeof key == 'string') hkey = "__s_" + key;
			else hkey = key;
			if (i == sz - 1)
			{
				if (arr[hkey] == undefined) return this._memorize_not_found;
				return arr[hkey];
			}
			else
			{
				if (arr[hkey] == undefined) arr[hkey] = {};
				arr = arr[hkey];
			}
		}
		
		return this._memorize_not_found;
	},
	/**
	 * Returns cached value
	 */
	_memorizeSave: function(name, args, value)
	{
		if (this._memorize_cache == null) this._memorize_cache = {};
		if (this._memorize_cache[name] == undefined) this._memorize_cache[name] = {};
		var arr = this._memorize_cache[name];
		var sz = args.length;
		for (var i=0; i<sz; i++)
		{
			var key = args[i];
			var hkey = null;
			if (key != null && typeof key == 'object')
			{
				if (key.__uq__ != undefined) hkey = key.__uq__;
				else hkey = null;
			}
			else if (typeof key == 'string') hkey = "__s_" + key;
			else hkey = key;
			if (i == sz - 1)
			{
				arr[hkey] = value;
			}
			else
			{
				if (arr[hkey] == undefined) arr[hkey] = {};
				arr = arr[hkey];
			}
		}
	},
	/* ================ Dirty functions ================ */
	/**
	 * Sleep in ms
	 */
	sleep: async function(time)
	{
		await new Promise((f, e) => setTimeout(f, time));
	},
	/**
	 * Sleep in microseconds
	 */
	usleep: async function(time)
	{
		setTimeout
		(
			(function (__async_t)
			{
				return function()
				{
					__async_t.resolve(null);
				};
			})(__async_t),
			Math.round(time / 1000)
		);
		return;
	},
	/**
	 * Returns unique value
	 * @param bool flag If true returns as text. Default true
	 * @return string
	 */
	unique: function(flag)
	{
		if (flag == undefined) flag = true;
		if (flag == undefined) flag = true;
		if (flag)
			return "" + (new Date).getTime() + Math.floor((Math.random() * 899999 + 100000));
		return Symbol();
	},
	/**
	 * Generate uuid
	 */
	uid: function()
	{
	},
	/**
	 * Generate timestamp based uuid
	 */
	time_uid: function()
	{
	},
	/**
	 * Returns random value x, where a <= x <= b
	 * @param int a
	 * @param int b
	 * @return int
	 */
	random: function(a, b)
	{
		if (window != undefined && window.crypto != undefined && window.crypto.getRandomValues != undefined)
		{
			var s = new Uint32Array(1);
			window.crypto.getRandomValues(s);
			return Math.floor(s[0] / 4294967296 * (b - a + 1) + a);
		}
		return Math.floor(Math.random() * (b - a + 1) + a);
	},
	/**
	 * Returns current unix time in seconds
	 * @return int
	 */
	time: function()
	{
		return Math.round((new Date()).getTime() / 1000);
	},
	/**
	 * Returns unix timestamp
	 */
	utime: function()
	{
		return (new Date()).getTime() * 1000;
	},
	/**
	 * Returns global context
	 * @return Context
	 */
	getContext: function()
	{
		return Runtime.rtl._global_context;
	},
	/**
	 * Set global context
	 * @param Context context
	 */
	setContext: function(context)
	{
		use("Runtime.rtl")._global_context = context;
		return context;
	},
	/* ============================= Runtime Utils Functions ============================= */
	/**
	 * Json encode data
	 * @param var data
	 * @return string
	 */
	json_encode: function(data)
	{
		var f = this.method("Runtime.RuntimeUtils", "json_encode");
		return f(data);
	},
	/**
	 * Json decode to primitive values
	 * @param string s Encoded string
	 * @return var
	 */
	json_decode: function(obj)
	{
		var f = this.method("Runtime.RuntimeUtils", "json_decode");
		return f(obj);
	},
	/**
	 * Returns parents class names
	 * @return Vector<string>
	 */
	getParents: function(class_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getParents", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var res = new Runtime.Vector();
		while (class_name != "")
		{
			res.pushValue(class_name);
			class_name = this.methodApply(class_name, "getParentClassName");
		}
		var __memorize_value = res.toCollection();
		Runtime.rtl._memorizeSave("Runtime.rtl.getParents", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns class annotations
	 */
	getClassAnnotations: function(class_name, res)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getClassAnnotations", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		if (res == undefined) res = null;
		if (res == null)
		{
			res = Runtime.Collection.from([]);
		}
		var info = this.methodApply(class_name, "getClassInfo");
		var __v0 = new Runtime.Monad(Runtime.rtl.get(info, "annotations"));
		__v0 = __v0.monad(Runtime.rtl.m_to("Runtime.Collection", Runtime.Collection.from([])));
		var arr = __v0.value();
		var __memorize_value = res.concat(arr);
		Runtime.rtl._memorizeSave("Runtime.rtl.getClassAnnotations", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns class annotations with parents
	 */
	getClassAnnotationsWithParents: function(class_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getClassAnnotationsWithParents", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var res = Runtime.Dict.from({});
		var parents = this.getParents(class_name);
		for (var i = 0;i < parents.count();i++)
		{
			var parent_class_name = Runtime.rtl.get(parents, i);
			res = this.getClassAnnotations(parent_class_name, res);
		}
		var __memorize_value = res;
		Runtime.rtl._memorizeSave("Runtime.rtl.getClassAnnotationsWithParents", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns field info
	 */
	getFieldInfo: function(class_name, field_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getFieldInfo", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var res = this.methodApply(class_name, "getFieldInfoByName", Runtime.Collection.from([field_name]));
		var __memorize_value = res;
		Runtime.rtl._memorizeSave("Runtime.rtl.getFieldInfo", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns field info
	 */
	getFieldInfoWithParents: function(class_name, field_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getFieldInfoWithParents", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var parents = this.getParents(class_name);
		for (var i = 0;i < parents.count();i++)
		{
			var parent_class_name = Runtime.rtl.get(parents, i);
			var res = this.methodApply(parent_class_name, "getFieldInfoByName", Runtime.Collection.from([field_name]));
			if (res != null)
			{
				var __memorize_value = res;
				Runtime.rtl._memorizeSave("Runtime.rtl.getFieldInfoWithParents", arguments, __memorize_value);
				return __memorize_value;
			}
		}
		var __memorize_value = null;
		Runtime.rtl._memorizeSave("Runtime.rtl.getFieldInfoWithParents", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns fields of class
	 */
	getFields: function(class_name, flag)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getFields", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		if (flag == undefined) flag = 255;
		var names = new Runtime.Vector();
		var parents = this.getParents(class_name);
		for (var i = 0;i < parents.count();i++)
		{
			var parent_class_name = Runtime.rtl.get(parents, i);
			var item_fields = this.methodApply(parent_class_name, "getFieldsList", Runtime.Collection.from([flag]));
			if (item_fields != null)
			{
				names.appendVector(item_fields);
			}
		}
		var __memorize_value = names.toCollection().removeDuplicatesIm();
		Runtime.rtl._memorizeSave("Runtime.rtl.getFields", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns fields annotations
	 */
	getFieldsAnnotations: function(class_name, res)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getFieldsAnnotations", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		if (res == undefined) res = null;
		if (res == null)
		{
			res = Runtime.Dict.from({});
		}
		var methods = this.methodApply(class_name, "getFieldsList", Runtime.Collection.from([255]));
		for (var i = 0;i < methods.count();i++)
		{
			var method_name = Runtime.rtl.get(methods, i);
			var info = this.methodApply(class_name, "getFieldInfoByName", Runtime.Collection.from([method_name]));
			var annotations = Runtime.rtl.get(info, "annotations");
			var __v0 = new Runtime.Monad(Runtime.rtl.get(res, method_name));
			__v0 = __v0.monad(Runtime.rtl.m_to("Runtime.Collection", Runtime.Collection.from([])));
			var arr = __v0.value();
			res = Runtime.rtl.setAttr(res, Runtime.Collection.from([method_name]), arr.concat(annotations));
		}
		var __memorize_value = res;
		Runtime.rtl._memorizeSave("Runtime.rtl.getFieldsAnnotations", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns fields annotations with parents
	 */
	getFieldsAnnotationsWithParents: function(class_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getFieldsAnnotationsWithParents", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var res = Runtime.Dict.from({});
		var parents = this.getParents(class_name);
		for (var i = 0;i < parents.count();i++)
		{
			var parent_class_name = Runtime.rtl.get(parents, i);
			res = this.getFieldsAnnotations(parent_class_name, res);
		}
		var __memorize_value = res;
		Runtime.rtl._memorizeSave("Runtime.rtl.getFieldsAnnotationsWithParents", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns methods annotations
	 */
	getMethodsAnnotations: function(class_name, res)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getMethodsAnnotations", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		if (res == undefined) res = null;
		if (res == null)
		{
			res = Runtime.Dict.from({});
		}
		var methods = this.methodApply(class_name, "getMethodsList", Runtime.Collection.from([255]));
		for (var i = 0;i < methods.count();i++)
		{
			var method_name = Runtime.rtl.get(methods, i);
			var info = this.methodApply(class_name, "getMethodInfoByName", Runtime.Collection.from([method_name]));
			var annotations = Runtime.rtl.get(info, "annotations");
			var __v0 = new Runtime.Monad(Runtime.rtl.get(res, method_name));
			__v0 = __v0.monad(Runtime.rtl.m_to("Runtime.Collection", Runtime.Collection.from([])));
			var arr = __v0.value();
			res = Runtime.rtl.setAttr(res, Runtime.Collection.from([method_name]), arr.concat(annotations));
		}
		var __memorize_value = res;
		Runtime.rtl._memorizeSave("Runtime.rtl.getMethodsAnnotations", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns methods annotations with parents
	 */
	getMethodsAnnotationsWithParents: function(class_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.rtl.getMethodsAnnotationsWithParents", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var res = Runtime.Dict.from({});
		var parents = this.getParents(class_name);
		for (var i = 0;i < parents.count();i++)
		{
			var parent_class_name = Runtime.rtl.get(parents, i);
			res = this.getMethodsAnnotations(parent_class_name, res);
		}
		var __memorize_value = res;
		Runtime.rtl._memorizeSave("Runtime.rtl.getMethodsAnnotationsWithParents", arguments, __memorize_value);
		return __memorize_value;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.rtl";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "LOG_FATAL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "LOG_CRITICAL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "LOG_ERROR") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "LOG_WARNING") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "LOG_INFO") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "LOG_DEBUG") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "LOG_DEBUG2") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "STATUS_PLAN") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "STATUS_DONE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "STATUS_PROCESS") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "STATUS_FAIL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_NULL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_OK") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_PROCCESS") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_FALSE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_UNKNOWN") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_INDEX_OUT_OF_RANGE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_KEY_NOT_FOUND") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_STOP_ITERATION") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_FILE_NOT_FOUND") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_ITEM_NOT_FOUND") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_OBJECT_DOES_NOT_EXISTS") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_OBJECT_ALLREADY_EXISTS") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_ASSERT") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_REQUEST") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_RESPONSE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_CSRF_TOKEN") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_RUNTIME") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_VALIDATION") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_PARSE_SERIALIZATION_ERROR") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_ASSIGN_DATA_STRUCT_VALUE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_AUTH") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_DUPLICATE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_API_NOT_FOUND") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_API_WRONG_FORMAT") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_API_WRONG_APP_NAME") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_FATAL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_HTTP_CONTINUE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_HTTP_SWITCH") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_HTTP_PROCESSING") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_HTTP_OK") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ERROR_HTTP_BAD_GATEWAY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "_memorize_cache") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "_memorize_not_found") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "_memorize_hkey") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "_global_context") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.rtl);
window["Runtime.rtl"] = Runtime.rtl;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.rtl;
var use = function(s){return Runtime.rtl.find_class(s);}
if (typeof Runtime != 'undefined' && typeof Runtime.rtl != 'undefined')
	Runtime.rtl._memorize_not_found = {'s':'memorize_key_not_found','id':Symbol()};
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
/* Lambda Functions */
Runtime.lib = function()
{
};
Object.assign(Runtime.lib.prototype,
{
	getClassName: function()
	{
		return "Runtime.lib";
	},
});
Object.assign(Runtime.lib,
{
	/**
	 * Check object is istance
	 */
	isInstance: function(class_name)
	{
		return (item) => 
		{
			return Runtime.rtl.is_instanceof(item, class_name);
		};
	},
	/**
	 * Check object is implements interface
	 */
	isImplements: function(class_name)
	{
		return (item) => 
		{
			return Runtime.rtl.is_implements(item, class_name);
		};
	},
	/**
	 * Check class is implements interface
	 */
	classImplements: function(class_name)
	{
		return (item) => 
		{
			return Runtime.rtl.class_implements(item, class_name);
		};
	},
	/**
	 * Create struct
	 */
	createStruct: function(class_name)
	{
		return (data) => 
		{
			return Runtime.rtl.newInstance(class_name, Runtime.Collection.from([data]));
		};
	},
	/**
	 * Equal two struct by key
	 */
	equal: function(value)
	{
		return (item) => 
		{
			return item == value;
		};
	},
	/**
	 * Equal two struct by key
	 */
	equalNot: function(value)
	{
		return (item) => 
		{
			return item != value;
		};
	},
	/**
	 * Equal two struct by key
	 */
	equalAttr: function(key, value)
	{
		return (item1) => 
		{
			return (item1 != null) ? (Runtime.rtl.attr(item1, key) == value) : (false);
		};
	},
	/**
	 * Equal two struct by key
	 */
	equalNotAttr: function(key, value)
	{
		return (item1) => 
		{
			return (item1 != null) ? (Runtime.rtl.attr(item1, key) != value) : (false);
		};
	},
	equalAttrNot: function(key, value)
	{
		return this.equalNotAttr(key, value);
	},
	/**
	 * Equal attrs
	 */
	equalAttrs: function(search)
	{
		return (item) => 
		{
			var fields = search.keys();
			for (var i = 0;i < fields.count();i++)
			{
				var field_name = Runtime.rtl.get(fields, i);
				if (Runtime.rtl.get(search, field_name) != Runtime.rtl.get(item, field_name))
				{
					return false;
				}
			}
			return true;
		};
	},
	/**
	 * Equal two struct by key
	 */
	equalMethod: function(method_name, value)
	{
		return (item1) => 
		{
			if (item1 == null)
			{
				return false;
			}
			var f = Runtime.rtl.method(item1, method_name);
			return f() == value;
		};
	},
	/**
	 * Returns key value of obj
	 */
	get: function(key, def_value)
	{
		return (obj) => 
		{
			return Runtime.rtl.attr(obj, Runtime.Collection.from([key]), def_value);
		};
	},
	/**
	 * Set value
	 */
	set: function(key, value)
	{
		return (obj) => 
		{
			return Runtime.rtl.setAttr(obj, Runtime.Collection.from([key]), value);
		};
	},
	/**
	 * Returns attr of item
	 */
	attr: function(path, def_value)
	{
		if (def_value == undefined) def_value = null;
		return (obj) => 
		{
			return Runtime.rtl.attr(obj, path, def_value);
		};
	},
	/**
	 * Set dict attr
	 */
	setAttr: function(path, value)
	{
		return (obj) => 
		{
			return Runtime.rtl.setAttr(obj, path, value);
		};
	},
	/**
	 * Returns max id from items
	 */
	getMaxIdFromItems: function(items, start)
	{
		if (start == undefined) start = 0;
		return items.reduce((value, item) => 
		{
			return (item.id > value) ? (item.id) : (value);
		}, start);
	},
	/**
	 * Copy object
	 */
	copy: function(d)
	{
		return (item) => 
		{
			return item.copy(d);
		};
	},
	/**
	 * Take dict
	 */
	takeDict: function(fields)
	{
		return (item) => 
		{
			return item.takeDict(fields);
		};
	},
	/**
	 * Map
	 */
	map: function(f)
	{
		return (m) => 
		{
			return m.map(f);
		};
	},
	/**
	 * Filter
	 */
	filter: function(f)
	{
		return (m) => 
		{
			return m.filter(f);
		};
	},
	/**
	 * Intersect
	 */
	intersect: function(arr)
	{
		return (m) => 
		{
			return m.intersect(arr);
		};
	},
	/**
	 * Sort
	 */
	sort: function(f)
	{
		return (m) => 
		{
			return m.sortIm(f);
		};
	},
	/**
	 * Transition
	 */
	transition: function(f)
	{
		return (m) => 
		{
			return m.transition(f);
		};
	},
	/**
	 * Sort asc
	 */
	sortAsc: function(a, b)
	{
		return (a > b) ? (1) : ((a < b) ? (-1) : (0));
	},
	/**
	 * Sort desc
	 */
	sortDesc: function(a, b)
	{
		return (a > b) ? (-1) : ((a < b) ? (1) : (0));
	},
	/**
	 * Sort attr
	 */
	sortAttr: function(field_name, f)
	{
		return (a, b) => 
		{
			var a = Runtime.rtl.get(a, field_name);
			var b = Runtime.rtl.get(b, field_name);
			if (f == "asc")
			{
				return (a > b) ? (1) : ((a < b) ? (-1) : (0));
			}
			if (f == "desc")
			{
				return (a > b) ? (-1) : ((a < b) ? (1) : (0));
			}
			return f(a, b);
		};
	},
	/**
	 * Convert monad by type
	 */
	to: function(type_value, def_value)
	{
		if (def_value == undefined) def_value = null;
		return (m) => 
		{
			return new Runtime.Monad((m.err == null) ? (Runtime.rtl.convert(m.value(), type_value, def_value)) : (def_value));
		};
	},
	/**
	 * Convert monad by type
	 */
	default: function(def_value)
	{
		if (def_value == undefined) def_value = null;
		return (m) => 
		{
			return (m.err != null || m.val === null) ? (new Runtime.Monad(def_value)) : (m);
		};
	},
	/**
	 * Set monad new value
	 */
	newValue: function(value, clear_error)
	{
		if (value == undefined) value = null;
		if (clear_error == undefined) clear_error = false;
		return (m) => 
		{
			return (clear_error == true) ? (new Runtime.Monad(value)) : ((m.err == null) ? (new Runtime.Monad(value)) : (m));
		};
	},
	/**
	 * Clear error
	 */
	clearError: function()
	{
		return (m) => 
		{
			return new Runtime.Monad(m.val);
		};
	},
	/**
	 * Returns monad
	 */
	monad: function(m)
	{
		return m;
	},
	/**
	 * Get method from class
	 * @return fn
	 */
	method: function(method_name)
	{
		return (class_name) => 
		{
			return Runtime.rtl.method(class_name, method_name);
		};
	},
	/**
	 * Apply function
	 * @return fn
	 */
	applyMethod: function(method_name, args)
	{
		if (args == undefined) args = null;
		return (class_name) => 
		{
			var f = Runtime.rtl.method(class_name, method_name);
			return Runtime.rtl.apply(f, args);
		};
	},
	/**
	 * Apply async function
	 * @return fn
	 */
	applyMethodAsync: function(method_name, args)
	{
		if (args == undefined) args = null;
		return async (class_name) => 
		{
			var f = Runtime.rtl.method(class_name, method_name);
			return Promise.resolve(await Runtime.rtl.applyAsync(f, args));
		};
	},
	/**
	 * Apply function
	 * @return fn
	 */
	apply: function(f)
	{
		return (value) => 
		{
			return f(value);
		};
	},
	/**
	 * Apply function
	 * @return fn
	 */
	applyAsync: function(f)
	{
		return async (value) => 
		{
			return await f(value);
		};
	},
	/**
	 * Log message
	 * @return fn
	 */
	log: function(message)
	{
		if (message == undefined) message = "";
		return (value) => 
		{
			if (message == "")
			{
				console.log(value);
			}
			else
			{
				console.log(message);
			}
			return value;
		};
	},
	/**
	 * Function or
	 */
	or: function(arr)
	{
		return (item) => 
		{
			for (var i = 0;i < arr.count();i++)
			{
				var f = Runtime.rtl.get(arr, i);
				var res = f(item);
				if (res)
				{
					return true;
				}
			}
			return false;
		};
	},
	/**
	 * Function and
	 */
	and: function(arr)
	{
		return (item) => 
		{
			for (var i = 0;i < arr.count();i++)
			{
				var f = Runtime.rtl.get(arr, i);
				var res = f(item);
				if (!res)
				{
					return false;
				}
			}
			return true;
		};
	},
	/**
	 * Join
	 */
	join: function(ch)
	{
		return (items) => 
		{
			return Runtime.rs.join(ch, items);
		};
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.lib";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.lib);
window["Runtime.lib"] = Runtime.lib;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.lib;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.re = function()
{
};
Object.assign(Runtime.re.prototype,
{
	getClassName: function()
	{
		return "Runtime.re";
	},
});
Object.assign(Runtime.re,
{
	/**
	 * Search regular expression
	 * @param string r regular expression
	 * @param string s string
	 * @return bool
	 */
	match: function(r, s)
	{
		return s.match( new RegExp(r, "g") ) != null;
	},
	/**
	 * Search regular expression
	 * @param string r regular expression
	 * @param string s string
	 * @return Vector result
	 */
	matchAll: function(r, s)
	{
		var arr = [...s.matchAll( new RegExp(r, "g") )];
		if (arr.length == 0) return null;
		return Runtime.Collection.from( arr.map( (v) => Runtime.Collection.from(v) ) );
		return null;
	},
	/**
	 * Replace with regular expression
	 * @param string r - regular expression
	 * @param string replace - new value
	 * @param string s - replaceable string
	 * @return string
	 */
	replace: function(r, replace, s)
	{
		return s.replace(new RegExp(r, "g"), replace);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.re";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.re);
window["Runtime.re"] = Runtime.re;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.re;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.rs = function()
{
};
Object.assign(Runtime.rs.prototype,
{
	getClassName: function()
	{
		return "Runtime.rs";
	},
});
Object.assign(Runtime.rs,
{
	/**
	 * Returns string lenght
	 * @param string s The string
	 * @return int
	 */
	strlen: function(s)
	{
		return use("Runtime.rtl").toStr(s).length;
	},
	/**
	 * Search 'search' in s.
	 */
	search: function(s, search, offset)
	{
		if (offset == undefined) offset = 0;
		var _rtl = use("Runtime.rtl");
		var res = _rtl.toStr(s).indexOf(search);
		return res;
	},
	/**
	 * Is start
	 */
	start: function(s, search)
	{
		return this.search(s, search) == 0;
	},
	/**
	 * Returns substring
	 * @param string s The string
	 * @param int start
	 * @param int length
	 * @return string
	 */
	substr: function(s, start, length)
	{
		if (length == undefined) length = null;
		var _rtl = use("Runtime.rtl");
		var _rs = use("Runtime.rs");
		if (start < 0) start = s.length + start;
		if (length === null){
			return _rtl.toStr(s).substring(start);
		}
		var end = start + length;
		if (length < 0){
			var sz = _rs.strlen(s);
			end = sz + length;
		}
		return _rtl.toStr(s).substring(start, end);
	},
	/**
	 * Returns char from string at the position
	 * @param string s The string
	 * @param int pos The position
	 * @return string
	 */
	charAt: function(s, pos)
	{
		var sz = this.strlen(s);
		if (pos >= 0 && pos < sz)
		{
			return this.substr(s, pos, 1);
		}
		return "";
	},
	/**
	 * Returns ASCII symbol code
	 * @param char ch
	 */
	ord: function(ch)
	{
		return use("Runtime.rtl").toStr(ch).charCodeAt(0);
	},
	/**
	 * Convert string to lower case
	 * @param string s 
	 * @return string
	 */
	strtolower: function(s)
	{
		return use("Runtime.rtl").toStr(s).toLowerCase();
	},
	/**
	 * Convert string to upper case
	 * @param string s
	 * @return string
	 */
	strtoupper: function(s)
	{
		return use("Runtime.rtl").toStr(s).toUpperCase();
	},
	/**
	 * Заменяет одну строку на другую
	 */
	replace: function(search, item, s)
	{
		return s.replace(new RegExp(search, "g"), item);
	},
	/**
	 * Возвращает повторяющуюся строку
	 * @param {string} s - повторяемая строка
	 * @param {integer} n - количество раз, которые нужно повторить строку s
	 * @return {string} строка
	 */
	str_repeat: function(s, n)
	{
		if (n <= 0) return "";
		var res = '';
		for (var i=0; i < n; i++){
			res += s;
		}
		return res;
	},
	/**
	 * Разбивает строку на подстроки
	 * @param string delimiter - regular expression
	 * @param string s - строка, которую нужно разбить
	 * @param integer limit - ограничение 
	 * @return Collection<string>
	 */
	split: function(delimiter, s, limit)
	{
		if (limit == undefined) limit = -1;
		var _rtl = use("Runtime.rtl");
		var _Collection = use("Runtime.Collection");
		
		var arr = null;
		var delimiter = new RegExp(delimiter, "g");
		if (!_rtl.exists(limit))
		{
			arr = s.split(delimiter);
		}
		else
		{
			arr = s.split(delimiter, limit);
		}
		return _Collection.from(arr);
	},
	/**
	 * Разбивает строку на подстроки
	 * @param string ch - разделитель
	 * @param string s - строка, которую нужно разбить
	 * @param integer limit - ограничение 
	 * @return Collection<string>
	 */
	splitArr: function(delimiters, s, limit)
	{
		if (limit == undefined) limit = -1;
		var _rtl = use("Runtime.rtl");
		var _Collection = use("Runtime.Collection");
		
		var arr = null;
		var delimiter = new RegExp("[" + delimiters.join("") + "]", "g");
		if (!_rtl.exists(limit))
		{
			arr = s.split(delimiter);
		}
		else
		{
			arr = s.split(delimiter, limit);
		}
		return _Collection.from(arr);
	},
	/**
	 * Соединяет строки
	 * @param string ch - разделитель
	 * @param string s - строка, которую нужно разбить
	 * @param integer limit - ограничение 
	 * @return Vector<string>
	 */
	join: function(ch, arr)
	{
		if (arr == null) return "";
		return Array.prototype.join.call(arr, ch);
	},
	/**
	 * Удаляет лишние символы слева и справа
	 * @param {string} s - входная строка
	 * @return {integer} новая строка
	 */
	trim: function(s, ch)
	{
		if (ch == undefined) ch = "";
		if (ch == undefined) ch = "";
		
		s = use("Runtime.rtl").toStr(s);
		
		if (ch == ""){
			return s.trim();
		}
		return s.replace(new RegExp("^[" + ch + "]+", "g"),"").replace(new RegExp("[" + ch + "]+$", "g"),"");
	},
	/**
	 * json encode scalar values
	 * @param {mixed} obj - объект
	 * @param {int} flags - Флаги
	 * @return {string} json строка
	 */
	json_encode_primitive: function(s, flags)
	{
		if (flags & 128 == 128) 
			return JSON.stringify(obj, null, 2);
		return JSON.stringify(obj);
	},
	/**
	 * Json encode data
	 * @param var data
	 * @return string
	 */
	json_encode: function(data)
	{
		var f = Runtime.rtl.method("Runtime.RuntimeUtils", "json_encode");
		return f(data);
	},
	/**
	 * Json decode to primitive values
	 * @param string s Encoded string
	 * @return var
	 */
	json_decode: function(obj)
	{
		var f = Runtime.rtl.method("Runtime.RuntimeUtils", "json_decode");
		return f(obj);
	},
	/**
	 * Escape HTML special chars
	 * @param string s
	 * @return string
	 */
	htmlEscape: function(s)
	{
		if (s instanceof Runtime.Collection) return s;
		var obj = {
			"<":"&lt;",
			">": "&gt;", 
			"&": "&amp;",
			'"': '&quot;',
			"'": '&#39;',
			'`': '&#x60;',
			'=': '&#x3D;'
		};
		return (new String(s)).replace(/[<>&"'`=]/g, function(v){ return obj[v]; });
	},
	escapeHtml: function(s)
	{
		return this.htmlEscape(s);
	},
	/**
	 * Разбивает путь файла на составляющие
	 * @param {string} filepath путь к файлу
	 * @return {json} Объект вида:
	 *         dirname    - папка, в которой находиться файл
	 *         basename   - полное имя файла
	 *         extension  - расширение файла
	 *         filename   - имя файла без расширения
	 */
	pathinfo: function(filepath)
	{
		var arr1 = this.explode(".", filepath).toVector();
		var arr2 = this.explode("/", filepath).toVector();
		var filepath = filepath;
		var extension = arr1.popValue();
		var basename = arr2.popValue();
		var dirname = this.join("/", arr2);
		var ext_length = this.strlen(extension);
		if (ext_length > 0)
		{
			ext_length++;
		}
		var filename = this.substr(basename, 0, -1 * ext_length);
		return Runtime.Dict.from({"filepath":filepath,"extension":extension,"basename":basename,"dirname":dirname,"filename":filename});
	},
	/**
	 * Возвращает имя файла без расширения
	 * @param {string} filepath - путь к файлу
	 * @return {string} полное имя файла
	 */
	filename: function(filepath)
	{
		var ret = Runtime.rs.pathinfo(filepath);
		var res = Runtime.rtl.get(ret, "basename");
		var ext = Runtime.rtl.get(ret, "extension");
		if (ext != "")
		{
			var sz = 0 - Runtime.rs.strlen(ext) - 1;
			res = Runtime.rs.substr(res, 0, sz);
		}
		return res;
	},
	/**
	 * Возвращает полное имя файла
	 * @param {string} filepath - путь к файлу
	 * @return {string} полное имя файла
	 */
	basename: function(filepath)
	{
		var ret = Runtime.rs.pathinfo(filepath);
		var res = Runtime.rtl.get(ret, "basename");
		return res;
	},
	/**
	 * Возвращает расширение файла
	 * @param {string} filepath - путь к файлу
	 * @return {string} расширение файла
	 */
	extname: function(filepath)
	{
		var ret = Runtime.rs.pathinfo(filepath);
		var res = Runtime.rtl.get(ret, "extension");
		return res;
	},
	/**
	 * Возвращает путь к папке, содержащий файл
	 * @param {string} filepath - путь к файлу
	 * @return {string} путь к папке, содержащий файл
	 */
	dirname: function(filepath)
	{
		var ret = Runtime.rs.pathinfo(filepath);
		var res = Runtime.rtl.get(ret, "dirname");
		return res;
	},
	/**
	 * Returns relative path of the filepath
	 * @param string filepath
	 * @param string basepath
	 * @param string ch - Directory separator
	 * @return string relative path
	 */
	relativePath: function(filepath, basepath, ch)
	{
		if (ch == undefined) ch = "/";
		var source = Runtime.rs.explode(ch, filepath);
		var base = Runtime.rs.explode(ch, basepath);
		source = source.filter((s) => 
		{
			return s != "";
		});
		base = base.filter((s) => 
		{
			return s != "";
		});
		var i = 0;
		while (source.count() > 0 && base.count() > 0 && source.item(0) == base.item(0))
		{
			source.shift();
			base.shift();
		}
		base.each((s) => 
		{
			source.unshift("..");
		});
		return Runtime.rs.implode(ch, source);
	},
	/**
	 * Return normalize path
	 * @param string filepath - File path
	 * @return string
	 */
	normalize: function(filepath)
	{
		return filepath;
	},
	/**
	 * New line to br
	 */
	nl2br: function(s)
	{
		return this.replace("\n", "<br/>", s);
	},
	/**
	 * Remove spaces
	 */
	spaceless: function(s)
	{
		s = Runtime.re.replace(" +", " ", s);
		s = Runtime.re.replace("\t", "", s);
		s = Runtime.re.replace("\n", "", s);
		return s;
	},
	/* =================== Deprecated =================== */
	/**
	 * Разбивает строку на подстроки
	 * @param string delimiter - разделитель
	 * @param string s - строка, которую нужно разбить
	 * @param integer limit - ограничение 
	 * @return Vector<string>
	 */
	explode: function(delimiter, s, limit)
	{
		if (limit == undefined) limit = -1;
		var _rtl = use("Runtime.rtl");
		var _Collection = use("Runtime.Collection");
		
		var arr = null;
		if (!_rtl.exists(limit))
			arr = s.split(delimiter);
		arr = s.split(delimiter, limit);
		return _Collection.from(arr);
	},
	/**
	 * Разбивает строку на подстроки
	 * @param string ch - разделитель
	 * @param string s - строка, которую нужно разбить
	 * @param integer limit - ограничение 
	 * @return Vector<string>
	 */
	implode: function(ch, arr)
	{
		return arr.join(ch);
	},
	/**
	 * Ищет позицию первого вхождения подстроки search в строке s.
	 * @param {string} s - строка, в которой производится поиск 
	 * @param {string} search - строка, которую ищем 
	 * @param {string} offset - если этот параметр указан, 
	 *                 то поиск будет начат с указанного количества символов с начала строки.  
	 * @return {variable} Если строка найдена, то возвращает позицию вхождения, начиная с 0.
	 *                    Если строка не найдена, то вернет -1
	 */
	strpos: function(s, search, offset)
	{
		if (offset == undefined) offset = 0;
		var _rtl = use("Runtime.rtl");
		
		if (!_rtl.exists(offset)) offset = 0;
		var res = _rtl.toStr(s).indexOf(search);
		return res;
	},
	/**
	 * URL encode
	 * @param string s
	 * @return string
	 */
	url_encode: function(s)
	{
		return encodeURIComponent(s);
	},
	/**
	 * Base64 encode
	 * @param string s
	 * @return string
	 */
	base64_encode: function(s)
	{
		return window.btoa(window.unescape(window.encodeURIComponent(s)));
	},
	/**
	 * Base64 decode
	 * @param string s
	 * @return string
	 */
	base64_decode: function(s)
	{
		return window.decodeURIComponent(window.escape(window.atob(s)));
	},
	/**
	 * Base64 encode
	 * @param string s
	 * @return string
	 */
	base64_encode_url: function(s)
	{
		s = this.base64_encode(s)
			.replace(new RegExp('\\+', 'g'), '-')
			.replace(new RegExp('\\/', 'g'), '_')
			.replace(new RegExp('=', 'g'), '')
		;
		return s;
	},
	/**
	 * Base64 decode
	 * @param string s
	 * @return string
	 */
	base64_decode_url: function(s)
	{
		var c = 4 - s.length % 4;
		if (c < 4 && c > 0) s = s + '='.repeat(c);
		s = s.replace(new RegExp('-', 'g'), '+')
			.replace(new RegExp('_', 'g'), '/')
		;
		return this.base64_decode(s);
	},
	/**
	 * Returns string lenght
	 * @param string s The string
	 * @return int
	 */
	url_get_add: function(s, key, value)
	{
		var pos = this.strpos(s, "?");
		var s1 = (pos >= 0) ? (this.substr(s, 0, pos)) : (s);
		var s2 = (pos >= 0) ? (this.substr(s, pos + 1)) : ("");
		var find = false;
		var arr = this.explode("&", s2);
		arr = arr.map((s) => 
		{
			var arr = this.explode("=", s);
			if (Runtime.rtl.get(arr, 0) == key)
			{
				find = true;
				return key + Runtime.rtl.toStr("=") + Runtime.rtl.toStr(this.htmlEscape(value));
			}
			return s;
		}).filter((s) => 
		{
			return s != "";
		});
		if (!find && value != "")
		{
			arr = arr.appendIm(key + Runtime.rtl.toStr("=") + Runtime.rtl.toStr(this.htmlEscape(value)));
		}
		s = s1;
		s2 = this.join("&", arr);
		if (s2 != "")
		{
			s = s + Runtime.rtl.toStr("?") + Runtime.rtl.toStr(s2);
		}
		return s;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.rs";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.rs);
window["Runtime.rs"] = Runtime.rs;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.rs;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime == 'undefined') Runtime = {};
Runtime._Collection = function()
{
	Array.call(this);
	for (var i=1; i<arguments.length; i++) Array.prototype.push.call(this, arguments[i]);
	this.__uq__ = Symbol();
}
Runtime._Collection.prototype = Object.create(Array.prototype);
Runtime._Collection.prototype.constructor = Runtime._Collection;
Object.assign(Runtime._Collection.prototype,
{
	toArray: function()
	{
		return Array.prototype.slice.call(this);
	},
	toStr: function(value)
	{
		return use("Runtime.rtl").toStr(value);
	},
	getClassName: function(){ return "Runtime._Collection"; },
});
Object.assign(Runtime._Collection,
{
	from: function(arr)
	{
		var res = this.Instance();
		if (arr == undefined && arr == null) return this.Instance();
		
		if (arr instanceof Array)
		{
			var new_arr = arr.slice();
			Object.setPrototypeOf(new_arr, this.prototype);
			return new_arr;
		}
		
		var res = this.Instance();
		if (
			arr instanceof Int8Array ||
			arr instanceof Uint8Array ||
			arr instanceof Int16Array ||
			arr instanceof Uint16Array ||
			arr instanceof Int32Array ||
			arr instanceof Uint32Array ||
			arr instanceof Float32Array ||
			arr instanceof Float64Array
		)
		{
			for (var i=0; i<arr.length; i++)
			{
				Array.prototype.push.call(res, arr[i]);
			}
		}
		
		return res;	
	},
	getCurrentNamespace: function(){ return "Runtime"; },
	getCurrentClassName: function(){ return "Runtime._Collection"; },
	getParentClassName: function(){ return ""; },
});
Runtime.Collection = function()
{
	Runtime._Collection.apply(this, arguments);
};
Runtime.Collection.prototype = Object.create(Runtime._Collection.prototype);
Runtime.Collection.prototype.constructor = Runtime.Collection;
Object.assign(Runtime.Collection.prototype,
{
	/**
	 * Returns copy of Collectiom
	 * @param int pos - position
	 */
	cp: function()
	{
		var arr = Array.prototype.slice.call(this);
		Object.setPrototypeOf(arr, this.constructor.prototype);
		return arr;
	},
	/**
	 * Convert to collection
	 */
	toCollection: function()
	{
		var obj = Array.prototype.slice.call(this);
		Object.setPrototypeOf(obj, Runtime.Collection.prototype);
		return obj;
	},
	/**
	 * Convert to vector
	 */
	toVector: function()
	{
		var obj = Array.prototype.slice.call(this);
		Object.setPrototypeOf(obj, use("Runtime.Vector").prototype);
		return obj;
	},
	/**
	 * Returns value from position
	 * @param int pos - position
	 */
	get: function(pos, default_value)
	{
		if (pos < 0 || pos >= this.length) return default_value;
		var val = this[pos];
		return val;
	},
	/**
	 * Returns value from position. Throw exception, if position does not exists
	 * @param int pos - position
	 */
	item: function(pos)
	{
		if (pos < 0 || pos >= this.length)
		{
			var _IndexOutOfRange = use("Runtime.Exceptions.IndexOutOfRange");
			throw new _IndexOutOfRange(pos);
		}
		return this[pos];
	},
	/**
	 * Returns count items in vector
	 */
	count: function()
	{
		return this.length;
	},
	/**
	 * Find value in array. Returns -1 if value not found.
	 * @param T value
	 * @return  int
	 */
	indexOf: function(value)
	{
		for (var i=0; i<this.count(); i++)
		{
			if (this[i] == value)
				return i;
		}
		return -1;
	},
	/**
	 * Find value in array, and returns position. Returns -1 if value not found.
	 * @param T value
	 * @param int pos_begin - begin position
	 * @param int pos_end - end position
	 * @return  int
	 */
	indexOfRange: function(value, pos_begin, pos_end)
	{
		var pos = Array.prototype.indexOf.call(this, value, pos_begin);
		if (pos == -1 || pos > pos_end)
			return -1;
		return pos;
	},
	/**
	 * Get first item
	 */
	first: function(default_value)
	{
		if (default_value == undefined) default_value = null;
		if (this.length == 0) return default_value;	
		return this[0];
	},
	/**
	 * Get last item
	 */
	last: function(default_value, pos)
	{
		if (default_value == undefined) default_value = null;
		if (pos == undefined) pos = -1;
		if (pos == undefined) pos = -1;
		if (this.length == 0) return default_value;
		if (this.length + pos + 1 == 0) return default_value;	
		return this[this.length + pos];
	},
	/**
	 * Get last item
	 */
	getLastItem: function(default_value, pos)
	{
		if (default_value == undefined) default_value = null;
		if (pos == undefined) pos = -1;
		return this.last(default_value, pos);
	},
	/**
	 * Append value to the end of the Collection and return new Collection
	 * @param T value
	 */
	pushIm: function(value)
	{
		var arr = this.cp();
		Array.prototype.push.call(arr, value);
		return arr;
	},
	push: function(value)
	{
		throw new Runtime.Exceptions.RuntimeException("Deprecated Collection push")
	},
	push1: function(value)
	{
		return this.pushIm(value);
	},
	append1: function(value)
	{
		return this.push(value);
	},
	appendIm: function(value)
	{
		return this.pushIm(value);
	},
	/**
	 * Insert first value size_to array
	 * @return T value
	 */
	unshiftIm: function(value)
	{
		var arr = this.cp();
		Array.prototype.unshift.call(arr, value);
		return arr;
	},
	unshift: function(value)
	{
		throw new Runtime.Exceptions.RuntimeException("Deprecated Collection unshift")
	},
	unshift1: function(value)
	{
		return this.unshiftIm(value);
	},
	prepend1: function(value)
	{
		return this.unshift(value);
	},
	prependIm: function(value)
	{
		return this.unshiftIm(value);
	},
	/**
	 * Extract last value from array
	 * @return T value
	 */
	removeLastIm: function()
	{
		var arr = Array.prototype.slice.call(this, 0, -1);
		Object.setPrototypeOf(arr, this.constructor.prototype);
		return arr;
	},
	removeLast: function(value)
	{
		return this.removeLastIm(value);
	},
	/**
	 * Extract first value from array
	 * @return T value
	 */
	removeFirstIm: function()
	{
		var arr = Array.prototype.slice.call(this, 1);
		Object.setPrototypeOf(arr, this.constructor.prototype);
		return arr;
	},
	removeFirst: function(value)
	{
		return this.removeFirstIm(value);
	},
	/**
	 * Insert value to position
	 * @param T value
	 * @param int pos - position
	 */
	insertIm: function(pos, value)
	{
		var arr = this.cp();
		arr.splice(pos, 0, value);
		return arr;
	},
	insert: function(value)
	{
		return this.insertIm(value);
	},
	/**
	 * Remove value from position
	 * @param int pos - position
	 * @param int count - count remove items
	 */
	removeIm: function(pos, count)
	{
		if (count == undefined) count = 1;
		if (count == undefined) count = 1;
		var arr = this.cp();
		arr.splice(pos, count);
		return arr;
	},
	remove1: function(value)
	{
		return this.removeIm(value);
	},
	/**
	 * Remove range
	 * @param int pos_begin - start position
	 * @param int pos_end - end position
	 */
	removeRangeIm: function(pos_begin, pos_end)
	{
		var arr = this.cp();
		arr.splice(pos_begin, pos_end - pos_begin + 1);
		return arr;
	},
	removeRange: function(value)
	{
		return this.removeRangeIm(value);
	},
	/**
	 * Set value size_to position
	 * @param int pos - position
	 * @param T value 
	 */
	setIm: function(pos, value)
	{
		if (pos < 0 || pos >= this.length)
		{
			var _IndexOutOfRange = use("Runtime.Exceptions.IndexOutOfRange");
			throw new _IndexOutOfRange(pos);
		}
		var arr = this.cp();
		arr[pos] = value;
		return arr;
	},
	set: function(value)
	{
		throw new Runtime.Exceptions.RuntimeException("Deprecated Collection set")
	},
	set1: function(value)
	{
		return this.setIm(value);
	},
	/**
	 * Append vector to the end of the vector
	 * @param Collection<T> arr
	 */
	concatIm: function(arr)
	{
		if (arr == null)
		{
			return this;
		}
		if (arr.length == 0) return this;
		var res = this.cp();
		for (var i=0; i<arr.length; i++)
		{
			Array.prototype.push.call(res, arr[i]);
		}
		return res;
	},
	appendCollection1: function(arr)
	{
		return this.concatIm(arr);
	},
	concat: function(arr)
	{
		return this.concatIm(arr);
	},
	/**
	 * Prepend vector to the begin of the vector
	 * @param Collection<T> arr
	 */
	prependCollectionIm: function(arr)
	{
		if (arr == null) return this;
		if (arr.length == 0) return this;
		var res = this.cp();
		for (var i=arr.length-1; i>=0; i--)
		{
			Array.prototype.unshift.call(res, arr[i]);
		}
		return res;
	},
	prependCollection1: function(arr)
	{
		return this.prependCollectionIm(arr);
	},
	/**
	 * Remove value
	 */
	removeItemIm: function(value)
	{
		var index = this.indexOf(value);
		if (index != -1)
		{
			return this.remove(index);
		}
		return this;
	},
	removeItem: function(value)
	{
		return this.removeItemIm(value);
	},
	/**
	 * Remove value
	 */
	removeItemsIm: function(values)
	{
		var res = this;
		for (var i = 0;i < values.count();i++)
		{
			res = res.removeItem(values.item(i));
		}
		return res;
	},
	removeItems: function(values)
	{
		return this.removeItemsIm(values);
	},
	/**
	 * Map
	 * @param fn f
	 * @return Collection
	 */
	map: function(f)
	{
		var arr = this.cp();
		for (var i=0; i<arr.length; i++)
		{
			arr[i] = f(arr[i], i);
		}
		return arr;
	},
	/**
	 * Filter items
	 * @param fn f
	 * @return Collection
	 */
	filter: function(f)
	{
		var res = this.constructor.Instance();
		for (var i=0; i<this.length; i++)
		{
			var item = this[i];
			var flag = f(item, i);
			if (flag)
			{
				Array.prototype.push.call(res, item);
			}
		}
		return res;
	},
	/**
	 * Transition Collection to Dict
	 * @param fn f
	 * @return Dict
	 */
	transition: function(f)
	{
		var Dict = use("Runtime.Dict");
		var d = new Dict();
		for (var i=0; i<this.length; i++)
		{
			var value = this[i];
			var p = f(value, i);
			d[p[1]] = p[0];
		}
		return d;
	},
	/**
	 * Reduce
	 * @param fn f
	 * @param var init_value
	 * @return init_value
	 */
	reduce: function(f, init_value)
	{
		for (var i=0; i<this.length; i++)
		{
			var item = this[i];
			init_value = f(init_value, item, i);
		}
		return init_value;
	},
	/**
	 * Call function for each item
	 * @param fn f
	 */
	each: function(f)
	{
		for (var i=0; i<this.length; i++)
		{
			var item = this[i];
			f(item, i);
		}
	},
	/**
	 * Returns Collection
	 * @param Collection<T> arr
	 * @return Collection<T>
	 */
	intersect: function(arr)
	{
		return this.filter((item) => 
		{
			return arr.indexOf(item) >= 0;
		});
	},
	/**
	 * Returns new Collection
	 * @param int offset
	 * @param int lenght
	 * @return Collection<T>
	 */
	slice: function(offset, length)
	{
		if (length == undefined) length = null;
		if (offset == undefined) offset = 0;
		if (length == undefined)
		{
			if (offset == 0) return this;
			var arr = Array.prototype.slice.call(this, offset);
			Object.setPrototypeOf(arr, this.constructor.prototype);
			return arr;
		}
		if (offset == 0 && length == this.length) return this;
		if (length >= 0)
		{
			length = offset + length;
		}
		var arr = Array.prototype.slice.call(this, offset, length);
		Object.setPrototypeOf(arr, this.constructor.prototype);
		return arr;
	},
	/**
	 * Reverse array
	 */
	reverseIm: function()
	{
		var arr = this.cp();
		Array.prototype.reverse.call(arr);
		return arr;
	},
	reverse: function()
	{
		return this.reverseIm();
	},
	/**
	 * Sort vector
	 * @param fn f - Sort user function
	 */
	sortIm: function(f)
	{
		if (f == undefined) f = null;
		var arr = this.cp();
		if (f == undefined) Array.prototype.sort.call(arr);
		else
		{
			var f1 = (a, b) => { return f(a, b); };
			Array.prototype.sort.call(arr, f1);
		}
		return arr;
	},
	sort: function(f)
	{
		if (f == undefined) f = null;
		return this.sortIm(f);
	},
	/**
	 * Remove dublicate values
	 */
	removeDuplicatesIm: function()
	{
		var res = this.constructor.Instance();
		for (var i=0; i<this.length; i++)
		{
			var p = res.indexOf(this[i]);
			if (p == -1)
			{
				Array.prototype.push.call(res, this[i]);
			}
		}
		return res;
	},
	removeDuplicates: function()
	{
		return this.removeDuplicatesIm();
	},
	/**
	 * Find item pos
	 * @param fn f - Find function
	 * @return int - position
	 */
	find: function(f)
	{
		for (var i=0; i<this.length; i++)
		{
			var flag = f(this[i]);
			if (flag) return i;
		}
		return -1;
	},
	/**
	 * Find item
	 * @param var item - Find function
	 * @param fn f - Find function
	 * @param T def_value - Find function
	 * @return item
	 */
	findItem: function(f, def_value)
	{
		if (def_value == undefined) def_value = null;
		var pos = this.find(f);
		return this.get(pos, def_value);
	},
	/**
	 * Join collection to string
	 */
	join: function(ch)
	{
		return Runtime.rs.join(ch, this);
	},
	getClassName: function()
	{
		return "Runtime.Collection";
	},
});
Object.assign(Runtime.Collection, Runtime._Collection);
Object.assign(Runtime.Collection,
{
	/**
	 * Returns new Instance
	 * @return Object
	 */
	Instance: function()
	{
		return new Runtime.Collection();
	},
	/**
	 * Returns new Instance
	 * @return Object
	 */
	create: function(arr)
	{
		return this.from(arr);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Collection";
	},
	getParentClassName: function()
	{
		return "Runtime._Collection";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Collection);
window["Runtime.Collection"] = Runtime.Collection;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Collection;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime == 'undefined') Runtime = {};

Runtime._Map = function(map)
{
	this._map = {};
	if (map != undefined && typeof map == 'object')
	{
		if (map instanceof Runtime.Dict)
		{
			for (var i in map._map)
			{
				this._map[i] = map._map[i];
			}
		}
		else if (typeof map == "object" && !(map instanceof Runtime._Collection))
		{
			for (var i in map)
			{
				this._map["|" + i] = map[i];
			}
		}
	}
	this.__uq__ = Symbol();
	return this;
}
/*Runtime._Map.prototype = Object.create(Map.prototype);
Runtime._Map.prototype.constructor = Runtime._Map;*/
Object.assign(Runtime._Map.prototype,
{
	toStr: function(value)
	{ 
		return use("Runtime.rtl").toStr(value);
	},
	toObject: function()
	{
		var obj = {};
		for (var key in this._map)
		{
			obj[key.substring(1)] = this._map[key];
		}
		return obj;
	},
	getClassName: function(){ return "Runtime._Map"; },
});
Object.assign(Runtime._Map,
{
	from: function(map)
	{
		var ctx = null;
		var res = this.Instance(map);
		return res;
	},
	getCurrentNamespace: function(){ return "Runtime"; },
	getCurrentClassName: function(){ return "Runtime._Map"; },
	getParentClassName: function(){ return ""; },
});
Runtime.Dict = function()
{
	Runtime._Map.apply(this, arguments);
};
Runtime.Dict.prototype = Object.create(Runtime._Map.prototype);
Runtime.Dict.prototype.constructor = Runtime.Dict;
Object.assign(Runtime.Dict.prototype,
{
	/**
	 * Copy instance
	 */
	cp: function()
	{
		var new_obj = this.constructor.Instance();
		new_obj._map = Object.assign({}, this._map);
		return new_obj;
	},
	/**
	 * Clone this struct with fields
	 * @param Collection fields = null
	 * @return Dict<T>
	 */
	clone: function(fields)
	{
		if (fields == undefined) fields = null;
		if (fields == null)
		{
			return this;
		}
		var new_obj = this.constructor.Instance();
		if (fields != null)
		{
			for (var key in fields)
			{
				if (typeof obj["|" + key] == undefined)
					new_obj._map["|" + key] = this._map["|" + key];
			}
		}
		return new_obj;
	},
	/**
	 * Returns copy of Dict
	 * @param int pos - position
	 */
	copy: function(obj)
	{
		if (obj == undefined) obj = null;
		if (obj == null)
		{
			return this;
		}
		var new_obj = this.constructor.Instance();
		new_obj._map = Object.assign({}, this._map);
		if (obj != null)
		{
			var _Dict = use("Runtime.Dict");
			if (obj instanceof _Dict) 
			{
				obj = obj._map;
				for (var key in obj)
				{
					new_obj._map[key] = obj[key];
				}
			}
			else
			{
				for (var key in obj)
				{
					new_obj._map["|" + key] = obj[key];
				}
			}
		}
		return new_obj;
	},
	/**
	 * Convert to dict
	 */
	toDict: function()
	{
		var Dict = use ("Runtime.Dict");
		return new Dict(this);
	},
	/**
	 * Convert to dict
	 */
	toMap: function()
	{
		var Map = use ("Runtime.Map");
		return new Map(this);
	},
	/**
	 * Return true if key exists
	 * @param string key
	 * @return bool var
	 */
	contains: function(key)
	{
		key = this.toStr(key);
		return typeof this._map["|" + key] != "undefined";
	},
	/**
	 * Return true if key exists
	 * @param string key
	 * @return bool var
	 */
	has: function(key)
	{
		return this.contains(key);
	},
	/**
	 * Returns value from position
	 * @param string key
	 * @param T default_value
	 * @return T
	 */
	get: function(key, default_value)
	{
		key = this.toStr(key);
		var val = this._map["|" + key];
		if (typeof val == "undefined") return default_value;
		return val;
	},
	/**
	 * Returns value from position
	 * @param string key
	 * @param T default_value
	 * @return T
	 */
	attr: function(items, default_value)
	{
		return Runtime.rtl.attr(this, items, default_value);
	},
	/**
	 * Returns value from position. Throw exception, if position does not exists
	 * @param string key - position
	 * @return T
	 */
	item: function(key)
	{
		key = this.toStr(key);
		if (typeof this._map["|" + key] == "undefined")
		{
			var _KeyNotFound = use("Runtime.Exceptions.KeyNotFound");
			throw new _KeyNotFound(key);
		}
		var val = this._map["|" + key];
		if (val === null || typeof val == "undefined") return null;
		return val;
	},
	/**
	 * Set value size_to position
	 * @param string key - position
	 * @param T value 
	 * @return self
	 */
	setIm: function(key, value)
	{
		var res = this.cp();
		key = this.toStr(key);
		res._map["|" + key] = value;
		return res;
	},
	set1: function(key, value)
	{
		return this.setIm(key, value);
	},
	/**
	 * Remove value from position
	 * @param string key
	 * @return self
	 */
	removeIm: function(key)
	{
		key = this.toStr(key);
		if (typeof this._map["|" + key] != "undefined")
		{
			var res = this.cp();
			delete res._map["|" + key];
			return res;
		}
		return this;
	},
	remove1: function(key)
	{
		return this.removeIm(key);
	},
	/**
	 * Remove value from position
	 * @param string key
	 * @return self
	 */
	removeKeys: function(keys)
	{
		return (keys != null) ? (keys.reduce((item, key) => 
		{
			return item.removeIm(key);
		}, this)) : (this);
	},
	/**
	 * Returns vector of the keys
	 * @return Collection<string>
	 */
	keys: function()
	{
		var res = new Runtime.Vector();
		for (var key in this._map) res.pushValue(key.substring(1));
		return res.toCollection();
	},
	/**
	 * Returns vector of the values
	 * @return Collection<T>
	 */
	values: function()
	{
		var res = new Runtime.Collection();
		for (var key in this._map) res.push( this._map[key] );
		return res;
	},
	/**
	 * Call function map
	 * @param fn f
	 * @return Dict
	 */
	map: function(f)
	{
		var obj = this.constructor.Instance();
		for (var key in this._map)
		{
			var new_key = key.substring(1);
			var new_val = f(this._map[key], new_key);
			obj._map[key] = new_val;
		}
		return obj;
	},
	/**
	 * Filter items
	 * @param fn f
	 * @return Collection
	 */
	filter: function(f)
	{
		var obj = this.constructor.Instance();
		for (var key in this._map)
		{
			var new_key = key.substring(1);
			var value = this._map[key];
			var flag = f(value, new_key);
			if (flag) obj._map[key] = value;
		}
		return obj;
	},
	/**
	 * Call function for each item
	 * @param fn f
	 */
	each: function(f)
	{
		for (var key in this._map)
		{
			var new_key = key.substring(1);
			var value = this._map[key];
			f(value, new_key);
		}
	},
	/**
	 * Transition Dict to Collection
	 * @param fn f
	 * @return Collection
	 */
	transition: function(f)
	{
		var Collection = use("Runtime.Collection");
		var arr = new Collection();
		for (var key in this._map)
		{
			var new_value = f(this._map[key], key.substring(1));
			Array.prototype.push.call(arr, new_value);
		}
		return arr;
	},
	/**
	 * 	
	 * @param fn f
	 * @param var init_value
	 * @return init_value
	 */
	reduce: function(f, init_value)
	{
		for (var key in this._map)
		{
			init_value = f(init_value, this._map[key], key.substring(1));
		}
		return init_value;
	},
	/**
	 * Add values from other map
	 * @param Dict<T> map
	 * @return self
	 */
	concat: function(map)
	{
		if (map == undefined) map = null;
		if (map == null)
		{
			return this;
		}
		var _map = {};
		var f = false;
		var Dict = use("Runtime.Dict");
		if (map == null) return this;
		if (map instanceof Dict) _map = map._map;
		else if (typeof map == "object") { _map = map; f = true; }
		var res = this.cp();
		for (var key in _map)
		{
			res._map[(f ? "|" : "") + key] = _map[key];
		}
		return res;
	},
	/**
	 * Clone this struct with fields
	 * @param Collection fields = null
	 * @return BaseStruct
	 */
	intersect: function(fields, skip_empty)
	{
		if (fields == undefined) fields = null;
		if (skip_empty == undefined) skip_empty = true;
		if (fields == null)
		{
			return Runtime.Dict.from({});
		}
		var obj = new Runtime.Map();
		fields.each((field_name) => 
		{
			if (skip_empty && !this.has(field_name))
			{
				return ;
			}
			obj.setValue(field_name, this.get(field_name, null));
		});
		return obj.toDict();
	},
	/**
	 * Check equal
	 */
	equal: function(item)
	{
		if (item == null)
		{
			return false;
		}
		var keys = (new Runtime.Collection()).concat(this.keys()).concat(item.keys()).removeDuplicatesIm();
		for (var i = 0;i < keys.count();i++)
		{
			var key = Runtime.rtl.get(keys, i);
			if (!this.has(key))
			{
				return false;
			}
			if (!item.has(key))
			{
				return false;
			}
			if (this.get(key) != item.get(key))
			{
				return false;
			}
		}
		return true;
	},
	getClassName: function()
	{
		return "Runtime.Dict";
	},
});
Object.assign(Runtime.Dict, Runtime._Map);
Object.assign(Runtime.Dict,
{
	/**
	 * Returns new Instance
	 * @return Object
	 */
	Instance: function(val)
	{
		if (val == undefined) val = null;
		return new Runtime.Dict(val);
	},
	/**
	 * Returns new Instance
	 * @return Object
	 */
	create: function(obj)
	{
		return new (Function.prototype.bind.apply(this, [null, ctx, obj]));
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Dict";
	},
	getParentClassName: function()
	{
		return "Runtime._Map";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Dict);
window["Runtime.Dict"] = Runtime.Dict;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Dict;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Map = function()
{
	Runtime.Dict.apply(this, arguments);
};
Runtime.Map.prototype = Object.create(Runtime.Dict.prototype);
Runtime.Map.prototype.constructor = Runtime.Map;
Object.assign(Runtime.Map.prototype,
{
	/**
	 * Set value size_to position
	 * @param string key - position
	 * @param T value 
	 * @return self
	 */
	setValue: function(key, value)
	{
		key = this.toStr(key);
		this._map["|" + key] = value;
		return this;
	},
	/**
	 * Remove value from position
	 * @param string key
	 * @return self
	 */
	removeValue: function(key)
	{
		key = this.toStr(key);
		if (typeof this._map["|" + key] != "undefined")
		{
			delete this._map["|" + key];
		}
		return this;
	},
	/**
	 * Clear all values from vector
	 * @return self
	 */
	clear: function()
	{
		this._map = {};
		return this;
	},
	getClassName: function()
	{
		return "Runtime.Map";
	},
});
Object.assign(Runtime.Map, Runtime.Dict);
Object.assign(Runtime.Map,
{
	/**
	 * Returns new Instance
	 * @return Object
	 */
	Instance: function(val)
	{
		if (val == undefined) val = null;
		return new Runtime.Map(val);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Map";
	},
	getParentClassName: function()
	{
		return "Runtime.Dict";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Map);
window["Runtime.Map"] = Runtime.Map;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Map;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Monad = function(value, err)
{
	if (err == undefined) err = null;
	this.val = value;
	this.err = err;
};
Object.assign(Runtime.Monad.prototype,
{
	/**
	 * Return attr of object
	 */
	attr: function(attr_name)
	{
		if (this.val === null || this.err != null)
		{
			return this;
		}
		return new Runtime.Monad(Runtime.rtl.attr(this.val, Runtime.Collection.from([attr_name]), null));
	},
	/**
	 * Call function on value
	 */
	call: function(f)
	{
		if (this.val === null || this.err != null)
		{
			return this;
		}
		var res = null;
		var err = null;
		try
		{
			res = f(this.val);
		}
		catch (_ex)
		{
			if (_ex instanceof Runtime.Exceptions.RuntimeException)
			{
				var e = _ex;
				
				res = null;
				err = e;
			}
			else
			{
				throw _ex;
			}
		}
		return new Runtime.Monad(res, err);
	},
	/**
	 * Call async function on value
	 */
	callAsync: async function(f)
	{
		if (this.val === null || this.err != null)
		{
			return Promise.resolve(this);
		}
		var res = null;
		var err = null;
		try
		{
			res = await f(this.val);
		}
		catch (_ex)
		{
			if (_ex instanceof Runtime.Exceptions.RuntimeException)
			{
				var e = _ex;
				
				res = null;
				err = e;
			}
			else
			{
				throw _ex;
			}
		}
		return Promise.resolve(new Runtime.Monad(res, err));
	},
	/**
	 * Call method on value
	 */
	callMethod: function(f, args)
	{
		if (args == undefined) args = null;
		if (this.val === null || this.err != null)
		{
			return this;
		}
		var res = null;
		var err = null;
		try
		{
			res = Runtime.rtl.apply(f, args);
		}
		catch (_ex)
		{
			if (_ex instanceof Runtime.Exceptions.RuntimeException)
			{
				var e = _ex;
				
				res = null;
				err = e;
			}
			else
			{
				throw _ex;
			}
		}
		return new Runtime.Monad(res, err);
	},
	/**
	 * Call async method on value
	 */
	callMethodAsync: async function(f, args)
	{
		if (args == undefined) args = null;
		if (this.val === null || this.err != null)
		{
			return Promise.resolve(this);
		}
		var res = null;
		var err = null;
		try
		{
			res = await Runtime.rtl.applyAsync(f, args);
		}
		catch (_ex)
		{
			if (_ex instanceof Runtime.Exceptions.RuntimeException)
			{
				var e = _ex;
				
				res = null;
				err = e;
			}
			else
			{
				throw _ex;
			}
		}
		return Promise.resolve(new Runtime.Monad(res, err));
	},
	/**
	 * Call function on monad
	 */
	monad: function(f)
	{
		return f(this);
	},
	/**
	 * Returns value
	 */
	value: function()
	{
		if (this.err != null)
		{
			throw this.err
		}
		if (this.val === null || this.err != null)
		{
			return null;
		}
		return this.val;
	},
	_init: function()
	{
		this.val = null;
		this.err = null;
	},
	getClassName: function()
	{
		return "Runtime.Monad";
	},
});
Object.assign(Runtime.Monad,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Monad";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("val");
			a.push("err");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "val") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "err") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Monad);
window["Runtime.Monad"] = Runtime.Monad;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Monad;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Vector = function()
{
	Runtime.Collection.apply(this, arguments);
};
Runtime.Vector.prototype = Object.create(Runtime.Collection.prototype);
Runtime.Vector.prototype.constructor = Runtime.Vector;
Object.assign(Runtime.Vector.prototype,
{
	/**
	 * Returns new Vector
	 * @param int offset
	 * @param int lenght
	 * @return Collection<T>
	 */
	vectorSlice: function(offset, length)
	{
		if (length == undefined) length = null;
		if (offset == undefined) offset = 0;
		if (length == undefined)
		{
			var arr = Array.prototype.slice.call(this, offset);
			Object.setPrototypeOf(arr, this.constructor.prototype);
			return arr;
		}
		if (length >= 0)
		{
			length = offset + length;
		}
		var arr = Array.prototype.slice.call(this, offset, length);
		Object.setPrototypeOf(arr, this.constructor.prototype);
		return arr;
	},
	/**
	 * Append value to the end of array
	 * @param T value
	 */
	pushValue: function(value)
	{
		Array.prototype.push.call(this, value);
		return this;
	},
	/**
	 * Insert first value size_to array
	 * @return T value
	 */
	unshiftValue: function(value)
	{
		Array.prototype.unshift.call(this, value);
		return this;
	},
	/**
	 * Extract last value from array
	 * @return T value
	 */
	popValue: function()
	{
		return Array.prototype.pop.call(this);
	},
	/**
	 * Extract first value from array
	 * @return T value
	 */
	shiftValue: function()
	{
		return Array.prototype.shift.call(this);
	},
	/**
	 * Insert value to position
	 * @param T value
	 * @param int pos - position
	 */
	insertValue: function(pos, value)
	{
		Array.prototype.splice.call(this, pos, 0, value);
		return this;
	},
	/**
	 * Remove value from position
	 * @param int pos - position
	 * @param int count - count remove items
	 */
	removePosition: function(pos, count)
	{
		if (count == undefined) count = 1;
		Array.prototype.splice.call(this, pos, count);
		return this;
	},
	/**
	 * Remove value
	 */
	removeValue: function(value)
	{
		var index = this.indexOf(value);
		if (index != -1)
		{
			this.removePosition(index, 1);
		}
		return this;
	},
	/**
	 * Remove value
	 */
	removeValues: function(values)
	{
		for (var i = 0;i < values.count();i++)
		{
			this.removeValue(values.item(i));
		}
		return this;
	},
	/**
	 * Remove range
	 * @param int pos_begin - start position
	 * @param int pos_end - end position
	 */
	removeRangeValues: function(pos_begin, pos_end)
	{
		Array.prototype.splice.call(this, pos_begin, pos_end - pos_begin + 1);
		return this;
	},
	/**
	 * Set value size_to position
	 * @param int pos - position
	 * @param T value 
	 */
	setValue: function(pos, value)
	{
		if (pos < 0 || pos >= this.length)
		{
			var IndexOutOfRange = use ("Runtime.Exceptions.IndexOutOfRange");
			throw new IndexOutOfRange();
		}
		this[pos] = value;
		return this;
	},
	/**
	 * Clear all values from vector
	 */
	clear: function()
	{
		Array.prototype.splice.call(this, 0, this.length);
		return this;
	},
	/**
	 * Append value to the end of the vector
	 * @param T value
	 */
	appendValue: function(value)
	{
		this.push(value);
		return this;
	},
	/**
	 * Insert first value to begin of the vector
	 * @return T value
	 */
	prependValue: function(value)
	{
		this.unshift(value);
		return this;
	},
	/**
	 * Append vector to the end of the vector
	 * @param Vector<T> arr
	 */
	appendVector: function(arr)
	{
		if (!arr) return this;
		for (var i=0; i<arr.length; i++) Array.prototype.push.call(this, arr[i]);
		return this;
	},
	/**
	 * Prepend vector to the begin of the vector
	 * @param Vector<T> arr
	 */
	prependVector: function(arr)
	{
		for (var i=0; i<arr.length; i++) Array.prototype.unshift.call(this, arr[i]);
		return this;
	},
	getClassName: function()
	{
		return "Runtime.Vector";
	},
});
Object.assign(Runtime.Vector, Runtime.Collection);
Object.assign(Runtime.Vector,
{
	/**
	 * Returns new Instance
	 * @return Object
	 */
	Instance: function()
	{
		return new Runtime.Vector();
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Vector";
	},
	getParentClassName: function()
	{
		return "Runtime.Collection";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Vector);
window["Runtime.Vector"] = Runtime.Vector;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Vector;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.ClassException = function()
{
	Error.call(this);
	Error.captureStackTrace(this, this.constructor);
}
Runtime.Exceptions.ClassException.prototype = Object.create(Error.prototype);
Runtime.Exceptions.ClassException.prototype.constructor = Runtime.Exceptions.ClassException;
Object.assign(Runtime.Exceptions.ClassException.prototype,
{
	_init: function(){},
	getClassName: function(){ return "Runtime.Exceptions.ClassException"; },
});
Object.assign(Runtime.Exceptions.ClassException,
{
	getCurrentNamespace: function(){ return "Runtime.Exceptions"; },
	getCurrentClassName: function(){ return "Runtime.Exceptions.ClassException"; },
	getParentClassName: function(){ return ""; },
});
Runtime.Exceptions.RuntimeException = function(message, code, prev)
{
	if (message == undefined) message = "";
	if (code == undefined) code = -1;
	if (prev == undefined) prev = null;
	Runtime.Exceptions.ClassException.call(this, message, code, prev);
	this._init();
	this.error_str = message;
	this.error_code = code;
	this.prev = prev;
	this.updateError();
};
Runtime.Exceptions.RuntimeException.prototype = Object.create(Runtime.Exceptions.ClassException.prototype);
Runtime.Exceptions.RuntimeException.prototype.constructor = Runtime.Exceptions.RuntimeException;
Object.assign(Runtime.Exceptions.RuntimeException.prototype,
{
	getPreviousException: function()
	{
		return this.prev;
	},
	getErrorMessage: function()
	{
		return this.error_message;
	},
	getErrorString: function()
	{
		return this.error_str;
	},
	getErrorCode: function()
	{
		return this.error_code;
	},
	getFileName: function()
	{
		return this.error_file;
	},
	getErrorLine: function()
	{
		return this.error_line;
	},
	getErrorPos: function()
	{
		return this.error_pos;
	},
	toString: function()
	{
		return this.buildMessage();
	},
	buildMessage: function()
	{
		return this.error_str;
	},
	updateError: function()
	{
		this.error_message = this.buildMessage();
		this.message = this.error_message;
	},
	/**
	 * Returns trace
	 */
	getTraceStr: function()
	{
	},
	_init: function()
	{
		this.prev = null;
		this.error_message = "";
		this.error_str = "";
		this.error_code = 0;
		this.error_file = "";
		this.error_line = -1;
		this.error_pos = -1;
		Runtime.Exceptions.ClassException.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
});
Object.assign(Runtime.Exceptions.RuntimeException, Runtime.Exceptions.ClassException);
Object.assign(Runtime.Exceptions.RuntimeException,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.ClassException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("prev");
			a.push("error_message");
			a.push("error_str");
			a.push("error_code");
			a.push("error_file");
			a.push("error_line");
			a.push("error_pos");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "prev") return Dict.from({
			"t": "Object",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_message") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_str") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_code") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_file") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_line") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_pos") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.RuntimeException);
window["Runtime.Exceptions.RuntimeException"] = Runtime.Exceptions.RuntimeException;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.RuntimeException;
"use strict;"
/*!
 *  Bayrell Runtime Library 
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.ApiException = function(message, code, response, prev)
{
	if (message == undefined) message = "";
	if (code == undefined) code = -1;
	if (response == undefined) response = null;
	if (prev == undefined) prev = null;
	Runtime.Exceptions.RuntimeException.call(this, message, code, prev);
	this.response = response;
};
Runtime.Exceptions.ApiException.prototype = Object.create(Runtime.Exceptions.RuntimeException.prototype);
Runtime.Exceptions.ApiException.prototype.constructor = Runtime.Exceptions.ApiException;
Object.assign(Runtime.Exceptions.ApiException.prototype,
{
	_init: function()
	{
		this.response = null;
		Runtime.Exceptions.RuntimeException.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Exceptions.ApiException";
	},
});
Object.assign(Runtime.Exceptions.ApiException, Runtime.Exceptions.RuntimeException);
Object.assign(Runtime.Exceptions.ApiException,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.ApiException";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("response");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "response") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.ApiException);
window["Runtime.Exceptions.ApiException"] = Runtime.Exceptions.ApiException;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.ApiException;
"use strict;"
/*!
 *  Bayrell Runtime Library 
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.AssignStructValueError = function(name, prev)
{
	if (prev == undefined) prev = null;
	Runtime.Exceptions.RuntimeException.call(this, Runtime.rtl.getContext().translate("Runtime", "Can not set key '" + Runtime.rtl.toStr(name) + Runtime.rtl.toStr("' in immutable struct")), Runtime.rtl.ERROR_INDEX_OUT_OF_RANGE, prev);
};
Runtime.Exceptions.AssignStructValueError.prototype = Object.create(Runtime.Exceptions.RuntimeException.prototype);
Runtime.Exceptions.AssignStructValueError.prototype.constructor = Runtime.Exceptions.AssignStructValueError;
Object.assign(Runtime.Exceptions.AssignStructValueError.prototype,
{
	getClassName: function()
	{
		return "Runtime.Exceptions.AssignStructValueError";
	},
});
Object.assign(Runtime.Exceptions.AssignStructValueError, Runtime.Exceptions.RuntimeException);
Object.assign(Runtime.Exceptions.AssignStructValueError,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.AssignStructValueError";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.AssignStructValueError);
window["Runtime.Exceptions.AssignStructValueError"] = Runtime.Exceptions.AssignStructValueError;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.AssignStructValueError;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.FileNotFound = function(name, object, code, prev)
{
	if (object == undefined) object = "File";
	if (code == undefined) code = -5;
	if (prev == undefined) prev = null;
	Runtime.Exceptions.RuntimeException.call(this, Runtime.rtl.getContext().translate("Runtime", "%object% '%name%' not found", Runtime.Dict.from({"name":name,"object":object})), code, prev);
};
Runtime.Exceptions.FileNotFound.prototype = Object.create(Runtime.Exceptions.RuntimeException.prototype);
Runtime.Exceptions.FileNotFound.prototype.constructor = Runtime.Exceptions.FileNotFound;
Object.assign(Runtime.Exceptions.FileNotFound.prototype,
{
	getClassName: function()
	{
		return "Runtime.Exceptions.FileNotFound";
	},
});
Object.assign(Runtime.Exceptions.FileNotFound, Runtime.Exceptions.RuntimeException);
Object.assign(Runtime.Exceptions.FileNotFound,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.FileNotFound";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.FileNotFound);
window["Runtime.Exceptions.FileNotFound"] = Runtime.Exceptions.FileNotFound;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.FileNotFound;
"use strict;"
/*!
 *  Bayrell Runtime Library 
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.IndexOutOfRange = function(pos, prev)
{
	if (prev == undefined) prev = null;
	Runtime.Exceptions.RuntimeException.call(this, Runtime.rtl.getContext().translate("Runtime", "Index out of range. Pos: %pos%", Runtime.Dict.from({"pos":pos})), Runtime.rtl.ERROR_INDEX_OUT_OF_RANGE, prev);
};
Runtime.Exceptions.IndexOutOfRange.prototype = Object.create(Runtime.Exceptions.RuntimeException.prototype);
Runtime.Exceptions.IndexOutOfRange.prototype.constructor = Runtime.Exceptions.IndexOutOfRange;
Object.assign(Runtime.Exceptions.IndexOutOfRange.prototype,
{
	getClassName: function()
	{
		return "Runtime.Exceptions.IndexOutOfRange";
	},
});
Object.assign(Runtime.Exceptions.IndexOutOfRange, Runtime.Exceptions.RuntimeException);
Object.assign(Runtime.Exceptions.IndexOutOfRange,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.IndexOutOfRange";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.IndexOutOfRange);
window["Runtime.Exceptions.IndexOutOfRange"] = Runtime.Exceptions.IndexOutOfRange;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.IndexOutOfRange;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.KeyNotFound = function(key, prev)
{
	if (prev == undefined) prev = null;
	Runtime.Exceptions.RuntimeException.call(this, Runtime.rtl.getContext().translate("Runtime", "Key '%key%' not found", Runtime.Dict.from({"key":key})), Runtime.rtl.ERROR_KEY_NOT_FOUND, prev);
};
Runtime.Exceptions.KeyNotFound.prototype = Object.create(Runtime.Exceptions.RuntimeException.prototype);
Runtime.Exceptions.KeyNotFound.prototype.constructor = Runtime.Exceptions.KeyNotFound;
Object.assign(Runtime.Exceptions.KeyNotFound.prototype,
{
	getClassName: function()
	{
		return "Runtime.Exceptions.KeyNotFound";
	},
});
Object.assign(Runtime.Exceptions.KeyNotFound, Runtime.Exceptions.RuntimeException);
Object.assign(Runtime.Exceptions.KeyNotFound,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.KeyNotFound";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.KeyNotFound);
window["Runtime.Exceptions.KeyNotFound"] = Runtime.Exceptions.KeyNotFound;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.KeyNotFound;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Exceptions == 'undefined') Runtime.Exceptions = {};
Runtime.Exceptions.UnknownError = function(prev)
{
	if (prev == undefined) prev = null;
	Runtime.Exceptions.RuntimeException.call(this, Runtime.rtl.getContext().translate("Runtime", "Unknown error"), Runtime.rtl.ERROR_UNKNOWN, prev);
};
Runtime.Exceptions.UnknownError.prototype = Object.create(Runtime.Exceptions.RuntimeException.prototype);
Runtime.Exceptions.UnknownError.prototype.constructor = Runtime.Exceptions.UnknownError;
Object.assign(Runtime.Exceptions.UnknownError.prototype,
{
	getClassName: function()
	{
		return "Runtime.Exceptions.UnknownError";
	},
});
Object.assign(Runtime.Exceptions.UnknownError, Runtime.Exceptions.RuntimeException);
Object.assign(Runtime.Exceptions.UnknownError,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Exceptions";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Exceptions.UnknownError";
	},
	getParentClassName: function()
	{
		return "Runtime.Exceptions.RuntimeException";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Exceptions.UnknownError);
window["Runtime.Exceptions.UnknownError"] = Runtime.Exceptions.UnknownError;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Exceptions.UnknownError;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.SerializeInterface = function()
{
};
Object.assign(Runtime.SerializeInterface.prototype,
{
	/**
	 * Returns instance of the value by variable name
	 * @param string variable_name
	 * @return var
	 */
	get: function(variable_name, default_value)
	{
		if (default_value == undefined) default_value = null;
	},
	getClassName: function()
	{
		return "Runtime.SerializeInterface";
	},
});
Object.assign(Runtime.SerializeInterface,
{
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.SerializeInterface";
	},
});
Runtime.rtl.defClass(Runtime.SerializeInterface);
window["Runtime.SerializeInterface"] = Runtime.SerializeInterface;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.SerializeInterface;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.StringInterface = function()
{
};
Object.assign(Runtime.StringInterface.prototype,
{
	/**
	 * Returns string
	 */
	toString: function()
	{
	},
	getClassName: function()
	{
		return "Runtime.StringInterface";
	},
});
Object.assign(Runtime.StringInterface,
{
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.StringInterface";
	},
});
Runtime.rtl.defClass(Runtime.StringInterface);
window["Runtime.StringInterface"] = Runtime.StringInterface;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.StringInterface;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.BaseObject = function()
{
	/* Init object */
	this._init();
};
Object.assign(Runtime.BaseObject.prototype,
{
	/**
	 * Init function
	 */
	_init: function()
	{
	},
	getClassName: function()
	{
		return "Runtime.BaseObject";
	},
});
Object.assign(Runtime.BaseObject,
{
	/**
	 * Returns new instance
	 */
	newInstance: function(items)
	{
		return null;
	},
	createInstance: function(items)
	{
		return this.newInstance(items);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.BaseObject);
window["Runtime.BaseObject"] = Runtime.BaseObject;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.BaseObject;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.BaseStruct = function(obj)
{
	if (obj == undefined) obj = null;
	Runtime.BaseObject.call(this);
	this.constructor._assign(this, null, obj);
	if (this.__uq__ == undefined || this.__uq__ == null) this.__uq__ = Symbol();
		Object.freeze(this);
};
Runtime.BaseStruct.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.BaseStruct.prototype.constructor = Runtime.BaseStruct;
Object.assign(Runtime.BaseStruct.prototype,
{
	/**
	 * Copy this struct with new values
	 * @param Map obj = null
	 * @return BaseStruct
	 */
	copy: function(obj)
	{
		if (obj == undefined) obj = null;
		if (obj == null)
		{
			return this;
		}
		var proto = Object.getPrototypeOf(this);
		var item = Object.create(proto); /* item._init(); */
		item = Object.assign(item, this);
		
		this.constructor._assign(item, this, obj);
		
		Object.freeze(item);
		
		return item;
		return this;
	},
	/**
	 * Copy this struct with new values
	 * @param Map obj = null
	 * @return BaseStruct
	 */
	clone: function(obj)
	{
		if (obj == undefined) obj = null;
		return this.copy(obj);
	},
	/**
	 * Clone this struct with fields
	 * @param Collection fields = null
	 * @return BaseStruct
	 */
	intersect: function(fields)
	{
		if (fields == undefined) fields = null;
		if (fields == null)
		{
			return Runtime.Dict.from({});
		}
		var obj = new Runtime.Map();
		fields.each((field_name) => 
		{
			obj.setValue(field_name, this.takeValue(field_name));
		});
		/* Return object */
		var res = Runtime.rtl.newInstance(this.getClassName(), Runtime.Collection.from([obj.toDict()]));
		return res;
	},
	/**
	 * Create new struct with new value
	 * @param string field_name
	 * @param fn f
	 * @return BaseStruct
	 */
	map: function(field_name, f)
	{
		return this.copy((new Runtime.Map()).setValue(field_name, f(this.takeValue(field_name))).toDict());
	},
	/**
	 * Returns struct as Dict
	 * @return Dict
	 */
	takeDict: function()
	{
		var values = new Runtime.Map();
		var names = Runtime.rtl.getFields(this.getClassName());
		for (var i = 0;i < names.count();i++)
		{
			var variable_name = names.item(i);
			var value = this.get(variable_name, null);
			values.setValue(variable_name, value);
		}
		return values.toDict();
	},
	/**
	 * Returns struct as Dict
	 * @return Dict
	 */
	toDict: function()
	{
		return this.takeDict();
	},
	getClassName: function()
	{
		return "Runtime.BaseStruct";
	},
});
Object.assign(Runtime.BaseStruct, Runtime.BaseObject);
Object.assign(Runtime.BaseStruct,
{
	/**
	 * Returns field value
	 */
	_initDataGet: function(old, changed, field_name)
	{
		return (changed != null && changed.has(field_name)) ? (Runtime.rtl.get(changed, field_name)) : (Runtime.rtl.get(old, field_name));
	},
	/**
	 * Init struct data
	 */
	_initData: function(old, changed)
	{
		return changed;
	},
	/**
	 * Assign
	 */
	_assign: function(new_item, old_item, obj)
	{
		obj = Runtime.rtl.convert(obj, "Runtime.Dict");
		obj = new_item.constructor._initData(old_item, obj);
		if (obj == null)
		{
			return ;
		}
		var check_types = false;
		var class_name = new_item.getClassName();
		/* Enable check types */
		check_types = true;
		if (class_name == "Runtime.IntrospectionClass")
		{
			check_types = false;
		}
		if (class_name == "Runtime.IntrospectionInfo")
		{
			check_types = false;
		}
		var _Dict = use("Runtime.Dict");
		var rtl = use("Runtime.rtl");
		if (obj instanceof _Dict)
		{
			for (var key in obj._map)
			{
				var real_key = key.substring(1);
				var value = obj._map[key];
				if (check_types)
				{
					info = rtl.getFieldInfo(class_name, real_key);
					if (info)
					{
						value = rtl.convert(value, info.get("t"), null);
					}
				}
				new_item[real_key] = value;
			}
		}
		else
		{
			for (var key in obj)
			{
				var value = obj[key];
				if (check_types)
				{
					info = rtl.getFieldInfo(new_item.getClassName(), key);
					if (info)
					{
						value = rtl.convert(value, info.get("t"), null);
					}
				}
				new_item[key] = value;
			}
		}
	},
	/**
	 * Returns new instance
	 */
	newInstance: function(items)
	{
		return new (Function.prototype.bind.apply(this, (typeof ctx != "undefined") ? [null, ctx, items] : [null, items]));
	},
	/**
	 * Update struct
	 * @param Collection<string> path
	 * @param var value
	 * @return BaseStruct
	 */
	update: function(item, items)
	{
		return item.copy(items);
	},
	/**
	 * Update struct
	 * @param Collection<string> path
	 * @param var value
	 * @return BaseStruct
	 */
	setAttr: function(item, path, value)
	{
		return Runtime.rtl.setAttr(item, path, value);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
	__implements__:
	[
		Runtime.SerializeInterface,
	],
});
Runtime.rtl.defClass(Runtime.BaseStruct);
window["Runtime.BaseStruct"] = Runtime.BaseStruct;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.BaseStruct;
Runtime.BaseStruct.prototype.get = function(k, v)
{ if (v == undefined) v = null; return this[k] != undefined ? this[k] : v; };
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.BaseDriver = function(object_name, entity)
{
	if (object_name == undefined) object_name = "";
	if (entity == undefined) entity = null;
	Runtime.BaseObject.call(this);
	this.object_name = object_name;
	this.entity = entity;
};
Runtime.BaseDriver.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.BaseDriver.prototype.constructor = Runtime.BaseDriver;
Object.assign(Runtime.BaseDriver.prototype,
{
	/**
	 * Returns object name
	 */
	getObjectName: function()
	{
		return this.object_name;
	},
	/**
	 * Returns entity
	 */
	getEntity: function()
	{
		return this.entity;
	},
	/**
	 * Start driver
	 */
	startDriver: async function()
	{
	},
	_init: function()
	{
		this.object_name = "";
		this.entity = null;
		Runtime.BaseObject.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.BaseDriver";
	},
});
Object.assign(Runtime.BaseDriver, Runtime.BaseObject);
Object.assign(Runtime.BaseDriver,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.BaseDriver";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("object_name");
			a.push("entity");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "object_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "entity") return Dict.from({
			"t": "Runtime.Entity",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.BaseDriver);
window["Runtime.BaseDriver"] = Runtime.BaseDriver;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.BaseDriver;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Date = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Date.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Date.prototype.constructor = Runtime.Date;
Object.assign(Runtime.Date.prototype,
{
	/**
	 * Return date
	 * @return string
	 */
	getDate: function()
	{
		return this.y + Runtime.rtl.toStr("-") + Runtime.rtl.toStr(this.m) + Runtime.rtl.toStr("-") + Runtime.rtl.toStr(this.d);
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.y = 0;
		this.m = 0;
		this.d = 0;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Date";
	},
});
Object.assign(Runtime.Date, Runtime.BaseStruct);
Object.assign(Runtime.Date,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Date";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("y");
			a.push("m");
			a.push("d");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "y") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "m") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "d") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Date);
window["Runtime.Date"] = Runtime.Date;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Date;
Runtime.Date.prototype.toObject = function()
{
	var dt = new Date(this.y, this.m - 1, this.d);
	return dt;
}
Runtime.Date.fromObject = function(dt)
{
	var Dict = use("Runtime.Dict");
	var y = Number(dt.getFullYear());
	var m = Number(dt.getMonth()) + 1;
	var d = Number(dt.getDate());
	var dt = new Runtime.Date( ctx, Dict.from({"y":y,"m":m,"d":d}) );
	return dt;
}
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.DateTime = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.DateTime.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.DateTime.prototype.constructor = Runtime.DateTime;
Object.assign(Runtime.DateTime.prototype,
{
	/**
	 * Returns timestamp
	 * @return int
	 */
	getTimestamp: function()
	{
		var dt = this.toObject();
		return dt.getTime();
		return null;
	},
	timestamp: function()
	{
		return this.getTimestamp();
	},
	/**
	 * Returns day of week
	 * @return int
	 */
	getDayOfWeek: function()
	{
		var dt = this.toObject();
		return dt.getDay();
		return null;
	},
	/**
	 * Return db datetime
	 * @return string
	 */
	getDateTime: function(tz)
	{
		if (tz == undefined) tz = "UTC";
		var dt = this.toObject();
		var offset = this.constructor.getTimezoneOffset(tz);
		var offset = offset - dt.getTimezoneOffset();
		dt = this.constructor.shiftOffset(dt, -offset);
		
		var y = Number(dt.getFullYear());
		var m = Number(dt.getMonth()) + 1;
		var d = Number(dt.getDate());
		var h = Number(dt.getHours());
		var i = Number(dt.getMinutes());
		var s = Number(dt.getSeconds());
		
		var m = (m < 10) ? "0" + m : "" + m;
		var d = (d < 10) ? "0" + d : "" + d;
		var h = (h < 10) ? "0" + h : "" + h;
		var i = (i < 10) ? "0" + i : "" + i;
		var s = (s < 10) ? "0" + s : "" + s;
		return y + "-" + m + "-" + d + " " + h + ":" + i + ":" + s;
		return "";
	},
	/**
	 * Return date
	 * @return string
	 */
	getDate: function(tz)
	{
		if (tz == undefined) tz = "UTC";
		var value = this.getDateTime(tz);
		return Runtime.rs.substr(value, 0, 10);
	},
	/**
	 * Return datetime in RFC822
	 * @return string
	 */
	getRFC822: function()
	{
		var y = this.y, m = this.m, d = this.d, h = this.h, i = this.i, s = this.s;
		var dt = new Date(y, m - 1, d, h, i, s);
		
		y = (y < 10) ? "0" + y : "" + y;
		m = (m < 10) ? "0" + m : "" + m;
		d = (d < 10) ? "0" + d : "" + d;
		h = (h < 10) ? "0" + h : "" + h;
		i = (i < 10) ? "0" + i : "" + i;
		s = (s < 10) ? "0" + s : "" + s;
		
		var dow = dt.getDay();
		var dow_s = "";
		if (dow == 0) dow_s = "Sun";
		if (dow == 1) dow_s = "Mon";
		if (dow == 2) dow_s = "Tue";
		if (dow == 3) dow_s = "Wed";
		if (dow == 4) dow_s = "Thu";
		if (dow == 5) dow_s = "Fri";
		if (dow == 6) dow_s = "Sat";
		
		var m_s = "";
		if (m == 1) m_s = "Jan";
		if (m == 2) m_s = "Feb";
		if (m == 3) m_s = "Mar";
		if (m == 4) m_s = "Apr";
		if (m == 5) m_s = "May";
		if (m == 6) m_s = "Jun";
		if (m == 7) m_s = "Jul";
		if (m == 8) m_s = "Aug";
		if (m == 9) m_s = "Sep";
		if (m == 10) m_s = "Oct";
		if (m == 11) m_s = "Nov";
		if (m == 12) m_s = "Dec";
		
		return dow_s + ", " + d + " " + m_s + " " + y + " " + h + ":" + i + ":" + s + " " + this.tz;
		return "";
	},
	/**
	 * Return datetime in ISO8601
	 * @return string
	 */
	getISO8601: function()
	{
		var y = this.y, m = this.m, d = this.d, h = this.h, i = this.i, s = this.s;
		m = (m < 10) ? "0" + m : "" + m;
		d = (d < 10) ? "0" + d : "" + d;
		h = (h < 10) ? "0" + h : "" + h;
		i = (i < 10) ? "0" + i : "" + i;
		s = (s < 10) ? "0" + s : "" + s;
		var tz = Math.ceil(-this.constructor.getTimezoneOffset(this.tz) / 60);
		if (tz < 10 && tz >= 0) tz = "0" + tz;
		if (tz >= 0) tz = "+" + tz;
		return this.y + "-" + m + "-" + d + "T" + h + ":" + i + ":" + s + tz;
		return "";
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.y = 0;
		this.m = 0;
		this.d = 0;
		this.h = 0;
		this.i = 0;
		this.s = 0;
		this.ms = 0;
		this.tz = "UTC";
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.DateTime";
	},
});
Object.assign(Runtime.DateTime, Runtime.BaseStruct);
Object.assign(Runtime.DateTime,
{
	/**
	 * Create date time from timestamp
	 */
	create: function(time, tz)
	{
		if (time == undefined) time = -1;
		if (tz == undefined) tz = "UTC";
		var dt = null;
		if (time == -1) dt = new Date();
		else dt = new Date(time*1000);
		return this.fromObject(dt, tz);
		return null;
	},
	/**
	 * Convert to timestamp
	 */
	strtotime: function(s, tz)
	{
		if (tz == undefined) tz = "UTC";
	},
	/**
	 * Create date from string
	 */
	fromString: function(s, tz)
	{
		if (tz == undefined) tz = "UTC";
		var time = this.strtotime(s);
		return this.create(time, tz);
	},
	/**
	 * Returns datetime
	 * @param string tz
	 * @return DateTime
	 */
	now: function(tz)
	{
		if (tz == undefined) tz = "UTC";
		return this.create(-1, tz);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.DateTime";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("y");
			a.push("m");
			a.push("d");
			a.push("h");
			a.push("i");
			a.push("s");
			a.push("ms");
			a.push("tz");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "y") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "m") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "d") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "h") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "i") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "s") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ms") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "tz") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.DateTime);
window["Runtime.DateTime"] = Runtime.DateTime;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.DateTime;
Runtime.DateTime.getTimezoneOffset = function(tz)
{
	if (tz == "UTC") return 0;
	if (tz == "GMT") return 0;
	if (tz == "GMT+1") return -60;
	if (tz == "GMT+2") return -120;
	if (tz == "GMT+3") return -180;
	if (tz == "GMT+4") return -240;
	if (tz == "GMT+5") return -300;
	if (tz == "GMT+6") return -360;
	if (tz == "GMT+7") return -420;
	if (tz == "GMT+8") return -480;
	if (tz == "GMT+9") return -540;
	if (tz == "GMT+10") return -600;
	if (tz == "GMT+11") return -660;
	if (tz == "GMT+13") return -780;
	if (tz == "GMT+14") return -840;
	if (tz == "GMT-1") return 60;
	if (tz == "GMT-2") return 120;
	if (tz == "GMT-3") return 180;
	if (tz == "GMT-4") return 240;
	if (tz == "GMT-5") return 300;
	if (tz == "GMT-6") return 360;
	if (tz == "GMT-7") return 420;
	if (tz == "GMT-8") return 480;
	if (tz == "GMT-9") return 540;
	if (tz == "GMT-10") return 600;
	if (tz == "GMT-11") return 660;
	if (tz == "GMT-12") return 720;
	return 0;
}

Runtime.DateTime.shiftOffset = function(dt, offset)
{
	var h = Math.floor(offset / 60);
	var m = offset % 60;
	dt.setMinutes(dt.getMinutes() + m);
	dt.setHours(dt.getHours() + h);
	return dt;
}

Runtime.DateTime.prototype.toObject = function()
{
	var dt = new Date(this.y, this.m - 1, this.d, this.h, this.i, this.s);
	var offset = this.constructor.getTimezoneOffset(this.tz);
	var offset = offset - dt.getTimezoneOffset();
	dt = this.constructor.shiftOffset(dt, offset);
	return dt;
}

Runtime.DateTime.fromObject = function(dt, tz)
{
	var Dict = use("Runtime.Dict");
	var offset = this.getTimezoneOffset(tz);
	var offset = offset - dt.getTimezoneOffset();
	dt = this.shiftOffset(dt, -offset);
	var y = Number(dt.getFullYear());
	var m = Number(dt.getMonth()) + 1;
	var d = Number(dt.getDate());
	var h = Number(dt.getHours());
	var i = Number(dt.getMinutes());
	var s = Number(dt.getSeconds());
	var dt = new Runtime.DateTime(Dict.from({"y":y,"m":m,"d":d,"h":h,"i":i,"s":s,"tz":tz}));
	return dt;
}
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Reference = function(ref)
{
	if (ref == undefined) ref = null;
	Runtime.BaseObject.call(this);
	this.ref = ref;
};
Runtime.Reference.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.Reference.prototype.constructor = Runtime.Reference;
Object.assign(Runtime.Reference.prototype,
{
	/**
	 * Assign and clone data from other object
	 * @param BaseObject obj
	 */
	assignObject1: function(obj)
	{
		if (obj instanceof Runtime.Reference)
		{
			this.uq = obj.uq;
			this.ref = this.ref;
		}
		Runtime.BaseObject.prototype.assignObject1.call(this, obj);
	},
	_init: function()
	{
		this.uq = Runtime.rtl.unique();
		this.ref = null;
		Runtime.BaseObject.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Reference";
	},
});
Object.assign(Runtime.Reference, Runtime.BaseObject);
Object.assign(Runtime.Reference,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Reference";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("uq");
			a.push("ref");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "uq") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ref") return Dict.from({
			"t": "T",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Reference);
window["Runtime.Reference"] = Runtime.Reference;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Reference;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Context = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Context.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Context.prototype.constructor = Runtime.Context;
Object.assign(Runtime.Context.prototype,
{
	/**
	 * Returns enviroment by eky
	 */
	env: function(key, def_value)
	{
		if (def_value == undefined) def_value = "";
		var __v0 = new Runtime.Monad(this);
		__v0 = __v0.attr("enviroments");
		__v0 = __v0.call(Runtime.lib.get(key, def_value));
		return __v0.value();
	},
	/**
	 * Returns settings
	 * @return Dict<string>
	 */
	config: function(items, d)
	{
		if (d == undefined) d = null;
		var __v0 = new Runtime.Monad(this);
		__v0 = __v0.attr("settings");
		__v0 = __v0.call(Runtime.lib.get("config", null));
		__v0 = __v0.call(Runtime.lib.attr(items, d));
		return __v0.value();
	},
	/**
	 * Returns docker secret key
	 */
	secret: function(key)
	{
		var __v0 = new Runtime.Monad(this);
		__v0 = __v0.attr("settings");
		__v0 = __v0.call(Runtime.lib.get("secrets", null));
		__v0 = __v0.call(Runtime.lib.get(key, ""));
		return __v0.value();
	},
	/**
	 * Add driver
	 */
	addDriver: function(obj)
	{
		this.drivers.setValue(obj.getObjectName(), obj);
		return this;
	},
	/**
	 * Add driver
	 */
	getDriver: function(name)
	{
		return this.drivers.get(name, null);
	},
	/* ---------------------- Chain --------------------- */
	/**
	 * Apply Lambda Chain
	 */
	chain: function(chain_name, args)
	{
		var entities = this.entities.filter((item) => 
		{
			return item instanceof Runtime.LambdaChain && item.name == chain_name && item.is_async == false;
		});
		entities = entities.sortIm((a, b) => 
		{
			return a.pos > b.pos;
		});
		for (var i = 0;i < entities.count();i++)
		{
			var item = entities.item(i);
			var item_chain_name = item.chain;
			if (item_chain_name != "")
			{
				args = this.chain(item_chain_name, args);
			}
			else
			{
				var arr = Runtime.rs.split("::", item.value);
				var class_name = arr.get(0, "");
				var method_name = arr.get(1, "");
				var f = Runtime.rtl.method(class_name, method_name);
				args = Runtime.rtl.apply(f, args);
			}
		}
		return args;
	},
	/**
	 * Apply Lambda Chain Await
	 */
	chainAsync: async function(chain_name, args)
	{
		var entities = this.entities.filter((item) => 
		{
			return item instanceof Runtime.LambdaChain && item.name == chain_name;
		});
		entities = entities.sortIm((a, b) => 
		{
			return a.pos > b.pos;
		});
		for (var i = 0;i < entities.count();i++)
		{
			var item = entities.item(i);
			var item_chain_name = item.chain;
			if (item_chain_name != "")
			{
				args = await this.chainAsync(item_chain_name, args);
			}
			else
			{
				var arr = Runtime.rs.split("::", item.value);
				var class_name = arr.get(0, "");
				var method_name = arr.get(1, "");
				var f = Runtime.rtl.method(class_name, method_name);
				if (item.is_async)
				{
					args = await Runtime.rtl.applyAsync(f, args);
				}
				else
				{
					args = Runtime.rtl.apply(f, args);
				}
			}
		}
		return Promise.resolve(args);
	},
	/**
	 * Translate message
	 * @params string space - message space
	 * @params string message - message need to be translated
	 * @params Map params - Messages params. Default null.
	 * @params string locale - Different locale. Default "".
	 * @return string - translated string
	 */
	translate: function(space, message, params, locale)
	{
		if (params == undefined) params = null;
		if (locale == undefined) locale = "";
		message = (params == null) ? (message) : (params.reduce((message, value, key) => 
		{
			return Runtime.rs.replace("%" + Runtime.rtl.toStr(key) + Runtime.rtl.toStr("%"), value, message);
		}, message));
		return message;
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.base_path = null;
		this.enviroments = null;
		this.settings = null;
		this.modules = null;
		this.entities = null;
		this.cli_args = null;
		this.drivers = new Runtime.Map();
		this.initialized = false;
		this.started = false;
		this.start_time = 0;
		this.tz = "UTC";
		this.app_name = "";
		this.entry_point = "";
		this.main_module = "";
		this.main_class = "";
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Context";
	},
});
Object.assign(Runtime.Context, Runtime.BaseStruct);
Object.assign(Runtime.Context,
{
	/**
	 * Returns app name
	 * @return string
	 */
	appName: function()
	{
		return "";
	},
	/**
	 * Returns context settings
	 * @return Dict<string>
	 */
	getSettings: function(env)
	{
		return null;
	},
	/**
	 * Extends entities
	 */
	getEntities: function(entities)
	{
		return null;
	},
	/**
	 * Create context
	 *
	 * @params Dict env
	 * @params Collection<string> modules
	 * @params Dict settings
	 * @return Context
	 */
	create: function(env)
	{
		if (env == undefined) env = null;
		var settings = Runtime.Dict.from({});
		/* Context data */
		var obj = Runtime.Dict.from({"enviroments":env,"settings":settings,"modules":Runtime.Collection.from([])});
		/* Create context */
		var ctx = this.newInstance(obj);
		return ctx;
	},
	/**
	 * Set main module
	 */
	setMainModule: function(c, main_module)
	{
		var settings = Runtime.Dict.from({});
		var main_module_class_name = "";
		/* Get settings */
		if (main_module)
		{
			main_module_class_name = main_module + Runtime.rtl.toStr(".ModuleDescription");
			if (Runtime.rtl.method_exists(main_module_class_name, "appSettings"))
			{
				var f = Runtime.rtl.method(main_module_class_name, "appSettings");
				settings = f(c.enviroments);
			}
		}
		/* Add main module */
		if (main_module)
		{
			c = Runtime.rtl.setAttr(c, Runtime.Collection.from(["modules"]), c.modules.pushIm(main_module));
		}
		/* Set main module */
		c = Runtime.rtl.setAttr(c, Runtime.Collection.from(["main_module"]), main_module);
		c = Runtime.rtl.setAttr(c, Runtime.Collection.from(["main_class"]), main_module_class_name);
		/* Set entry point */
		c = Runtime.rtl.setAttr(c, Runtime.Collection.from(["entry_point"]), main_module_class_name);
		/* Set new settings */
		c = Runtime.rtl.setAttr(c, Runtime.Collection.from(["settings"]), settings);
		return c;
	},
	/**
	 * Set app name
	 */
	setAppName: function(c, app_name)
	{
		return c.copy(Runtime.Dict.from({"app_name":app_name}));
	},
	/**
	 * Set main class
	 */
	setMainClass: function(c, main_class)
	{
		return c.copy(Runtime.Dict.from({"main_class":main_class,"entry_point":main_class}));
	},
	/**
	 * Set entry point
	 */
	setEntryPoint: function(c, entry_point)
	{
		return c.copy(Runtime.Dict.from({"entry_point":entry_point}));
	},
	/**
	 * Init context
	 */
	appInit: function(c)
	{
		Runtime.rtl.setContext(c);
		if (c.initialized)
		{
			return c;
		}
		/* Extends modules */
		var modules = this.getRequiredModules(c.modules);
		/* Get modules entities */
		var entities = this.getEntitiesFromModules(modules);
		entities = entities.prependCollectionIm(this.getEntities(c.env));
		/* Base path */
		var base_path = (c.base_path != "") ? (c.base_path) : (Runtime.rtl.attr(c.env, Runtime.Collection.from(["BASE_PATH"]), "", "string"));
		/* Add entities */
		if (c.entities != null)
		{
			entities = entities.appendCollectionIm(c.entities);
		}
		c = Runtime.rtl.setAttr(c, Runtime.Collection.from(["entities"]), entities);
		/* Extend entities */
		var __v0 = new Runtime.Monad(c.chain("Runtime.Entities", Runtime.Collection.from([c,entities])));
		__v0 = __v0.attr(1);
		entities = __v0.value();
		entities = this.extendEntities(c, entities);
		entities = this.getRequiredEntities(entities);
		/* Add lambda chains */
		entities = entities.concat(this.getSubEntities(entities, "Runtime.LambdaChainClass", "Runtime.LambdaChain"));
		return c.copy(Runtime.Dict.from({"modules":modules,"entities":entities,"base_path":base_path,"initialized":true}));
	},
	/**
	 * Start context
	 */
	appStart: async function(c)
	{
		Runtime.rtl.setContext(c);
		if (c.started)
		{
			return Promise.resolve(c);
		}
		/* Get drivers from entity */
		var drivers = c.entities.filter((item) => 
		{
			return item instanceof Runtime.Driver;
		});
		/* Create drivers */
		for (var i = 0;i < drivers.count();i++)
		{
			var driver_entity = drivers.item(i);
			var driver_name = driver_entity.name;
			var class_name = driver_entity.value;
			if (class_name == "")
			{
				class_name = driver_entity.name;
			}
			var driver = Runtime.rtl.newInstance(class_name, Runtime.Collection.from([driver_name,driver_entity]));
			var __v0 = new Runtime.Monad(Runtime.rtl.getContext().chain(class_name, Runtime.Collection.from([driver])));
			__v0 = __v0.attr(0);
			driver = __v0.value();
			if (class_name != driver_name)
			{
				var __v1 = new Runtime.Monad(Runtime.rtl.getContext().chain(driver_name, Runtime.Collection.from([driver])));
				__v1 = __v1.attr(0);
				driver = __v1.value();
			}
			if (driver == null)
			{
				throw new Runtime.Exceptions.RuntimeException("Driver '" + Runtime.rtl.toStr(class_name) + Runtime.rtl.toStr("' not found"))
			}
			c.drivers.setValue(driver_name, driver);
		}
		/* Start drivers */
		var keys = c.drivers.keys();
		for (var i = 0;i < keys.count();i++)
		{
			var driver_name = Runtime.rtl.get(keys, i);
			var driver = Runtime.rtl.get(c.drivers, driver_name);
			await driver.startDriver();
			if (driver.entity.global)
			{
				window[driver_name] = driver;
			}
		}
		return Promise.resolve(c.copy(Runtime.Dict.from({"started":true})));
	},
	/**
	 * Init
	 */
	init: async function(c)
	{
		var main_class = c.main_class;
		/* Init app */
		if (main_class != "" && Runtime.rtl.method_exists(main_class, "appInit"))
		{
			var appInit = Runtime.rtl.method(main_class, "appInit");
			c = appInit(c);
		}
		else
		{
			c = c.constructor.appInit(c);
		}
		return Promise.resolve(c);
	},
	/**
	 * Start
	 */
	start: async function(c)
	{
		var main_class = c.main_class;
		/* Start app */
		if (main_class != "" && Runtime.rtl.method_exists(main_class, "appStart"))
		{
			var appStart = Runtime.rtl.method(main_class, "appStart");
			c = await appStart(c);
		}
		else
		{
			c = await c.constructor.appStart(c);
		}
		return Promise.resolve(c);
	},
	/**
	 * Run entry point
	 */
	run: async function(c)
	{
		Runtime.rtl.setContext(c);
		var entry_point = c.entry_point;
		/* Run entrypoint */
		if (entry_point != "")
		{
			var appRun = Runtime.rtl.method(entry_point, "appRun");
			await appRun(c);
		}
		return Promise.resolve(c);
	},
	/* -------------------- Functions ------------------- */
	/**
	 * Returns required modules
	 * @param string class_name
	 * @return Collection<string>
	 */
	_getRequiredModules: function(res, cache, modules, filter)
	{
		if (filter == undefined) filter = null;
		if (modules == null)
		{
			return ;
		}
		if (filter)
		{
			modules = modules.filter(filter);
		}
		for (var i = 0;i < modules.count();i++)
		{
			var module_name = modules.item(i);
			if (cache.get(module_name, false) == false)
			{
				cache.setValue(module_name, true);
				var f = Runtime.rtl.method(module_name + Runtime.rtl.toStr(".ModuleDescription"), "requiredModules");
				var sub_modules = f();
				if (sub_modules != null)
				{
					var sub_modules = sub_modules.keys();
					this._getRequiredModules(res, cache, sub_modules);
				}
				res.pushValue(module_name);
			}
		}
	},
	/**
	 * Returns all modules
	 * @param Collection<string> modules
	 * @return Collection<string>
	 */
	getRequiredModules: function(modules)
	{
		var res = new Runtime.Vector();
		var cache = new Runtime.Map();
		this._getRequiredModules(res, cache, modules);
		res = res.removeDuplicates();
		return res.toCollection();
	},
	/**
	 * Returns modules entities
	 */
	getEntitiesFromModules: function(modules)
	{
		var entities = new Runtime.Vector();
		for (var i = 0;i < modules.count();i++)
		{
			var module_class_name = modules.item(i) + Runtime.rtl.toStr(".ModuleDescription");
			if (Runtime.rtl.method_exists(module_class_name, "entities"))
			{
				var f = Runtime.rtl.method(module_class_name, "entities");
				var arr = f();
				entities.appendVector(arr);
			}
		}
		return entities.toCollection();
	},
	/**
	 * Extend entities
	 */
	getRequiredEntities: function(entities)
	{
		var e = entities.toVector();
		for (var i = 0;i < entities.count();i++)
		{
			var item1 = entities.item(i);
			var item1_class_name = item1.getClassName();
			if (item1_class_name == "Runtime.Entity")
			{
				var class_name = (item1.value != "") ? (item1.value) : (item1.name);
				var annotations = Runtime.rtl.getClassAnnotations(class_name);
				for (var j = 0;j < annotations.count();j++)
				{
					var item2 = annotations.item(j);
					var item2_class_name = item2.getClassName();
					if (item2 instanceof Runtime.Entity && item2_class_name != "Runtime.Entity")
					{
						item2 = item2.copy(Runtime.Dict.from({"name":class_name}));
						e.pushValue(item2);
					}
				}
			}
		}
		return e.toCollection();
	},
	/**
	 * Returns sub entities from classes
	 */
	getSubEntities: function(entitites, entity_class_name, entity_class_method)
	{
		var class_names = entitites.filter(Runtime.lib.isInstance(entity_class_name));
		var methods = new Runtime.Vector();
		methods.appendVector(entitites.filter(Runtime.lib.isInstance(entity_class_method)));
		for (var class_names_inc = 0;class_names_inc < class_names.count();class_names_inc++)
		{
			var class_item = Runtime.rtl.get(class_names, class_names_inc);
			var class_name = class_item.name;
			if (class_name == "")
			{
				continue;
			}
			var annotations = Runtime.rtl.getMethodsAnnotations(class_name);
			annotations.each((annotations, class_method_name) => 
			{
				var method_info = Runtime.rtl.methodApply(class_name, "getMethodInfoByName", Runtime.Collection.from([class_method_name]));
				for (var annotations_inc = 0;annotations_inc < annotations.count();annotations_inc++)
				{
					var annotation = Runtime.rtl.get(annotations, annotations_inc);
					if (annotation)
					{
						if (Runtime.rtl.is_instanceof(annotation, entity_class_method))
						{
							annotation = annotation.addClassItem(class_name, class_method_name, class_item, method_info);
							methods.pushValue(annotation);
						}
					}
				}
			});
		}
		return methods;
	},
	/**
	 * Extends entities
	 */
	extendEntities: function(c, entities)
	{
		return entities;
	},
	/**
	 * Start App
	 */
	startApp: async function(env, module_name, main_class)
	{
		var context = this.create(env);
		/* Set global context */
		Runtime.rtl.setContext(context);
		Runtime.rtl.setContext(context);
		window["globalContext"] = context;
		context = context.constructor.setAppName(context, module_name);
		context = context.constructor.setMainModule(context, module_name);
		context = context.constructor.setMainClass(context, main_class);
		context = context.constructor.setEntryPoint(context, main_class);
		/* Init context */
		context = await context.constructor.init(context);
		/* Start context */
		context = await context.constructor.start(context);
		/* Set global context */
		Runtime.rtl.setContext(context);
		Runtime.rtl.setContext(context);
		window["globalContext"] = context;
		try
		{
			/* Run app */
			await context.constructor.run(context);
		}
		catch (_ex)
		{
			if (true)
			{
				var e = _ex;
				
				console.log( e.stack );
			}
			else
			{
				throw _ex;
			}
		}
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Context";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("base_path");
			a.push("enviroments");
			a.push("settings");
			a.push("modules");
			a.push("entities");
			a.push("cli_args");
			a.push("drivers");
			a.push("initialized");
			a.push("started");
			a.push("start_time");
			a.push("tz");
			a.push("app_name");
			a.push("entry_point");
			a.push("main_module");
			a.push("main_class");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "base_path") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "enviroments") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "settings") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["var"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "modules") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "entities") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["Runtime.BaseStruct"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "cli_args") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "drivers") return Dict.from({
			"t": "Runtime.Map",
			"s": ["Runtime.BaseDriver"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "initialized") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "started") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "start_time") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "tz") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "app_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "entry_point") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "main_module") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "main_class") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Context);
window["Runtime.Context"] = Runtime.Context;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Context;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Entity = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Entity.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Entity.prototype.constructor = Runtime.Entity;
Object.assign(Runtime.Entity.prototype,
{
	/* Functions */
	className: function()
	{
		return (this.name != "") ? ((this.value != "") ? (this.value) : (this.name)) : ("");
	},
	logName: function()
	{
		return this.getClassName() + Runtime.rtl.toStr(" -> ") + Runtime.rtl.toStr(((this.value != "") ? (this.name + Runtime.rtl.toStr(" -> ") + Runtime.rtl.toStr(this.value)) : (this.name)));
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.name = "";
		this.value = "";
		this.params = Runtime.Dict.from({});
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Entity";
	},
});
Object.assign(Runtime.Entity, Runtime.BaseStruct);
Object.assign(Runtime.Entity,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Entity";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("name");
			a.push("value");
			a.push("params");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "params") return Dict.from({
			"t": "Runtime.Dict",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Entity);
window["Runtime.Entity"] = Runtime.Entity;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Entity;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.Driver = function()
{
	Runtime.Entity.apply(this, arguments);
};
Runtime.Driver.prototype = Object.create(Runtime.Entity.prototype);
Runtime.Driver.prototype.constructor = Runtime.Driver;
Object.assign(Runtime.Driver.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.global = false;
		Runtime.Entity.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Driver";
	},
});
Object.assign(Runtime.Driver, Runtime.Entity);
Object.assign(Runtime.Driver,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Driver";
	},
	getParentClassName: function()
	{
		return "Runtime.Entity";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("global");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "global") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Driver);
window["Runtime.Driver"] = Runtime.Driver;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Driver;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.LambdaChain = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.LambdaChain.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.LambdaChain.prototype.constructor = Runtime.LambdaChain;
Object.assign(Runtime.LambdaChain.prototype,
{
	logName: function()
	{
		return this.getClassName() + Runtime.rtl.toStr(" -> ") + Runtime.rtl.toStr(this.name) + Runtime.rtl.toStr(" -> [") + Runtime.rtl.toStr(this.pos) + Runtime.rtl.toStr("] ") + Runtime.rtl.toStr(this.value);
	},
	addClassItem: function(class_name, class_method_name, class_item, info)
	{
		return this.copy(Runtime.Dict.from({"value":class_name + Runtime.rtl.toStr("::") + Runtime.rtl.toStr(class_method_name)}));
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.name = "";
		this.value = "";
		this.chain = "";
		this.pos = 0;
		this.is_async = false;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.LambdaChain";
	},
});
Object.assign(Runtime.LambdaChain, Runtime.BaseStruct);
Object.assign(Runtime.LambdaChain,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.LambdaChain";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("name");
			a.push("value");
			a.push("chain");
			a.push("pos");
			a.push("is_async");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "chain") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "pos") return Dict.from({
			"t": "double",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "is_async") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.LambdaChain);
window["Runtime.LambdaChain"] = Runtime.LambdaChain;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.LambdaChain;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.LambdaChainClass = function()
{
	Runtime.Entity.apply(this, arguments);
};
Runtime.LambdaChainClass.prototype = Object.create(Runtime.Entity.prototype);
Runtime.LambdaChainClass.prototype.constructor = Runtime.LambdaChainClass;
Object.assign(Runtime.LambdaChainClass.prototype,
{
	getClassName: function()
	{
		return "Runtime.LambdaChainClass";
	},
});
Object.assign(Runtime.LambdaChainClass, Runtime.Entity);
Object.assign(Runtime.LambdaChainClass,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.LambdaChainClass";
	},
	getParentClassName: function()
	{
		return "Runtime.Entity";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.LambdaChainClass);
window["Runtime.LambdaChainClass"] = Runtime.LambdaChainClass;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.LambdaChainClass;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.LambdaChainDeclare = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.LambdaChainDeclare.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.LambdaChainDeclare.prototype.constructor = Runtime.LambdaChainDeclare;
Object.assign(Runtime.LambdaChainDeclare.prototype,
{
	logName: function()
	{
		return this.getClassName() + Runtime.rtl.toStr(" -> ") + Runtime.rtl.toStr(this.name);
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.name = "";
		this.is_await = false;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.LambdaChainDeclare";
	},
});
Object.assign(Runtime.LambdaChainDeclare, Runtime.BaseStruct);
Object.assign(Runtime.LambdaChainDeclare,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.LambdaChainDeclare";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("name");
			a.push("is_await");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "is_await") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.LambdaChainDeclare);
window["Runtime.LambdaChainDeclare"] = Runtime.LambdaChainDeclare;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.LambdaChainDeclare;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.RuntimeUtils = function()
{
};
Object.assign(Runtime.RuntimeUtils.prototype,
{
	getClassName: function()
	{
		return "Runtime.RuntimeUtils";
	},
});
Object.assign(Runtime.RuntimeUtils,
{
	_variables_names: null,
	JSON_PRETTY: 1,
	/* ============================= Serialization Functions ============================= */
	ObjectToNative: function(value, force_class_name)
	{
		if (force_class_name == undefined) force_class_name = true;
		var value1 = Runtime.RuntimeUtils.ObjectToPrimitive(value, force_class_name);
		var value2 = Runtime.RuntimeUtils.PrimitiveToNative(value1);
		return value2;
	},
	NativeToObject: function(value)
	{
		var value1 = Runtime.RuntimeUtils.NativeToPrimitive(value);
		var value2 = Runtime.RuntimeUtils.PrimitiveToObject(value1);
		return value2;
	},
	/**
	 * Returns object to primitive value
	 * @param var obj
	 * @return var
	 */
	ObjectToPrimitive: function(obj, force_class_name)
	{
		if (force_class_name == undefined) force_class_name = true;
		if (obj === null)
		{
			return null;
		}
		if (Runtime.rtl.isScalarValue(obj))
		{
			return obj;
		}
		if (obj instanceof Runtime.Collection)
		{
			return obj.map((value) => 
			{
				return this.ObjectToPrimitive(value, force_class_name);
			});
		}
		if (obj instanceof Runtime.Dict)
		{
			obj = obj.map((value, key) => 
			{
				return this.ObjectToPrimitive(value, force_class_name);
			});
			return obj.toDict();
		}
		if (obj instanceof Runtime.Date)
		{
			return obj;
		}
		if (obj instanceof Runtime.DateTime)
		{
			return obj;
		}
		if (obj instanceof Runtime.BaseStruct)
		{
			var values = new Runtime.Map();
			var names = Runtime.rtl.getFields(obj.getClassName());
			for (var i = 0;i < names.count();i++)
			{
				var variable_name = names.item(i);
				var value = obj.get(variable_name, null);
				var value = Runtime.RuntimeUtils.ObjectToPrimitive(value, force_class_name);
				values.setValue(variable_name, value);
			}
			if (force_class_name)
			{
				values.setValue("__class_name__", obj.getClassName());
			}
			return values.toDict();
		}
		return null;
	},
	/**
	 * Returns object to primitive value
	 * @param SerializeContainer container
	 * @return var
	 */
	PrimitiveToObject: function(obj)
	{
		if (obj === null)
		{
			return null;
		}
		if (Runtime.rtl.isScalarValue(obj))
		{
			return obj;
		}
		if (obj instanceof Runtime.Collection)
		{
			var res = new Runtime.Vector();
			for (var i = 0;i < obj.count();i++)
			{
				var value = obj.item(i);
				value = Runtime.RuntimeUtils.PrimitiveToObject(value);
				res.pushValue(value);
			}
			return res.toCollection();
		}
		if (obj instanceof Runtime.Dict)
		{
			var res = new Runtime.Map();
			var keys = obj.keys();
			for (var i = 0;i < keys.count();i++)
			{
				var key = keys.item(i);
				var value = obj.item(key);
				value = Runtime.RuntimeUtils.PrimitiveToObject(value);
				res.setValue(key, value);
			}
			if (!res.has("__class_name__"))
			{
				return res.toDict();
			}
			if (res.item("__class_name__") == "Runtime.Map" || res.item("__class_name__") == "Runtime.Dict")
			{
				res.remove("__class_name__");
				return res.toDict();
			}
			var class_name = res.item("__class_name__");
			if (!Runtime.rtl.class_exists(class_name))
			{
				return null;
			}
			if (!Runtime.rtl.class_implements(class_name, "Runtime.SerializeInterface"))
			{
				return null;
			}
			/* Assign values */
			var obj = new Runtime.Map();
			var names = Runtime.rtl.getFields(class_name);
			for (var i = 0;i < names.count();i++)
			{
				var variable_name = names.item(i);
				if (variable_name != "__class_name__")
				{
					var value = res.get(variable_name, null);
					obj.setValue(variable_name, value);
				}
			}
			/* New instance */
			var instance = Runtime.rtl.newInstance(class_name, Runtime.Collection.from([obj]));
			return instance;
		}
		return null;
	},
	NativeToPrimitive: function(value)
	{
		var _rtl = use("Runtime.rtl");
		var _Utils = use("Runtime.RuntimeUtils");
		var _Collection = use("Runtime.Collection");
		var _Date = use("Runtime.Date");
		var _DateTime = use("Runtime.DateTime");
		var _Dict = use("Runtime.Dict");
		
		if (value === null)
			return null;
		
		if (Array.isArray(value))
		{
			var new_value = _Collection.from(value);
			new_value = new_value.map((val)=>{
				return _Utils.NativeToPrimitive(val);
			});
			return new_value;
		}
		if (typeof value == 'object')
		{
			if (value["__class_name__"] == "Runtime.Date")
			{
				var new_value = _Date.from(value);
				return new_value;
			}
			if (value["__class_name__"] == "Runtime.DateTime")
			{
				var new_value = _DateTime.from(value);
				return new_value;
			}
			var new_value = _Dict.from(value);
			new_value = new_value.map((val, key)=>{
				return _Utils.NativeToPrimitive(val);
			});
			return new_value;
		}
		
		return value;
	},
	PrimitiveToNative: function(value)
	{
		var _rtl = use("Runtime.rtl");
		var _Utils = use("Runtime.RuntimeUtils");
		var _Collection = use("Runtime.Collection");
		var _DateTime = use("Runtime.DateTime");
		var _Date = use("Runtime.Date");
		var _Dict = use("Runtime.Dict");
		
		if (value === null)
			return null;
		
		if (value instanceof _Date)
		{
			value = value.toDict().setIm("__class_name__", "Runtime.Date");
		}
		else if (value instanceof _DateTime)
		{
			value = value.toDict().setIm("__class_name__", "Runtime.DateTime");
		}
		
		if (value instanceof _Collection)
		{
			var arr = [];
			value.each((v)=>{
				arr.push( _Utils.PrimitiveToNative(v) );
			});
			return arr;
		}
		if (value instanceof _Dict)
		{
			var obj = {};
			value.each((v, k)=>{
				obj[k] = _Utils.PrimitiveToNative(v);
			});
			return obj;
		}
		return value;
	},
	/**
	 * Json encode serializable values
	 * @param serializable value
	 * @param SerializeContainer container
	 * @return string 
	 */
	json_encode: function(value, flags, convert)
	{
		if (flags == undefined) flags = 0;
		if (convert == undefined) convert = true;
		if (flags == undefined) flags = 0;
		if (convert == undefined) convert = true;
		
		var _rtl = use("Runtime.rtl");
		var _Utils = use("Runtime.RuntimeUtils");
		var _Collection = use("Runtime.Collection");
		var _Dict = use("Runtime.Dict");
		
		if (convert) value = _Utils.ObjectToPrimitive(value);
		return JSON.stringify(value, (key, value) => {
			if (value instanceof _Collection) return value;
			if (value instanceof _Dict) return value.toObject();
			if (_rtl.isScalarValue(value)) return value;
			return null;
		});
	},
	/**
	 * Json decode to primitive values
	 * @param string s Encoded string
	 * @return var 
	 */
	json_decode: function(obj)
	{
		try{
			
			var _rtl = use("Runtime.rtl");
			var _Utils = use("Runtime.RuntimeUtils");
			var _Collection = use("Runtime.Collection");
			var _Dict = use("Runtime.Dict");
			
			var obj = JSON.parse(obj, function (key, value){
				if (value == null) return value;
				if (Array.isArray(value)){
					return _Collection.from(value);
				}
				if (typeof value == 'object'){
					return _Dict.from(value);
				}
				return value;
			});
			return _Utils.PrimitiveToObject(obj);
		}
		catch(e){
			throw e;
		}
		return null;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.RuntimeUtils";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "_variables_names") return Dict.from({
			"t": "Runtime.Map",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "JSON_PRETTY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.RuntimeUtils);
window["Runtime.RuntimeUtils"] = Runtime.RuntimeUtils;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.RuntimeUtils;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
Runtime.ModuleDescription = function()
{
};
Object.assign(Runtime.ModuleDescription.prototype,
{
	getClassName: function()
	{
		return "Runtime.ModuleDescription";
	},
});
Object.assign(Runtime.ModuleDescription,
{
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleName: function()
	{
		return "Runtime";
	},
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleVersion: function()
	{
		return "0.11.0";
	},
	/**
	 * Returns required modules
	 * @return Map<string>
	 */
	requiredModules: function()
	{
		return null;
	},
	/**
	 * Returns enities
	 */
	entities: function()
	{
		return Runtime.Collection.from([]);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime";
	},
	getCurrentClassName: function()
	{
		return "Runtime.ModuleDescription";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.ModuleDescription);
window["Runtime.ModuleDescription"] = Runtime.ModuleDescription;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.ModuleDescription;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
/* Run web app */
function runWebApp(env, module_name, class_name)
{
	window.addEventListener
	(
		"load",
		(function(obj){ return function() {
			(async () => {
				var ctx = null;
				Runtime.Context.startApp(Runtime.Dict.from(obj.env),obj.module_name,obj.class_name);
			})();
		}})({ "env": env, "module_name": module_name, "class_name": class_name })
	);
}
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
Runtime.Web.Component = function()
{
	Runtime.BaseObject.apply(this, arguments);
};
Runtime.Web.Component.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.Web.Component.prototype.constructor = Runtime.Web.Component;
Object.assign(Runtime.Web.Component.prototype,
{
	/**
	 * Returns model
	 */
	model: function(model_path, def_val)
	{
		if (model_path == undefined) model_path = null;
		if (def_val == undefined) def_val = null;
		return (this.model_path == null) ? (null) : (Runtime.rtl.attr(this.driver.layout, this.model_path.concat((Runtime.rtl.isEmpty(model_path)) ? (null) : ((model_path instanceof Runtime.Collection) ? (model_path) : (Runtime.Collection.from([model_path])))), def_val));
	},
	/**
	 * Call model function
	 */
	call: function(method_name)
	{
		if (method_name == undefined) method_name = "";
		var args = new Runtime.Vector();
		for (var i=((typeof ctx == "undefined") ? 1 : 2); i<arguments.length; i++) args.pushValue(arguments[i]);
		/* Result */
		var res = null;
		/* Get current model */
		var model = this.model();
		/* Change model by function */
		if (Runtime.rtl.method_exists(model, method_name))
		{
			var f = Runtime.rtl.method(model, method_name);
			res = Runtime.rtl.apply(f, args);
		}
		/* Static function */
		if (Runtime.rtl.method_exists(model.getClassName(), method_name))
		{
			args.unshiftValue(model);
			var f = Runtime.rtl.method(model.getClassName(), method_name);
			res = Runtime.rtl.apply(f, args);
		}
		return res;
	},
	/**
	 * Update model
	 */
	update: function(method_name)
	{
		if (method_name == undefined) method_name = "";
		this.updateModel.apply(this, arguments);
	},
	/**
	 * Update model
	 */
	updateModel: function(method_name)
	{
		if (method_name == undefined) method_name = "";
		var args = new Runtime.Vector();
		for (var i=((typeof ctx == "undefined") ? 1 : 2); i<arguments.length; i++) args.pushValue(arguments[i]);
		/* Get current model */
		var model = this.model();
		/* Change model by function */
		if (Runtime.rtl.method_exists(model, method_name))
		{
			var f = Runtime.rtl.method(model, method_name);
			model = Runtime.rtl.apply(f, args);
		}
		/* Static function */
		if (Runtime.rtl.method_exists(model.getClassName(), method_name))
		{
			args.unshiftValue(model);
			var f = Runtime.rtl.method(model.getClassName(), method_name);
			model = Runtime.rtl.apply(f, args);
		}
		/* Set new model */
		this.driver.updateModel(this.model_path, model);
	},
	/**
	 * Set new model
	 */
	setModel: function(model)
	{
		this.driver.updateModel(this.model_path, model);
	},
	/**
	 * On create
	 */
	onCreate: function()
	{
	},
	/**
	 * On update
	 */
	onUpdate: function()
	{
	},
	/**
	 * Open url
	 */
	openUrl: function(url)
	{
		var app = Runtime.rtl.getContext().getDriver("WebApp");
		app.openUrl(url);
	},
	/**
	 * Add event listener
	 */
	addEventListener: function(event_class_name, f)
	{
		this.events.setValue(event_class_name, f);
	},
	/**
	 * Send event
	 */
	signal: async function(event)
	{
		var event_class_name = event.getClassName();
		if (this.events.has(event_class_name))
		{
			var f = Runtime.rtl.get(this.events, event_class_name);
			var msg = new Runtime.Web.Message(event);
			msg.sender = this;
			await f(msg);
		}
	},
	/**
	 * Watch model
	 */
	watchModel: function(path_id, watch)
	{
		var __v0 = new Runtime.Monad(watch);
		__v0 = __v0.attr(0);
		__v0 = __v0.monad(Runtime.rtl.m_to("string", Runtime.Collection.from([])));
		var class_name = __v0.value();
		var watch = Runtime.rtl.get(watch, 1);
		if (!(watch instanceof Runtime.Collection))
		{
			watch = Runtime.Collection.from([watch]);
		}
		this.new_watch_model = new Runtime.Map();
		for (var i = 0;i < watch.count();i++)
		{
			var item = Runtime.rtl.get(watch, i);
			var model_path = this.controller.findModelPath(path_id, Runtime.Collection.from([class_name,item]));
			var key = Runtime.rs.join(".", model_path);
			this.new_watch_model.setValue(key, this.driver.model(model_path));
		}
		this.new_watch_model = this.new_watch_model.toDict();
	},
	/**
	 * Returns true if need to repaint component
	 */
	isRepaint: function()
	{
		if (this.is_new_element)
		{
			return true;
		}
		/* Check component model */
		if (this.new_model != this.old_model)
		{
			return true;
		}
		/* Check component params */
		if (!this.equalParams())
		{
			return true;
		}
		/* Check watch model */
		if (this.old_watch_model != null)
		{
			var keys = this.old_watch_model.keys();
			for (var i = 0;i < keys.count();i++)
			{
				var key = Runtime.rtl.get(keys, i);
				var model_path = Runtime.rs.split("\\.", key);
				var old_model = Runtime.rtl.get(this.old_watch_model, key);
				var new_model = this.driver.model(model_path);
				if (new_model != old_model)
				{
					return true;
				}
			}
		}
		return false;
	},
	/**
	 * Equal old and new params
	 */
	equalParams: function()
	{
		var arr = (new Runtime.Collection()).concat(this.old_params.keys()).concat(this.params.keys()).removeDuplicatesIm();
		for (var i = 0;i < arr.count();i++)
		{
			var field_name = Runtime.rtl.get(arr, i);
			if (!this.old_params.has(field_name))
			{
				return false;
			}
			if (!this.params.has(field_name))
			{
				return false;
			}
			if (this.params.get(field_name) != this.old_params.get(field_name))
			{
				return false;
			}
		}
		return true;
	},
	/**
	 * Repaint component
	 */
	repaint: function(element)
	{
		var new_model = this.constructor.extendComponentModel(this.driver.layout, this.new_model, this.params);
		if (new_model != this.new_model)
		{
			this.new_model = new_model;
			this.setModel(new_model);
		}
		if (this.isRepaint())
		{
			var begin = element.childs.count();
			var f = this.constructor.render(this.driver.layout, new_model, this.params, element.content);
			if (f != null)
			{
				f(element);
			}
			var end = element.childs.count();
			this.child_nodes = element.childs.slice(begin, end - begin).toCollection();
		}
		else
		{
			element.childs.appendVector(this.child_nodes);
		}
	},
	_init: function()
	{
		this.driver = null;
		this.controller = null;
		this.old_params = null;
		this.params = null;
		this.old_watch_model = null;
		this.new_watch_model = null;
		this.old_model = null;
		this.new_model = null;
		this.child_nodes = null;
		this.model_path = null;
		this.path_id = null;
		this.events = new Runtime.Map();
		this.is_new_element = false;
		Runtime.BaseObject.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Component";
	},
});
Object.assign(Runtime.Web.Component, Runtime.BaseObject);
Object.assign(Runtime.Web.Component,
{
	/**
	 * Extend component model
	 */
	extendComponentModel: function(layout, model, params)
	{
		return model;
	},
	/**
	 * Render function
	 */
	render: function(layout, model, params, content)
	{
		return null;
	},
	/**
	 * Render function
	 */
	renderComponent: function(layout, model, params, content)
	{
		model = this.extendComponentModel(layout, model, params);
		return this.render(layout, model, params, content);
	},
	/**
	 * Returns css name
	 */
	getCssHash: function()
	{
		var class_name = this.getCurrentClassName();
		var names = Runtime.Web.RenderDriver.getCssHash(class_name);
		return Runtime.rs.join(" ", names);
	},
	/**
	 * Merge attrs
	 */
	mergeAttrs: function(res, attr2)
	{
		if (!Runtime.rtl.exists(attr2))
		{
			return res;
		}
		return Object.assign(res, attr2.toObject());
		return res;
	},
	/**
	 * Join attrs to string
	 */
	joinAttrs: function(attrs)
	{
		return (Runtime.rtl.exists(attrs)) ? (Runtime.rs.join(" ", attrs.map((k, v) => 
		{
			return k + Runtime.rtl.toStr("= '") + Runtime.rtl.toStr(this.escapeAttr(v)) + Runtime.rtl.toStr("'");
		}))) : ("");
	},
	/**
	 * Escape attr
	 */
	escapeAttr: function(s)
	{
		if (s instanceof Runtime.Dict)
		{
			s = s.reduce((s, val, key) => 
			{
				return s + Runtime.rtl.toStr(key) + Runtime.rtl.toStr(":") + Runtime.rtl.toStr(val) + Runtime.rtl.toStr(";");
			}, "");
		}
		return Runtime.rs.escapeHtml(s);
	},
	/**
	 * Escape html
	 */
	escapeHtml: function(s)
	{
		if (Runtime.rtl.isString(s))
		{
			return Runtime.rs.escapeHtml(s);
		}
		if (s instanceof Runtime.Collection)
		{
			return Runtime.rs.join("", s);
		}
		return Runtime.rs.escapeHtml(Runtime.rtl.toString(s));
	},
	/**
	 * Json encode
	 */
	json_encode: function(obj)
	{
		return Runtime.rtl.json_encode(obj);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Component";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("driver");
			a.push("controller");
			a.push("old_params");
			a.push("params");
			a.push("old_watch_model");
			a.push("new_watch_model");
			a.push("old_model");
			a.push("new_model");
			a.push("child_nodes");
			a.push("model_path");
			a.push("path_id");
			a.push("events");
			a.push("is_new_element");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "driver") return Dict.from({
			"t": "Runtime.Web.RenderDriver",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "controller") return Dict.from({
			"t": "Runtime.Web.Controller",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "old_params") return Dict.from({
			"t": "Runtime.Map",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "params") return Dict.from({
			"t": "Runtime.Map",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "old_watch_model") return Dict.from({
			"t": "Runtime.Dict",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_watch_model") return Dict.from({
			"t": "Runtime.Dict",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "old_model") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_model") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "child_nodes") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "model_path") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "path_id") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "events") return Dict.from({
			"t": "Runtime.Map",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "is_new_element") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Component);
window["Runtime.Web.Component"] = Runtime.Web.Component;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Component;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
Runtime.Web.Controller = function()
{
	Runtime.BaseObject.apply(this, arguments);
};
Runtime.Web.Controller.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.Web.Controller.prototype.constructor = Runtime.Web.Controller;
Object.assign(Runtime.Web.Controller.prototype,
{
	/**
	 * Find element
	 */
	findElementPos: function(parent_elem, path_id, kind, elem_name)
	{
		if (elem_name == undefined) elem_name = "";
		var path_id_str = Runtime.rs.join(".", path_id);
		for (var i = 0;i < parent_elem.childNodes.length;i++)
		{
			var e = Runtime.rtl.get(parent_elem.childNodes, i);
			if (e._path_id_str == path_id_str && kind == "element" && e.tagName == Runtime.rs.strtoupper(elem_name))
			{
				return i;
			}
			if (e._path_id_str == path_id_str && kind == "text" && e instanceof window.Text)
			{
				return i;
			}
		}
		return -1;
	},
	/**
	 * Find element
	 */
	findElement: function(parent_elem, path_id, kind, elem_name)
	{
		var pos = this.findElementPos(parent_elem, path_id, kind, elem_name);
		return (pos != -1) ? (Runtime.rtl.get(parent_elem.childNodes, pos)) : (null);
	},
	/**
	 * Add component
	 */
	addComponent: function(c)
	{
		var path_id_str = Runtime.rs.join(".", c.path_id);
		this.components.setValue(path_id_str, c);
	},
	/**
	 * Returns component by path id
	 */
	getComponent: function(path_id)
	{
		var path_id_str = Runtime.rs.join(".", path_id);
		var c = Runtime.rtl.get(this.components, path_id_str);
		return null;
	},
	/**
	 * Find component
	 */
	findComponent: function(path_id, component_name)
	{
		var path_id_str = Runtime.rs.join(".", path_id);
		var c = Runtime.rtl.get(this.components, path_id_str);
		if (Runtime.rtl.is_instanceof(c, component_name))
		{
			return c;
		}
		return null;
	},
	/**
	 * Find parent component
	 */
	findParentComponent: function(path_id, component_name)
	{
		while (path_id.count() != 0)
		{
			var path_id_str = Runtime.rs.join(".", path_id);
			var c = Runtime.rtl.get(this.components, path_id_str);
			if (Runtime.rtl.is_instanceof(c, component_name))
			{
				return c;
			}
			path_id = path_id.removeLastIm();
		}
		var c = Runtime.rtl.get(this.components, "");
		if (Runtime.rtl.is_instanceof(c, component_name))
		{
			return c;
		}
		return null;
	},
	/**
	 * Find model path
	 */
	findModelPath: function(path_id, arr)
	{
		/* Model path */
		var model_path = Runtime.Collection.from([]);
		var path = Runtime.rtl.get(arr, 1);
		/* Find component */
		var c = this.findParentComponent(path_id, Runtime.rtl.get(arr, 0));
		if (c != null && c.model_path != null)
		{
			model_path = c.model_path;
		}
		if (Runtime.rtl.isString(path))
		{
			model_path = model_path.pushIm(path);
		}
		else if (path instanceof Runtime.Collection)
		{
			model_path = model_path.concat(path);
		}
		return model_path;
	},
	/**
	 * Start listen global event
	 */
	registerGlobalEvent: function(event_class_name, component, method_name)
	{
		if (method_name == undefined) method_name = "";
		var body = Runtime.rtl.get(document.getElementsByTagName("body"), 0);
		var __v0 = new Runtime.Monad(Runtime.rtl.applyMethod(event_class_name, "getES6EventName"));
		__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
		var es6_event_name = __v0.value();
		body.addEventListener(es6_event_name, this.constructor.event(component, method_name));
	},
	/**
	 * Render
	 */
	render: function()
	{
		this.remove_keys = new Runtime.Vector();
		/* Create element */
		var element = new Runtime.Web.Element();
		element.controller = this;
		element.component = this.driver;
		element.driver = this.driver;
		element.parent_elem = this.parent_elem;
		element.path_id = Runtime.Collection.from([]);
		/* Render component */
		var component = element.e("component", this.class_name).a(this.params.concat(Runtime.Dict.from({"@bind":Runtime.Collection.from(["Runtime.Web.RenderDriver",this.model_path])}))).c(this.content).r();
		/* Patch childs */
		element.p();
	},
	/**
	 * Patch DOM with new childs
	 */
	patchElemChilds: function(parent_elem, new_childs)
	{
		if (new_childs == null) new_childs = [];
		
		var findElementPos = function (elem, e)
		{
			var childs = elem.childNodes;
			for (var i = 0; i < elem.childNodes.length; i++)
			{
				if (childs[i] == e)
				{
					return i;
				}
			}
			return -1;
		}
		
		var insertFirst = function (elem, e)
		{
			if (elem.childNodes.length == 0)
			{
				elem.appendChild(e);
			}
			else
			{
				elem.insertBefore(e, elem.firstChild);
			}
		}
		
		var insertAfter = function (elem, prev, e)
		{
			if (prev == null)
			{
				insertFirst(elem, e);
				return;
			}
			var next = prev.nextSibling;
			if (next == null)
			{
				elem.appendChild(e);
			}
			else
			{
				elem.insertBefore(e, next);
			}
		}
		
		
		/* Remove elems */
		var i = parent_elem.childNodes.length - 1;
		while (i >= 0)
		{
			var e = parent_elem.childNodes[i];
			if (new_childs.indexOf(e) == -1)
			{
				parent_elem.removeChild(e);
				if (e._path_id != undefined)
				{
					this.remove_keys.pushValue(null, e._path_id);
				}
				/* console.log('Remove child ', i); */
			}
			i--;
		}
		
		
		var prevElem = null;
		for (var i=0; i<new_childs.length; i++)
		{
			var new_e = new_childs[i];
			if (typeof new_e == "string")
			{
				new_e = document.createTextNode(new_e);
			}
			
			var pos = findElementPos(parent_elem, new_e);
			var flag = false;
			
			/* If new element */
			if (pos == -1)
			{
				if (prevElem == null)
				{
					insertFirst(parent_elem, new_e);
					flag = true;
					/* console.log('Insert first ', i); */
				}
				else
				{
					insertAfter(parent_elem, prevElem, new_e);
					flag = true;
					/* console.log('Insert after[1] ', i); */
				}
			}
			
			/* If existing element */
			else
			{
				if (pos - 1 < 0)
				{
					if (i != 0)
					{
						insertAfter(parent_elem, prevElem, new_e);
						flag = true;
						/* console.log('Insert after[2] ', i); */
					}
				}
				else
				{
					var prevSibling = parent_elem.childNodes[pos - 1];
					if (prevElem != prevSibling)
					{
						insertAfter(parent_elem, prevElem, new_e);
						flag = true;
						/* console.log('Insert after[3] ', i); */
					}
				}
			}
			/*
			if (flag)
			{
				var index = this.remove_keys.indexOf(null, new_e._path_id);
				if (index != -1)
					this.remove_keys.remove(null, index, 1);
			}
			*/
			prevElem = new_e;
		}
	},
	_init: function()
	{
		this.driver = null;
		this.class_name = "";
		this.model_path = null;
		this.params = null;
		this.content = null;
		this.parent_elem = null;
		this.controller_name = "";
		this.remove_keys = null;
		this.components = new Runtime.Map();
		this.listen_events = new Runtime.Map();
		Runtime.BaseObject.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Controller";
	},
});
Object.assign(Runtime.Web.Controller, Runtime.BaseObject);
Object.assign(Runtime.Web.Controller,
{
	/**
	 * Returns true if is elem
	 */
	isElem: function(o)
	{
		if (o instanceof window.HTMLElement || o instanceof window.Node)
		{
			return true;
		}
		return false;
	},
	/**
	 * Create raw html
	 */
	rawHtml: function(content)
	{
		var res = new Runtime.Vector();
		var e = document.createElement("div");
		e.innerHTML = Runtime.rs.trim(content);
		for (var i = 0;i < e.childNodes.length;i++)
		{
			res.pushValue(Runtime.rtl.get(e.childNodes, i));
		}
		return res.toCollection();
	},
	/**
	 * JS Event
	 */
	event: function(component, method_name)
	{
		return async (e) => 
		{
			var msg = null;
			Runtime.rtl.setContext(Runtime.rtl.getContext());
			if (e instanceof Runtime.Web.Message)
			{
				msg = e;
			}
			else
			{
				msg = new Runtime.Web.Message(Runtime.Web.Events.WebEvent.fromEvent(e));
				msg.sender = e.currentTarget;
			}
			var f = Runtime.rtl.method(component, method_name);
			try
			{
				await f(msg);
			}
			catch (_ex)
			{
				if (true)
				{
					var e = _ex;
					
					console.log(e.stack);
				}
				else
				{
					throw _ex;
				}
			}
		};
	},
	/**
	 * Component model change
	 */
	eventChangeComponent: function(component, model_path)
	{
		return async (msg) => 
		{
			Runtime.rtl.setContext(Runtime.rtl.getContext());
			component.update("setAttr", model_path, msg.data.value);
		};
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Controller";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("driver");
			a.push("class_name");
			a.push("model_path");
			a.push("params");
			a.push("content");
			a.push("parent_elem");
			a.push("controller_name");
			a.push("remove_keys");
			a.push("components");
			a.push("listen_events");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "driver") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "class_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "model_path") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "params") return Dict.from({
			"t": "Runtime.Dict",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "content") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "parent_elem") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "controller_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "remove_keys") return Dict.from({
			"t": "Runtime.Vector",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "components") return Dict.from({
			"t": "Runtime.Map",
			"s": ["Runtime.Web.Component"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "listen_events") return Dict.from({
			"t": "Runtime.Map",
			"s": ["bool"],
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Controller);
window["Runtime.Web.Controller"] = Runtime.Web.Controller;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Controller;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
Runtime.Web.Element = function()
{
	Runtime.BaseObject.apply(this, arguments);
};
Runtime.Web.Element.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.Web.Element.prototype.constructor = Runtime.Web.Element;
Object.assign(Runtime.Web.Element.prototype,
{
	/**
	 * Create copy
	 */
	copy: function()
	{
		var e = new Runtime.Web.Element();
		e.component = this.component;
		e.controller = this.controller;
		e.driver = this.driver;
		e.path_id = this.path_id;
		e.parent_elem = this.parent_elem;
		return e;
	},
	/**
	 * Create new element
	 */
	e: function(kind, elem_name)
	{
		/* Create new element */
		var e = this.copy();
		e.parent = this;
		e.kind = kind;
		e.elem_name = elem_name;
		/* Push element */
		this.childs.pushValue(e);
		/* Return */
		return e;
	},
	/**
	 * Set attribute
	 */
	a: function(obj)
	{
		this.attrs = this.attrs.concat(obj);
		return this;
	},
	/**
	 * Set content function
	 */
	c: function(content)
	{
		if (Runtime.rtl.exists(content))
		{
			this.content = content;
		}
		return this;
	},
	/**
	 * Render element
	 */
	r: function()
	{
		/* Node elem */
		var node = null;
		/* Build path id */
		this.path_id = this.constructor.buildPath(this.parent.path_id, this.attrs, this.parent.childs.count() - 1);
		if (this.kind == "element")
		{
			if (this.elem_name != "")
			{
				node = this.controller.findElement(this.parent_elem, this.path_id, "element", this.elem_name);
				if (node == null)
				{
					if (this.elem_name == "svg")
					{
						node = document.createElementNS("http://www.w3.org/2000/svg", "svg");
					}
					else
					{
						node = document.createElement(this.elem_name);
					}
					this.is_new_element = true;
				}
				/* Set node params */
				node.params = new Runtime.Map();
				node._path_id = this.path_id;
				node._path_id_str = Runtime.rs.join(".", this.path_id);
				/* Set parent element */
				this.parent_elem = node;
				/* Svg */
				if (this.elem_name == "svg")
				{
					var e = document.createElement("div");
					e.innerHTML = "<svg>" + Runtime.rtl.toStr(this.content) + Runtime.rtl.toStr("</svg>");
					var item = Runtime.rtl.get(e.childNodes, 0);
					while (item.childNodes.length > 0)
					{
						var e = Runtime.rtl.get(item.childNodes, 0);
						node.appendChild(e);
					}
				}
				/* Set parent component */
				node.component = this.component;
			}
		}
		else if (this.kind == "component")
		{
			node = this.controller.findComponent(this.path_id, this.elem_name);
			if (node == null)
			{
				node = Runtime.rtl.newInstance(this.elem_name);
				if (node != null)
				{
					node.driver = this.driver;
					node.controller = this.controller;
					node.is_new_element = true;
					this.is_new_element = true;
				}
				else
				{
					console.log("Component " + Runtime.rtl.toStr(this.elem_name) + Runtime.rtl.toStr(" not found"));
				}
			}
			else
			{
				node.is_new_element = false;
			}
			/* Model path */
			var model_path = Runtime.Collection.from([]);
			/* Find model */
			var attr_keys = Runtime.Collection.from(["@bind","@name","@model"]);
			if (this.attrs != null)
			{
				for (var attr_keys_i = 0;attr_keys_i < attr_keys.count();attr_keys_i++)
				{
					var key = Runtime.rtl.get(attr_keys, attr_keys_i);
					if (this.attrs.has(key))
					{
						model_path = this.controller.findModelPath(this.path_id, Runtime.rtl.get(this.attrs, key));
						break;
					}
				}
			}
			if (node != null)
			{
				/* Set parent component */
				node.component = this.component;
				/* Set component */
				this.component = node;
				this.component.path_id = this.path_id;
				/* Set attrs */
				this.component.old_params = this.component.params;
				this.component.params = new Runtime.Map();
				/* Set model */
				this.component.old_model = this.component.new_model;
				this.component.new_model = this.driver.model(model_path);
				this.component.model_path = model_path;
				this.component.old_watch_model = this.component.new_watch_model;
				/* Add component */
				this.controller.addComponent(this.component);
			}
		}
		else if (Runtime.rtl.isFn(this.content))
		{
			var f = this.content;
			f(this);
		}
		else if (this.content instanceof Runtime.Collection)
		{
			for (var i = 0;i < this.content.count();i++)
			{
				var f = Runtime.rtl.get(this.content, i);
				if (Runtime.rtl.isFn(f))
				{
					f(this);
				}
			}
		}
		else if (this.kind == "text")
		{
			node = this.controller.findElement(this.parent_elem, this.path_id, "text");
			if (node == null)
			{
				node = document.createTextNode((Runtime.rtl.exists(this.content)) ? (this.content) : (""));
				node._path_id = this.path_id;
				node._path_id_str = Runtime.rs.join(".", this.path_id);
			}
			else
			{
				if (node.nodeValue != this.content)
				{
					node.nodeValue = this.content;
				}
			}
		}
		else if (this.kind == "raw")
		{
			node = this.controller.constructor.rawHtml(this.content);
		}
		/* Set node */
		this.node = node;
		/* Set attributes */
		if (this.node != null)
		{
			var keys = this.attrs.keys();
			for (var i = 0;i < keys.count();i++)
			{
				var key = Runtime.rtl.get(keys, i);
				var value = Runtime.rtl.get(this.attrs, key);
				/* Check if event */
				var is_event = false;
				var event_class_name = "";
				if (Runtime.rs.substr(key, 0, 7) == "@event:")
				{
					is_event = true;
					event_class_name = Runtime.rs.substr(key, 7);
				}
				if (Runtime.rs.substr(0, 12) == "@eventAsync:")
				{
					is_event = true;
					event_class_name = Runtime.rs.substr(key, 12);
				}
				if (is_event)
				{
					var __v0 = new Runtime.Monad(Runtime.rtl.get(value, 0));
					__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
					var component_name = __v0.value();
					var __v1 = new Runtime.Monad(Runtime.rtl.get(value, 1));
					__v1 = __v1.monad(Runtime.rtl.m_to("string", ""));
					var method_name = __v1.value();
					var component = this.controller.findParentComponent(this.path_id, component_name);
					if (component)
					{
						if (this.kind == "element")
						{
							var __v2 = new Runtime.Monad(Runtime.rtl.applyMethod(event_class_name, "getES6EventName"));
							__v2 = __v2.monad(Runtime.rtl.m_to("string", ""));
							var es6_event_name = __v2.value();
							if (es6_event_name != "" && this.is_new_element)
							{
								this.node.addEventListener(es6_event_name, this.controller.constructor.event(component, method_name));
							}
						}
						else if (this.kind == "component")
						{
							this.component.addEventListener(event_class_name, this.controller.constructor.event(component, method_name));
						}
					}
					continue;
				}
				if (key == "@bind" || key == "@name")
				{
					var __v0 = new Runtime.Monad(Runtime.rtl.get(value, 0));
					__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
					var component_name = __v0.value();
					var value_name = Runtime.rtl.get(value, 1);
					var component = this.controller.findParentComponent(this.path_id, component_name);
					if (this.kind == "component")
					{
						this.component.addEventListener("Runtime.Web.Events.ChangeEvent", this.controller.constructor.eventChangeComponent(component, value_name));
					}
				}
				if (key == "@ref" || key == "@name")
				{
					var __v0 = new Runtime.Monad(Runtime.rtl.get(value, 0));
					__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
					var component_name = __v0.value();
					var __v1 = new Runtime.Monad(Runtime.rtl.get(value, 1));
					__v1 = __v1.monad(Runtime.rtl.m_to("string", ""));
					var value_name = __v1.value();
					var component = this.controller.findParentComponent(this.path_id, component_name);
					if (component)
					{
						component[value_name] = node;
					}
				}
				if (key == "value" || key == "@bind" || key == "@name")
				{
					if (this.node.tagName == "INPUT" || this.node.tagName == "SELECT" || this.node.tagName == "TEXTAREA")
					{
						if (value == null && this.node.value != "" && value !== 0 && value !== "0")
						{
							this.node.value = "";
						}
						else if (this.node.value != value)
						{
							this.node.value = value;
						}
						this.node._old_value = value;
						continue;
					}
				}
				if (this.kind == "component" && key == "@watch")
				{
					node.watchModel(this.path_id, value);
					continue;
				}
				if (Runtime.rtl.get(key, 0) == "@")
				{
					continue;
				}
				if (key == "style" && value instanceof Runtime.Dict)
				{
					value = Runtime.rs.join(";", value.transition((v, k) => 
					{
						return k + Runtime.rtl.toStr(": ") + Runtime.rtl.toStr(v);
					}));
				}
				if (this.kind == "element")
				{
					if (this.node.getAttribute(key) != value)
					{
						this.node.setAttribute(key, value);
					}
					node.params.setValue(key, value);
				}
				else if (this.kind == "component")
				{
					node.params.setValue(key, value);
				}
			}
		}
		/* Remove old attributes */
		if (this.node != null && this.kind == "element")
		{
			var attr_keys = this.attrs.keys();
			for (var i = this.node.attributes.length - 1;i >= 0;i--)
			{
				var attr = Runtime.rtl.get(this.node.attributes, i);
				var pos = attr_keys.find((name) => 
				{
					return Runtime.rs.strtolower(name) == Runtime.rs.strtolower(attr.name);
				});
				if (pos == -1)
				{
					this.node.removeAttribute(attr.name);
				}
			}
		}
		/* Render */
		if (this.kind == "component" && this.node != null)
		{
			this.component.repaint(this);
			/* On create */
			if (this.is_new_element)
			{
				this.node.onCreate();
			}
			/* On update */
			this.node.onUpdate();
		}
		return this;
	},
	/**
	 * Return child nodes
	 */
	getChildNodes: function()
	{
		var childs = new Runtime.Vector();
		for (var i = 0;i < this.childs.count();i++)
		{
			var e = Runtime.rtl.get(this.childs, i);
			if (e.node instanceof Runtime.Web.Component || e.node == null)
			{
				var nodes = e.getChildNodes();
				childs.appendVector(nodes);
			}
			else if (e.node instanceof Runtime.Collection)
			{
				childs.appendVector(e.node);
			}
			else
			{
				childs.pushValue(e.node);
			}
		}
		return childs.toCollection();
	},
	/**
	 * Patch element childs
	 */
	p: function()
	{
		var new_childs = this.getChildNodes();
		this.controller.patchElemChilds(this.parent_elem, new_childs);
		return this;
	},
	_init: function()
	{
		this.component = null;
		this.controller = null;
		this.driver = null;
		this.kind = "";
		this.path_id = null;
		this.parent = null;
		this.parent_elem = null;
		this.childs = new Runtime.Vector();
		this.attrs = new Runtime.Map();
		this.content = null;
		this.is_new_element = false;
		this.node = null;
		this.elem_name = "";
		Runtime.BaseObject.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Element";
	},
});
Object.assign(Runtime.Web.Element, Runtime.BaseObject);
Object.assign(Runtime.Web.Element,
{
	/**
	 * Build path id
	 */
	buildPath: function(path_id, attrs, pos)
	{
		var __v0 = new Runtime.Monad(Runtime.rtl.get(attrs, "@key"));
		__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
		var key = __v0.value();
		var __v1 = new Runtime.Monad(Runtime.rtl.get(attrs, "@elem_name"));
		__v1 = __v1.monad(Runtime.rtl.m_to("string", ""));
		var elem_name = __v1.value();
		if (Runtime.rtl.isEmpty(key))
		{
			key = (elem_name != "") ? (elem_name + Runtime.rtl.toStr("-") + Runtime.rtl.toStr(pos)) : (pos);
		}
		return path_id.pushIm(key);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Element";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("component");
			a.push("controller");
			a.push("driver");
			a.push("kind");
			a.push("path_id");
			a.push("parent");
			a.push("parent_elem");
			a.push("childs");
			a.push("attrs");
			a.push("content");
			a.push("is_new_element");
			a.push("node");
			a.push("elem_name");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "component") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "controller") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "driver") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "kind") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "path_id") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "parent") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "parent_elem") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "childs") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "attrs") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "content") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "is_new_element") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "node") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "elem_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Element);
window["Runtime.Web.Element"] = Runtime.Web.Element;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Element;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
Runtime.Web.Message = function(data)
{
	Runtime.BaseObject.call(this);
	this.data = data;
};
Runtime.Web.Message.prototype = Object.create(Runtime.BaseObject.prototype);
Runtime.Web.Message.prototype.constructor = Runtime.Web.Message;
Object.assign(Runtime.Web.Message.prototype,
{
	/**
	 * Cancel Message
	 */
	cancel: function()
	{
		this.is_cancel = true;
		if (this.data instanceof Runtime.Web.Events.BaseEvent)
		{
			this.data = this.data.constructor.cancel(this.data);
		}
	},
	_init: function()
	{
		this.data = null;
		this.is_cancel = false;
		this.sender = null;
		Runtime.BaseObject.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Message";
	},
});
Object.assign(Runtime.Web.Message, Runtime.BaseObject);
Object.assign(Runtime.Web.Message,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Message";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseObject";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("data");
			a.push("is_cancel");
			a.push("sender");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "data") return Dict.from({
			"t": "Runtime.Web.Events.BaseEvent",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "is_cancel") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "sender") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Message);
window["Runtime.Web.Message"] = Runtime.Web.Message;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Message;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
Runtime.Web.RenderDriver = function(object_name, entity)
{
	if (object_name == undefined) object_name = "";
	if (entity == undefined) entity = null;
	Runtime.BaseDriver.call(this, object_name, entity);
};
Runtime.Web.RenderDriver.prototype = Object.create(Runtime.BaseDriver.prototype);
Runtime.Web.RenderDriver.prototype.constructor = Runtime.Web.RenderDriver;
Object.assign(Runtime.Web.RenderDriver.prototype,
{
	/**
	 * Start Driver
	 */
	startDriver: async function()
	{
		await Runtime.BaseDriver.prototype.startDriver.bind(this)();
		/* Chain components */
		this.default_components = this.callChainComponents();
		/* Build css vars */
		this.css_vars = this.callChainCssVars();
	},
	/**
	 * Add component
	 */
	addComponent: function(component_name)
	{
		this.components = this.components.pushIm(component_name);
		return this;
	},
	/**
	 * Add components
	 */
	addComponents: function(components)
	{
		this.components = this.components.concat(components);
		return this;
	},
	/**
	 * Setup components
	 */
	setComponents: function(components)
	{
		this.components = components;
		return this;
	},
	/**
	 * Setup
	 */
	setLayout: function(layout)
	{
		this.layout = layout;
		return this;
	},
	/**
	 * Returns model
	 */
	model: function(model_path, def_val)
	{
		if (model_path == undefined) model_path = null;
		if (def_val == undefined) def_val = null;
		return Runtime.rtl.attr(this.layout, model_path, def_val);
	},
	/**
	 * Update model
	 */
	updateModel: function(model_path, value)
	{
		if (model_path == undefined) model_path = null;
		if (value == undefined) value = null;
		this.layout = Runtime.rtl.setAttr(this.layout, model_path, value);
		this.repaint();
	},
	/**
	 * Find controller
	 */
	findControllerByElem: function(e)
	{
		for (var i = 0;i < this.controllers.count();i++)
		{
			var c = Runtime.rtl.get(this.controllers, i);
			if (c.parent_elem == e)
			{
				return c;
			}
		}
		return null;
	},
	/**
	 * Find controller
	 */
	findControllerByName: function(controller_name)
	{
		for (var i = 0;i < this.controllers.count();i++)
		{
			var c = Runtime.rtl.get(this.controllers, i);
			if (c.controller_name == controller_name)
			{
				return c;
			}
		}
		return null;
	},
	/**
	 * Setup controller
	 */
	addController: function(controller_name, e, class_name, model_path, params, content)
	{
		if (class_name == undefined) class_name = "";
		if (model_path == undefined) model_path = null;
		if (params == undefined) params = null;
		if (content == undefined) content = null;
		if (model_path == null)
		{
			model_path = Runtime.Collection.from([]);
		}
		if (params == null)
		{
			params = Runtime.Dict.from({});
		}
		var controller = this.findControllerByElem(e);
		if (controller == null)
		{
			controller = new Runtime.Web.Controller();
			controller.driver = this;
			controller.parent_elem = e;
			controller.addComponent(this);
			this.controllers.pushValue(controller);
		}
		controller.class_name = class_name;
		controller.model_path = model_path;
		controller.params = params;
		controller.content = content;
		controller.controller_name = controller_name;
		return controller;
	},
	/**
	 * Setup controller
	 */
	setupController: function(controller_name, e, class_name, model_path, params, content)
	{
		if (class_name == undefined) class_name = "";
		if (model_path == undefined) model_path = null;
		if (params == undefined) params = null;
		if (content == undefined) content = null;
		if (model_path == null)
		{
			model_path = Runtime.Collection.from([]);
		}
		if (params == null)
		{
			params = Runtime.Dict.from({});
		}
		this.addController(controller_name, e, class_name, model_path, params, content);
		return this;
	},
	/**
	 * Setup css
	 */
	setupCSS: function(e)
	{
		this.css_elem = e;
		return this;
	},
	/**
	 * Get css
	 */
	getCSS: function(components)
	{
		if (components == undefined) components = null;
		if (components == null)
		{
			components = this.default_components.concat(this.components);
		}
		/* Get css from components */
		var css = this.constructor.getCSSFromComponents(components, this.css_vars);
		/* Chain css */
		css = this.callChainCss(css);
		return css;
	},
	/**
	 * Repaint
	 */
	repaint: function()
	{
		if (this.animation_id == null)
		{
			this.animation_id = window.requestAnimationFrame(this.render.bind(this));
			/* this.animation_id = window.@setTimeout( method this.render, 1 ); */
		}
		return this;
	},
	/**
	 * Render function
	 */
	render: function()
	{
		Runtime.rtl.setContext(Runtime.rtl.getContext());
		/* Render controllers */
		for (var i = 0;i < this.controllers.count();i++)
		{
			var controller = Runtime.rtl.get(this.controllers, i);
			controller.render();
		}
		/* Render css */
		if (this.css_elem != null)
		{
			this.new_css = this.getCSS();
			if (this.new_css != this.old_css)
			{
				if (this.css_elem.textContent != this.new_css)
				{
					this.css_elem.textContent = this.new_css;
				}
			}
			this.old_css = this.new_css;
		}
		this.animation_id = null;
	},
	/**
	 * CSS vars chain
	 */
	callChainCssVars: function()
	{
		var __v0 = new Runtime.Monad(Runtime.rtl.getContext().chain(this.constructor.CSS_VARS_CHAIN, Runtime.Collection.from([new Runtime.Dict(),this])));
		__v0 = __v0.attr(0);
		__v0 = __v0.monad(Runtime.rtl.m_to("Runtime.Dict", Runtime.Dict.from({})));
		return __v0.value();
	},
	/**
	 * CSS vars chain
	 */
	callChainComponents: function()
	{
		var __v0 = new Runtime.Monad(Runtime.rtl.getContext().chain(this.constructor.COMPONENTS_CHAIN, Runtime.Collection.from([new Runtime.Collection(),this])));
		__v0 = __v0.attr(0);
		__v0 = __v0.monad(Runtime.rtl.m_to("Runtime.Collection", Runtime.Collection.from([])));
		return __v0.value();
	},
	/**
	 * CSS vars chain
	 */
	callChainCss: function(css)
	{
		var __v0 = new Runtime.Monad(Runtime.rtl.getContext().chain(this.constructor.CSS_CHAIN, Runtime.Collection.from([css,this])));
		__v0 = __v0.attr(0);
		__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
		return __v0.value();
	},
	_init: function()
	{
		this.layout = null;
		this.animation_id = null;
		this.controllers = new Runtime.Vector();
		this.components = new Runtime.Collection();
		this.default_components = new Runtime.Collection();
		this.path_id = Runtime.Collection.from([]);
		this.model_path = Runtime.Collection.from([]);
		this.css_vars = Runtime.Dict.from({});
		this.css_elem = null;
		this.new_css = "";
		this.old_css = "";
		Runtime.BaseDriver.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.RenderDriver";
	},
});
Object.assign(Runtime.Web.RenderDriver, Runtime.BaseDriver);
Object.assign(Runtime.Web.RenderDriver,
{
	CSS_CHAIN: "Runtime.Web.RenderDriver.CSS",
	CSS_VARS_CHAIN: "Runtime.Web.RenderDriver.CSS_Vars",
	COMPONENTS_CHAIN: "Runtime.Web.RenderDriver.Components",
	/**
	 * Retuns css hash
	 * @param string component class name
	 * @return string hash
	 */
	hash: function(s)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.Web.RenderDriver.hash", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var r = "";
		var a = "1234567890abcdef";
		var sz = Runtime.rs.strlen(s);
		var h = 0;
		for (var i = 0;i < sz;i++)
		{
			var c = Runtime.rs.ord(Runtime.rs.substr(s, i, 1));
			h = (h << 2) + (h >> 14) + c & 65535;
		}
		var p = 0;
		while (h != 0 || p < 4)
		{
			var c = h & 15;
			h = h >> 4;
			r += Runtime.rtl.toStr(Runtime.rs.substr(a, c, 1));
			p = p + 1;
		}
		var __memorize_value = r;
		Runtime.rtl._memorizeSave("Runtime.Web.RenderDriver.hash", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns css hash
	 */
	getCssHash: function(class_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.Web.RenderDriver.getCssHash", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var __v0 = new Runtime.Monad(Runtime.rtl.getParents(class_name));
		try{ __v0=(__v0.val!=null && __v0.err==null) ? new Runtime.Monad(__v0.val.filter((class_name) => 
		{
			return class_name != "Runtime.BaseObject" && class_name != "Runtime.Core.CoreObject" && class_name != "Runtime.Web.Component";
		})) : __v0; } catch (err) { __v0=new Runtime.Monad(null, err); }
		try{ __v0=(__v0.val!=null && __v0.err==null) ? new Runtime.Monad(__v0.val.map((class_name) => 
		{
			return "h-" + Runtime.rtl.toStr(this.hash(class_name));
		})) : __v0; } catch (err) { __v0=new Runtime.Monad(null, err); }
		var __memorize_value = __v0.value();
		Runtime.rtl._memorizeSave("Runtime.Web.RenderDriver.getCssHash", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns css from components
	 */
	getCSSFromComponents: function(components, css_vars)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.Web.RenderDriver.getCSSFromComponents", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		if (components == null)
		{
			var __memorize_value = "";
			Runtime.rtl._memorizeSave("Runtime.Web.RenderDriver.getCSSFromComponents", arguments, __memorize_value);
			return __memorize_value;
		}
		/* Extend component */
		components = this.getRequiredComponents(components);
		/* Get css */
		var arr = components.map((component_name) => 
		{
			if (component_name == "")
			{
				return "";
			}
			if (!Runtime.rtl.method_exists(component_name, "css"))
			{
				return "";
			}
			var f = Runtime.rtl.method(component_name, "css");
			var css = f(css_vars);
			return css;
		});
		var css = Runtime.rs.join("", arr);
		var __memorize_value = css;
		Runtime.rtl._memorizeSave("Runtime.Web.RenderDriver.getCSSFromComponents", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns required modules
	 * @param string class_name
	 * @return Collection<string>
	 */
	_getRequiredComponents: function(res, cache, components)
	{
		if (components == null)
		{
			return ;
		}
		for (var i = 0;i < components.count();i++)
		{
			var class_name = components.item(i);
			if (cache.get(class_name, false) == false)
			{
				cache.setValue(class_name, true);
				if (Runtime.rtl.method_exists(class_name, "components"))
				{
					var f = Runtime.rtl.method(class_name, "components");
					var sub_components = f();
					if (sub_components != null)
					{
						this._getRequiredComponents(res, cache, sub_components);
					}
				}
				res.pushValue(class_name);
			}
		}
	},
	/**
	 * Returns all components
	 * @param Collection<string> components
	 * @return Collection<string>
	 */
	getRequiredComponents: function(components)
	{
		components = components.filter(Runtime.lib.equalNot("")).removeDuplicatesIm();
		var res = new Runtime.Vector();
		var cache = new Runtime.Map();
		this._getRequiredComponents(res, cache, components);
		res = res.removeDuplicatesIm();
		return res.toCollection();
	},
	/**
	 * Render chain
	 * Create layout model
	 */
	cssVarsChain: function(css_vars, render)
	{
		css_vars = Runtime.rtl.setAttr(css_vars, Runtime.Collection.from(["colors"]), new Runtime.Dict(Runtime.Dict.from({"default":Runtime.Dict.from({"color":"#fff","background":"#fff","border":"#ccc","text":"#000","hover-background":"#eee","hover-text":"inherit"}),"active":Runtime.Dict.from({"color":"#337ab7","background":"#337ab7","border":"#22527b","text":"#fff","hover-background":"#337ab7","hover-text":"#fff"}),"primary":Runtime.Dict.from({"color":"#337ab7","background":"#337ab7","border":"#22527b","text":"#fff","hover-background":"#286090","hover-text":"#fff","active-background":"#286090","active-tet":"#fff"}),"danger":Runtime.Dict.from({"color":"#d14b42","background":"#d14b42","border":"#a02e27","text":"#fff","hover-background":"#e60000","hover-text":"#fff","active-background":"#e60000","active-tet":"#fff"}),"success":Runtime.Dict.from({"color":"green","background":"green","border":"green","text":"#fff","hover":"green","hover-text":"#fff","active":"green","active-tet":"#fff"}),"error":Runtime.Dict.from({"color":"#d14b42","background":"#d14b42","border":"#a02e27","text":"#fff","hover-background":"#e60000","hover-text":"#fff","active-background":"#e60000","active-tet":"#fff"}),"warning":Runtime.Dict.from({"color":"yellow","background":"yellow","border":"yellow","text":"#fff","hover":"yellow","hover-text":"#fff","active":"yellow","active-tet":"#fff"})})));
		css_vars = Runtime.rtl.setAttr(css_vars, Runtime.Collection.from(["font"]), new Runtime.Dict(Runtime.Dict.from({"size":"14px"})));
		return Runtime.Collection.from([css_vars,render]);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.RenderDriver";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseDriver";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
				new Runtime.LambdaChainClass(Runtime.Dict.from({})),
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("layout");
			a.push("animation_id");
			a.push("controllers");
			a.push("components");
			a.push("default_components");
			a.push("path_id");
			a.push("model_path");
			a.push("css_vars");
			a.push("css_elem");
			a.push("new_css");
			a.push("old_css");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "CSS_CHAIN") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "CSS_VARS_CHAIN") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "COMPONENTS_CHAIN") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "layout") return Dict.from({
			"t": "Runtime.BaseStruct",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "animation_id") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "controllers") return Dict.from({
			"t": "Runtime.Vector",
			"s": ["Runtime.Map"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "components") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["Runtime.Map"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "default_components") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["Runtime.Map"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "path_id") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "model_path") return Dict.from({
			"t": "Runtime.Collection",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "css_vars") return Dict.from({
			"t": "Runtime.Dict",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "css_elem") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_css") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "old_css") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
			"cssVarsChain",
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		if (field_name == "cssVarsChain")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":this.CSS_VARS_CHAIN,"pos":0})),
				]),
			});
		}
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.RenderDriver);
window["Runtime.Web.RenderDriver"] = Runtime.Web.RenderDriver;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.RenderDriver;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.BaseEvent = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.Events.BaseEvent.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.Events.BaseEvent.prototype.constructor = Runtime.Web.Events.BaseEvent;
Object.assign(Runtime.Web.Events.BaseEvent.prototype,
{
	/**
	 * Check if event is cancel
	 */
	isCancel: function()
	{
		return false;
	},
	getClassName: function()
	{
		return "Runtime.Web.Events.BaseEvent";
	},
});
Object.assign(Runtime.Web.Events.BaseEvent, Runtime.BaseStruct);
Object.assign(Runtime.Web.Events.BaseEvent,
{
	/**
	 * Cancel event
	 */
	cancel: function(event)
	{
		return event;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.BaseEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.BaseEvent);
window["Runtime.Web.Events.BaseEvent"] = Runtime.Web.Events.BaseEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.BaseEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.WebEvent = function()
{
	Runtime.Web.Events.BaseEvent.apply(this, arguments);
};
Runtime.Web.Events.WebEvent.prototype = Object.create(Runtime.Web.Events.BaseEvent.prototype);
Runtime.Web.Events.WebEvent.prototype.constructor = Runtime.Web.Events.WebEvent;
Object.assign(Runtime.Web.Events.WebEvent.prototype,
{
	/**
	 * Check if event is cancel
	 */
	isCancel: function()
	{
		return this.cancel_bubble;
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.name = "";
		this.bubbles = false;
		this.cancel_bubble = false;
		this.cancelable = true;
		this.composed = true;
		this.default_prevented = false;
		this.event_phase = 0;
		this.is_trusted = true;
		this.es6_event = null;
		this.currentElement = null;
		this.target = null;
		Runtime.Web.Events.BaseEvent.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
});
Object.assign(Runtime.Web.Events.WebEvent, Runtime.Web.Events.BaseEvent);
Object.assign(Runtime.Web.Events.WebEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "";
	},
	assignEventObject: function(obj, e)
	{
		obj.setValue("name", e.type);
		obj.setValue("currentElement", e.target);
		obj.setValue("target", e.currentTarget);
		obj.setValue("bubbles", e.bubbles);
		obj.setValue("cancel_bubble", e.cancel_bubble);
		obj.setValue("cancelable", e.cancelable);
		obj.setValue("composed", e.composed);
		obj.setValue("default_prevented", e.default_prevented);
		obj.setValue("event_phase", e.event_phase);
		obj.setValue("is_trusted", e.isTrusted);
		obj.setValue("es6_event", e);
	},
	fromEvent: function(e)
	{
		var target = e.currentTarget || e.target;
		var doc = target.ownerDocument || target;
		var win = doc.defaultView;
		var event = null;
		var obj = new Runtime.Map();
		var class_name = "";
		
		if (e.type == "click") class_name = "Runtime.Web.Events.MouseClickEvent";
		else if (e.type == "dblclick") class_name = "Runtime.Web.Events.MouseDoubleClickEvent";
		else if (e.type == "contextmenu") class_name = "Runtime.Web.Events.MouseContextMenuEvent";
		else if (e.type == "mousedown") class_name = "Runtime.Web.Events.MouseDownEvent";
		else if (e.type == "mouseenter") class_name = "Runtime.Web.Events.MouseEnterEvent";
		else if (e.type == "mouseleave") class_name = "Runtime.Web.Events.MouseLeaveEvent";
		else if (e.type == "mousemove") class_name = "Runtime.Web.Events.MouseMoveEvent";
		else if (e.type == "mouseout") class_name = "Runtime.Web.Events.MouseOutEvent";
		else if (e.type == "mouseover") class_name = "Runtime.Web.Events.MouseOverEvent";
		else if (e.type == "mouseup") class_name = "Runtime.Web.Events.MouseUpEvent";
		else if (e.type == "wheel") class_name = "Runtime.Web.Events.MouseWheelEvent";
		else if (e.type == "change") class_name = "Runtime.Web.Events.ChangeEvent";
		else if (e.type == "focus") class_name = "Runtime.Web.Events.FocusEvent";
		else if (e.type == "blur") class_name = "Runtime.Web.Events.BlurEvent";
		else if (e.type == "keydown") class_name = "Runtime.Web.Events.KeyDownEvent";
		else if (e.type == "keypress") class_name = "Runtime.Web.Events.KeyUpEvent";
		else if (e.type == "keyup") class_name = "Runtime.Web.Events.KeyPressEvent";
		
		var class_obj = use(class_name);
		class_obj.assignEventObject(obj, e);
		event = new class_obj(obj);
		
		if (event == null)
			return null;
			
		return event;
	},
	/**
	 * Cancel event
	 */
	preventDefault: function(event)
	{
		event = event.copy(Runtime.Dict.from({"default_prevented":true}));
		event.es6_event.preventDefault();
		return event;
	},
	/**
	 * Cancel event
	 */
	cancel: function(event)
	{
		event = event.copy(Runtime.Dict.from({"cancel_bubble":true,"default_prevented":true}));
		event.es6_event.cancelBubble = true;
		event.es6_event.stopPropagation();
		event.es6_event.preventDefault();
		return event;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.BaseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("name");
			a.push("bubbles");
			a.push("cancel_bubble");
			a.push("cancelable");
			a.push("composed");
			a.push("default_prevented");
			a.push("event_phase");
			a.push("is_trusted");
			a.push("es6_event");
			a.push("currentElement");
			a.push("target");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "bubbles") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "cancel_bubble") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "cancelable") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "composed") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "default_prevented") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "event_phase") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "is_trusted") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "es6_event") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "currentElement") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "target") return Dict.from({
			"t": "var",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.WebEvent);
window["Runtime.Web.Events.WebEvent"] = Runtime.Web.Events.WebEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.WebEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.BlurEvent = function()
{
	Runtime.Web.Events.WebEvent.apply(this, arguments);
};
Runtime.Web.Events.BlurEvent.prototype = Object.create(Runtime.Web.Events.WebEvent.prototype);
Runtime.Web.Events.BlurEvent.prototype.constructor = Runtime.Web.Events.BlurEvent;
Object.assign(Runtime.Web.Events.BlurEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.BlurEvent";
	},
});
Object.assign(Runtime.Web.Events.BlurEvent, Runtime.Web.Events.WebEvent);
Object.assign(Runtime.Web.Events.BlurEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "blur";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.BlurEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.BlurEvent);
window["Runtime.Web.Events.BlurEvent"] = Runtime.Web.Events.BlurEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.BlurEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.ChangeEvent = function()
{
	Runtime.Web.Events.WebEvent.apply(this, arguments);
};
Runtime.Web.Events.ChangeEvent.prototype = Object.create(Runtime.Web.Events.WebEvent.prototype);
Runtime.Web.Events.ChangeEvent.prototype.constructor = Runtime.Web.Events.ChangeEvent;
Object.assign(Runtime.Web.Events.ChangeEvent.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.value = "";
		this.old_value = "";
		Runtime.Web.Events.WebEvent.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Events.ChangeEvent";
	},
});
Object.assign(Runtime.Web.Events.ChangeEvent, Runtime.Web.Events.WebEvent);
Object.assign(Runtime.Web.Events.ChangeEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "change";
	},
	assignEventObject: function(obj, e)
	{
		Runtime.Web.Events.WebEvent.assignEventObject.call(this, obj, e);
		obj.setValue("value", e.currentTarget.value);
		obj.setValue("old_value", e.currentTarget._old_value);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.ChangeEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("value");
			a.push("old_value");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "old_value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.ChangeEvent);
window["Runtime.Web.Events.ChangeEvent"] = Runtime.Web.Events.ChangeEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.ChangeEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.FocusEvent = function()
{
	Runtime.Web.Events.WebEvent.apply(this, arguments);
};
Runtime.Web.Events.FocusEvent.prototype = Object.create(Runtime.Web.Events.WebEvent.prototype);
Runtime.Web.Events.FocusEvent.prototype.constructor = Runtime.Web.Events.FocusEvent;
Object.assign(Runtime.Web.Events.FocusEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.FocusEvent";
	},
});
Object.assign(Runtime.Web.Events.FocusEvent, Runtime.Web.Events.WebEvent);
Object.assign(Runtime.Web.Events.FocusEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "focus";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.FocusEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.FocusEvent);
window["Runtime.Web.Events.FocusEvent"] = Runtime.Web.Events.FocusEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.FocusEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.KeyboardEvent = function()
{
	Runtime.Web.Events.WebEvent.apply(this, arguments);
};
Runtime.Web.Events.KeyboardEvent.prototype = Object.create(Runtime.Web.Events.WebEvent.prototype);
Runtime.Web.Events.KeyboardEvent.prototype.constructor = Runtime.Web.Events.KeyboardEvent;
Object.assign(Runtime.Web.Events.KeyboardEvent.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.altKey = false;
		this.charCode = 0;
		this.code = "";
		this.ctrlKey = false;
		this.key = false;
		this.keyCode = 0;
		this.locale = "";
		this.location = 0;
		this.repeat = false;
		this.shiftKey = false;
		this.which = 0;
		this.value = "";
		Runtime.Web.Events.WebEvent.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Events.KeyboardEvent";
	},
});
Object.assign(Runtime.Web.Events.KeyboardEvent, Runtime.Web.Events.WebEvent);
Object.assign(Runtime.Web.Events.KeyboardEvent,
{
	assignEventObject: function(obj, e)
	{
		Runtime.Web.Events.WebEvent.assignEventObject.call(this, obj, e);
		obj.setValue("altKey", e.altKey);
		obj.setValue("charCode", e.charCode);
		obj.setValue("code", e.code);
		obj.setValue("ctrlKey", e.ctrlKey);
		obj.setValue("key", e.key);
		obj.setValue("keyCode", e.keyCode);
		obj.setValue("locale", e.locale);
		obj.setValue("location", e.location);
		obj.setValue("repeat", e.repeat);
		obj.setValue("shiftKey", e.shiftKey);
		obj.setValue("which", e.which);
		obj.setValue("value", e.currentTarget.value);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.KeyboardEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("altKey");
			a.push("charCode");
			a.push("code");
			a.push("ctrlKey");
			a.push("key");
			a.push("keyCode");
			a.push("locale");
			a.push("location");
			a.push("repeat");
			a.push("shiftKey");
			a.push("which");
			a.push("value");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "altKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "charCode") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "code") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ctrlKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "key") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "keyCode") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "locale") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "location") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "repeat") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "shiftKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "which") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.KeyboardEvent);
window["Runtime.Web.Events.KeyboardEvent"] = Runtime.Web.Events.KeyboardEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.KeyboardEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.KeyDownEvent = function()
{
	Runtime.Web.Events.KeyboardEvent.apply(this, arguments);
};
Runtime.Web.Events.KeyDownEvent.prototype = Object.create(Runtime.Web.Events.KeyboardEvent.prototype);
Runtime.Web.Events.KeyDownEvent.prototype.constructor = Runtime.Web.Events.KeyDownEvent;
Object.assign(Runtime.Web.Events.KeyDownEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.KeyDownEvent";
	},
});
Object.assign(Runtime.Web.Events.KeyDownEvent, Runtime.Web.Events.KeyboardEvent);
Object.assign(Runtime.Web.Events.KeyDownEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "keydown";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.KeyDownEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.KeyboardEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.KeyDownEvent);
window["Runtime.Web.Events.KeyDownEvent"] = Runtime.Web.Events.KeyDownEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.KeyDownEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.KeyPressEvent = function()
{
	Runtime.Web.Events.KeyboardEvent.apply(this, arguments);
};
Runtime.Web.Events.KeyPressEvent.prototype = Object.create(Runtime.Web.Events.KeyboardEvent.prototype);
Runtime.Web.Events.KeyPressEvent.prototype.constructor = Runtime.Web.Events.KeyPressEvent;
Object.assign(Runtime.Web.Events.KeyPressEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.KeyPressEvent";
	},
});
Object.assign(Runtime.Web.Events.KeyPressEvent, Runtime.Web.Events.KeyboardEvent);
Object.assign(Runtime.Web.Events.KeyPressEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "keypress";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.KeyPressEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.KeyboardEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.KeyPressEvent);
window["Runtime.Web.Events.KeyPressEvent"] = Runtime.Web.Events.KeyPressEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.KeyPressEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.KeyUpEvent = function()
{
	Runtime.Web.Events.KeyboardEvent.apply(this, arguments);
};
Runtime.Web.Events.KeyUpEvent.prototype = Object.create(Runtime.Web.Events.KeyboardEvent.prototype);
Runtime.Web.Events.KeyUpEvent.prototype.constructor = Runtime.Web.Events.KeyUpEvent;
Object.assign(Runtime.Web.Events.KeyUpEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.KeyUpEvent";
	},
});
Object.assign(Runtime.Web.Events.KeyUpEvent, Runtime.Web.Events.KeyboardEvent);
Object.assign(Runtime.Web.Events.KeyUpEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "keyup";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.KeyUpEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.KeyboardEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.KeyUpEvent);
window["Runtime.Web.Events.KeyUpEvent"] = Runtime.Web.Events.KeyUpEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.KeyUpEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseEvent = function()
{
	Runtime.Web.Events.WebEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseEvent.prototype = Object.create(Runtime.Web.Events.WebEvent.prototype);
Runtime.Web.Events.MouseEvent.prototype.constructor = Runtime.Web.Events.MouseEvent;
Object.assign(Runtime.Web.Events.MouseEvent.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.altKey = false;
		this.button = 0;
		this.buttons = 0;
		this.clientX = 0;
		this.clientY = 0;
		this.ctrlKey = false;
		this.detail = 0;
		this.layerX = 0;
		this.layerY = 0;
		this.metaKey = false;
		this.movementX = 0;
		this.movementY = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.pageX = 0;
		this.pageY = 0;
		this.screenX = 0;
		this.screenY = 0;
		this.shiftKey = false;
		this.x = 0;
		this.y = 0;
		Runtime.Web.Events.WebEvent.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseEvent, Runtime.Web.Events.WebEvent);
Object.assign(Runtime.Web.Events.MouseEvent,
{
	assignEventObject: function(obj, e)
	{
		Runtime.Web.Events.WebEvent.assignEventObject.call(this, obj, e);
		obj.setValue("altKey", e.altKey);
		obj.setValue("button", e.button);
		obj.setValue("buttons", e.buttons);
		obj.setValue("clientX", e.clientX);
		obj.setValue("clientY", e.clientY);
		obj.setValue("ctrlKey", e.ctrlKey);
		obj.setValue("detail", e.detail);
		obj.setValue("layerX", e.layerX);
		obj.setValue("layerY", e.layerY);
		obj.setValue("metaKey", e.metaKey);
		obj.setValue("movementX", e.movementX);
		obj.setValue("movementY", e.movementY);
		obj.setValue("offsetX", e.offsetX);
		obj.setValue("offsetY", e.offsetY);
		obj.setValue("pageX", e.pageX);
		obj.setValue("pageY", e.pageY);
		obj.setValue("screenX", e.screenX);
		obj.setValue("screenY", e.screenY);
		obj.setValue("shiftKey", e.shiftKey);
		obj.setValue("x", e.x);
		obj.setValue("y", e.y);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.WebEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("altKey");
			a.push("button");
			a.push("buttons");
			a.push("clientX");
			a.push("clientY");
			a.push("ctrlKey");
			a.push("detail");
			a.push("layerX");
			a.push("layerY");
			a.push("metaKey");
			a.push("movementX");
			a.push("movementY");
			a.push("offsetX");
			a.push("offsetY");
			a.push("pageX");
			a.push("pageY");
			a.push("screenX");
			a.push("screenY");
			a.push("shiftKey");
			a.push("x");
			a.push("y");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "altKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "button") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "buttons") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "clientX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "clientY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "ctrlKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "detail") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "layerX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "layerY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "metaKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "movementX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "movementY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "offsetX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "offsetY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "pageX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "pageY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "screenX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "screenY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "shiftKey") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "x") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "y") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseEvent);
window["Runtime.Web.Events.MouseEvent"] = Runtime.Web.Events.MouseEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseClickEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseClickEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseClickEvent.prototype.constructor = Runtime.Web.Events.MouseClickEvent;
Object.assign(Runtime.Web.Events.MouseClickEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseClickEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseClickEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseClickEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "click";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseClickEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseClickEvent);
window["Runtime.Web.Events.MouseClickEvent"] = Runtime.Web.Events.MouseClickEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseClickEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseContextMenuEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseContextMenuEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseContextMenuEvent.prototype.constructor = Runtime.Web.Events.MouseContextMenuEvent;
Object.assign(Runtime.Web.Events.MouseContextMenuEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseContextMenuEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseContextMenuEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseContextMenuEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "contextmenu";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseContextMenuEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseContextMenuEvent);
window["Runtime.Web.Events.MouseContextMenuEvent"] = Runtime.Web.Events.MouseContextMenuEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseContextMenuEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseDoubleClickEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseDoubleClickEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseDoubleClickEvent.prototype.constructor = Runtime.Web.Events.MouseDoubleClickEvent;
Object.assign(Runtime.Web.Events.MouseDoubleClickEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseDoubleClickEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseDoubleClickEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseDoubleClickEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "dblclick";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseDoubleClickEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseDoubleClickEvent);
window["Runtime.Web.Events.MouseDoubleClickEvent"] = Runtime.Web.Events.MouseDoubleClickEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseDoubleClickEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseDownEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseDownEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseDownEvent.prototype.constructor = Runtime.Web.Events.MouseDownEvent;
Object.assign(Runtime.Web.Events.MouseDownEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseDownEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseDownEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseDownEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mousedown";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseDownEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseDownEvent);
window["Runtime.Web.Events.MouseDownEvent"] = Runtime.Web.Events.MouseDownEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseDownEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseEnterEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseEnterEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseEnterEvent.prototype.constructor = Runtime.Web.Events.MouseEnterEvent;
Object.assign(Runtime.Web.Events.MouseEnterEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseEnterEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseEnterEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseEnterEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mouseenter";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseEnterEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseEnterEvent);
window["Runtime.Web.Events.MouseEnterEvent"] = Runtime.Web.Events.MouseEnterEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseEnterEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseLeaveEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseLeaveEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseLeaveEvent.prototype.constructor = Runtime.Web.Events.MouseLeaveEvent;
Object.assign(Runtime.Web.Events.MouseLeaveEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseLeaveEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseLeaveEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseLeaveEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mouseleave";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseLeaveEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseLeaveEvent);
window["Runtime.Web.Events.MouseLeaveEvent"] = Runtime.Web.Events.MouseLeaveEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseLeaveEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseMoveEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseMoveEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseMoveEvent.prototype.constructor = Runtime.Web.Events.MouseMoveEvent;
Object.assign(Runtime.Web.Events.MouseMoveEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseMoveEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseMoveEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseMoveEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mousemove";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseMoveEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseMoveEvent);
window["Runtime.Web.Events.MouseMoveEvent"] = Runtime.Web.Events.MouseMoveEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseMoveEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseOutEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseOutEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseOutEvent.prototype.constructor = Runtime.Web.Events.MouseOutEvent;
Object.assign(Runtime.Web.Events.MouseOutEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseOutEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseOutEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseOutEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mouseout";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseOutEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseOutEvent);
window["Runtime.Web.Events.MouseOutEvent"] = Runtime.Web.Events.MouseOutEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseOutEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseOverEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseOverEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseOverEvent.prototype.constructor = Runtime.Web.Events.MouseOverEvent;
Object.assign(Runtime.Web.Events.MouseOverEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseOverEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseOverEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseOverEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mouseover";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseOverEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseOverEvent);
window["Runtime.Web.Events.MouseOverEvent"] = Runtime.Web.Events.MouseOverEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseOverEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseUpEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseUpEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseUpEvent.prototype.constructor = Runtime.Web.Events.MouseUpEvent;
Object.assign(Runtime.Web.Events.MouseUpEvent.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseUpEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseUpEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseUpEvent,
{
	/**
	 * Returns es6 event name
	 */
	getES6EventName: function()
	{
		return "mouseup";
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseUpEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseUpEvent);
window["Runtime.Web.Events.MouseUpEvent"] = Runtime.Web.Events.MouseUpEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseUpEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.Events == 'undefined') Runtime.Web.Events = {};
Runtime.Web.Events.MouseWheelEvent = function()
{
	Runtime.Web.Events.MouseEvent.apply(this, arguments);
};
Runtime.Web.Events.MouseWheelEvent.prototype = Object.create(Runtime.Web.Events.MouseEvent.prototype);
Runtime.Web.Events.MouseWheelEvent.prototype.constructor = Runtime.Web.Events.MouseWheelEvent;
Object.assign(Runtime.Web.Events.MouseWheelEvent.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.wheelDelta = 0;
		this.wheelDeltaX = 0;
		this.wheelDeltaY = 0;
		Runtime.Web.Events.MouseEvent.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.Events.MouseWheelEvent";
	},
});
Object.assign(Runtime.Web.Events.MouseWheelEvent, Runtime.Web.Events.MouseEvent);
Object.assign(Runtime.Web.Events.MouseWheelEvent,
{
	ES6_EVENT_NAME: "wheel",
	assignEventObject: function(obj, e)
	{
		Runtime.Web.Events.MouseEvent.assignEventObject.call(this, obj, e);
		obj.setValue("wheelDelta", e.wheelDelta);
		obj.setValue("wheelDeltaX", e.wheelDeltaX);
		obj.setValue("wheelDeltaY", e.wheelDeltaY);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.Events";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.Events.MouseWheelEvent";
	},
	getParentClassName: function()
	{
		return "Runtime.Web.Events.MouseEvent";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("wheelDelta");
			a.push("wheelDeltaX");
			a.push("wheelDeltaY");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "ES6_EVENT_NAME") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "wheelDelta") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "wheelDeltaX") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "wheelDeltaY") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.Events.MouseWheelEvent);
window["Runtime.Web.Events.MouseWheelEvent"] = Runtime.Web.Events.MouseWheelEvent;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.Events.MouseWheelEvent;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
Runtime.Web.ModuleDescription = function()
{
};
Object.assign(Runtime.Web.ModuleDescription.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.ModuleDescription";
	},
});
Object.assign(Runtime.Web.ModuleDescription,
{
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleName: function()
	{
		return "Runtime.Web";
	},
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleVersion: function()
	{
		return "0.11.0";
	},
	/**
	 * Returns required modules
	 * @return Dict<string>
	 */
	requiredModules: function()
	{
		return Runtime.Dict.from({"Runtime":">=0.3"});
	},
	/**
	 * Returns enities
	 */
	entities: function()
	{
		return Runtime.Collection.from([new Runtime.Entity(Runtime.Dict.from({"name":"Runtime.Web.RenderDriver"})),new Runtime.Driver(Runtime.Dict.from({"name":"RenderDriver","value":"Runtime.Web.RenderDriver","global":true,"params":Runtime.Dict.from({})}))]);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.ModuleDescription";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.ModuleDescription);
window["Runtime.Web.ModuleDescription"] = Runtime.Web.ModuleDescription;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.ModuleDescription;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.ApiList = function()
{
	Runtime.Entity.apply(this, arguments);
};
Runtime.Web.App.ApiList.prototype = Object.create(Runtime.Entity.prototype);
Runtime.Web.App.ApiList.prototype.constructor = Runtime.Web.App.ApiList;
Object.assign(Runtime.Web.App.ApiList.prototype,
{
	apiName: function()
	{
		return (this.object_name != "") ? (this.object_name) : (this.getClassName());
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.object_name = "";
		this.interface_name = "";
		Runtime.Entity.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.ApiList";
	},
});
Object.assign(Runtime.Web.App.ApiList, Runtime.Entity);
Object.assign(Runtime.Web.App.ApiList,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.ApiList";
	},
	getParentClassName: function()
	{
		return "Runtime.Entity";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("object_name");
			a.push("interface_name");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "object_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "interface_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.ApiList);
window["Runtime.Web.App.ApiList"] = Runtime.Web.App.ApiList;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.ApiList;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.ApiMethod = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.ApiMethod.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.ApiMethod.prototype.constructor = Runtime.Web.App.ApiMethod;
Object.assign(Runtime.Web.App.ApiMethod.prototype,
{
	/**
	 * Extend
	 */
	addClassItem: function(class_name, class_method_name, class_item, info)
	{
		return this.copy(Runtime.Dict.from({"object_name":class_item.object_name,"interface_name":class_item.interface_name,"class_name":class_name,"class_method_name":class_method_name}));
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.object_name = "";
		this.interface_name = "";
		this.class_name = "";
		this.class_method_name = "";
		this.method_name = "";
		this.uri = "";
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.ApiMethod";
	},
});
Object.assign(Runtime.Web.App.ApiMethod, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.ApiMethod,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.ApiMethod";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("object_name");
			a.push("interface_name");
			a.push("class_name");
			a.push("class_method_name");
			a.push("method_name");
			a.push("uri");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "object_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "interface_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "class_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "class_method_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "method_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.ApiMethod);
window["Runtime.Web.App.ApiMethod"] = Runtime.Web.App.ApiMethod;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.ApiMethod;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.ApiMiddleware = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.ApiMiddleware.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.ApiMiddleware.prototype.constructor = Runtime.Web.App.ApiMiddleware;
Object.assign(Runtime.Web.App.ApiMiddleware.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.value = "";
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.ApiMiddleware";
	},
});
Object.assign(Runtime.Web.App.ApiMiddleware, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.ApiMiddleware,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.ApiMiddleware";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("value");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.ApiMiddleware);
window["Runtime.Web.App.ApiMiddleware"] = Runtime.Web.App.ApiMiddleware;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.ApiMiddleware;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.ApiMiddleware = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.ApiMiddleware.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.ApiMiddleware.prototype.constructor = Runtime.Web.App.ApiMiddleware;
Object.assign(Runtime.Web.App.ApiMiddleware.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.value = "";
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.ApiMiddleware";
	},
});
Object.assign(Runtime.Web.App.ApiMiddleware, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.ApiMiddleware,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.ApiMiddleware";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("value");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.ApiMiddleware);
window["Runtime.Web.App.ApiMiddleware"] = Runtime.Web.App.ApiMiddleware;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.ApiMiddleware;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.Cookie = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.Cookie.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.Cookie.prototype.constructor = Runtime.Web.App.Cookie;
Object.assign(Runtime.Web.App.Cookie.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.name = "";
		this.value = "";
		this.expire = null;
		this.domain = "";
		this.path = "";
		this.secure = false;
		this.httponly = false;
		this.changed = false;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.Cookie";
	},
});
Object.assign(Runtime.Web.App.Cookie, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.Cookie,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.Cookie";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("name");
			a.push("value");
			a.push("expire");
			a.push("domain");
			a.push("path");
			a.push("secure");
			a.push("httponly");
			a.push("changed");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "expire") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "domain") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "path") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "secure") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "httponly") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "changed") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.Cookie);
window["Runtime.Web.App.Cookie"] = Runtime.Web.App.Cookie;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.Cookie;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.ExternalBusDriver = function()
{
	Runtime.BaseDriver.apply(this, arguments);
};
Runtime.Web.App.ExternalBusDriver.prototype = Object.create(Runtime.BaseDriver.prototype);
Runtime.Web.App.ExternalBusDriver.prototype.constructor = Runtime.Web.App.ExternalBusDriver;
Object.assign(Runtime.Web.App.ExternalBusDriver.prototype,
{
	/**
	 * Send message
	 * @return string
	 */
	sendMessage: async function(msg)
	{
	},
	/**
	 * Send message
	 * @return string
	 */
	remoteBusCall: async function(request)
	{
		var uri = request.uri;
		var app_name = request.app_name;
		var object_name = request.object_name;
		var interface_name = request.interface_name;
		var method_name = request.method_name;
		var data = request.data;
		var storage = request.storage;
		var bus_gate = Runtime.rtl.getContext().env("X-ROUTE-PREFIX", "") + Runtime.rtl.toStr("/api");
		var url = (uri != "") ? (uri) : (bus_gate + "/" + app_name + "/" + object_name + "/" + interface_name + "/" + method_name + "/");
		/* Send post */
		var res = await this.constructor.post(Runtime.Dict.from({"url":url,"data":data,"storage":storage}));
		/* Answer */
		try
		{
			res = Runtime.rtl.json_decode(res);
		}
		catch (_ex)
		{
			if (true)
			{
				var e = _ex;
				
				res = null;
			}
			else
			{
				throw _ex;
			}
		}
		if (res != null)
		{
			res = new Runtime.Web.App.RemoteCallAnswer(res);
		}
		else
		{
			res = new Runtime.Web.App.RemoteCallAnswer(Runtime.Dict.from({"have_answer":false,"error_message":"Json parse error","code":Runtime.rtl.ERROR_PARSE_SERIALIZATION_ERROR,"response":null}));
		}
		return Promise.resolve(res);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.ExternalBusDriver";
	},
});
Object.assign(Runtime.Web.App.ExternalBusDriver, Runtime.BaseDriver);
Object.assign(Runtime.Web.App.ExternalBusDriver,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.ExternalBusDriver";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseDriver";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
			"sendMessage",
			"remoteBusCall",
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
	__implements__:
	[
		Runtime.Web.App.BusInterface,
	],
});
Runtime.rtl.defClass(Runtime.Web.App.ExternalBusDriver);
window["Runtime.Web.App.ExternalBusDriver"] = Runtime.Web.App.ExternalBusDriver;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.ExternalBusDriver;
Object.assign(Runtime.Web.App.ExternalBusDriver,
{
	/**
	 * Send post. Returns json object or null if error
	 */
	post: async function(obj)
	{
		var url = obj.get("url");
		var data = obj.get("data");
		var storage = obj.get("storage");
		
		/* Build pos data */
		var build_data = this.buildData(data, storage);
		var post_data = this.buildPostData(build_data);
		
		/* Send post */
		var xhr = await this.sendPost(url, post_data);
		return xhr.responseText;
	},
	
	
	
	/**
	 * Convert data to Native for ajax POST request
	 * @params serializable data
	 * @return Vector
	 */
	buildData: function(data, storage)
	{
		var res = [];
		data = Runtime.RuntimeUtils.json_encode(data);
		storage = Runtime.RuntimeUtils.json_encode(storage);
		/*json = btoa( unescape(encodeURIComponent(json)) );*/
		res.push({"key": "data", "value": data});
		res.push({"key": "storage", "value": storage});
		return res;
	},
	
	
	
	/**
	 * Returns FormData
	 * @params data - json object
	 * @return FormData
	 */
	buildPostData: function(data)
	{
		var post_data = new FormData();
		
		/* Add data to post data */
		for (var i=0; i<data.length; i++)
		{
			var obj = data[i];
			var key = obj.key;
			var val = obj.value;
			if (val instanceof FileList)
			{
				for (var i=0; i<val.length; i++)
				{
					post_data.append(key + "[]", val.item(i), val.item(i).name);
				}
			}
			else if (val instanceof File)
			{
				post_data.append(key, val, val.name);
			}
			else
			{
				post_data.append(key, val);
			}
		}
		
		return post_data;
	},
	
	
	
	/**
	 * Send api request
	 * @param string class_name
	 * @param string method_name
	 * @param Map<string, mixed> data
	 * @param callback f
	 */ 
	sendPost: async function(url, post_data)
	{
		return await new Promise((resolve, reject) =>{
			try
			{
				var xhr = new XMLHttpRequest();
				xhr.open('POST', url, true);
				xhr.send(post_data);
				xhr.onreadystatechange = (function(xhr, resolve, reject) {
					return function()
					{
						if (xhr.readyState != 4) return;
						if (xhr.status == 200)
						{
							resolve(xhr);
						}
						else
						{
							reject
							(
								new Runtime.Exceptions.RuntimeException
								(xhr.status + " " + xhr.statusText, xhr.status) 
							);
						}
					}
				})(xhr, resolve, reject);
			}
			catch (e)
			{
				reject(e);
			}
		});
	},
	
});
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.LayoutModel = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.LayoutModel.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.LayoutModel.prototype.constructor = Runtime.Web.App.LayoutModel;
Object.assign(Runtime.Web.App.LayoutModel.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.is_https = false;
		this.port = 80;
		this.hostname = "";
		this.uri = "";
		this.full_uri = "";
		this.route_prefix = "";
		this.locale_uri = "";
		this.f_inc = "";
		this.route = null;
		this.route_params = null;
		this.locale = "en";
		this.title = "";
		this.description = "";
		this.tz = "UTC";
		this.layout_name = "default";
		this.layout_class = "";
		this.page_class = "";
		this.model = Runtime.Dict.from({});
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.LayoutModel";
	},
});
Object.assign(Runtime.Web.App.LayoutModel, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.LayoutModel,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.LayoutModel";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("is_https");
			a.push("port");
			a.push("hostname");
			a.push("uri");
			a.push("full_uri");
			a.push("route_prefix");
			a.push("locale_uri");
			a.push("f_inc");
			a.push("route");
			a.push("route_params");
			a.push("locale");
			a.push("title");
			a.push("description");
			a.push("tz");
			a.push("layout_name");
			a.push("layout_class");
			a.push("page_class");
			a.push("model");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "is_https") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "port") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "hostname") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "full_uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route_prefix") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "locale_uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "f_inc") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route") return Dict.from({
			"t": "Runtime.Web.App.Route",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route_params") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "locale") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "title") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "description") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "tz") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "layout_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "layout_class") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "page_class") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "model") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["primitive"],
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.LayoutModel);
window["Runtime.Web.App.LayoutModel"] = Runtime.Web.App.LayoutModel;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.LayoutModel;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.RemoteCallAnswer = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.RemoteCallAnswer.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.RemoteCallAnswer.prototype.constructor = Runtime.Web.App.RemoteCallAnswer;
Object.assign(Runtime.Web.App.RemoteCallAnswer.prototype,
{
	/**
	 * Returns true if success
	 * @return bool
	 */
	isSuccess: function()
	{
		return this.have_answer && this.code >= Runtime.rtl.ERROR_OK;
	},
	/**
	 * Returns true if success
	 * @return bool
	 */
	getMessage: function()
	{
		return (this.isSuccess()) ? (this.success_message) : (this.error_message);
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.app_name = "self";
		this.object_name = "";
		this.interface_name = "default";
		this.method_name = "";
		this.code = 0;
		this.success_message = "";
		this.error_message = "";
		this.error_name = "";
		this.error_trace = "";
		this.logs = null;
		this.have_answer = false;
		this.response = null;
		this.new_cookies = Runtime.Dict.from({});
		this.new_headers = Runtime.Collection.from([]);
		this.new_http_code = 200;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.RemoteCallAnswer";
	},
});
Object.assign(Runtime.Web.App.RemoteCallAnswer, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.RemoteCallAnswer,
{
	/**
	 * Set success result
	 * @param primitive res
	 * @return Message
	 */
	success: function(answer, response, message, code)
	{
		if (response == undefined) response = null;
		if (message == undefined) message = "";
		if (code == undefined) code = 1;
		return answer.copy(Runtime.Dict.from({"code":code,"error_message":"","success_message":message,"response":response,"have_answer":true}));
	},
	/**
	 * Set fail result
	 * @param primitive res
	 * @return Message
	 */
	fail: function(answer, response, error, code, error_name)
	{
		if (error == undefined) error = "";
		if (code == undefined) code = -1;
		if (error_name == undefined) error_name = "";
		return answer.copy(Runtime.Dict.from({"code":code,"error_message":error,"error_name":error_name,"response":response,"have_answer":true}));
	},
	/**
	 * Set exception
	 * @param primitive res
	 * @return Message
	 */
	exception: function(answer, e)
	{
		answer = answer.copy(Runtime.Dict.from({"code":e.getErrorCode(),"error_message":e.getErrorMessage(),"error_name":e.getClassName(),"response":null,"have_answer":true}));
		if (e instanceof Runtime.Exceptions.ApiException)
		{
			answer = Runtime.rtl.setAttr(answer, Runtime.Collection.from(["response"]), e.response);
		}
		return answer;
	},
	/**
	 * End pipe
	 */
	end: function(m)
	{
		if (m.err == null)
		{
			return m;
		}
		return new Runtime.Monad(new Runtime.Web.Message(Runtime.Dict.from({"error_message":m.err.getErrorMessage(),"error_name":m.err.getClassName(),"code":m.err.getErrorCode(),"response":m.err})));
	},
	/**
	 * Add cookie
	 */
	addCookie: function(answer, cookie)
	{
		var cookie_name = Runtime.rtl.get(cookie, "name");
		if (answer.new_cookies == null)
		{
			answer = Runtime.rtl.setAttr(answer, Runtime.Collection.from(["new_cookies"]), new Runtime.Dict());
		}
		answer = Runtime.rtl.setAttr(answer, Runtime.Collection.from(["new_cookies"]), answer.new_cookies.setIm(cookie_name, cookie));
		return answer;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.RemoteCallAnswer";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("app_name");
			a.push("object_name");
			a.push("interface_name");
			a.push("method_name");
			a.push("code");
			a.push("success_message");
			a.push("error_message");
			a.push("error_name");
			a.push("error_trace");
			a.push("logs");
			a.push("have_answer");
			a.push("response");
			a.push("new_cookies");
			a.push("new_headers");
			a.push("new_http_code");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "app_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "object_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "interface_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "method_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "code") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "success_message") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_message") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "error_trace") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "logs") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "have_answer") return Dict.from({
			"t": "bool",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "response") return Dict.from({
			"t": "primitive",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_cookies") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["Runtime.Web.App.Cookie"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_headers") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_http_code") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.RemoteCallAnswer);
window["Runtime.Web.App.RemoteCallAnswer"] = Runtime.Web.App.RemoteCallAnswer;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.RemoteCallAnswer;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.RemoteCallRequest = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.RemoteCallRequest.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.RemoteCallRequest.prototype.constructor = Runtime.Web.App.RemoteCallRequest;
Object.assign(Runtime.Web.App.RemoteCallRequest.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.uri = "";
		this.app_name = "self";
		this.object_name = "";
		this.interface_name = "default";
		this.method_name = "";
		this.data = null;
		this.storage = null;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.RemoteCallRequest";
	},
});
Object.assign(Runtime.Web.App.RemoteCallRequest, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.RemoteCallRequest,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.RemoteCallRequest";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("uri");
			a.push("app_name");
			a.push("object_name");
			a.push("interface_name");
			a.push("method_name");
			a.push("data");
			a.push("storage");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "app_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "object_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "interface_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "method_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "data") return Dict.from({
			"t": "primitive",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "storage") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["primitive"],
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.RemoteCallRequest);
window["Runtime.Web.App.RemoteCallRequest"] = Runtime.Web.App.RemoteCallRequest;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.RemoteCallRequest;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.RenderContainer = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.RenderContainer.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.RenderContainer.prototype.constructor = Runtime.Web.App.RenderContainer;
Object.assign(Runtime.Web.App.RenderContainer.prototype,
{
	/* Functions */
	isRequestExists: function()
	{
		return this.request != null;
	},
	isResponseExists: function()
	{
		return this.response != null;
	},
	isRouteExists: function()
	{
		return this.route != null && this.route_params != null && this.route.class_name != "" && this.route.class_method_name != "";
	},
	isPageExists: function()
	{
		return this.layout != null && this.layout.page_class != "";
	},
	/**
	 * Set page
	 */
	setPage: function(page_class, page_model)
	{
		var model = this.layout.model;
		if (model == null)
		{
			model = Runtime.Dict.from({});
		}
		/* Set page model */
		model = model.setIm(page_class, page_model);
		return this.copy(Runtime.Dict.from({"layout":this.layout.copy(Runtime.Dict.from({"page_class":page_class,"model":model}))}));
	},
	/**
	 * Set page model
	 */
	setPageModel: function(page_model)
	{
		return this.setPage(this.layout.page_class, page_model);
	},
	/**
	 * Returns page model
	 */
	getPageModel: function()
	{
		return Runtime.rtl.get(this.layout.model, this.layout.page_class);
	},
	/**
	 * Remote bus call
	 * @param Dict items
	 * @return RemoteCallAnswer
	 */
	externalBusCall: async function(items)
	{
		/* Set storage */
		items = items.copy(Runtime.Dict.from({"storage":this.api_storage}));
		/* Send request */
		return Promise.resolve(await Runtime.Web.App.WebApp.externalBusCall(items));
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.request = null;
		this.response = null;
		this.route = null;
		this.route_params = null;
		this.layout = null;
		this.pattern_name = "default";
		this.pattern_class = "";
		this.frontend_env = Runtime.Dict.from({});
		this.api_storage = new Runtime.Dict();
		this.new_cookies = Runtime.Dict.from({});
		this.new_headers = Runtime.Collection.from([]);
		this.new_http_code = 200;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.RenderContainer";
	},
});
Object.assign(Runtime.Web.App.RenderContainer, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.RenderContainer,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.RenderContainer";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("request");
			a.push("response");
			a.push("route");
			a.push("route_params");
			a.push("layout");
			a.push("pattern_name");
			a.push("pattern_class");
			a.push("frontend_env");
			a.push("api_storage");
			a.push("new_cookies");
			a.push("new_headers");
			a.push("new_http_code");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "request") return Dict.from({
			"t": "Runtime.Web.App.Request",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "response") return Dict.from({
			"t": "Runtime.Web.App.Response",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route") return Dict.from({
			"t": "Runtime.Web.App.Route",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route_params") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "layout") return Dict.from({
			"t": "Runtime.Web.App.LayoutModel",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "pattern_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "pattern_class") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "frontend_env") return Dict.from({
			"t": "Runtime.Dict",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "api_storage") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["primitive"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_cookies") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["Runtime.Web.App.Cookie"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_headers") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "new_http_code") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.RenderContainer);
window["Runtime.Web.App.RenderContainer"] = Runtime.Web.App.RenderContainer;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.RenderContainer;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.Request = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.Request.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.Request.prototype.constructor = Runtime.Web.App.Request;
Object.assign(Runtime.Web.App.Request.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.uri = "";
		this.host = "";
		this.method = "GET";
		this.protocol = "";
		this.route_prefix = "";
		this.query = null;
		this.payload = null;
		this.cookies = null;
		this.headers = null;
		this.params = null;
		this.start_time = 0;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.Request";
	},
});
Object.assign(Runtime.Web.App.Request, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.Request,
{
	METHOD_GET: "GET",
	METHOD_HEAD: "HEAD",
	METHOD_POST: "POST",
	METHOD_PUT: "PUT",
	METHOD_DELETE: "DELETE",
	METHOD_CONNECT: "CONNECT",
	METHOD_OPTIONS: "OPTIONS",
	METHOD_TRACE: "TRACE",
	METHOD_PATCH: "PATCH",
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.Request";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("uri");
			a.push("host");
			a.push("method");
			a.push("protocol");
			a.push("route_prefix");
			a.push("query");
			a.push("payload");
			a.push("cookies");
			a.push("headers");
			a.push("params");
			a.push("start_time");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "METHOD_GET") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_HEAD") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_POST") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_PUT") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_DELETE") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_CONNECT") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_OPTIONS") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_TRACE") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "METHOD_PATCH") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "host") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "method") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "protocol") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route_prefix") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "query") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "payload") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["var"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "cookies") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["Runtime.Web.App.Cookie"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "headers") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "params") return Dict.from({
			"t": "Runtime.Dict",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "start_time") return Dict.from({
			"t": "float",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.Request);
window["Runtime.Web.App.Request"] = Runtime.Web.App.Request;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.Request;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.Route = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.Route.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.Route.prototype.constructor = Runtime.Web.App.Route;
Object.assign(Runtime.Web.App.Route.prototype,
{
	/**
	 * Extend route
	 */
	addClassItem: function(class_name, class_method_name, class_item, info)
	{
		return this.copy(Runtime.Dict.from({"class_name":class_name,"class_method_name":class_method_name}));
	},
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.uri = "";
		this.name = "";
		this.class_name = "";
		this.class_method_name = "";
		this.uri_match = "";
		this.params = null;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.Route";
	},
});
Object.assign(Runtime.Web.App.Route, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.Route,
{
	/**
	 * Init struct data
	 */
	_initData: function(old, changed)
	{
		var uri = this._initDataGet(old, changed, "uri");
		var uri_match = this._initDataGet(old, changed, "uri_match");
		if (Runtime.rtl.isEmpty(uri_match))
		{
			var uri_match = uri;
			uri_match = Runtime.re.replace("\\/", "\\/", uri_match);
			var params = new Runtime.Vector();
			var matches = Runtime.re.matchAll("{(.*?)}", uri);
			if (matches)
			{
				matches.each((arr) => 
				{
					var name = Runtime.rtl.get(arr, 1);
					uri_match = Runtime.re.replace("{" + Runtime.rtl.toStr(name) + Runtime.rtl.toStr("}"), "([^\\/]*?)", uri_match);
					params.pushValue(name);
				});
				changed = changed.setIm("params", params.toCollection());
			}
			else
			{
				changed = changed.setIm("params", Runtime.Collection.from([]));
			}
			changed = changed.setIm("uri_match", "^" + Runtime.rtl.toStr(uri_match) + Runtime.rtl.toStr("$"));
		}
		return changed;
	},
	/**
	 * Get params
	 * @return Map<string>
	 */
	getParams: function(matches, info)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.Web.App.Route.getParams", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		if (info.params == null || matches == null)
		{
			var __memorize_value = Runtime.Dict.from({});
			Runtime.rtl._memorizeSave("Runtime.Web.App.Route.getParams", arguments, __memorize_value);
			return __memorize_value;
		}
		var res = new Runtime.Map();
		info.params.each((name, pos) => 
		{
			var match = matches.get(pos, null);
			if (match)
			{
				res.setValue(name, match);
			}
		});
		var __memorize_value = res.toDict();
		Runtime.rtl._memorizeSave("Runtime.Web.App.Route.getParams", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Replace url
	 */
	replace: function(url, params)
	{
		if (params == undefined) params = null;
		url = (params == null) ? (url) : (params.reduce((message, value, key) => 
		{
			return Runtime.rs.replace("{" + Runtime.rtl.toStr(key) + Runtime.rtl.toStr("}"), value, message);
		}, url));
		return url;
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.Route";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("uri");
			a.push("name");
			a.push("class_name");
			a.push("class_method_name");
			a.push("uri_match");
			a.push("params");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "uri") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "class_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "class_method_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "uri_match") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "params") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.Route);
window["Runtime.Web.App.Route"] = Runtime.Web.App.Route;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.Route;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.RouteList = function()
{
	Runtime.Entity.apply(this, arguments);
};
Runtime.Web.App.RouteList.prototype = Object.create(Runtime.Entity.prototype);
Runtime.Web.App.RouteList.prototype.constructor = Runtime.Web.App.RouteList;
Object.assign(Runtime.Web.App.RouteList.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.App.RouteList";
	},
});
Object.assign(Runtime.Web.App.RouteList, Runtime.Entity);
Object.assign(Runtime.Web.App.RouteList,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.RouteList";
	},
	getParentClassName: function()
	{
		return "Runtime.Entity";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.RouteList);
window["Runtime.Web.App.RouteList"] = Runtime.Web.App.RouteList;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.RouteList;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.RouteMiddleware = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.RouteMiddleware.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.RouteMiddleware.prototype.constructor = Runtime.Web.App.RouteMiddleware;
Object.assign(Runtime.Web.App.RouteMiddleware.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.value = "";
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.RouteMiddleware";
	},
});
Object.assign(Runtime.Web.App.RouteMiddleware, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.RouteMiddleware,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.RouteMiddleware";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("value");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "value") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.RouteMiddleware);
window["Runtime.Web.App.RouteMiddleware"] = Runtime.Web.App.RouteMiddleware;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.RouteMiddleware;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.Routes = function()
{
};
Object.assign(Runtime.Web.App.Routes.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.App.Routes";
	},
});
Object.assign(Runtime.Web.App.Routes,
{
	/**
	 * Api Action
	 * @return Response
	 */
	ApiAction: async function(container)
	{
		var answer = null;
		if (!container.isRequestExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (container.request.method != "POST")
		{
			answer = new Runtime.Web.App.RemoteCallAnswer();
			/* Set exception */
			answer = answer.constructor.exception(answer, new Runtime.Exceptions.ApiException(Runtime.rtl.getContext().translate("Runtime", "The request must be POST method"), Runtime.rtl.ERROR_API_WRONG_FORMAT));
			/* Set 400 code */
			answer = Runtime.rtl.setAttr(answer, Runtime.Collection.from(["new_http_code"]), 400);
		}
		else
		{
			/* Decode data */
			var data1 = container.request.payload.get("data", "");
			var data = Runtime.rtl.json_decode(data1);
			/* Decode storage */
			var storage1 = container.request.payload.get("storage", "");
			var storage = Runtime.rtl.json_decode(storage1);
			/* Get time and sign */
			var __v0 = new Runtime.Monad(container.request.payload.get("sign", ""));
			__v0 = __v0.monad(Runtime.rtl.m_to("string", ""));
			var sign = __v0.value();
			var __v1 = new Runtime.Monad(container.request.payload.get("time", ""));
			__v1 = __v1.monad(Runtime.rtl.m_to("int", 0));
			var time = __v1.value();
			/* Check correct app name */
			var app_name = container.route_params.item("app_name");
			if (app_name != "self" && app_name != Runtime.rtl.getContext().main_module)
			{
				/* Set exception */
				answer = answer.constructor.exception(answer, new Runtime.Exceptions.FileNotFound(app_name, Runtime.rtl.getContext().translate("Runtime", "App"), Runtime.rtl.ERROR_API_WRONG_APP_NAME));
				/* Set 404 code */
				answer = Runtime.rtl.setAttr(answer, Runtime.Collection.from(["new_http_code"]), 404);
				return Promise.resolve(answer);
			}
			/* Send request */
			answer = await container.externalBusCall(Runtime.Dict.from({"object_name":container.route_params.item("object_name"),"interface_name":container.route_params.item("interface_name"),"method_name":container.route_params.item("method_name"),"data":data,"time":time,"sign":sign}));
		}
		if (answer == null)
		{
			answer = new Runtime.Web.App.RemoteCallAnswer(Runtime.Dict.from({"app_name":Runtime.rtl.getContext().main_module,"object_name":container.route_params.item("object_name"),"interface_name":container.route_params.item("interface_name"),"method_name":container.route_params.item("method_name")}));
		}
		var response = new Runtime.Web.App.JsonResponse(Runtime.Dict.from({"data":(answer != null) ? (answer.takeDict().intersect(Runtime.Collection.from(["app_name","object_name","interface_name","method_name","code","success_message","error_message","error_name","have_answer","response"]))) : (null)}));
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["response"]), response);
		/* Add answer cookies */
		if (container.new_cookies == null)
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["new_cookies"]), new Runtime.Dict());
		}
		if (answer.new_cookies != null)
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["new_cookies"]), container.new_cookies.concat(answer.new_cookies));
		}
		/* Add answer headers */
		if (container.new_headers == null)
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["new_headers"]), new Runtime.Collection());
		}
		if (answer.new_headers != null)
		{
			container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["new_headers"]), container.new_headers.concat(answer.new_headers));
		}
		/* HTTP code */
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["response", "http_code"]), answer.new_http_code);
		return Promise.resolve(Runtime.Collection.from([container]));
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.Routes";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
				new Runtime.Web.App.RouteList(Runtime.Dict.from({})),
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
			"ApiAction",
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		if (field_name == "ApiAction")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.Web.App.Route(Runtime.Dict.from({"uri":"/api/{app_name}/{object_name}/{interface_name}/{method_name}/","name":"api:route"})),
				]),
			});
		}
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.Routes);
window["Runtime.Web.App.Routes"] = Runtime.Web.App.Routes;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.Routes;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.SeoModel = function()
{
	Runtime.BaseStruct.apply(this, arguments);
};
Runtime.Web.App.SeoModel.prototype = Object.create(Runtime.BaseStruct.prototype);
Runtime.Web.App.SeoModel.prototype.constructor = Runtime.Web.App.SeoModel;
Object.assign(Runtime.Web.App.SeoModel.prototype,
{
	_init: function()
	{
		var defProp = use('Runtime.rtl').defProp;
		var a = Object.getOwnPropertyNames(this);
		this.breadcrumbs = null;
		this.og_type = "";
		this.og_image = "";
		this.og_site_name = "";
		this.og_publisher = "";
		this.robots = null;
		this.article_tags = null;
		this.keywords = null;
		this.published = null;
		this.modified = null;
		this.meta_tags = null;
		Runtime.BaseStruct.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.SeoModel";
	},
});
Object.assign(Runtime.Web.App.SeoModel, Runtime.BaseStruct);
Object.assign(Runtime.Web.App.SeoModel,
{
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.SeoModel";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseStruct";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&3)==3)
		{
			a.push("breadcrumbs");
			a.push("og_type");
			a.push("og_image");
			a.push("og_site_name");
			a.push("og_publisher");
			a.push("robots");
			a.push("article_tags");
			a.push("keywords");
			a.push("published");
			a.push("modified");
			a.push("meta_tags");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "breadcrumbs") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["Runtime.Dict"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "og_type") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "og_image") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "og_site_name") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "og_publisher") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "robots") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "article_tags") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "keywords") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["string"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "published") return Dict.from({
			"t": "DateTime",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "modified") return Dict.from({
			"t": "DateTime",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "meta_tags") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["Runtime.Dict"],
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.SeoModel);
window["Runtime.Web.App.SeoModel"] = Runtime.Web.App.SeoModel;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.SeoModel;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.WebApp = function()
{
	Runtime.BaseDriver.apply(this, arguments);
};
Runtime.Web.App.WebApp.prototype = Object.create(Runtime.BaseDriver.prototype);
Runtime.Web.App.WebApp.prototype.constructor = Runtime.Web.App.WebApp;
Object.assign(Runtime.Web.App.WebApp.prototype,
{
	/**
	 * Start driver
	 */
	startDriver: async function()
	{
		await Runtime.BaseDriver.prototype.startDriver.bind(this)();
		/* Get routes */
		this.routes = Runtime.Context.getSubEntities(Runtime.rtl.getContext().entities, "Runtime.Web.App.RouteList", "Runtime.Web.App.Route");
		this.route_prefix = Runtime.rtl.getContext().env("X-ROUTE-PREFIX", "");
		/* Add mouse listener */
		var body = document.getElementsByTagName("body")[0];
		body.addEventListener("click", Runtime.Web.App.WebApp.js_click);
		
		/* Add history listener */
		window.onpopstate = Runtime.Web.App.WebApp.js_onpopstate;
	},
	/**
	 * Render request
	 */
	renderRequest: async function(request)
	{
		var route = null;
		var params = null;
		/* Search route */
		var res = this.findRoute(request);
		route = res.item(0);
		params = res.item(1);
		var render = Runtime.rtl.getContext().getDriver("RenderDriver");
		/* Create render container  */
		var container = new Runtime.Web.App.RenderContainer(Runtime.Dict.from({"request":request,"route":route,"route_params":params,"layout":(render != null) ? (render.layout) : (null)}));
		/* Render container */
		container = await this.constructor.callRenderChain(container);
		/* Result */
		return Promise.resolve(container);
	},
	/**
	 * Find route
	 */
	findRoute: function(request)
	{
		var route = null;
		var params = null;
		var request_uri = request.uri;
		var route_prefix = request.route_prefix;
		request_uri = this.constructor.splitRoutePrefix(request_uri, route_prefix);
		if (request_uri === null)
		{
			return Runtime.Collection.from([route,params]);
		}
		/* Find route */
		for (var i = 0;i < this.routes.count();i++)
		{
			var info = this.routes.item(i);
			var matches = Runtime.re.matchAll(info.uri_match, request_uri);
			if (matches != null)
			{
				matches = matches.get(0, null);
				if (matches)
				{
					matches = matches.removeFirstIm();
				}
				params = info.constructor.getParams(matches, info);
				route = info;
				break;
			}
		}
		return Runtime.Collection.from([route,params]);
	},
	/**
	 * Open url
	 */
	openUrl: async function(href)
	{
		if (href == undefined) href = "/";
		var obj = { "href": href, };
		history.pushState(obj, "", href);
		this.history.pushValue(href);
		await this.renderPage(href);
	},
	/**
	 * Render page
	 */
	renderPage: async function(url)
	{
		if (url == undefined) url = "/";
		var host = "";
		var method = "";
		var protocol = "";
		host = window.location.hostname;
		protocol = window.location.protocol.substr(0, window.location.protocol.length - 1);
		var pos = Runtime.rs.strpos(url, "?");
		var uri = (pos >= 0) ? (Runtime.rs.substr(url, 0, pos)) : (url);
		var get = (pos >= 0) ? (Runtime.rs.substr(url, pos + 1)) : ("");
		var query = new Runtime.Map();
		if (get != "")
		{
			var arr = Runtime.rs.explode("&", get);
			arr.each((s) => 
			{
				var arr = Runtime.rs.explode("=", s);
				var key = Runtime.rtl.get(arr, 0);
				var value = Runtime.rtl.get(arr, 1);
				var keys = this.constructor.getQueryKeys(key);
				query = Runtime.rtl.setAttr(query, keys, value);
			});
		}
		var request = new Runtime.Web.App.Request(Runtime.Dict.from({"uri":uri,"host":host,"protocol":protocol,"query":query.toDict(),"route_prefix":this.route_prefix}));
		/* Render request */
		var container = await this.renderRequest(request);
		/* Render container */
		Runtime.rtl.getContext().getDriver("RenderDriver").setComponents(Runtime.Collection.from([container.layout.layout_class,container.layout.page_class])).setLayout(container.layout).repaint();
		/* Change title */
		var title = this.constructor.callTitleChain(container.layout, container.layout.title);
		document.title = title;
	},
	_init: function()
	{
		this.routes = null;
		this.history = new Runtime.Vector();
		this.route_prefix = "";
		Runtime.BaseDriver.prototype._init.call(this);
	},
	getClassName: function()
	{
		return "Runtime.Web.App.WebApp";
	},
});
Object.assign(Runtime.Web.App.WebApp, Runtime.BaseDriver);
Object.assign(Runtime.Web.App.WebApp,
{
	RENDER_CHAIN: "Runtime.Web.App.Render",
	TITLE_CHAIN: "Runtime.Web.App.Title",
	EXTERNAL_BUS_CHAIN: "Runtime.Web.App.ExternalBus",
	RENDER_CHAIN_START: 500,
	RENDER_CHAIN_CREATE_LAYOUT_MODEL: 950,
	RENDER_CHAIN_CHANGE_LAYOUT_MODEL: 1000,
	RENDER_CHAIN_SET_FRONTEND_ENVIROMENTS: 1500,
	RENDER_CHAIN_SET_FRONTEND_STORAGE: 1500,
	RENDER_CHAIN_CALL_ROUTE_BEFORE: 2000,
	RENDER_CHAIN_CALL_ROUTE_MIDDLEWARE: 2500,
	RENDER_CHAIN_CALL_ROUTE: 3000,
	RENDER_CHAIN_CALL_PAGE_NOT_FOUND: 3100,
	RENDER_CHAIN_CALL_ROUTE_AFTER: 3500,
	RENDER_CHAIN_RESPONSE_BEFORE: 4000,
	RENDER_CHAIN_LAYOUT: 4300,
	RENDER_CHAIN_RESPONSE: 4500,
	RENDER_CHAIN_RESPONSE_AFTER: 5000,
	/**
	 * Init app
	 */
	appInit: function(c)
	{
		return c.constructor.appInit(c);
	},
	/**
	 * Start app
	 */
	appStart: async function(c)
	{
		return Promise.resolve(await c.constructor.appStart(c));
	},
	/**
	 * Web App Run
	 */
	appRun: async function()
	{
		var root_model = window.document.querySelector("#root_model").value;
		root_model = Runtime.rs.base64_decode_url(root_model);
		var layout = Runtime.rtl.json_decode(root_model);
		Runtime.rtl.getContext().getDriver("RenderDriver").setComponents(Runtime.Collection.from([layout.layout_class,layout.page_class])).setLayout(layout).setupCSS(window.document.querySelector("#root_style")).setupController("root", window.document.querySelector("#root"), layout.layout_class, Runtime.Collection.from([])).repaint();
	},
	/**
	 * Get query keys
	 */
	getQueryKeys: function(key)
	{
		key = Runtime.rs.replace("]", "", key);
		var arr = Runtime.rs.split("\\[", key);
		return arr;
	},
	/**
	 * JS Click Event
	 */
	js_click: function(e)
	{
		Runtime.rtl.setContext(Runtime.rtl.getContext());
		var web_app = Runtime.rtl.getContext().getDriver("WebApp");
		var elem = e.target;
		
		if (elem.tagName == "A")
		{
			var target = elem.getAttribute("target");
			var href = elem.getAttribute("href");
			if (target == null)
			{
				e.preventDefault();
				(async () => {
					try { await web_app.openUrl(href); }
					catch (e) { console.log(e.stack); }
				})();
				return false;
			}
		}
	},
	/**
	 * JS onpopstate event
	 */
	js_onpopstate: function(e)
	{
		Runtime.rtl.setContext(Runtime.rtl.getContext());
		var web_app = Runtime.rtl.getContext().getDriver("WebApp");
		if (web_app.history.count() == 0)
		{
			document.location = document.location;
		}
		else if (e.state != null && typeof e.state.href == "string")
		{
			web_app.history.pop();
			(async () => {
				try { await web_app.renderPage(e.state.href); }
				catch (e) { console.log(e.stack); }
			})();
		}
		else
		{
			web_app.history.pop();
			(async () => {
				try { await web_app.renderPage("/"); }
				catch (e) { console.log(e.stack); }
			})();
		}
	},
	/**
	 * Split route prefix
	 */
	splitRoutePrefix: function(request_uri, route_prefix)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.Web.App.WebApp.splitRoutePrefix", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var prefix_len = Runtime.rs.strlen(route_prefix);
		if (prefix_len > 0)
		{
			var pos = Runtime.rs.search(request_uri, route_prefix);
			if (pos == -1)
			{
				var __memorize_value = null;
				Runtime.rtl._memorizeSave("Runtime.Web.App.WebApp.splitRoutePrefix", arguments, __memorize_value);
				return __memorize_value;
			}
			request_uri = Runtime.rs.substr(request_uri, prefix_len);
		}
		if (request_uri == "")
		{
			request_uri = "/";
		}
		var __memorize_value = request_uri;
		Runtime.rtl._memorizeSave("Runtime.Web.App.WebApp.splitRoutePrefix", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Returns middlewares
	 */
	getMiddlewares: function(class_name, method_name, middleware_class_name)
	{
		var __memorize_value = Runtime.rtl._memorizeValue("Runtime.Web.App.WebApp.getMiddlewares", arguments);
		if (__memorize_value != Runtime.rtl._memorize_not_found) return __memorize_value;
		var middlewares = Runtime.Collection.from([]);
		/* Get middleware from class */
		var info = Runtime.rtl.methodApply(class_name, "getClassInfo");
		middlewares = middlewares.concatIm(Runtime.rtl.get(info, "annotations").filter(Runtime.lib.isInstance(middleware_class_name)));
		/* Get middleware from method */
		var info = Runtime.rtl.methodApply(class_name, "getMethodInfoByName", Runtime.Collection.from([method_name]));
		middlewares = middlewares.concatIm(Runtime.rtl.get(info, "annotations").filter(Runtime.lib.isInstance(middleware_class_name)));
		var __memorize_value = middlewares;
		Runtime.rtl._memorizeSave("Runtime.Web.App.WebApp.getMiddlewares", arguments, __memorize_value);
		return __memorize_value;
	},
	/**
	 * Render chain
	 * Create layout model
	 */
	renderChain_CreateLayoutModel: function(container)
	{
		if (container == null)
		{
			return Runtime.Collection.from([container]);
		}
		if (container.isResponseExists())
		{
			return Runtime.Collection.from([container]);
		}
		/* Create LayoutModel */
		container = Runtime.rtl.setAttr(container, Runtime.Collection.from(["layout"]), new Runtime.Web.App.LayoutModel(Runtime.Dict.from({"uri":this.splitRoutePrefix(container.request.uri, container.request.route_prefix),"f_inc":Runtime.rtl.getContext().config(Runtime.Collection.from(["Runtime.Web.App","f_inc"]), "1"),"full_uri":container.request.uri,"route":container.route,"route_prefix":container.request.route_prefix,"route_params":container.route_params,"model":container.layout.model})));
		return Runtime.Collection.from([container]);
	},
	/**
	 * Render chain
	 * Call route middlewares
	 */
	renderChain_CallRouteMiddleware: async function(container)
	{
		if (container == null)
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (container.isResponseExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (container.isPageExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (!container.isRouteExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		/* Get middleware from class */
		var middlewares = this.getMiddlewares(container.route.class_name, container.route.class_method_name, "Runtime.Web.App.RouteMiddleware");
		/* Run each middleware */
		for (var i = 0;i < middlewares.count(i);i++)
		{
			var m = middlewares.item(i);
			var arr = Runtime.rs.split("::", m.value);
			var class_name = arr.get(0, "");
			var method_name = arr.get(1, "");
			var f = Runtime.rtl.method(class_name, method_name);
			/* Run method */
			var res = await f(container);
			container = Runtime.rtl.get(res, 0);
		}
		return Promise.resolve(Runtime.Collection.from([container]));
	},
	/**
	 * Render chain
	 * Call route
	 */
	renderChain_CallRoute: async function(container)
	{
		if (container == null)
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (container.isResponseExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (container.isPageExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		if (!container.isRouteExists())
		{
			return Promise.resolve(Runtime.Collection.from([container]));
		}
		var __v0 = new Runtime.Monad(await Runtime.rtl.methodApplyAsync(container.route.class_name, container.route.class_method_name, Runtime.Collection.from([container])));
		__v0 = __v0.attr(0);
		container = __v0.value();
		return Promise.resolve(Runtime.Collection.from([container]));
	},
	/**
	 * Render chain
	 */
	callRenderChain: async function(container)
	{
		var __v0 = new Runtime.Monad(await Runtime.rtl.getContext().chainAsync(this.RENDER_CHAIN, Runtime.Collection.from([container])));
		__v0 = __v0.attr(0);
		container = __v0.value();
		return Promise.resolve(container);
	},
	/**
	 * Returns title
	 */
	callTitleChain: function(layout, title)
	{
		var __v0 = new Runtime.Monad(Runtime.rtl.getContext().chain(this.TITLE_CHAIN, Runtime.Collection.from([layout,title])));
		__v0 = __v0.attr(1);
		title = __v0.value();
		return title;
	},
	/**
	 * Returns layout CSS
	 */
	getLayoutCSS: function(layout)
	{
		var render = Runtime.rtl.getContext().getDriver("RenderDriver");
		/* Get components */
		var components = render.default_components.concat(Runtime.Collection.from([layout.layout_class,layout.page_class])).filter(Runtime.lib.equalNot("")).removeDuplicatesIm();
		/* Returns css from components */
		var css = render.getCSS(components);
		return css;
	},
	/**
	 * Remote bus call
	 * @param Dict items
	 * @return RemoteCallAnswer
	 */
	externalBusCall: async function(items)
	{
		/* Set default params */
		items = items.copy(Runtime.Dict.from({"app_name":items.get("app_name", "self"),"interface_name":items.get("interface_name", "default")}));
		/* Change api request */
		var request = new Runtime.Web.App.RemoteCallRequest(items);
		var res = await Runtime.rtl.getContext().chainAsync(this.EXTERNAL_BUS_CHAIN, Runtime.Collection.from([request]));
		var __v0 = new Runtime.Monad(Runtime.rtl.get(res, 0));
		__v0 = __v0.monad(Runtime.rtl.m_to("Runtime.Web.App.RemoteCallRequest", null));
		request = __v0.value();
		/* Send request */
		var bus = Runtime.rtl.getContext().getDriver("external_bus");
		var answer = await bus.remoteBusCall(request);
		return Promise.resolve(answer);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.WebApp";
	},
	getParentClassName: function()
	{
		return "Runtime.BaseDriver";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
				new Runtime.LambdaChainClass(Runtime.Dict.from({})),
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		if ((f&2)==2)
		{
			a.push("routes");
			a.push("history");
			a.push("route_prefix");
		}
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		if (field_name == "RENDER_CHAIN") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "TITLE_CHAIN") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "EXTERNAL_BUS_CHAIN") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_START") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CREATE_LAYOUT_MODEL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CHANGE_LAYOUT_MODEL") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_SET_FRONTEND_ENVIROMENTS") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_SET_FRONTEND_STORAGE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CALL_ROUTE_BEFORE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CALL_ROUTE_MIDDLEWARE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CALL_ROUTE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CALL_PAGE_NOT_FOUND") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_CALL_ROUTE_AFTER") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_RESPONSE_BEFORE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_LAYOUT") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_RESPONSE") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "RENDER_CHAIN_RESPONSE_AFTER") return Dict.from({
			"t": "int",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "routes") return Dict.from({
			"t": "Runtime.Collection",
			"s": ["Runtime.Web.App.Route"],
			"annotations": Collection.from([
			]),
		});
		if (field_name == "history") return Dict.from({
			"t": "Runtime.Vector",
			"annotations": Collection.from([
			]),
		});
		if (field_name == "route_prefix") return Dict.from({
			"t": "string",
			"annotations": Collection.from([
			]),
		});
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
			"renderChain_CreateLayoutModel",
			"renderChain_CallRouteMiddleware",
			"renderChain_CallRoute",
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		if (field_name == "renderChain_CreateLayoutModel")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":this.RENDER_CHAIN,"pos":this.RENDER_CHAIN_CREATE_LAYOUT_MODEL})),
				]),
			});
		}
		if (field_name == "renderChain_CallRouteMiddleware")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":this.RENDER_CHAIN,"pos":this.RENDER_CHAIN_CALL_ROUTE_MIDDLEWARE,"is_async":true})),
				]),
			});
		}
		if (field_name == "renderChain_CallRoute")
		{
			var Collection = Runtime.Collection;
			var Dict = Runtime.Dict;
			return Dict.from({
				"annotations": Collection.from([
					new Runtime.LambdaChain(Runtime.Dict.from({"name":this.RENDER_CHAIN,"pos":this.RENDER_CHAIN_CALL_ROUTE,"is_async":true})),
				]),
			});
		}
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.WebApp);
window["Runtime.Web.App.WebApp"] = Runtime.Web.App.WebApp;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.WebApp;
"use strict;"
/*!
 *  Bayrell Runtime Library
 *
 *  (c) Copyright 2016-2020 "Ildar Bikmamatov" <support@bayrell.org>
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
if (typeof Runtime == 'undefined') Runtime = {};
if (typeof Runtime.Web == 'undefined') Runtime.Web = {};
if (typeof Runtime.Web.App == 'undefined') Runtime.Web.App = {};
Runtime.Web.App.ModuleDescription = function()
{
};
Object.assign(Runtime.Web.App.ModuleDescription.prototype,
{
	getClassName: function()
	{
		return "Runtime.Web.App.ModuleDescription";
	},
});
Object.assign(Runtime.Web.App.ModuleDescription,
{
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleName: function()
	{
		return "Runtime.Web.App";
	},
	/**
	 * Returns module name
	 * @return string
	 */
	getModuleVersion: function()
	{
		return "0.11.0";
	},
	/**
	 * Returns required modules
	 * @return Dict<string>
	 */
	requiredModules: function()
	{
		return Runtime.Dict.from({"Runtime":">=0.3","Runtime.Web":"*"});
	},
	/**
	 * Returns enities
	 */
	entities: function()
	{
		return Runtime.Collection.from([new Runtime.Entity(Runtime.Dict.from({"name":"Runtime.Web.App.WebApp"})),new Runtime.Driver(Runtime.Dict.from({"name":"external_bus","value":"Runtime.Web.App.ExternalBusDriver"}))]);
	},
	/* ======================= Class Init Functions ======================= */
	getCurrentNamespace: function()
	{
		return "Runtime.Web.App";
	},
	getCurrentClassName: function()
	{
		return "Runtime.Web.App.ModuleDescription";
	},
	getParentClassName: function()
	{
		return "";
	},
	getClassInfo: function()
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return Dict.from({
			"annotations": Collection.from([
			]),
		});
	},
	getFieldsList: function(f)
	{
		var a = [];
		if (f==undefined) f=0;
		return Runtime.Collection.from(a);
	},
	getFieldInfoByName: function(field_name)
	{
		var Collection = Runtime.Collection;
		var Dict = Runtime.Dict;
		return null;
	},
	getMethodsList: function(f)
	{
		if (f==undefined) f=0;
		var a = [];
		if ((f&4)==4) a=[
		];
		return Runtime.Collection.from(a);
	},
	getMethodInfoByName: function(field_name)
	{
		return null;
	},
});
Runtime.rtl.defClass(Runtime.Web.App.ModuleDescription);
window["Runtime.Web.App.ModuleDescription"] = Runtime.Web.App.ModuleDescription;
if (typeof module != "undefined" && typeof module.exports != "undefined") module.exports = Runtime.Web.App.ModuleDescription;