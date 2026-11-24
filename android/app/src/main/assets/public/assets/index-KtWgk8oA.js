// \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod, mod.exports), cb = null), mod.exports);
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
// \0vite/modulepreload-polyfill.js
(function polyfill() {
	const relList = document.createElement("link").relList;
	if (relList && relList.supports && relList.supports("modulepreload")) return;
	for (const link of document.querySelectorAll("link[rel=\"modulepreload\"]")) processPreload(link);
	new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type !== "childList") continue;
			for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
		}
	}).observe(document, {
		childList: true,
		subtree: true
	});
	function getFetchOpts(link) {
		const fetchOpts = {};
		if (link.integrity) fetchOpts.integrity = link.integrity;
		if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
		if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
		else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
		else fetchOpts.credentials = "same-origin";
		return fetchOpts;
	}
	function processPreload(link) {
		if (link.ep) return;
		link.ep = true;
		const fetchOpts = getFetchOpts(link);
		fetch(link.href, fetchOpts);
	}
})();
// node_modules/scheduler/cjs/scheduler.production.js
/**
* @license React
* scheduler.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_scheduler_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	function push(heap, node) {
		var index = heap.length;
		heap.push(node);
		a: for (; 0 < index;) {
			var parentIndex = index - 1 >>> 1, parent = heap[parentIndex];
			if (0 < compare(parent, node)) heap[parentIndex] = node, heap[index] = parent, index = parentIndex;
			else break a;
		}
	}
	function peek(heap) {
		return 0 === heap.length ? null : heap[0];
	}
	function pop(heap) {
		if (0 === heap.length) return null;
		var first = heap[0], last = heap.pop();
		if (last !== first) {
			heap[0] = last;
			a: for (var index = 0, length = heap.length, halfLength = length >>> 1; index < halfLength;) {
				var leftIndex = 2 * (index + 1) - 1, left = heap[leftIndex], rightIndex = leftIndex + 1, right = heap[rightIndex];
				if (0 > compare(left, last)) rightIndex < length && 0 > compare(right, left) ? (heap[index] = right, heap[rightIndex] = last, index = rightIndex) : (heap[index] = left, heap[leftIndex] = last, index = leftIndex);
				else if (rightIndex < length && 0 > compare(right, last)) heap[index] = right, heap[rightIndex] = last, index = rightIndex;
				else break a;
			}
		}
		return first;
	}
	function compare(a, b) {
		var diff = a.sortIndex - b.sortIndex;
		return 0 !== diff ? diff : a.id - b.id;
	}
	exports.unstable_now = void 0;
	if ("object" === typeof performance && "function" === typeof performance.now) {
		var localPerformance = performance;
		exports.unstable_now = function() {
			return localPerformance.now();
		};
	} else {
		var localDate = Date, initialTime = localDate.now();
		exports.unstable_now = function() {
			return localDate.now() - initialTime;
		};
	}
	var taskQueue = [];
	var timerQueue = [];
	var taskIdCounter = 1;
	var currentTask = null;
	var currentPriorityLevel = 3;
	var isPerformingWork = !1;
	var isHostCallbackScheduled = !1;
	var isHostTimeoutScheduled = !1;
	var needsPaint = !1;
	var localSetTimeout = "function" === typeof setTimeout ? setTimeout : null;
	var localClearTimeout = "function" === typeof clearTimeout ? clearTimeout : null;
	var localSetImmediate = "undefined" !== typeof setImmediate ? setImmediate : null;
	function advanceTimers(currentTime) {
		for (var timer = peek(timerQueue); null !== timer;) {
			if (null === timer.callback) pop(timerQueue);
			else if (timer.startTime <= currentTime) pop(timerQueue), timer.sortIndex = timer.expirationTime, push(taskQueue, timer);
			else break;
			timer = peek(timerQueue);
		}
	}
	function handleTimeout(currentTime) {
		isHostTimeoutScheduled = !1;
		advanceTimers(currentTime);
		if (!isHostCallbackScheduled) if (null !== peek(taskQueue)) isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline());
		else {
			var firstTimer = peek(timerQueue);
			null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
		}
	}
	var isMessageLoopRunning = !1;
	var taskTimeoutID = -1;
	var frameInterval = 5;
	var startTime = -1;
	function shouldYieldToHost() {
		return needsPaint ? !0 : exports.unstable_now() - startTime < frameInterval ? !1 : !0;
	}
	function performWorkUntilDeadline() {
		needsPaint = !1;
		if (isMessageLoopRunning) {
			var currentTime = exports.unstable_now();
			startTime = currentTime;
			var hasMoreWork = !0;
			try {
				a: {
					isHostCallbackScheduled = !1;
					isHostTimeoutScheduled && (isHostTimeoutScheduled = !1, localClearTimeout(taskTimeoutID), taskTimeoutID = -1);
					isPerformingWork = !0;
					var previousPriorityLevel = currentPriorityLevel;
					try {
						b: {
							advanceTimers(currentTime);
							for (currentTask = peek(taskQueue); null !== currentTask && !(currentTask.expirationTime > currentTime && shouldYieldToHost());) {
								var callback = currentTask.callback;
								if ("function" === typeof callback) {
									currentTask.callback = null;
									currentPriorityLevel = currentTask.priorityLevel;
									var continuationCallback = callback(currentTask.expirationTime <= currentTime);
									currentTime = exports.unstable_now();
									if ("function" === typeof continuationCallback) {
										currentTask.callback = continuationCallback;
										advanceTimers(currentTime);
										hasMoreWork = !0;
										break b;
									}
									currentTask === peek(taskQueue) && pop(taskQueue);
									advanceTimers(currentTime);
								} else pop(taskQueue);
								currentTask = peek(taskQueue);
							}
							if (null !== currentTask) hasMoreWork = !0;
							else {
								var firstTimer = peek(timerQueue);
								null !== firstTimer && requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
								hasMoreWork = !1;
							}
						}
						break a;
					} finally {
						currentTask = null, currentPriorityLevel = previousPriorityLevel, isPerformingWork = !1;
					}
					hasMoreWork = void 0;
				}
			} finally {
				hasMoreWork ? schedulePerformWorkUntilDeadline() : isMessageLoopRunning = !1;
			}
		}
	}
	var schedulePerformWorkUntilDeadline;
	if ("function" === typeof localSetImmediate) schedulePerformWorkUntilDeadline = function() {
		localSetImmediate(performWorkUntilDeadline);
	};
	else if ("undefined" !== typeof MessageChannel) {
		var channel = new MessageChannel(), port = channel.port2;
		channel.port1.onmessage = performWorkUntilDeadline;
		schedulePerformWorkUntilDeadline = function() {
			port.postMessage(null);
		};
	} else schedulePerformWorkUntilDeadline = function() {
		localSetTimeout(performWorkUntilDeadline, 0);
	};
	function requestHostTimeout(callback, ms) {
		taskTimeoutID = localSetTimeout(function() {
			callback(exports.unstable_now());
		}, ms);
	}
	exports.unstable_IdlePriority = 5;
	exports.unstable_ImmediatePriority = 1;
	exports.unstable_LowPriority = 4;
	exports.unstable_NormalPriority = 3;
	exports.unstable_Profiling = null;
	exports.unstable_UserBlockingPriority = 2;
	exports.unstable_cancelCallback = function(task) {
		task.callback = null;
	};
	exports.unstable_forceFrameRate = function(fps) {
		0 > fps || 125 < fps ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : frameInterval = 0 < fps ? Math.floor(1e3 / fps) : 5;
	};
	exports.unstable_getCurrentPriorityLevel = function() {
		return currentPriorityLevel;
	};
	exports.unstable_next = function(eventHandler) {
		switch (currentPriorityLevel) {
			case 1:
			case 2:
			case 3:
				var priorityLevel = 3;
				break;
			default: priorityLevel = currentPriorityLevel;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_requestPaint = function() {
		needsPaint = !0;
	};
	exports.unstable_runWithPriority = function(priorityLevel, eventHandler) {
		switch (priorityLevel) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: priorityLevel = 3;
		}
		var previousPriorityLevel = currentPriorityLevel;
		currentPriorityLevel = priorityLevel;
		try {
			return eventHandler();
		} finally {
			currentPriorityLevel = previousPriorityLevel;
		}
	};
	exports.unstable_scheduleCallback = function(priorityLevel, callback, options) {
		var currentTime = exports.unstable_now();
		"object" === typeof options && null !== options ? (options = options.delay, options = "number" === typeof options && 0 < options ? currentTime + options : currentTime) : options = currentTime;
		switch (priorityLevel) {
			case 1:
				var timeout = -1;
				break;
			case 2:
				timeout = 250;
				break;
			case 5:
				timeout = 1073741823;
				break;
			case 4:
				timeout = 1e4;
				break;
			default: timeout = 5e3;
		}
		timeout = options + timeout;
		priorityLevel = {
			id: taskIdCounter++,
			callback,
			priorityLevel,
			startTime: options,
			expirationTime: timeout,
			sortIndex: -1
		};
		options > currentTime ? (priorityLevel.sortIndex = options, push(timerQueue, priorityLevel), null === peek(taskQueue) && priorityLevel === peek(timerQueue) && (isHostTimeoutScheduled ? (localClearTimeout(taskTimeoutID), taskTimeoutID = -1) : isHostTimeoutScheduled = !0, requestHostTimeout(handleTimeout, options - currentTime))) : (priorityLevel.sortIndex = timeout, push(taskQueue, priorityLevel), isHostCallbackScheduled || isPerformingWork || (isHostCallbackScheduled = !0, isMessageLoopRunning || (isMessageLoopRunning = !0, schedulePerformWorkUntilDeadline())));
		return priorityLevel;
	};
	exports.unstable_shouldYield = shouldYieldToHost;
	exports.unstable_wrapCallback = function(callback) {
		var parentPriorityLevel = currentPriorityLevel;
		return function() {
			var previousPriorityLevel = currentPriorityLevel;
			currentPriorityLevel = parentPriorityLevel;
			try {
				return callback.apply(this, arguments);
			} finally {
				currentPriorityLevel = previousPriorityLevel;
			}
		};
	};
}));
// node_modules/scheduler/index.js
var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_scheduler_production();
}));
// node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	};
	var assign = Object.assign;
	var emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	};
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result, thenable = ctor();
			thenable.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject, void 0 === thenable.status && (thenable.status = "fulfilled", thenable.value = moduleObject);
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error, void 0 === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			});
			-1 === payload._status && (payload._status = 0, payload._result = thenable);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	function startTransition(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function addTransitionType(type) {
		var transition = ReactSharedInternals.T;
		if (null !== transition) {
			var transitionTypes = transition.types;
			null === transitionTypes ? transition.types = [type] : -1 === transitionTypes.indexOf(type) && transitionTypes.push(type);
		} else startTransition(addTransitionType.bind(null, type));
	}
	var Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.ViewTransition = REACT_VIEW_TRANSITION_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.addTransitionType = addTransitionType;
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = startTransition;
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.3.1";
}));
// node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
// node_modules/react-dom/cjs/react-dom.production.js
/**
* @license React
* react-dom.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var React = require_react();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function noop() {}
	var Internals = {
		d: {
			f: noop,
			r: function() {
				throw Error(formatProdErrorMessage(522));
			},
			D: noop,
			C: noop,
			L: noop,
			m: noop,
			X: noop,
			S: noop,
			M: noop
		},
		p: 0,
		findDOMNode: null
	};
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var REACT_OPTIMISTIC_KEY = Symbol.for("react.optimistic_key");
	function createPortal$1(children, containerInfo, implementation) {
		var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		return {
			$$typeof: REACT_PORTAL_TYPE,
			key: null == key ? null : key === REACT_OPTIMISTIC_KEY ? REACT_OPTIMISTIC_KEY : "" + key,
			children,
			containerInfo,
			implementation
		};
	}
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function getCrossOriginStringAs(as, input) {
		if ("font" === as) return "";
		if ("string" === typeof input) return "use-credentials" === input ? input : "";
	}
	exports.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = Internals;
	exports.browser = function(reason) {
		return {
			$$typeof: REACT_RECOVERABLE_TYPE,
			_reason: reason
		};
	};
	exports.createPortal = function(children, container) {
		var key = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
		if (!container || 1 !== container.nodeType && 9 !== container.nodeType && 11 !== container.nodeType) throw Error(formatProdErrorMessage(299));
		return createPortal$1(children, container, null, key);
	};
	exports.flushSync = function(fn) {
		var previousTransition = ReactSharedInternals.T, previousUpdatePriority = Internals.p;
		try {
			if (ReactSharedInternals.T = null, Internals.p = 2, fn) return fn();
		} finally {
			ReactSharedInternals.T = previousTransition, Internals.p = previousUpdatePriority, Internals.d.f();
		}
	};
	exports.preconnect = function(href, options) {
		"string" === typeof href && (options ? (options = options.crossOrigin, options = "string" === typeof options ? "use-credentials" === options ? options : "" : void 0) : options = null, Internals.d.C(href, options));
	};
	exports.prefetchDNS = function(href) {
		"string" === typeof href && Internals.d.D(href);
	};
	exports.preinit = function(href, options) {
		if ("string" === typeof href && options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin), integrity = "string" === typeof options.integrity ? options.integrity : void 0, fetchPriority = "string" === typeof options.fetchPriority ? options.fetchPriority : void 0;
			"style" === as ? Internals.d.S(href, "string" === typeof options.precedence ? options.precedence : void 0, {
				crossOrigin,
				integrity,
				fetchPriority
			}) : "script" === as && Internals.d.X(href, {
				crossOrigin,
				integrity,
				fetchPriority,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0
			});
		}
	};
	exports.preinitModule = function(href, options) {
		if ("string" === typeof href) if ("object" === typeof options && null !== options) {
			if (null == options.as || "script" === options.as) {
				var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
				Internals.d.M(href, {
					crossOrigin,
					integrity: "string" === typeof options.integrity ? options.integrity : void 0,
					nonce: "string" === typeof options.nonce ? options.nonce : void 0,
					fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
				});
			}
		} else options ?? Internals.d.M(href);
	};
	exports.preload = function(href, options) {
		if ("string" === typeof href && "object" === typeof options && null !== options && "string" === typeof options.as) {
			var as = options.as, crossOrigin = getCrossOriginStringAs(as, options.crossOrigin);
			Internals.d.L(href, as, {
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				type: "string" === typeof options.type ? options.type : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0,
				referrerPolicy: "string" === typeof options.referrerPolicy ? options.referrerPolicy : void 0,
				imageSrcSet: "string" === typeof options.imageSrcSet ? options.imageSrcSet : void 0,
				imageSizes: "string" === typeof options.imageSizes ? options.imageSizes : void 0,
				media: "string" === typeof options.media ? options.media : void 0
			});
		}
	};
	exports.preloadModule = function(href, options) {
		if ("string" === typeof href) if (options) {
			var crossOrigin = getCrossOriginStringAs(options.as, options.crossOrigin);
			Internals.d.m(href, {
				as: "string" === typeof options.as && "script" !== options.as ? options.as : void 0,
				crossOrigin,
				integrity: "string" === typeof options.integrity ? options.integrity : void 0,
				nonce: "string" === typeof options.nonce ? options.nonce : void 0,
				fetchPriority: "string" === typeof options.fetchPriority ? options.fetchPriority : void 0
			});
		} else Internals.d.m(href);
	};
	exports.requestFormReset = function(form) {
		Internals.d.r(form);
	};
	exports.unstable_batchedUpdates = function(fn, a) {
		return fn(a);
	};
	exports.useFormState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useFormState(action, initialState, permalink);
	};
	exports.useFormStatus = function() {
		return ReactSharedInternals.H.useHostTransitionStatus();
	};
	exports.version = "19.3.1";
}));
// node_modules/react-dom/index.js
var require_react_dom = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_production();
}));
// node_modules/react-dom/cjs/react-dom-client.production.js
/**
* @license React
* react-dom-client.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_dom_client_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var Scheduler = require_scheduler();
	var React = require_react();
	var ReactDOM = require_react_dom();
	function formatProdErrorMessage(code) {
		var url = "https://react.dev/errors/" + code;
		if (1 < arguments.length) {
			url += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var i = 2; i < arguments.length; i++) url += "&args[]=" + encodeURIComponent(arguments[i]);
		}
		return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function isValidContainer(node) {
		return !(!node || 1 !== node.nodeType && 9 !== node.nodeType && 11 !== node.nodeType);
	}
	function getNearestMountedFiber(fiber) {
		for (var node = fiber, nextNode = node; nextNode && !nextNode.alternate;) node = nextNode, 0 !== (node.flags & 4098) && (fiber = node.return), nextNode = node.return;
		for (; node.return;) node = node.return;
		return 3 === node.tag ? fiber : null;
	}
	function getSuspenseInstanceFromFiber(fiber) {
		if (13 === fiber.tag) {
			var suspenseState = fiber.memoizedState;
			null === suspenseState && (fiber = fiber.alternate, null !== fiber && (suspenseState = fiber.memoizedState));
			if (null !== suspenseState) return suspenseState.dehydrated;
		}
		return null;
	}
	function getActivityInstanceFromFiber(fiber) {
		if (31 === fiber.tag) {
			var activityState = fiber.memoizedState;
			null === activityState && (fiber = fiber.alternate, null !== fiber && (activityState = fiber.memoizedState));
			if (null !== activityState) return activityState.dehydrated;
		}
		return null;
	}
	function assertIsMounted(fiber) {
		if (getNearestMountedFiber(fiber) !== fiber) throw Error(formatProdErrorMessage(188));
	}
	function findCurrentFiberUsingSlowPath(fiber) {
		var alternate = fiber.alternate;
		if (!alternate) {
			alternate = getNearestMountedFiber(fiber);
			if (null === alternate) throw Error(formatProdErrorMessage(188));
			return alternate !== fiber ? null : fiber;
		}
		for (var a = fiber, b = alternate;;) {
			var parentA = a.return;
			if (null === parentA) break;
			var parentB = parentA.alternate;
			if (null === parentB) {
				b = parentA.return;
				if (null !== b) {
					a = b;
					continue;
				}
				break;
			}
			if (parentA.child === parentB.child) {
				for (parentB = parentA.child; parentB;) {
					if (parentB === a) return assertIsMounted(parentA), fiber;
					if (parentB === b) return assertIsMounted(parentA), alternate;
					parentB = parentB.sibling;
				}
				throw Error(formatProdErrorMessage(188));
			}
			if (a.return !== b.return) a = parentA, b = parentB;
			else {
				for (var didFindChild = !1, child$0 = parentA.child; child$0;) {
					if (child$0 === a) {
						didFindChild = !0;
						a = parentA;
						b = parentB;
						break;
					}
					if (child$0 === b) {
						didFindChild = !0;
						b = parentA;
						a = parentB;
						break;
					}
					child$0 = child$0.sibling;
				}
				if (!didFindChild) {
					for (child$0 = parentB.child; child$0;) {
						if (child$0 === a) {
							didFindChild = !0;
							a = parentB;
							b = parentA;
							break;
						}
						if (child$0 === b) {
							didFindChild = !0;
							b = parentB;
							a = parentA;
							break;
						}
						child$0 = child$0.sibling;
					}
					if (!didFindChild) throw Error(formatProdErrorMessage(189));
				}
			}
			if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
		}
		if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
		return a.stateNode.current === a ? fiber : alternate;
	}
	function findCurrentHostFiberImpl(node) {
		var tag = node.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		for (node = node.child; null !== node;) {
			tag = findCurrentHostFiberImpl(node);
			if (null !== tag) return tag;
			node = node.sibling;
		}
		return null;
	}
	function traverseVisibleInstancesAndTextInstances(child, searchWithinHosts, fn, a, b, c) {
		for (; null !== child;) {
			if ((5 === child.tag || 27 === child.tag || 6 === child.tag) && fn(child, a, b, c) || (22 !== child.tag || null === child.memoizedState) && (searchWithinHosts || 5 !== child.tag && 27 !== child.tag) && traverseVisibleInstancesAndTextInstances(child.child, searchWithinHosts, fn, a, b, c)) return !0;
			child = child.sibling;
		}
		return !1;
	}
	function getFragmentParentInstanceOrContainerFiber(fiber) {
		for (fiber = fiber.return; null !== fiber;) {
			if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) return fiber;
			fiber = fiber.return;
		}
		return null;
	}
	function fiberIsPortaledIntoHost(fiber) {
		var foundPortalParent = !1;
		for (fiber = fiber.return; null !== fiber;) {
			4 === fiber.tag && (foundPortalParent = !0);
			if (3 === fiber.tag || 5 === fiber.tag || 27 === fiber.tag) break;
			fiber = fiber.return;
		}
		return foundPortalParent;
	}
	function getFragmentInstanceOrTextInstanceSiblings(fiber) {
		var result = [null, null], parentHostFiber = getFragmentParentInstanceOrContainerFiber(fiber);
		if (null === parentHostFiber) return result;
		findFragmentInstanceOrTextInstanceSiblings(result, fiber, parentHostFiber.child, { foundSelf: !1 });
		return result;
	}
	function findFragmentInstanceOrTextInstanceSiblings(result, self, child, state) {
		for (; null !== child;) {
			if (child === self) state.foundSelf = !0;
			else if (5 === child.tag || 27 === child.tag || 6 === child.tag) {
				if (state.foundSelf) return result[1] = child, !0;
				result[0] = child;
			} else if ((22 !== child.tag || null === child.memoizedState) && findFragmentInstanceOrTextInstanceSiblings(result, self, child.child, state)) return !0;
			child = child.sibling;
		}
		return !1;
	}
	function getInstanceFromHostFiber(fiber) {
		switch (fiber.tag) {
			case 5:
			case 27:
			case 6: return fiber.stateNode;
			case 3: return fiber.stateNode.containerInfo;
			default: throw Error(formatProdErrorMessage(559));
		}
	}
	var searchTarget = null;
	var searchBoundary = null;
	function isFiberPrecedingCheck(child, target, boundary) {
		return child === boundary ? !0 : child === target ? (searchTarget = child, !0) : !1;
	}
	function isFiberFollowingCheck(child, target, boundary) {
		return child === boundary ? (searchBoundary = child, !1) : child === target ? (null !== searchBoundary && (searchTarget = child), !0) : !1;
	}
	function getParentForFragmentAncestors(inst) {
		if (null === inst) return null;
		do
			inst = null === inst ? null : inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag && 3 !== inst.tag);
		return inst ? inst : null;
	}
	function getLowestCommonAncestor(instA, instB, getParent) {
		for (var depthA = 0, tempA = instA; tempA; tempA = getParent(tempA)) depthA++;
		tempA = 0;
		for (var tempB = instB; tempB; tempB = getParent(tempB)) tempA++;
		for (; 0 < depthA - tempA;) instA = getParent(instA), depthA--;
		for (; 0 < tempA - depthA;) instB = getParent(instB), tempA--;
		for (; depthA--;) {
			if (instA === instB || null !== instB && instA === instB.alternate) return instA;
			instA = getParent(instA);
			instB = getParent(instB);
		}
		return null;
	}
	var assign = Object.assign;
	var REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element");
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_PORTAL_TYPE = Symbol.for("react.portal");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
	var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
	var REACT_CONSUMER_TYPE = Symbol.for("react.consumer");
	var REACT_CONTEXT_TYPE = Symbol.for("react.context");
	var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
	var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
	var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
	var REACT_MEMO_TYPE = Symbol.for("react.memo");
	var REACT_LAZY_TYPE = Symbol.for("react.lazy");
	var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
	var REACT_LEGACY_HIDDEN_TYPE = Symbol.for("react.legacy_hidden");
	var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
	var REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition");
	var REACT_RECOVERABLE_TYPE = Symbol.for("react.recoverable");
	var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference");
	function getComponentNameFromType(type) {
		if (null == type) return null;
		if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
		if ("string" === typeof type) return type;
		switch (type) {
			case REACT_FRAGMENT_TYPE: return "Fragment";
			case REACT_PROFILER_TYPE: return "Profiler";
			case REACT_STRICT_MODE_TYPE: return "StrictMode";
			case REACT_SUSPENSE_TYPE: return "Suspense";
			case REACT_SUSPENSE_LIST_TYPE: return "SuspenseList";
			case REACT_ACTIVITY_TYPE: return "Activity";
			case REACT_VIEW_TRANSITION_TYPE: return "ViewTransition";
		}
		if ("object" === typeof type) switch (type.$$typeof) {
			case REACT_PORTAL_TYPE: return "Portal";
			case REACT_CONTEXT_TYPE: return type.displayName || "Context";
			case REACT_CONSUMER_TYPE: return (type._context.displayName || "Context") + ".Consumer";
			case REACT_FORWARD_REF_TYPE:
				var innerType = type.render;
				type = type.displayName;
				type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
				return type;
			case REACT_MEMO_TYPE: return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
			case REACT_LAZY_TYPE:
				innerType = type._payload;
				type = type._init;
				try {
					return getComponentNameFromType(type(innerType));
				} catch (x) {}
		}
		return null;
	}
	var isArrayImpl = Array.isArray;
	var ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var ReactDOMSharedInternals = ReactDOM.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	var sharedNotPendingObject = {
		pending: !1,
		data: null,
		method: null,
		action: null
	};
	var valueStack = [];
	var index = -1;
	function createCursor(defaultValue) {
		return { current: defaultValue };
	}
	function pop(cursor) {
		0 > index || (cursor.current = valueStack[index], valueStack[index] = null, index--);
	}
	function push(cursor, value) {
		index++;
		valueStack[index] = cursor.current;
		cursor.current = value;
	}
	var contextStackCursor = createCursor(null);
	var contextFiberStackCursor = createCursor(null);
	var rootInstanceStackCursor = createCursor(null);
	var hostTransitionProviderCursor = createCursor(null);
	function pushHostContainer(fiber, nextRootInstance) {
		push(rootInstanceStackCursor, nextRootInstance);
		push(contextFiberStackCursor, fiber);
		push(contextStackCursor, null);
		switch (nextRootInstance.nodeType) {
			case 9:
			case 11:
				fiber = (fiber = nextRootInstance.documentElement) ? (fiber = fiber.namespaceURI) ? getOwnHostContext(fiber) : 0 : 0;
				break;
			default: if (fiber = nextRootInstance.tagName, nextRootInstance = nextRootInstance.namespaceURI) nextRootInstance = getOwnHostContext(nextRootInstance), fiber = getChildHostContextProd(nextRootInstance, fiber);
			else switch (fiber) {
				case "svg":
					fiber = 1;
					break;
				case "math":
					fiber = 2;
					break;
				default: fiber = 0;
			}
		}
		pop(contextStackCursor);
		push(contextStackCursor, fiber);
	}
	function popHostContainer() {
		pop(contextStackCursor);
		pop(contextFiberStackCursor);
		pop(rootInstanceStackCursor);
	}
	function pushHostContext(fiber) {
		var stateHook = fiber.memoizedState;
		null !== stateHook && (HostTransitionContext._currentValue = stateHook.memoizedState, push(hostTransitionProviderCursor, fiber));
		stateHook = contextStackCursor.current;
		var JSCompiler_inline_result = getChildHostContextProd(stateHook, fiber.type);
		stateHook !== JSCompiler_inline_result && (push(contextFiberStackCursor, fiber), push(contextStackCursor, JSCompiler_inline_result));
	}
	function popHostContext(fiber) {
		contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
		hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), HostTransitionContext._currentValue = sharedNotPendingObject);
	}
	var prefix;
	var suffix;
	function describeBuiltInComponentFrame(name) {
		if (void 0 === prefix) try {
			throw Error();
		} catch (x) {
			var match = x.stack.trim().match(/\n( *(at )?)/);
			prefix = match && match[1] || "";
			suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + prefix + name + suffix;
	}
	var reentry = !1;
	function describeNativeComponentFrame(fn, construct) {
		if (!fn || reentry) return "";
		reentry = !0;
		var previousPrepareStackTrace = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var RunInRootFrame = { DetermineComponentFrameRoot: function() {
				try {
					if (construct) {
						var Fake = function() {
							throw Error();
						};
						Object.defineProperty(Fake.prototype, "props", { set: function() {
							throw Error();
						} });
						if ("object" === typeof Reflect && Reflect.construct) {
							try {
								Reflect.construct(Fake, []);
							} catch (x) {
								var control = x;
							}
							Reflect.construct(fn, [], Fake);
						} else {
							try {
								Fake.call();
							} catch (x$1) {
								control = x$1;
							}
							Fake = !1;
							try {
								var prevProps = Object.getOwnPropertyDescriptor(fn.prototype, "props");
								Object.defineProperty(fn.prototype, "props", {
									configurable: !0,
									set: function() {
										throw Error();
									}
								});
								Fake = !0;
								new fn();
							} finally {
								Fake && (void 0 !== prevProps ? Object.defineProperty(fn.prototype, "props", prevProps) : delete fn.prototype.props);
							}
						}
					} else {
						try {
							throw Error();
						} catch (x$2) {
							control = x$2;
						}
						(Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {});
					}
				} catch (sample) {
					if (sample && control && "string" === typeof sample.stack) return [sample.stack, control.stack];
				}
				return [null, null];
			} };
			RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var namePropDescriptor = Object.getOwnPropertyDescriptor(RunInRootFrame.DetermineComponentFrameRoot, "name");
			namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(RunInRootFrame.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
			if (sampleStack && controlStack) {
				var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
				for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot");) RunInRootFrame++;
				for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes("DetermineComponentFrameRoot");) namePropDescriptor++;
				if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length) for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor];) namePropDescriptor--;
				for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--) if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
					if (1 !== RunInRootFrame || 1 !== namePropDescriptor) do
						if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
							var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
							fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
							return frame;
						}
					while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
					break;
				}
			}
		} finally {
			reentry = !1, Error.prepareStackTrace = previousPrepareStackTrace;
		}
		return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
	}
	function describeFiber(fiber, childFiber) {
		switch (fiber.tag) {
			case 26:
			case 27:
			case 5: return describeBuiltInComponentFrame(fiber.type);
			case 16: return describeBuiltInComponentFrame("Lazy");
			case 13: return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
			case 19: return describeBuiltInComponentFrame("SuspenseList");
			case 0:
			case 15: return describeNativeComponentFrame(fiber.type, !1);
			case 11: return describeNativeComponentFrame(fiber.type.render, !1);
			case 1: return describeNativeComponentFrame(fiber.type, !0);
			case 31: return describeBuiltInComponentFrame("Activity");
			case 30: return describeBuiltInComponentFrame("ViewTransition");
			default: return "";
		}
	}
	function getStackByFiberInDevAndProd(workInProgress) {
		try {
			var info = "", previous = null;
			do
				info += describeFiber(workInProgress, previous), previous = workInProgress, workInProgress = workInProgress.return;
			while (workInProgress);
			return info;
		} catch (x) {
			return "\nError generating stack: " + x.message + "\n" + x.stack;
		}
	}
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var scheduleCallback$3 = Scheduler.unstable_scheduleCallback;
	var cancelCallback$1 = Scheduler.unstable_cancelCallback;
	var shouldYield = Scheduler.unstable_shouldYield;
	var requestPaint = Scheduler.unstable_requestPaint;
	var now = Scheduler.unstable_now;
	var getCurrentPriorityLevel = Scheduler.unstable_getCurrentPriorityLevel;
	var ImmediatePriority = Scheduler.unstable_ImmediatePriority;
	var UserBlockingPriority = Scheduler.unstable_UserBlockingPriority;
	var NormalPriority$1 = Scheduler.unstable_NormalPriority;
	var LowPriority = Scheduler.unstable_LowPriority;
	var IdlePriority = Scheduler.unstable_IdlePriority;
	var log$1 = Scheduler.log;
	var unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue;
	var rendererID = null;
	var injectedHook = null;
	function setIsStrictModeForDevtools(newIsStrictMode) {
		"function" === typeof log$1 && unstable_setDisableYieldValue(newIsStrictMode);
		if (injectedHook && "function" === typeof injectedHook.setStrictMode) try {
			injectedHook.setStrictMode(rendererID, newIsStrictMode);
		} catch (err) {}
	}
	var clz32 = Math.clz32 ? Math.clz32 : clz32Fallback;
	var log = Math.log;
	var LN2 = Math.LN2;
	function clz32Fallback(x) {
		x >>>= 0;
		return 0 === x ? 32 : 31 - (log(x) / LN2 | 0) | 0;
	}
	var nextTransitionUpdateLane = 256;
	var nextTransitionDeferredLane = 262144;
	var nextRetryLane = 4194304;
	function getHighestPriorityLanes(lanes) {
		var pendingSyncLanes = lanes & 42;
		if (0 !== pendingSyncLanes) return pendingSyncLanes;
		switch (lanes & -lanes) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return lanes & -lanes;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return lanes & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return lanes & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return lanes;
		}
	}
	function getNextLanes(root, wipLanes, rootHasPendingCommit) {
		var pendingLanes = root.pendingLanes;
		if (0 === pendingLanes) return 0;
		var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		root = root.warmLanes;
		var nonIdlePendingLanes = pendingLanes & 134217727;
		0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
		return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
	}
	function checkIfRootIsPrerendering(root, renderLanes) {
		return 0 === (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes);
	}
	function getEntangledLanes(root, renderLanes) {
		0 !== (renderLanes & 8) && (renderLanes |= renderLanes & 32);
		var allEntangledLanes = root.entangledLanes;
		if (0 !== allEntangledLanes) for (root = root.entanglements, allEntangledLanes &= renderLanes; 0 < allEntangledLanes;) {
			var index$4 = 31 - clz32(allEntangledLanes), lane = 1 << index$4;
			renderLanes |= root[index$4];
			allEntangledLanes &= ~lane;
		}
		return renderLanes;
	}
	function computeExpirationTime(lane, currentTime) {
		switch (lane) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return currentTime + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return currentTime + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function claimNextRetryLane() {
		var lane = nextRetryLane;
		nextRetryLane <<= 1;
		0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
		return lane;
	}
	function createLaneMap(initial) {
		for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
		return laneMap;
	}
	function markRootUpdated$1(root, updateLane) {
		root.pendingLanes |= updateLane;
		268435456 !== updateLane && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
	}
	function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
		var previouslyPendingLanes = root.pendingLanes;
		root.pendingLanes = remainingLanes;
		root.suspendedLanes = 0;
		root.pingedLanes = 0;
		root.warmLanes = 0;
		root.expiredLanes &= remainingLanes;
		root.entangledLanes &= remainingLanes;
		root.errorRecoveryDisabledLanes &= remainingLanes;
		root.shellSuspendCounter = 0;
		var entanglements = root.entanglements, expirationTimes = root.expirationTimes, hiddenUpdates = root.hiddenUpdates;
		for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes;) {
			var index$7 = 31 - clz32(remainingLanes), lane = 1 << index$7;
			entanglements[index$7] = 0;
			expirationTimes[index$7] = -1;
			var hiddenUpdatesForLane = hiddenUpdates[index$7];
			if (null !== hiddenUpdatesForLane) for (hiddenUpdates[index$7] = null, index$7 = 0; index$7 < hiddenUpdatesForLane.length; index$7++) {
				var update = hiddenUpdatesForLane[index$7];
				null !== update && (update.lane &= -536870913);
			}
			remainingLanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
		0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root.tag && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
	}
	function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
		root.pendingLanes |= spawnedLane;
		root.suspendedLanes &= ~spawnedLane;
		var spawnedLaneIndex = 31 - clz32(spawnedLane);
		root.entangledLanes |= spawnedLane;
		root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
	}
	function markRootEntangled(root, entangledLanes) {
		var rootEntangledLanes = root.entangledLanes |= entangledLanes;
		for (root = root.entanglements; rootEntangledLanes;) {
			var index$8 = 31 - clz32(rootEntangledLanes), lane = 1 << index$8;
			lane & entangledLanes | root[index$8] & entangledLanes && (root[index$8] |= entangledLanes);
			rootEntangledLanes &= ~lane;
		}
	}
	function getBumpedLaneForHydration(root, renderLanes) {
		var renderLane = renderLanes & -renderLanes;
		renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
		return 0 !== (renderLane & (root.suspendedLanes | renderLanes)) ? 0 : renderLane;
	}
	function getBumpedLaneForHydrationByLane(lane) {
		switch (lane) {
			case 2:
				lane = 1;
				break;
			case 8:
				lane = 4;
				break;
			case 32:
				lane = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				lane = 128;
				break;
			case 268435456:
				lane = 134217728;
				break;
			default: lane = 0;
		}
		return lane;
	}
	function lanesToEventPriority(lanes) {
		lanes &= -lanes;
		return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
	}
	function resolveUpdatePriority() {
		var updatePriority = ReactDOMSharedInternals.p;
		if (0 !== updatePriority) return updatePriority;
		updatePriority = window.event;
		return void 0 === updatePriority ? 32 : getEventPriority(updatePriority.type);
	}
	function runWithPriority(priority, fn) {
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			return ReactDOMSharedInternals.p = priority, fn();
		} finally {
			ReactDOMSharedInternals.p = previousPriority;
		}
	}
	var randomKey = Math.random().toString(36).slice(2);
	var internalInstanceKey = "__reactFiber$" + randomKey;
	var internalPropsKey = "__reactProps$" + randomKey;
	var internalContainerInstanceKey = "__reactContainer$" + randomKey;
	var internalEventHandlersKey = "__reactEvents$" + randomKey;
	var internalEventHandlerListenersKey = "__reactListeners$" + randomKey;
	var internalEventHandlesSetKey = "__reactHandles$" + randomKey;
	var internalRootNodeResourcesKey = "__reactResources$" + randomKey;
	var internalHoistableMarker = "__reactMarker$" + randomKey;
	var internalLoadPendingKey = "__reactLoad$" + randomKey;
	function detachDeletedInstance(node) {
		delete node[internalInstanceKey];
		delete node[internalPropsKey];
		delete node[internalEventHandlerListenersKey];
		delete node[internalEventHandlesSetKey];
	}
	function getClosestInstanceFromNode(targetNode) {
		var targetInst;
		if (targetInst = targetNode[internalInstanceKey]) return targetInst;
		for (var parentNode = targetNode.parentNode; parentNode;) {
			if (targetInst = parentNode[internalContainerInstanceKey] || parentNode[internalInstanceKey]) {
				parentNode = targetInst.alternate;
				if (null !== targetInst.child || null !== parentNode && null !== parentNode.child) for (targetNode = getParentHydrationBoundary(targetNode); null !== targetNode;) {
					if (parentNode = targetNode[internalInstanceKey]) return parentNode;
					targetNode = getParentHydrationBoundary(targetNode);
				}
				return targetInst;
			}
			targetNode = parentNode;
			parentNode = targetNode.parentNode;
		}
		return null;
	}
	function getInstanceFromNode(node) {
		if (node = node[internalInstanceKey] || node[internalContainerInstanceKey]) {
			var tag = node.tag;
			if (5 === tag || 6 === tag || 13 === tag || 31 === tag || 26 === tag || 27 === tag || 3 === tag) return node;
		}
		return null;
	}
	function getNodeFromInstance(inst) {
		var tag = inst.tag;
		if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return inst.stateNode;
		throw Error(formatProdErrorMessage(33));
	}
	function getResourcesFromRoot(root) {
		var resources = root[internalRootNodeResourcesKey];
		resources || (resources = root[internalRootNodeResourcesKey] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		});
		return resources;
	}
	function markNodeAsHoistable(node) {
		node[internalHoistableMarker] = !0;
	}
	function clearPendingLoadOnNode(node) {
		node[internalLoadPendingKey] = void 0;
	}
	var allNativeEvents = /* @__PURE__ */ new Set();
	var registrationNameDependencies = {};
	function registerTwoPhaseEvent(registrationName, dependencies) {
		registerDirectEvent(registrationName, dependencies);
		registerDirectEvent(registrationName + "Capture", dependencies);
	}
	function registerDirectEvent(registrationName, dependencies) {
		registrationNameDependencies[registrationName] = dependencies;
		for (registrationName = 0; registrationName < dependencies.length; registrationName++) allNativeEvents.add(dependencies[registrationName]);
	}
	var VALID_ATTRIBUTE_NAME_REGEX = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$");
	var illegalAttributeNameCache = {};
	var validatedAttributeNameCache = {};
	function isAttributeNameSafe(attributeName) {
		if (hasOwnProperty.call(validatedAttributeNameCache, attributeName)) return !0;
		if (hasOwnProperty.call(illegalAttributeNameCache, attributeName)) return !1;
		if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) return validatedAttributeNameCache[attributeName] = !0;
		illegalAttributeNameCache[attributeName] = !0;
		return !1;
	}
	var viewTransitionMutationContext = !1;
	function pushMutationContext() {
		var prev = viewTransitionMutationContext;
		viewTransitionMutationContext = !1;
		return prev;
	}
	function setValueForAttribute(node, name, value) {
		if (isAttributeNameSafe(name)) if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
					node.removeAttribute(name);
					return;
				case "boolean":
					var prefix$10 = name.toLowerCase().slice(0, 5);
					if ("data-" !== prefix$10 && "aria-" !== prefix$10) {
						node.removeAttribute(name);
						return;
					}
			}
			node.setAttribute(name, value);
		}
	}
	function setValueForKnownAttribute(node, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttribute(name, value);
		}
	}
	function setValueForNamespacedAttribute(node, namespace, name, value) {
		if (null === value) node.removeAttribute(name);
		else {
			switch (typeof value) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					node.removeAttribute(name);
					return;
			}
			node.setAttributeNS(namespace, name, value);
		}
	}
	function getToStringValue(value) {
		switch (typeof value) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return value;
			case "object": return value;
			default: return "";
		}
	}
	function isCheckable(elem) {
		var type = elem.type;
		return (elem = elem.nodeName) && "input" === elem.toLowerCase() && ("checkbox" === type || "radio" === type);
	}
	function trackValueOnNode(node, valueField, currentValue) {
		var descriptor = Object.getOwnPropertyDescriptor(node.constructor.prototype, valueField);
		if (!node.hasOwnProperty(valueField) && "undefined" !== typeof descriptor && "function" === typeof descriptor.get && "function" === typeof descriptor.set) {
			var get = descriptor.get, set = descriptor.set;
			Object.defineProperty(node, valueField, {
				configurable: !0,
				get: function() {
					return get.call(this);
				},
				set: function(value) {
					currentValue = "" + value;
					set.call(this, value);
				}
			});
			Object.defineProperty(node, valueField, { enumerable: descriptor.enumerable });
			return {
				getValue: function() {
					return currentValue;
				},
				setValue: function(value) {
					currentValue = "" + value;
				},
				stopTracking: function() {
					node._valueTracker = null;
					delete node[valueField];
				}
			};
		}
	}
	function track(node) {
		if (!node._valueTracker) {
			var valueField = isCheckable(node) ? "checked" : "value";
			node._valueTracker = trackValueOnNode(node, valueField, "" + node[valueField]);
		}
	}
	function updateValueIfChanged(node) {
		if (!node) return !1;
		var tracker = node._valueTracker;
		if (!tracker) return !0;
		var lastValue = tracker.getValue();
		var value = "";
		node && (value = isCheckable(node) ? node.checked ? "true" : "false" : node.value);
		node = value;
		return node !== lastValue ? (tracker.setValue(node), !0) : !1;
	}
	var escapeSelectorAttributeValueInsideDoubleQuotesRegex = /[\n"\\]/g;
	function escapeSelectorAttributeValueInsideDoubleQuotes(value) {
		return value.replace(escapeSelectorAttributeValueInsideDoubleQuotesRegex, function(ch) {
			return "\\" + ch.charCodeAt(0).toString(16) + " ";
		});
	}
	function updateInput(element, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name) {
		element.name = "";
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type ? element.type = type : element.removeAttribute("type");
		if (null != value) if ("number" === type) {
			if (0 === value && "" === element.value || element.value != value) element.value = "" + getToStringValue(value);
		} else element.value !== "" + getToStringValue(value) && (element.value = "" + getToStringValue(value));
		else "submit" !== type && "reset" !== type || element.removeAttribute("value");
		null != value ? "number" === type && element.value == value ? setDefaultValue(element, getToStringValue(element.value)) : setDefaultValue(element, getToStringValue(value)) : null != defaultValue ? setDefaultValue(element, getToStringValue(defaultValue)) : null != lastDefaultValue && element.removeAttribute("value");
		null == checked && null != defaultChecked && (element.defaultChecked = !!defaultChecked);
		null != checked && (element.checked = checked && "function" !== typeof checked && "symbol" !== typeof checked);
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name ? element.name = "" + getToStringValue(name) : element.removeAttribute("name");
	}
	function initInput(element, value, defaultValue, checked, defaultChecked, type, name, isHydrating) {
		null != type && "function" !== typeof type && "symbol" !== typeof type && "boolean" !== typeof type && (element.type = type);
		if (null != value || null != defaultValue) {
			if (!("submit" !== type && "reset" !== type || void 0 !== value && null !== value)) {
				track(element);
				return;
			}
			defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
			value = null != value ? "" + getToStringValue(value) : defaultValue;
			isHydrating || value === element.value || (element.value = value);
			element.defaultValue = value;
		}
		checked = null != checked ? checked : defaultChecked;
		checked = "function" !== typeof checked && "symbol" !== typeof checked && !!checked;
		element.checked = isHydrating ? element.checked : !!checked;
		element.defaultChecked = !!checked;
		null != name && "function" !== typeof name && "symbol" !== typeof name && "boolean" !== typeof name && (element.name = name);
		track(element);
	}
	function setDefaultValue(node, value) {
		node.defaultValue !== "" + value && (node.defaultValue = "" + value);
	}
	function updateOptions(node, multiple, propValue, setDefaultSelected) {
		node = node.options;
		if (multiple) {
			multiple = {};
			for (var i = 0; i < propValue.length; i++) multiple["$" + propValue[i]] = !0;
			for (propValue = 0; propValue < node.length; propValue++) i = multiple.hasOwnProperty("$" + node[propValue].value), node[propValue].selected !== i && (node[propValue].selected = i), i && setDefaultSelected && (node[propValue].defaultSelected = !0);
		} else {
			propValue = "" + getToStringValue(propValue);
			multiple = null;
			for (i = 0; i < node.length; i++) {
				if (node[i].value === propValue) {
					node[i].selected = !0;
					setDefaultSelected && (node[i].defaultSelected = !0);
					return;
				}
				null !== multiple || node[i].disabled || (multiple = node[i]);
			}
			null !== multiple && (multiple.selected = !0);
		}
	}
	function updateTextarea(element, value, defaultValue) {
		if (null != value && (value = "" + getToStringValue(value), value !== element.value && (element.value = value), null == defaultValue)) {
			element.defaultValue !== value && (element.defaultValue = value);
			return;
		}
		element.defaultValue = null != defaultValue ? "" + getToStringValue(defaultValue) : "";
	}
	function initTextarea(element, value, defaultValue, children) {
		if (null == value) {
			if (null != children) {
				if (null != defaultValue) throw Error(formatProdErrorMessage(92));
				if (isArrayImpl(children)) {
					if (1 < children.length) throw Error(formatProdErrorMessage(93));
					children = children[0];
				}
				defaultValue = children;
			}
			defaultValue ??= "";
			value = defaultValue;
		}
		defaultValue = getToStringValue(value);
		element.defaultValue = defaultValue;
		children = element.textContent;
		children === defaultValue && "" !== children && null !== children && (element.value = children);
		track(element);
	}
	function setTextContent(node, text) {
		if (text) {
			var firstChild = node.firstChild;
			if (firstChild && firstChild === node.lastChild && 3 === firstChild.nodeType) {
				firstChild.nodeValue = text;
				return;
			}
		}
		node.textContent = text;
	}
	var unitlessNumbers = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function setValueForStyle(style, styleName, value) {
		var isCustomProperty = 0 === styleName.indexOf("--");
		null == value || "boolean" === typeof value || "" === value ? isCustomProperty ? style.setProperty(styleName, "") : "float" === styleName ? style.cssFloat = "" : style[styleName] = "" : isCustomProperty ? style.setProperty(styleName, value) : "number" !== typeof value || 0 === value || unitlessNumbers.has(styleName) ? "float" === styleName ? style.cssFloat = value : style[styleName] = ("" + value).trim() : style[styleName] = value + "px";
	}
	function setValueForStyles(node, styles, prevStyles) {
		if (null != styles && "object" !== typeof styles) throw Error(formatProdErrorMessage(62));
		node = node.style;
		if (null != prevStyles) {
			for (var styleName in prevStyles) !prevStyles.hasOwnProperty(styleName) || null != styles && styles.hasOwnProperty(styleName) || (0 === styleName.indexOf("--") ? node.setProperty(styleName, "") : "float" === styleName ? node.cssFloat = "" : node[styleName] = "", viewTransitionMutationContext = !0);
			for (var styleName$16 in styles) styleName = styles[styleName$16], styles.hasOwnProperty(styleName$16) && prevStyles[styleName$16] !== styleName && (setValueForStyle(node, styleName$16, styleName), viewTransitionMutationContext = !0);
		} else for (var styleName$17 in styles) styles.hasOwnProperty(styleName$17) && setValueForStyle(node, styleName$17, styles[styleName$17]);
	}
	function isCustomElement(tagName) {
		if (-1 === tagName.indexOf("-")) return !1;
		switch (tagName) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var aliases = /* @__PURE__ */ new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["maskType", "mask-type"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]);
	var isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function sanitizeURL(url) {
		return isJavaScriptProtocol.test("" + url) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : url;
	}
	function noop$1() {}
	var currentReplayingEvent = null;
	function getEventTarget(nativeEvent) {
		nativeEvent = nativeEvent.target || nativeEvent.srcElement || window;
		nativeEvent.correspondingUseElement && (nativeEvent = nativeEvent.correspondingUseElement);
		return 3 === nativeEvent.nodeType ? nativeEvent.parentNode : nativeEvent;
	}
	var restoreTarget = null;
	var restoreQueue = null;
	function restoreStateOfTarget(target) {
		var internalInstance = getInstanceFromNode(target);
		if (internalInstance && (target = internalInstance.stateNode)) {
			var props = target[internalPropsKey] || null;
			a: switch (target = internalInstance.stateNode, internalInstance.type) {
				case "input":
					updateInput(target, props.value, props.defaultValue, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name);
					internalInstance = props.name;
					if ("radio" === props.type && null != internalInstance) {
						for (props = target; props.parentNode;) props = props.parentNode;
						props = props.querySelectorAll("input[name=\"" + escapeSelectorAttributeValueInsideDoubleQuotes("" + internalInstance) + "\"][type=\"radio\"]");
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) {
							var otherNode = props[internalInstance];
							if (otherNode !== target && otherNode.form === target.form) {
								var otherProps = otherNode[internalPropsKey] || null;
								if (!otherProps) throw Error(formatProdErrorMessage(90));
								updateInput(otherNode, otherProps.value, otherProps.defaultValue, otherProps.defaultValue, otherProps.checked, otherProps.defaultChecked, otherProps.type, otherProps.name);
							}
						}
						for (internalInstance = 0; internalInstance < props.length; internalInstance++) otherNode = props[internalInstance], otherNode.form === target.form && updateValueIfChanged(otherNode);
					}
					break a;
				case "textarea":
					updateTextarea(target, props.value, props.defaultValue);
					break a;
				case "select": internalInstance = props.value, null != internalInstance && updateOptions(target, !!props.multiple, internalInstance, !1);
			}
		}
	}
	var isInsideEventHandler = !1;
	function batchedUpdates$1(fn, a, b) {
		if (isInsideEventHandler) return fn(a, b);
		isInsideEventHandler = !0;
		try {
			return fn(a);
		} finally {
			if (isInsideEventHandler = !1, null !== restoreTarget || null !== restoreQueue) {
				if (flushSyncWork$1(), restoreTarget && (a = restoreTarget, fn = restoreQueue, restoreQueue = restoreTarget = null, restoreStateOfTarget(a), fn)) for (a = 0; a < fn.length; a++) restoreStateOfTarget(fn[a]);
			}
		}
	}
	function getListener(inst, registrationName) {
		var stateNode = inst.stateNode;
		if (null === stateNode) return null;
		var props = stateNode[internalPropsKey] || null;
		if (null === props) return null;
		stateNode = props[registrationName];
		a: switch (registrationName) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(props = !props.disabled) || (inst = inst.type, props = !("button" === inst || "input" === inst || "select" === inst || "textarea" === inst));
				inst = !props;
				break a;
			default: inst = !1;
		}
		if (inst) return null;
		if (stateNode && "function" !== typeof stateNode) throw Error(formatProdErrorMessage(231, registrationName, typeof stateNode));
		return stateNode;
	}
	var canUseDOM = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
	var passiveBrowserEventsSupported = !1;
	if (canUseDOM) try {
		var options = {};
		Object.defineProperty(options, "passive", { get: function() {
			passiveBrowserEventsSupported = !0;
		} });
		window.addEventListener("test", options, options);
		window.removeEventListener("test", options, options);
	} catch (e) {
		passiveBrowserEventsSupported = !1;
	}
	var root = null;
	var startText = null;
	var fallbackText = null;
	function getData() {
		if (fallbackText) return fallbackText;
		var start, startValue = startText, startLength = startValue.length, end, endValue = "value" in root ? root.value : root.textContent, endLength = endValue.length;
		for (start = 0; start < startLength && startValue[start] === endValue[start]; start++);
		var minEnd = startLength - start;
		for (end = 1; end <= minEnd && startValue[startLength - end] === endValue[endLength - end]; end++);
		return fallbackText = endValue.slice(start, 1 < end ? 1 - end : void 0);
	}
	function getEventCharCode(nativeEvent) {
		var keyCode = nativeEvent.keyCode;
		"charCode" in nativeEvent ? (nativeEvent = nativeEvent.charCode, 0 === nativeEvent && 13 === keyCode && (nativeEvent = 13)) : nativeEvent = keyCode;
		10 === nativeEvent && (nativeEvent = 13);
		return 32 <= nativeEvent || 13 === nativeEvent ? nativeEvent : 0;
	}
	function functionThatReturnsTrue() {
		return !0;
	}
	function functionThatReturnsFalse() {
		return !1;
	}
	function createSyntheticEvent(Interface) {
		function SyntheticBaseEvent(reactName, reactEventType, targetInst, nativeEvent, nativeEventTarget) {
			this._reactName = reactName;
			this._targetInst = targetInst;
			this.type = reactEventType;
			this.nativeEvent = nativeEvent;
			this.target = nativeEventTarget;
			this.currentTarget = null;
			for (var propName in Interface) Interface.hasOwnProperty(propName) && (reactName = Interface[propName], this[propName] = reactName ? reactName(nativeEvent) : nativeEvent[propName]);
			this.isDefaultPrevented = (null != nativeEvent.defaultPrevented ? nativeEvent.defaultPrevented : !1 === nativeEvent.returnValue) ? functionThatReturnsTrue : functionThatReturnsFalse;
			this.isPropagationStopped = functionThatReturnsFalse;
			return this;
		}
		assign(SyntheticBaseEvent.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var event = this.nativeEvent;
				event && (event.preventDefault ? event.preventDefault() : "unknown" !== typeof event.returnValue && (event.returnValue = !1), this.isDefaultPrevented = functionThatReturnsTrue);
			},
			stopPropagation: function() {
				var event = this.nativeEvent;
				event && (event.stopPropagation ? event.stopPropagation() : "unknown" !== typeof event.cancelBubble && (event.cancelBubble = !0), this.isPropagationStopped = functionThatReturnsTrue);
			},
			persist: function() {},
			isPersistent: functionThatReturnsTrue
		});
		return SyntheticBaseEvent;
	}
	var EventInterface = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(event) {
			return event.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	};
	var SyntheticEvent = createSyntheticEvent(EventInterface);
	var UIEventInterface = assign({}, EventInterface, {
		view: 0,
		detail: 0
	});
	var SyntheticUIEvent = createSyntheticEvent(UIEventInterface);
	var lastMovementX;
	var lastMovementY;
	var lastMouseEvent;
	var MouseEventInterface = assign({}, UIEventInterface, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: getEventModifierState,
		button: 0,
		buttons: 0,
		relatedTarget: function(event) {
			return void 0 === event.relatedTarget ? event.fromElement === event.srcElement ? event.toElement : event.fromElement : event.relatedTarget;
		},
		movementX: function(event) {
			if ("movementX" in event) return event.movementX;
			event !== lastMouseEvent && (lastMouseEvent && "mousemove" === event.type ? (lastMovementX = event.screenX - lastMouseEvent.screenX, lastMovementY = event.screenY - lastMouseEvent.screenY) : lastMovementY = lastMovementX = 0, lastMouseEvent = event);
			return lastMovementX;
		},
		movementY: function(event) {
			return "movementY" in event ? event.movementY : lastMovementY;
		}
	});
	var SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);
	var SyntheticDragEvent = createSyntheticEvent(assign({}, MouseEventInterface, { dataTransfer: 0 }));
	var SyntheticFocusEvent = createSyntheticEvent(assign({}, UIEventInterface, { relatedTarget: 0 }));
	var SyntheticAnimationEvent = createSyntheticEvent(assign({}, EventInterface, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	}));
	var SyntheticClipboardEvent = createSyntheticEvent(assign({}, EventInterface, { clipboardData: function(event) {
		return "clipboardData" in event ? event.clipboardData : window.clipboardData;
	} }));
	var SyntheticCompositionEvent = createSyntheticEvent(assign({}, EventInterface, { data: 0 }));
	var normalizeKey = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	};
	var translateToKey = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	};
	var modifierKeyToProp = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function modifierStateGetter(keyArg) {
		var nativeEvent = this.nativeEvent;
		return nativeEvent.getModifierState ? nativeEvent.getModifierState(keyArg) : (keyArg = modifierKeyToProp[keyArg]) ? !!nativeEvent[keyArg] : !1;
	}
	function getEventModifierState() {
		return modifierStateGetter;
	}
	var SyntheticKeyboardEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		key: function(nativeEvent) {
			if (nativeEvent.key) {
				var key = normalizeKey[nativeEvent.key] || nativeEvent.key;
				if ("Unidentified" !== key) return key;
			}
			return "keypress" === nativeEvent.type ? (nativeEvent = getEventCharCode(nativeEvent), 13 === nativeEvent ? "Enter" : String.fromCharCode(nativeEvent)) : "keydown" === nativeEvent.type || "keyup" === nativeEvent.type ? translateToKey[nativeEvent.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: getEventModifierState,
		charCode: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : 0;
		},
		keyCode: function(event) {
			return "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		},
		which: function(event) {
			return "keypress" === event.type ? getEventCharCode(event) : "keydown" === event.type || "keyup" === event.type ? event.keyCode : 0;
		}
	}));
	var SyntheticPointerEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	}));
	var SyntheticSubmitEvent = createSyntheticEvent(assign({}, EventInterface, { submitter: 0 }));
	var SyntheticTouchEvent = createSyntheticEvent(assign({}, UIEventInterface, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: getEventModifierState
	}));
	var SyntheticTransitionEvent = createSyntheticEvent(assign({}, EventInterface, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	}));
	var SyntheticWheelEvent = createSyntheticEvent(assign({}, MouseEventInterface, {
		deltaX: function(event) {
			return "deltaX" in event ? event.deltaX : "wheelDeltaX" in event ? -event.wheelDeltaX : 0;
		},
		deltaY: function(event) {
			return "deltaY" in event ? event.deltaY : "wheelDeltaY" in event ? -event.wheelDeltaY : "wheelDelta" in event ? -event.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	}));
	var SyntheticToggleEvent = createSyntheticEvent(assign({}, EventInterface, {
		newState: 0,
		oldState: 0,
		source: 0
	}));
	var END_KEYCODES = [
		9,
		13,
		27,
		32
	];
	var canUseCompositionEvent = canUseDOM && "CompositionEvent" in window;
	var documentMode = null;
	canUseDOM && "documentMode" in document && (documentMode = document.documentMode);
	var canUseTextInputEvent = canUseDOM && "TextEvent" in window && !documentMode;
	var useFallbackCompositionData = canUseDOM && (!canUseCompositionEvent || documentMode && 8 < documentMode && 11 >= documentMode);
	var SPACEBAR_CHAR = String.fromCharCode(32);
	var hasSpaceKeypress = !1;
	function isFallbackCompositionEnd(domEventName, nativeEvent) {
		switch (domEventName) {
			case "keyup": return -1 !== END_KEYCODES.indexOf(nativeEvent.keyCode);
			case "keydown": return 229 !== nativeEvent.keyCode;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function getDataFromCustomEvent(nativeEvent) {
		nativeEvent = nativeEvent.detail;
		return "object" === typeof nativeEvent && "data" in nativeEvent ? nativeEvent.data : null;
	}
	var isComposing = !1;
	function getNativeBeforeInputChars(domEventName, nativeEvent) {
		switch (domEventName) {
			case "compositionend": return getDataFromCustomEvent(nativeEvent);
			case "keypress":
				if (32 !== nativeEvent.which) return null;
				hasSpaceKeypress = !0;
				return SPACEBAR_CHAR;
			case "textInput": return domEventName = nativeEvent.data, domEventName === SPACEBAR_CHAR && hasSpaceKeypress ? null : domEventName;
			default: return null;
		}
	}
	function getFallbackBeforeInputChars(domEventName, nativeEvent) {
		if (isComposing) return "compositionend" === domEventName || !canUseCompositionEvent && isFallbackCompositionEnd(domEventName, nativeEvent) ? (domEventName = getData(), fallbackText = startText = root = null, isComposing = !1, domEventName) : null;
		switch (domEventName) {
			case "paste": return null;
			case "keypress":
				if (!(nativeEvent.ctrlKey || nativeEvent.altKey || nativeEvent.metaKey) || nativeEvent.ctrlKey && nativeEvent.altKey) {
					if (nativeEvent.char && 1 < nativeEvent.char.length) return nativeEvent.char;
					if (nativeEvent.which) return String.fromCharCode(nativeEvent.which);
				}
				return null;
			case "compositionend": return useFallbackCompositionData && "ko" !== nativeEvent.locale ? null : nativeEvent.data;
			default: return null;
		}
	}
	var supportedInputTypes = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function isTextInputElement(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return "input" === nodeName ? !!supportedInputTypes[elem.type] : "textarea" === nodeName ? !0 : !1;
	}
	function createAndAccumulateChangeEvent(dispatchQueue, inst, nativeEvent, target) {
		restoreTarget ? restoreQueue ? restoreQueue.push(target) : restoreQueue = [target] : restoreTarget = target;
		inst = accumulateTwoPhaseListeners(inst, "onChange");
		0 < inst.length && (nativeEvent = new SyntheticEvent("onChange", "change", null, nativeEvent, target), dispatchQueue.push({
			event: nativeEvent,
			listeners: inst
		}));
	}
	var activeElement$1 = null;
	var activeElementInst$1 = null;
	function runEventInBatch(dispatchQueue) {
		processDispatchQueue(dispatchQueue, 0);
	}
	function getInstIfValueChanged(targetInst) {
		if (updateValueIfChanged(getNodeFromInstance(targetInst))) return targetInst;
	}
	function getTargetInstForChangeEvent(domEventName, targetInst) {
		if ("change" === domEventName) return targetInst;
	}
	var isInputEventSupported = !1;
	if (canUseDOM) {
		var JSCompiler_inline_result$jscomp$318;
		if (canUseDOM) {
			var isSupported$jscomp$inline_474 = "oninput" in document;
			if (!isSupported$jscomp$inline_474) {
				var element$jscomp$inline_475 = document.createElement("div");
				element$jscomp$inline_475.setAttribute("oninput", "return;");
				isSupported$jscomp$inline_474 = "function" === typeof element$jscomp$inline_475.oninput;
			}
			JSCompiler_inline_result$jscomp$318 = isSupported$jscomp$inline_474;
		} else JSCompiler_inline_result$jscomp$318 = !1;
		isInputEventSupported = JSCompiler_inline_result$jscomp$318 && (!document.documentMode || 9 < document.documentMode);
	}
	function stopWatchingForValueChange() {
		activeElement$1 && (activeElement$1.detachEvent("onpropertychange", handlePropertyChange), activeElementInst$1 = activeElement$1 = null);
	}
	function handlePropertyChange(nativeEvent) {
		if ("value" === nativeEvent.propertyName && getInstIfValueChanged(activeElementInst$1)) {
			var dispatchQueue = [];
			createAndAccumulateChangeEvent(dispatchQueue, activeElementInst$1, nativeEvent, getEventTarget(nativeEvent));
			batchedUpdates$1(runEventInBatch, dispatchQueue);
		}
	}
	function handleEventsForInputEventPolyfill(domEventName, target, targetInst) {
		"focusin" === domEventName ? (stopWatchingForValueChange(), activeElement$1 = target, activeElementInst$1 = targetInst, activeElement$1.attachEvent("onpropertychange", handlePropertyChange)) : "focusout" === domEventName && stopWatchingForValueChange();
	}
	function getTargetInstForInputEventPolyfill(domEventName) {
		if ("selectionchange" === domEventName || "keyup" === domEventName || "keydown" === domEventName) return getInstIfValueChanged(activeElementInst$1);
	}
	function getTargetInstForClickEvent(domEventName, targetInst) {
		if ("click" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function getTargetInstForInputOrChangeEvent(domEventName, targetInst) {
		if ("input" === domEventName || "change" === domEventName) return getInstIfValueChanged(targetInst);
	}
	function is(x, y) {
		return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
	}
	var objectIs = "function" === typeof Object.is ? Object.is : is;
	function shallowEqual(objA, objB) {
		if (objectIs(objA, objB)) return !0;
		if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB) return !1;
		var keysA = Object.keys(objA), keysB = Object.keys(objB);
		if (keysA.length !== keysB.length) return !1;
		for (keysB = 0; keysB < keysA.length; keysB++) {
			var currentKey = keysA[keysB];
			if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey])) return !1;
		}
		return !0;
	}
	function getActiveElement(doc) {
		doc = doc || ("undefined" !== typeof document ? document : void 0);
		if ("undefined" === typeof doc) return null;
		try {
			return doc.activeElement || doc.body;
		} catch (e$20) {
			return doc.body;
		}
	}
	function getLeafNode(node) {
		for (; node && node.firstChild;) node = node.firstChild;
		return node;
	}
	function getNodeForCharacterOffset(root, offset) {
		var node = getLeafNode(root);
		root = 0;
		for (var nodeEnd; node;) {
			if (3 === node.nodeType) {
				nodeEnd = root + node.textContent.length;
				if (root <= offset && nodeEnd >= offset) return {
					node,
					offset: offset - root
				};
				root = nodeEnd;
			}
			a: {
				for (; node;) {
					if (node.nextSibling) {
						node = node.nextSibling;
						break a;
					}
					node = node.parentNode;
				}
				node = void 0;
			}
			node = getLeafNode(node);
		}
	}
	function containsNode(outerNode, innerNode) {
		return outerNode && innerNode ? outerNode === innerNode ? !0 : outerNode && 3 === outerNode.nodeType ? !1 : innerNode && 3 === innerNode.nodeType ? containsNode(outerNode, innerNode.parentNode) : "contains" in outerNode ? outerNode.contains(innerNode) : outerNode.compareDocumentPosition ? !!(outerNode.compareDocumentPosition(innerNode) & 16) : !1 : !1;
	}
	function getActiveElementDeep(containerInfo) {
		containerInfo = null != containerInfo && null != containerInfo.ownerDocument && null != containerInfo.ownerDocument.defaultView ? containerInfo.ownerDocument.defaultView : window;
		for (var element = getActiveElement(containerInfo.document); element instanceof containerInfo.HTMLIFrameElement;) {
			try {
				var JSCompiler_inline_result = "string" === typeof element.contentWindow.location.href;
			} catch (err) {
				JSCompiler_inline_result = !1;
			}
			if (JSCompiler_inline_result) containerInfo = element.contentWindow;
			else break;
			element = getActiveElement(containerInfo.document);
		}
		return element;
	}
	function hasSelectionCapabilities(elem) {
		var nodeName = elem && elem.nodeName && elem.nodeName.toLowerCase();
		return nodeName && ("input" === nodeName && ("text" === elem.type || "search" === elem.type || "tel" === elem.type || "url" === elem.type || "password" === elem.type) || "textarea" === nodeName || "true" === elem.contentEditable);
	}
	var skipSelectionChangeEvent = canUseDOM && "documentMode" in document && 11 >= document.documentMode;
	var activeElement = null;
	var activeElementInst = null;
	var lastSelection = null;
	var mouseDown = !1;
	function constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget) {
		var doc = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget.document : 9 === nativeEventTarget.nodeType ? nativeEventTarget : nativeEventTarget.ownerDocument;
		mouseDown || null == activeElement || activeElement !== getActiveElement(doc) || (doc = activeElement, "selectionStart" in doc && hasSelectionCapabilities(doc) ? doc = {
			start: doc.selectionStart,
			end: doc.selectionEnd
		} : (doc = (doc.ownerDocument && doc.ownerDocument.defaultView || window).getSelection(), doc = {
			anchorNode: doc.anchorNode,
			anchorOffset: doc.anchorOffset,
			focusNode: doc.focusNode,
			focusOffset: doc.focusOffset
		}), lastSelection && shallowEqual(lastSelection, doc) || (lastSelection = doc, doc = accumulateTwoPhaseListeners(activeElementInst, "onSelect"), 0 < doc.length && (nativeEvent = new SyntheticEvent("onSelect", "select", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
			event: nativeEvent,
			listeners: doc
		}), nativeEvent.target = activeElement)));
	}
	function makePrefixMap(styleProp, eventName) {
		var prefixes = {};
		prefixes[styleProp.toLowerCase()] = eventName.toLowerCase();
		prefixes["Webkit" + styleProp] = "webkit" + eventName;
		prefixes["Moz" + styleProp] = "moz" + eventName;
		return prefixes;
	}
	var vendorPrefixes = {
		animationend: makePrefixMap("Animation", "AnimationEnd"),
		animationiteration: makePrefixMap("Animation", "AnimationIteration"),
		animationstart: makePrefixMap("Animation", "AnimationStart"),
		transitionrun: makePrefixMap("Transition", "TransitionRun"),
		transitionstart: makePrefixMap("Transition", "TransitionStart"),
		transitioncancel: makePrefixMap("Transition", "TransitionCancel"),
		transitionend: makePrefixMap("Transition", "TransitionEnd")
	};
	var prefixedEventNames = {};
	var style = {};
	canUseDOM && (style = document.createElement("div").style, "AnimationEvent" in window || (delete vendorPrefixes.animationend.animation, delete vendorPrefixes.animationiteration.animation, delete vendorPrefixes.animationstart.animation), "TransitionEvent" in window || delete vendorPrefixes.transitionend.transition);
	function getVendorPrefixedEventName(eventName) {
		if (prefixedEventNames[eventName]) return prefixedEventNames[eventName];
		if (!vendorPrefixes[eventName]) return eventName;
		var prefixMap = vendorPrefixes[eventName], styleProp;
		for (styleProp in prefixMap) if (prefixMap.hasOwnProperty(styleProp) && styleProp in style) return prefixedEventNames[eventName] = prefixMap[styleProp];
		return eventName;
	}
	var ANIMATION_END = getVendorPrefixedEventName("animationend");
	var ANIMATION_ITERATION = getVendorPrefixedEventName("animationiteration");
	var ANIMATION_START = getVendorPrefixedEventName("animationstart");
	var TRANSITION_RUN = getVendorPrefixedEventName("transitionrun");
	var TRANSITION_START = getVendorPrefixedEventName("transitionstart");
	var TRANSITION_CANCEL = getVendorPrefixedEventName("transitioncancel");
	var TRANSITION_END = getVendorPrefixedEventName("transitionend");
	var topLevelEventsToReactNames = /* @__PURE__ */ new Map();
	var simpleEventPluginEvents = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	simpleEventPluginEvents.push("scrollEnd");
	function registerSimpleEvent(domEventName, reactName) {
		topLevelEventsToReactNames.set(domEventName, reactName);
		registerTwoPhaseEvent(reactName, [domEventName]);
	}
	var globalClientIdCounter$1 = 0;
	function getViewTransitionName(props, instance) {
		if (null != props.name && "auto" !== props.name) return props.name;
		if (null !== instance.autoName) return instance.autoName;
		props = pendingEffectsRoot.identifierPrefix;
		var globalClientId = globalClientIdCounter$1++;
		props = "_" + props + "t_" + globalClientId.toString(32) + "_";
		return instance.autoName = props;
	}
	function getClassNameByType(classByType) {
		if (null == classByType || "string" === typeof classByType) return classByType;
		var className = null, activeTypes = pendingTransitionTypes;
		if (null !== activeTypes) for (var i = 0; i < activeTypes.length; i++) {
			var match = classByType[activeTypes[i]];
			if (null != match) {
				if ("none" === match) return "none";
				className = null == className ? match : className + (" " + match);
			}
		}
		return null == className ? classByType.default : className;
	}
	function getViewTransitionClassName(defaultClass, eventClass) {
		defaultClass = getClassNameByType(defaultClass);
		eventClass = getClassNameByType(eventClass);
		return null == eventClass ? "auto" === defaultClass ? null : defaultClass : "auto" === eventClass ? null : eventClass;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	};
	var concurrentQueues = [];
	var concurrentQueuesIndex = 0;
	var concurrentlyUpdatedLanes = 0;
	function finishQueueingConcurrentUpdates() {
		for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex;) {
			var fiber = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var queue = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var update = concurrentQueues[i];
			concurrentQueues[i++] = null;
			var lane = concurrentQueues[i];
			concurrentQueues[i++] = null;
			if (null !== queue && null !== update) {
				var pending = queue.pending;
				null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
				queue.pending = update;
			}
			0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
		}
	}
	function enqueueUpdate$1(fiber, queue, update, lane) {
		concurrentQueues[concurrentQueuesIndex++] = fiber;
		concurrentQueues[concurrentQueuesIndex++] = queue;
		concurrentQueues[concurrentQueuesIndex++] = update;
		concurrentQueues[concurrentQueuesIndex++] = lane;
		concurrentlyUpdatedLanes |= lane;
		fiber.lanes |= lane;
		fiber = fiber.alternate;
		null !== fiber && (fiber.lanes |= lane);
	}
	function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
		enqueueUpdate$1(fiber, queue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function enqueueConcurrentRenderForLane(fiber, lane) {
		enqueueUpdate$1(fiber, null, null, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
		sourceFiber.lanes |= lane;
		var alternate = sourceFiber.alternate;
		null !== alternate && (alternate.lanes |= lane);
		for (var isHidden = !1, parent = sourceFiber.return; null !== parent;) parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = !0)), sourceFiber = parent, parent = parent.return;
		return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
	}
	function getRootForUpdatedFiber(sourceFiber) {
		if (50 < nestedUpdateCount) throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
		for (var parent = sourceFiber.return; null !== parent;) sourceFiber = parent, parent = sourceFiber.return;
		return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
	}
	var emptyContextObject = {};
	function FiberNode(tag, pendingProps, key, mode) {
		this.tag = tag;
		this.key = key;
		this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
		this.index = 0;
		this.refCleanup = this.ref = null;
		this.pendingProps = pendingProps;
		this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
		this.mode = mode;
		this.subtreeFlags = this.flags = 0;
		this.deletions = null;
		this.childLanes = this.lanes = 0;
		this.alternate = null;
	}
	function createFiberImplClass(tag, pendingProps, key, mode) {
		return new FiberNode(tag, pendingProps, key, mode);
	}
	function shouldConstruct(Component) {
		Component = Component.prototype;
		return !(!Component || !Component.isReactComponent);
	}
	function createWorkInProgress(current, pendingProps) {
		var workInProgress = current.alternate;
		null === workInProgress ? (workInProgress = createFiberImplClass(current.tag, pendingProps, current.key, current.mode), workInProgress.elementType = current.elementType, workInProgress.type = current.type, workInProgress.stateNode = current.stateNode, workInProgress.alternate = current, current.alternate = workInProgress) : (workInProgress.pendingProps = pendingProps, workInProgress.type = current.type, workInProgress.flags = 0, workInProgress.subtreeFlags = 0, workInProgress.deletions = null);
		workInProgress.flags = current.flags & 1206910976;
		workInProgress.childLanes = current.childLanes;
		workInProgress.lanes = current.lanes;
		workInProgress.child = current.child;
		workInProgress.memoizedProps = current.memoizedProps;
		workInProgress.memoizedState = current.memoizedState;
		workInProgress.updateQueue = current.updateQueue;
		pendingProps = current.dependencies;
		workInProgress.dependencies = null === pendingProps ? null : {
			lanes: pendingProps.lanes,
			firstContext: pendingProps.firstContext
		};
		workInProgress.sibling = current.sibling;
		workInProgress.index = current.index;
		workInProgress.ref = current.ref;
		workInProgress.refCleanup = current.refCleanup;
		return workInProgress;
	}
	function resetWorkInProgress(workInProgress, renderLanes) {
		workInProgress.flags &= 1206910978;
		var current = workInProgress.alternate;
		null === current ? (workInProgress.childLanes = 0, workInProgress.lanes = renderLanes, workInProgress.child = null, workInProgress.subtreeFlags = 0, workInProgress.memoizedProps = null, workInProgress.memoizedState = null, workInProgress.updateQueue = null, workInProgress.dependencies = null, workInProgress.stateNode = null) : (workInProgress.childLanes = current.childLanes, workInProgress.lanes = current.lanes, workInProgress.child = current.child, workInProgress.subtreeFlags = 0, workInProgress.deletions = null, workInProgress.memoizedProps = current.memoizedProps, workInProgress.memoizedState = current.memoizedState, workInProgress.updateQueue = current.updateQueue, workInProgress.type = current.type, renderLanes = current.dependencies, workInProgress.dependencies = null === renderLanes ? null : {
			lanes: renderLanes.lanes,
			firstContext: renderLanes.firstContext
		});
		return workInProgress;
	}
	function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
		var fiberTag = 0;
		owner = type;
		if ("function" === typeof owner) shouldConstruct(owner) && (fiberTag = 1);
		else if ("string" === typeof owner) fiberTag = isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : "html" === type || "head" === type || "body" === type ? 27 : 5;
		else a: switch (owner) {
			case REACT_ACTIVITY_TYPE: return type = createFiberImplClass(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
			case REACT_FRAGMENT_TYPE: return createFiberFromFragment(pendingProps.children, mode, lanes, key);
			case REACT_STRICT_MODE_TYPE:
				fiberTag = 8;
				mode |= 24;
				break;
			case REACT_PROFILER_TYPE: return type = createFiberImplClass(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_TYPE: return type = createFiberImplClass(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
			case REACT_SUSPENSE_LIST_TYPE: return type = createFiberImplClass(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
			case REACT_LEGACY_HIDDEN_TYPE:
			case REACT_VIEW_TRANSITION_TYPE: return type = mode | 32, type = createFiberImplClass(30, pendingProps, key, type), type.elementType = REACT_VIEW_TRANSITION_TYPE, type.lanes = lanes, type.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}, type;
			default:
				if ("object" === typeof owner && null !== owner) switch (owner.$$typeof) {
					case REACT_CONTEXT_TYPE:
						fiberTag = 10;
						break a;
					case REACT_CONSUMER_TYPE:
						fiberTag = 9;
						break a;
					case REACT_FORWARD_REF_TYPE:
						fiberTag = 11;
						break a;
					case REACT_MEMO_TYPE:
						fiberTag = 14;
						break a;
					case REACT_LAZY_TYPE:
						fiberTag = 16;
						owner = null;
						break a;
				}
				fiberTag = 29;
				pendingProps = Error(formatProdErrorMessage(130, null === type ? "null" : typeof type, ""));
				owner = null;
		}
		key = createFiberImplClass(fiberTag, pendingProps, key, mode);
		key.elementType = type;
		key.type = owner;
		key.lanes = lanes;
		return key;
	}
	function createFiberFromFragment(elements, mode, lanes, key) {
		elements = createFiberImplClass(7, elements, key, mode);
		elements.lanes = lanes;
		return elements;
	}
	function createFiberFromText(content, mode, lanes) {
		content = createFiberImplClass(6, content, null, mode);
		content.lanes = lanes;
		return content;
	}
	function createFiberFromDehydratedFragment(dehydratedNode) {
		var fiber = createFiberImplClass(18, null, null, 0);
		fiber.stateNode = dehydratedNode;
		return fiber;
	}
	function createFiberFromPortal(portal, mode, lanes) {
		mode = createFiberImplClass(4, null !== portal.children ? portal.children : [], portal.key, mode);
		mode.lanes = lanes;
		mode.stateNode = {
			containerInfo: portal.containerInfo,
			pendingChildren: null,
			implementation: portal.implementation
		};
		return mode;
	}
	var CapturedStacks = /* @__PURE__ */ new WeakMap();
	function createCapturedValueAtFiber(value, source) {
		if ("object" === typeof value && null !== value) {
			var existing = CapturedStacks.get(value);
			if (void 0 !== existing) return existing;
			source = {
				value,
				source,
				stack: getStackByFiberInDevAndProd(source)
			};
			CapturedStacks.set(value, source);
			return source;
		}
		return {
			value,
			source,
			stack: getStackByFiberInDevAndProd(source)
		};
	}
	var forkStack = [];
	var forkStackIndex = 0;
	var treeForkProvider = null;
	var treeForkCount = 0;
	var idStack = [];
	var idStackIndex = 0;
	var treeContextProvider = null;
	var treeContextId = 1;
	var treeContextOverflow = "";
	function pushTreeFork(workInProgress, totalChildren) {
		forkStack[forkStackIndex++] = treeForkCount;
		forkStack[forkStackIndex++] = treeForkProvider;
		treeForkProvider = workInProgress;
		treeForkCount = totalChildren;
	}
	function pushTreeId(workInProgress, totalChildren, index) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextProvider = workInProgress;
		var baseIdWithLeadingBit = treeContextId;
		workInProgress = treeContextOverflow;
		var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
		baseIdWithLeadingBit &= ~(1 << baseLength);
		index += 1;
		var length = 32 - clz32(totalChildren) + baseLength;
		if (30 < length) {
			var numberOfOverflowBits = baseLength - baseLength % 5;
			length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
			baseIdWithLeadingBit >>= numberOfOverflowBits;
			baseLength -= numberOfOverflowBits;
			treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
			treeContextOverflow = length + workInProgress;
		} else treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress;
	}
	function pushMaterializedTreeId(workInProgress) {
		null !== workInProgress.return && (pushTreeFork(workInProgress, 1), pushTreeId(workInProgress, 1, 0));
	}
	function popTreeContext(workInProgress) {
		for (; workInProgress === treeForkProvider;) treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
		for (; workInProgress === treeContextProvider;) treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
	}
	function restoreSuspendedTreeContext(workInProgress, suspendedContext) {
		idStack[idStackIndex++] = treeContextId;
		idStack[idStackIndex++] = treeContextOverflow;
		idStack[idStackIndex++] = treeContextProvider;
		treeContextId = suspendedContext.id;
		treeContextOverflow = suspendedContext.overflow;
		treeContextProvider = workInProgress;
	}
	var hydrationParentFiber = null;
	var nextHydratableInstance = null;
	var isHydrating = !1;
	var hydrationErrors = null;
	var rootOrSingletonContext = !1;
	var HydrationMismatchException = Error(formatProdErrorMessage(519));
	function throwOnHydrationMismatch(fiber) {
		queueHydrationError(createCapturedValueAtFiber(Error(formatProdErrorMessage(418, 1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML", "")), fiber));
		throw HydrationMismatchException;
	}
	function prepareToHydrateHostInstance(fiber) {
		var instance = fiber.stateNode, type = fiber.type, props = fiber.memoizedProps;
		instance[internalInstanceKey] = fiber;
		instance[internalPropsKey] = props;
		switch (type) {
			case "dialog":
				listenToNonDelegatedEvent("cancel", instance);
				listenToNonDelegatedEvent("close", instance);
				break;
			case "iframe":
			case "object":
			case "embed":
				listenToNonDelegatedEvent("load", instance);
				break;
			case "video":
			case "audio":
				for (type = 0; type < mediaEventTypes.length; type++) listenToNonDelegatedEvent(mediaEventTypes[type], instance);
				break;
			case "source":
				listenToNonDelegatedEvent("error", instance);
				break;
			case "img":
			case "image":
			case "link":
				listenToNonDelegatedEvent("error", instance);
				listenToNonDelegatedEvent("load", instance);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", instance);
				break;
			case "input":
				listenToNonDelegatedEvent("invalid", instance);
				initInput(instance, props.value, props.defaultValue, props.checked, props.defaultChecked, props.type, props.name, !0);
				break;
			case "select":
				listenToNonDelegatedEvent("invalid", instance);
				break;
			case "textarea": listenToNonDelegatedEvent("invalid", instance), initTextarea(instance, props.value, props.defaultValue, props.children);
		}
		type = props.children;
		"string" !== typeof type && "number" !== typeof type && "bigint" !== typeof type || instance.textContent === "" + type || !0 === props.suppressHydrationWarning || checkForUnmatchedText(instance.textContent, type) ? (null != props.popover && (listenToNonDelegatedEvent("beforetoggle", instance), listenToNonDelegatedEvent("toggle", instance)), null != props.onScroll && listenToNonDelegatedEvent("scroll", instance), null != props.onScrollEnd && listenToNonDelegatedEvent("scrollend", instance), null != props.onClick && (instance.onclick = noop$1), instance = !0) : instance = !1;
		instance || throwOnHydrationMismatch(fiber, !0);
	}
	function popToNextHostParent(fiber) {
		for (hydrationParentFiber = fiber.return; hydrationParentFiber;) switch (hydrationParentFiber.tag) {
			case 5:
			case 31:
			case 13:
				rootOrSingletonContext = !1;
				return;
			case 27:
			case 3:
				rootOrSingletonContext = !0;
				return;
			default: hydrationParentFiber = hydrationParentFiber.return;
		}
	}
	function popHydrationState(fiber) {
		if (fiber !== hydrationParentFiber) return !1;
		if (!isHydrating) return popToNextHostParent(fiber), isHydrating = !0, !1;
		var tag = fiber.tag, JSCompiler_temp;
		if (JSCompiler_temp = 3 !== tag && 27 !== tag) {
			if (JSCompiler_temp = 5 === tag) JSCompiler_temp = fiber.type, JSCompiler_temp = !("form" !== JSCompiler_temp && "button" !== JSCompiler_temp) || shouldSetTextContent(fiber.type, fiber.memoizedProps);
			JSCompiler_temp = !JSCompiler_temp;
		}
		JSCompiler_temp && nextHydratableInstance && throwOnHydrationMismatch(fiber);
		popToNextHostParent(fiber);
		if (13 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else if (31 === tag) {
			fiber = fiber.memoizedState;
			fiber = null !== fiber ? fiber.dehydrated : null;
			if (!fiber) throw Error(formatProdErrorMessage(317));
			nextHydratableInstance = getNextHydratableInstanceAfterHydrationBoundary(fiber);
		} else 27 === tag ? (tag = nextHydratableInstance, isSingletonScope(fiber.type) ? (fiber = previousHydratableOnEnteringScopedSingleton, previousHydratableOnEnteringScopedSingleton = null, nextHydratableInstance = fiber) : nextHydratableInstance = tag) : nextHydratableInstance = hydrationParentFiber ? getNextHydratable(fiber.stateNode.nextSibling) : null;
		return !0;
	}
	function resetHydrationState() {
		nextHydratableInstance = hydrationParentFiber = null;
		isHydrating = !1;
	}
	function upgradeHydrationErrorsToRecoverable() {
		var queuedErrors = hydrationErrors;
		null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, queuedErrors), hydrationErrors = null);
		return queuedErrors;
	}
	function queueHydrationError(error) {
		null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
	}
	var valueCursor = createCursor(null);
	var currentlyRenderingFiber$1 = null;
	var lastContextDependency = null;
	function pushProvider(providerFiber, context, nextValue) {
		push(valueCursor, context._currentValue);
		context._currentValue = nextValue;
	}
	function popProvider(context) {
		context._currentValue = valueCursor.current;
		pop(valueCursor);
	}
	function scheduleContextWorkOnParentPath(parent, renderLanes, propagationRoot) {
		for (; null !== parent;) {
			var alternate = parent.alternate;
			(parent.childLanes & renderLanes) !== renderLanes ? (parent.childLanes |= renderLanes, null !== alternate && (alternate.childLanes |= renderLanes)) : null !== alternate && (alternate.childLanes & renderLanes) !== renderLanes && (alternate.childLanes |= renderLanes);
			if (parent === propagationRoot) break;
			parent = parent.return;
		}
	}
	function propagateContextChanges(workInProgress, contexts, renderLanes, forcePropagateEntireTree) {
		var fiber = workInProgress.child;
		null !== fiber && (fiber.return = workInProgress);
		for (; null !== fiber;) {
			var list = fiber.dependencies;
			if (null !== list) {
				var nextFiber = fiber.child;
				list = list.firstContext;
				a: for (; null !== list;) {
					var dependency = list;
					list = fiber;
					for (var i = 0; i < contexts.length; i++) if (dependency.context === contexts[i]) {
						list.lanes |= renderLanes;
						dependency = list.alternate;
						null !== dependency && (dependency.lanes |= renderLanes);
						scheduleContextWorkOnParentPath(list.return, renderLanes, workInProgress);
						forcePropagateEntireTree || (nextFiber = null);
						break a;
					}
					list = dependency.next;
				}
			} else if (18 === fiber.tag) {
				nextFiber = fiber.return;
				if (null === nextFiber) throw Error(formatProdErrorMessage(341));
				nextFiber.lanes |= renderLanes;
				list = nextFiber.alternate;
				null !== list && (list.lanes |= renderLanes);
				scheduleContextWorkOnParentPath(nextFiber, renderLanes, workInProgress);
				nextFiber = null;
			} else 13 === fiber.tag && null !== fiber.memoizedState && null === fiber.memoizedState.dehydrated ? (fiber.lanes |= renderLanes, nextFiber = fiber.alternate, null !== nextFiber && (nextFiber.lanes |= renderLanes), scheduleContextWorkOnParentPath(fiber.return, renderLanes, workInProgress), nextFiber = fiber.child, nextFiber = null !== nextFiber ? nextFiber.sibling : null) : nextFiber = fiber.child;
			if (null !== nextFiber) nextFiber.return = fiber;
			else for (nextFiber = fiber; null !== nextFiber;) {
				if (nextFiber === workInProgress) {
					nextFiber = null;
					break;
				}
				fiber = nextFiber.sibling;
				if (null !== fiber) {
					fiber.return = nextFiber.return;
					nextFiber = fiber;
					break;
				}
				nextFiber = nextFiber.return;
			}
			fiber = nextFiber;
		}
	}
	function propagateParentContextChanges(current, workInProgress, renderLanes, forcePropagateEntireTree) {
		current = null;
		for (var parent = workInProgress, isInsidePropagationBailout = !1; null !== parent;) {
			if (!isInsidePropagationBailout) {
				if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = !0;
				else if (0 !== (parent.flags & 262144)) break;
			}
			if (10 === parent.tag) {
				var currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent = currentParent.memoizedProps;
				if (null !== currentParent) {
					var context = parent.type;
					objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
				}
			} else if (parent === hostTransitionProviderCursor.current) {
				currentParent = parent.alternate;
				if (null === currentParent) throw Error(formatProdErrorMessage(387));
				currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
			}
			parent = parent.return;
		}
		null !== current && propagateContextChanges(workInProgress, current, renderLanes, forcePropagateEntireTree);
		workInProgress.flags |= 262144;
		return null !== current;
	}
	function checkIfContextChanged(currentDependencies) {
		for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies;) {
			if (!objectIs(currentDependencies.context._currentValue, currentDependencies.memoizedValue)) return !0;
			currentDependencies = currentDependencies.next;
		}
		return !1;
	}
	function prepareToReadContext(workInProgress) {
		currentlyRenderingFiber$1 = workInProgress;
		lastContextDependency = null;
		workInProgress = workInProgress.dependencies;
		null !== workInProgress && (workInProgress.firstContext = null);
	}
	function readContext(context) {
		return readContextForConsumer(currentlyRenderingFiber$1, context);
	}
	function readContextDuringReconciliation(consumer, context) {
		null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
		return readContextForConsumer(consumer, context);
	}
	function readContextForConsumer(consumer, context) {
		var value = context._currentValue;
		context = {
			context,
			memoizedValue: value,
			next: null
		};
		if (null === lastContextDependency) {
			if (null === consumer) throw Error(formatProdErrorMessage(308));
			lastContextDependency = context;
			consumer.dependencies = {
				lanes: 0,
				firstContext: context
			};
			consumer.flags |= 524288;
		} else lastContextDependency = lastContextDependency.next = context;
		return value;
	}
	var AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
		var listeners = [], signal = this.signal = {
			aborted: !1,
			addEventListener: function(type, listener) {
				listeners.push(listener);
			}
		};
		this.abort = function() {
			signal.aborted = !0;
			listeners.forEach(function(listener) {
				return listener();
			});
		};
	};
	var scheduleCallback$2 = Scheduler.unstable_scheduleCallback;
	var NormalPriority = Scheduler.unstable_NormalPriority;
	var CacheContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function createCache() {
		return {
			controller: new AbortControllerLocal(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function releaseCache(cache) {
		cache.refCount--;
		0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
			cache.controller.abort();
		});
	}
	function queueTransitionTypes(root, transitionTypes) {
		if (0 !== (root.pendingLanes & 4194048)) {
			var queued = root.transitionTypes;
			null === queued && (queued = root.transitionTypes = []);
			for (root = 0; root < transitionTypes.length; root++) {
				var transitionType = transitionTypes[root];
				-1 === queued.indexOf(transitionType) && queued.push(transitionType);
			}
		}
	}
	var entangledTransitionTypes = null;
	function claimQueuedTransitionTypes(root) {
		var claimed = root.transitionTypes;
		root.transitionTypes = null;
		return claimed;
	}
	var currentEntangledListeners = null;
	var currentEntangledPendingCount = 0;
	var currentEntangledLane = 0;
	var currentEntangledActionThenable = null;
	function entangleAsyncAction(transition, thenable) {
		if (null === currentEntangledListeners) {
			var entangledListeners = currentEntangledListeners = [];
			currentEntangledPendingCount = 0;
			currentEntangledLane = requestTransitionLane();
			currentEntangledActionThenable = {
				status: "pending",
				value: void 0,
				then: function(resolve) {
					entangledListeners.push(resolve);
				}
			};
		}
		currentEntangledPendingCount++;
		thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
		return thenable;
	}
	function pingEngtangledActionScope() {
		if (0 === --currentEntangledPendingCount && (entangledTransitionTypes = null, null !== currentEntangledListeners)) {
			null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
			var listeners = currentEntangledListeners;
			currentEntangledListeners = null;
			currentEntangledLane = 0;
			currentEntangledActionThenable = null;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
		}
	}
	function chainThenableValue(thenable, result) {
		var listeners = [], thenableWithOverride = {
			status: "pending",
			value: null,
			reason: null,
			then: function(resolve) {
				listeners.push(resolve);
			}
		};
		thenable.then(function() {
			thenableWithOverride.status = "fulfilled";
			thenableWithOverride.value = result;
			for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
		}, function(error) {
			thenableWithOverride.status = "rejected";
			thenableWithOverride.reason = error;
			for (error = 0; error < listeners.length; error++) (0, listeners[error])(void 0);
		});
		return thenableWithOverride;
	}
	var prevOnStartTransitionFinish = ReactSharedInternals.S;
	ReactSharedInternals.S = function(transition, returnValue) {
		globalMostRecentTransitionTime = now();
		"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
		if (null !== entangledTransitionTypes) for (var root$28 = firstScheduledRoot; null !== root$28;) queueTransitionTypes(root$28, entangledTransitionTypes), root$28 = root$28.next;
		root$28 = transition.types;
		if (null !== root$28) {
			for (var root$29 = firstScheduledRoot; null !== root$29;) queueTransitionTypes(root$29, root$28), root$29 = root$29.next;
			if (0 !== currentEntangledLane) {
				root$29 = entangledTransitionTypes;
				null === root$29 && (root$29 = entangledTransitionTypes = []);
				for (var i = 0; i < root$28.length; i++) {
					var transitionType = root$28[i];
					-1 === root$29.indexOf(transitionType) && root$29.push(transitionType);
				}
			}
		}
		null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
	};
	var resumedCache = createCursor(null);
	function peekCacheFromPool() {
		var cacheResumedFromPreviousRender = resumedCache.current;
		return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
	}
	function pushTransition(offscreenWorkInProgress, prevCachePool) {
		null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
	}
	function getSuspendedCache() {
		var cacheFromPool = peekCacheFromPool();
		return null === cacheFromPool ? null : {
			parent: CacheContext._currentValue,
			pool: cacheFromPool
		};
	}
	var SuspenseException = Error(formatProdErrorMessage(460));
	var SuspenseyCommitException = Error(formatProdErrorMessage(474));
	var SuspenseActionException = Error(formatProdErrorMessage(542));
	var noopSuspenseyCommitThenable = { then: function() {} };
	function isThenableResolved(thenable) {
		thenable = thenable.status;
		return "fulfilled" === thenable || "rejected" === thenable;
	}
	function trackUsedThenable(thenableState, thenable, index) {
		index = thenableState[index];
		void 0 === index ? thenableState.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected":
				thenableState = thenable.reason;
				checkIfUseWrappedInAsyncCatch(thenableState);
				if (void 0 === thenableState && !("reason" in thenable)) throw Error(formatProdErrorMessage(600));
				throw thenableState;
			default:
				if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
				else {
					thenableState = workInProgressRoot;
					if (null !== thenableState && 100 < thenableState.shellSuspendCounter) throw Error(formatProdErrorMessage(482));
					thenableState = thenable;
					thenableState.status = "pending";
					thenableState.then(function(fulfilledValue) {
						if ("pending" === thenable.status) {
							var fulfilledThenable = thenable;
							fulfilledThenable.status = "fulfilled";
							fulfilledThenable.value = fulfilledValue;
						}
					}, function(error) {
						if ("pending" === thenable.status) {
							var rejectedThenable = thenable;
							rejectedThenable.status = "rejected";
							rejectedThenable.reason = error;
						}
					});
				}
				switch (thenable.status) {
					case "fulfilled": return thenable.value;
					case "rejected": throw thenableState = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState), thenableState;
				}
				suspendedThenable = thenable;
				throw SuspenseException;
		}
	}
	function resolveLazy(lazyType) {
		try {
			var init = lazyType._init;
			return init(lazyType._payload);
		} catch (x) {
			if (null !== x && "object" === typeof x && "function" === typeof x.then) throw suspendedThenable = x, SuspenseException;
			throw x;
		}
	}
	var suspendedThenable = null;
	function getSuspendedThenable() {
		if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
		var thenable = suspendedThenable;
		suspendedThenable = null;
		return thenable;
	}
	function checkIfUseWrappedInAsyncCatch(rejectedReason) {
		if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException) throw Error(formatProdErrorMessage(483));
	}
	var thenableState$1 = null;
	var thenableIndexCounter$1 = 0;
	function unwrapThenable(thenable) {
		var index = thenableIndexCounter$1;
		thenableIndexCounter$1 += 1;
		null === thenableState$1 && (thenableState$1 = []);
		return trackUsedThenable(thenableState$1, thenable, index);
	}
	function coerceRef(workInProgress, element) {
		element = element.props.ref;
		workInProgress.ref = void 0 !== element ? element : null;
	}
	function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
		if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE) throw Error(formatProdErrorMessage(525));
		returnFiber = Object.prototype.toString.call(newChild);
		throw Error(formatProdErrorMessage(31, "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber));
	}
	function createChildReconciler(shouldTrackSideEffects) {
		function deleteChild(returnFiber, childToDelete) {
			if (shouldTrackSideEffects) {
				var deletions = returnFiber.deletions;
				null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
			}
		}
		function deleteRemainingChildren(returnFiber, currentFirstChild) {
			if (!shouldTrackSideEffects) return null;
			for (; null !== currentFirstChild;) deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return null;
		}
		function mapRemainingChildren(currentFirstChild) {
			for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild;) null === currentFirstChild.key ? existingChildren.set(currentFirstChild.index, currentFirstChild) : existingChildren.set(currentFirstChild.key, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
			return existingChildren;
		}
		function useFiber(fiber, pendingProps) {
			fiber = createWorkInProgress(fiber, pendingProps);
			fiber.index = 0;
			fiber.sibling = null;
			return fiber;
		}
		function placeChild(newFiber, lastPlacedIndex, newIndex) {
			newFiber.index = newIndex;
			if (!shouldTrackSideEffects) return newFiber.flags |= 1048576, lastPlacedIndex;
			newIndex = newFiber.alternate;
			if (null !== newIndex) return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 2, lastPlacedIndex) : newIndex;
			newFiber.flags |= 134217730;
			return lastPlacedIndex;
		}
		function placeSingleChild(newFiber) {
			shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 134217730);
			return newFiber;
		}
		function updateTextNode(returnFiber, current, textContent, lanes) {
			if (null === current || 6 !== current.tag) return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, textContent);
			current.return = returnFiber;
			return current;
		}
		function updateElement(returnFiber, current, element, lanes) {
			var elementType = element.type;
			if (elementType === REACT_FRAGMENT_TYPE) return returnFiber = updateFragment(returnFiber, current, element.props.children, lanes, element.key), coerceRef(returnFiber, element), returnFiber;
			if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type)) return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
			current = createFiberFromTypeAndProps(element.type, element.key, element.props, null, returnFiber.mode, lanes);
			coerceRef(current, element);
			current.return = returnFiber;
			return current;
		}
		function updatePortal(returnFiber, current, portal, lanes) {
			if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation) return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
			current = useFiber(current, portal.children || []);
			current.return = returnFiber;
			return current;
		}
		function updateFragment(returnFiber, current, fragment, lanes, key) {
			if (null === current || 7 !== current.tag) return current = createFiberFromFragment(fragment, returnFiber.mode, lanes, key), current.return = returnFiber, current;
			current = useFiber(current, fragment);
			current.return = returnFiber;
			return current;
		}
		function createChild(returnFiber, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return newChild = createFiberFromText("" + newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
					case REACT_PORTAL_TYPE: return newChild = createFiberFromPortal(newChild, returnFiber.mode, lanes), newChild.return = returnFiber, newChild;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return newChild = createFiberFromFragment(newChild, returnFiber.mode, lanes, null), newChild.return = returnFiber, newChild;
				if ("function" === typeof newChild.then) return createChild(returnFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return createChild(returnFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateSlot(returnFiber, oldFiber, newChild, lanes) {
			var key = null !== oldFiber ? oldFiber.key : null;
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_PORTAL_TYPE: return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateSlot(returnFiber, oldFiber, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateSlot(returnFiber, oldFiber, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
			if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild) return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
					case REACT_PORTAL_TYPE: return existingChildren = existingChildren.get(null === newChild.key ? newIdx : newChild.key) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes);
				}
				if (isArrayImpl(newChild) || getIteratorFn(newChild)) return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
				if ("function" === typeof newChild.then) return updateFromMap(existingChildren, returnFiber, newIdx, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return updateFromMap(existingChildren, returnFiber, newIdx, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return null;
		}
		function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, newChildren[newIdx], lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (newIdx === newChildren.length) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; newIdx < newChildren.length; newIdx++) oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(oldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++) nextOldFiber = updateFromMap(oldFiber, returnFiber, newIdx, newChildren[newIdx], lanes), null !== nextOldFiber && (shouldTrackSideEffects && (newFiber = nextOldFiber.alternate, null !== newFiber && oldFiber.delete(null === newFiber.key ? newIdx : newFiber.key)), currentFirstChild = placeChild(nextOldFiber, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
			if (null == newChildren) throw Error(formatProdErrorMessage(151));
			for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
				oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
				var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
				if (null === newFiber) {
					null === oldFiber && (oldFiber = nextOldFiber);
					break;
				}
				shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
				currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
				null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
				previousNewFiber = newFiber;
				oldFiber = nextOldFiber;
			}
			if (step.done) return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
			if (null === oldFiber) {
				for (; !step.done; newIdx++, step = newChildren.next()) step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
				isHydrating && pushTreeFork(returnFiber, newIdx);
				return resultingFirstChild;
			}
			for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next()) step = updateFromMap(oldFiber, returnFiber, newIdx, step.value, lanes), null !== step && (shouldTrackSideEffects && (nextOldFiber = step.alternate, null !== nextOldFiber && oldFiber.delete(null === nextOldFiber.key ? newIdx : nextOldFiber.key)), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
			shouldTrackSideEffects && oldFiber.forEach(function(child) {
				return deleteChild(returnFiber, child);
			});
			isHydrating && pushTreeFork(returnFiber, newIdx);
			return resultingFirstChild;
		}
		function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
			"object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && void 0 === newChild.props.ref && (newChild = newChild.props.children);
			if ("object" === typeof newChild && null !== newChild) {
				switch (newChild.$$typeof) {
					case REACT_ELEMENT_TYPE:
						a: {
							for (var key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) {
									key = newChild.type;
									if (key === REACT_FRAGMENT_TYPE) {
										if (7 === currentFirstChild.tag) {
											deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
											lanes = useFiber(currentFirstChild, newChild.props.children);
											coerceRef(lanes, newChild);
											lanes.return = returnFiber;
											returnFiber = lanes;
											break a;
										}
									} else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
										deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
										lanes = useFiber(currentFirstChild, newChild.props);
										coerceRef(lanes, newChild);
										lanes.return = returnFiber;
										returnFiber = lanes;
										break a;
									}
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								} else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(newChild.props.children, returnFiber.mode, lanes, newChild.key), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(newChild.type, newChild.key, newChild.props, null, returnFiber.mode, lanes), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
						}
						return placeSingleChild(returnFiber);
					case REACT_PORTAL_TYPE:
						a: {
							for (key = newChild.key; null !== currentFirstChild;) {
								if (currentFirstChild.key === key) if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
									deleteRemainingChildren(returnFiber, currentFirstChild.sibling);
									lanes = useFiber(currentFirstChild, newChild.children || []);
									lanes.return = returnFiber;
									returnFiber = lanes;
									break a;
								} else {
									deleteRemainingChildren(returnFiber, currentFirstChild);
									break;
								}
								else deleteChild(returnFiber, currentFirstChild);
								currentFirstChild = currentFirstChild.sibling;
							}
							lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
							lanes.return = returnFiber;
							returnFiber = lanes;
						}
						return placeSingleChild(returnFiber);
					case REACT_LAZY_TYPE: return newChild = resolveLazy(newChild), reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				}
				if (isArrayImpl(newChild)) return reconcileChildrenArray(returnFiber, currentFirstChild, newChild, lanes);
				if (getIteratorFn(newChild)) {
					key = getIteratorFn(newChild);
					if ("function" !== typeof key) throw Error(formatProdErrorMessage(150));
					newChild = key.call(newChild);
					return reconcileChildrenIterator(returnFiber, currentFirstChild, newChild, lanes);
				}
				if ("function" === typeof newChild.then) return reconcileChildFibersImpl(returnFiber, currentFirstChild, unwrapThenable(newChild), lanes);
				if (newChild.$$typeof === REACT_CONTEXT_TYPE) return reconcileChildFibersImpl(returnFiber, currentFirstChild, readContextDuringReconciliation(returnFiber, newChild), lanes);
				throwOnInvalidObjectTypeImpl(returnFiber, newChild);
			}
			return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
		}
		return function(returnFiber, currentFirstChild, newChild, lanes) {
			try {
				thenableIndexCounter$1 = 0;
				var firstChildFiber = reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes);
				thenableState$1 = null;
				return firstChildFiber;
			} catch (x) {
				if (x === SuspenseException || x === SuspenseActionException) throw x;
				var fiber = createFiberImplClass(29, x, null, returnFiber.mode);
				fiber.lanes = lanes;
				fiber.return = returnFiber;
				return fiber;
			}
		};
	}
	var reconcileChildFibers = createChildReconciler(!0);
	var mountChildFibers = createChildReconciler(!1);
	var hasForceUpdate = !1;
	function initializeUpdateQueue(fiber) {
		fiber.updateQueue = {
			baseState: fiber.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function cloneUpdateQueue(current, workInProgress) {
		current = current.updateQueue;
		workInProgress.updateQueue === current && (workInProgress.updateQueue = {
			baseState: current.baseState,
			firstBaseUpdate: current.firstBaseUpdate,
			lastBaseUpdate: current.lastBaseUpdate,
			shared: current.shared,
			callbacks: null
		});
	}
	function createUpdate(lane) {
		return {
			lane,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function enqueueUpdate(fiber, update, lane) {
		var updateQueue = fiber.updateQueue;
		if (null === updateQueue) return null;
		updateQueue = updateQueue.shared;
		if (0 !== (executionContext & 2)) {
			var pending = updateQueue.pending;
			null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
			updateQueue.pending = update;
			update = getRootForUpdatedFiber(fiber);
			markUpdateLaneFromFiberToRoot(fiber, null, lane);
			return update;
		}
		enqueueUpdate$1(fiber, updateQueue, update, lane);
		return getRootForUpdatedFiber(fiber);
	}
	function entangleTransitions(root, fiber, lane) {
		fiber = fiber.updateQueue;
		if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
			var queueLanes = fiber.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			fiber.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	function enqueueCapturedUpdate(workInProgress, capturedUpdate) {
		var queue = workInProgress.updateQueue, current = workInProgress.alternate;
		if (null !== current && (current = current.updateQueue, queue === current)) {
			var newFirst = null, newLast = null;
			queue = queue.firstBaseUpdate;
			if (null !== queue) {
				do {
					var clone = {
						lane: queue.lane,
						tag: queue.tag,
						payload: queue.payload,
						callback: null,
						next: null
					};
					null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
					queue = queue.next;
				} while (null !== queue);
				null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
			} else newFirst = newLast = capturedUpdate;
			queue = {
				baseState: current.baseState,
				firstBaseUpdate: newFirst,
				lastBaseUpdate: newLast,
				shared: current.shared,
				callbacks: current.callbacks
			};
			workInProgress.updateQueue = queue;
			return;
		}
		workInProgress = queue.lastBaseUpdate;
		null === workInProgress ? queue.firstBaseUpdate = capturedUpdate : workInProgress.next = capturedUpdate;
		queue.lastBaseUpdate = capturedUpdate;
	}
	var didReadFromEntangledAsyncAction = !1;
	function suspendIfUpdateReadFromEntangledAsyncAction() {
		if (didReadFromEntangledAsyncAction) {
			var entangledActionThenable = currentEntangledActionThenable;
			if (null !== entangledActionThenable) throw entangledActionThenable;
		}
	}
	function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes) {
		didReadFromEntangledAsyncAction = !1;
		var queue = workInProgress$jscomp$0.updateQueue;
		hasForceUpdate = !1;
		var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
		if (null !== pendingQueue) {
			queue.shared.pending = null;
			var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
			lastPendingUpdate.next = null;
			null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
			lastBaseUpdate = lastPendingUpdate;
			var current = workInProgress$jscomp$0.alternate;
			null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
		}
		if (null !== firstBaseUpdate) {
			var newState = queue.baseState;
			lastBaseUpdate = 0;
			current = firstPendingUpdate = lastPendingUpdate = null;
			pendingQueue = firstBaseUpdate;
			do {
				var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
				if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = !0);
					null !== current && (current = current.next = {
						lane: 0,
						tag: pendingQueue.tag,
						payload: pendingQueue.payload,
						callback: null,
						next: null
					});
					a: {
						var workInProgress = workInProgress$jscomp$0, update = pendingQueue;
						updateLane = props;
						var instance = instance$jscomp$0;
						switch (update.tag) {
							case 1:
								workInProgress = update.payload;
								if ("function" === typeof workInProgress) {
									newState = workInProgress.call(instance, newState, updateLane);
									break a;
								}
								newState = workInProgress;
								break a;
							case 3: workInProgress.flags = workInProgress.flags & -65537 | 128;
							case 0:
								workInProgress = update.payload;
								updateLane = "function" === typeof workInProgress ? workInProgress.call(instance, newState, updateLane) : workInProgress;
								if (null === updateLane || void 0 === updateLane) break a;
								newState = assign({}, newState, updateLane);
								break a;
							case 2: hasForceUpdate = !0;
						}
					}
					updateLane = pendingQueue.callback;
					null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
				} else isHiddenUpdate = {
					lane: updateLane,
					tag: pendingQueue.tag,
					payload: pendingQueue.payload,
					callback: pendingQueue.callback,
					next: null
				}, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
				pendingQueue = pendingQueue.next;
				if (null === pendingQueue) if (pendingQueue = queue.shared.pending, null === pendingQueue) break;
				else isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
			} while (1);
			null === current && (lastPendingUpdate = newState);
			queue.baseState = lastPendingUpdate;
			queue.firstBaseUpdate = firstPendingUpdate;
			queue.lastBaseUpdate = current;
			null === firstBaseUpdate && (queue.shared.lanes = 0);
			workInProgressRootSkippedLanes |= lastBaseUpdate;
			workInProgress$jscomp$0.lanes = lastBaseUpdate;
			workInProgress$jscomp$0.memoizedState = newState;
		}
	}
	function callCallback(callback, context) {
		if ("function" !== typeof callback) throw Error(formatProdErrorMessage(191, callback));
		callback.call(context);
	}
	function commitCallbacks(updateQueue, context) {
		var callbacks = updateQueue.callbacks;
		if (null !== callbacks) for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++) callCallback(callbacks[updateQueue], context);
	}
	var currentTreeHiddenStackCursor = createCursor(null);
	var prevEntangledRenderLanesCursor = createCursor(0);
	function pushHiddenContext(fiber, context) {
		fiber = entangledRenderLanes;
		push(prevEntangledRenderLanesCursor, fiber);
		push(currentTreeHiddenStackCursor, context);
		entangledRenderLanes = fiber | context.baseLanes;
	}
	function reuseHiddenContextOnStack() {
		push(prevEntangledRenderLanesCursor, entangledRenderLanes);
		push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
	}
	function popHiddenContext() {
		entangledRenderLanes = prevEntangledRenderLanesCursor.current;
		pop(currentTreeHiddenStackCursor);
		pop(prevEntangledRenderLanesCursor);
	}
	var suspenseHandlerStackCursor = createCursor(null);
	var shellBoundary = null;
	function pushPrimaryTreeSuspenseHandler(handler) {
		var current = handler.alternate;
		push(suspenseStackCursor, suspenseStackCursor.current & 1);
		push(suspenseHandlerStackCursor, handler);
		null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
	}
	function pushDehydratedActivitySuspenseHandler(fiber) {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, fiber);
		null === shellBoundary && (shellBoundary = fiber);
	}
	function pushOffscreenSuspenseHandler(fiber) {
		22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
	}
	function reuseSuspenseHandlerOnStack() {
		push(suspenseStackCursor, suspenseStackCursor.current);
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
	}
	function popSuspenseHandler(fiber) {
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
		pop(suspenseStackCursor);
	}
	var suspenseStackCursor = createCursor(0);
	function pushSuspenseListContext(fiber, newContext) {
		push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
		push(suspenseStackCursor, newContext);
	}
	function popSuspenseListContext(fiber) {
		pop(suspenseStackCursor);
		pop(suspenseHandlerStackCursor);
		shellBoundary === fiber && (shellBoundary = null);
	}
	function findFirstSuspended(row) {
		for (var node = row; null !== node;) {
			if (13 === node.tag) {
				var state = node.memoizedState;
				if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state))) return node;
			} else if (19 === node.tag && "independent" !== node.memoizedProps.revealOrder) {
				if (0 !== (node.flags & 128)) return node;
			} else if (null !== node.child) {
				node.child.return = node;
				node = node.child;
				continue;
			}
			if (node === row) break;
			for (; null === node.sibling;) {
				if (null === node.return || node.return === row) return null;
				node = node.return;
			}
			node.sibling.return = node.return;
			node = node.sibling;
		}
		return null;
	}
	var renderLanes = 0;
	var currentlyRenderingFiber = null;
	var currentHook = null;
	var workInProgressHook = null;
	var didScheduleRenderPhaseUpdate = !1;
	var didScheduleRenderPhaseUpdateDuringThisPass = !1;
	var shouldDoubleInvokeUserFnsInHooksDEV = !1;
	var localIdCounter = 0;
	var thenableIndexCounter = 0;
	var thenableState = null;
	var globalClientIdCounter = 0;
	function throwInvalidHookError() {
		throw Error(formatProdErrorMessage(321));
	}
	function areHookInputsEqual(nextDeps, prevDeps) {
		if (null === prevDeps) return !1;
		for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++) if (!objectIs(nextDeps[i], prevDeps[i])) return !1;
		return !0;
	}
	function renderWithHooks(current, workInProgress, Component, props, secondArg, nextRenderLanes) {
		renderLanes = nextRenderLanes;
		currentlyRenderingFiber = workInProgress;
		workInProgress.memoizedState = null;
		workInProgress.updateQueue = null;
		workInProgress.lanes = 0;
		ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		nextRenderLanes = Component(props, secondArg);
		shouldDoubleInvokeUserFnsInHooksDEV = !1;
		didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(workInProgress, Component, props, secondArg));
		finishRenderingHooks(current);
		return nextRenderLanes;
	}
	function finishRenderingHooks(current) {
		ReactSharedInternals.H = ContextOnlyDispatcher;
		var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdate = !1;
		thenableIndexCounter = 0;
		thenableState = null;
		if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
		null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = !0));
	}
	function renderWithHooksAgain(workInProgress, Component, props, secondArg) {
		currentlyRenderingFiber = workInProgress;
		var numberOfReRenders = 0;
		do {
			didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
			thenableIndexCounter = 0;
			didScheduleRenderPhaseUpdateDuringThisPass = !1;
			if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
			numberOfReRenders += 1;
			workInProgressHook = currentHook = null;
			if (null != workInProgress.updateQueue) {
				var children = workInProgress.updateQueue;
				children.lastEffect = null;
				children.events = null;
				children.stores = null;
				null != children.memoCache && (children.memoCache.index = 0);
			}
			ReactSharedInternals.H = HooksDispatcherOnRerender;
			children = Component(props, secondArg);
		} while (didScheduleRenderPhaseUpdateDuringThisPass);
		return children;
	}
	function TransitionAwareHostComponent() {
		var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
		maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
		dispatcher = dispatcher.useState()[0];
		(null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
		return maybeThenable;
	}
	function checkDidRenderIdHook() {
		var didRenderIdHook = 0 !== localIdCounter;
		localIdCounter = 0;
		return didRenderIdHook;
	}
	function bailoutHooks(current, workInProgress, lanes) {
		workInProgress.updateQueue = current.updateQueue;
		workInProgress.flags &= -2053;
		current.lanes &= ~lanes;
	}
	function resetHooksOnUnwind(workInProgress) {
		if (didScheduleRenderPhaseUpdate) {
			for (workInProgress = workInProgress.memoizedState; null !== workInProgress;) {
				var queue = workInProgress.queue;
				null !== queue && (queue.pending = null);
				workInProgress = workInProgress.next;
			}
			didScheduleRenderPhaseUpdate = !1;
		}
		renderLanes = 0;
		workInProgressHook = currentHook = currentlyRenderingFiber = null;
		didScheduleRenderPhaseUpdateDuringThisPass = !1;
		thenableIndexCounter = localIdCounter = 0;
		thenableState = null;
	}
	function mountWorkInProgressHook() {
		var hook = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
		return workInProgressHook;
	}
	function updateWorkInProgressHook() {
		if (null === currentHook) {
			var nextCurrentHook = currentlyRenderingFiber.alternate;
			nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
		} else nextCurrentHook = currentHook.next;
		var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
		if (null !== nextWorkInProgressHook) workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
		else {
			if (null === nextCurrentHook) {
				if (null === currentlyRenderingFiber.alternate) throw Error(formatProdErrorMessage(467));
				throw Error(formatProdErrorMessage(310));
			}
			currentHook = nextCurrentHook;
			nextCurrentHook = {
				memoizedState: currentHook.memoizedState,
				baseState: currentHook.baseState,
				baseQueue: currentHook.baseQueue,
				queue: currentHook.queue,
				next: null
			};
			null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
		}
		return workInProgressHook;
	}
	function createFunctionComponentUpdateQueue() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function useThenable(thenable) {
		var index = thenableIndexCounter;
		thenableIndexCounter += 1;
		null === thenableState && (thenableState = []);
		thenable = trackUsedThenable(thenableState, thenable, index);
		index = currentlyRenderingFiber;
		null === (null === workInProgressHook ? index.memoizedState : workInProgressHook.next) && (index = index.alternate, ReactSharedInternals.H = null === index || null === index.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
		return thenable;
	}
	function use(usable) {
		if (null !== usable && "object" === typeof usable) {
			if ("function" === typeof usable.then) return useThenable(usable);
			if (usable.$$typeof === REACT_RECOVERABLE_TYPE) return;
			if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
		}
		throw Error(formatProdErrorMessage(438, String(usable)));
	}
	function useMemoCache(size) {
		var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
		null !== updateQueue && (memoCache = updateQueue.memoCache);
		if (null == memoCache) {
			var current = currentlyRenderingFiber.alternate;
			null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
				data: current.data.map(function(array) {
					return array.slice();
				}),
				index: 0
			})));
		}
		memoCache ??= {
			data: [],
			index: 0
		};
		null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
		updateQueue.memoCache = memoCache;
		updateQueue = memoCache.data[memoCache.index];
		if (void 0 === updateQueue) for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++) updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
		memoCache.index++;
		return updateQueue;
	}
	function basicStateReducer(state, action) {
		return "function" === typeof action ? action(state) : action;
	}
	function updateReducer(reducer) {
		return updateReducerImpl(updateWorkInProgressHook(), currentHook, reducer);
	}
	function updateReducerImpl(hook, current, reducer) {
		var queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
		if (null !== pendingQueue) {
			if (null !== baseQueue) {
				var baseFirst = baseQueue.next;
				baseQueue.next = pendingQueue.next;
				pendingQueue.next = baseFirst;
			}
			current.baseQueue = baseQueue = pendingQueue;
			queue.pending = null;
		}
		pendingQueue = hook.baseState;
		if (null === baseQueue) hook.memoizedState = pendingQueue;
		else {
			current = baseQueue.next;
			var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$64 = !1;
			do {
				var updateLane = update.lane & -536870913;
				if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
					var revertLane = update.revertLane;
					if (0 === revertLane) null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = !0);
					else if ((renderLanes & revertLane) === revertLane) {
						update = update.next;
						revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$64 = !0);
						continue;
					} else updateLane = {
						lane: 0,
						revertLane: update.revertLane,
						gesture: null,
						action: update.action,
						hasEagerState: update.hasEagerState,
						eagerState: update.eagerState,
						next: null
					}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
					updateLane = update.action;
					shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
					pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
				} else revertLane = {
					lane: updateLane,
					revertLane: update.revertLane,
					gesture: update.gesture,
					action: update.action,
					hasEagerState: update.hasEagerState,
					eagerState: update.eagerState,
					next: null
				}, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
				update = update.next;
			} while (null !== update && update !== current);
			null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
			if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = !0, didReadFromEntangledAsyncAction$64 && (reducer = currentEntangledActionThenable, null !== reducer))) throw reducer;
			hook.memoizedState = pendingQueue;
			hook.baseState = baseFirst;
			hook.baseQueue = newBaseQueueLast;
			queue.lastRenderedState = pendingQueue;
		}
		null === baseQueue && (queue.lanes = 0);
		return [hook.memoizedState, queue.dispatch];
	}
	function rerenderReducer(reducer) {
		var hook = updateWorkInProgressHook(), queue = hook.queue;
		if (null === queue) throw Error(formatProdErrorMessage(311));
		queue.lastRenderedReducer = reducer;
		var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
		if (null !== lastRenderPhaseUpdate) {
			queue.pending = null;
			var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
			do
				newState = reducer(newState, update.action), update = update.next;
			while (update !== lastRenderPhaseUpdate);
			objectIs(newState, hook.memoizedState) || (didReceiveUpdate = !0);
			hook.memoizedState = newState;
			null === hook.baseQueue && (hook.baseState = newState);
			queue.lastRenderedState = newState;
		}
		return [newState, dispatch];
	}
	function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
		if (isHydrating$jscomp$0) {
			if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
			getServerSnapshot = getServerSnapshot();
		} else getServerSnapshot = getSnapshot();
		var snapshotChanged = !objectIs((currentHook || hook).memoizedState, getServerSnapshot);
		snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = !0);
		hook = hook.queue;
		updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [subscribe]);
		subscribe = hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && 0 !== (workInProgressHook.memoizedState.tag & 1);
		pushSimpleEffect(subscribe ? 9 : 8, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, hook, getServerSnapshot, getSnapshot), null);
		if (subscribe) {
			fiber.flags |= 2048;
			if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
			isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		}
		return getServerSnapshot;
	}
	function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
		fiber.flags |= 16384;
		fiber = {
			getSnapshot,
			value: renderedSnapshot
		};
		getSnapshot = currentlyRenderingFiber.updateQueue;
		null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
	}
	function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
		inst.value = nextSnapshot;
		inst.getSnapshot = getSnapshot;
		checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
	}
	function subscribeToStore(fiber, inst, subscribe) {
		return subscribe(function() {
			checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		});
	}
	function checkIfSnapshotChanged(inst) {
		var latestGetSnapshot = inst.getSnapshot;
		inst = inst.value;
		try {
			var nextValue = latestGetSnapshot();
			return !objectIs(inst, nextValue);
		} catch (error) {
			return !0;
		}
	}
	function forceStoreRerender(fiber) {
		var root = enqueueConcurrentRenderForLane(fiber, 2);
		null !== root && scheduleUpdateOnFiber(root, fiber, 2);
	}
	function mountStateImpl(initialState) {
		var hook = mountWorkInProgressHook();
		if ("function" === typeof initialState) {
			var initialStateInitializer = initialState;
			initialState = initialStateInitializer();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					initialStateInitializer();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
		}
		hook.memoizedState = hook.baseState = initialState;
		hook.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: basicStateReducer,
			lastRenderedState: initialState
		};
		return hook;
	}
	function updateOptimisticImpl(hook, current, passthrough, reducer) {
		hook.baseState = passthrough;
		return updateReducerImpl(hook, currentHook, "function" === typeof reducer ? reducer : basicStateReducer);
	}
	function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
		if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
		fiber = actionQueue.action;
		if (null !== fiber) {
			var actionNode = {
				payload,
				action: fiber,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(listener) {
					actionNode.listeners.push(listener);
				}
			};
			null !== ReactSharedInternals.T ? setPendingState(!0) : actionNode.isTransition = !1;
			setState(actionNode);
			setPendingState = actionQueue.pending;
			null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
		}
	}
	function runActionStateAction(actionQueue, node) {
		var action = node.action, payload = node.payload, prevState = actionQueue.state;
		if (node.isTransition) {
			var prevTransition = ReactSharedInternals.T, currentTransition = {};
			currentTransition.types = null !== prevTransition ? prevTransition.types : null;
			ReactSharedInternals.T = currentTransition;
			try {
				var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
				null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
				handleActionReturnValue(actionQueue, node, returnValue);
			} catch (error) {
				onActionError(actionQueue, node, error);
			} finally {
				null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
			}
		} else try {
			prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
		} catch (error$70) {
			onActionError(actionQueue, node, error$70);
		}
	}
	function handleActionReturnValue(actionQueue, node, returnValue) {
		null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(function(nextState) {
			onActionSuccess(actionQueue, node, nextState);
		}, function(error) {
			return onActionError(actionQueue, node, error);
		}) : onActionSuccess(actionQueue, node, returnValue);
	}
	function onActionSuccess(actionQueue, actionNode, nextState) {
		actionNode.status = "fulfilled";
		actionNode.value = nextState;
		notifyActionListeners(actionNode);
		actionQueue.state = nextState;
		actionNode = actionQueue.pending;
		null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
	}
	function onActionError(actionQueue, actionNode, error) {
		var last = actionQueue.pending;
		actionQueue.pending = null;
		if (null !== last) {
			last = last.next;
			do
				actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
			while (actionNode !== last);
		}
		actionQueue.action = null;
	}
	function notifyActionListeners(actionNode) {
		actionNode = actionNode.listeners;
		for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
	}
	function actionStateReducer(oldState, newState) {
		return newState;
	}
	function mountActionState(action, initialStateProp) {
		if (isHydrating) {
			var ssrFormState = workInProgressRoot.formState;
			if (null !== ssrFormState) {
				a: {
					var JSCompiler_inline_result = currentlyRenderingFiber;
					if (isHydrating) {
						if (nextHydratableInstance) {
							b: {
								var JSCompiler_inline_result$jscomp$0 = nextHydratableInstance;
								for (var inRootOrSingleton = rootOrSingletonContext; 8 !== JSCompiler_inline_result$jscomp$0.nodeType;) {
									if (!inRootOrSingleton) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
									JSCompiler_inline_result$jscomp$0 = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
									if (null === JSCompiler_inline_result$jscomp$0) {
										JSCompiler_inline_result$jscomp$0 = null;
										break b;
									}
								}
								inRootOrSingleton = JSCompiler_inline_result$jscomp$0.data;
								JSCompiler_inline_result$jscomp$0 = "F!" === inRootOrSingleton || "F" === inRootOrSingleton ? JSCompiler_inline_result$jscomp$0 : null;
							}
							if (JSCompiler_inline_result$jscomp$0) {
								nextHydratableInstance = getNextHydratable(JSCompiler_inline_result$jscomp$0.nextSibling);
								JSCompiler_inline_result = "F!" === JSCompiler_inline_result$jscomp$0.data;
								break a;
							}
						}
						throwOnHydrationMismatch(JSCompiler_inline_result);
					}
					JSCompiler_inline_result = !1;
				}
				JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
			}
		}
		ssrFormState = mountWorkInProgressHook();
		ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
		JSCompiler_inline_result = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: actionStateReducer,
			lastRenderedState: initialStateProp
		};
		ssrFormState.queue = JSCompiler_inline_result;
		ssrFormState = dispatchSetState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result);
		JSCompiler_inline_result.dispatch = ssrFormState;
		JSCompiler_inline_result = mountStateImpl(!1);
		inRootOrSingleton = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !1, JSCompiler_inline_result.queue);
		JSCompiler_inline_result = mountWorkInProgressHook();
		JSCompiler_inline_result$jscomp$0 = {
			state: initialStateProp,
			dispatch: null,
			action,
			pending: null
		};
		JSCompiler_inline_result.queue = JSCompiler_inline_result$jscomp$0;
		ssrFormState = dispatchActionState.bind(null, currentlyRenderingFiber, JSCompiler_inline_result$jscomp$0, inRootOrSingleton, ssrFormState);
		JSCompiler_inline_result$jscomp$0.dispatch = ssrFormState;
		JSCompiler_inline_result.memoizedState = action;
		return [
			initialStateProp,
			ssrFormState,
			!1
		];
	}
	function updateActionState(action) {
		return updateActionStateImpl(updateWorkInProgressHook(), currentHook, action);
	}
	function updateActionStateImpl(stateHook, currentStateHook, action) {
		currentStateHook = updateReducerImpl(stateHook, currentStateHook, actionStateReducer)[0];
		stateHook = updateReducer(basicStateReducer)[0];
		if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then) try {
			var state = useThenable(currentStateHook);
		} catch (x) {
			if (x === SuspenseException) throw SuspenseActionException;
			throw x;
		}
		else state = currentStateHook;
		currentStateHook = updateWorkInProgressHook();
		var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
		action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(9, { destroy: void 0 }, actionStateActionEffect.bind(null, actionQueue, action), null));
		return [
			state,
			dispatch,
			stateHook
		];
	}
	function actionStateActionEffect(actionQueue, action) {
		actionQueue.action = action;
	}
	function rerenderActionState(action) {
		var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
		if (null !== currentStateHook) return updateActionStateImpl(stateHook, currentStateHook, action);
		updateWorkInProgressHook();
		stateHook = stateHook.memoizedState;
		currentStateHook = updateWorkInProgressHook();
		var dispatch = currentStateHook.queue.dispatch;
		currentStateHook.memoizedState = action;
		return [
			stateHook,
			dispatch,
			!1
		];
	}
	function pushSimpleEffect(tag, inst, create, deps) {
		tag = {
			tag,
			create,
			deps,
			inst,
			next: null
		};
		inst = currentlyRenderingFiber.updateQueue;
		null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
		create = inst.lastEffect;
		null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
		return tag;
	}
	function updateRef() {
		return updateWorkInProgressHook().memoizedState;
	}
	function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = mountWorkInProgressHook();
		currentlyRenderingFiber.flags |= fiberFlags;
		hook.memoizedState = pushSimpleEffect(1 | hookFlags, { destroy: void 0 }, create, void 0 === deps ? null : deps);
	}
	function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var inst = hook.memoizedState.inst;
		null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(1 | hookFlags, inst, create, deps));
	}
	function mountEffect(create, deps) {
		mountEffectImpl(8390656, 8, create, deps);
	}
	function updateEffect(create, deps) {
		updateEffectImpl(2048, 8, create, deps);
	}
	function useEffectEventImpl(payload) {
		currentlyRenderingFiber.flags |= 4;
		var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
		if (null === componentUpdateQueue) componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
		else {
			var events = componentUpdateQueue.events;
			null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
		}
	}
	function updateEvent(callback) {
		var ref = updateWorkInProgressHook().memoizedState;
		useEffectEventImpl({
			ref,
			nextImpl: callback
		});
		return function() {
			if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
			return ref.impl.apply(void 0, arguments);
		};
	}
	function updateInsertionEffect(create, deps) {
		return updateEffectImpl(4, 2, create, deps);
	}
	function updateLayoutEffect(create, deps) {
		return updateEffectImpl(4, 4, create, deps);
	}
	function imperativeHandleEffect(create, ref) {
		if ("function" === typeof ref) {
			create = create();
			var refCleanup = ref(create);
			return function() {
				"function" === typeof refCleanup ? refCleanup() : ref(null);
			};
		}
		if (null !== ref && void 0 !== ref) return create = create(), ref.current = create, function() {
			ref.current = null;
		};
	}
	function updateImperativeHandle(ref, create, deps) {
		deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		updateEffectImpl(4, 4, imperativeHandleEffect.bind(null, create, ref), deps);
	}
	function mountDebugValue() {}
	function updateCallback(callback, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		hook.memoizedState = [callback, deps];
		return callback;
	}
	function updateMemo(nextCreate, deps) {
		var hook = updateWorkInProgressHook();
		deps = void 0 === deps ? null : deps;
		var prevState = hook.memoizedState;
		if (null !== deps && areHookInputsEqual(deps, prevState[1])) return prevState[0];
		prevState = nextCreate();
		if (shouldDoubleInvokeUserFnsInHooksDEV) {
			setIsStrictModeForDevtools(!0);
			try {
				nextCreate();
			} finally {
				setIsStrictModeForDevtools(!1);
			}
		}
		hook.memoizedState = [prevState, deps];
		return prevState;
	}
	function mountDeferredValueImpl(hook, value, initialValue) {
		if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return hook.memoizedState = value;
		hook.memoizedState = initialValue;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return initialValue;
	}
	function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
		if (objectIs(value, prevValue)) return value;
		if (null !== currentTreeHiddenStackCursor.current) return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = !0), hook;
		if (0 === (renderLanes & 106) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930)) return didReceiveUpdate = !0, hook.memoizedState = value;
		hook = requestDeferredLane();
		currentlyRenderingFiber.lanes |= hook;
		workInProgressRootSkippedLanes |= hook;
		return prevValue;
	}
	function startTransition(fiber, queue, pendingState, finishedState, callback) {
		var previousPriority = ReactDOMSharedInternals.p;
		ReactDOMSharedInternals.p = 0 !== previousPriority && 8 > previousPriority ? previousPriority : 8;
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		currentTransition.types = null !== prevTransition ? prevTransition.types : null;
		ReactSharedInternals.T = currentTransition;
		dispatchOptimisticSetState(fiber, !1, queue, pendingState);
		try {
			var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) dispatchSetStateInternal(fiber, queue, chainThenableValue(returnValue, finishedState), requestUpdateLane(fiber));
			else dispatchSetStateInternal(fiber, queue, finishedState, requestUpdateLane(fiber));
		} catch (error) {
			dispatchSetStateInternal(fiber, queue, {
				then: function() {},
				status: "rejected",
				reason: error
			}, requestUpdateLane());
		} finally {
			ReactDOMSharedInternals.p = previousPriority, null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	}
	function noop() {}
	function startHostTransition(formFiber, pendingState, action, formData) {
		if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
		var queue = ensureFormComponentIsStateful(formFiber).queue;
		startTransition(formFiber, queue, pendingState, sharedNotPendingObject, null === action ? noop : function() {
			requestFormReset$1(formFiber);
			return action(formData);
		});
	}
	function ensureFormComponentIsStateful(formFiber) {
		var existingStateHook = formFiber.memoizedState;
		if (null !== existingStateHook) return existingStateHook;
		existingStateHook = {
			memoizedState: sharedNotPendingObject,
			baseState: sharedNotPendingObject,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: sharedNotPendingObject
			},
			next: null
		};
		var initialResetState = {};
		existingStateHook.next = {
			memoizedState: initialResetState,
			baseState: initialResetState,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: basicStateReducer,
				lastRenderedState: initialResetState
			},
			next: null
		};
		formFiber.memoizedState = existingStateHook;
		formFiber = formFiber.alternate;
		null !== formFiber && (formFiber.memoizedState = existingStateHook);
		return existingStateHook;
	}
	function requestFormReset$1(formFiber) {
		var stateHook = ensureFormComponentIsStateful(formFiber);
		null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
		dispatchSetStateInternal(formFiber, stateHook.next.queue, {}, requestUpdateLane());
	}
	function useHostTransitionStatus() {
		return readContext(HostTransitionContext);
	}
	function updateId() {
		return updateWorkInProgressHook().memoizedState;
	}
	function updateRefresh() {
		return updateWorkInProgressHook().memoizedState;
	}
	function refreshCache(fiber) {
		for (var provider = fiber.return; null !== provider;) {
			switch (provider.tag) {
				case 24:
				case 3:
					var lane = requestUpdateLane();
					fiber = createUpdate(lane);
					var root$73 = enqueueUpdate(provider, fiber, lane);
					null !== root$73 && (scheduleUpdateOnFiber(root$73, provider, lane), entangleTransitions(root$73, provider, lane));
					provider = { cache: createCache() };
					fiber.payload = provider;
					return;
			}
			provider = provider.return;
		}
	}
	function dispatchReducerAction(fiber, queue, action) {
		var lane = requestUpdateLane();
		action = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
	}
	function dispatchSetState(fiber, queue, action) {
		dispatchSetStateInternal(fiber, queue, action, requestUpdateLane());
	}
	function dispatchSetStateInternal(fiber, queue, action, lane) {
		var update = {
			lane,
			revertLane: 0,
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
		else {
			var alternate = fiber.alternate;
			if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate)) try {
				var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
				update.hasEagerState = !0;
				update.eagerState = eagerState;
				if (objectIs(eagerState, currentState)) return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), !1;
			} catch (error) {}
			action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
			if (null !== action) return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), !0;
		}
		return !1;
	}
	function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
		action = {
			lane: 2,
			revertLane: requestTransitionLane(),
			gesture: null,
			action,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (isRenderPhaseUpdate(fiber)) {
			if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
		} else throwIfDuringRender = enqueueConcurrentHookUpdate(fiber, queue, action, 2), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
	}
	function isRenderPhaseUpdate(fiber) {
		var alternate = fiber.alternate;
		return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
	}
	function enqueueRenderPhaseUpdate(queue, update) {
		didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = !0;
		var pending = queue.pending;
		null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		queue.pending = update;
	}
	function entangleTransitionUpdate(root, queue, lane) {
		if (0 !== (lane & 4194048)) {
			var queueLanes = queue.lanes;
			queueLanes &= root.pendingLanes;
			lane |= queueLanes;
			queue.lanes = lane;
			markRootEntangled(root, lane);
		}
	}
	var ContextOnlyDispatcher = {
		readContext,
		use,
		useCallback: throwInvalidHookError,
		useContext: throwInvalidHookError,
		useEffect: throwInvalidHookError,
		useImperativeHandle: throwInvalidHookError,
		useLayoutEffect: throwInvalidHookError,
		useInsertionEffect: throwInvalidHookError,
		useMemo: throwInvalidHookError,
		useReducer: throwInvalidHookError,
		useRef: throwInvalidHookError,
		useState: throwInvalidHookError,
		useDebugValue: throwInvalidHookError,
		useDeferredValue: throwInvalidHookError,
		useTransition: throwInvalidHookError,
		useSyncExternalStore: throwInvalidHookError,
		useId: throwInvalidHookError,
		useHostTransitionStatus: throwInvalidHookError,
		useFormState: throwInvalidHookError,
		useActionState: throwInvalidHookError,
		useOptimistic: throwInvalidHookError,
		useMemoCache: throwInvalidHookError,
		useCacheRefresh: throwInvalidHookError,
		useEffectEvent: throwInvalidHookError
	};
	var HooksDispatcherOnMount = {
		readContext,
		use,
		useCallback: function(callback, deps) {
			mountWorkInProgressHook().memoizedState = [callback, void 0 === deps ? null : deps];
			return callback;
		},
		useContext: readContext,
		useEffect: mountEffect,
		useImperativeHandle: function(ref, create, deps) {
			deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
			mountEffectImpl(4194308, 4, imperativeHandleEffect.bind(null, create, ref), deps);
		},
		useLayoutEffect: function(create, deps) {
			return mountEffectImpl(4194308, 4, create, deps);
		},
		useInsertionEffect: function(create, deps) {
			mountEffectImpl(4, 2, create, deps);
		},
		useMemo: function(nextCreate, deps) {
			var hook = mountWorkInProgressHook();
			deps = void 0 === deps ? null : deps;
			var nextValue = nextCreate();
			if (shouldDoubleInvokeUserFnsInHooksDEV) {
				setIsStrictModeForDevtools(!0);
				try {
					nextCreate();
				} finally {
					setIsStrictModeForDevtools(!1);
				}
			}
			hook.memoizedState = [nextValue, deps];
			return nextValue;
		},
		useReducer: function(reducer, initialArg, init) {
			var hook = mountWorkInProgressHook();
			if (void 0 !== init) {
				var initialState = init(initialArg);
				if (shouldDoubleInvokeUserFnsInHooksDEV) {
					setIsStrictModeForDevtools(!0);
					try {
						init(initialArg);
					} finally {
						setIsStrictModeForDevtools(!1);
					}
				}
			} else initialState = initialArg;
			hook.memoizedState = hook.baseState = initialState;
			reducer = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: reducer,
				lastRenderedState: initialState
			};
			hook.queue = reducer;
			reducer = reducer.dispatch = dispatchReducerAction.bind(null, currentlyRenderingFiber, reducer);
			return [hook.memoizedState, reducer];
		},
		useRef: function(initialValue) {
			var hook = mountWorkInProgressHook();
			initialValue = { current: initialValue };
			return hook.memoizedState = initialValue;
		},
		useState: function(initialState) {
			initialState = mountStateImpl(initialState);
			var queue = initialState.queue, dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, queue);
			queue.dispatch = dispatch;
			return [initialState.memoizedState, dispatch];
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return mountDeferredValueImpl(mountWorkInProgressHook(), value, initialValue);
		},
		useTransition: function() {
			var stateHook = mountStateImpl(!1);
			stateHook = startTransition.bind(null, currentlyRenderingFiber, stateHook.queue, !0, !1);
			mountWorkInProgressHook().memoizedState = stateHook;
			return [!1, stateHook];
		},
		useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
			var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
			if (isHydrating) {
				if (void 0 === getServerSnapshot) throw Error(formatProdErrorMessage(407));
				getServerSnapshot = getServerSnapshot();
			} else {
				getServerSnapshot = getSnapshot();
				if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
				0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
			}
			hook.memoizedState = getServerSnapshot;
			var inst = {
				value: getServerSnapshot,
				getSnapshot
			};
			hook.queue = inst;
			mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [subscribe]);
			fiber.flags |= 2048;
			pushSimpleEffect(9, { destroy: void 0 }, updateStoreInstance.bind(null, fiber, inst, getServerSnapshot, getSnapshot), null);
			return getServerSnapshot;
		},
		useId: function() {
			var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
			if (isHydrating) {
				var JSCompiler_inline_result = treeContextOverflow;
				var idWithLeadingBit = treeContextId;
				JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
				identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
				JSCompiler_inline_result = localIdCounter++;
				0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
				identifierPrefix += "_";
			} else JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
			return hook.memoizedState = identifierPrefix;
		},
		useHostTransitionStatus,
		useFormState: mountActionState,
		useActionState: mountActionState,
		useOptimistic: function(passthrough) {
			var hook = mountWorkInProgressHook();
			hook.memoizedState = hook.baseState = passthrough;
			var queue = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			hook.queue = queue;
			hook = dispatchOptimisticSetState.bind(null, currentlyRenderingFiber, !0, queue);
			queue.dispatch = hook;
			return [passthrough, hook];
		},
		useMemoCache,
		useCacheRefresh: function() {
			return mountWorkInProgressHook().memoizedState = refreshCache.bind(null, currentlyRenderingFiber);
		},
		useEffectEvent: function(callback) {
			var hook = mountWorkInProgressHook(), ref = { impl: callback };
			hook.memoizedState = ref;
			return function() {
				if (0 !== (executionContext & 2)) throw Error(formatProdErrorMessage(440));
				return ref.impl.apply(void 0, arguments);
			};
		}
	};
	var HooksDispatcherOnUpdate = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: updateReducer,
		useRef: updateRef,
		useState: function() {
			return updateReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			return updateDeferredValueImpl(updateWorkInProgressHook(), currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: updateActionState,
		useActionState: updateActionState,
		useOptimistic: function(passthrough, reducer) {
			return updateOptimisticImpl(updateWorkInProgressHook(), currentHook, passthrough, reducer);
		},
		useMemoCache,
		useCacheRefresh: updateRefresh,
		useEffectEvent: updateEvent
	};
	var HooksDispatcherOnRerender = {
		readContext,
		use,
		useCallback: updateCallback,
		useContext: readContext,
		useEffect: updateEffect,
		useImperativeHandle: updateImperativeHandle,
		useInsertionEffect: updateInsertionEffect,
		useLayoutEffect: updateLayoutEffect,
		useMemo: updateMemo,
		useReducer: rerenderReducer,
		useRef: updateRef,
		useState: function() {
			return rerenderReducer(basicStateReducer);
		},
		useDebugValue: mountDebugValue,
		useDeferredValue: function(value, initialValue) {
			var hook = updateWorkInProgressHook();
			return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(hook, currentHook.memoizedState, value, initialValue);
		},
		useTransition: function() {
			var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
			return ["boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable), start];
		},
		useSyncExternalStore: updateSyncExternalStore,
		useId: updateId,
		useHostTransitionStatus,
		useFormState: rerenderActionState,
		useActionState: rerenderActionState,
		useOptimistic: function(passthrough, reducer) {
			var hook = updateWorkInProgressHook();
			if (null !== currentHook) return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
			hook.baseState = passthrough;
			return [passthrough, hook.queue.dispatch];
		},
		useMemoCache,
		useCacheRefresh: updateRefresh,
		useEffectEvent: updateEvent
	};
	function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, nextProps) {
		ctor = workInProgress.memoizedState;
		getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
		getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
		workInProgress.memoizedState = getDerivedStateFromProps;
		0 === workInProgress.lanes && (workInProgress.updateQueue.baseState = getDerivedStateFromProps);
	}
	var classComponentUpdater = {
		enqueueSetState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueReplaceState: function(inst, payload, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 1;
			update.payload = payload;
			void 0 !== callback && null !== callback && (update.callback = callback);
			payload = enqueueUpdate(inst, update, lane);
			null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		},
		enqueueForceUpdate: function(inst, callback) {
			inst = inst._reactInternals;
			var lane = requestUpdateLane(), update = createUpdate(lane);
			update.tag = 2;
			void 0 !== callback && null !== callback && (update.callback = callback);
			callback = enqueueUpdate(inst, update, lane);
			null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
		}
	};
	function checkShouldComponentUpdate(workInProgress, ctor, oldProps, newProps, oldState, newState, nextContext) {
		workInProgress = workInProgress.stateNode;
		return "function" === typeof workInProgress.shouldComponentUpdate ? workInProgress.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : !0;
	}
	function callComponentWillReceiveProps(workInProgress, instance, newProps, nextContext) {
		workInProgress = instance.state;
		"function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
		"function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
		instance.state !== workInProgress && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
	}
	function resolveClassComponentProps(Component, baseProps) {
		var newProps = baseProps;
		if ("ref" in baseProps) {
			newProps = {};
			for (var propName in baseProps) "ref" !== propName && (newProps[propName] = baseProps[propName]);
		}
		if (Component = Component.defaultProps) {
			newProps === baseProps && (newProps = assign({}, newProps));
			for (var propName$77 in Component) void 0 === newProps[propName$77] && (newProps[propName$77] = Component[propName$77]);
		}
		return newProps;
	}
	function defaultOnUncaughtError(error) {
		reportGlobalError(error);
	}
	function defaultOnCaughtError(error) {
		console.error(error);
	}
	function defaultOnRecoverableError(error) {
		reportGlobalError(error);
	}
	function logUncaughtError(root, errorInfo) {
		try {
			var onUncaughtError = root.onUncaughtError;
			onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
		} catch (e$78) {
			setTimeout(function() {
				throw e$78;
			});
		}
	}
	function logCaughtError(root, boundary, errorInfo) {
		try {
			var onCaughtError = root.onCaughtError;
			onCaughtError(errorInfo.value, {
				componentStack: errorInfo.stack,
				errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
			});
		} catch (e$79) {
			setTimeout(function() {
				throw e$79;
			});
		}
	}
	function createRootErrorUpdate(root, errorInfo, lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		lane.payload = { element: null };
		lane.callback = function() {
			logUncaughtError(root, errorInfo);
		};
		return lane;
	}
	function createClassErrorUpdate(lane) {
		lane = createUpdate(lane);
		lane.tag = 3;
		return lane;
	}
	function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
		var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
		if ("function" === typeof getDerivedStateFromError) {
			var error = errorInfo.value;
			update.payload = function() {
				return getDerivedStateFromError(error);
			};
			update.callback = function() {
				logCaughtError(root, fiber, errorInfo);
			};
		}
		var inst = fiber.stateNode;
		null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
			logCaughtError(root, fiber, errorInfo);
			"function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
			var stack = errorInfo.stack;
			this.componentDidCatch(errorInfo.value, { componentStack: null !== stack ? stack : "" });
		});
	}
	function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
		sourceFiber.flags |= 32768;
		if (null !== value && "object" === typeof value && "function" === typeof value.then) {
			returnFiber = sourceFiber.alternate;
			null !== returnFiber && propagateParentContextChanges(returnFiber, sourceFiber, rootRenderLanes, !0);
			sourceFiber = suspenseHandlerStackCursor.current;
			if (null !== sourceFiber) {
				switch (sourceFiber.tag) {
					case 31:
					case 13:
					case 19: return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), !1;
					case 22: return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
						transitions: null,
						markerInstances: null,
						retryQueue: /* @__PURE__ */ new Set([value])
					}, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), !1;
				}
				throw Error(formatProdErrorMessage(435, sourceFiber.tag));
			}
			attachPingListener(root, value, rootRenderLanes);
			renderDidSuspendDelayIfPossible();
			return !1;
		}
		if (isHydrating) return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(createCapturedValueAtFiber(root, sourceFiber)))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), { cause: value }), queueHydrationError(createCapturedValueAtFiber(returnFiber, sourceFiber))), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(root.stateNode, value, rootRenderLanes), enqueueCapturedUpdate(root, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), !1;
		var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
		wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
		null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
		4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
		if (null === returnFiber) return !0;
		value = createCapturedValueAtFiber(value, sourceFiber);
		sourceFiber = returnFiber;
		do {
			switch (sourceFiber.tag) {
				case 3: return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), !1;
				case 1:
					returnFiber = sourceFiber.type;
					wrapperError = sourceFiber.stateNode;
					if (0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(wrapperError)))) return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(rootRenderLanes, root, sourceFiber, value), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), !1;
					break;
				case 22: if (null !== sourceFiber.memoizedState) return sourceFiber.flags |= 65536, !1;
			}
			sourceFiber = sourceFiber.return;
		} while (null !== sourceFiber);
		return !1;
	}
	var SelectiveHydrationException = Error(formatProdErrorMessage(461));
	var didReceiveUpdate = !1;
	function reconcileChildren(current, workInProgress, nextChildren, renderLanes) {
		workInProgress.child = null === current ? mountChildFibers(workInProgress, null, nextChildren, renderLanes) : reconcileChildFibers(workInProgress, current.child, nextChildren, renderLanes);
	}
	function updateForwardRef(current, workInProgress, Component, nextProps, renderLanes) {
		Component = Component.render;
		var ref = workInProgress.ref;
		if ("ref" in nextProps) {
			var propsWithoutRef = {};
			for (var key in nextProps) "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
		} else propsWithoutRef = nextProps;
		prepareToReadContext(workInProgress);
		nextProps = renderWithHooks(current, workInProgress, Component, propsWithoutRef, ref, renderLanes);
		key = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && key && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null === current) {
			var type = Component.type;
			if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare) return workInProgress.tag = 15, workInProgress.type = type, updateSimpleMemoComponent(current, workInProgress, type, nextProps, renderLanes);
			current = createFiberFromTypeAndProps(Component.type, null, nextProps, workInProgress, workInProgress.mode, renderLanes);
			current.ref = workInProgress.ref;
			current.return = workInProgress;
			return workInProgress.child = current;
		}
		type = current.child;
		if (!checkScheduledUpdateOrContext(current, renderLanes)) {
			var prevProps = type.memoizedProps;
			Component = Component.compare;
			Component = null !== Component ? Component : shallowEqual;
			if (Component(prevProps, nextProps) && current.ref === workInProgress.ref) return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		workInProgress.flags |= 1;
		current = createWorkInProgress(type, nextProps);
		current.ref = workInProgress.ref;
		current.return = workInProgress;
		return workInProgress.child = current;
	}
	function updateSimpleMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
		if (null !== current) {
			var prevProps = current.memoizedProps;
			if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress.ref) if (didReceiveUpdate = !1, workInProgress.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes)) 0 !== (current.flags & 131072) && (didReceiveUpdate = !0);
			else return workInProgress.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		}
		return updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes);
	}
	function updateOffscreenComponent(current, workInProgress, renderLanes, nextProps) {
		var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
		null === current && null === workInProgress.stateNode && (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		if ("hidden" === nextProps.mode) {
			if (0 !== (workInProgress.flags & 128)) {
				prevState = null !== prevState ? prevState.baseLanes | renderLanes : renderLanes;
				if (null !== current) {
					nextProps = workInProgress.child = current.child;
					for (nextChildren = 0; null !== nextProps;) nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
					nextProps = nextChildren & ~prevState;
				} else nextProps = 0, workInProgress.child = null;
				return deferHiddenOffscreenComponent(current, workInProgress, prevState, renderLanes, nextProps);
			}
			if (0 !== (renderLanes & 536870912)) workInProgress.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, null !== current && pushTransition(workInProgress, null !== prevState ? prevState.cachePool : null), null !== prevState ? pushHiddenContext(workInProgress, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress);
			else return nextProps = workInProgress.lanes = 536870912, deferHiddenOffscreenComponent(current, workInProgress, null !== prevState ? prevState.baseLanes | renderLanes : renderLanes, renderLanes, nextProps);
		} else null !== prevState ? (pushTransition(workInProgress, prevState.cachePool), pushHiddenContext(workInProgress, prevState), reuseSuspenseHandlerOnStack(), workInProgress.memoizedState = null) : (null !== current && pushTransition(workInProgress, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	function bailoutOffscreenComponent(current, workInProgress) {
		null !== current && 22 === current.tag || null !== workInProgress.stateNode || (workInProgress.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		});
		return workInProgress.sibling;
	}
	function deferHiddenOffscreenComponent(current, workInProgress, nextBaseLanes, renderLanes, remainingChildLanes) {
		var JSCompiler_inline_result = peekCacheFromPool();
		JSCompiler_inline_result = null === JSCompiler_inline_result ? null : {
			parent: CacheContext._currentValue,
			pool: JSCompiler_inline_result
		};
		workInProgress.memoizedState = {
			baseLanes: nextBaseLanes,
			cachePool: JSCompiler_inline_result
		};
		null !== current && pushTransition(workInProgress, null);
		reuseHiddenContextOnStack();
		pushOffscreenSuspenseHandler(workInProgress);
		null !== current && propagateParentContextChanges(current, workInProgress, renderLanes, !0);
		workInProgress.childLanes = remainingChildLanes;
		return null;
	}
	function mountActivityChildren(workInProgress, nextProps) {
		nextProps = mountWorkInProgressOffscreenFiber({
			mode: nextProps.mode,
			children: nextProps.children
		}, workInProgress.mode);
		nextProps.ref = workInProgress.ref;
		workInProgress.child = nextProps;
		nextProps.return = workInProgress;
		return nextProps;
	}
	function retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountActivityChildren(workInProgress, workInProgress.pendingProps);
		current.flags |= 2;
		popSuspenseHandler(workInProgress);
		workInProgress.memoizedState = null;
		return current;
	}
	function updateActivityComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, didSuspend = 0 !== (workInProgress.flags & 128);
		workInProgress.flags &= -129;
		if (null === current) {
			if (isHydrating) {
				if ("hidden" === nextProps.mode) return current = mountActivityChildren(workInProgress, nextProps), workInProgress.lanes = 536870912, current.memoizedState = {
					baseLanes: 0,
					cachePool: null
				}, bailoutOffscreenComponent(null, current);
				pushDehydratedActivitySuspenseHandler(workInProgress);
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" === current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				workInProgress.lanes = 536870912;
				return null;
			}
			return mountActivityChildren(workInProgress, nextProps);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated = prevState.dehydrated;
			pushDehydratedActivitySuspenseHandler(workInProgress);
			if (didSuspend) if (workInProgress.flags & 256) workInProgress.flags &= -257, workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			else if (null !== workInProgress.memoizedState) workInProgress.child = current.child, workInProgress.flags |= 128, workInProgress = null;
			else throw Error(formatProdErrorMessage(558));
			else if (didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1), didSuspend = 0 !== (renderLanes & current.childLanes), didReceiveUpdate || didSuspend) {
				if (null === currentTreeHiddenStackCursor.current) {
					nextProps = workInProgressRoot;
					if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes), 0 !== dehydrated && dehydrated !== prevState.retryLane)) throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
					renderDidSuspendDelayIfPossible();
				}
				workInProgress = retryActivityComponentWithoutHydrating(current, workInProgress, renderLanes);
			} else current = prevState.treeContext, nextHydratableInstance = getNextHydratable(dehydrated.nextSibling), hydrationParentFiber = workInProgress, isHydrating = !0, hydrationErrors = null, rootOrSingletonContext = !1, null !== current && restoreSuspendedTreeContext(workInProgress, current), workInProgress = mountActivityChildren(workInProgress, nextProps), workInProgress.flags |= 134221824;
			return workInProgress;
		}
		current = createWorkInProgress(current.child, {
			mode: nextProps.mode,
			children: nextProps.children
		});
		current.ref = workInProgress.ref;
		workInProgress.child = current;
		current.return = workInProgress;
		return current;
	}
	function markRef(current, workInProgress) {
		var ref = workInProgress.ref;
		if (null === ref) null !== current && null !== current.ref && (workInProgress.flags |= 4194816);
		else {
			if ("function" !== typeof ref && "object" !== typeof ref) throw Error(formatProdErrorMessage(284));
			if (null === current || current.ref !== ref) workInProgress.flags |= 4194816;
		}
	}
	function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		Component = renderWithHooks(current, workInProgress, Component, nextProps, void 0, renderLanes);
		nextProps = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && nextProps && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, Component, renderLanes);
		return workInProgress.child;
	}
	function replayFunctionComponent(current, workInProgress, nextProps, Component, secondArg, renderLanes) {
		prepareToReadContext(workInProgress);
		workInProgress.updateQueue = null;
		nextProps = renderWithHooksAgain(workInProgress, Component, nextProps, secondArg);
		finishRenderingHooks(current);
		Component = checkDidRenderIdHook();
		if (null !== current && !didReceiveUpdate) return bailoutHooks(current, workInProgress, renderLanes), bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		isHydrating && Component && pushMaterializedTreeId(workInProgress);
		workInProgress.flags |= 1;
		reconcileChildren(current, workInProgress, nextProps, renderLanes);
		return workInProgress.child;
	}
	function updateClassComponent(current, workInProgress, Component, nextProps, renderLanes) {
		prepareToReadContext(workInProgress);
		if (null === workInProgress.stateNode) {
			var context = emptyContextObject, contextType = Component.contextType;
			"object" === typeof contextType && null !== contextType && (context = readContext(contextType));
			context = new Component(nextProps, context);
			workInProgress.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
			context.updater = classComponentUpdater;
			workInProgress.stateNode = context;
			context._reactInternals = workInProgress;
			context = workInProgress.stateNode;
			context.props = nextProps;
			context.state = workInProgress.memoizedState;
			context.refs = {};
			initializeUpdateQueue(workInProgress);
			contextType = Component.contextType;
			context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
			context.state = workInProgress.memoizedState;
			contextType = Component.getDerivedStateFromProps;
			"function" === typeof contextType && (applyDerivedStateFromProps(workInProgress, Component, contextType, nextProps), context.state = workInProgress.memoizedState);
			"function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(context, context.state, null), processUpdateQueue(workInProgress, nextProps, context, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress.memoizedState);
			"function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308);
			nextProps = !0;
		} else if (null === current) {
			context = workInProgress.stateNode;
			var unresolvedOldProps = workInProgress.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
			context.props = oldProps;
			var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
			contextType = emptyContextObject;
			"object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
			var getDerivedStateFromProps = Component.getDerivedStateFromProps;
			contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
			unresolvedOldProps = workInProgress.pendingProps !== unresolvedOldProps;
			contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(workInProgress, context, nextProps, contextType);
			hasForceUpdate = !1;
			var oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			oldContext = workInProgress.memoizedState;
			unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(workInProgress, Component, getDerivedStateFromProps, nextProps), oldContext = workInProgress.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, oldProps, nextProps, oldState, oldContext, contextType)) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress.flags |= 4194308), nextProps = !1);
		} else {
			context = workInProgress.stateNode;
			cloneUpdateQueue(current, workInProgress);
			contextType = workInProgress.memoizedProps;
			contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
			context.props = contextType$jscomp$0;
			getDerivedStateFromProps = workInProgress.pendingProps;
			oldState = context.context;
			oldContext = Component.contextType;
			oldProps = emptyContextObject;
			"object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
			unresolvedOldProps = Component.getDerivedStateFromProps;
			(oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(workInProgress, context, nextProps, oldProps);
			hasForceUpdate = !1;
			oldState = workInProgress.memoizedState;
			context.state = oldState;
			processUpdateQueue(workInProgress, nextProps, context, renderLanes);
			suspendIfUpdateReadFromEntangledAsyncAction();
			var newState = workInProgress.memoizedState;
			contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(workInProgress, Component, unresolvedOldProps, nextProps), newState = workInProgress.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(workInProgress, Component, contextType$jscomp$0, nextProps, oldState, newState, oldProps) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(nextProps, newState, oldProps)), "function" === typeof context.componentDidUpdate && (workInProgress.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), workInProgress.memoizedProps = nextProps, workInProgress.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress.flags |= 1024), nextProps = !1);
		}
		context = nextProps;
		markRef(current, workInProgress);
		nextProps = 0 !== (workInProgress.flags & 128);
		context || nextProps ? (context = workInProgress.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress.flags |= 1, null !== current && nextProps ? (workInProgress.child = reconcileChildFibers(workInProgress, current.child, null, renderLanes), workInProgress.child = reconcileChildFibers(workInProgress, null, Component, renderLanes)) : reconcileChildren(current, workInProgress, Component, renderLanes), workInProgress.memoizedState = context.state, current = workInProgress.child) : current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
		return current;
	}
	function mountHostRootWithoutHydrating(current, workInProgress, nextChildren, renderLanes) {
		resetHydrationState();
		workInProgress.flags |= 256;
		reconcileChildren(current, workInProgress, nextChildren, renderLanes);
		return workInProgress.child;
	}
	var SUSPENDED_MARKER = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function mountSuspenseOffscreenState(renderLanes) {
		return {
			baseLanes: renderLanes,
			cachePool: getSuspendedCache()
		};
	}
	function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes) {
		current = null !== current ? current.childLanes & ~renderLanes : 0;
		primaryTreeDidDefer && (current |= workInProgressDeferredLane);
		return current;
	}
	function updateSuspenseComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, showFallback = !1, didSuspend = 0 !== (workInProgress.flags & 128), JSCompiler_temp;
		(JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? !1 : 0 !== (suspenseStackCursor.current & 2));
		JSCompiler_temp && (showFallback = !0, workInProgress.flags &= -129);
		JSCompiler_temp = 0 !== (workInProgress.flags & 32);
		workInProgress.flags &= -33;
		if (null === current) {
			if (isHydrating) {
				showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress) : reuseSuspenseHandlerOnStack();
				(current = nextHydratableInstance) ? (current = canHydrateHydrationBoundary(current, rootOrSingletonContext), current = null !== current && "&" !== current.data ? current : null, null !== current && (workInProgress.memoizedState = {
					dehydrated: current,
					treeContext: null !== treeContextProvider ? {
						id: treeContextId,
						overflow: treeContextOverflow
					} : null,
					retryLane: 536870912,
					hydrationErrors: null
				}, renderLanes = createFiberFromDehydratedFragment(current), renderLanes.return = workInProgress, workInProgress.child = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null)) : current = null;
				if (null === current) throw throwOnHydrationMismatch(workInProgress);
				isSuspenseInstanceFallback(current) ? workInProgress.lanes = 32 : workInProgress.lanes = 536870912;
				return null;
			}
			didSuspend = nextProps.children;
			nextProps = nextProps.fallback;
			if (showFallback) return reuseSuspenseHandlerOnStack(), showFallback = workInProgress.mode, didSuspend = mountWorkInProgressOffscreenFiber({
				mode: "hidden",
				children: didSuspend
			}, showFallback), nextProps = createFiberFromFragment(nextProps, showFallback, renderLanes, null), didSuspend.return = workInProgress, nextProps.return = workInProgress, didSuspend.sibling = nextProps, workInProgress.child = didSuspend, nextProps = workInProgress.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes), nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
			pushPrimaryTreeSuspenseHandler(workInProgress);
			return mountSuspensePrimaryChildren(workInProgress, didSuspend);
		}
		var prevState = current.memoizedState;
		if (null !== prevState) {
			var dehydrated$96 = prevState.dehydrated;
			if (null !== dehydrated$96) return updateDehydratedSuspenseComponent(current, workInProgress, didSuspend, JSCompiler_temp, nextProps, dehydrated$96, prevState, renderLanes);
		}
		if (showFallback) return reuseSuspenseHandlerOnStack(), showFallback = nextProps.fallback, didSuspend = workInProgress.mode, prevState = current.child, dehydrated$96 = prevState.sibling, nextProps = createWorkInProgress(prevState, {
			mode: "hidden",
			children: nextProps.children
		}), nextProps.subtreeFlags = prevState.subtreeFlags & 1206910976, null !== dehydrated$96 ? showFallback = createWorkInProgress(dehydrated$96, showFallback) : (showFallback = createFiberFromFragment(showFallback, didSuspend, renderLanes, null), showFallback.flags |= 2), showFallback.return = workInProgress, nextProps.return = workInProgress, nextProps.sibling = showFallback, workInProgress.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress.child, showFallback = current.child.memoizedState, null === showFallback ? showFallback = mountSuspenseOffscreenState(renderLanes) : (didSuspend = showFallback.cachePool, null !== didSuspend ? (prevState = CacheContext._currentValue, didSuspend = didSuspend.parent !== prevState ? {
			parent: prevState,
			pool: prevState
		} : didSuspend) : didSuspend = getSuspendedCache(), showFallback = {
			baseLanes: showFallback.baseLanes | renderLanes,
			cachePool: didSuspend
		}), nextProps.memoizedState = showFallback, nextProps.childLanes = getRemainingWorkInPrimaryTree(current, JSCompiler_temp, renderLanes), workInProgress.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
		pushPrimaryTreeSuspenseHandler(workInProgress);
		renderLanes = current.child;
		current = renderLanes.sibling;
		renderLanes = createWorkInProgress(renderLanes, {
			mode: "visible",
			children: nextProps.children
		});
		renderLanes.return = workInProgress;
		renderLanes.sibling = null;
		null !== current && (JSCompiler_temp = workInProgress.deletions, null === JSCompiler_temp ? (workInProgress.deletions = [current], workInProgress.flags |= 16) : JSCompiler_temp.push(current));
		workInProgress.child = renderLanes;
		workInProgress.memoizedState = null;
		return renderLanes;
	}
	function mountSuspensePrimaryChildren(workInProgress, primaryChildren) {
		primaryChildren = mountWorkInProgressOffscreenFiber({
			mode: "visible",
			children: primaryChildren
		}, workInProgress.mode);
		primaryChildren.return = workInProgress;
		return workInProgress.child = primaryChildren;
	}
	function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
		offscreenProps = createFiberImplClass(22, offscreenProps, null, mode);
		offscreenProps.lanes = 0;
		return offscreenProps;
	}
	function retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes) {
		reconcileChildFibers(workInProgress, current.child, null, renderLanes);
		current = mountSuspensePrimaryChildren(workInProgress, workInProgress.pendingProps.children);
		current.flags |= 2;
		workInProgress.memoizedState = null;
		return current;
	}
	function updateDehydratedSuspenseComponent(current, workInProgress, didSuspend, didPrimaryChildrenDefer, nextProps, suspenseInstance, suspenseState, renderLanes) {
		if (didSuspend) {
			if (workInProgress.flags & 256) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags &= -257, retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			if (null !== workInProgress.memoizedState) return reuseSuspenseHandlerOnStack(), workInProgress.child = current.child, workInProgress.flags |= 128, null;
			reuseSuspenseHandlerOnStack();
			suspenseInstance = nextProps.fallback;
			suspenseState = workInProgress.mode;
			nextProps = mountWorkInProgressOffscreenFiber({
				mode: "visible",
				children: nextProps.children
			}, suspenseState);
			suspenseInstance = createFiberFromFragment(suspenseInstance, suspenseState, renderLanes, null);
			suspenseInstance.flags |= 2;
			nextProps.return = workInProgress;
			suspenseInstance.return = workInProgress;
			nextProps.sibling = suspenseInstance;
			workInProgress.child = nextProps;
			reconcileChildFibers(workInProgress, current.child, null, renderLanes);
			nextProps = workInProgress.child;
			nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes);
			nextProps.childLanes = getRemainingWorkInPrimaryTree(current, didPrimaryChildrenDefer, renderLanes);
			workInProgress.memoizedState = SUSPENDED_MARKER;
			return bailoutOffscreenComponent(null, nextProps);
		}
		pushPrimaryTreeSuspenseHandler(workInProgress);
		if (isSuspenseInstanceFallback(suspenseInstance)) {
			didPrimaryChildrenDefer = suspenseInstance.nextSibling && suspenseInstance.nextSibling.dataset;
			if (didPrimaryChildrenDefer) var digest = didPrimaryChildrenDefer.dgst;
			didPrimaryChildrenDefer = digest;
			"" !== didPrimaryChildrenDefer && (nextProps = Error(formatProdErrorMessage(419)), nextProps.stack = "", nextProps.digest = didPrimaryChildrenDefer, queueHydrationError({
				value: nextProps,
				source: null,
				stack: null
			}));
			return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
		}
		didReceiveUpdate || propagateParentContextChanges(current, workInProgress, renderLanes, !1);
		didPrimaryChildrenDefer = 0 !== (renderLanes & current.childLanes);
		if (didReceiveUpdate || didPrimaryChildrenDefer) {
			if (null !== currentTreeHiddenStackCursor.current) return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
			didPrimaryChildrenDefer = workInProgressRoot;
			if (null !== didPrimaryChildrenDefer && (nextProps = getBumpedLaneForHydration(didPrimaryChildrenDefer, renderLanes), 0 !== nextProps && nextProps !== suspenseState.retryLane)) throw suspenseState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(didPrimaryChildrenDefer, current, nextProps), SelectiveHydrationException;
			isSuspenseInstancePending(suspenseInstance) || renderDidSuspendDelayIfPossible();
			return retrySuspenseComponentWithoutHydrating(current, workInProgress, renderLanes);
		}
		if (isSuspenseInstancePending(suspenseInstance)) return workInProgress.flags |= 192, workInProgress.child = current.child, null;
		current = suspenseState.treeContext;
		nextHydratableInstance = getNextHydratable(suspenseInstance.nextSibling);
		hydrationParentFiber = workInProgress;
		isHydrating = !0;
		hydrationErrors = null;
		rootOrSingletonContext = !1;
		null !== current && restoreSuspendedTreeContext(workInProgress, current);
		workInProgress = mountSuspensePrimaryChildren(workInProgress, nextProps.children);
		workInProgress.flags |= 134221824;
		return workInProgress;
	}
	function scheduleSuspenseWorkOnFiber(fiber, renderLanes, propagationRoot) {
		fiber.lanes |= renderLanes;
		var alternate = fiber.alternate;
		null !== alternate && (alternate.lanes |= renderLanes);
		scheduleContextWorkOnParentPath(fiber.return, renderLanes, propagationRoot);
	}
	function findLastContentRow(firstChild) {
		for (var lastContentRow = null; null !== firstChild;) {
			var currentRow = firstChild.alternate;
			null !== currentRow && null === findFirstSuspended(currentRow) && (lastContentRow = firstChild);
			firstChild = firstChild.sibling;
		}
		return lastContentRow;
	}
	function initSuspenseListRenderState(workInProgress, isBackwards, tail, lastContentRow, tailMode, treeForkCount) {
		var renderState = workInProgress.memoizedState;
		null === renderState ? workInProgress.memoizedState = {
			isBackwards,
			rendering: null,
			renderingStartTime: 0,
			last: lastContentRow,
			tail,
			tailMode,
			treeForkCount
		} : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount);
	}
	function reverseChildren(fiber) {
		var row = fiber.child;
		for (fiber.child = null; null !== row;) {
			var nextRow = row.sibling;
			row.sibling = fiber.child;
			fiber.child = row;
			row = nextRow;
		}
	}
	function updateSuspenseListComponent(current, workInProgress, renderLanes) {
		var nextProps = workInProgress.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
		nextProps = nextProps.children;
		var suspenseContext = suspenseStackCursor.current;
		if (workInProgress.flags & 128) return pushSuspenseListContext(workInProgress, suspenseContext), null;
		var shouldForceFallback = 0 !== (suspenseContext & 2);
		shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress.flags |= 128) : suspenseContext &= 1;
		pushSuspenseListContext(workInProgress, suspenseContext);
		"backwards" === revealOrder && null !== current ? (reverseChildren(current), reconcileChildren(current, workInProgress, nextProps, renderLanes), reverseChildren(current)) : reconcileChildren(current, workInProgress, nextProps, renderLanes);
		nextProps = isHydrating ? treeForkCount : 0;
		if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128)) a: for (current = workInProgress.child; null !== current;) {
			if (13 === current.tag) null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (19 === current.tag) scheduleSuspenseWorkOnFiber(current, renderLanes, workInProgress);
			else if (null !== current.child) {
				current.child.return = current;
				current = current.child;
				continue;
			}
			if (current === workInProgress) break a;
			for (; null === current.sibling;) {
				if (null === current.return || current.return === workInProgress) break a;
				current = current.return;
			}
			current.sibling.return = current.return;
			current = current.sibling;
		}
		switch (revealOrder) {
			case "backwards":
				renderLanes = findLastContentRow(workInProgress.child);
				null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null, reverseChildren(workInProgress));
				initSuspenseListRenderState(workInProgress, !0, revealOrder, null, tailMode, nextProps);
				break;
			case "unstable_legacy-backwards":
				renderLanes = null;
				revealOrder = workInProgress.child;
				for (workInProgress.child = null; null !== revealOrder;) {
					current = revealOrder.alternate;
					if (null !== current && null === findFirstSuspended(current)) {
						workInProgress.child = revealOrder;
						break;
					}
					current = revealOrder.sibling;
					revealOrder.sibling = renderLanes;
					renderLanes = revealOrder;
					revealOrder = current;
				}
				initSuspenseListRenderState(workInProgress, !0, renderLanes, null, tailMode, nextProps);
				break;
			case "together":
				initSuspenseListRenderState(workInProgress, !1, null, null, void 0, nextProps);
				break;
			case "independent":
				workInProgress.memoizedState = null;
				break;
			default: renderLanes = findLastContentRow(workInProgress.child), null === renderLanes ? (revealOrder = workInProgress.child, workInProgress.child = null) : (revealOrder = renderLanes.sibling, renderLanes.sibling = null), initSuspenseListRenderState(workInProgress, !1, revealOrder, renderLanes, tailMode, nextProps);
		}
		return workInProgress.child;
	}
	function updateContextProvider(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		pushProvider(workInProgress, workInProgress.type, newProps.value);
		reconcileChildren(current, workInProgress, newProps.children, renderLanes);
		return workInProgress.child;
	}
	function bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes) {
		null !== current && (workInProgress.dependencies = current.dependencies);
		workInProgressRootSkippedLanes |= workInProgress.lanes;
		if (0 === (renderLanes & workInProgress.childLanes)) if (null !== current) {
			if (propagateParentContextChanges(current, workInProgress, renderLanes, !1), 0 === (renderLanes & workInProgress.childLanes)) return null;
		} else return null;
		if (null !== current && workInProgress.child !== current.child) throw Error(formatProdErrorMessage(153));
		if (null !== workInProgress.child) {
			current = workInProgress.child;
			renderLanes = createWorkInProgress(current, current.pendingProps);
			workInProgress.child = renderLanes;
			for (renderLanes.return = workInProgress; null !== current.sibling;) current = current.sibling, renderLanes = renderLanes.sibling = createWorkInProgress(current, current.pendingProps), renderLanes.return = workInProgress;
			renderLanes.sibling = null;
		}
		return workInProgress.child;
	}
	function checkScheduledUpdateOrContext(current, renderLanes) {
		if (0 !== (current.lanes & renderLanes)) return !0;
		current = current.dependencies;
		return null !== current && checkIfContextChanged(current) ? !0 : !1;
	}
	function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes) {
		switch (workInProgress.tag) {
			case 3:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
				resetHydrationState();
				break;
			case 27:
			case 5:
				pushHostContext(workInProgress);
				break;
			case 4:
				pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
				break;
			case 10:
				pushProvider(workInProgress, workInProgress.type, workInProgress.memoizedProps.value);
				break;
			case 31:
				if (null !== workInProgress.memoizedState) return workInProgress.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress), null;
				break;
			case 13:
				var state$108 = workInProgress.memoizedState;
				if (null !== state$108) {
					if (null !== state$108.dehydrated) return pushPrimaryTreeSuspenseHandler(workInProgress), workInProgress.flags |= 128, null;
					state$108 = propagateParentContextChanges(current, workInProgress, renderLanes, !1);
					var primaryChildLanes = workInProgress.child.childLanes;
					if (state$108 || 0 !== (renderLanes & primaryChildLanes)) return updateSuspenseComponent(current, workInProgress, renderLanes);
					pushPrimaryTreeSuspenseHandler(workInProgress);
					current = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
					return null !== current ? current.sibling : null;
				}
				pushPrimaryTreeSuspenseHandler(workInProgress);
				break;
			case 19:
				if (workInProgress.flags & 128) return updateSuspenseListComponent(current, workInProgress, renderLanes);
				primaryChildLanes = 0 !== (current.flags & 128);
				state$108 = 0 !== (renderLanes & workInProgress.childLanes);
				state$108 || (propagateParentContextChanges(current, workInProgress, renderLanes, !1), state$108 = 0 !== (renderLanes & workInProgress.childLanes));
				if (primaryChildLanes) {
					if (state$108) return updateSuspenseListComponent(current, workInProgress, renderLanes);
					workInProgress.flags |= 128;
				}
				primaryChildLanes = workInProgress.memoizedState;
				null !== primaryChildLanes && (primaryChildLanes.rendering = null, primaryChildLanes.tail = null, primaryChildLanes.lastEffect = null);
				pushSuspenseListContext(workInProgress, suspenseStackCursor.current);
				if (state$108) break;
				else return null;
			case 22: return workInProgress.lanes = 0, updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: pushProvider(workInProgress, CacheContext, current.memoizedState.cache);
		}
		return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
	}
	function beginWork(current, workInProgress, renderLanes) {
		if (null !== current) if (current.memoizedProps !== workInProgress.pendingProps) didReceiveUpdate = !0;
		else {
			if (!checkScheduledUpdateOrContext(current, renderLanes) && 0 === (workInProgress.flags & 128)) return didReceiveUpdate = !1, attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
			didReceiveUpdate = 0 !== (current.flags & 131072) ? !0 : !1;
		}
		else didReceiveUpdate = !1, isHydrating && 0 !== (workInProgress.flags & 1048576) && pushTreeId(workInProgress, treeForkCount, workInProgress.index);
		workInProgress.lanes = 0;
		switch (workInProgress.tag) {
			case 16:
				a: {
					var props = workInProgress.pendingProps;
					current = resolveLazy(workInProgress.elementType);
					workInProgress.type = current;
					if ("function" === typeof current) shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress.tag = 1, workInProgress = updateClassComponent(null, workInProgress, current, props, renderLanes)) : (workInProgress.tag = 0, workInProgress = updateFunctionComponent(null, workInProgress, current, props, renderLanes));
					else {
						if (void 0 !== current && null !== current) {
							var $$typeof = current.$$typeof;
							if ($$typeof === REACT_FORWARD_REF_TYPE) {
								workInProgress.tag = 11;
								workInProgress = updateForwardRef(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_MEMO_TYPE) {
								workInProgress.tag = 14;
								workInProgress = updateMemoComponent(null, workInProgress, current, props, renderLanes);
								break a;
							} else if ($$typeof === REACT_CONTEXT_TYPE) {
								workInProgress.tag = 10;
								workInProgress.type = current;
								workInProgress = updateContextProvider(null, workInProgress, renderLanes);
								break a;
							}
						}
						workInProgress = getComponentNameFromType(current) || current;
						throw Error(formatProdErrorMessage(306, workInProgress, ""));
					}
				}
				return workInProgress;
			case 0: return updateFunctionComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 1: return props = workInProgress.type, $$typeof = resolveClassComponentProps(props, workInProgress.pendingProps), updateClassComponent(current, workInProgress, props, $$typeof, renderLanes);
			case 3:
				a: {
					pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo);
					if (null === current) throw Error(formatProdErrorMessage(387));
					props = workInProgress.pendingProps;
					var prevState = workInProgress.memoizedState;
					$$typeof = prevState.element;
					cloneUpdateQueue(current, workInProgress);
					processUpdateQueue(workInProgress, props, null, renderLanes);
					var nextState = workInProgress.memoizedState;
					props = nextState.cache;
					pushProvider(workInProgress, CacheContext, props);
					props !== prevState.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0);
					suspendIfUpdateReadFromEntangledAsyncAction();
					props = nextState.element;
					if (prevState.isDehydrated) if (prevState = {
						element: props,
						isDehydrated: !1,
						cache: nextState.cache
					}, workInProgress.updateQueue.baseState = prevState, workInProgress.memoizedState = prevState, workInProgress.flags & 256) {
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else if (props !== $$typeof) {
						$$typeof = createCapturedValueAtFiber(Error(formatProdErrorMessage(424)), workInProgress);
						queueHydrationError($$typeof);
						workInProgress = mountHostRootWithoutHydrating(current, workInProgress, props, renderLanes);
						break a;
					} else {
						current = workInProgress.stateNode.containerInfo;
						switch (current.nodeType) {
							case 9:
								current = current.body;
								break;
							default: current = "HTML" === current.nodeName ? current.ownerDocument.body : current;
						}
						nextHydratableInstance = getNextHydratable(current.firstChild);
						hydrationParentFiber = workInProgress;
						isHydrating = !0;
						hydrationErrors = null;
						rootOrSingletonContext = !0;
						renderLanes = mountChildFibers(workInProgress, null, props, renderLanes);
						for (workInProgress.child = renderLanes; renderLanes;) renderLanes.flags = renderLanes.flags & -3 | 134221824, renderLanes = renderLanes.sibling;
					}
					else {
						resetHydrationState();
						if (props === $$typeof) {
							workInProgress = bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
							break a;
						}
						reconcileChildren(current, workInProgress, props, renderLanes);
					}
					workInProgress = workInProgress.child;
				}
				return workInProgress;
			case 26: return markRef(current, workInProgress), null === current ? (renderLanes = getResource(workInProgress.type, null, workInProgress.pendingProps, null)) ? workInProgress.memoizedState = renderLanes : isHydrating || (workInProgress.stateNode = createHoistableInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current, workInProgress)) : workInProgress.memoizedState = getResource(workInProgress.type, current.memoizedProps, workInProgress.pendingProps, current.memoizedState), null;
			case 27: return pushHostContext(workInProgress), null === current && isHydrating && (props = workInProgress.stateNode = resolveSingletonInstance(workInProgress.type, workInProgress.pendingProps, rootInstanceStackCursor.current), hydrationParentFiber = workInProgress, rootOrSingletonContext = !0, $$typeof = nextHydratableInstance, isSingletonScope(workInProgress.type) ? (previousHydratableOnEnteringScopedSingleton = $$typeof, nextHydratableInstance = getNextHydratable(props.firstChild)) : nextHydratableInstance = $$typeof), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), markRef(current, workInProgress), null === current && (workInProgress.flags |= 4194304), workInProgress.child;
			case 5:
				if (null === current && isHydrating) {
					if ($$typeof = props = nextHydratableInstance) props = canHydrateInstance(props, workInProgress.type, workInProgress.pendingProps, rootOrSingletonContext), null !== props ? (workInProgress.stateNode = props, hydrationParentFiber = workInProgress, nextHydratableInstance = getNextHydratable(props.firstChild), rootOrSingletonContext = !1, $$typeof = !0) : $$typeof = !1;
					$$typeof || throwOnHydrationMismatch(workInProgress);
				}
				pushHostContext(workInProgress);
				$$typeof = workInProgress.type;
				prevState = workInProgress.pendingProps;
				nextState = null !== current ? current.memoizedProps : null;
				props = prevState.children;
				shouldSetTextContent($$typeof, prevState) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress.flags |= 32);
				null !== workInProgress.memoizedState && ($$typeof = renderWithHooks(current, workInProgress, TransitionAwareHostComponent, null, null, renderLanes), HostTransitionContext._currentValue = $$typeof);
				markRef(current, workInProgress);
				reconcileChildren(current, workInProgress, props, renderLanes);
				return workInProgress.child;
			case 6:
				if (null === current && isHydrating) {
					if (current = renderLanes = nextHydratableInstance) renderLanes = canHydrateTextInstance(renderLanes, workInProgress.pendingProps, rootOrSingletonContext), null !== renderLanes ? (workInProgress.stateNode = renderLanes, hydrationParentFiber = workInProgress, nextHydratableInstance = null, current = !0) : current = !1;
					current || throwOnHydrationMismatch(workInProgress);
				}
				return null;
			case 13: return updateSuspenseComponent(current, workInProgress, renderLanes);
			case 4: return pushHostContainer(workInProgress, workInProgress.stateNode.containerInfo), props = workInProgress.pendingProps, null === current ? workInProgress.child = reconcileChildFibers(workInProgress, null, props, renderLanes) : reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 11: return updateForwardRef(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 7: return props = workInProgress.pendingProps, markRef(current, workInProgress), reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 8: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 12: return reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 10: return updateContextProvider(current, workInProgress, renderLanes);
			case 9: return $$typeof = workInProgress.type._context, props = workInProgress.pendingProps.children, prepareToReadContext(workInProgress), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress.flags |= 1, reconcileChildren(current, workInProgress, props, renderLanes), workInProgress.child;
			case 14: return updateMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 15: return updateSimpleMemoComponent(current, workInProgress, workInProgress.type, workInProgress.pendingProps, renderLanes);
			case 19: return updateSuspenseListComponent(current, workInProgress, renderLanes);
			case 31: return updateActivityComponent(current, workInProgress, renderLanes);
			case 22: return updateOffscreenComponent(current, workInProgress, renderLanes, workInProgress.pendingProps);
			case 24: return prepareToReadContext(workInProgress), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, prevState = createCache(), $$typeof.pooledCache = prevState, prevState.refCount++, null !== prevState && ($$typeof.pooledCacheLanes |= renderLanes), $$typeof = prevState), workInProgress.memoizedState = {
				parent: props,
				cache: $$typeof
			}, initializeUpdateQueue(workInProgress), pushProvider(workInProgress, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes) && (cloneUpdateQueue(current, workInProgress), processUpdateQueue(workInProgress, null, null, renderLanes), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, prevState = workInProgress.memoizedState, $$typeof.parent !== props ? ($$typeof = {
				parent: props,
				cache: props
			}, workInProgress.memoizedState = $$typeof, 0 === workInProgress.lanes && (workInProgress.memoizedState = workInProgress.updateQueue.baseState = $$typeof), pushProvider(workInProgress, CacheContext, props)) : (props = prevState.cache, pushProvider(workInProgress, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(workInProgress, [CacheContext], renderLanes, !0))), reconcileChildren(current, workInProgress, workInProgress.pendingProps.children, renderLanes), workInProgress.child;
			case 30: return null === workInProgress.stateNode && (workInProgress.stateNode = {
				autoName: null,
				paired: null,
				clones: null,
				ref: null
			}), props = workInProgress.pendingProps, null != props.name && "auto" !== props.name ? workInProgress.flags |= null === current ? 18882560 : 18874368 : isHydrating && pushMaterializedTreeId(workInProgress), null !== current && current.memoizedProps.name !== props.name ? workInProgress.flags |= 4194816 : markRef(current, workInProgress), reconcileChildren(current, workInProgress, props.children, renderLanes), workInProgress.child;
			case 29: throw workInProgress.pendingProps;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function markUpdate(workInProgress) {
		workInProgress.flags |= 4;
	}
	function preloadInstanceAndSuspendIfNeeded(workInProgress, type, oldProps, newProps, renderLanes) {
		var JSCompiler_temp;
		if (JSCompiler_temp = 0 !== (workInProgress.mode & 32)) JSCompiler_temp = null === oldProps ? maySuspendCommit(type, newProps) : maySuspendCommit(type, newProps) && (newProps.src !== oldProps.src || newProps.srcSet !== oldProps.srcSet);
		if (JSCompiler_temp) {
			if (workInProgress.flags |= 16777216, (renderLanes & 335544128) === renderLanes) if (workInProgress.stateNode.complete) workInProgress.flags |= 8192;
			else if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
			else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		} else workInProgress.flags &= -16777217;
	}
	function preloadResourceAndSuspendIfNeeded(workInProgress, resource) {
		if ("stylesheet" !== resource.type || 0 !== (resource.state.loading & 4)) workInProgress.flags &= -16777217;
		else if (workInProgress.flags |= 16777216, !preloadResource(resource)) if (shouldRemainOnPreviousScreen()) workInProgress.flags |= 8192;
		else throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
	}
	function scheduleRetryEffect(workInProgress, retryQueue) {
		null !== retryQueue && (workInProgress.flags |= 4);
		workInProgress.flags & 16384 && (retryQueue = 22 !== workInProgress.tag ? claimNextRetryLane() : 536870912, workInProgress.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
	}
	function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
		if (!isHydrating) switch (renderState.tailMode) {
			case "visible": break;
			case "collapsed":
				for (var tailNode = renderState.tail, lastTailNode = null; null !== tailNode;) null !== tailNode.alternate && (lastTailNode = tailNode), tailNode = tailNode.sibling;
				null === lastTailNode ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode.sibling = null;
				break;
			default:
				hasRenderedATailFallback = renderState.tail;
				for (tailNode = null; null !== hasRenderedATailFallback;) null !== hasRenderedATailFallback.alternate && (tailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
				null === tailNode ? renderState.tail = null : tailNode.sibling = null;
		}
	}
	function bubbleProperties(completedWork) {
		var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
		if (didBailout) for (var child$113 = completedWork.child; null !== child$113;) newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags & 1206910976, subtreeFlags |= child$113.flags & 1206910976, child$113.return = completedWork, child$113 = child$113.sibling;
		else for (child$113 = completedWork.child; null !== child$113;) newChildLanes |= child$113.lanes | child$113.childLanes, subtreeFlags |= child$113.subtreeFlags, subtreeFlags |= child$113.flags, child$113.return = completedWork, child$113 = child$113.sibling;
		completedWork.subtreeFlags |= subtreeFlags;
		completedWork.childLanes = newChildLanes;
		return didBailout;
	}
	function completeWork(current, workInProgress, renderLanes) {
		var newProps = workInProgress.pendingProps;
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return bubbleProperties(workInProgress), null;
			case 1: return bubbleProperties(workInProgress), null;
			case 3:
				renderLanes = workInProgress.stateNode;
				newProps = null;
				null !== current && (newProps = current.memoizedState.cache);
				workInProgress.memoizedState.cache !== newProps && (workInProgress.flags |= 2048);
				popProvider(CacheContext);
				popHostContainer();
				renderLanes.pendingContext && (renderLanes.context = renderLanes.pendingContext, renderLanes.pendingContext = null);
				if (null === current || null === current.child) popHydrationState(workInProgress) ? markUpdate(workInProgress) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress.flags & 256) || (workInProgress.flags |= 1024, upgradeHydrationErrorsToRecoverable());
				bubbleProperties(workInProgress);
				return null;
			case 26:
				var type = workInProgress.type, nextResource = workInProgress.memoizedState;
				null === current ? (markUpdate(workInProgress), null !== nextResource ? (bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, null, newProps, renderLanes))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress), bubbleProperties(workInProgress), preloadResourceAndSuspendIfNeeded(workInProgress, nextResource)) : (bubbleProperties(workInProgress), workInProgress.flags &= -16777217) : (current = current.memoizedProps, current !== newProps && markUpdate(workInProgress), bubbleProperties(workInProgress), preloadInstanceAndSuspendIfNeeded(workInProgress, type, current, newProps, renderLanes));
				return null;
			case 27:
				popHostContext(workInProgress);
				renderLanes = rootInstanceStackCursor.current;
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						workInProgress.subtreeFlags &= -33554433;
						return null;
					}
					current = contextStackCursor.current;
					popHydrationState(workInProgress) ? prepareToHydrateHostInstance(workInProgress, current) : (current = resolveSingletonInstance(type, newProps, renderLanes), workInProgress.stateNode = current, markUpdate(workInProgress));
				}
				bubbleProperties(workInProgress);
				workInProgress.subtreeFlags &= -33554433;
				return null;
			case 5:
				popHostContext(workInProgress);
				type = workInProgress.type;
				if (null !== current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if (!newProps) {
						if (null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
						bubbleProperties(workInProgress);
						workInProgress.subtreeFlags &= -33554433;
						return null;
					}
					nextResource = contextStackCursor.current;
					if (popHydrationState(workInProgress)) prepareToHydrateHostInstance(workInProgress, nextResource);
					else {
						var ownerDocument = getOwnerDocumentFromRootContainer(rootInstanceStackCursor.current);
						switch (nextResource) {
							case 1:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
								break;
							case 2:
								nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
								break;
							default: switch (type) {
								case "svg":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/2000/svg", type);
									break;
								case "math":
									nextResource = ownerDocument.createElementNS("http://www.w3.org/1998/Math/MathML", type);
									break;
								case "script":
									nextResource = ownerDocument.createElement("div");
									nextResource.innerHTML = "<script><\/script>";
									nextResource = nextResource.removeChild(nextResource.firstChild);
									break;
								case "select":
									nextResource = "string" === typeof newProps.is ? ownerDocument.createElement("select", { is: newProps.is }) : ownerDocument.createElement("select");
									newProps.multiple ? nextResource.multiple = !0 : newProps.size && (nextResource.size = newProps.size);
									break;
								default: nextResource = "string" === typeof newProps.is ? ownerDocument.createElement(type, { is: newProps.is }) : ownerDocument.createElement(type);
							}
						}
						nextResource[internalInstanceKey] = workInProgress;
						nextResource[internalPropsKey] = newProps;
						a: for (ownerDocument = workInProgress.child; null !== ownerDocument;) {
							if (5 === ownerDocument.tag || 6 === ownerDocument.tag) nextResource.appendChild(ownerDocument.stateNode);
							else if (4 !== ownerDocument.tag && 27 !== ownerDocument.tag && null !== ownerDocument.child) {
								ownerDocument.child.return = ownerDocument;
								ownerDocument = ownerDocument.child;
								continue;
							}
							if (ownerDocument === workInProgress) break a;
							for (; null === ownerDocument.sibling;) {
								if (null === ownerDocument.return || ownerDocument.return === workInProgress) break a;
								ownerDocument = ownerDocument.return;
							}
							ownerDocument.sibling.return = ownerDocument.return;
							ownerDocument = ownerDocument.sibling;
						}
						workInProgress.stateNode = nextResource;
						a: switch (setInitialProperties(nextResource, type, newProps), type) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								newProps = !!newProps.autoFocus;
								break a;
							case "img":
								newProps = !0;
								break a;
							default: newProps = !1;
						}
						newProps && markUpdate(workInProgress);
					}
				}
				bubbleProperties(workInProgress);
				workInProgress.subtreeFlags &= -33554433;
				preloadInstanceAndSuspendIfNeeded(workInProgress, workInProgress.type, null === current ? null : current.memoizedProps, workInProgress.pendingProps, renderLanes);
				return null;
			case 6:
				if (current && null != workInProgress.stateNode) current.memoizedProps !== newProps && markUpdate(workInProgress);
				else {
					if ("string" !== typeof newProps && null === workInProgress.stateNode) throw Error(formatProdErrorMessage(166));
					current = rootInstanceStackCursor.current;
					if (popHydrationState(workInProgress)) {
						current = workInProgress.stateNode;
						renderLanes = workInProgress.memoizedProps;
						newProps = null;
						type = hydrationParentFiber;
						if (null !== type) switch (type.tag) {
							case 27:
							case 5: newProps = type.memoizedProps;
						}
						current[internalInstanceKey] = workInProgress;
						current = current.nodeValue === renderLanes || null !== newProps && !0 === newProps.suppressHydrationWarning || checkForUnmatchedText(current.nodeValue, renderLanes) ? !0 : !1;
						current || throwOnHydrationMismatch(workInProgress, !0);
					} else current = getOwnerDocumentFromRootContainer(current).createTextNode(newProps), current[internalInstanceKey] = workInProgress, workInProgress.stateNode = current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 31:
				renderLanes = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState) {
					newProps = popHydrationState(workInProgress);
					if (null !== renderLanes) {
						if (null === current) {
							if (!newProps) throw Error(formatProdErrorMessage(318));
							current = workInProgress.memoizedState;
							current = null !== current ? current.dehydrated : null;
							if (!current) throw Error(formatProdErrorMessage(557));
							current[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						current = !1;
					} else renderLanes = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes), current = !0;
					if (!current) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
					if (0 !== (workInProgress.flags & 128)) throw Error(formatProdErrorMessage(558));
				}
				bubbleProperties(workInProgress);
				return null;
			case 13:
				newProps = workInProgress.memoizedState;
				if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
					type = popHydrationState(workInProgress);
					if (null !== newProps && null !== newProps.dehydrated) {
						if (null === current) {
							if (!type) throw Error(formatProdErrorMessage(318));
							type = workInProgress.memoizedState;
							type = null !== type ? type.dehydrated : null;
							if (!type) throw Error(formatProdErrorMessage(317));
							type[internalInstanceKey] = workInProgress;
						} else resetHydrationState(), 0 === (workInProgress.flags & 128) && (workInProgress.memoizedState = null), workInProgress.flags |= 4;
						bubbleProperties(workInProgress);
						type = !1;
					} else type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = !0;
					if (!type) {
						if (workInProgress.flags & 256) return popSuspenseHandler(workInProgress), workInProgress;
						popSuspenseHandler(workInProgress);
						return null;
					}
				}
				popSuspenseHandler(workInProgress);
				if (0 !== (workInProgress.flags & 128)) return workInProgress.lanes = renderLanes, workInProgress;
				renderLanes = null !== newProps;
				current = null !== current && null !== current.memoizedState;
				renderLanes && (newProps = workInProgress.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
				renderLanes !== current && renderLanes && (workInProgress.child.flags |= 8192);
				scheduleRetryEffect(workInProgress, workInProgress.updateQueue);
				bubbleProperties(workInProgress);
				return null;
			case 4: return popHostContainer(), null === current && listenToAllSupportedEvents(workInProgress.stateNode.containerInfo), workInProgress.flags |= 67108864, bubbleProperties(workInProgress), null;
			case 10: return popProvider(workInProgress.type), bubbleProperties(workInProgress), null;
			case 19:
				popSuspenseListContext(workInProgress);
				newProps = workInProgress.memoizedState;
				if (null === newProps) return bubbleProperties(workInProgress), null;
				type = 0 !== (workInProgress.flags & 128);
				nextResource = newProps.rendering;
				if (null === nextResource) if (type) cutOffTailIfNeeded(newProps, !1);
				else {
					if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128)) for (current = workInProgress.child; null !== current;) {
						nextResource = findFirstSuspended(current);
						if (null !== nextResource) {
							workInProgress.flags |= 128;
							cutOffTailIfNeeded(newProps, !1);
							current = nextResource.updateQueue;
							workInProgress.updateQueue = current;
							scheduleRetryEffect(workInProgress, current);
							workInProgress.subtreeFlags = 0;
							current = renderLanes;
							for (renderLanes = workInProgress.child; null !== renderLanes;) resetWorkInProgress(renderLanes, current), renderLanes = renderLanes.sibling;
							pushSuspenseListContext(workInProgress, suspenseStackCursor.current & 1 | 2);
							isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
							return workInProgress.child;
						}
						current = current.sibling;
					}
					null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
				}
				else {
					if (!type) if (current = findFirstSuspended(nextResource), null !== current) {
						if (workInProgress.flags |= 128, type = !0, current = current.updateQueue, workInProgress.updateQueue = current, scheduleRetryEffect(workInProgress, current), cutOffTailIfNeeded(newProps, !0), null === newProps.tail && "collapsed" !== newProps.tailMode && "visible" !== newProps.tailMode && !nextResource.alternate && !isHydrating) return bubbleProperties(workInProgress), null;
					} else 2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes && (workInProgress.flags |= 128, type = !0, cutOffTailIfNeeded(newProps, !1), workInProgress.lanes = 4194304);
					newProps.isBackwards ? (nextResource.sibling = workInProgress.child, workInProgress.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress.child = nextResource, newProps.last = nextResource);
				}
				if (null !== newProps.tail) {
					current = newProps.tail;
					a: {
						for (renderLanes = current; null !== renderLanes;) {
							if (null !== renderLanes.alternate) {
								renderLanes = !1;
								break a;
							}
							renderLanes = renderLanes.sibling;
						}
						renderLanes = !0;
					}
					newProps.rendering = current;
					newProps.tail = current.sibling;
					newProps.renderingStartTime = now();
					current.sibling = null;
					nextResource = suspenseStackCursor.current;
					nextResource = type ? nextResource & 1 | 2 : nextResource & 1;
					"visible" === newProps.tailMode || "collapsed" === newProps.tailMode || !renderLanes || isHydrating ? pushSuspenseListContext(workInProgress, nextResource) : (renderLanes = nextResource, push(suspenseHandlerStackCursor, workInProgress), push(suspenseStackCursor, renderLanes), null === shellBoundary && (shellBoundary = workInProgress));
					isHydrating && pushTreeFork(workInProgress, newProps.treeForkCount);
					return current;
				}
				bubbleProperties(workInProgress);
				return null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), newProps = null !== workInProgress.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress.flags |= 8192) : newProps && (workInProgress.flags |= 8192), newProps ? 0 !== (renderLanes & 536870912) && 0 === (workInProgress.flags & 128) && (bubbleProperties(workInProgress), workInProgress.subtreeFlags & 6 && (workInProgress.flags |= 8192)) : bubbleProperties(workInProgress), renderLanes = workInProgress.updateQueue, null !== renderLanes && scheduleRetryEffect(workInProgress, renderLanes.retryQueue), renderLanes = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress.memoizedState && null !== workInProgress.memoizedState.cachePool && (newProps = workInProgress.memoizedState.cachePool.pool), newProps !== renderLanes && (workInProgress.flags |= 2048), null !== current && pop(resumedCache), null;
			case 24: return renderLanes = null, null !== current && (renderLanes = current.memoizedState.cache), workInProgress.memoizedState.cache !== renderLanes && (workInProgress.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress), null;
			case 25: return null;
			case 30: return workInProgress.flags |= 33554432, bubbleProperties(workInProgress), null;
		}
		throw Error(formatProdErrorMessage(156, workInProgress.tag));
	}
	function unwindWork(current, workInProgress) {
		popTreeContext(workInProgress);
		switch (workInProgress.tag) {
			case 1: return current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 3: return popProvider(CacheContext), popHostContainer(), current = workInProgress.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 26:
			case 27:
			case 5: return popHostContext(workInProgress), null;
			case 31:
				if (null !== workInProgress.memoizedState) {
					popSuspenseHandler(workInProgress);
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 13:
				popSuspenseHandler(workInProgress);
				current = workInProgress.memoizedState;
				if (null !== current && null !== current.dehydrated) {
					if (null === workInProgress.alternate) throw Error(formatProdErrorMessage(340));
					resetHydrationState();
				}
				current = workInProgress.flags;
				return current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 19: return popSuspenseListContext(workInProgress), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, current = workInProgress.memoizedState, null !== current && (current.rendering = null, current.tail = null), workInProgress.flags |= 4, workInProgress) : null;
			case 4: return popHostContainer(), null;
			case 10: return popProvider(workInProgress.type), null;
			case 22:
			case 23: return popSuspenseHandler(workInProgress), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress.flags, current & 65536 ? (workInProgress.flags = current & -65537 | 128, workInProgress) : null;
			case 24: return popProvider(CacheContext), null;
			case 25: return null;
			default: return null;
		}
	}
	function unwindInterruptedWork(current, interruptedWork) {
		popTreeContext(interruptedWork);
		switch (interruptedWork.tag) {
			case 3:
				popProvider(CacheContext);
				popHostContainer();
				break;
			case 26:
			case 27:
			case 5:
				popHostContext(interruptedWork);
				break;
			case 4:
				popHostContainer();
				break;
			case 31:
				null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
				break;
			case 13:
				popSuspenseHandler(interruptedWork);
				break;
			case 19:
				popSuspenseListContext(interruptedWork);
				break;
			case 10:
				popProvider(interruptedWork.type);
				break;
			case 22:
			case 23:
				popSuspenseHandler(interruptedWork);
				popHiddenContext();
				null !== current && pop(resumedCache);
				break;
			case 24: popProvider(CacheContext);
		}
	}
	function commitHookEffectListMount(flags, finishedWork) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						lastEffect = void 0;
						var create = updateQueue.create, inst = updateQueue.inst;
						lastEffect = create();
						inst.destroy = lastEffect;
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
		try {
			var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
			if (null !== lastEffect) {
				var firstEffect = lastEffect.next;
				updateQueue = firstEffect;
				do {
					if ((updateQueue.tag & flags) === flags) {
						var inst = updateQueue.inst, destroy = inst.destroy;
						if (void 0 !== destroy) {
							inst.destroy = void 0;
							lastEffect = finishedWork;
							var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
							try {
								destroy_();
							} catch (error) {
								captureCommitPhaseError(lastEffect, nearestMountedAncestor, error);
							}
						}
					}
					updateQueue = updateQueue.next;
				} while (updateQueue !== firstEffect);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitClassCallbacks(finishedWork) {
		var updateQueue = finishedWork.updateQueue;
		if (null !== updateQueue) {
			var instance = finishedWork.stateNode;
			try {
				commitCallbacks(updateQueue, instance);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
		instance.props = resolveClassComponentProps(current.type, current.memoizedProps);
		instance.state = current.memoizedState;
		try {
			instance.componentWillUnmount();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyAttachRef(current, nearestMountedAncestor) {
		try {
			var ref = current.ref;
			if (null !== ref) {
				switch (current.tag) {
					case 26:
					case 27:
					case 5:
						var instanceToUse = current.stateNode;
						break;
					case 30:
						var instance = current.stateNode, name = getViewTransitionName(current.memoizedProps, instance);
						if (null === instance.ref || instance.ref.name !== name) instance.ref = createViewTransitionInstance(name);
						instanceToUse = instance.ref;
						break;
					case 7:
						if (null === current.stateNode) {
							var fragmentInstance = new FragmentInstance(current);
							traverseVisibleInstancesAndTextInstances(current.child, !1, addFragmentHandleToFiber, fragmentInstance, void 0, void 0);
							current.stateNode = fragmentInstance;
						}
						instanceToUse = current.stateNode;
						break;
					default: instanceToUse = current.stateNode;
				}
				"function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
			}
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		}
	}
	function safelyDetachRef(current, nearestMountedAncestor) {
		var ref = current.ref, refCleanup = current.refCleanup;
		if (null !== ref) if ("function" === typeof refCleanup) try {
			refCleanup();
		} catch (error) {
			captureCommitPhaseError(current, nearestMountedAncestor, error);
		} finally {
			current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
		}
		else if ("function" === typeof ref) try {
			ref(null);
		} catch (error$148) {
			captureCommitPhaseError(current, nearestMountedAncestor, error$148);
		}
		else ref.current = null;
	}
	function commitNewChildToFragmentInstances(fiber, parentFragmentInstances) {
		if ((5 === fiber.tag || 27 === fiber.tag || 6 === fiber.tag) && null === fiber.alternate && null !== parentFragmentInstances) for (var i = 0; i < parentFragmentInstances.length; i++) commitNewChildToFragmentInstance(fiber.stateNode, parentFragmentInstances[i]);
	}
	function commitFragmentInstanceInsertionEffects(fiber) {
		for (var parent = fiber.return; null !== parent;) {
			isFragmentInstanceParent(parent) && commitNewChildToFragmentInstance(fiber.stateNode, parent.stateNode);
			if (isFragmentInstanceHostBoundary(parent)) break;
			parent = parent.return;
		}
	}
	function commitFragmentInstanceDeletionEffects(fiber) {
		for (var parent = fiber.return; null !== parent;) {
			isFragmentInstanceParent(parent) && deleteChildFromFragmentInstance(fiber.stateNode, parent.stateNode);
			if (isFragmentInstanceHostBoundary(parent)) break;
			parent = parent.return;
		}
	}
	function isFragmentInstanceHostBoundary(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 27 === fiber.tag;
	}
	function isFragmentInstanceParent(fiber) {
		return fiber && 7 === fiber.tag && null !== fiber.stateNode;
	}
	function commitHostMount(finishedWork) {
		var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
		try {
			a: switch (type) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					props.autoFocus && instance.focus();
					break a;
				case "img": props.src ? instance.src = props.src : props.srcSet && (instance.srcset = props.srcSet);
			}
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function commitHostUpdate(finishedWork, newProps, oldProps) {
		try {
			var domElement = finishedWork.stateNode;
			updateProperties(domElement, finishedWork.type, oldProps, newProps);
			domElement[internalPropsKey] = newProps;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function isHostParent(fiber) {
		return 5 === fiber.tag || 3 === fiber.tag || 26 === fiber.tag || 27 === fiber.tag && isSingletonScope(fiber.type) || 4 === fiber.tag;
	}
	function getHostSibling(fiber) {
		a: for (;;) {
			for (; null === fiber.sibling;) {
				if (null === fiber.return || isHostParent(fiber.return)) return null;
				fiber = fiber.return;
			}
			fiber.sibling.return = fiber.return;
			for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag;) {
				if (27 === fiber.tag && isSingletonScope(fiber.type)) continue a;
				if (fiber.flags & 2) continue a;
				if (null === fiber.child || 4 === fiber.tag) continue a;
				else fiber.child.return = fiber, fiber = fiber.child;
			}
			if (!(fiber.flags & 2)) return fiber.stateNode;
		}
	}
	function insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) tag = node.stateNode, before ? (9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent).insertBefore(tag, before) : (before = 9 === parent.nodeType ? parent.body : "HTML" === parent.nodeName ? parent.ownerDocument.body : parent, before.appendChild(tag), parent = parent._reactRootContainer, null !== parent && void 0 !== parent || null !== before.onclick || (before.onclick = noop$1)), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = !0;
		else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode, before = null)), node = node.child, null !== node)) for (insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances), node = node.sibling; null !== node;) insertOrAppendPlacementNodeIntoContainer(node, before, parent, parentFragmentInstances), node = node.sibling;
	}
	function insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances) {
		var tag = node.tag;
		if (5 === tag || 6 === tag) tag = node.stateNode, before ? parent.insertBefore(tag, before) : parent.appendChild(tag), commitNewChildToFragmentInstances(node, parentFragmentInstances), viewTransitionMutationContext = !0;
		else if (4 !== tag && (27 === tag && (commitNewChildToFragmentInstances(node, parentFragmentInstances), parentFragmentInstances = null, isSingletonScope(node.type) && (parent = node.stateNode)), node = node.child, null !== node)) for (insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances), node = node.sibling; null !== node;) insertOrAppendPlacementNode(node, before, parent, parentFragmentInstances), node = node.sibling;
	}
	function commitHostSingletonAcquisition(finishedWork) {
		var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
		try {
			for (var type = finishedWork.type, attributes = singleton.attributes; attributes.length;) singleton.removeAttributeNode(attributes[0]);
			setInitialProperties(singleton, type, props);
			singleton[internalInstanceKey] = finishedWork;
			singleton[internalPropsKey] = props;
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	var shouldStartViewTransition = !1;
	var appearingViewTransitions = null;
	function trackEnterViewTransitions(placement) {
		if (30 === placement.tag || 0 !== (placement.subtreeFlags & 33554432)) shouldStartViewTransition = !0;
	}
	var viewTransitionCancelableChildren = null;
	function pushViewTransitionCancelableScope() {
		var prevChildren = viewTransitionCancelableChildren;
		viewTransitionCancelableChildren = null;
		return prevChildren;
	}
	var viewTransitionHostInstanceIdx = 0;
	function applyViewTransitionToHostInstances(fiber, name, className, collectMeasurements, stopAtNestedViewTransitions) {
		viewTransitionHostInstanceIdx = 0;
		return applyViewTransitionToHostInstancesRecursive(fiber.child, name, className, collectMeasurements, stopAtNestedViewTransitions);
	}
	function applyViewTransitionToHostInstancesRecursive(child, name, className, collectMeasurements, stopAtNestedViewTransitions) {
		for (var inViewport = !1; null !== child;) {
			if (5 === child.tag) {
				var instance = child.stateNode;
				if (null !== collectMeasurements) {
					var measurement = measureInstance(instance);
					collectMeasurements.push(measurement);
					measurement.view && (inViewport = !0);
				} else inViewport || measureInstance(instance).view && (inViewport = !0);
				shouldStartViewTransition = !0;
				applyViewTransitionName(instance, 0 === viewTransitionHostInstanceIdx ? name : name + "_" + viewTransitionHostInstanceIdx, className);
				viewTransitionHostInstanceIdx++;
			} else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions || applyViewTransitionToHostInstancesRecursive(child.child, name, className, collectMeasurements, stopAtNestedViewTransitions) && (inViewport = !0);
			child = child.sibling;
		}
		return inViewport;
	}
	function restoreViewTransitionOnHostInstances(child, stopAtNestedViewTransitions) {
		for (; null !== child;) {
			if (5 === child.tag) restoreViewTransitionName(child.stateNode, child.memoizedProps);
			else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions || restoreViewTransitionOnHostInstances(child.child, stopAtNestedViewTransitions);
			child = child.sibling;
		}
	}
	function commitAppearingPairViewTransitions(placement) {
		if (0 !== (placement.subtreeFlags & 18874368)) for (placement = placement.child; null !== placement;) {
			if (22 !== placement.tag || null === placement.memoizedState) {
				if (commitAppearingPairViewTransitions(placement), 30 === placement.tag && 0 !== (placement.flags & 18874368) && placement.stateNode.paired) {
					var props = placement.memoizedProps;
					if (null == props.name || "auto" === props.name) throw Error(formatProdErrorMessage(544));
					var name = props.name;
					props = getViewTransitionClassName(props.default, props.share);
					"none" !== props && (applyViewTransitionToHostInstances(placement, name, props, null, !1) || restoreViewTransitionOnHostInstances(placement.child, !1));
				}
			}
			placement = placement.sibling;
		}
	}
	function commitEnterViewTransitions(placement, gesture) {
		if (30 === placement.tag) {
			var state = placement.stateNode, props = placement.memoizedProps, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, state.paired ? props.share : props.enter);
			"none" !== className ? applyViewTransitionToHostInstances(placement, name, className, null, !1) ? (commitAppearingPairViewTransitions(placement), state.paired || gesture || scheduleViewTransitionEvent(placement, props.onEnter)) : restoreViewTransitionOnHostInstances(placement.child, !1) : commitAppearingPairViewTransitions(placement);
		} else if (0 !== (placement.subtreeFlags & 33554432)) for (placement = placement.child; null !== placement;) commitEnterViewTransitions(placement, gesture), placement = placement.sibling;
		else commitAppearingPairViewTransitions(placement);
	}
	function commitDeletedPairViewTransitions(deletion) {
		if (null !== appearingViewTransitions && 0 !== appearingViewTransitions.size) {
			var pairs = appearingViewTransitions;
			if (0 !== (deletion.subtreeFlags & 18874368)) for (deletion = deletion.child; null !== deletion;) {
				if (22 !== deletion.tag || null === deletion.memoizedState) {
					if (30 === deletion.tag && 0 !== (deletion.flags & 18874368)) {
						var props = deletion.memoizedProps, name = props.name;
						if (null != name && "auto" !== name) {
							var pair = pairs.get(name);
							if (void 0 !== pair) {
								var className = getViewTransitionClassName(props.default, props.share);
								"none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, !1) ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, scheduleViewTransitionEvent(deletion, props.onShare)) : restoreViewTransitionOnHostInstances(deletion.child, !1));
								pairs.delete(name);
								if (0 === pairs.size) break;
							}
						}
					}
					commitDeletedPairViewTransitions(deletion);
				}
				deletion = deletion.sibling;
			}
		}
	}
	function commitExitViewTransitions(deletion) {
		if (30 === deletion.tag) {
			var props = deletion.memoizedProps, name = getViewTransitionName(props, deletion.stateNode), pair = null !== appearingViewTransitions ? appearingViewTransitions.get(name) : void 0, className = getViewTransitionClassName(props.default, void 0 !== pair ? props.share : props.exit);
			"none" !== className && (applyViewTransitionToHostInstances(deletion, name, className, null, !1) ? void 0 !== pair ? (className = deletion.stateNode, pair.paired = className, className.paired = pair, appearingViewTransitions.delete(name), scheduleViewTransitionEvent(deletion, props.onShare)) : scheduleViewTransitionEvent(deletion, props.onExit) : restoreViewTransitionOnHostInstances(deletion.child, !1));
			null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
		} else if (0 !== (deletion.subtreeFlags & 33554432)) for (deletion = deletion.child; null !== deletion;) commitExitViewTransitions(deletion), deletion = deletion.sibling;
		else null !== appearingViewTransitions && commitDeletedPairViewTransitions(deletion);
	}
	function commitNestedViewTransitions(changedParent) {
		for (changedParent = changedParent.child; null !== changedParent;) {
			if (30 === changedParent.tag) {
				var props = changedParent.memoizedProps, name = getViewTransitionName(props, changedParent.stateNode);
				props = getViewTransitionClassName(props.default, props.update);
				changedParent.flags &= -5;
				"none" !== props && applyViewTransitionToHostInstances(changedParent, name, props, changedParent.memoizedState = [], !1);
			} else 0 !== (changedParent.subtreeFlags & 33554432) && commitNestedViewTransitions(changedParent);
			changedParent = changedParent.sibling;
		}
	}
	function restorePairedViewTransitions(parent) {
		if (0 !== (parent.subtreeFlags & 18874368)) for (parent = parent.child; null !== parent;) {
			if (22 !== parent.tag || null === parent.memoizedState) {
				if (30 === parent.tag && 0 !== (parent.flags & 18874368)) {
					var instance = parent.stateNode;
					null !== instance.paired && (instance.paired = null, restoreViewTransitionOnHostInstances(parent.child, !1));
				}
				restorePairedViewTransitions(parent);
			}
			parent = parent.sibling;
		}
	}
	function restoreEnterOrExitViewTransitions(fiber) {
		if (30 === fiber.tag) fiber.stateNode.paired = null, restoreViewTransitionOnHostInstances(fiber.child, !1), restorePairedViewTransitions(fiber);
		else if (0 !== (fiber.subtreeFlags & 33554432)) for (fiber = fiber.child; null !== fiber;) restoreEnterOrExitViewTransitions(fiber), fiber = fiber.sibling;
		else restorePairedViewTransitions(fiber);
	}
	function restoreNestedViewTransitions(changedParent) {
		for (changedParent = changedParent.child; null !== changedParent;) 30 === changedParent.tag ? restoreViewTransitionOnHostInstances(changedParent.child, !1) : 0 !== (changedParent.subtreeFlags & 33554432) && restoreNestedViewTransitions(changedParent), changedParent = changedParent.sibling;
	}
	function measureViewTransitionHostInstancesRecursive(parentViewTransition, child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) {
		for (var inViewport = !1; null !== child;) {
			if (5 === child.tag) {
				var instance = child.stateNode;
				if (null !== previousMeasurements && viewTransitionHostInstanceIdx < previousMeasurements.length) {
					var previousMeasurement = previousMeasurements[viewTransitionHostInstanceIdx], nextMeasurement = measureInstance(instance);
					if (previousMeasurement.view || nextMeasurement.view) inViewport = !0;
					var JSCompiler_temp;
					if (JSCompiler_temp = 0 === (parentViewTransition.flags & 4)) if (nextMeasurement.clip) JSCompiler_temp = !0;
					else {
						JSCompiler_temp = previousMeasurement.rect;
						var newRect = nextMeasurement.rect;
						JSCompiler_temp = JSCompiler_temp.y !== newRect.y || JSCompiler_temp.x !== newRect.x || JSCompiler_temp.height !== newRect.height || JSCompiler_temp.width !== newRect.width;
					}
					JSCompiler_temp && (parentViewTransition.flags |= 4);
					nextMeasurement.abs ? nextMeasurement = !previousMeasurement.abs : (previousMeasurement = previousMeasurement.rect, nextMeasurement = nextMeasurement.rect, nextMeasurement = previousMeasurement.height !== nextMeasurement.height || previousMeasurement.width !== nextMeasurement.width);
					nextMeasurement && (parentViewTransition.flags |= 32);
				} else parentViewTransition.flags |= 32;
				0 !== (parentViewTransition.flags & 4) && applyViewTransitionName(instance, 0 === viewTransitionHostInstanceIdx ? newName : newName + "_" + viewTransitionHostInstanceIdx, className);
				inViewport && 0 !== (parentViewTransition.flags & 4) || (null === viewTransitionCancelableChildren && (viewTransitionCancelableChildren = []), viewTransitionCancelableChildren.push(instance, 0 === viewTransitionHostInstanceIdx ? oldName : oldName + "_" + viewTransitionHostInstanceIdx, child.memoizedProps));
				viewTransitionHostInstanceIdx++;
			} else if (22 !== child.tag || null === child.memoizedState) 30 === child.tag && stopAtNestedViewTransitions ? parentViewTransition.flags |= child.flags & 32 : measureViewTransitionHostInstancesRecursive(parentViewTransition, child.child, newName, oldName, className, previousMeasurements, stopAtNestedViewTransitions) && (inViewport = !0);
			child = child.sibling;
		}
		return inViewport;
	}
	function measureNestedViewTransitions(changedParent, gesture) {
		for (changedParent = changedParent.child; null !== changedParent;) {
			if (30 === changedParent.tag) {
				var props = changedParent.memoizedProps, state = changedParent.stateNode, name = getViewTransitionName(props, state), className = getViewTransitionClassName(props.default, props.update);
				if (gesture) {
					state = state.clones;
					var previousMeasurements = null === state ? null : state.map(measureClonedInstance);
				} else previousMeasurements = changedParent.memoizedState, changedParent.memoizedState = null;
				state = changedParent;
				var child = changedParent.child;
				viewTransitionHostInstanceIdx = 0;
				name = measureViewTransitionHostInstancesRecursive(state, child, name, name, className, previousMeasurements, !1);
				0 !== (changedParent.flags & 4) && name && (gesture || scheduleViewTransitionEvent(changedParent, props.onUpdate));
			} else 0 !== (changedParent.subtreeFlags & 33554432) && measureNestedViewTransitions(changedParent, gesture);
			changedParent = changedParent.sibling;
		}
	}
	var offscreenSubtreeIsHidden = !1;
	var offscreenSubtreeWasHidden = !1;
	var offscreenDirectParentIsHidden = !1;
	var needsFormReset = !1;
	var PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set;
	var nextEffect = null;
	var viewTransitionContextChanged = !1;
	var inUpdateViewTransition = !1;
	var rootViewTransitionAffected = !1;
	var rootViewTransitionNameCanceled = !1;
	function commitBeforeMutationEffects(root, firstChild, committedLanes) {
		root = root.containerInfo;
		eventsEnabled = _enabled;
		root = getActiveElementDeep(root);
		if (hasSelectionCapabilities(root)) {
			if ("selectionStart" in root) var JSCompiler_temp = {
				start: root.selectionStart,
				end: root.selectionEnd
			};
			else a: {
				JSCompiler_temp = (JSCompiler_temp = root.ownerDocument) && JSCompiler_temp.defaultView || window;
				var selection = JSCompiler_temp.getSelection && JSCompiler_temp.getSelection();
				if (selection && 0 !== selection.rangeCount) {
					JSCompiler_temp = selection.anchorNode;
					var anchorOffset = selection.anchorOffset, focusNode = selection.focusNode;
					selection = selection.focusOffset;
					try {
						JSCompiler_temp.nodeType, focusNode.nodeType;
					} catch (e$21) {
						JSCompiler_temp = null;
						break a;
					}
					var length = 0, start = -1, end = -1, indexWithinAnchor = 0, indexWithinFocus = 0, node = root, parentNode = null;
					b: for (;;) {
						for (var next;;) {
							node !== JSCompiler_temp || 0 !== anchorOffset && 3 !== node.nodeType || (start = length + anchorOffset);
							node !== focusNode || 0 !== selection && 3 !== node.nodeType || (end = length + selection);
							3 === node.nodeType && (length += node.nodeValue.length);
							if (null === (next = node.firstChild)) break;
							parentNode = node;
							node = next;
						}
						for (;;) {
							if (node === root) break b;
							parentNode === JSCompiler_temp && ++indexWithinAnchor === anchorOffset && (start = length);
							parentNode === focusNode && ++indexWithinFocus === selection && (end = length);
							if (null !== (next = node.nextSibling)) break;
							node = parentNode;
							parentNode = node.parentNode;
						}
						node = next;
					}
					JSCompiler_temp = -1 === start || -1 === end ? null : {
						start,
						end
					};
				} else JSCompiler_temp = null;
			}
			JSCompiler_temp = JSCompiler_temp || {
				start: 0,
				end: 0
			};
		} else JSCompiler_temp = null;
		selectionInformation = {
			focusedElem: root,
			selectionRange: JSCompiler_temp
		};
		_enabled = !1;
		committedLanes = (committedLanes & 335544064) === committedLanes;
		nextEffect = firstChild;
		for (firstChild = committedLanes ? 9270 : 1024; null !== nextEffect;) {
			root = nextEffect;
			if (committedLanes && (JSCompiler_temp = root.deletions, null !== JSCompiler_temp)) for (anchorOffset = 0; anchorOffset < JSCompiler_temp.length; anchorOffset++) committedLanes && commitExitViewTransitions(JSCompiler_temp[anchorOffset]);
			if (null === root.alternate && 0 !== (root.flags & 2)) committedLanes && trackEnterViewTransitions(root), commitBeforeMutationEffects_complete(committedLanes);
			else {
				if (22 === root.tag) {
					if (JSCompiler_temp = root.alternate, null !== root.memoizedState) {
						null !== JSCompiler_temp && null === JSCompiler_temp.memoizedState && committedLanes && commitExitViewTransitions(JSCompiler_temp);
						commitBeforeMutationEffects_complete(committedLanes);
						continue;
					} else if (null !== JSCompiler_temp && null !== JSCompiler_temp.memoizedState) {
						committedLanes && trackEnterViewTransitions(root);
						commitBeforeMutationEffects_complete(committedLanes);
						continue;
					}
				}
				JSCompiler_temp = root.child;
				0 !== (root.subtreeFlags & firstChild) && null !== JSCompiler_temp ? (JSCompiler_temp.return = root, nextEffect = JSCompiler_temp) : (committedLanes && commitNestedViewTransitions(root), commitBeforeMutationEffects_complete(committedLanes));
			}
		}
		appearingViewTransitions = null;
	}
	function commitBeforeMutationEffects_complete(isViewTransitionEligible$jscomp$0) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect, isViewTransitionEligible = isViewTransitionEligible$jscomp$0, current = fiber.alternate, flags = fiber.flags;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15: break;
				case 1:
					if (0 !== (flags & 1024) && null !== current) {
						isViewTransitionEligible = void 0;
						flags = current.memoizedProps;
						current = current.memoizedState;
						var instance = fiber.stateNode;
						try {
							var resolvedPrevProps = resolveClassComponentProps(fiber.type, flags);
							isViewTransitionEligible = instance.getSnapshotBeforeUpdate(resolvedPrevProps, current);
							instance.__reactInternalSnapshotBeforeUpdate = isViewTransitionEligible;
						} catch (error) {
							captureCommitPhaseError(fiber, fiber.return, error);
						}
					}
					break;
				case 3:
					if (0 !== (flags & 1024)) {
						if (current = fiber.stateNode.containerInfo, isViewTransitionEligible = current.nodeType, 9 === isViewTransitionEligible) clearContainerSparingly(current);
						else if (1 === isViewTransitionEligible) switch (current.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								clearContainerSparingly(current);
								break;
							default: current.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				case 30:
					isViewTransitionEligible && null !== current && (isViewTransitionEligible = getViewTransitionName(current.memoizedProps, current.stateNode), flags = fiber.memoizedProps, flags = getViewTransitionClassName(flags.default, flags.update), "none" !== flags && applyViewTransitionToHostInstances(current, isViewTransitionEligible, flags, current.memoizedState = [], !0));
					break;
				default: if (0 !== (flags & 1024)) throw Error(formatProdErrorMessage(163));
			}
			current = fiber.sibling;
			if (null !== current) {
				current.return = fiber.return;
				nextEffect = current;
				break;
			}
			nextEffect = fiber.return;
		}
	}
	function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitHookEffectListMount(5, finishedWork);
				break;
			case 1:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 4) if (finishedRoot = finishedWork.stateNode, null === current) try {
					finishedRoot.componentDidMount();
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				else {
					var prevProps = resolveClassComponentProps(finishedWork.type, current.memoizedProps);
					current = current.memoizedState;
					try {
						finishedRoot.componentDidUpdate(prevProps, current, finishedRoot.__reactInternalSnapshotBeforeUpdate);
					} catch (error$146) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error$146);
					}
				}
				flags & 64 && commitClassCallbacks(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				if (flags & 64 && (finishedRoot = finishedWork.updateQueue, null !== finishedRoot)) {
					current = null;
					if (null !== finishedWork.child) switch (finishedWork.child.tag) {
						case 27:
						case 5:
							current = finishedWork.child.stateNode;
							break;
						case 1: current = finishedWork.child.stateNode;
					}
					try {
						commitCallbacks(finishedRoot, current);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 27: null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
			case 26:
			case 5:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				null === current && flags & 4 && commitHostMount(finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 12:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				break;
			case 31:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
				break;
			case 13:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
				flags & 64 && (finishedRoot = finishedWork.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot && (finishedWork = retryDehydratedSuspenseBoundary.bind(null, finishedWork), registerSuspenseInstanceRetry(finishedRoot, finishedWork))));
				break;
			case 22:
				flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
				if (!flags) {
					var newOffscreenSubtreeWasHidden = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
					current = offscreenSubtreeIsHidden;
					prevProps = offscreenSubtreeWasHidden;
					offscreenSubtreeIsHidden = flags;
					(offscreenSubtreeWasHidden = newOffscreenSubtreeWasHidden) && !prevProps ? (flags = 2, 0 !== (finishedWork.subtreeFlags & 8772) && (flags |= 1), recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, flags)) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
					offscreenSubtreeIsHidden = current;
					offscreenSubtreeWasHidden = prevProps;
				}
				break;
			case 30:
				recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
				flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
				break;
			case 7: flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
			default: recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		}
	}
	function hideOrUnhideAllChildren(parentFiber, isHidden) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) hideOrUnhideAllChildrenOnFiber(parentFiber, isHidden), parentFiber = parentFiber.sibling;
	}
	function hideOrUnhideAllChildrenOnFiber(fiber, isHidden) {
		switch (fiber.tag) {
			case 5:
			case 26:
				try {
					var instance = fiber.stateNode;
					if (isHidden) {
						var style = instance.style;
						"function" === typeof style.setProperty ? style.setProperty("display", "none", "important") : style.display = "none";
					} else {
						var instance$jscomp$0 = fiber.stateNode, styleProp = fiber.memoizedProps.style, display = void 0 !== styleProp && null !== styleProp && styleProp.hasOwnProperty("display") ? styleProp.display : null;
						instance$jscomp$0.style.display = null == display || "boolean" === typeof display ? "" : ("" + display).trim();
					}
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				hideOrUnhideNearestPortals(fiber, isHidden);
				break;
			case 6:
				try {
					fiber.stateNode.nodeValue = isHidden ? "" : fiber.memoizedProps, viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				break;
			case 18:
				try {
					var instance$jscomp$1 = fiber.stateNode;
					isHidden ? hideOrUnhideDehydratedBoundary(instance$jscomp$1, !0) : hideOrUnhideDehydratedBoundary(fiber.stateNode, !1);
				} catch (error) {
					captureCommitPhaseError(fiber, fiber.return, error);
				}
				break;
			case 22:
			case 23:
				null === fiber.memoizedState && hideOrUnhideAllChildren(fiber, isHidden);
				break;
			default: hideOrUnhideAllChildren(fiber, isHidden);
		}
	}
	function hideOrUnhideNearestPortals(parentFiber, isHidden$jscomp$0) {
		if (parentFiber.subtreeFlags & 67108864) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			a: {
				var fiber = parentFiber, isHidden = isHidden$jscomp$0;
				switch (fiber.tag) {
					case 4:
						hideOrUnhideAllChildrenOnFiber(fiber, isHidden);
						break a;
					case 22:
						null === fiber.memoizedState && hideOrUnhideNearestPortals(fiber, isHidden);
						break a;
					default: hideOrUnhideNearestPortals(fiber, isHidden);
				}
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function detachFiberAfterEffects(fiber) {
		var alternate = fiber.alternate;
		null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
		fiber.child = null;
		fiber.deletions = null;
		fiber.sibling = null;
		5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
		fiber.stateNode = null;
		fiber.return = null;
		fiber.dependencies = null;
		fiber.memoizedProps = null;
		fiber.memoizedState = null;
		fiber.pendingProps = null;
		fiber.stateNode = null;
		fiber.updateQueue = null;
	}
	var hostParent = null;
	var hostParentIsContainer = !1;
	function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
		for (parent = parent.child; null !== parent;) commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, parent), parent = parent.sibling;
	}
	function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
		if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount) try {
			injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
		} catch (err) {}
		switch (deletedFiber.tag) {
			case 26:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				deletedFiber.memoizedState ? deletedFiber.memoizedState.count-- : deletedFiber.stateNode && !offscreenSubtreeWasHidden && (deletedFiber = deletedFiber.stateNode, deletedFiber.parentNode.removeChild(deletedFiber));
				break;
			case 27:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				commitFragmentInstanceDeletionEffects(deletedFiber);
				var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
				isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = !1);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				releaseSingletonInstance(deletedFiber.stateNode, deletedFiber.type, deletedFiber.memoizedProps);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 5: offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor), commitFragmentInstanceDeletionEffects(deletedFiber);
			case 6:
				6 === deletedFiber.tag && commitFragmentInstanceDeletionEffects(deletedFiber);
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = null;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				if (null !== hostParent) if (hostParentIsContainer) try {
					(9 === hostParent.nodeType ? hostParent.body : "HTML" === hostParent.nodeName ? hostParent.ownerDocument.body : hostParent).removeChild(deletedFiber.stateNode), viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				else try {
					hostParent.removeChild(deletedFiber.stateNode), viewTransitionMutationContext = !0;
				} catch (error) {
					captureCommitPhaseError(deletedFiber, nearestMountedAncestor, error);
				}
				break;
			case 18:
				null !== hostParent && (hostParentIsContainer ? (finishedRoot = hostParent, clearHydrationBoundary(9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, deletedFiber.stateNode), retryIfBlockedOn(finishedRoot)) : clearHydrationBoundary(hostParent, deletedFiber.stateNode));
				break;
			case 4:
				prevHostParent = hostParent;
				prevHostParentIsContainer = hostParentIsContainer;
				hostParent = deletedFiber.stateNode.containerInfo;
				hostParentIsContainer = !0;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				hostParent = prevHostParent;
				hostParentIsContainer = prevHostParentIsContainer;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
				offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 1:
				offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, prevHostParent));
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 21:
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 22:
				offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				offscreenSubtreeWasHidden = prevHostParent;
				break;
			case 30:
				safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			case 7:
				offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
				recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
				break;
			default: recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
		}
	}
	function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
			finishedRoot = finishedRoot.dehydrated;
			try {
				retryIfBlockedOn(finishedRoot);
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
		}
	}
	function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
		if (null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot)))) try {
			retryIfBlockedOn(finishedRoot);
		} catch (error) {
			captureCommitPhaseError(finishedWork, finishedWork.return, error);
		}
	}
	function getRetryCache(finishedWork) {
		switch (finishedWork.tag) {
			case 31:
			case 13:
			case 19:
				var retryCache = finishedWork.stateNode;
				null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
				return retryCache;
			case 22: return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
			default: throw Error(formatProdErrorMessage(435, finishedWork.tag));
		}
	}
	function attachSuspenseRetryListeners(finishedWork, wakeables) {
		var retryCache = getRetryCache(finishedWork);
		wakeables.forEach(function(wakeable) {
			if (!retryCache.has(wakeable)) {
				retryCache.add(wakeable);
				var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
				wakeable.then(retry, retry);
			}
		});
	}
	function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber, lanes) {
		var deletions = parentFiber.deletions;
		if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
			var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber, parent = returnFiber;
			a: for (; null !== parent;) {
				switch (parent.tag) {
					case 27:
						if (isSingletonScope(parent.type)) {
							hostParent = parent.stateNode;
							hostParentIsContainer = !1;
							break a;
						}
						break;
					case 5:
						hostParent = parent.stateNode;
						hostParentIsContainer = !1;
						break a;
					case 3:
					case 4:
						hostParent = parent.stateNode.containerInfo;
						hostParentIsContainer = !0;
						break a;
				}
				parent = parent.return;
			}
			if (null === hostParent) throw Error(formatProdErrorMessage(160));
			commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
			hostParent = null;
			hostParentIsContainer = !1;
			root = childToDelete.alternate;
			null !== root && (root.return = null);
			childToDelete.return = null;
		}
		if (parentFiber.subtreeFlags & 13886) for (parentFiber = parentFiber.child; null !== parentFiber;) commitMutationEffectsOnFiber(parentFiber, root$jscomp$0, lanes), parentFiber = parentFiber.sibling;
	}
	var currentHoistableRoot = null;
	function commitMutationEffectsOnFiber(finishedWork, root, lanes) {
		var current = finishedWork.alternate, flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				if (flags & 4 && (current = finishedWork.updateQueue, current = null !== current ? current.events : null, null !== current)) for (var ii = 0; ii < current.length; ii++) {
					var _eventPayloads$ii2 = current[ii];
					_eventPayloads$ii2.ref.impl = _eventPayloads$ii2.nextImpl;
				}
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
				break;
			case 1:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (root = finishedWork.callbacks, null !== root && (lanes = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === lanes ? root : lanes.concat(root))));
				break;
			case 26:
				ii = currentHoistableRoot;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (flags & 4) if (flags = null !== current ? current.memoizedState : null, lanes = finishedWork.memoizedState, null === current) if (null === lanes) if (null === finishedWork.stateNode) if (offscreenSubtreeIsHidden) finishedWork.stateNode = createHoistableInstance(finishedWork.type, finishedWork.memoizedProps, root.containerInfo, finishedWork);
				else {
					a: {
						root = finishedWork.type;
						lanes = finishedWork.memoizedProps;
						flags = ii.ownerDocument || ii;
						b: switch (root) {
							case "title":
								current = flags.getElementsByTagName("title")[0];
								if (!current || current[internalHoistableMarker] || current[internalInstanceKey] || "http://www.w3.org/2000/svg" === current.namespaceURI || current.hasAttribute("itemprop")) current = flags.createElement(root), flags.head.insertBefore(current, flags.querySelector("head > title"));
								setInitialProperties(current, root, lanes);
								current[internalInstanceKey] = finishedWork;
								markNodeAsHoistable(current);
								root = current;
								break a;
							case "link":
								if (ii = getHydratableHoistableCache("link", "href", flags).get(root + (lanes.href || ""))) {
									for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++) if (current = ii[_eventPayloads$ii2], current.getAttribute("href") === (null == lanes.href || "" === lanes.href ? null : lanes.href) && current.getAttribute("rel") === (null == lanes.rel ? null : lanes.rel) && current.getAttribute("title") === (null == lanes.title ? null : lanes.title) && current.getAttribute("crossorigin") === (null == lanes.crossOrigin ? null : lanes.crossOrigin)) {
										ii.splice(_eventPayloads$ii2, 1);
										break b;
									}
								}
								current = flags.createElement(root);
								setInitialProperties(current, root, lanes);
								flags.head.appendChild(current);
								break;
							case "meta":
								if (ii = getHydratableHoistableCache("meta", "content", flags).get(root + (lanes.content || ""))) {
									for (_eventPayloads$ii2 = 0; _eventPayloads$ii2 < ii.length; _eventPayloads$ii2++) if (current = ii[_eventPayloads$ii2], current.getAttribute("content") === (null == lanes.content ? null : "" + lanes.content) && current.getAttribute("name") === (null == lanes.name ? null : lanes.name) && current.getAttribute("property") === (null == lanes.property ? null : lanes.property) && current.getAttribute("http-equiv") === (null == lanes.httpEquiv ? null : lanes.httpEquiv) && current.getAttribute("charset") === (null == lanes.charSet ? null : lanes.charSet)) {
										ii.splice(_eventPayloads$ii2, 1);
										break b;
									}
								}
								current = flags.createElement(root);
								setInitialProperties(current, root, lanes);
								flags.head.appendChild(current);
								break;
							default: throw Error(formatProdErrorMessage(468, root));
						}
						current[internalInstanceKey] = finishedWork;
						markNodeAsHoistable(current);
						root = current;
					}
					finishedWork.stateNode = root;
				}
				else offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode);
				else finishedWork.stateNode = acquireResource(ii, lanes, finishedWork.memoizedProps);
				else flags !== lanes ? (null === flags ? (root = current.stateNode, null === root || offscreenSubtreeWasHidden || root.parentNode.removeChild(root)) : flags.count--, null === lanes ? offscreenSubtreeIsHidden || mountHoistable(ii, finishedWork.type, finishedWork.stateNode) : acquireResource(ii, lanes, finishedWork.memoizedProps)) : null === lanes && null !== finishedWork.stateNode && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 27:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				null !== current && flags & 4 && commitHostUpdate(finishedWork, finishedWork.memoizedProps, current.memoizedProps);
				break;
			case 5:
				ii = offscreenDirectParentIsHidden;
				offscreenDirectParentIsHidden = !1;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				offscreenDirectParentIsHidden = ii;
				commitReconciliationEffects(finishedWork);
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				if (finishedWork.flags & 32) {
					root = finishedWork.stateNode;
					try {
						setTextContent(root, ""), viewTransitionMutationContext = !0;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				flags & 4 && null != finishedWork.stateNode && (root = finishedWork.memoizedProps, commitHostUpdate(finishedWork, root, null !== current ? current.memoizedProps : root));
				flags & 1024 && (needsFormReset = !0);
				break;
			case 6:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				if (flags & 4) {
					if (null === finishedWork.stateNode) throw Error(formatProdErrorMessage(162));
					root = finishedWork.memoizedProps;
					lanes = finishedWork.stateNode;
					try {
						lanes.nodeValue = root, viewTransitionMutationContext = !0;
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				}
				break;
			case 3:
				viewTransitionMutationContext = !1;
				tagCaches = null;
				ii = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(root.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				currentHoistableRoot = ii;
				commitReconciliationEffects(finishedWork);
				if (flags & 4 && null !== current && current.memoizedState.isDehydrated) try {
					retryIfBlockedOn(root.containerInfo);
				} catch (error) {
					captureCommitPhaseError(finishedWork, finishedWork.return, error);
				}
				needsFormReset && (needsFormReset = !1, recursivelyResetForms(finishedWork));
				viewTransitionMutationContext = !1;
				break;
			case 4:
				flags = offscreenDirectParentIsHidden;
				offscreenDirectParentIsHidden = offscreenSubtreeIsHidden;
				current = pushMutationContext();
				ii = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(finishedWork.stateNode.containerInfo);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				currentHoistableRoot = ii;
				viewTransitionMutationContext && inUpdateViewTransition && (rootViewTransitionAffected = !0);
				viewTransitionMutationContext = current;
				offscreenDirectParentIsHidden = flags;
				break;
			case 12:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				break;
			case 31:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 13:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 22:
				ii = null !== finishedWork.memoizedState;
				_eventPayloads$ii2 = null !== current && null !== current.memoizedState;
				var prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden, prevOffscreenDirectParentIsHidden$166 = offscreenDirectParentIsHidden;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || ii;
				offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166 || ii;
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || _eventPayloads$ii2;
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
				offscreenDirectParentIsHidden = prevOffscreenDirectParentIsHidden$166;
				offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
				commitReconciliationEffects(finishedWork);
				flags & 8192 && (root = finishedWork.stateNode, root._visibility = ii ? root._visibility & -2 : root._visibility | 1, !ii || null === current || _eventPayloads$ii2 || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || (root = _eventPayloads$ii2 || offscreenSubtreeWasHidden, lanes = offscreenSubtreeIsHidden, current = offscreenSubtreeWasHidden, offscreenSubtreeIsHidden = ii || offscreenSubtreeIsHidden, offscreenSubtreeWasHidden = root, recursivelyTraverseDisappearLayoutEffects(finishedWork, 2), offscreenSubtreeIsHidden = lanes, offscreenSubtreeWasHidden = current), !ii && offscreenDirectParentIsHidden || hideOrUnhideAllChildren(finishedWork, ii));
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (lanes = root.retryQueue, null !== lanes && (root.retryQueue = null, attachSuspenseRetryListeners(finishedWork, lanes))));
				break;
			case 19:
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				flags & 4 && (root = finishedWork.updateQueue, null !== root && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, root)));
				break;
			case 30:
				flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
				flags = pushMutationContext();
				ii = inUpdateViewTransition;
				_eventPayloads$ii2 = (lanes & 335544064) === lanes;
				prevOffscreenSubtreeIsHidden = finishedWork.memoizedProps;
				inUpdateViewTransition = _eventPayloads$ii2 && "none" !== getViewTransitionClassName(prevOffscreenSubtreeIsHidden.default, prevOffscreenSubtreeIsHidden.update);
				recursivelyTraverseMutationEffects(root, finishedWork, lanes);
				commitReconciliationEffects(finishedWork);
				_eventPayloads$ii2 && null !== current && viewTransitionMutationContext && (finishedWork.flags |= 4);
				inUpdateViewTransition = ii;
				viewTransitionMutationContext = flags;
				break;
			case 21: break;
			case 7: flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return)), current && null !== current.stateNode && (current.stateNode._fragmentFiber = finishedWork);
			default: recursivelyTraverseMutationEffects(root, finishedWork, lanes), commitReconciliationEffects(finishedWork);
		}
	}
	function commitReconciliationEffects(finishedWork) {
		var flags = finishedWork.flags;
		if (flags & 2) {
			try {
				for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber;) {
					if (isHostParent(parentFiber)) {
						hostParentFiber = parentFiber;
						break;
					}
					parentFiber = parentFiber.return;
				}
				parentFiber = null;
				for (var parent = finishedWork.return; null !== parent;) {
					if (isFragmentInstanceParent(parent)) {
						var fragmentInstance = parent.stateNode;
						null === parentFiber ? parentFiber = [fragmentInstance] : parentFiber.push(fragmentInstance);
					}
					if (isFragmentInstanceHostBoundary(parent)) break;
					parent = parent.return;
				}
				var JSCompiler_inline_result = parentFiber;
				if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
				switch (hostParentFiber.tag) {
					case 27:
						var parent$jscomp$0 = hostParentFiber.stateNode;
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$jscomp$0, JSCompiler_inline_result);
						break;
					case 5:
						var parent$149 = hostParentFiber.stateNode;
						hostParentFiber.flags & 32 && (setTextContent(parent$149, ""), hostParentFiber.flags &= -33);
						insertOrAppendPlacementNode(finishedWork, getHostSibling(finishedWork), parent$149, JSCompiler_inline_result);
						break;
					case 3:
					case 4:
						var parent$151 = hostParentFiber.stateNode.containerInfo;
						insertOrAppendPlacementNodeIntoContainer(finishedWork, getHostSibling(finishedWork), parent$151, JSCompiler_inline_result);
						break;
					default: throw Error(formatProdErrorMessage(161));
				}
			} catch (error) {
				captureCommitPhaseError(finishedWork, finishedWork.return, error);
			}
			finishedWork.flags &= -3;
		}
		flags & 4096 && (finishedWork.flags &= -4097);
	}
	function recursivelyResetForms(parentFiber) {
		if (parentFiber.subtreeFlags & 1024) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var fiber = parentFiber;
			recursivelyResetForms(fiber);
			5 === fiber.tag && fiber.flags & 1024 && (fiber = fiber.stateNode, _enabled = !0, fiber.reset(), _enabled = !1);
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAfterMutationEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 9270) for (parentFiber = parentFiber.child; null !== parentFiber;) commitAfterMutationEffectsOnFiber(parentFiber, root), parentFiber = parentFiber.sibling;
		else measureNestedViewTransitions(parentFiber, !1);
	}
	function commitAfterMutationEffectsOnFiber(finishedWork, root) {
		var current = finishedWork.alternate;
		if (null === current) commitEnterViewTransitions(finishedWork, !1);
		else switch (finishedWork.tag) {
			case 3:
				rootViewTransitionNameCanceled = viewTransitionContextChanged = !1;
				pushViewTransitionCancelableScope();
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				if (!viewTransitionContextChanged && !rootViewTransitionAffected) {
					finishedWork = viewTransitionCancelableChildren;
					if (null !== finishedWork) for (var i = 0; i < finishedWork.length; i += 3) {
						current = finishedWork[i];
						var oldName = finishedWork[i + 1];
						restoreViewTransitionName(current, finishedWork[i + 2]);
						current = current.ownerDocument.documentElement;
						null !== current && current.animate({
							opacity: [0, 0],
							pointerEvents: ["none", "none"]
						}, {
							duration: 0,
							fill: "forwards",
							pseudoElement: "::view-transition-group(" + oldName + ")"
						});
					}
					finishedWork = root.containerInfo;
					finishedWork = 9 === finishedWork.nodeType ? finishedWork.documentElement : finishedWork.ownerDocument.documentElement;
					null !== finishedWork && "" === finishedWork.style.viewTransitionName && (finishedWork.style.viewTransitionName = "none", finishedWork.animate({
						opacity: [0, 0],
						pointerEvents: ["none", "none"]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition-group(root)"
					}), finishedWork.animate({
						width: [0, 0],
						height: [0, 0]
					}, {
						duration: 0,
						fill: "forwards",
						pseudoElement: "::view-transition"
					}));
					rootViewTransitionNameCanceled = !0;
				}
				viewTransitionCancelableChildren = null;
				break;
			case 5:
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				break;
			case 4:
				i = viewTransitionContextChanged;
				viewTransitionContextChanged = !1;
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				viewTransitionContextChanged && (rootViewTransitionAffected = !0);
				viewTransitionContextChanged = i;
				break;
			case 22:
				null === finishedWork.memoizedState && (null !== current.memoizedState ? commitEnterViewTransitions(finishedWork, !1) : recursivelyTraverseAfterMutationEffects(root, finishedWork));
				break;
			case 30:
				i = viewTransitionContextChanged;
				oldName = pushViewTransitionCancelableScope();
				viewTransitionContextChanged = !1;
				recursivelyTraverseAfterMutationEffects(root, finishedWork);
				viewTransitionContextChanged && (finishedWork.flags |= 4);
				var props = finishedWork.memoizedProps, state = finishedWork.stateNode;
				root = getViewTransitionName(props, state);
				state = getViewTransitionName(current.memoizedProps, state);
				var className = getViewTransitionClassName(props.default, props.update);
				"none" === className ? root = !1 : (props = current.memoizedState, current.memoizedState = null, current = finishedWork.child, viewTransitionHostInstanceIdx = 0, root = measureViewTransitionHostInstancesRecursive(finishedWork, current, root, state, className, props, !0), viewTransitionHostInstanceIdx !== (null === props ? 0 : props.length) && (finishedWork.flags |= 32));
				0 !== (finishedWork.flags & 4) && root ? (scheduleViewTransitionEvent(finishedWork, finishedWork.memoizedProps.onUpdate), viewTransitionCancelableChildren = oldName) : null !== oldName && (oldName.push.apply(oldName, viewTransitionCancelableChildren), viewTransitionCancelableChildren = oldName);
				viewTransitionContextChanged = 0 !== (finishedWork.flags & 32) ? !0 : i;
				break;
			default: recursivelyTraverseAfterMutationEffects(root, finishedWork);
		}
	}
	function recursivelyTraverseLayoutEffects(root, parentFiber) {
		if (parentFiber.subtreeFlags & 8772) for (parentFiber = parentFiber.child; null !== parentFiber;) commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
	}
	function recursivelyTraverseDisappearLayoutEffects(parentFiber, layoutEffectTraversalFlags$jscomp$0) {
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedWork = parentFiber, layoutEffectTraversalFlags = layoutEffectTraversalFlags$jscomp$0;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 1:
					safelyDetachRef(finishedWork, finishedWork.return);
					var instance = finishedWork.stateNode;
					"function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(finishedWork, finishedWork.return, instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 27: 0 !== (layoutEffectTraversalFlags & 2) && releaseSingletonInstance(finishedWork.stateNode, finishedWork.type, finishedWork.memoizedProps);
				case 5:
					safelyDetachRef(finishedWork, finishedWork.return);
					5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceDeletionEffects(finishedWork);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 6:
					commitFragmentInstanceDeletionEffects(finishedWork);
					break;
				case 26:
					safelyDetachRef(finishedWork, finishedWork.return);
					instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState || null === instance || offscreenSubtreeWasHidden || instance.parentNode.removeChild(instance);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 30:
					safelyDetachRef(finishedWork, finishedWork.return);
					recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
					break;
				case 7: safelyDetachRef(finishedWork, finishedWork.return);
				default: recursivelyTraverseDisappearLayoutEffects(finishedWork, layoutEffectTraversalFlags);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, layoutEffectTraversalFlags) {
		layoutEffectTraversalFlags = 0 !== (parentFiber.subtreeFlags & 8772) ? layoutEffectTraversalFlags : layoutEffectTraversalFlags & -2;
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags, includeWorkInProgressEffects = 0 !== (layoutEffectTraversalFlags & 1);
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					commitHookEffectListMount(4, finishedWork);
					break;
				case 1:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					current = finishedWork;
					finishedRoot = current.stateNode;
					if ("function" === typeof finishedRoot.componentDidMount) try {
						finishedRoot.componentDidMount();
					} catch (error) {
						captureCommitPhaseError(current, current.return, error);
					}
					current = finishedWork;
					finishedRoot = current.updateQueue;
					if (null !== finishedRoot) {
						var instance = current.stateNode;
						try {
							var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
							if (null !== hiddenCallbacks) for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++) callCallback(hiddenCallbacks[finishedRoot], instance);
						} catch (error) {
							captureCommitPhaseError(current, current.return, error);
						}
					}
					includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 27: 0 !== (layoutEffectTraversalFlags & 2) && commitHostSingletonAcquisition(finishedWork);
				case 5:
					5 !== finishedWork.tag && 27 !== finishedWork.tag || commitFragmentInstanceInsertionEffects(finishedWork);
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 6:
					commitFragmentInstanceInsertionEffects(finishedWork);
					break;
				case 26:
					instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState || null === instance || offscreenSubtreeIsHidden || mountHoistable(getHoistableRoot(instance.ownerDocument), finishedWork.type, instance);
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 12:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					break;
				case 31:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 13:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
					break;
				case 22:
					null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 30:
					recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
					safelyAttachRef(finishedWork, finishedWork.return);
					break;
				case 7: safelyAttachRef(finishedWork, finishedWork.return);
				default: recursivelyTraverseReappearLayoutEffects(finishedRoot, finishedWork, layoutEffectTraversalFlags);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitOffscreenPassiveMountEffects(current, finishedWork) {
		var previousCache = null;
		null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
		current = null;
		null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
		current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
	}
	function commitCachePassiveMountEffect(current, finishedWork) {
		current = null;
		null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
		finishedWork = finishedWork.memoizedState.cache;
		finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
	}
	function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
		var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
		if (parentFiber.subtreeFlags & (isViewTransitionEligible ? 10262 : 10256)) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveMountOnFiber(root, parentFiber, committedLanes, committedTransitions), parentFiber = parentFiber.sibling;
		else isViewTransitionEligible && restoreNestedViewTransitions(parentFiber);
	}
	function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
		var isViewTransitionEligible = (committedLanes & 335544064) === committedLanes;
		isViewTransitionEligible && null === finishedWork.alternate && null !== finishedWork.return && null !== finishedWork.return.alternate && restoreEnterOrExitViewTransitions(finishedWork);
		var flags = finishedWork.flags;
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitHookEffectListMount(9, finishedWork);
				break;
			case 1:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 3:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				isViewTransitionEligible && rootViewTransitionNameCanceled && (finishedRoot = finishedRoot.containerInfo, finishedRoot = 9 === finishedRoot.nodeType ? finishedRoot.body : "HTML" === finishedRoot.nodeName ? finishedRoot.ownerDocument.body : finishedRoot, "root" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""), finishedRoot = finishedRoot.ownerDocument.documentElement, null !== finishedRoot && "none" === finishedRoot.style.viewTransitionName && (finishedRoot.style.viewTransitionName = ""));
				flags & 2048 && (flags = null, null !== finishedWork.alternate && (flags = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== flags && (finishedWork.refCount++, null != flags && releaseCache(flags)));
				break;
			case 12:
				if (flags & 2048) {
					recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
					flags = finishedWork.stateNode;
					try {
						var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
						"function" === typeof onPostCommit && onPostCommit(id, null === finishedWork.alternate ? "mount" : "update", flags.passiveEffectDuration, -0);
					} catch (error) {
						captureCommitPhaseError(finishedWork, finishedWork.return, error);
					}
				} else recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 31:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 13:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			case 23: break;
			case 22:
				_finishedWork$memoize2 = finishedWork.stateNode;
				id = finishedWork.alternate;
				null !== finishedWork.memoizedState ? (isViewTransitionEligible && null !== id && null === id.memoizedState && restoreEnterOrExitViewTransitions(id), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork)) : (isViewTransitionEligible && null !== id && null !== id.memoizedState && restoreEnterOrExitViewTransitions(finishedWork), _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, 0 !== (finishedWork.subtreeFlags & 10256) || !1)));
				flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
				break;
			case 24:
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
				break;
			case 30:
				isViewTransitionEligible && (flags = finishedWork.alternate, null !== flags && (restoreViewTransitionOnHostInstances(flags.child, !0), restoreViewTransitionOnHostInstances(finishedWork.child, !0)));
				recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
				break;
			default: recursivelyTraversePassiveMountEffects(finishedRoot, finishedWork, committedLanes, committedTransitions);
		}
	}
	function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
		includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || !1);
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 0:
				case 11:
				case 15:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					commitHookEffectListMount(8, finishedWork);
					break;
				case 23: break;
				case 22:
					var instance = finishedWork.stateNode;
					null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects) : recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects));
					includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
					includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseReconnectPassiveEffects(finishedRoot, finishedWork, committedLanes, committedTransitions, includeWorkInProgressEffects);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) {
			var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
			switch (finishedWork.tag) {
				case 22:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitOffscreenPassiveMountEffects(finishedWork.alternate, finishedWork);
					break;
				case 24:
					recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
					flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
					break;
				default: recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	var suspenseyCommitFlag = 8192;
	function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
		if (parentFiber.subtreeFlags & suspenseyCommitFlag) for (parentFiber = parentFiber.child; null !== parentFiber;) accumulateSuspenseyCommitOnFiber(parentFiber, committedLanes, suspendedState), parentFiber = parentFiber.sibling;
	}
	function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
		switch (fiber.tag) {
			case 26:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && (null !== fiber.memoizedState ? suspendResource(suspendedState, currentHoistableRoot, fiber.memoizedState, fiber.memoizedProps) : (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber)));
				break;
			case 5:
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				fiber.flags & suspenseyCommitFlag && (fiber = fiber.stateNode, (committedLanes & 335544128) === committedLanes && suspendInstance(suspendedState, fiber));
				break;
			case 3:
			case 4:
				var previousHoistableRoot = currentHoistableRoot;
				currentHoistableRoot = getHoistableRoot(fiber.stateNode.containerInfo);
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				currentHoistableRoot = previousHoistableRoot;
				break;
			case 22:
				null === fiber.memoizedState && (previousHoistableRoot = fiber.alternate, null !== previousHoistableRoot && null !== previousHoistableRoot.memoizedState ? (previousHoistableRoot = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState), suspenseyCommitFlag = previousHoistableRoot) : recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState));
				break;
			case 30:
				if (0 !== (fiber.flags & suspenseyCommitFlag) && (previousHoistableRoot = fiber.memoizedProps.name, null != previousHoistableRoot && "auto" !== previousHoistableRoot)) {
					var state = fiber.stateNode;
					state.paired = null;
					null === appearingViewTransitions && (appearingViewTransitions = /* @__PURE__ */ new Map());
					appearingViewTransitions.set(previousHoistableRoot, state);
				}
				recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
				break;
			default: recursivelyAccumulateSuspenseyCommit(fiber, committedLanes, suspendedState);
		}
	}
	function detachAlternateSiblings(parentFiber) {
		var previousFiber = parentFiber.alternate;
		if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
			previousFiber.child = null;
			do
				previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
			while (null !== parentFiber);
		}
	}
	function recursivelyTraversePassiveUnmountEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		if (parentFiber.subtreeFlags & 10256) for (parentFiber = parentFiber.child; null !== parentFiber;) commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
	}
	function commitPassiveUnmountOnFiber(finishedWork) {
		switch (finishedWork.tag) {
			case 0:
			case 11:
			case 15:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
				break;
			case 3:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 12:
				recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			case 22:
				var instance = finishedWork.stateNode;
				null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
				break;
			default: recursivelyTraversePassiveUnmountEffects(finishedWork);
		}
	}
	function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
		var deletions = parentFiber.deletions;
		if (0 !== (parentFiber.flags & 16)) {
			if (null !== deletions) for (var i = 0; i < deletions.length; i++) {
				var childToDelete = deletions[i];
				nextEffect = childToDelete;
				commitPassiveUnmountEffectsInsideOfDeletedTree_begin(childToDelete, parentFiber);
			}
			detachAlternateSiblings(parentFiber);
		}
		for (parentFiber = parentFiber.child; null !== parentFiber;) {
			deletions = parentFiber;
			switch (deletions.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, deletions, deletions.return);
					recursivelyTraverseDisconnectPassiveEffects(deletions);
					break;
				case 22:
					i = deletions.stateNode;
					i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
					break;
				default: recursivelyTraverseDisconnectPassiveEffects(deletions);
			}
			parentFiber = parentFiber.sibling;
		}
	}
	function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
		for (; null !== nextEffect;) {
			var fiber = nextEffect;
			switch (fiber.tag) {
				case 0:
				case 11:
				case 15:
					commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
					break;
				case 23:
				case 22:
					if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
						var cache = fiber.memoizedState.cachePool.pool;
						null != cache && cache.refCount++;
					}
					break;
				case 24: releaseCache(fiber.memoizedState.cache);
			}
			cache = fiber.child;
			if (null !== cache) cache.return = fiber, nextEffect = cache;
			else a: for (fiber = deletedSubtreeRoot; null !== nextEffect;) {
				cache = nextEffect;
				var sibling = cache.sibling, returnFiber = cache.return;
				detachFiberAfterEffects(cache);
				if (cache === fiber) {
					nextEffect = null;
					break a;
				}
				if (null !== sibling) {
					sibling.return = returnFiber;
					nextEffect = sibling;
					break a;
				}
				nextEffect = returnFiber;
			}
		}
	}
	var DefaultAsyncDispatcher = {
		getCacheForType: function(resourceType) {
			var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
			void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
			return cacheForType;
		},
		cacheSignal: function() {
			return readContext(CacheContext).controller.signal;
		}
	};
	var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map;
	var executionContext = 0;
	var workInProgressRoot = null;
	var workInProgress = null;
	var workInProgressRootRenderLanes = 0;
	var workInProgressSuspendedReason = 0;
	var workInProgressThrownValue = null;
	var workInProgressRootDidSkipSuspendedSiblings = !1;
	var workInProgressRootIsPrerendering = !1;
	var workInProgressRootDidAttachPingListener = !1;
	var entangledRenderLanes = 0;
	var workInProgressRootExitStatus = 0;
	var workInProgressRootSkippedLanes = 0;
	var workInProgressRootInterleavedUpdatedLanes = 0;
	var workInProgressRootPingedLanes = 0;
	var workInProgressDeferredLane = 0;
	var workInProgressSuspendedRetryLanes = 0;
	var workInProgressRootConcurrentErrors = null;
	var workInProgressRootRecoverableErrors = null;
	var workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
	var globalMostRecentFallbackTime = 0;
	var globalMostRecentTransitionTime = 0;
	var workInProgressRootRenderTargetTime = Infinity;
	var workInProgressTransitions = null;
	var legacyErrorBoundariesThatAlreadyFailed = null;
	var pendingEffectsStatus = 0;
	var pendingEffectsRoot = null;
	var pendingFinishedWork = null;
	var pendingEffectsLanes = 0;
	var pendingEffectsRemainingLanes = 0;
	var pendingPassiveTransitions = null;
	var pendingRecoverableErrors = null;
	var pendingViewTransition = null;
	var pendingViewTransitionEvents = null;
	var pendingTransitionTypes = null;
	var nestedUpdateCount = 0;
	var rootWithNestedUpdates = null;
	function requestUpdateLane() {
		return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
	}
	function requestDeferredLane() {
		if (0 === workInProgressDeferredLane) if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
			var lane = nextTransitionDeferredLane;
			nextTransitionDeferredLane <<= 1;
			0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
			workInProgressDeferredLane = lane;
		} else workInProgressDeferredLane = 536870912;
		lane = suspenseHandlerStackCursor.current;
		null !== lane && (lane.flags |= 32);
		return workInProgressDeferredLane;
	}
	function scheduleViewTransitionEvent(fiber, callback) {
		if (null != callback) {
			var state = fiber.stateNode, instance = state.ref;
			null === instance && (instance = state.ref = createViewTransitionInstance(getViewTransitionName(fiber.memoizedProps, state)));
			null === pendingViewTransitionEvents && (pendingViewTransitionEvents = []);
			pendingViewTransitionEvents.push(callback.bind(null, instance));
		}
	}
	function scheduleUpdateOnFiber(root, fiber, lane) {
		if (root === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) prepareFreshStack(root, 0), markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
		markRootUpdated$1(root, lane);
		if (0 === (executionContext & 2) || root !== workInProgressRoot) root === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(root, workInProgressRootRenderLanes, workInProgressDeferredLane, !1)), ensureRootIsScheduled(root);
	}
	function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, !0), renderWasConcurrent = shouldTimeSlice;
		do {
			if (0 === exitStatus) {
				workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, !1);
				break;
			} else {
				forceSync = root$jscomp$0.current.alternate;
				if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
					exitStatus = renderRootSync(root$jscomp$0, lanes, !1);
					renderWasConcurrent = !1;
					continue;
				}
				if (2 === exitStatus) {
					renderWasConcurrent = lanes;
					if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent) var JSCompiler_inline_result = 0;
					else JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
					if (0 !== JSCompiler_inline_result) {
						lanes = JSCompiler_inline_result;
						a: {
							var root = root$jscomp$0;
							exitStatus = workInProgressRootConcurrentErrors;
							var wasRootDehydrated = root.current.memoizedState.isDehydrated;
							wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
							JSCompiler_inline_result = renderRootSync(root, JSCompiler_inline_result, !1);
							if (2 !== JSCompiler_inline_result && 6 !== JSCompiler_inline_result) {
								if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
									root.errorRecoveryDisabledLanes |= renderWasConcurrent;
									workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
									exitStatus = 4;
									break a;
								}
								renderWasConcurrent = workInProgressRootRecoverableErrors;
								workInProgressRootRecoverableErrors = exitStatus;
								null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(workInProgressRootRecoverableErrors, renderWasConcurrent));
							}
							exitStatus = JSCompiler_inline_result;
						}
						renderWasConcurrent = !1;
						if (2 !== exitStatus) continue;
					}
				}
				if (1 === exitStatus) {
					prepareFreshStack(root$jscomp$0, 0);
					markRootSuspended(root$jscomp$0, lanes, 0, !0);
					break;
				}
				a: {
					shouldTimeSlice = root$jscomp$0;
					renderWasConcurrent = exitStatus;
					switch (renderWasConcurrent) {
						case 0:
						case 1: throw Error(formatProdErrorMessage(345));
						case 4: if ((lanes & 4194048) !== lanes && (lanes & 62914560) !== lanes) break;
						case 6:
							markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
							break a;
						case 2:
							workInProgressRootRecoverableErrors = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(formatProdErrorMessage(329));
					}
					if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
						markRootSuspended(shouldTimeSlice, lanes, workInProgressDeferredLane, !workInProgressRootDidSkipSuspendedSiblings);
						if (0 !== getNextLanes(shouldTimeSlice, 0, !0)) break a;
						pendingEffectsLanes = lanes;
						shouldTimeSlice.timeoutHandle = scheduleTimeout(completeRootWhenReady.bind(null, shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, "Throttled", -0, 0), exitStatus);
						break a;
					}
					completeRootWhenReady(shouldTimeSlice, forceSync, workInProgressRootRecoverableErrors, workInProgressTransitions, workInProgressRootDidIncludeRecursiveRenderUpdate, lanes, workInProgressDeferredLane, workInProgressRootInterleavedUpdatedLanes, workInProgressSuspendedRetryLanes, workInProgressRootDidSkipSuspendedSiblings, renderWasConcurrent, null, -0, 0);
				}
			}
			break;
		} while (1);
		ensureRootIsScheduled(root$jscomp$0);
	}
	function completeRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
		root.timeoutHandle = -1;
		var subtreeFlags = finishedWork.subtreeFlags, isViewTransitionEligible = (lanes & 335544064) === lanes;
		suspendedCommitReason = null;
		if (isViewTransitionEligible || subtreeFlags & 8192 || 16785408 === (subtreeFlags & 16785408)) {
			if (suspendedCommitReason = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: noop$1
			}, appearingViewTransitions = null, accumulateSuspenseyCommitOnFiber(finishedWork, lanes, suspendedCommitReason), isViewTransitionEligible && (subtreeFlags = suspendedCommitReason, isViewTransitionEligible = root.containerInfo, isViewTransitionEligible = (9 === isViewTransitionEligible.nodeType ? isViewTransitionEligible : isViewTransitionEligible.ownerDocument).__reactViewTransition, null != isViewTransitionEligible && (subtreeFlags.count++, subtreeFlags.waitingForViewTransition = !0, subtreeFlags = onUnsuspend.bind(subtreeFlags), isViewTransitionEligible.finished.then(subtreeFlags, subtreeFlags))), subtreeFlags = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0, subtreeFlags = waitForCommitToBeReady(suspendedCommitReason, subtreeFlags), null !== subtreeFlags) {
				pendingEffectsLanes = lanes;
				root.cancelPendingCommit = subtreeFlags(completeRoot.bind(null, root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, null, completedRenderStartTime, completedRenderEndTime));
				markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
				return;
			}
		}
		completeRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason);
	}
	function isRenderConsistentWithExternalStores(finishedWork) {
		for (var node = finishedWork;;) {
			var tag = node.tag;
			if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag))) for (var i = 0; i < tag.length; i++) {
				var check = tag[i], getSnapshot = check.getSnapshot;
				check = check.value;
				try {
					if (!objectIs(getSnapshot(), check)) return !1;
				} catch (error) {
					return !1;
				}
			}
			tag = node.child;
			if (node.subtreeFlags & 16384 && null !== tag) tag.return = node, node = tag;
			else {
				if (node === finishedWork) break;
				for (; null === node.sibling;) {
					if (null === node.return || node.return === finishedWork) return !0;
					node = node.return;
				}
				node.sibling.return = node.return;
				node = node.sibling;
			}
		}
		return !0;
	}
	function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
		suspendedLanes = getEntangledLanes(root, suspendedLanes);
		suspendedLanes &= ~workInProgressRootPingedLanes;
		suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
		root.suspendedLanes |= suspendedLanes;
		root.pingedLanes &= ~suspendedLanes;
		didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
		didAttemptEntireTree = root.expirationTimes;
		for (var lanes = suspendedLanes; 0 < lanes;) {
			var index$6 = 31 - clz32(lanes), lane = 1 << index$6;
			didAttemptEntireTree[index$6] = -1;
			lanes &= ~lane;
		}
		0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
	}
	function flushSyncWork$1() {
		return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0, !1), !1) : !0;
	}
	function resetWorkInProgressStack() {
		if (null !== workInProgress) {
			if (0 === workInProgressSuspendedReason) var interruptedWork = workInProgress.return;
			else interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
			for (; null !== interruptedWork;) unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
			workInProgress = null;
		}
	}
	function prepareFreshStack(root, lanes) {
		var timeoutHandle = root.timeoutHandle;
		-1 !== timeoutHandle && (root.timeoutHandle = -1, cancelTimeout(timeoutHandle));
		timeoutHandle = root.cancelPendingCommit;
		null !== timeoutHandle && (root.cancelPendingCommit = null, timeoutHandle());
		pendingEffectsLanes = 0;
		resetWorkInProgressStack();
		workInProgressRoot = root;
		workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
		workInProgressRootRenderLanes = lanes;
		workInProgressSuspendedReason = 0;
		workInProgressThrownValue = null;
		workInProgressRootDidSkipSuspendedSiblings = !1;
		workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		workInProgressRootDidAttachPingListener = !1;
		workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
		workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
		workInProgressRootDidIncludeRecursiveRenderUpdate = !1;
		entangledRenderLanes = getEntangledLanes(root, lanes);
		finishQueueingConcurrentUpdates();
		return timeoutHandle;
	}
	function handleThrow(root, thrownValue) {
		currentlyRenderingFiber = null;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
		workInProgressThrownValue = thrownValue;
		null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current)));
	}
	function shouldRemainOnPreviousScreen() {
		var handler = suspenseHandlerStackCursor.current;
		return null === handler ? !0 : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? !0 : !1 : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : !1;
	}
	function pushDispatcher() {
		var prevDispatcher = ReactSharedInternals.H;
		ReactSharedInternals.H = ContextOnlyDispatcher;
		return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
	}
	function pushAsyncDispatcher() {
		var prevAsyncDispatcher = ReactSharedInternals.A;
		ReactSharedInternals.A = DefaultAsyncDispatcher;
		return prevAsyncDispatcher;
	}
	function renderDidSuspendDelayIfPossible() {
		workInProgressRootExitStatus = 4;
		workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = !0);
		0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(workInProgressRoot, workInProgressRootRenderLanes, workInProgressDeferredLane, !1);
	}
	function renderRootSync(root, lanes, shouldYieldForPrerendering) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) workInProgressTransitions = null, prepareFreshStack(root, lanes);
		lanes = !1;
		var exitStatus = workInProgressRootExitStatus;
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
					switch (workInProgressSuspendedReason) {
						case 8:
							resetWorkInProgressStack();
							exitStatus = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							null === suspenseHandlerStackCursor.current && (lanes = !0);
							var reason = workInProgressSuspendedReason;
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
							if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
								exitStatus = 0;
								break a;
							}
							break;
						default: reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
					}
				}
				workLoopSync();
				exitStatus = workInProgressRootExitStatus;
				break;
			} catch (thrownValue$184) {
				handleThrow(root, thrownValue$184);
			}
		while (1);
		lanes && root.shellSuspendCounter++;
		lastContextDependency = currentlyRenderingFiber$1 = null;
		executionContext = prevExecutionContext;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
		return exitStatus;
	}
	function workLoopSync() {
		for (; null !== workInProgress;) performUnitOfWork(workInProgress);
	}
	function renderRootConcurrent(root, lanes) {
		var prevExecutionContext = executionContext;
		executionContext |= 2;
		var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		a: do
			try {
				if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
					lanes = workInProgress;
					var thrownValue = workInProgressThrownValue;
					b: switch (workInProgressSuspendedReason) {
						case 1:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
							break;
						case 2:
						case 9:
							if (isThenableResolved(thrownValue)) {
								workInProgressSuspendedReason = 0;
								workInProgressThrownValue = null;
								replaySuspendedUnitOfWork(lanes);
								break;
							}
							lanes = function() {
								2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
								ensureRootIsScheduled(root);
							};
							thrownValue.then(lanes, lanes);
							break a;
						case 3:
							workInProgressSuspendedReason = 7;
							break a;
						case 4:
							workInProgressSuspendedReason = 5;
							break a;
						case 7:
							isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
							break;
						case 5:
							var resource = null;
							switch (workInProgress.tag) {
								case 26: resource = workInProgress.memoizedState;
								case 5:
								case 27:
									var hostFiber = workInProgress;
									if (resource ? preloadResource(resource) : hostFiber.stateNode.complete) {
										workInProgressSuspendedReason = 0;
										workInProgressThrownValue = null;
										var sibling = hostFiber.sibling;
										if (null !== sibling) workInProgress = sibling;
										else {
											var returnFiber = hostFiber.return;
											null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
										}
										break b;
									}
							}
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
							break;
						case 6:
							workInProgressSuspendedReason = 0;
							workInProgressThrownValue = null;
							throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
							break;
						case 8:
							resetWorkInProgressStack();
							workInProgressRootExitStatus = 6;
							break a;
						default: throw Error(formatProdErrorMessage(462));
					}
				}
				workLoopConcurrentByScheduler();
				break;
			} catch (thrownValue$186) {
				handleThrow(root, thrownValue$186);
			}
		while (1);
		lastContextDependency = currentlyRenderingFiber$1 = null;
		ReactSharedInternals.H = prevDispatcher;
		ReactSharedInternals.A = prevAsyncDispatcher;
		executionContext = prevExecutionContext;
		if (null !== workInProgress) return 0;
		workInProgressRoot = null;
		workInProgressRootRenderLanes = 0;
		finishQueueingConcurrentUpdates();
		return workInProgressRootExitStatus;
	}
	function workLoopConcurrentByScheduler() {
		for (; null !== workInProgress && !shouldYield();) performUnitOfWork(workInProgress);
	}
	function performUnitOfWork(unitOfWork) {
		var next = beginWork(unitOfWork.alternate, unitOfWork, entangledRenderLanes);
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function replaySuspendedUnitOfWork(unitOfWork) {
		var next = unitOfWork;
		var current = next.alternate;
		switch (next.tag) {
			case 15:
			case 0:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type, void 0, workInProgressRootRenderLanes);
				break;
			case 11:
				next = replayFunctionComponent(current, next, next.pendingProps, next.type.render, next.ref, workInProgressRootRenderLanes);
				break;
			case 5:
				resetHooksOnUnwind(next);
				var fiber = next;
				fiber === hydrationParentFiber && (isHydrating ? (popToNextHostParent(fiber), 5 === fiber.tag && null != fiber.stateNode && (nextHydratableInstance = fiber.stateNode)) : (popToNextHostParent(fiber), isHydrating = !0));
			default: unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
		}
		unitOfWork.memoizedProps = unitOfWork.pendingProps;
		null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
	}
	function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
		lastContextDependency = currentlyRenderingFiber$1 = null;
		resetHooksOnUnwind(unitOfWork);
		thenableState$1 = null;
		thenableIndexCounter$1 = 0;
		var returnFiber = unitOfWork.return;
		try {
			if (throwException(root, returnFiber, unitOfWork, thrownValue, workInProgressRootRenderLanes)) {
				workInProgressRootExitStatus = 1;
				logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
				workInProgress = null;
				return;
			}
		} catch (error) {
			if (null !== returnFiber) throw workInProgress = returnFiber, error;
			workInProgressRootExitStatus = 1;
			logUncaughtError(root, createCapturedValueAtFiber(thrownValue, root.current));
			workInProgress = null;
			return;
		}
		if (unitOfWork.flags & 32768) {
			if (isHydrating || 1 === suspendedReason) root = !0;
			else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912)) root = !1;
			else if (workInProgressRootDidSkipSuspendedSiblings = root = !0, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason) suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
			unwindUnitOfWork(unitOfWork, root);
		} else completeUnitOfWork(unitOfWork);
	}
	function completeUnitOfWork(unitOfWork) {
		var completedWork = unitOfWork;
		do {
			if (0 !== (completedWork.flags & 32768)) {
				unwindUnitOfWork(completedWork, workInProgressRootDidSkipSuspendedSiblings);
				return;
			}
			unitOfWork = completedWork.return;
			var next = completeWork(completedWork.alternate, completedWork, entangledRenderLanes);
			if (null !== next) {
				workInProgress = next;
				return;
			}
			completedWork = completedWork.sibling;
			if (null !== completedWork) {
				workInProgress = completedWork;
				return;
			}
			workInProgress = completedWork = unitOfWork;
		} while (null !== completedWork);
		0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
	}
	function unwindUnitOfWork(unitOfWork, skipSiblings) {
		do {
			var next = unwindWork(unitOfWork.alternate, unitOfWork);
			if (null !== next) {
				next.flags &= 32767;
				workInProgress = next;
				return;
			}
			next = unitOfWork.return;
			null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
			if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
				workInProgress = unitOfWork;
				return;
			}
			workInProgress = unitOfWork = next;
		} while (null !== unitOfWork);
		workInProgressRootExitStatus = 6;
		workInProgress = null;
	}
	function completeRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedState) {
		root.cancelPendingCommit = null;
		do
			flushPendingEffects();
		while (0 !== pendingEffectsStatus);
		if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		if (null !== finishedWork) {
			if (finishedWork === root.current) throw Error(formatProdErrorMessage(177));
			root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
			pendingFinishedWork = finishedWork;
			pendingEffectsRoot = root;
			pendingEffectsLanes = lanes;
			pendingPassiveTransitions = transitions;
			pendingRecoverableErrors = recoverableErrors;
			commitRoot(root, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState);
		}
	}
	function commitRoot(root, finishedWork, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, suspendedState) {
		var remainingLanes = finishedWork.lanes | finishedWork.childLanes;
		pendingEffectsRemainingLanes = remainingLanes;
		remainingLanes |= concurrentlyUpdatedLanes;
		markRootFinished(root, lanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes);
		pendingViewTransitionEvents = null;
		(lanes & 335544064) === lanes ? (pendingTransitionTypes = claimQueuedTransitionTypes(root), spawnedLane = 10262) : (pendingTransitionTypes = null, spawnedLane = 10256);
		0 !== (finishedWork.subtreeFlags & spawnedLane) || 0 !== (finishedWork.flags & spawnedLane) ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback$1(NormalPriority$1, function() {
			flushPassiveEffects();
			return null;
		})) : (root.callbackNode = null, root.callbackPriority = 0);
		shouldStartViewTransition = !1;
		spawnedLane = 0 !== (finishedWork.flags & 13878);
		if (0 !== (finishedWork.subtreeFlags & 13878) || spawnedLane) {
			spawnedLane = ReactSharedInternals.T;
			ReactSharedInternals.T = null;
			updatedLanes = ReactDOMSharedInternals.p;
			ReactDOMSharedInternals.p = 2;
			suspendedRetryLanes = executionContext;
			executionContext |= 4;
			try {
				commitBeforeMutationEffects(root, finishedWork, lanes);
			} finally {
				executionContext = suspendedRetryLanes, ReactDOMSharedInternals.p = updatedLanes, ReactSharedInternals.T = spawnedLane;
			}
		}
		pendingEffectsStatus = 1;
		shouldStartViewTransition ? pendingViewTransition = startViewTransition(suspendedState, root.containerInfo, pendingTransitionTypes, flushMutationEffects, flushLayoutEffects, flushAfterMutationEffects, flushSpawnedWork, flushPassiveEffects, reportViewTransitionError, null, null) : (flushMutationEffects(), flushLayoutEffects(), flushSpawnedWork());
	}
	function reportViewTransitionError(error) {
		if (0 !== pendingEffectsStatus) {
			var onRecoverableError = pendingEffectsRoot.onRecoverableError;
			onRecoverableError(error, { componentStack: null });
		}
	}
	function flushAfterMutationEffects() {
		3 === pendingEffectsStatus && (pendingEffectsStatus = 0, commitAfterMutationEffectsOnFiber(pendingFinishedWork, pendingEffectsRoot), pendingEffectsStatus = 4);
	}
	function flushMutationEffects() {
		if (1 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
			if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
				rootMutationHasEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					inUpdateViewTransition = rootViewTransitionAffected = !1;
					commitMutationEffectsOnFiber(finishedWork, root, lanes);
					lanes = selectionInformation;
					var curFocusedElem = getActiveElementDeep(root.containerInfo), priorFocusedElem = lanes.focusedElem, priorSelectionRange = lanes.selectionRange;
					if (curFocusedElem !== priorFocusedElem && priorFocusedElem && priorFocusedElem.ownerDocument && containsNode(priorFocusedElem.ownerDocument.documentElement, priorFocusedElem)) {
						if (null !== priorSelectionRange && hasSelectionCapabilities(priorFocusedElem)) {
							var start = priorSelectionRange.start, end = priorSelectionRange.end;
							void 0 === end && (end = start);
							if ("selectionStart" in priorFocusedElem) priorFocusedElem.selectionStart = start, priorFocusedElem.selectionEnd = Math.min(end, priorFocusedElem.value.length);
							else {
								var doc = priorFocusedElem.ownerDocument || document, win = doc && doc.defaultView || window;
								if (win.getSelection) {
									var selection = win.getSelection(), length = priorFocusedElem.textContent.length, start$jscomp$0 = Math.min(priorSelectionRange.start, length), end$jscomp$0 = void 0 === priorSelectionRange.end ? start$jscomp$0 : Math.min(priorSelectionRange.end, length);
									!selection.extend && start$jscomp$0 > end$jscomp$0 && (curFocusedElem = end$jscomp$0, end$jscomp$0 = start$jscomp$0, start$jscomp$0 = curFocusedElem);
									var startMarker = getNodeForCharacterOffset(priorFocusedElem, start$jscomp$0), endMarker = getNodeForCharacterOffset(priorFocusedElem, end$jscomp$0);
									if (startMarker && endMarker && (1 !== selection.rangeCount || selection.anchorNode !== startMarker.node || selection.anchorOffset !== startMarker.offset || selection.focusNode !== endMarker.node || selection.focusOffset !== endMarker.offset)) {
										var range = doc.createRange();
										range.setStart(startMarker.node, startMarker.offset);
										selection.removeAllRanges();
										start$jscomp$0 > end$jscomp$0 ? (selection.addRange(range), selection.extend(endMarker.node, endMarker.offset)) : (range.setEnd(endMarker.node, endMarker.offset), selection.addRange(range));
									}
								}
							}
						}
						doc = [];
						for (selection = priorFocusedElem; selection = selection.parentNode;) 1 === selection.nodeType && doc.push({
							element: selection,
							left: selection.scrollLeft,
							top: selection.scrollTop
						});
						"function" === typeof priorFocusedElem.focus && priorFocusedElem.focus();
						for (priorFocusedElem = 0; priorFocusedElem < doc.length; priorFocusedElem++) {
							var info = doc[priorFocusedElem];
							info.element.scrollLeft = info.left;
							info.element.scrollTop = info.top;
						}
					}
					_enabled = !!eventsEnabled;
					selectionInformation = eventsEnabled = null;
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootMutationHasEffect;
				}
			}
			root.current = finishedWork;
			pendingEffectsStatus = 2;
		}
	}
	function flushLayoutEffects() {
		if (2 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
			if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
				rootHasLayoutEffect = ReactSharedInternals.T;
				ReactSharedInternals.T = null;
				var previousPriority = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				var prevExecutionContext = executionContext;
				executionContext |= 4;
				try {
					commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
				} finally {
					executionContext = prevExecutionContext, ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = rootHasLayoutEffect;
				}
			}
			pendingEffectsStatus = 3;
		}
	}
	function flushSpawnedWork() {
		if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
			pendingEffectsStatus = 0;
			var committedViewTransition = pendingViewTransition;
			pendingViewTransition = null;
			requestPaint();
			var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors, passiveSubtreeMask = (lanes & 335544064) === lanes ? 10262 : 10256;
			0 !== (finishedWork.subtreeFlags & passiveSubtreeMask) || 0 !== (finishedWork.flags & passiveSubtreeMask) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
			passiveSubtreeMask = root.pendingLanes;
			0 === passiveSubtreeMask && (legacyErrorBoundariesThatAlreadyFailed = null);
			lanesToEventPriority(lanes);
			finishedWork = finishedWork.stateNode;
			if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot) try {
				injectedHook.onCommitFiberRoot(rendererID, finishedWork, void 0, 128 === (finishedWork.current.flags & 128));
			} catch (err) {}
			if (null !== recoverableErrors) {
				finishedWork = ReactSharedInternals.T;
				passiveSubtreeMask = ReactDOMSharedInternals.p;
				ReactDOMSharedInternals.p = 2;
				ReactSharedInternals.T = null;
				try {
					for (var onRecoverableError = root.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
						var recoverableError = recoverableErrors[i];
						onRecoverableError(recoverableError.value, { componentStack: recoverableError.stack });
					}
				} finally {
					ReactSharedInternals.T = finishedWork, ReactDOMSharedInternals.p = passiveSubtreeMask;
				}
			}
			recoverableErrors = pendingViewTransitionEvents;
			onRecoverableError = pendingTransitionTypes;
			pendingTransitionTypes = null;
			if (null !== recoverableErrors && (pendingViewTransitionEvents = null, null === onRecoverableError && (onRecoverableError = []), null !== committedViewTransition)) for (recoverableError = 0; recoverableError < recoverableErrors.length; recoverableError++) finishedWork = (0, recoverableErrors[recoverableError])(onRecoverableError), void 0 !== finishedWork && committedViewTransition.finished.finally(finishedWork);
			0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
			ensureRootIsScheduled(root);
			passiveSubtreeMask = root.pendingLanes;
			0 !== (lanes & 261930) && 0 !== (passiveSubtreeMask & 42) ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : (nestedUpdateCount = 0, rootWithNestedUpdates = null);
			flushSyncWorkAcrossRoots_impl(0, !1);
		}
	}
	function releaseRootPooledCache(root, remainingLanes) {
		0 === (root.pooledCacheLanes &= remainingLanes) && (remainingLanes = root.pooledCache, null != remainingLanes && (root.pooledCache = null, releaseCache(remainingLanes)));
	}
	function flushPendingEffects() {
		null !== pendingViewTransition && (pendingViewTransition.skipTransition(), pendingViewTransition = null);
		flushMutationEffects();
		flushLayoutEffects();
		flushSpawnedWork();
		return flushPassiveEffects();
	}
	function flushPassiveEffects() {
		if (5 !== pendingEffectsStatus) return !1;
		var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
		pendingEffectsRemainingLanes = 0;
		var renderPriority = lanesToEventPriority(pendingEffectsLanes), prevTransition = ReactSharedInternals.T, previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 32 > renderPriority ? 32 : renderPriority;
			ReactSharedInternals.T = null;
			renderPriority = pendingPassiveTransitions;
			pendingPassiveTransitions = null;
			var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
			pendingEffectsStatus = 0;
			pendingFinishedWork = pendingEffectsRoot = null;
			pendingEffectsLanes = 0;
			if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(331));
			var prevExecutionContext = executionContext;
			executionContext |= 4;
			commitPassiveUnmountOnFiber(root$jscomp$0.current);
			commitPassiveMountOnFiber(root$jscomp$0, root$jscomp$0.current, lanes, renderPriority);
			executionContext = prevExecutionContext;
			flushSyncWorkAcrossRoots_impl(0, !1);
			if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot) try {
				injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
			} catch (err) {}
			return !0;
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition, releaseRootPooledCache(root, remainingLanes);
		}
	}
	function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
		sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
		rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
		null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
	}
	function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
		if (3 === sourceFiber.tag) captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
		else for (; null !== nearestMountedAncestor;) {
			if (3 === nearestMountedAncestor.tag) {
				captureCommitPhaseErrorOnRoot(nearestMountedAncestor, sourceFiber, error);
				break;
			} else if (1 === nearestMountedAncestor.tag) {
				var instance = nearestMountedAncestor.stateNode;
				if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
					sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
					error = createClassErrorUpdate(2);
					instance = enqueueUpdate(nearestMountedAncestor, error, 2);
					null !== instance && (initializeClassErrorUpdate(error, instance, nearestMountedAncestor, sourceFiber), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
					break;
				}
			}
			nearestMountedAncestor = nearestMountedAncestor.return;
		}
	}
	function attachPingListener(root, wakeable, lanes) {
		var pingCache = root.pingCache;
		if (null === pingCache) {
			pingCache = root.pingCache = new PossiblyWeakMap();
			var threadIDs = /* @__PURE__ */ new Set();
			pingCache.set(wakeable, threadIDs);
		} else threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
		threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = !0, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
	}
	function pingSuspendedRoot(root, wakeable, pingedLanes) {
		var pingCache = root.pingCache;
		null !== pingCache && pingCache.delete(wakeable);
		root.pingedLanes |= root.suspendedLanes & pingedLanes;
		root.warmLanes &= ~pingedLanes;
		workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) ? prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
		ensureRootIsScheduled(root);
	}
	function retryTimedOutBoundary(boundaryFiber, retryLane) {
		0 === retryLane && (retryLane = claimNextRetryLane());
		boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
		null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
	}
	function retryDehydratedSuspenseBoundary(boundaryFiber) {
		var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
		null !== suspenseState && (retryLane = suspenseState.retryLane);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function resolveRetryWakeable(boundaryFiber, wakeable) {
		var retryLane = 0;
		switch (boundaryFiber.tag) {
			case 31:
			case 13:
				var retryCache = boundaryFiber.stateNode;
				var suspenseState = boundaryFiber.memoizedState;
				null !== suspenseState && (retryLane = suspenseState.retryLane);
				break;
			case 19:
				retryCache = boundaryFiber.stateNode;
				break;
			case 22:
				retryCache = boundaryFiber.stateNode._retryCache;
				break;
			default: throw Error(formatProdErrorMessage(314));
		}
		null !== retryCache && retryCache.delete(wakeable);
		retryTimedOutBoundary(boundaryFiber, retryLane);
	}
	function scheduleCallback$1(priorityLevel, callback) {
		return scheduleCallback$3(priorityLevel, callback);
	}
	var firstScheduledRoot = null;
	var lastScheduledRoot = null;
	var didScheduleMicrotask = !1;
	var mightHavePendingSyncWork = !1;
	var isFlushingWork = !1;
	var currentEventTransitionLane = 0;
	function ensureRootIsScheduled(root) {
		root !== lastScheduledRoot && null === root.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
		mightHavePendingSyncWork = !0;
		didScheduleMicrotask || (didScheduleMicrotask = !0, scheduleImmediateRootScheduleTask());
	}
	function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
		if (!isFlushingWork && mightHavePendingSyncWork) {
			isFlushingWork = !0;
			do {
				var didPerformSomeWork = !1;
				for (var root$190 = firstScheduledRoot; null !== root$190;) {
					if (!onlyLegacy) if (0 !== syncTransitionLanes) {
						var pendingLanes = root$190.pendingLanes;
						if (0 === pendingLanes) var JSCompiler_inline_result = 0;
						else {
							var suspendedLanes = root$190.suspendedLanes, pingedLanes = root$190.pingedLanes;
							JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
							JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
							JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
						}
						0 !== JSCompiler_inline_result && (didPerformSomeWork = !0, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
					} else JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(root$190, root$190 === workInProgressRoot ? JSCompiler_inline_result : 0, null !== root$190.cancelPendingCommit || -1 !== root$190.timeoutHandle), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root$190, JSCompiler_inline_result) || (didPerformSomeWork = !0, performSyncWorkOnRoot(root$190, JSCompiler_inline_result));
					root$190 = root$190.next;
				}
			} while (didPerformSomeWork);
			isFlushingWork = !1;
		}
	}
	function processRootScheduleInImmediateTask() {
		processRootScheduleInMicrotask();
	}
	function processRootScheduleInMicrotask() {
		mightHavePendingSyncWork = didScheduleMicrotask = !1;
		var syncTransitionLanes = 0;
		0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
		for (var currentTime = now(), prev = null, root = firstScheduledRoot; null !== root;) {
			var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
			if (0 === nextLanes) root.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
			else if (prev = root, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3)) mightHavePendingSyncWork = !0;
			root = next;
		}
		0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes, !1);
		0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
	}
	function scheduleTaskForRootDuringMicrotask(root, currentTime) {
		for (var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes, expirationTimes = root.expirationTimes, lanes = root.pendingLanes & -62914561; 0 < lanes;) {
			var index$5 = 31 - clz32(lanes), lane = 1 << index$5, expirationTime = expirationTimes[index$5];
			if (-1 === expirationTime) {
				if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes)) expirationTimes[index$5] = computeExpirationTime(lane, currentTime);
			} else expirationTime <= currentTime && (root.expiredLanes |= lane);
			lanes &= ~lane;
		}
		currentTime = workInProgressRoot;
		suspendedLanes = workInProgressRootRenderLanes;
		suspendedLanes = getNextLanes(root, root === currentTime ? suspendedLanes : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		pingedLanes = root.callbackNode;
		if (0 === suspendedLanes || root === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit) return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
		if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root, suspendedLanes)) {
			currentTime = suspendedLanes & -suspendedLanes;
			if (currentTime === root.callbackPriority) return currentTime;
			null !== pingedLanes && cancelCallback$1(pingedLanes);
			switch (lanesToEventPriority(suspendedLanes)) {
				case 2:
				case 8:
					suspendedLanes = UserBlockingPriority;
					break;
				case 32:
					suspendedLanes = NormalPriority$1;
					break;
				case 268435456:
					suspendedLanes = IdlePriority;
					break;
				default: suspendedLanes = NormalPriority$1;
			}
			pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
			suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
			root.callbackPriority = currentTime;
			root.callbackNode = suspendedLanes;
			return currentTime;
		}
		null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
		root.callbackPriority = 2;
		root.callbackNode = null;
		return 2;
	}
	function performWorkOnRootViaSchedulerTask(root, didTimeout) {
		if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus) return root.callbackNode = null, root.callbackPriority = 0, null;
		var originalCallbackNode = root.callbackNode;
		if (flushPendingEffects() && root.callbackNode !== originalCallbackNode) return null;
		var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
		workInProgressRootRenderLanes$jscomp$0 = getNextLanes(root, root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0, null !== root.cancelPendingCommit || -1 !== root.timeoutHandle);
		if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
		performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
		scheduleTaskForRootDuringMicrotask(root, now());
		return null != root.callbackNode && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
	}
	function performSyncWorkOnRoot(root, lanes) {
		if (flushPendingEffects()) return null;
		performWorkOnRoot(root, lanes, !0);
	}
	function scheduleImmediateRootScheduleTask() {
		scheduleMicrotask(function() {
			0 !== (executionContext & 6) ? scheduleCallback$3(ImmediatePriority, processRootScheduleInImmediateTask) : processRootScheduleInMicrotask();
		});
	}
	function requestTransitionLane() {
		if (0 === currentEventTransitionLane) {
			var actionScopeLane = currentEntangledLane;
			0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
			currentEventTransitionLane = actionScopeLane;
		}
		return currentEventTransitionLane;
	}
	function coerceFormActionProp(actionProp) {
		return null == actionProp || "symbol" === typeof actionProp || "boolean" === typeof actionProp ? null : "function" === typeof actionProp ? actionProp : sanitizeURL(actionProp);
	}
	function extractEvents$1(dispatchQueue, domEventName, maybeTargetInst, nativeEvent, nativeEventTarget) {
		if ("submit" === domEventName && maybeTargetInst && maybeTargetInst.stateNode === nativeEventTarget) {
			var action = coerceFormActionProp((nativeEventTarget[internalPropsKey] || null).action), submitter = nativeEvent.submitter;
			submitter && (domEventName = (domEventName = submitter[internalPropsKey] || null) ? coerceFormActionProp(domEventName.formAction) : submitter.getAttribute("formAction"), null !== domEventName && (action = domEventName, submitter = null));
			var event = new SyntheticEvent("action", "action", null, nativeEvent, nativeEventTarget);
			dispatchQueue.push({
				event,
				listeners: [{
					instance: null,
					listener: function() {
						if (nativeEvent.defaultPrevented) {
							if (0 !== currentEventTransitionLane) {
								var formData = new FormData(nativeEventTarget, submitter);
								startHostTransition(maybeTargetInst, {
									pending: !0,
									data: formData,
									method: nativeEventTarget.method,
									action
								}, null, formData);
							}
						} else "function" === typeof action && (event.preventDefault(), formData = new FormData(nativeEventTarget, submitter), startHostTransition(maybeTargetInst, {
							pending: !0,
							data: formData,
							method: nativeEventTarget.method,
							action
						}, action, formData));
					},
					currentTarget: nativeEventTarget
				}]
			});
		}
	}
	for (var i$jscomp$inline_1667 = 0; i$jscomp$inline_1667 < simpleEventPluginEvents.length; i$jscomp$inline_1667++) {
		var eventName$jscomp$inline_1668 = simpleEventPluginEvents[i$jscomp$inline_1667];
		registerSimpleEvent(eventName$jscomp$inline_1668.toLowerCase(), "on" + (eventName$jscomp$inline_1668[0].toUpperCase() + eventName$jscomp$inline_1668.slice(1)));
	}
	registerSimpleEvent(ANIMATION_END, "onAnimationEnd");
	registerSimpleEvent(ANIMATION_ITERATION, "onAnimationIteration");
	registerSimpleEvent(ANIMATION_START, "onAnimationStart");
	registerSimpleEvent("dblclick", "onDoubleClick");
	registerSimpleEvent("focusin", "onFocus");
	registerSimpleEvent("focusout", "onBlur");
	registerSimpleEvent(TRANSITION_RUN, "onTransitionRun");
	registerSimpleEvent(TRANSITION_START, "onTransitionStart");
	registerSimpleEvent(TRANSITION_CANCEL, "onTransitionCancel");
	registerSimpleEvent(TRANSITION_END, "onTransitionEnd");
	registerDirectEvent("onMouseEnter", ["mouseout", "mouseover"]);
	registerDirectEvent("onMouseLeave", ["mouseout", "mouseover"]);
	registerDirectEvent("onPointerEnter", ["pointerout", "pointerover"]);
	registerDirectEvent("onPointerLeave", ["pointerout", "pointerover"]);
	registerTwoPhaseEvent("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
	registerTwoPhaseEvent("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
	registerTwoPhaseEvent("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]);
	registerTwoPhaseEvent("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
	registerTwoPhaseEvent("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var mediaEventTypes = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
	var nonDelegatedEvents = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(mediaEventTypes));
	function processDispatchQueue(dispatchQueue, eventSystemFlags) {
		eventSystemFlags = 0 !== (eventSystemFlags & 4);
		for (var i = 0; i < dispatchQueue.length; i++) {
			var _dispatchQueue$i = dispatchQueue[i], event = _dispatchQueue$i.event;
			_dispatchQueue$i = _dispatchQueue$i.listeners;
			a: {
				var previousInstance = void 0;
				if (eventSystemFlags) for (var i$jscomp$0 = _dispatchQueue$i.length - 1; 0 <= i$jscomp$0; i$jscomp$0--) {
					var _dispatchListeners$i = _dispatchQueue$i[i$jscomp$0], instance = _dispatchListeners$i.instance, currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
				else for (i$jscomp$0 = 0; i$jscomp$0 < _dispatchQueue$i.length; i$jscomp$0++) {
					_dispatchListeners$i = _dispatchQueue$i[i$jscomp$0];
					instance = _dispatchListeners$i.instance;
					currentTarget = _dispatchListeners$i.currentTarget;
					_dispatchListeners$i = _dispatchListeners$i.listener;
					if (instance !== previousInstance && event.isPropagationStopped()) break a;
					previousInstance = _dispatchListeners$i;
					event.currentTarget = currentTarget;
					try {
						previousInstance(event);
					} catch (error) {
						reportGlobalError(error);
					}
					event.currentTarget = null;
					previousInstance = instance;
				}
			}
		}
	}
	function listenToNonDelegatedEvent(domEventName, targetElement) {
		var JSCompiler_inline_result = targetElement[internalEventHandlersKey];
		void 0 === JSCompiler_inline_result && (JSCompiler_inline_result = targetElement[internalEventHandlersKey] = /* @__PURE__ */ new Set());
		var listenerSetKey = domEventName + "__bubble";
		JSCompiler_inline_result.has(listenerSetKey) || (addTrappedEventListener(targetElement, domEventName, 2, !1), JSCompiler_inline_result.add(listenerSetKey));
	}
	function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {
		var eventSystemFlags = 0;
		isCapturePhaseListener && (eventSystemFlags |= 4);
		addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
	}
	var listeningMarker = "_reactListening" + Math.random().toString(36).slice(2);
	function listenToAllSupportedEvents(rootContainerElement) {
		if (!rootContainerElement[listeningMarker]) {
			rootContainerElement[listeningMarker] = !0;
			allNativeEvents.forEach(function(domEventName) {
				"selectionchange" !== domEventName && (nonDelegatedEvents.has(domEventName) || listenToNativeEvent(domEventName, !1, rootContainerElement), listenToNativeEvent(domEventName, !0, rootContainerElement));
			});
			var ownerDocument = 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
			null === ownerDocument || ownerDocument[listeningMarker] || (ownerDocument[listeningMarker] = !0, listenToNativeEvent("selectionchange", !1, ownerDocument));
		}
	}
	function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
		switch (getEventPriority(domEventName)) {
			case 2:
				var listenerWrapper = dispatchDiscreteEvent;
				break;
			case 8:
				listenerWrapper = dispatchContinuousEvent;
				break;
			default: listenerWrapper = dispatchEvent;
		}
		eventSystemFlags = listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
		listenerWrapper = void 0;
		!passiveBrowserEventsSupported || "touchstart" !== domEventName && "touchmove" !== domEventName && "wheel" !== domEventName || (listenerWrapper = !0);
		isCapturePhaseListener ? void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, {
			capture: !0,
			passive: listenerWrapper
		}) : targetContainer.addEventListener(domEventName, eventSystemFlags, !0) : void 0 !== listenerWrapper ? targetContainer.addEventListener(domEventName, eventSystemFlags, { passive: listenerWrapper }) : targetContainer.addEventListener(domEventName, eventSystemFlags, !1);
	}
	function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst$jscomp$0, targetContainer) {
		var ancestorInst = targetInst$jscomp$0;
		if (0 === (eventSystemFlags & 1) && 0 === (eventSystemFlags & 2) && null !== targetInst$jscomp$0) a: for (;;) {
			if (null === targetInst$jscomp$0) return;
			var nodeTag = targetInst$jscomp$0.tag;
			if (3 === nodeTag || 4 === nodeTag) {
				var container = targetInst$jscomp$0.stateNode.containerInfo;
				if (container === targetContainer) break;
				if (4 === nodeTag) for (nodeTag = targetInst$jscomp$0.return; null !== nodeTag;) {
					var grandTag = nodeTag.tag;
					if ((3 === grandTag || 4 === grandTag) && nodeTag.stateNode.containerInfo === targetContainer) return;
					nodeTag = nodeTag.return;
				}
				for (; null !== container;) {
					nodeTag = getClosestInstanceFromNode(container);
					if (null === nodeTag) return;
					grandTag = nodeTag.tag;
					if (5 === grandTag || 6 === grandTag || 26 === grandTag || 27 === grandTag) {
						targetInst$jscomp$0 = ancestorInst = nodeTag;
						continue a;
					}
					container = container.parentNode;
				}
			}
			targetInst$jscomp$0 = targetInst$jscomp$0.return;
		}
		batchedUpdates$1(function() {
			var targetInst = ancestorInst, nativeEventTarget = getEventTarget(nativeEvent), dispatchQueue = [];
			a: {
				var reactName = topLevelEventsToReactNames.get(domEventName);
				if (void 0 !== reactName) {
					var SyntheticEventCtor = SyntheticEvent, reactEventType = domEventName;
					switch (domEventName) {
						case "keypress": if (0 === getEventCharCode(nativeEvent)) break a;
						case "keydown":
						case "keyup":
							SyntheticEventCtor = SyntheticKeyboardEvent;
							break;
						case "focusin":
							reactEventType = "focus";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "focusout":
							reactEventType = "blur";
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "beforeblur":
						case "afterblur":
							SyntheticEventCtor = SyntheticFocusEvent;
							break;
						case "click": if (2 === nativeEvent.button) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							SyntheticEventCtor = SyntheticMouseEvent;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							SyntheticEventCtor = SyntheticDragEvent;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							SyntheticEventCtor = SyntheticTouchEvent;
							break;
						case ANIMATION_END:
						case ANIMATION_ITERATION:
						case ANIMATION_START:
							SyntheticEventCtor = SyntheticAnimationEvent;
							break;
						case TRANSITION_END:
							SyntheticEventCtor = SyntheticTransitionEvent;
							break;
						case "scroll":
						case "scrollend":
							SyntheticEventCtor = SyntheticUIEvent;
							break;
						case "wheel":
							SyntheticEventCtor = SyntheticWheelEvent;
							break;
						case "copy":
						case "cut":
						case "paste":
							SyntheticEventCtor = SyntheticClipboardEvent;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							SyntheticEventCtor = SyntheticPointerEvent;
							break;
						case "submit":
							SyntheticEventCtor = SyntheticSubmitEvent;
							break;
						case "toggle":
						case "beforetoggle": SyntheticEventCtor = SyntheticToggleEvent;
					}
					var inCapturePhase = 0 !== (eventSystemFlags & 4), accumulateTargetOnly = !inCapturePhase && ("scroll" === domEventName || "scrollend" === domEventName), reactEventName = inCapturePhase ? null !== reactName ? reactName + "Capture" : null : reactName;
					inCapturePhase = [];
					for (var instance = targetInst, lastHostComponent; null !== instance;) {
						var _instance = instance;
						lastHostComponent = _instance.stateNode;
						_instance = _instance.tag;
						5 !== _instance && 26 !== _instance && 27 !== _instance || null === lastHostComponent || null === reactEventName || (_instance = getListener(instance, reactEventName), null != _instance && inCapturePhase.push(createDispatchListener(instance, _instance, lastHostComponent)));
						if (accumulateTargetOnly) break;
						instance = instance.return;
					}
					0 < inCapturePhase.length && (reactName = new SyntheticEventCtor(reactName, reactEventType, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
						event: reactName,
						listeners: inCapturePhase
					}));
				}
			}
			if (0 === (eventSystemFlags & 7)) {
				a: {
					SyntheticEventCtor = "mouseover" === domEventName || "pointerover" === domEventName;
					reactName = "mouseout" === domEventName || "pointerout" === domEventName;
					if (SyntheticEventCtor && nativeEvent !== currentReplayingEvent && (reactEventType = nativeEvent.relatedTarget || nativeEvent.fromElement) && (getClosestInstanceFromNode(reactEventType) || reactEventType[internalContainerInstanceKey])) break a;
					if (reactName || SyntheticEventCtor) {
						reactEventType = nativeEventTarget.window === nativeEventTarget ? nativeEventTarget : (SyntheticEventCtor = nativeEventTarget.ownerDocument) ? SyntheticEventCtor.defaultView || SyntheticEventCtor.parentWindow : window;
						if (reactName) {
							if (SyntheticEventCtor = nativeEvent.relatedTarget || nativeEvent.toElement, reactName = targetInst, SyntheticEventCtor = SyntheticEventCtor ? getClosestInstanceFromNode(SyntheticEventCtor) : null, null !== SyntheticEventCtor && (accumulateTargetOnly = getNearestMountedFiber(SyntheticEventCtor), inCapturePhase = SyntheticEventCtor.tag, SyntheticEventCtor !== accumulateTargetOnly || 5 !== inCapturePhase && 27 !== inCapturePhase && 6 !== inCapturePhase)) SyntheticEventCtor = null;
						} else reactName = null, SyntheticEventCtor = targetInst;
						if (reactName !== SyntheticEventCtor) {
							inCapturePhase = SyntheticMouseEvent;
							_instance = "onMouseLeave";
							reactEventName = "onMouseEnter";
							instance = "mouse";
							if ("pointerout" === domEventName || "pointerover" === domEventName) inCapturePhase = SyntheticPointerEvent, _instance = "onPointerLeave", reactEventName = "onPointerEnter", instance = "pointer";
							accumulateTargetOnly = null == reactName ? reactEventType : getNodeFromInstance(reactName);
							lastHostComponent = null == SyntheticEventCtor ? reactEventType : getNodeFromInstance(SyntheticEventCtor);
							reactEventType = new inCapturePhase(_instance, instance + "leave", reactName, nativeEvent, nativeEventTarget);
							reactEventType.target = accumulateTargetOnly;
							reactEventType.relatedTarget = lastHostComponent;
							_instance = null;
							getClosestInstanceFromNode(nativeEventTarget) === targetInst && (inCapturePhase = new inCapturePhase(reactEventName, instance + "enter", SyntheticEventCtor, nativeEvent, nativeEventTarget), inCapturePhase.target = lastHostComponent, inCapturePhase.relatedTarget = accumulateTargetOnly, _instance = inCapturePhase);
							accumulateTargetOnly = _instance;
							inCapturePhase = reactName && SyntheticEventCtor ? getLowestCommonAncestor(reactName, SyntheticEventCtor, getParent) : null;
							null !== reactName && accumulateEnterLeaveListenersForEvent(dispatchQueue, reactEventType, reactName, inCapturePhase, !1);
							null !== SyntheticEventCtor && null !== accumulateTargetOnly && accumulateEnterLeaveListenersForEvent(dispatchQueue, accumulateTargetOnly, SyntheticEventCtor, inCapturePhase, !0);
						}
					}
				}
				a: {
					reactName = targetInst ? getNodeFromInstance(targetInst) : window;
					SyntheticEventCtor = reactName.nodeName && reactName.nodeName.toLowerCase();
					if ("select" === SyntheticEventCtor || "input" === SyntheticEventCtor && "file" === reactName.type) var getTargetInstFunc = getTargetInstForChangeEvent;
					else if (isTextInputElement(reactName)) if (isInputEventSupported) getTargetInstFunc = getTargetInstForInputOrChangeEvent;
					else {
						getTargetInstFunc = getTargetInstForInputEventPolyfill;
						var handleEventFunc = handleEventsForInputEventPolyfill;
					}
					else SyntheticEventCtor = reactName.nodeName, !SyntheticEventCtor || "input" !== SyntheticEventCtor.toLowerCase() || "checkbox" !== reactName.type && "radio" !== reactName.type ? targetInst && isCustomElement(targetInst.elementType) && (getTargetInstFunc = getTargetInstForChangeEvent) : getTargetInstFunc = getTargetInstForClickEvent;
					if (getTargetInstFunc && (getTargetInstFunc = getTargetInstFunc(domEventName, targetInst))) {
						createAndAccumulateChangeEvent(dispatchQueue, getTargetInstFunc, nativeEvent, nativeEventTarget);
						break a;
					}
					handleEventFunc && handleEventFunc(domEventName, reactName, targetInst);
				}
				handleEventFunc = targetInst ? getNodeFromInstance(targetInst) : window;
				switch (domEventName) {
					case "focusin":
						if (isTextInputElement(handleEventFunc) || "true" === handleEventFunc.contentEditable) activeElement = handleEventFunc, activeElementInst = targetInst, lastSelection = null;
						break;
					case "focusout":
						lastSelection = activeElementInst = activeElement = null;
						break;
					case "mousedown":
						mouseDown = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						mouseDown = !1;
						constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
						break;
					case "selectionchange": if (skipSelectionChangeEvent) break;
					case "keydown":
					case "keyup": constructSelectEvent(dispatchQueue, nativeEvent, nativeEventTarget);
				}
				var fallbackData;
				if (canUseCompositionEvent) b: {
					switch (domEventName) {
						case "compositionstart":
							var eventType = "onCompositionStart";
							break b;
						case "compositionend":
							eventType = "onCompositionEnd";
							break b;
						case "compositionupdate":
							eventType = "onCompositionUpdate";
							break b;
					}
					eventType = void 0;
				}
				else isComposing ? isFallbackCompositionEnd(domEventName, nativeEvent) && (eventType = "onCompositionEnd") : "keydown" === domEventName && 229 === nativeEvent.keyCode && (eventType = "onCompositionStart");
				eventType && (useFallbackCompositionData && "ko" !== nativeEvent.locale && (isComposing || "onCompositionStart" !== eventType ? "onCompositionEnd" === eventType && isComposing && (fallbackData = getData()) : (root = nativeEventTarget, startText = "value" in root ? root.value : root.textContent, isComposing = !0)), handleEventFunc = accumulateTwoPhaseListeners(targetInst, eventType), 0 < handleEventFunc.length && (eventType = new SyntheticCompositionEvent(eventType, domEventName, null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: eventType,
					listeners: handleEventFunc
				}), fallbackData ? eventType.data = fallbackData : (fallbackData = getDataFromCustomEvent(nativeEvent), null !== fallbackData && (eventType.data = fallbackData))));
				if (fallbackData = canUseTextInputEvent ? getNativeBeforeInputChars(domEventName, nativeEvent) : getFallbackBeforeInputChars(domEventName, nativeEvent)) eventType = accumulateTwoPhaseListeners(targetInst, "onBeforeInput"), 0 < eventType.length && (handleEventFunc = new SyntheticCompositionEvent("onBeforeInput", "beforeinput", null, nativeEvent, nativeEventTarget), dispatchQueue.push({
					event: handleEventFunc,
					listeners: eventType
				}), handleEventFunc.data = fallbackData);
				extractEvents$1(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget);
			}
			processDispatchQueue(dispatchQueue, eventSystemFlags);
		});
	}
	function createDispatchListener(instance, listener, currentTarget) {
		return {
			instance,
			listener,
			currentTarget
		};
	}
	function accumulateTwoPhaseListeners(targetFiber, reactName) {
		for (var captureName = reactName + "Capture", listeners = []; null !== targetFiber;) {
			var _instance2 = targetFiber, stateNode = _instance2.stateNode;
			_instance2 = _instance2.tag;
			5 !== _instance2 && 26 !== _instance2 && 27 !== _instance2 || null === stateNode || (_instance2 = getListener(targetFiber, captureName), null != _instance2 && listeners.unshift(createDispatchListener(targetFiber, _instance2, stateNode)), _instance2 = getListener(targetFiber, reactName), null != _instance2 && listeners.push(createDispatchListener(targetFiber, _instance2, stateNode)));
			if (3 === targetFiber.tag) return listeners;
			targetFiber = targetFiber.return;
		}
		return [];
	}
	function getParent(inst) {
		if (null === inst) return null;
		do
			inst = inst.return;
		while (inst && 5 !== inst.tag && 27 !== inst.tag);
		return inst ? inst : null;
	}
	function accumulateEnterLeaveListenersForEvent(dispatchQueue, event, target, common, inCapturePhase) {
		for (var registrationName = event._reactName, listeners = []; null !== target && target !== common;) {
			var _instance3 = target, alternate = _instance3.alternate, stateNode = _instance3.stateNode;
			_instance3 = _instance3.tag;
			if (null !== alternate && alternate === common) break;
			5 !== _instance3 && 26 !== _instance3 && 27 !== _instance3 || null === stateNode || (alternate = stateNode, inCapturePhase ? (stateNode = getListener(target, registrationName), null != stateNode && listeners.unshift(createDispatchListener(target, stateNode, alternate))) : inCapturePhase || (stateNode = getListener(target, registrationName), null != stateNode && listeners.push(createDispatchListener(target, stateNode, alternate))));
			target = target.return;
		}
		0 !== listeners.length && dispatchQueue.push({
			event,
			listeners
		});
	}
	var NORMALIZE_NEWLINES_REGEX = /\r\n?/g;
	var NORMALIZE_NULL_AND_REPLACEMENT_REGEX = /\u0000|\uFFFD/g;
	function normalizeMarkupForTextOrAttribute(markup) {
		return ("string" === typeof markup ? markup : "" + markup).replace(NORMALIZE_NEWLINES_REGEX, "\n").replace(NORMALIZE_NULL_AND_REPLACEMENT_REGEX, "");
	}
	function checkForUnmatchedText(serverText, clientText) {
		clientText = normalizeMarkupForTextOrAttribute(clientText);
		return normalizeMarkupForTextOrAttribute(serverText) === clientText ? !0 : !1;
	}
	function setProp(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "children":
				if ("string" === typeof value) "body" === tag || "textarea" === tag && "" === value || setTextContent(domElement, value);
				else if ("number" === typeof value || "bigint" === typeof value) "body" !== tag && setTextContent(domElement, "" + value);
				else return;
				break;
			case "className":
				setValueForKnownAttribute(domElement, "class", value);
				break;
			case "tabIndex":
				setValueForKnownAttribute(domElement, "tabindex", value);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				setValueForKnownAttribute(domElement, key, value);
				break;
			case "style":
				setValueForStyles(domElement, value, prevValue);
				return;
			case "data": if ("object" !== tag) {
				setValueForKnownAttribute(domElement, "data", value);
				break;
			}
			case "src":
			case "href":
				if ("" === value && ("a" !== tag || "href" !== key)) {
					domElement.removeAttribute(key);
					break;
				}
				if (null == value || "function" === typeof value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL(value);
				domElement.setAttribute(key, value);
				break;
			case "action":
			case "formAction":
				if ("function" === typeof value) {
					domElement.setAttribute(key, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else "function" === typeof prevValue && ("formAction" === key ? ("input" !== tag && setProp(domElement, tag, "name", props.name, props, null), setProp(domElement, tag, "formEncType", props.formEncType, props, null), setProp(domElement, tag, "formMethod", props.formMethod, props, null), setProp(domElement, tag, "formTarget", props.formTarget, props, null)) : (setProp(domElement, tag, "encType", props.encType, props, null), setProp(domElement, tag, "method", props.method, props, null), setProp(domElement, tag, "target", props.target, props, null)));
				if (null == value || "symbol" === typeof value || "boolean" === typeof value) {
					domElement.removeAttribute(key);
					break;
				}
				value = sanitizeURL(value);
				domElement.setAttribute(key, value);
				break;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				return;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				return;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				return;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						(null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
					}
				}
				break;
			case "multiple":
				domElement.multiple = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "muted":
				domElement.muted = value && "function" !== typeof value && "symbol" !== typeof value;
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (null == value || "function" === typeof value || "boolean" === typeof value || "symbol" === typeof value) {
					domElement.removeAttribute("xlink:href");
					break;
				}
				key = sanitizeURL(value);
				domElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", key);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "credentialless":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, "") : domElement.removeAttribute(key);
				break;
			case "capture":
			case "download":
				!0 === value ? domElement.setAttribute(key, "") : !1 !== value && null != value && "function" !== typeof value && "symbol" !== typeof value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				null != value && "function" !== typeof value && "symbol" !== typeof value && !isNaN(value) && 1 <= value ? domElement.setAttribute(key, value) : domElement.removeAttribute(key);
				break;
			case "rowSpan":
			case "start":
				null == value || "function" === typeof value || "symbol" === typeof value || isNaN(value) ? domElement.removeAttribute(key) : domElement.setAttribute(key, value);
				break;
			case "popover":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				setValueForAttribute(domElement, "popover", value);
				break;
			case "xlinkActuate":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:actuate", value);
				break;
			case "xlinkArcrole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:arcrole", value);
				break;
			case "xlinkRole":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:role", value);
				break;
			case "xlinkShow":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:show", value);
				break;
			case "xlinkTitle":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:title", value);
				break;
			case "xlinkType":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/1999/xlink", "xlink:type", value);
				break;
			case "xmlBase":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:base", value);
				break;
			case "xmlLang":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:lang", value);
				break;
			case "xmlSpace":
				setValueForNamespacedAttribute(domElement, "http://www.w3.org/XML/1998/namespace", "xml:space", value);
				break;
			case "is":
				setValueForAttribute(domElement, "is", value);
				break;
			case "innerText":
			case "textContent": return;
			default: if (!(2 < key.length) || "o" !== key[0] && "O" !== key[0] || "n" !== key[1] && "N" !== key[1]) key = aliases.get(key) || key, setValueForAttribute(domElement, key, value);
			else return;
		}
		viewTransitionMutationContext = !0;
	}
	function setPropOnCustomElement(domElement, tag, key, value, props, prevValue) {
		switch (key) {
			case "style":
				setValueForStyles(domElement, value, prevValue);
				return;
			case "dangerouslySetInnerHTML":
				if (null != value) {
					if ("object" !== typeof value || !("__html" in value)) throw Error(formatProdErrorMessage(61));
					key = value.__html;
					if (null != key) {
						if (null != props.children) throw Error(formatProdErrorMessage(60));
						(null != prevValue ? prevValue.__html : void 0) !== key && (domElement.innerHTML = key);
					}
				}
				break;
			case "children":
				if ("string" === typeof value) setTextContent(domElement, value);
				else if ("number" === typeof value || "bigint" === typeof value) setTextContent(domElement, "" + value);
				else return;
				break;
			case "onScroll":
				null != value && listenToNonDelegatedEvent("scroll", domElement);
				return;
			case "onScrollEnd":
				null != value && listenToNonDelegatedEvent("scrollend", domElement);
				return;
			case "onClick":
				null != value && (domElement.onclick = noop$1);
				return;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": return;
			case "innerText":
			case "textContent": return;
			default:
				if (!registrationNameDependencies.hasOwnProperty(key)) a: {
					if ("o" === key[0] && "n" === key[1] && (props = key.endsWith("Capture"), prevValue = key.slice(2, props ? key.length - 7 : void 0), tag = domElement[internalPropsKey] || null, tag = null != tag ? tag[key] : null, "function" === typeof tag && domElement.removeEventListener(prevValue, tag, props), "function" === typeof value)) {
						"function" !== typeof tag && null !== tag && (key in domElement ? domElement[key] = null : domElement.hasAttribute(key) && domElement.removeAttribute(key));
						domElement.addEventListener(prevValue, value, props);
						break a;
					}
					viewTransitionMutationContext = !0;
					key in domElement ? domElement[key] = value : !0 === value ? domElement.setAttribute(key, "") : setValueForAttribute(domElement, key, value);
				}
				return;
		}
		viewTransitionMutationContext = !0;
	}
	function setInitialProperties(domElement, tag, props) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				var hasSrc = !1, hasSrcSet = !1, propKey;
				for (propKey in props) if (props.hasOwnProperty(propKey)) {
					var propValue = props[propKey];
					if (null != propValue) switch (propKey) {
						case "src":
							hasSrc = !0;
							break;
						case "srcSet":
							hasSrcSet = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
						default: setProp(domElement, tag, propKey, propValue, props, null);
					}
				}
				hasSrcSet && setProp(domElement, tag, "srcSet", props.srcSet, props, null);
				hasSrc && setProp(domElement, tag, "src", props.src, props, null);
				return;
			case "input":
				listenToNonDelegatedEvent("invalid", domElement);
				var defaultValue = propKey = propValue = hasSrcSet = null, checked = null, defaultChecked = null;
				for (hasSrc in props) if (props.hasOwnProperty(hasSrc)) {
					var propValue$204 = props[hasSrc];
					if (null != propValue$204) switch (hasSrc) {
						case "name":
							hasSrcSet = propValue$204;
							break;
						case "type":
							propValue = propValue$204;
							break;
						case "checked":
							checked = propValue$204;
							break;
						case "defaultChecked":
							defaultChecked = propValue$204;
							break;
						case "value":
							propKey = propValue$204;
							break;
						case "defaultValue":
							defaultValue = propValue$204;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propValue$204) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: setProp(domElement, tag, hasSrc, propValue$204, props, null);
					}
				}
				initInput(domElement, propKey, defaultValue, checked, defaultChecked, propValue, hasSrcSet, !1);
				return;
			case "select":
				listenToNonDelegatedEvent("invalid", domElement);
				hasSrc = propValue = propKey = null;
				for (hasSrcSet in props) if (props.hasOwnProperty(hasSrcSet) && (defaultValue = props[hasSrcSet], null != defaultValue)) switch (hasSrcSet) {
					case "value":
						propKey = defaultValue;
						break;
					case "defaultValue":
						propValue = defaultValue;
						break;
					case "multiple": hasSrc = defaultValue;
					default: setProp(domElement, tag, hasSrcSet, defaultValue, props, null);
				}
				tag = propKey;
				props = propValue;
				domElement.multiple = !!hasSrc;
				null != tag ? updateOptions(domElement, !!hasSrc, tag, !1) : null != props && updateOptions(domElement, !!hasSrc, props, !0);
				return;
			case "textarea":
				listenToNonDelegatedEvent("invalid", domElement);
				propKey = hasSrcSet = hasSrc = null;
				for (propValue in props) if (props.hasOwnProperty(propValue) && (defaultValue = props[propValue], null != defaultValue)) switch (propValue) {
					case "value":
						hasSrc = defaultValue;
						break;
					case "defaultValue":
						hasSrcSet = defaultValue;
						break;
					case "children":
						propKey = defaultValue;
						break;
					case "dangerouslySetInnerHTML":
						if (null != defaultValue) throw Error(formatProdErrorMessage(91));
						break;
					default: setProp(domElement, tag, propValue, defaultValue, props, null);
				}
				initTextarea(domElement, hasSrc, hasSrcSet, propKey);
				return;
			case "option":
				for (checked in props) if (props.hasOwnProperty(checked) && (hasSrc = props[checked], null != hasSrc)) switch (checked) {
					case "selected":
						domElement.selected = hasSrc && "function" !== typeof hasSrc && "symbol" !== typeof hasSrc;
						break;
					default: setProp(domElement, tag, checked, hasSrc, props, null);
				}
				return;
			case "dialog":
				listenToNonDelegatedEvent("beforetoggle", domElement);
				listenToNonDelegatedEvent("toggle", domElement);
				listenToNonDelegatedEvent("cancel", domElement);
				listenToNonDelegatedEvent("close", domElement);
				break;
			case "iframe":
			case "object":
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "video":
			case "audio":
				for (hasSrc = 0; hasSrc < mediaEventTypes.length; hasSrc++) listenToNonDelegatedEvent(mediaEventTypes[hasSrc], domElement);
				break;
			case "image":
				listenToNonDelegatedEvent("error", domElement);
				listenToNonDelegatedEvent("load", domElement);
				break;
			case "details":
				listenToNonDelegatedEvent("toggle", domElement);
				break;
			case "embed":
			case "source":
			case "link": listenToNonDelegatedEvent("error", domElement), listenToNonDelegatedEvent("load", domElement);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (defaultChecked in props) if (props.hasOwnProperty(defaultChecked) && (hasSrc = props[defaultChecked], null != hasSrc)) switch (defaultChecked) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(formatProdErrorMessage(137, tag));
					default: setProp(domElement, tag, defaultChecked, hasSrc, props, null);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (propValue$204 in props) props.hasOwnProperty(propValue$204) && (hasSrc = props[propValue$204], void 0 !== hasSrc && setPropOnCustomElement(domElement, tag, propValue$204, hasSrc, props, void 0));
				return;
			}
		}
		for (defaultValue in props) props.hasOwnProperty(defaultValue) && (hasSrc = props[defaultValue], null != hasSrc && setProp(domElement, tag, defaultValue, hasSrc, props, null));
	}
	var emptyProps = {};
	function updateProperties(domElement, tag, lastProps, nextProps) {
		switch (tag) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var name = null, type = null, value = null, defaultValue = null, lastDefaultValue = null, checked = null, defaultChecked = null;
				for (propKey in lastProps) {
					var lastProp = lastProps[propKey];
					if (lastProps.hasOwnProperty(propKey) && null != lastProp) switch (propKey) {
						case "checked": break;
						case "value": break;
						case "defaultValue": lastDefaultValue = lastProp;
						default: nextProps.hasOwnProperty(propKey) || setProp(domElement, tag, propKey, null, nextProps, lastProp);
					}
				}
				for (var propKey$221 in nextProps) {
					var propKey = nextProps[propKey$221];
					lastProp = lastProps[propKey$221];
					if (nextProps.hasOwnProperty(propKey$221) && (null != propKey || null != lastProp)) switch (propKey$221) {
						case "type":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							type = propKey;
							break;
						case "name":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							name = propKey;
							break;
						case "checked":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							checked = propKey;
							break;
						case "defaultChecked":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							defaultChecked = propKey;
							break;
						case "value":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							value = propKey;
							break;
						case "defaultValue":
							propKey !== lastProp && (viewTransitionMutationContext = !0);
							defaultValue = propKey;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (null != propKey) throw Error(formatProdErrorMessage(137, tag));
							break;
						default: propKey !== lastProp && setProp(domElement, tag, propKey$221, propKey, nextProps, lastProp);
					}
				}
				updateInput(domElement, value, defaultValue, lastDefaultValue, checked, defaultChecked, type, name);
				return;
			case "select":
				propKey = value = defaultValue = propKey$221 = null;
				for (type in lastProps) if (lastDefaultValue = lastProps[type], lastProps.hasOwnProperty(type) && null != lastDefaultValue) switch (type) {
					case "value": break;
					case "multiple": propKey = lastDefaultValue;
					default: nextProps.hasOwnProperty(type) || setProp(domElement, tag, type, null, nextProps, lastDefaultValue);
				}
				for (name in nextProps) if (type = nextProps[name], lastDefaultValue = lastProps[name], nextProps.hasOwnProperty(name) && (null != type || null != lastDefaultValue)) switch (name) {
					case "value":
						type !== lastDefaultValue && (viewTransitionMutationContext = !0);
						propKey$221 = type;
						break;
					case "defaultValue":
						type !== lastDefaultValue && (viewTransitionMutationContext = !0);
						defaultValue = type;
						break;
					case "multiple": type !== lastDefaultValue && (viewTransitionMutationContext = !0), value = type;
					default: type !== lastDefaultValue && setProp(domElement, tag, name, type, nextProps, lastDefaultValue);
				}
				tag = defaultValue;
				lastProps = value;
				nextProps = propKey;
				null != propKey$221 ? updateOptions(domElement, !!lastProps, propKey$221, !1) : !!nextProps !== !!lastProps && (null != tag ? updateOptions(domElement, !!lastProps, tag, !0) : updateOptions(domElement, !!lastProps, lastProps ? [] : "", !1));
				return;
			case "textarea":
				propKey = propKey$221 = null;
				for (defaultValue in lastProps) if (name = lastProps[defaultValue], lastProps.hasOwnProperty(defaultValue) && null != name && !nextProps.hasOwnProperty(defaultValue)) switch (defaultValue) {
					case "value": break;
					case "children": break;
					default: setProp(domElement, tag, defaultValue, null, nextProps, name);
				}
				for (value in nextProps) if (name = nextProps[value], type = lastProps[value], nextProps.hasOwnProperty(value) && (null != name || null != type)) switch (value) {
					case "value":
						name !== type && (viewTransitionMutationContext = !0);
						propKey$221 = name;
						break;
					case "defaultValue":
						name !== type && (viewTransitionMutationContext = !0);
						propKey = name;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (null != name) throw Error(formatProdErrorMessage(91));
						break;
					default: name !== type && setProp(domElement, tag, value, name, nextProps, type);
				}
				updateTextarea(domElement, propKey$221, propKey);
				return;
			case "option":
				for (var propKey$237 in lastProps) if (propKey$221 = lastProps[propKey$237], lastProps.hasOwnProperty(propKey$237) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$237)) switch (propKey$237) {
					case "selected":
						domElement.selected = !1;
						break;
					default: setProp(domElement, tag, propKey$237, null, nextProps, propKey$221);
				}
				for (lastDefaultValue in nextProps) if (propKey$221 = nextProps[lastDefaultValue], propKey = lastProps[lastDefaultValue], nextProps.hasOwnProperty(lastDefaultValue) && propKey$221 !== propKey && (null != propKey$221 || null != propKey)) switch (lastDefaultValue) {
					case "selected":
						propKey$221 !== propKey && (viewTransitionMutationContext = !0);
						domElement.selected = propKey$221 && "function" !== typeof propKey$221 && "symbol" !== typeof propKey$221;
						break;
					default: setProp(domElement, tag, lastDefaultValue, propKey$221, nextProps, propKey);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var propKey$242 in lastProps) propKey$221 = lastProps[propKey$242], lastProps.hasOwnProperty(propKey$242) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$242) && setProp(domElement, tag, propKey$242, null, nextProps, propKey$221);
				for (checked in nextProps) if (propKey$221 = nextProps[checked], propKey = lastProps[checked], nextProps.hasOwnProperty(checked) && propKey$221 !== propKey && (null != propKey$221 || null != propKey)) switch (checked) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (null != propKey$221) throw Error(formatProdErrorMessage(137, tag));
						break;
					default: setProp(domElement, tag, checked, propKey$221, nextProps, propKey);
				}
				return;
			default: if (isCustomElement(tag)) {
				for (var propKey$247 in lastProps) propKey$221 = lastProps[propKey$247], lastProps.hasOwnProperty(propKey$247) && void 0 !== propKey$221 && !nextProps.hasOwnProperty(propKey$247) && setPropOnCustomElement(domElement, tag, propKey$247, void 0, nextProps, propKey$221);
				for (defaultChecked in nextProps) propKey$221 = nextProps[defaultChecked], propKey = lastProps[defaultChecked], !nextProps.hasOwnProperty(defaultChecked) || propKey$221 === propKey || void 0 === propKey$221 && void 0 === propKey || setPropOnCustomElement(domElement, tag, defaultChecked, propKey$221, nextProps, propKey);
				return;
			}
		}
		for (var propKey$252 in lastProps) propKey$221 = lastProps[propKey$252], lastProps.hasOwnProperty(propKey$252) && null != propKey$221 && !nextProps.hasOwnProperty(propKey$252) && setProp(domElement, tag, propKey$252, null, nextProps, propKey$221);
		for (lastProp in nextProps) propKey$221 = nextProps[lastProp], propKey = lastProps[lastProp], !nextProps.hasOwnProperty(lastProp) || propKey$221 === propKey || null == propKey$221 && null == propKey || setProp(domElement, tag, lastProp, propKey$221, nextProps, propKey);
	}
	function isLikelyStaticResource(initiatorType) {
		switch (initiatorType) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function estimateBandwidth() {
		if ("function" === typeof performance.getEntriesByType) {
			for (var count = 0, bits = 0, resourceEntries = performance.getEntriesByType("resource"), i = 0; i < resourceEntries.length; i++) {
				var entry = resourceEntries[i], transferSize = entry.transferSize, initiatorType = entry.initiatorType, duration = entry.duration;
				if (transferSize && duration && isLikelyStaticResource(initiatorType)) {
					initiatorType = 0;
					duration = entry.responseEnd;
					for (i += 1; i < resourceEntries.length; i++) {
						var overlapEntry = resourceEntries[i], overlapStartTime = overlapEntry.startTime;
						if (overlapStartTime > duration) break;
						var overlapTransferSize = overlapEntry.transferSize, overlapInitiatorType = overlapEntry.initiatorType;
						overlapTransferSize && isLikelyStaticResource(overlapInitiatorType) && (overlapEntry = overlapEntry.responseEnd, initiatorType += overlapTransferSize * (overlapEntry < duration ? 1 : (duration - overlapStartTime) / (overlapEntry - overlapStartTime)));
					}
					--i;
					bits += 8 * (transferSize + initiatorType) / (entry.duration / 1e3);
					count++;
					if (10 < count) break;
				}
			}
			if (0 < count) return bits / count / 1e6;
		}
		return navigator.connection && (count = navigator.connection.downlink, "number" === typeof count) ? count : 5;
	}
	var eventsEnabled = null;
	var selectionInformation = null;
	function getOwnerDocumentFromRootContainer(rootContainerElement) {
		return 9 === rootContainerElement.nodeType ? rootContainerElement : rootContainerElement.ownerDocument;
	}
	function getOwnHostContext(namespaceURI) {
		switch (namespaceURI) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function getChildHostContextProd(parentNamespace, type) {
		if (0 === parentNamespace) switch (type) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return 1 === parentNamespace && "foreignObject" === type ? 0 : parentNamespace;
	}
	function createHoistableInstance(type, props, rootContainerInstance, internalInstanceHandle) {
		rootContainerInstance = getOwnerDocumentFromRootContainer(rootContainerInstance).createElement(type);
		rootContainerInstance[internalInstanceKey] = internalInstanceHandle;
		rootContainerInstance[internalPropsKey] = props;
		setInitialProperties(rootContainerInstance, type, props);
		markNodeAsHoistable(rootContainerInstance);
		return rootContainerInstance;
	}
	function shouldSetTextContent(type, props) {
		return "textarea" === type || "noscript" === type || "string" === typeof props.children || "number" === typeof props.children || "bigint" === typeof props.children || "object" === typeof props.dangerouslySetInnerHTML && null !== props.dangerouslySetInnerHTML && null != props.dangerouslySetInnerHTML.__html;
	}
	var currentPopstateTransitionEvent = null;
	function shouldAttemptEagerTransition() {
		var event = window.event;
		if (event && "popstate" === event.type) {
			if (event === currentPopstateTransitionEvent) return !1;
			currentPopstateTransitionEvent = event;
			return !0;
		}
		currentPopstateTransitionEvent = null;
		return !1;
	}
	var scheduleTimeout = "function" === typeof setTimeout ? setTimeout : void 0;
	var cancelTimeout = "function" === typeof clearTimeout ? clearTimeout : void 0;
	var localPromise = "function" === typeof Promise ? Promise : void 0;
	var localRequestAnimationFrame = "function" === typeof requestAnimationFrame ? requestAnimationFrame : scheduleTimeout;
	var scheduleMicrotask = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof localPromise ? function(callback) {
		return localPromise.resolve(null).then(callback).catch(handleErrorInNextTick);
	} : scheduleTimeout;
	function handleErrorInNextTick(error) {
		setTimeout(function() {
			throw error;
		});
	}
	function isSingletonScope(type) {
		return "head" === type;
	}
	function clearHydrationBoundary(parentInstance, hydrationInstance) {
		var node = hydrationInstance, depth = 0;
		do {
			var nextNode = node.nextSibling;
			parentInstance.removeChild(node);
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node || "/&" === node) {
				if (0 === depth) {
					parentInstance.removeChild(nextNode);
					retryIfBlockedOn(hydrationInstance);
					return;
				}
				depth--;
			} else if ("$" === node || "$?" === node || "$~" === node || "$!" === node || "&" === node) depth++;
			else if ("html" === node) clearSingletonPreambleContribution(parentInstance.ownerDocument.documentElement);
			else if ("head" === node) {
				node = parentInstance.ownerDocument.head;
				clearSingletonPreambleContribution(node);
				for (var node$jscomp$0 = node.firstChild; node$jscomp$0;) {
					var nextNode$jscomp$0 = node$jscomp$0.nextSibling, nodeName = node$jscomp$0.nodeName;
					node$jscomp$0[internalHoistableMarker] || "SCRIPT" === nodeName || "STYLE" === nodeName || "LINK" === nodeName && "stylesheet" === node$jscomp$0.rel.toLowerCase() || node.removeChild(node$jscomp$0);
					node$jscomp$0 = nextNode$jscomp$0;
				}
			} else "body" === node && clearSingletonPreambleContribution(parentInstance.ownerDocument.body);
			node = nextNode;
		} while (node);
		retryIfBlockedOn(hydrationInstance);
	}
	function hideOrUnhideDehydratedBoundary(suspenseInstance, isHidden) {
		var node = suspenseInstance;
		suspenseInstance = 0;
		do {
			var nextNode = node.nextSibling;
			1 === node.nodeType ? isHidden ? (node._stashedDisplay = node.style.display, node.style.display = "none") : (node.style.display = node._stashedDisplay || "", "" === node.getAttribute("style") && node.removeAttribute("style")) : 3 === node.nodeType && (isHidden ? (node._stashedText = node.nodeValue, node.nodeValue = "") : node.nodeValue = node._stashedText || "");
			if (nextNode && 8 === nextNode.nodeType) if (node = nextNode.data, "/$" === node) if (0 === suspenseInstance) break;
			else suspenseInstance--;
			else "$" !== node && "$?" !== node && "$~" !== node && "$!" !== node || suspenseInstance++;
			node = nextNode;
		} while (node);
	}
	function applyViewTransitionName(instance, name, className) {
		name = CSS.escape(name) !== name ? "r-" + btoa(name).replace(/=/g, "") : name;
		instance.style.viewTransitionName = name;
		null != className && (instance.style.viewTransitionClass = className);
		className = getComputedStyle(instance);
		if ("inline" === className.display) {
			name = instance.getClientRects();
			if (1 === name.length) var JSCompiler_inline_result = 1;
			else for (var i = JSCompiler_inline_result = 0; i < name.length; i++) {
				var rect = name[i];
				0 < rect.width && 0 < rect.height && JSCompiler_inline_result++;
			}
			1 === JSCompiler_inline_result && (instance = instance.style, instance.display = 1 === name.length ? "inline-block" : "block", instance.marginTop = "-" + className.paddingTop, instance.marginBottom = "-" + className.paddingBottom);
		}
	}
	function restoreViewTransitionName(instance, props) {
		instance = instance.style;
		props = props.style;
		var viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionName") ? props.viewTransitionName : props.hasOwnProperty("view-transition-name") ? props["view-transition-name"] : null : null;
		instance.viewTransitionName = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
		viewTransitionName = null != props ? props.hasOwnProperty("viewTransitionClass") ? props.viewTransitionClass : props.hasOwnProperty("view-transition-class") ? props["view-transition-class"] : null : null;
		instance.viewTransitionClass = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : ("" + viewTransitionName).trim();
		"inline-block" === instance.display && (null == props ? instance.display = instance.margin = "" : (viewTransitionName = props.display, instance.display = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, viewTransitionName = props.margin, null != viewTransitionName ? instance.margin = viewTransitionName : (viewTransitionName = props.hasOwnProperty("marginTop") ? props.marginTop : props["margin-top"], instance.marginTop = null == viewTransitionName || "boolean" === typeof viewTransitionName ? "" : viewTransitionName, props = props.hasOwnProperty("marginBottom") ? props.marginBottom : props["margin-bottom"], instance.marginBottom = null == props || "boolean" === typeof props ? "" : props)));
	}
	function createMeasurement(rect, computedStyle, element) {
		element = element.ownerDocument.defaultView;
		return {
			rect,
			abs: "absolute" === computedStyle.position || "fixed" === computedStyle.position,
			clip: "none" !== computedStyle.clipPath || "visible" !== computedStyle.overflow || "none" !== computedStyle.filter || "none" !== computedStyle.mask || "none" !== computedStyle.mask || "0px" !== computedStyle.borderRadius,
			view: 0 <= rect.bottom && 0 <= rect.right && rect.top <= element.innerHeight && rect.left <= element.innerWidth
		};
	}
	function measureInstance(instance) {
		return createMeasurement(instance.getBoundingClientRect(), getComputedStyle(instance), instance);
	}
	function measureClonedInstance(instance) {
		var measuredRect = instance.getBoundingClientRect();
		measuredRect = new DOMRect(measuredRect.x + 2e4, measuredRect.y + 2e4, measuredRect.width, measuredRect.height);
		var computedStyle = getComputedStyle(instance);
		return createMeasurement(measuredRect, computedStyle, instance);
	}
	function forceLayout(ownerDocument) {
		return ownerDocument.documentElement.clientHeight;
	}
	function waitForImageToLoad(resolve) {
		this.addEventListener("load", resolve);
		this.addEventListener("error", resolve);
	}
	function startViewTransition(suspendedState, rootContainer, transitionTypes, mutationCallback, layoutCallback, afterMutationCallback, spawnedWorkCallback, passiveCallback, errorCallback) {
		var ownerDocument = 9 === rootContainer.nodeType ? rootContainer : rootContainer.ownerDocument;
		try {
			var transition = ownerDocument.startViewTransition({
				update: function() {
					var ownerWindow = ownerDocument.defaultView, pendingNavigation = ownerWindow.navigation && ownerWindow.navigation.transition, previousFontLoadingStatus = ownerDocument.fonts.status;
					mutationCallback();
					var blockingPromises = [];
					"loaded" === previousFontLoadingStatus && (forceLayout(ownerDocument), "loading" === ownerDocument.fonts.status && blockingPromises.push(ownerDocument.fonts.ready));
					previousFontLoadingStatus = blockingPromises.length;
					if (null !== suspendedState) for (var suspenseyImages = suspendedState.suspenseyImages, imgBytes = 0, i = 0; i < suspenseyImages.length; i++) {
						var suspenseyImage = suspenseyImages[i];
						if (!suspenseyImage.complete) {
							var rect = suspenseyImage.getBoundingClientRect();
							if (0 < rect.bottom && 0 < rect.right && rect.top < ownerWindow.innerHeight && rect.left < ownerWindow.innerWidth) {
								imgBytes += estimateImageBytes(suspenseyImage);
								if (imgBytes > estimatedBytesWithinLimit) {
									blockingPromises.length = previousFontLoadingStatus;
									break;
								}
								suspenseyImage = new Promise(waitForImageToLoad.bind(suspenseyImage));
								blockingPromises.push(suspenseyImage);
							}
						}
					}
					if (0 < blockingPromises.length) return ownerWindow = Promise.race([Promise.all(blockingPromises), new Promise(function(resolve) {
						return setTimeout(resolve, 500);
					})]).then(layoutCallback, layoutCallback), (pendingNavigation ? Promise.allSettled([pendingNavigation.finished, ownerWindow]) : ownerWindow).then(afterMutationCallback, afterMutationCallback);
					layoutCallback();
					if (pendingNavigation) return pendingNavigation.finished.then(afterMutationCallback, afterMutationCallback);
					afterMutationCallback();
				},
				types: transitionTypes
			});
			ownerDocument.__reactViewTransition = transition;
			var viewTransitionAnimations = [];
			transition.ready.then(function() {
				for (var animations = ownerDocument.documentElement.getAnimations({ subtree: !0 }), i = 0; i < animations.length; i++) {
					var animation = animations[i], effect = animation.effect, pseudoElement = effect.pseudoElement;
					if (null != pseudoElement && pseudoElement.startsWith("::view-transition")) {
						viewTransitionAnimations.push(animation);
						animation = effect.getKeyframes();
						for (var height = pseudoElement = void 0, unchangedDimensions = !0, j = 0; j < animation.length; j++) {
							var keyframe = animation[j], w = keyframe.width;
							if (void 0 === pseudoElement) pseudoElement = w;
							else if (pseudoElement !== w) {
								unchangedDimensions = !1;
								break;
							}
							w = keyframe.height;
							if (void 0 === height) height = w;
							else if (height !== w) {
								unchangedDimensions = !1;
								break;
							}
							delete keyframe.width;
							delete keyframe.height;
							"none" === keyframe.transform && delete keyframe.transform;
						}
						unchangedDimensions && void 0 !== pseudoElement && void 0 !== height && (effect.setKeyframes(animation), unchangedDimensions = getComputedStyle(effect.target, effect.pseudoElement), unchangedDimensions.width !== pseudoElement || unchangedDimensions.height !== height) && (unchangedDimensions = animation[0], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, unchangedDimensions = animation[animation.length - 1], unchangedDimensions.width = pseudoElement, unchangedDimensions.height = height, effect.setKeyframes(animation));
					}
				}
				spawnedWorkCallback();
			}, function(error) {
				ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
				try {
					if ("object" === typeof error && null !== error) switch (error.name) {
						case "InvalidStateError": if ("View transition was skipped because document visibility state is hidden." === error.message || "Skipping view transition because document visibility state has become hidden." === error.message || "Skipping view transition because viewport size changed." === error.message || "Transition was aborted because of invalid state" === error.message) error = null;
					}
					null !== error && errorCallback(error);
				} finally {
					mutationCallback(), layoutCallback(), spawnedWorkCallback();
				}
			});
			transition.finished.finally(function() {
				for (var i = 0; i < viewTransitionAnimations.length; i++) viewTransitionAnimations[i].cancel();
				ownerDocument.__reactViewTransition === transition && (ownerDocument.__reactViewTransition = null);
				passiveCallback();
			});
			return transition;
		} catch (x) {
			return mutationCallback(), layoutCallback(), spawnedWorkCallback(), null;
		}
	}
	function ViewTransitionPseudoElement(pseudo, name) {
		this._scope = document.documentElement;
		this._selector = "::view-transition-" + pseudo + "(" + name + ")";
	}
	ViewTransitionPseudoElement.prototype.animate = function(keyframes, options) {
		options = "number" === typeof options ? { duration: options } : assign({}, options);
		options.pseudoElement = this._selector;
		return this._scope.animate(keyframes, options);
	};
	ViewTransitionPseudoElement.prototype.getAnimations = function() {
		for (var scope = this._scope, selector = this._selector, animations = scope.getAnimations({ subtree: !0 }), result = [], i = 0; i < animations.length; i++) {
			var effect = animations[i].effect;
			null !== effect && effect.target === scope && effect.pseudoElement === selector && result.push(animations[i]);
		}
		return result;
	};
	ViewTransitionPseudoElement.prototype.getComputedStyle = function() {
		return getComputedStyle(this._scope, this._selector);
	};
	function createViewTransitionInstance(name) {
		return {
			name,
			group: new ViewTransitionPseudoElement("group", name),
			imagePair: new ViewTransitionPseudoElement("image-pair", name),
			old: new ViewTransitionPseudoElement("old", name),
			new: new ViewTransitionPseudoElement("new", name)
		};
	}
	function FragmentInstance(fragmentFiber) {
		this._fragmentFiber = fragmentFiber;
		this._observers = this._eventListeners = null;
	}
	FragmentInstance.prototype.addEventListener = function(type, listener, optionsOrUseCapture) {
		var signal = null, cleanup = null;
		if (null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && (signal = optionsOrUseCapture.signal || null, null !== signal && signal.aborted)) return;
		null === this._eventListeners && (this._eventListeners = []);
		var listeners = this._eventListeners;
		if (-1 === indexOfEventListener(listeners, type, listener, optionsOrUseCapture)) {
			var fragmentInstance = this, attachedListener = listener;
			null != optionsOrUseCapture && "boolean" !== typeof optionsOrUseCapture && !0 === optionsOrUseCapture.once && (attachedListener = function(event) {
				fragmentInstance.removeEventListener(type, listener, optionsOrUseCapture);
				"function" === typeof listener ? listener.call(this, event) : listener.handleEvent(event);
			});
			null !== signal && (cleanup = fragmentInstance.removeEventListener.bind(fragmentInstance, type, listener, optionsOrUseCapture), signal.addEventListener("abort", cleanup, { once: !0 }), cleanup = signal.removeEventListener.bind(signal, "abort", cleanup));
			signal = getAttachOptions(optionsOrUseCapture);
			listeners.push({
				type,
				listener,
				optionsOrUseCapture,
				attachedListener,
				cleanup
			});
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, addEventListenerToChild, type, attachedListener, signal);
		}
		this._eventListeners = listeners;
	};
	function addEventListenerToChild(child, type, listener, optionsOrUseCapture) {
		getInstanceFromHostFiber(child).addEventListener(type, listener, optionsOrUseCapture);
		return !1;
	}
	FragmentInstance.prototype.removeEventListener = function(type, listener, optionsOrUseCapture) {
		var listeners = this._eventListeners;
		if (null !== listeners && (listener = indexOfEventListener(listeners, type, listener, optionsOrUseCapture), -1 !== listener)) {
			var _listeners$index = listeners[listener];
			optionsOrUseCapture = _listeners$index.attachedListener;
			var cleanup = _listeners$index.cleanup;
			_listeners$index = getAttachOptions(_listeners$index.optionsOrUseCapture);
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, removeEventListenerFromChild, type, optionsOrUseCapture, _listeners$index);
			listeners.splice(listener, 1);
			null !== cleanup && cleanup();
		}
	};
	function removeEventListenerFromChild(child, type, listener, optionsOrUseCapture) {
		getInstanceFromHostFiber(child).removeEventListener(type, listener, optionsOrUseCapture);
		return !1;
	}
	function getAttachOptions(opts) {
		return null != opts && "boolean" !== typeof opts && (!0 === opts.once || opts.signal instanceof AbortSignal) ? {
			capture: opts.capture,
			passive: opts.passive
		} : opts;
	}
	function normalizeListenerOptions(opts) {
		return null == opts ? "c=0" : "boolean" === typeof opts ? "c=" + (opts ? "1" : "0") : "c=" + (opts.capture ? "1" : "0");
	}
	function indexOfEventListener(eventListeners, type, listener, optionsOrUseCapture) {
		if (0 === eventListeners.length) return -1;
		optionsOrUseCapture = normalizeListenerOptions(optionsOrUseCapture);
		for (var i = 0; i < eventListeners.length; i++) {
			var item = eventListeners[i];
			if (item.type === type && item.listener === listener && normalizeListenerOptions(item.optionsOrUseCapture) === optionsOrUseCapture) return i;
		}
		return -1;
	}
	FragmentInstance.prototype.dispatchEvent = function(event) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		if (null === parentHostFiber) return !0;
		parentHostFiber = getInstanceFromHostFiber(parentHostFiber);
		var eventListeners = this._eventListeners;
		if (null !== eventListeners && 0 < eventListeners.length || !event.bubbles) {
			var temp = 9 === parentHostFiber.nodeType ? parentHostFiber.createComment("") : document.createTextNode("");
			if (eventListeners) for (var i = 0; i < eventListeners.length; i++) {
				var _eventListeners$i = eventListeners[i];
				temp.addEventListener(_eventListeners$i.type, _eventListeners$i.attachedListener, getAttachOptions(_eventListeners$i.optionsOrUseCapture));
			}
			parentHostFiber.appendChild(temp);
			event = temp.dispatchEvent(event);
			if (eventListeners) for (i = 0; i < eventListeners.length; i++) _eventListeners$i = eventListeners[i], temp.removeEventListener(_eventListeners$i.type, _eventListeners$i.attachedListener, getAttachOptions(_eventListeners$i.optionsOrUseCapture));
			parentHostFiber.removeChild(temp);
			return event;
		}
		return parentHostFiber.dispatchEvent(event);
	};
	FragmentInstance.prototype.focus = function(focusOptions) {
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !0, setFocusOnFiberIfFocusable, focusOptions, void 0, void 0);
	};
	function setFocusOnFiberIfFocusable(fiber, focusOptions) {
		if (6 === fiber.tag) return !1;
		fiber = getInstanceFromHostFiber(fiber);
		return setFocusIfFocusable(fiber, focusOptions);
	}
	FragmentInstance.prototype.focusLast = function(focusOptions) {
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !0, collectChildren, children, void 0, void 0);
		for (var i = children.length - 1; 0 <= i && !setFocusOnFiberIfFocusable(children[i], focusOptions); i--);
	};
	function collectChildren(child, collection) {
		collection.push(child);
		return !1;
	}
	FragmentInstance.prototype.blur = function() {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		null !== parentHostFiber && (parentHostFiber = getInstanceFromHostFiber(parentHostFiber), parentHostFiber = getOwnerDocumentFromRootContainer(parentHostFiber).activeElement, null !== parentHostFiber && traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, blurActiveElementWithinFragment, parentHostFiber, void 0, void 0));
	};
	function blurActiveElementWithinFragment(child, activeElement) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		return child === activeElement || child.contains(activeElement) ? (activeElement.blur(), !0) : !1;
	}
	FragmentInstance.prototype.observeUsing = function(observer) {
		null === this._observers && (this._observers = /* @__PURE__ */ new Set());
		this._observers.add(observer);
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, observeChild, observer, void 0, void 0);
	};
	function observeChild(child, observer) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		observer.observe(child);
		return !1;
	}
	FragmentInstance.prototype.unobserveUsing = function(observer) {
		var observers = this._observers;
		if (null !== observers && observers.has(observer)) {
			observers.delete(observer);
			traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, unobserveChild, observer, void 0, void 0);
			for (var i = observers = 0; i < pendingIntersectionUnobserves.length; i++) {
				var pending = pendingIntersectionUnobserves[i];
				pending.fragmentInstance === this && pending.observer === observer ? observer.unobserve(pending.instance) : pendingIntersectionUnobserves[observers++] = pending;
			}
			pendingIntersectionUnobserves.length = observers;
		}
	};
	function unobserveChild(child, observer) {
		if (6 === child.tag) return !1;
		child = getInstanceFromHostFiber(child);
		observer.unobserve(child);
		return !1;
	}
	var pendingIntersectionUnobserves = [];
	var intersectionUnobserveScheduled = !1;
	function schedulePendingIntersectionUnobserve(fragmentInstance, observer, instance) {
		pendingIntersectionUnobserves.push({
			fragmentInstance,
			observer,
			instance
		});
		intersectionUnobserveScheduled || (intersectionUnobserveScheduled = !0, requestPostPaintCallback(function() {
			intersectionUnobserveScheduled = !1;
			var pending = pendingIntersectionUnobserves;
			pendingIntersectionUnobserves = [];
			for (var i = 0; i < pending.length; i++) {
				var item = pending[i];
				item.observer.unobserve(item.instance);
			}
		}));
	}
	FragmentInstance.prototype.getClientRects = function() {
		var rects = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectClientRects, rects, void 0, void 0);
		return rects;
	};
	function collectClientRects(child, rects) {
		if (6 === child.tag) {
			child = child.stateNode;
			var range = child.ownerDocument.createRange();
			range.selectNodeContents(child);
			rects.push.apply(rects, range.getClientRects());
		} else child = getInstanceFromHostFiber(child), rects.push.apply(rects, child.getClientRects());
		return !1;
	}
	FragmentInstance.prototype.getRootNode = function(getRootNodeOptions) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		return null === parentHostFiber ? this : getInstanceFromHostFiber(parentHostFiber).getRootNode(getRootNodeOptions);
	};
	FragmentInstance.prototype.compareDocumentPosition = function(otherNode) {
		var parentHostFiber = getFragmentParentInstanceOrContainerFiber(this._fragmentFiber);
		if (null === parentHostFiber) return Node.DOCUMENT_POSITION_DISCONNECTED;
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectChildren, children, void 0, void 0);
		var parentHostInstance = getInstanceFromHostFiber(parentHostFiber);
		if (0 === children.length) {
			children = parentHostInstance;
			if (fiberIsPortaledIntoHost(this._fragmentFiber)) {
				a: {
					for (parentHostFiber = this._fragmentFiber.return; null !== parentHostFiber;) {
						if (4 === parentHostFiber.tag) {
							parentHostFiber = parentHostFiber.stateNode.containerInfo;
							break a;
						}
						if (3 === parentHostFiber.tag || 5 === parentHostFiber.tag || 27 === parentHostFiber.tag) break;
						parentHostFiber = parentHostFiber.return;
					}
					parentHostFiber = null;
				}
				null != parentHostFiber && (children = parentHostFiber);
			}
			parentHostFiber = this._fragmentFiber;
			var result = parentHostInstance = children.compareDocumentPosition(otherNode);
			children === otherNode ? result = Node.DOCUMENT_POSITION_CONTAINS : parentHostInstance & Node.DOCUMENT_POSITION_CONTAINED_BY && (children = getFragmentInstanceOrTextInstanceSiblings(parentHostFiber)[1], null === children ? result = Node.DOCUMENT_POSITION_PRECEDING : (otherNode = getInstanceFromHostFiber(children).compareDocumentPosition(otherNode), result = 0 === otherNode || otherNode & Node.DOCUMENT_POSITION_FOLLOWING ? Node.DOCUMENT_POSITION_FOLLOWING : Node.DOCUMENT_POSITION_PRECEDING));
			return result |= Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
		}
		parentHostFiber = getInstanceFromHostFiber(children[0]);
		result = getInstanceFromHostFiber(children[children.length - 1]);
		var parentHostInstanceFromDOM = fiberIsPortaledIntoHost(this._fragmentFiber) ? parentHostFiber.parentElement : parentHostInstance;
		if (null == parentHostInstanceFromDOM) return Node.DOCUMENT_POSITION_DISCONNECTED;
		parentHostInstance = parentHostInstanceFromDOM.compareDocumentPosition(parentHostFiber) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		parentHostInstanceFromDOM = parentHostInstanceFromDOM.compareDocumentPosition(result) & Node.DOCUMENT_POSITION_CONTAINED_BY;
		var firstResult = parentHostFiber.compareDocumentPosition(otherNode), lastResult = result.compareDocumentPosition(otherNode), otherNodeIsWithinFirstOrLastChild = firstResult & Node.DOCUMENT_POSITION_CONTAINED_BY || lastResult & Node.DOCUMENT_POSITION_CONTAINED_BY;
		lastResult = parentHostInstance && parentHostInstanceFromDOM && firstResult & Node.DOCUMENT_POSITION_FOLLOWING && lastResult & Node.DOCUMENT_POSITION_PRECEDING;
		parentHostFiber = parentHostInstance && parentHostFiber === otherNode || parentHostInstanceFromDOM && result === otherNode || otherNodeIsWithinFirstOrLastChild || lastResult ? Node.DOCUMENT_POSITION_CONTAINED_BY : !parentHostInstance && parentHostFiber === otherNode || !parentHostInstanceFromDOM && result === otherNode ? Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC : firstResult;
		return parentHostFiber & Node.DOCUMENT_POSITION_DISCONNECTED || parentHostFiber & Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC || validateDocumentPositionWithFiberTree(parentHostFiber, this._fragmentFiber, children[0], children[children.length - 1], otherNode) ? parentHostFiber : Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;
	};
	function validateDocumentPositionWithFiberTree(documentPosition, fragmentFiber, precedingBoundaryFiber, followingBoundaryFiber, otherNode) {
		var otherFiber = getClosestInstanceFromNode(otherNode);
		if (documentPosition & Node.DOCUMENT_POSITION_CONTAINED_BY) {
			if (precedingBoundaryFiber = !!otherFiber) a: {
				for (; null !== otherFiber;) {
					if (7 === otherFiber.tag && (otherFiber === fragmentFiber || otherFiber.alternate === fragmentFiber)) {
						precedingBoundaryFiber = !0;
						break a;
					}
					otherFiber = otherFiber.return;
				}
				precedingBoundaryFiber = !1;
			}
			return precedingBoundaryFiber;
		}
		if (documentPosition & Node.DOCUMENT_POSITION_CONTAINS) {
			if (null === otherFiber) return otherFiber = otherNode.ownerDocument, otherNode === otherFiber || otherNode === otherFiber.documentElement || otherNode === otherFiber.body;
			a: {
				otherFiber = fragmentFiber;
				for (fragmentFiber = getFragmentParentInstanceOrContainerFiber(fragmentFiber); null !== otherFiber;) {
					if (!(5 !== otherFiber.tag && 3 !== otherFiber.tag && 27 !== otherFiber.tag || otherFiber !== fragmentFiber && otherFiber.alternate !== fragmentFiber)) {
						otherFiber = !0;
						break a;
					}
					otherFiber = otherFiber.return;
				}
				otherFiber = !1;
			}
			return otherFiber;
		}
		return documentPosition & Node.DOCUMENT_POSITION_PRECEDING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === precedingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(precedingBoundaryFiber, otherFiber, getParentForFragmentAncestors), null === fragmentFiber ? fragmentFiber = !1 : (traverseVisibleInstancesAndTextInstances(fragmentFiber, !0, isFiberPrecedingCheck, otherFiber, precedingBoundaryFiber), otherFiber = searchTarget, searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? ((fragmentFiber = !!otherFiber) && !(fragmentFiber = otherFiber === followingBoundaryFiber) && (fragmentFiber = getLowestCommonAncestor(followingBoundaryFiber, otherFiber, getParentForFragmentAncestors), null === fragmentFiber ? fragmentFiber = !1 : (traverseVisibleInstancesAndTextInstances(fragmentFiber, !0, isFiberFollowingCheck, otherFiber, followingBoundaryFiber), otherFiber = searchTarget, searchBoundary = searchTarget = null, fragmentFiber = null !== otherFiber)), fragmentFiber) : !1;
	}
	function scrollTextNodeIntoView(textNode, resolvedAlignToTop) {
		var range = textNode.ownerDocument.createRange();
		range.selectNodeContents(textNode);
		textNode = range.getBoundingClientRect();
		window.scrollTo(window.scrollX + textNode.left, resolvedAlignToTop ? window.scrollY + textNode.top : window.scrollY + textNode.bottom - window.innerHeight);
	}
	FragmentInstance.prototype.scrollIntoView = function(alignToTop) {
		if ("object" === typeof alignToTop) throw Error(formatProdErrorMessage(566));
		var children = [];
		traverseVisibleInstancesAndTextInstances(this._fragmentFiber.child, !1, collectChildren, children, void 0, void 0);
		var resolvedAlignToTop = !1 !== alignToTop;
		if (0 === children.length) {
			var hostSiblings = getFragmentInstanceOrTextInstanceSiblings(this._fragmentFiber);
			hostSiblings = resolvedAlignToTop ? hostSiblings[1] || hostSiblings[0] || getFragmentParentInstanceOrContainerFiber(this._fragmentFiber) : hostSiblings[0] || hostSiblings[1];
			if (null === hostSiblings) return;
			if (6 === hostSiblings.tag) {
				alignToTop = getInstanceFromHostFiber(hostSiblings);
				scrollTextNodeIntoView(alignToTop, resolvedAlignToTop);
				return;
			}
			hostSiblings = getInstanceFromHostFiber(hostSiblings);
			if (9 !== hostSiblings.nodeType) {
				if (11 === hostSiblings.nodeType) {
					resolvedAlignToTop = "host" in hostSiblings ? hostSiblings.host : null;
					null !== resolvedAlignToTop && resolvedAlignToTop.scrollIntoView(alignToTop);
					return;
				}
				hostSiblings.scrollIntoView(alignToTop);
			}
		}
		for (hostSiblings = resolvedAlignToTop ? children.length - 1 : 0; hostSiblings !== (resolvedAlignToTop ? -1 : children.length);) {
			var child = children[hostSiblings];
			6 === child.tag ? (child = getInstanceFromHostFiber(child), scrollTextNodeIntoView(child, resolvedAlignToTop)) : getInstanceFromHostFiber(child).scrollIntoView(alignToTop);
			hostSiblings += resolvedAlignToTop ? -1 : 1;
		}
	};
	function addFragmentHandleToFiber(child, fragmentInstance) {
		child = getInstanceFromHostFiber(child);
		addFragmentHandleToInstance(child, fragmentInstance);
		return !1;
	}
	function addFragmentHandleToInstance(instance, fragmentInstance) {
		instance.reactFragments ??= /* @__PURE__ */ new Set();
		instance.reactFragments.add(fragmentInstance);
	}
	function commitNewChildToFragmentInstance(childInstance, fragmentInstance) {
		var eventListeners = fragmentInstance._eventListeners;
		if (null !== eventListeners) for (var i$jscomp$0 = 0; i$jscomp$0 < eventListeners.length; i$jscomp$0++) {
			var _eventListeners$i3 = eventListeners[i$jscomp$0];
			childInstance.addEventListener(_eventListeners$i3.type, _eventListeners$i3.attachedListener, getAttachOptions(_eventListeners$i3.optionsOrUseCapture));
		}
		3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
			for (var writeIdx = 0, i = 0; i < pendingIntersectionUnobserves.length; i++) {
				var pending = pendingIntersectionUnobserves[i];
				if (pending.fragmentInstance !== fragmentInstance || pending.observer !== observer || pending.instance !== childInstance) pendingIntersectionUnobserves[writeIdx++] = pending;
			}
			pendingIntersectionUnobserves.length = writeIdx;
			observer.observe(childInstance);
		}), addFragmentHandleToInstance(childInstance, fragmentInstance));
	}
	function deleteChildFromFragmentInstance(childInstance, fragmentInstance) {
		var eventListeners = fragmentInstance._eventListeners;
		if (null !== eventListeners) for (var i = 0; i < eventListeners.length; i++) {
			var _eventListeners$i4 = eventListeners[i];
			childInstance.removeEventListener(_eventListeners$i4.type, _eventListeners$i4.attachedListener, getAttachOptions(_eventListeners$i4.optionsOrUseCapture));
		}
		3 !== childInstance.nodeType && (eventListeners = fragmentInstance._observers, null !== eventListeners && eventListeners.forEach(function(observer) {
			"string" === typeof observer.rootMargin ? schedulePendingIntersectionUnobserve(fragmentInstance, observer, childInstance) : observer.unobserve(childInstance);
		}), null != childInstance.reactFragments && childInstance.reactFragments.delete(fragmentInstance));
	}
	function clearContainerSparingly(container) {
		var nextNode = container.firstChild;
		nextNode && 10 === nextNode.nodeType && (nextNode = nextNode.nextSibling);
		for (; nextNode;) {
			var node = nextNode;
			nextNode = nextNode.nextSibling;
			switch (node.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					clearContainerSparingly(node);
					detachDeletedInstance(node);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if ("stylesheet" === node.rel.toLowerCase()) continue;
			}
			container.removeChild(node);
		}
	}
	function canHydrateInstance(instance, type, props, inRootOrSingleton) {
		for (; 1 === instance.nodeType;) {
			var anyProps = props;
			if (instance.nodeName.toLowerCase() !== type.toLowerCase()) {
				if (!inRootOrSingleton && ("INPUT" !== instance.nodeName || "hidden" !== instance.type)) break;
			} else if (!inRootOrSingleton) if ("input" === type && "hidden" === instance.type) {
				var name = null == anyProps.name ? null : "" + anyProps.name;
				if ("hidden" === anyProps.type && instance.getAttribute("name") === name) return instance;
			} else return instance;
			else if (!instance[internalHoistableMarker]) switch (type) {
				case "meta":
					if (!instance.hasAttribute("itemprop")) break;
					return instance;
				case "link":
					name = instance.getAttribute("rel");
					if ("stylesheet" === name && instance.hasAttribute("data-precedence")) break;
					else if (name !== anyProps.rel || instance.getAttribute("href") !== (null == anyProps.href || "" === anyProps.href ? null : anyProps.href) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin) || instance.getAttribute("title") !== (null == anyProps.title ? null : anyProps.title)) break;
					return instance;
				case "style":
					if (instance.hasAttribute("data-precedence")) break;
					return instance;
				case "script":
					name = instance.getAttribute("src");
					if ((name !== (null == anyProps.src ? null : anyProps.src) || instance.getAttribute("type") !== (null == anyProps.type ? null : anyProps.type) || instance.getAttribute("crossorigin") !== (null == anyProps.crossOrigin ? null : anyProps.crossOrigin)) && name && instance.hasAttribute("async") && !instance.hasAttribute("itemprop")) break;
					return instance;
				default: return instance;
			}
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) break;
		}
		return null;
	}
	function canHydrateTextInstance(instance, text, inRootOrSingleton) {
		if ("" === text) return null;
		for (; 3 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function canHydrateHydrationBoundary(instance, inRootOrSingleton) {
		for (; 8 !== instance.nodeType;) {
			if ((1 !== instance.nodeType || "INPUT" !== instance.nodeName || "hidden" !== instance.type) && !inRootOrSingleton) return null;
			instance = getNextHydratable(instance.nextSibling);
			if (null === instance) return null;
		}
		return instance;
	}
	function isSuspenseInstancePending(instance) {
		return "$?" === instance.data || "$~" === instance.data;
	}
	function isSuspenseInstanceFallback(instance) {
		return "$!" === instance.data || "$?" === instance.data && "loading" !== instance.ownerDocument.readyState;
	}
	function registerSuspenseInstanceRetry(instance, callback) {
		var ownerDocument = instance.ownerDocument;
		if ("$~" === instance.data) instance._reactRetry = callback;
		else if ("$?" !== instance.data || "loading" !== ownerDocument.readyState) callback();
		else {
			var listener = function() {
				callback();
				ownerDocument.removeEventListener("DOMContentLoaded", listener);
			};
			ownerDocument.addEventListener("DOMContentLoaded", listener);
			instance._reactRetry = listener;
		}
	}
	function getNextHydratable(node) {
		for (; null != node; node = node.nextSibling) {
			var nodeType = node.nodeType;
			if (1 === nodeType || 3 === nodeType) break;
			if (8 === nodeType) {
				nodeType = node.data;
				if ("$" === nodeType || "$!" === nodeType || "$?" === nodeType || "$~" === nodeType || "&" === nodeType || "F!" === nodeType || "F" === nodeType) break;
				if ("/$" === nodeType || "/&" === nodeType) return null;
			}
		}
		return node;
	}
	var previousHydratableOnEnteringScopedSingleton = null;
	function getNextHydratableInstanceAfterHydrationBoundary(hydrationInstance) {
		hydrationInstance = hydrationInstance.nextSibling;
		for (var depth = 0; hydrationInstance;) {
			if (8 === hydrationInstance.nodeType) {
				var data = hydrationInstance.data;
				if ("/$" === data || "/&" === data) {
					if (0 === depth) return getNextHydratable(hydrationInstance.nextSibling);
					depth--;
				} else "$" !== data && "$!" !== data && "$?" !== data && "$~" !== data && "&" !== data || depth++;
			}
			hydrationInstance = hydrationInstance.nextSibling;
		}
		return null;
	}
	function getParentHydrationBoundary(targetInstance) {
		targetInstance = targetInstance.previousSibling;
		for (var depth = 0; targetInstance;) {
			if (8 === targetInstance.nodeType) {
				var data = targetInstance.data;
				if ("$" === data || "$!" === data || "$?" === data || "$~" === data || "&" === data) {
					if (0 === depth) return targetInstance;
					depth--;
				} else "/$" !== data && "/&" !== data || depth++;
			}
			targetInstance = targetInstance.previousSibling;
		}
		return null;
	}
	function setFocusIfFocusable(node, focusOptions) {
		function handleFocus() {
			didFocus = !0;
		}
		if (node.ownerDocument.activeElement === node) return !0;
		var didFocus = !1;
		try {
			node.ownerDocument.addEventListener("focus", handleFocus, !0), (node.focus || HTMLElement.prototype.focus).call(node, focusOptions);
		} finally {
			node.ownerDocument.removeEventListener("focus", handleFocus, !0);
		}
		return didFocus;
	}
	function requestPostPaintCallback(callback) {
		localRequestAnimationFrame(function() {
			localRequestAnimationFrame(function(time) {
				return callback(time);
			});
		});
	}
	function resolveSingletonInstance(type, props, rootContainerInstance) {
		props = getOwnerDocumentFromRootContainer(rootContainerInstance);
		switch (type) {
			case "html":
				type = props.documentElement;
				if (!type) throw Error(formatProdErrorMessage(452));
				return type;
			case "head":
				type = props.head;
				if (!type) throw Error(formatProdErrorMessage(453));
				return type;
			case "body":
				type = props.body;
				if (!type) throw Error(formatProdErrorMessage(454));
				return type;
			default: throw Error(formatProdErrorMessage(451));
		}
	}
	function releaseSingletonInstance(instance, type, props) {
		for (var propKey in props) {
			var propValue = props[propKey];
			props.hasOwnProperty(propKey) && null != propValue && setProp(instance, type, propKey, null, emptyProps, propValue);
		}
		null != props.dangerouslySetInnerHTML && (instance.textContent = "");
		instance.onclick === noop$1 && (instance.onclick = null);
		detachDeletedInstance(instance);
	}
	function clearSingletonPreambleContribution(instance) {
		for (var attributes = instance.attributes; attributes.length;) instance.removeAttributeNode(attributes[0]);
		detachDeletedInstance(instance);
	}
	var preloadPropsMap = /* @__PURE__ */ new Map();
	var preconnectsSet = /* @__PURE__ */ new Set();
	function getHoistableRoot(container) {
		if ("function" === typeof container.getRootNode) {
			var rootNode = container.getRootNode();
			if (9 === rootNode.nodeType || 11 === rootNode.nodeType) return rootNode;
		}
		return 9 === container.nodeType ? container : container.ownerDocument;
	}
	var previousDispatcher = ReactDOMSharedInternals.d;
	ReactDOMSharedInternals.d = {
		f: flushSyncWork,
		r: requestFormReset,
		D: prefetchDNS,
		C: preconnect,
		L: preload,
		m: preloadModule,
		X: preinitScript,
		S: preinitStyle,
		M: preinitModuleScript
	};
	function flushSyncWork() {
		var previousWasRendering = previousDispatcher.f(), wasRendering = flushSyncWork$1();
		return previousWasRendering || wasRendering;
	}
	function requestFormReset(form) {
		var formInst = getInstanceFromNode(form);
		null !== formInst && 5 === formInst.tag && "form" === formInst.type ? requestFormReset$1(formInst) : previousDispatcher.r(form);
	}
	var globalDocument = "undefined" === typeof document ? null : document;
	function preconnectAs(rel, href, crossOrigin) {
		var ownerDocument = globalDocument;
		if (ownerDocument && "string" === typeof href && href) {
			var limitedEscapedHref = escapeSelectorAttributeValueInsideDoubleQuotes(href);
			limitedEscapedHref = "link[rel=\"" + rel + "\"][href=\"" + limitedEscapedHref + "\"]";
			"string" === typeof crossOrigin && (limitedEscapedHref += "[crossorigin=\"" + crossOrigin + "\"]");
			preconnectsSet.has(limitedEscapedHref) || (preconnectsSet.add(limitedEscapedHref), rel = {
				rel,
				crossOrigin,
				href
			}, null === ownerDocument.querySelector(limitedEscapedHref) && (href = ownerDocument.createElement("link"), setInitialProperties(href, "link", rel), markNodeAsHoistable(href), ownerDocument.head.appendChild(href)));
		}
	}
	function prefetchDNS(href) {
		previousDispatcher.D(href);
		preconnectAs("dns-prefetch", href, null);
	}
	function preconnect(href, crossOrigin) {
		previousDispatcher.C(href, crossOrigin);
		preconnectAs("preconnect", href, crossOrigin);
	}
	function preload(href, as, options) {
		previousDispatcher.L(href, as, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href && as) {
			var preloadSelector = "link[rel=\"preload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"]";
			"image" === as ? options && options.imageSrcSet ? (preloadSelector += "[imagesrcset=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSrcSet) + "\"]", "string" === typeof options.imageSizes && (preloadSelector += "[imagesizes=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(options.imageSizes) + "\"]")) : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]" : preloadSelector += "[href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]";
			var key = preloadSelector;
			switch (as) {
				case "style":
					key = getStyleKey(href);
					break;
				case "script": key = getScriptKey(href);
			}
			if (!(preloadPropsMap.has(key) || (href = assign({
				rel: "preload",
				href: "image" === as && options && options.imageSrcSet ? void 0 : href,
				as
			}, options), preloadPropsMap.set(key, href), null !== ownerDocument.querySelector(preloadSelector) || "style" === as && ownerDocument.querySelector(getStylesheetSelectorFromKey(key)) || "script" === as && ownerDocument.querySelector(getScriptSelectorFromKey(key))))) {
				var instance = ownerDocument.createElement("link");
				setInitialProperties(instance, "link", href);
				"style" === as && (instance[internalLoadPendingKey] = !0, instance.onload = instance.onerror = function() {
					clearPendingLoadOnNode(instance);
				});
				markNodeAsHoistable(instance);
				ownerDocument.head.appendChild(instance);
			}
		}
	}
	function preloadModule(href, options) {
		previousDispatcher.m(href, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var as = options && "string" === typeof options.as ? options.as : "script", preloadSelector = "link[rel=\"modulepreload\"][as=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(as) + "\"][href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"]", key = preloadSelector;
			switch (as) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": key = getScriptKey(href);
			}
			if (!preloadPropsMap.has(key) && (href = assign({
				rel: "modulepreload",
				href
			}, options), preloadPropsMap.set(key, href), null === ownerDocument.querySelector(preloadSelector))) {
				switch (as) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (ownerDocument.querySelector(getScriptSelectorFromKey(key))) return;
				}
				as = ownerDocument.createElement("link");
				setInitialProperties(as, "link", href);
				markNodeAsHoistable(as);
				ownerDocument.head.appendChild(as);
			}
		}
	}
	function preinitStyle(href, precedence, options) {
		previousDispatcher.S(href, precedence, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && href) {
			var styles = getResourcesFromRoot(ownerDocument).hoistableStyles, key = getStyleKey(href);
			precedence = precedence || "default";
			var resource = styles.get(key);
			if (!resource) {
				var state = {
					loading: 0,
					preload: null
				};
				if (resource = ownerDocument.querySelector(getStylesheetSelectorFromKey(key))) state.loading = 5;
				else {
					href = assign({
						rel: "stylesheet",
						href,
						"data-precedence": precedence
					}, options);
					(options = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(href, options);
					var link = resource = ownerDocument.createElement("link");
					markNodeAsHoistable(link);
					setInitialProperties(link, "link", href);
					link._p = new Promise(function(resolve, reject) {
						link.onload = resolve;
						link.onerror = reject;
					});
					link.addEventListener("load", function() {
						state.loading |= 1;
					});
					link.addEventListener("error", function() {
						state.loading |= 2;
					});
					state.loading |= 4;
					insertStylesheet(resource, precedence, ownerDocument);
				}
				resource = {
					type: "stylesheet",
					instance: resource,
					count: 1,
					state
				};
				styles.set(key, resource);
			}
		}
	}
	function preinitScript(src, options) {
		previousDispatcher.X(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function preinitModuleScript(src, options) {
		previousDispatcher.M(src, options);
		var ownerDocument = globalDocument;
		if (ownerDocument && src) {
			var scripts = getResourcesFromRoot(ownerDocument).hoistableScripts, key = getScriptKey(src), resource = scripts.get(key);
			resource || (resource = ownerDocument.querySelector(getScriptSelectorFromKey(key)), resource || (src = assign({
				src,
				async: !0,
				type: "module"
			}, options), (options = preloadPropsMap.get(key)) && adoptPreloadPropsForScript(src, options), resource = ownerDocument.createElement("script"), markNodeAsHoistable(resource), setInitialProperties(resource, "link", src), ownerDocument.head.appendChild(resource)), resource = {
				type: "script",
				instance: resource,
				count: 1,
				state: null
			}, scripts.set(key, resource));
		}
	}
	function getResource(type, currentProps, pendingProps, currentResource) {
		var JSCompiler_inline_result = (JSCompiler_inline_result = rootInstanceStackCursor.current) ? getHoistableRoot(JSCompiler_inline_result) : null;
		if (!JSCompiler_inline_result) throw Error(formatProdErrorMessage(446));
		switch (type) {
			case "meta":
			case "title": return null;
			case "style": return "string" === typeof pendingProps.precedence && "string" === typeof pendingProps.href ? (pendingProps = getStyleKey(pendingProps.href), currentProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, currentProps.set(pendingProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if ("stylesheet" === pendingProps.rel && "string" === typeof pendingProps.href && "string" === typeof pendingProps.precedence) {
					type = getStyleKey(pendingProps.href);
					var styles$268 = getResourcesFromRoot(JSCompiler_inline_result).hoistableStyles, resource$269 = styles$268.get(type);
					resource$269 || (JSCompiler_inline_result = JSCompiler_inline_result.ownerDocument || JSCompiler_inline_result, resource$269 = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, styles$268.set(type, resource$269), (styles$268 = JSCompiler_inline_result.querySelector(getStylesheetSelectorFromKey(type))) ? styles$268._p || (resource$269.instance = styles$268, resource$269.state.loading = 5) : (styles$268 = preloadPropsMap.get(type), styles$268 || (styles$268 = {
						rel: "preload",
						as: "style",
						href: pendingProps.href,
						crossOrigin: pendingProps.crossOrigin,
						integrity: pendingProps.integrity,
						media: pendingProps.media,
						hrefLang: pendingProps.hrefLang,
						referrerPolicy: pendingProps.referrerPolicy
					}, preloadPropsMap.set(type, styles$268)), preloadStylesheet(JSCompiler_inline_result, type, styles$268, resource$269.state)));
					if (currentProps && null === currentResource) throw Error(formatProdErrorMessage(528, ""));
					return resource$269;
				}
				if (currentProps && null !== currentResource) throw Error(formatProdErrorMessage(529, ""));
				return null;
			case "script": return currentProps = pendingProps.async, pendingProps = pendingProps.src, "string" === typeof pendingProps && currentProps && "function" !== typeof currentProps && "symbol" !== typeof currentProps ? (pendingProps = getScriptKey(pendingProps), currentProps = getResourcesFromRoot(JSCompiler_inline_result).hoistableScripts, currentResource = currentProps.get(pendingProps), currentResource || (currentResource = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, currentProps.set(pendingProps, currentResource)), currentResource) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(formatProdErrorMessage(444, type));
		}
	}
	function getStyleKey(href) {
		return "href=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(href) + "\"";
	}
	function getStylesheetSelectorFromKey(key) {
		return "link[rel=\"stylesheet\"][" + key + "]";
	}
	function stylesheetPropsFromRawProps(rawProps) {
		return assign({}, rawProps, {
			"data-precedence": rawProps.precedence,
			precedence: null
		});
	}
	function preloadStylesheet(ownerDocument, key, preloadProps, state) {
		if (key = ownerDocument.querySelector("link[rel=\"preload\"][as=\"style\"][" + key + "]")) {
			if (!0 !== key[internalLoadPendingKey]) {
				state.loading = 1;
				return;
			}
		} else key = ownerDocument.createElement("link"), key[internalLoadPendingKey] = !0, key.onload = key.onerror = clearPendingLoadOnNode.bind(null, key), setInitialProperties(key, "link", preloadProps), markNodeAsHoistable(key), ownerDocument.head.appendChild(key);
		state.preload = key;
		key.addEventListener("load", function() {
			return state.loading |= 1;
		});
		key.addEventListener("error", function() {
			return state.loading |= 2;
		});
	}
	function getScriptKey(src) {
		return "[src=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(src) + "\"]";
	}
	function getScriptSelectorFromKey(key) {
		return "script[async]" + key;
	}
	function acquireResource(hoistableRoot, resource, props) {
		resource.count++;
		if (null === resource.instance) switch (resource.type) {
			case "style":
				var instance = hoistableRoot.querySelector("style[data-href~=\"" + escapeSelectorAttributeValueInsideDoubleQuotes(props.href) + "\"]");
				if (instance) return resource.instance = instance, markNodeAsHoistable(instance), instance;
				var styleProps = assign({}, props, {
					"data-href": props.href,
					"data-precedence": props.precedence,
					href: null,
					precedence: null
				});
				instance = (hoistableRoot.ownerDocument || hoistableRoot).createElement("style");
				markNodeAsHoistable(instance);
				setInitialProperties(instance, "style", styleProps);
				insertStylesheet(instance, props.precedence, hoistableRoot);
				return resource.instance = instance;
			case "stylesheet":
				styleProps = getStyleKey(props.href);
				var instance$274 = hoistableRoot.querySelector(getStylesheetSelectorFromKey(styleProps));
				if (instance$274) return resource.state.loading |= 4, resource.instance = instance$274, markNodeAsHoistable(instance$274), instance$274;
				instance = stylesheetPropsFromRawProps(props);
				(styleProps = preloadPropsMap.get(styleProps)) && adoptPreloadPropsForStylesheet(instance, styleProps);
				instance$274 = (hoistableRoot.ownerDocument || hoistableRoot).createElement("link");
				markNodeAsHoistable(instance$274);
				var linkInstance = instance$274;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance$274, "link", instance);
				resource.state.loading |= 4;
				insertStylesheet(instance$274, props.precedence, hoistableRoot);
				return resource.instance = instance$274;
			case "script":
				instance$274 = getScriptKey(props.src);
				if (styleProps = hoistableRoot.querySelector(getScriptSelectorFromKey(instance$274))) return resource.instance = styleProps, markNodeAsHoistable(styleProps), styleProps;
				instance = props;
				if (styleProps = preloadPropsMap.get(instance$274)) instance = assign({}, props), adoptPreloadPropsForScript(instance, styleProps);
				hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
				styleProps = hoistableRoot.createElement("script");
				markNodeAsHoistable(styleProps);
				setInitialProperties(styleProps, "link", instance);
				hoistableRoot.head.appendChild(styleProps);
				return resource.instance = styleProps;
			case "void": return null;
			default: throw Error(formatProdErrorMessage(443, resource.type));
		}
		else "stylesheet" === resource.type && 0 === (resource.state.loading & 4) && (instance = resource.instance, resource.state.loading |= 4, insertStylesheet(instance, props.precedence, hoistableRoot));
		return resource.instance;
	}
	function insertStylesheet(instance, precedence, root) {
		for (var nodes = root.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), last = nodes.length ? nodes[nodes.length - 1] : null, prior = last, i = 0; i < nodes.length; i++) {
			var node = nodes[i];
			if (node.dataset.precedence === precedence) prior = node;
			else if (prior !== last) break;
		}
		prior ? prior.parentNode.insertBefore(instance, prior.nextSibling) : (precedence = 9 === root.nodeType ? root.head : root, precedence.insertBefore(instance, precedence.firstChild));
	}
	function adoptPreloadPropsForStylesheet(stylesheetProps, preloadProps) {
		stylesheetProps.crossOrigin ??= preloadProps.crossOrigin;
		stylesheetProps.referrerPolicy ??= preloadProps.referrerPolicy;
		stylesheetProps.title ??= preloadProps.title;
	}
	function adoptPreloadPropsForScript(scriptProps, preloadProps) {
		scriptProps.crossOrigin ??= preloadProps.crossOrigin;
		scriptProps.referrerPolicy ??= preloadProps.referrerPolicy;
		scriptProps.integrity ??= preloadProps.integrity;
	}
	var tagCaches = null;
	function getHydratableHoistableCache(type, keyAttribute, ownerDocument) {
		if (null === tagCaches) {
			var cache = /* @__PURE__ */ new Map();
			var caches = tagCaches = /* @__PURE__ */ new Map();
			caches.set(ownerDocument, cache);
		} else caches = tagCaches, cache = caches.get(ownerDocument), cache || (cache = /* @__PURE__ */ new Map(), caches.set(ownerDocument, cache));
		if (cache.has(type)) return cache;
		cache.set(type, null);
		ownerDocument = ownerDocument.getElementsByTagName(type);
		for (caches = 0; caches < ownerDocument.length; caches++) {
			var node = ownerDocument[caches];
			if (!(node[internalHoistableMarker] || node[internalInstanceKey] || "link" === type && "stylesheet" === node.getAttribute("rel")) && "http://www.w3.org/2000/svg" !== node.namespaceURI) {
				var nodeKey = node.getAttribute(keyAttribute) || "";
				nodeKey = type + nodeKey;
				var existing = cache.get(nodeKey);
				existing ? existing.push(node) : cache.set(nodeKey, [node]);
			}
		}
		return cache;
	}
	function mountHoistable(hoistableRoot, type, instance) {
		hoistableRoot = hoistableRoot.ownerDocument || hoistableRoot;
		hoistableRoot.head.insertBefore(instance, "title" === type ? hoistableRoot.querySelector("head > title") : null);
	}
	function isHostHoistableType(type, props, hostContext) {
		if (1 === hostContext || null != props.itemProp) return !1;
		switch (type) {
			case "meta":
			case "title": return !0;
			case "style":
				if ("string" !== typeof props.precedence || "string" !== typeof props.href || "" === props.href) break;
				return !0;
			case "link":
				if ("string" !== typeof props.rel || "string" !== typeof props.href || "" === props.href || props.onLoad || props.onError) break;
				switch (props.rel) {
					case "stylesheet": return type = props.disabled, "string" === typeof props.precedence && null == type;
					default: return !0;
				}
			case "script": if (props.async && "function" !== typeof props.async && "symbol" !== typeof props.async && !props.onLoad && !props.onError && props.src && "string" === typeof props.src) return !0;
		}
		return !1;
	}
	function maySuspendCommit(type, props) {
		return "img" === type && null != props.src && "" !== props.src && null == props.onLoad && "lazy" !== props.loading;
	}
	function preloadResource(resource) {
		return "stylesheet" === resource.type && 0 === (resource.state.loading & 3) ? !1 : !0;
	}
	function estimateImageBytes(instance) {
		return (instance.width || 100) * (instance.height || 100) * ("number" === typeof devicePixelRatio ? devicePixelRatio : 1) * .25;
	}
	function suspendInstance(state, instance) {
		"function" === typeof instance.decode && (state.imgCount++, instance.complete || (state.imgBytes += estimateImageBytes(instance), state.suspenseyImages.push(instance)), state = onUnsuspendImg.bind(state), instance.decode().then(state, state));
	}
	function suspendResource(state, hoistableRoot, resource, props) {
		if ("stylesheet" === resource.type && ("string" !== typeof props.media || !1 !== matchMedia(props.media).matches) && 0 === (resource.state.loading & 4)) {
			if (null === resource.instance) {
				var key = getStyleKey(props.href), instance = hoistableRoot.querySelector(getStylesheetSelectorFromKey(key));
				if (instance) {
					hoistableRoot = instance._p;
					null !== hoistableRoot && "object" === typeof hoistableRoot && "function" === typeof hoistableRoot.then && (state.count++, state = onUnsuspend.bind(state), hoistableRoot.then(state, state));
					resource.state.loading |= 4;
					resource.instance = instance;
					markNodeAsHoistable(instance);
					return;
				}
				instance = hoistableRoot.ownerDocument || hoistableRoot;
				props = stylesheetPropsFromRawProps(props);
				(key = preloadPropsMap.get(key)) && adoptPreloadPropsForStylesheet(props, key);
				instance = instance.createElement("link");
				markNodeAsHoistable(instance);
				var linkInstance = instance;
				linkInstance._p = new Promise(function(resolve, reject) {
					linkInstance.onload = resolve;
					linkInstance.onerror = reject;
				});
				setInitialProperties(instance, "link", props);
				resource.instance = instance;
			}
			null === state.stylesheets && (state.stylesheets = /* @__PURE__ */ new Map());
			state.stylesheets.set(resource, hoistableRoot);
			(hoistableRoot = resource.state.preload) && 0 === (resource.state.loading & 3) && (state.count++, resource = onUnsuspend.bind(state), hoistableRoot.addEventListener("load", resource), hoistableRoot.addEventListener("error", resource));
		}
	}
	var estimatedBytesWithinLimit = 0;
	function waitForCommitToBeReady(state, timeoutOffset) {
		state.stylesheets && 0 === state.count && insertSuspendedStylesheets(state, state.stylesheets);
		return 0 < state.count || 0 < state.imgCount ? function(commit) {
			var stylesheetTimer = setTimeout(function() {
				state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets);
				if (state.unsuspend) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, 6e4 + timeoutOffset);
			0 < state.imgBytes && 0 === estimatedBytesWithinLimit && (estimatedBytesWithinLimit = 62500 * estimateBandwidth());
			var imgTimer = setTimeout(function() {
				state.waitingForImages = !1;
				if (0 === state.count && (state.stylesheets && insertSuspendedStylesheets(state, state.stylesheets), state.unsuspend)) {
					var unsuspend = state.unsuspend;
					state.unsuspend = null;
					unsuspend();
				}
			}, (state.imgBytes > estimatedBytesWithinLimit ? 50 : 800) + timeoutOffset);
			state.unsuspend = commit;
			return function() {
				state.unsuspend = null;
				clearTimeout(stylesheetTimer);
				clearTimeout(imgTimer);
			};
		} : null;
	}
	function checkIfFullyUnsuspended(state) {
		if (0 === state.count && (0 === state.imgCount || !state.waitingForImages)) {
			if (state.stylesheets) insertSuspendedStylesheets(state, state.stylesheets);
			else if (state.unsuspend) {
				var unsuspend = state.unsuspend;
				state.unsuspend = null;
				unsuspend();
			}
		}
	}
	function onUnsuspend() {
		this.count--;
		checkIfFullyUnsuspended(this);
	}
	function onUnsuspendImg() {
		this.imgCount--;
		checkIfFullyUnsuspended(this);
	}
	var precedencesByRoot = null;
	function insertSuspendedStylesheets(state, resources) {
		state.stylesheets = null;
		null !== state.unsuspend && (state.count++, precedencesByRoot = /* @__PURE__ */ new Map(), resources.forEach(insertStylesheetIntoRoot, state), precedencesByRoot = null, onUnsuspend.call(state));
	}
	function insertStylesheetIntoRoot(root, resource) {
		if (!(resource.state.loading & 4)) {
			var precedences = precedencesByRoot.get(root);
			if (precedences) var last = precedences.get(null);
			else {
				precedences = /* @__PURE__ */ new Map();
				precedencesByRoot.set(root, precedences);
				for (var nodes = root.querySelectorAll("link[data-precedence],style[data-precedence]"), i = 0; i < nodes.length; i++) {
					var node = nodes[i];
					if ("LINK" === node.nodeName || "not all" !== node.getAttribute("media")) precedences.set(node.dataset.precedence, node), last = node;
				}
				last && precedences.set(null, last);
			}
			nodes = resource.instance;
			node = nodes.getAttribute("data-precedence");
			i = precedences.get(node) || last;
			i === last && precedences.set(null, nodes);
			precedences.set(node, nodes);
			this.count++;
			last = onUnsuspend.bind(this);
			nodes.addEventListener("load", last);
			nodes.addEventListener("error", last);
			i ? i.parentNode.insertBefore(nodes, i.nextSibling) : (root = 9 === root.nodeType ? root.head : root, root.insertBefore(nodes, root.firstChild));
			resource.state.loading |= 4;
		}
	}
	var HostTransitionContext = {
		$$typeof: REACT_CONTEXT_TYPE,
		Provider: null,
		Consumer: null,
		_currentValue: sharedNotPendingObject,
		_currentValue2: sharedNotPendingObject,
		_threadCount: 0
	};
	function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
		this.tag = 1;
		this.containerInfo = containerInfo;
		this.pingCache = this.current = this.pendingChildren = null;
		this.timeoutHandle = -1;
		this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
		this.callbackPriority = 0;
		this.expirationTimes = createLaneMap(-1);
		this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
		this.entanglements = createLaneMap(0);
		this.hiddenUpdates = createLaneMap(null);
		this.identifierPrefix = identifierPrefix;
		this.onUncaughtError = onUncaughtError;
		this.onCaughtError = onCaughtError;
		this.onRecoverableError = onRecoverableError;
		this.pooledCache = null;
		this.pooledCacheLanes = 0;
		this.formState = formState;
		this.transitionTypes = null;
		this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		containerInfo = new FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState);
		tag = 1;
		!0 === isStrictMode && (tag |= 24);
		isStrictMode = createFiberImplClass(3, null, null, tag);
		containerInfo.current = isStrictMode;
		isStrictMode.stateNode = containerInfo;
		tag = createCache();
		tag.refCount++;
		containerInfo.pooledCache = tag;
		tag.refCount++;
		isStrictMode.memoizedState = {
			element: initialChildren,
			isDehydrated: hydrate,
			cache: tag
		};
		initializeUpdateQueue(isStrictMode);
		return containerInfo;
	}
	function getContextForSubtree(parentComponent) {
		if (!parentComponent) return emptyContextObject;
		parentComponent = emptyContextObject;
		return parentComponent;
	}
	function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
		parentComponent = getContextForSubtree(parentComponent);
		null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
		container = createUpdate(lane);
		container.payload = { element };
		callback = void 0 === callback ? null : callback;
		null !== callback && (container.callback = callback);
		element = enqueueUpdate(rootFiber, container, lane);
		null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
	}
	function markRetryLaneImpl(fiber, retryLane) {
		fiber = fiber.memoizedState;
		if (null !== fiber && null !== fiber.dehydrated) {
			var a = fiber.retryLane;
			fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
		}
	}
	function markRetryLaneIfNotHydrated(fiber, retryLane) {
		markRetryLaneImpl(fiber, retryLane);
		(fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
	}
	function attemptContinuousHydration(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var root = enqueueConcurrentRenderForLane(fiber, 67108864);
			null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
			markRetryLaneIfNotHydrated(fiber, 67108864);
		}
	}
	function attemptHydrationAtCurrentPriority(fiber) {
		if (13 === fiber.tag || 31 === fiber.tag) {
			var lane = requestUpdateLane();
			lane = getBumpedLaneForHydrationByLane(lane);
			var root = enqueueConcurrentRenderForLane(fiber, lane);
			null !== root && scheduleUpdateOnFiber(root, fiber, lane);
			markRetryLaneIfNotHydrated(fiber, lane);
		}
	}
	var _enabled = !0;
	function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 2, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchContinuousEvent(domEventName, eventSystemFlags, container, nativeEvent) {
		var prevTransition = ReactSharedInternals.T;
		ReactSharedInternals.T = null;
		var previousPriority = ReactDOMSharedInternals.p;
		try {
			ReactDOMSharedInternals.p = 8, dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
		} finally {
			ReactDOMSharedInternals.p = previousPriority, ReactSharedInternals.T = prevTransition;
		}
	}
	function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (_enabled) {
			var blockedOn = findInstanceBlockingEvent(nativeEvent);
			if (null === blockedOn) dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer), clearIfContinuousEvent(domEventName, nativeEvent);
			else if (queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)) nativeEvent.stopPropagation();
			else if (clearIfContinuousEvent(domEventName, nativeEvent), eventSystemFlags & 4 && -1 < discreteReplayableEvents.indexOf(domEventName)) {
				for (; null !== blockedOn;) {
					var fiber = getInstanceFromNode(blockedOn);
					if (null !== fiber) switch (fiber.tag) {
						case 3:
							fiber = fiber.stateNode;
							if (fiber.current.memoizedState.isDehydrated) {
								var lanes = getHighestPriorityLanes(fiber.pendingLanes);
								if (0 !== lanes) {
									var root = fiber;
									root.pendingLanes |= 2;
									for (root.entangledLanes |= 2; lanes;) {
										var lane = 1 << 31 - clz32(lanes);
										root.entanglements[1] |= lane;
										lanes &= ~lane;
									}
									ensureRootIsScheduled(fiber);
									0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0, !1));
								}
							}
							break;
						case 31:
						case 13: root = enqueueConcurrentRenderForLane(fiber, 2), null !== root && scheduleUpdateOnFiber(root, fiber, 2), flushSyncWork$1(), markRetryLaneIfNotHydrated(fiber, 2);
					}
					fiber = findInstanceBlockingEvent(nativeEvent);
					null === fiber && dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, return_targetInst, targetContainer);
					if (fiber === blockedOn) break;
					blockedOn = fiber;
				}
				null !== blockedOn && nativeEvent.stopPropagation();
			} else dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, null, targetContainer);
		}
	}
	function findInstanceBlockingEvent(nativeEvent) {
		nativeEvent = getEventTarget(nativeEvent);
		return findInstanceBlockingTarget(nativeEvent);
	}
	var return_targetInst = null;
	function findInstanceBlockingTarget(targetNode) {
		return_targetInst = null;
		targetNode = getClosestInstanceFromNode(targetNode);
		if (null !== targetNode) {
			var nearestMounted = getNearestMountedFiber(targetNode);
			if (null === nearestMounted) targetNode = null;
			else {
				var tag = nearestMounted.tag;
				if (13 === tag) {
					targetNode = getSuspenseInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (31 === tag) {
					targetNode = getActivityInstanceFromFiber(nearestMounted);
					if (null !== targetNode) return targetNode;
					targetNode = null;
				} else if (3 === tag) {
					if (nearestMounted.stateNode.current.memoizedState.isDehydrated) return 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					targetNode = null;
				} else nearestMounted !== targetNode && (targetNode = null);
			}
		}
		return_targetInst = targetNode;
		return null;
	}
	function getEventPriority(domEventName) {
		switch (domEventName) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "fullscreenerror":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "resize":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (getCurrentPriorityLevel()) {
				case ImmediatePriority: return 2;
				case UserBlockingPriority: return 8;
				case NormalPriority$1:
				case LowPriority: return 32;
				case IdlePriority: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hasScheduledReplayAttempt = !1;
	var queuedFocus = null;
	var queuedDrag = null;
	var queuedMouse = null;
	var queuedPointers = /* @__PURE__ */ new Map();
	var queuedPointerCaptures = /* @__PURE__ */ new Map();
	var queuedExplicitHydrationTargets = [];
	var discreteReplayableEvents = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function clearIfContinuousEvent(domEventName, nativeEvent) {
		switch (domEventName) {
			case "focusin":
			case "focusout":
				queuedFocus = null;
				break;
			case "dragenter":
			case "dragleave":
				queuedDrag = null;
				break;
			case "mouseover":
			case "mouseout":
				queuedMouse = null;
				break;
			case "pointerover":
			case "pointerout":
				queuedPointers.delete(nativeEvent.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": queuedPointerCaptures.delete(nativeEvent.pointerId);
		}
	}
	function accumulateOrCreateContinuousQueuedReplayableEvent(existingQueuedEvent, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		if (null === existingQueuedEvent || existingQueuedEvent.nativeEvent !== nativeEvent) return existingQueuedEvent = {
			blockedOn,
			domEventName,
			eventSystemFlags,
			nativeEvent,
			targetContainers: [targetContainer]
		}, null !== blockedOn && (blockedOn = getInstanceFromNode(blockedOn), null !== blockedOn && attemptContinuousHydration(blockedOn)), existingQueuedEvent;
		existingQueuedEvent.eventSystemFlags |= eventSystemFlags;
		blockedOn = existingQueuedEvent.targetContainers;
		null !== targetContainer && -1 === blockedOn.indexOf(targetContainer) && blockedOn.push(targetContainer);
		return existingQueuedEvent;
	}
	function queueIfContinuousEvent(blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent) {
		switch (domEventName) {
			case "focusin": return queuedFocus = accumulateOrCreateContinuousQueuedReplayableEvent(queuedFocus, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "dragenter": return queuedDrag = accumulateOrCreateContinuousQueuedReplayableEvent(queuedDrag, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "mouseover": return queuedMouse = accumulateOrCreateContinuousQueuedReplayableEvent(queuedMouse, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent), !0;
			case "pointerover":
				var pointerId = nativeEvent.pointerId;
				queuedPointers.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointers.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent));
				return !0;
			case "gotpointercapture": return pointerId = nativeEvent.pointerId, queuedPointerCaptures.set(pointerId, accumulateOrCreateContinuousQueuedReplayableEvent(queuedPointerCaptures.get(pointerId) || null, blockedOn, domEventName, eventSystemFlags, targetContainer, nativeEvent)), !0;
		}
		return !1;
	}
	function attemptExplicitHydrationTarget(queuedTarget) {
		var targetInst = getClosestInstanceFromNode(queuedTarget.target);
		if (null !== targetInst) {
			var nearestMounted = getNearestMountedFiber(targetInst);
			if (null !== nearestMounted) {
				if (targetInst = nearestMounted.tag, 13 === targetInst) {
					if (targetInst = getSuspenseInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (31 === targetInst) {
					if (targetInst = getActivityInstanceFromFiber(nearestMounted), null !== targetInst) {
						queuedTarget.blockedOn = targetInst;
						runWithPriority(queuedTarget.priority, function() {
							attemptHydrationAtCurrentPriority(nearestMounted);
						});
						return;
					}
				} else if (3 === targetInst && nearestMounted.stateNode.current.memoizedState.isDehydrated) {
					queuedTarget.blockedOn = 3 === nearestMounted.tag ? nearestMounted.stateNode.containerInfo : null;
					return;
				}
			}
		}
		queuedTarget.blockedOn = null;
	}
	function attemptReplayContinuousQueuedEvent(queuedEvent) {
		if (null !== queuedEvent.blockedOn) return !1;
		for (var targetContainers = queuedEvent.targetContainers; 0 < targetContainers.length;) {
			var nextBlockedOn = findInstanceBlockingEvent(queuedEvent.nativeEvent);
			if (null === nextBlockedOn) {
				nextBlockedOn = queuedEvent.nativeEvent;
				var nativeEventClone = new nextBlockedOn.constructor(nextBlockedOn.type, nextBlockedOn);
				currentReplayingEvent = nativeEventClone;
				nextBlockedOn.target.dispatchEvent(nativeEventClone);
				currentReplayingEvent = null;
			} else return targetContainers = getInstanceFromNode(nextBlockedOn), null !== targetContainers && attemptContinuousHydration(targetContainers), queuedEvent.blockedOn = nextBlockedOn, !1;
			targetContainers.shift();
		}
		return !0;
	}
	function attemptReplayContinuousQueuedEventInMap(queuedEvent, key, map) {
		attemptReplayContinuousQueuedEvent(queuedEvent) && map.delete(key);
	}
	function replayUnblockedEvents() {
		hasScheduledReplayAttempt = !1;
		null !== queuedFocus && attemptReplayContinuousQueuedEvent(queuedFocus) && (queuedFocus = null);
		null !== queuedDrag && attemptReplayContinuousQueuedEvent(queuedDrag) && (queuedDrag = null);
		null !== queuedMouse && attemptReplayContinuousQueuedEvent(queuedMouse) && (queuedMouse = null);
		queuedPointers.forEach(attemptReplayContinuousQueuedEventInMap);
		queuedPointerCaptures.forEach(attemptReplayContinuousQueuedEventInMap);
	}
	function scheduleCallbackIfUnblocked(queuedEvent, unblocked) {
		queuedEvent.blockedOn === unblocked && (queuedEvent.blockedOn = null, hasScheduledReplayAttempt || (hasScheduledReplayAttempt = !0, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, replayUnblockedEvents)));
	}
	var lastScheduledReplayQueue = null;
	function scheduleReplayQueueIfNeeded(formReplayingQueue) {
		lastScheduledReplayQueue !== formReplayingQueue && (lastScheduledReplayQueue = formReplayingQueue, Scheduler.unstable_scheduleCallback(Scheduler.unstable_NormalPriority, function() {
			lastScheduledReplayQueue === formReplayingQueue && (lastScheduledReplayQueue = null);
			for (var i = 0; i < formReplayingQueue.length; i += 3) {
				var form = formReplayingQueue[i], submitterOrAction = formReplayingQueue[i + 1], formData = formReplayingQueue[i + 2];
				if ("function" !== typeof submitterOrAction) if (null === findInstanceBlockingTarget(submitterOrAction || form)) continue;
				else break;
				var formInst = getInstanceFromNode(form);
				null !== formInst && (formReplayingQueue.splice(i, 3), i -= 3, startHostTransition(formInst, {
					pending: !0,
					data: formData,
					method: form.method,
					action: submitterOrAction
				}, submitterOrAction, formData));
			}
		}));
	}
	function retryIfBlockedOn(unblocked) {
		function unblock(queuedEvent) {
			return scheduleCallbackIfUnblocked(queuedEvent, unblocked);
		}
		null !== queuedFocus && scheduleCallbackIfUnblocked(queuedFocus, unblocked);
		null !== queuedDrag && scheduleCallbackIfUnblocked(queuedDrag, unblocked);
		null !== queuedMouse && scheduleCallbackIfUnblocked(queuedMouse, unblocked);
		queuedPointers.forEach(unblock);
		queuedPointerCaptures.forEach(unblock);
		for (var i = 0; i < queuedExplicitHydrationTargets.length; i++) {
			var queuedTarget = queuedExplicitHydrationTargets[i];
			queuedTarget.blockedOn === unblocked && (queuedTarget.blockedOn = null);
		}
		for (; 0 < queuedExplicitHydrationTargets.length && (i = queuedExplicitHydrationTargets[0], null === i.blockedOn);) attemptExplicitHydrationTarget(i), null === i.blockedOn && queuedExplicitHydrationTargets.shift();
		i = (unblocked.ownerDocument || unblocked).$$reactFormReplay;
		if (null != i) for (queuedTarget = 0; queuedTarget < i.length; queuedTarget += 3) {
			var form = i[queuedTarget], submitterOrAction = i[queuedTarget + 1], formProps = form[internalPropsKey] || null;
			if ("function" === typeof submitterOrAction) formProps || scheduleReplayQueueIfNeeded(i);
			else if (formProps) {
				var action = null;
				if (submitterOrAction && submitterOrAction.hasAttribute("formAction")) {
					if (form = submitterOrAction, formProps = submitterOrAction[internalPropsKey] || null) action = formProps.formAction;
					else if (null !== findInstanceBlockingTarget(form)) continue;
				} else action = formProps.action;
				"function" === typeof action ? i[queuedTarget + 1] = action : (i.splice(queuedTarget, 3), queuedTarget -= 3);
				scheduleReplayQueueIfNeeded(i);
			}
		}
	}
	function defaultOnDefaultTransitionIndicator() {
		function handleNavigate(event) {
			event.canIntercept && "react-transition" === event.info && event.intercept({
				handler: function() {
					return new Promise(function(resolve) {
						return pendingResolve = resolve;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function handleNavigateComplete() {
			null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			isCancelled || setTimeout(startFakeNavigation, 20);
		}
		function startFakeNavigation() {
			if (!isCancelled && !navigation.transition) {
				var currentEntry = navigation.currentEntry;
				currentEntry && null != currentEntry.url && navigation.navigate(currentEntry.url, {
					state: currentEntry.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if ("object" === typeof navigation) {
			var isCancelled = !1, pendingResolve = null;
			navigation.addEventListener("navigate", handleNavigate);
			navigation.addEventListener("navigatesuccess", handleNavigateComplete);
			navigation.addEventListener("navigateerror", handleNavigateComplete);
			setTimeout(startFakeNavigation, 100);
			return function() {
				isCancelled = !0;
				navigation.removeEventListener("navigate", handleNavigate);
				navigation.removeEventListener("navigatesuccess", handleNavigateComplete);
				navigation.removeEventListener("navigateerror", handleNavigateComplete);
				null !== pendingResolve && (pendingResolve(), pendingResolve = null);
			};
		}
	}
	function ReactDOMRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.render = ReactDOMRoot.prototype.render = function(children) {
		var root = this._internalRoot;
		if (null === root) throw Error(formatProdErrorMessage(409));
		var current = root.current;
		updateContainerImpl(current, requestUpdateLane(), children, root, null, null);
	};
	ReactDOMHydrationRoot.prototype.unmount = ReactDOMRoot.prototype.unmount = function() {
		var root = this._internalRoot;
		if (null !== root) {
			this._internalRoot = null;
			var container = root.containerInfo;
			updateContainerImpl(root.current, 2, null, root, null, null);
			flushSyncWork$1();
			container[internalContainerInstanceKey] = null;
		}
	};
	function ReactDOMHydrationRoot(internalRoot) {
		this._internalRoot = internalRoot;
	}
	ReactDOMHydrationRoot.prototype.unstable_scheduleHydration = function(target) {
		if (target) {
			var updatePriority = resolveUpdatePriority();
			target = {
				blockedOn: null,
				target,
				priority: updatePriority
			};
			for (var i = 0; i < queuedExplicitHydrationTargets.length && 0 !== updatePriority && updatePriority < queuedExplicitHydrationTargets[i].priority; i++);
			queuedExplicitHydrationTargets.splice(i, 0, target);
			0 === i && attemptExplicitHydrationTarget(target);
		}
	};
	var isomorphicReactPackageVersion$jscomp$inline_2043 = React.version;
	if ("19.3.1" !== isomorphicReactPackageVersion$jscomp$inline_2043) throw Error(formatProdErrorMessage(527, isomorphicReactPackageVersion$jscomp$inline_2043, "19.3.1"));
	ReactDOMSharedInternals.findDOMNode = function(componentOrElement) {
		var fiber = componentOrElement._reactInternals;
		if (void 0 === fiber) {
			if ("function" === typeof componentOrElement.render) throw Error(formatProdErrorMessage(188));
			componentOrElement = Object.keys(componentOrElement).join(",");
			throw Error(formatProdErrorMessage(268, componentOrElement));
		}
		componentOrElement = findCurrentFiberUsingSlowPath(fiber);
		componentOrElement = null !== componentOrElement ? findCurrentHostFiberImpl(componentOrElement) : null;
		componentOrElement = null === componentOrElement ? null : componentOrElement.stateNode;
		return componentOrElement;
	};
	var internals$jscomp$inline_2586 = {
		bundleType: 0,
		version: "19.3.1",
		rendererPackageName: "react-dom",
		currentDispatcherRef: ReactSharedInternals,
		reconcilerVersion: "19.3.1"
	};
	if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
		var hook$jscomp$inline_2587 = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!hook$jscomp$inline_2587.isDisabled && hook$jscomp$inline_2587.supportsFiber) try {
			rendererID = hook$jscomp$inline_2587.inject(internals$jscomp$inline_2586), injectedHook = hook$jscomp$inline_2587;
		} catch (err) {}
	}
	exports.createRoot = function(container, options) {
		if (!isValidContainer(container)) throw Error(formatProdErrorMessage(299));
		var isStrictMode = !1, identifierPrefix = "", onUncaughtError = defaultOnUncaughtError, onCaughtError = defaultOnCaughtError, onRecoverableError = defaultOnRecoverableError;
		null !== options && void 0 !== options && (!0 === options.unstable_strictMode && (isStrictMode = !0), void 0 !== options.identifierPrefix && (identifierPrefix = options.identifierPrefix), void 0 !== options.onUncaughtError && (onUncaughtError = options.onUncaughtError), void 0 !== options.onCaughtError && (onCaughtError = options.onCaughtError), void 0 !== options.onRecoverableError && (onRecoverableError = options.onRecoverableError));
		options = createFiberRoot(container, 1, !1, null, null, isStrictMode, identifierPrefix, null, onUncaughtError, onCaughtError, onRecoverableError, defaultOnDefaultTransitionIndicator);
		container[internalContainerInstanceKey] = options.current;
		listenToAllSupportedEvents(container);
		return new ReactDOMRoot(options);
	};
}));
// \0vite/preload-helper.js
var import_client = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	function checkDCE() {
		if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") return;
		try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
		} catch (err) {
			console.error(err);
		}
	}
	checkDCE();
	module.exports = require_react_dom_client_production();
})))();
var scriptRel = "modulepreload";
var assetsURL = function(dep) {
	return "/" + dep;
};
var seen = {};
var isCssPreloadUrl = function isCssPreloadUrl(url) {
	return url.pathname.endsWith(".css");
};
var preloadOnce = function preloadOnce(seen, href, preload) {
	if (href in seen) return seen[href];
	const promise = preload();
	if (!promise) {
		seen[href] = void 0;
		return;
	}
	const preloadPromise = promise.then(() => {
		seen[href] = void 0;
	}, (err) => {
		seen[href] = void 0;
		throw err;
	});
	seen[href] = preloadPromise;
	return preloadPromise;
};
var __vitePreload = function preload(baseModule, deps, importerUrl) {
	let promise = Promise.resolve();
	if (deps && deps.length > 0) {
		let preloadedHrefs;
		const cspNonceMeta = document.querySelector("meta[property=csp-nonce]");
		const cspNonce = cspNonceMeta?.nonce || cspNonceMeta?.getAttribute("nonce");
		function allSettled(promises) {
			return Promise.all(promises.map((p) => Promise.resolve(p).then((value) => ({
				status: "fulfilled",
				value
			}), (reason) => ({
				status: "rejected",
				reason
			}))));
		}
		function importMetaResolve(specifier) {
			if (import.meta.resolve) return new URL(import.meta.resolve(specifier));
			return new URL(
				specifier,
				/** #__KEEP__ */
				import.meta.url
			);
		}
		promise = allSettled(deps.map((depString) => {
			depString = assetsURL(depString, importerUrl);
			const dep = importMetaResolve(depString);
			const isCss = isCssPreloadUrl(dep);
			return preloadOnce(seen, dep.href, () => {
				if (preloadedHrefs === void 0) {
					preloadedHrefs = {
						all: /* @__PURE__ */ new Set(),
						styles: /* @__PURE__ */ new Set()
					};
					const links = document.getElementsByTagName("link");
					for (let i = links.length - 1; i >= 0; i--) {
						const link = links[i];
						preloadedHrefs.all.add(link.href);
						if (link.rel === "stylesheet") preloadedHrefs.styles.add(link.href);
					}
				}
				if ((isCss ? preloadedHrefs.styles : preloadedHrefs.all).has(dep.href)) return;
				const link = document.createElement("link");
				link.rel = isCss ? "stylesheet" : scriptRel;
				if (!isCss) link.as = "script";
				link.crossOrigin = "";
				link.href = dep.href;
				if (cspNonce) link.setAttribute("nonce", cspNonce);
				document.head.appendChild(link);
				if (isCss) return new Promise((res, rej) => {
					const handleSettle = (e) => {
						link.removeEventListener("load", handleSettle);
						link.removeEventListener("error", handleSettle);
						if (e.type === "error") rej(/* @__PURE__ */ new Error(`Unable to preload CSS for ${dep}`));
						else res(e);
					};
					link.addEventListener("load", handleSettle);
					link.addEventListener("error", handleSettle);
				});
			});
		}).filter((p) => p !== void 0));
	}
	function handlePreloadError(err) {
		const e = new Event("vite:preloadError", { cancelable: true });
		e.payload = err;
		window.dispatchEvent(e);
		if (!e.defaultPrevented) throw err;
	}
	return promise.then((res) => {
		for (const item of res || []) {
			if (item.status !== "rejected") continue;
			handlePreloadError(item.reason);
		}
		return baseModule().catch(handlePreloadError);
	});
};
// ../../@vite-plugin-pwa/virtual:pwa-register
var autoUpdateMode = "true";
var selfDestroying = "false";
var auto = autoUpdateMode === "true";
var autoDestroy = selfDestroying === "true";
function registerSW(options = {}) {
	const { immediate = false, onNeedReload, onNeedRefresh, onOfflineReady, onRegistered, onRegisteredSW, onRegisterError } = options;
	let wb;
	let registerPromise;
	let sendSkipWaitingMessage;
	const updateServiceWorker = async (_reloadPage = true) => {
		await registerPromise;
		if (!auto) sendSkipWaitingMessage?.();
	};
	async function register() {
		if ("serviceWorker" in navigator) {
			wb = await __vitePreload(async () => {
				const { Workbox } = await import("./workbox-window.prod.es5-CzJxx9q2.js");
				return { Workbox };
			}, []).then(({ Workbox }) => {
				return new Workbox("/sw.js", {
					scope: "/",
					type: "classic"
				});
			}).catch((e) => {
				onRegisterError?.(e);
			});
			if (!wb) return;
			sendSkipWaitingMessage = () => {
				wb?.messageSkipWaiting();
			};
			if (!autoDestroy) {
				if (auto) {
					wb.addEventListener("activated", (event) => {
						if (event.isUpdate || event.isExternal) {
							if (onNeedReload) onNeedReload();
							else window.location.reload();
						}
					});
					wb.addEventListener("installed", (event) => {
						if (!event.isUpdate) onOfflineReady?.();
					});
				} else {
					let onNeedRefreshCalled = false;
					const showSkipWaitingPrompt = () => {
						onNeedRefreshCalled = true;
						wb?.addEventListener("controlling", (event) => {
							if (event.isUpdate) {
								if (onNeedReload) onNeedReload();
								else window.location.reload();
							}
						});
						onNeedRefresh?.();
					};
					wb.addEventListener("installed", (event) => {
						if (typeof event.isUpdate === "undefined") {
							if (typeof event.isExternal !== "undefined") {
								if (event.isExternal) showSkipWaitingPrompt();
								else !onNeedRefreshCalled && onOfflineReady?.();
							} else !onNeedRefreshCalled && onOfflineReady?.();
						} else if (!event.isUpdate) onOfflineReady?.();
					});
					wb.addEventListener("waiting", showSkipWaitingPrompt);
				}
			}
			wb.register({ immediate }).then((r) => {
				if (onRegisteredSW) onRegisteredSW("/sw.js", r);
				else onRegistered?.(r);
			}).catch((e) => {
				onRegisterError?.(e);
			});
		}
	}
	registerPromise = register();
	return updateServiceWorker;
}
// src/data/translations.ts
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var LANGUAGES = [
	{
		code: "en",
		name: "English",
		nativeName: "English",
		pastelBg: "bg-[#FFF5D6]",
		pastelBorder: "border-[#F3D88C]"
	},
	{
		code: "it",
		name: "Italian",
		nativeName: "Italiano",
		pastelBg: "bg-[#FFE7E3]",
		pastelBorder: "border-[#F7BCB2]"
	},
	{
		code: "sw",
		name: "Swahili",
		nativeName: "Kiswahili",
		pastelBg: "bg-[#E3F6EA]",
		pastelBorder: "border-[#A7DFBD]"
	},
	{
		code: "fr",
		name: "French",
		nativeName: "Français",
		pastelBg: "bg-[#E5F0FF]",
		pastelBorder: "border-[#B2CEFB]"
	},
	{
		code: "es",
		name: "Spanish",
		nativeName: "Español",
		pastelBg: "bg-[#FFF0DC]",
		pastelBorder: "border-[#F5CE93]"
	},
	{
		code: "pt",
		name: "Portuguese",
		nativeName: "Português",
		pastelBg: "bg-[#E7F8EE]",
		pastelBorder: "border-[#AEE4C4]"
	},
	{
		code: "de",
		name: "German",
		nativeName: "Deutsch",
		pastelBg: "bg-[#F2ECFF]",
		pastelBorder: "border-[#CFC0F7]"
	},
	{
		code: "ar",
		name: "Arabic",
		nativeName: "العربية",
		pastelBg: "bg-[#E4F7F4]",
		pastelBorder: "border-[#A8E0D7]",
		rtl: true
	},
	{
		code: "hi",
		name: "Hindi",
		nativeName: "हिन्दी",
		pastelBg: "bg-[#FFEFE4]",
		pastelBorder: "border-[#F6C4A1]"
	},
	{
		code: "zh",
		name: "Chinese",
		nativeName: "中文",
		pastelBg: "bg-[#FFE8EF]",
		pastelBorder: "border-[#F4B8CB]"
	}
];
var TRANSLATIONS = {
	en: {
		chooseLanguageTitle: "Choose Your Language",
		chooseLanguageFooter: "Select your language to begin the quiz",
		dailyBibleVerse: "Daily Bible Verse",
		searchPlaceholder: "Search verses across the Bible",
		listen: "Listen",
		stop: "Stop",
		previous: "Previous",
		random: "Random",
		copy: "Copy",
		share: "Share",
		bookmark: "Save",
		savedWord: "Saved",
		copiedToast: "Verse copied to clipboard",
		sharedToast: "Verse ready to share",
		bookmarkedToast: "Saved to your verses",
		removedToast: "Removed from saved verses",
		noSearchMatches: "No verses match your search",
		clearSearch: "Reset",
		autoNextIn: "Auto-next in {sec}s",
		autoNextPaused: "Paused",
		pauseAutoNext: "Pause",
		resumeAutoNext: "Play",
		tabHome: "Home",
		tabQuiz: "Quiz",
		tabSaved: "Saved",
		tabProfile: "Profile",
		questionProgressPill: "Question {current} of {total}",
		completedProgress: "Progress · {done} of {total} completed",
		correctFeedback: "Well done! Correct",
		wrongFeedback: "Good try!",
		timesUpFeedback: "Time's up!",
		addTimeAria: "Add 15 seconds for 5 gold coins",
		addTimeToast: "+15s added! (-5 coins)",
		notEnoughCoinsToast: "Need 5 gold coins to add +15s",
		readingQuestionHint: "Listening… timer starts after voice",
		referenceLabel: "Ref",
		nextQuestion: "Next",
		quizCompleteTitle: "Quiz Complete!",
		quizCompleteSubtitle: "Great job exploring God’s Word today",
		coinsEarnedLabel: "Gold Coins Earned",
		scoreLabel: "Score",
		playAgain: "Play Again",
		quizSettingsBtn: "Quiz Settings",
		doubleCoinsBtn: "Watch Video Ad · 2x Coins (+{bonus})",
		coinsDoubledBadge: "2x Coins Doubled!",
		rewardAdTitle: "Family Bible Stories Audio",
		rewardAdSponsor: "Listen to uplifting Bible adventures together every evening.",
		rewardAdCountdown: "Reward in {sec}s",
		rewardAdUnlockedTitle: "Reward Ready!",
		claimDoubleCoinsBtn: "Collect +{bonus} Bonus Coins",
		rewardAdCancel: "Close without bonus",
		rewardAdEarnedToast: "+{bonus} bonus gold coins added!",
		settingsTitle: "Settings",
		ageCardTitle: "1. Age of User",
		ageKids: "Kids",
		ageKidsRange: "5–9",
		ageTeens: "Teens",
		ageTeensRange: "10–17",
		ageAdults: "Adults",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Book of the Bible",
		allBooks: "All Books",
		voiceCardTitle: "3. Voice Gender",
		voiceFemale: "Female Voice",
		voiceMale: "Male Voice",
		voiceTeen: "Teenage Voice",
		voiceKids: "Kids Voice",
		saveSettings: "Save Settings",
		settingsSavedToast: "Settings saved!",
		voiceUpdatedSample: "Voice updated!",
		voiceSpeedLabel: "Speed",
		voicePitchLabel: "Pitch",
		previewVoiceBtn: "Preview",
		savedVersesTitle: "Saved Verses",
		savedEmptyTitle: "No saved verses yet",
		savedEmptySubtitle: "Tap Save on any Daily Verse to keep it here.",
		browseVersesBtn: "Browse Verses",
		pageLabel: "Page {page} of {total}",
		remove: "Remove",
		profileTitle: "My Profile",
		totalCoins: "Gold Coins",
		quizzesDone: "Quizzes",
		dayStreak: "Day Streak",
		languageSettingLabel: "App Language",
		quizSettingsLabel: "Quiz Difficulty & Voice",
		soundEffectsLabel: "Quiz Sound Effects",
		soundOn: "On",
		soundOff: "Off",
		adBannerLabel: "Ad",
		adBannerText: "Family Bible Stories Audio Collection — Free Kids Trial",
		shareAchievement: "Share Achievement",
		achievementCardTitle: "My Bible Journey",
		achievementSummaryText: "I earned {coins} gold coins and reached a {streak}-day streak on Bible Quest: Daily Verse & Quiz!",
		saveCardImage: "Save Card",
		copySummary: "Copy Text",
		achievementCopiedToast: "Achievement summary copied",
		achievementSavedToast: "Achievement card saved",
		closeLabel: "Close",
		bookNames: {
			all: "All Books",
			Genesis: "Genesis",
			Exodus: "Exodus",
			Psalms: "Psalms",
			Matthew: "Matthew",
			John: "John",
			Revelation: "Revelation"
		}
	},
	it: {
		chooseLanguageTitle: "Scegli la Tua Lingua",
		chooseLanguageFooter: "Seleziona la tua lingua per iniziare il quiz",
		dailyBibleVerse: "Versetto del Giorno",
		searchPlaceholder: "Cerca versetti nella Bibbia",
		listen: "Ascolta",
		stop: "Ferma",
		previous: "Precedente",
		random: "Casuale",
		copy: "Copia",
		share: "Condividi",
		bookmark: "Salva",
		savedWord: "Salvato",
		copiedToast: "Versetto copiato negli appunti",
		sharedToast: "Versetto pronto da condividere",
		bookmarkedToast: "Salvato nei tuoi versetti",
		removedToast: "Rimosso dai versetti salvati",
		noSearchMatches: "Nessun versetto corrisponde alla ricerca",
		clearSearch: "Reimposta",
		autoNextIn: "Prossimo tra {sec}s",
		autoNextPaused: "In pausa",
		pauseAutoNext: "Pausa",
		resumeAutoNext: "Riprendi",
		tabHome: "Home",
		tabQuiz: "Quiz",
		tabSaved: "Salvati",
		tabProfile: "Profilo",
		questionProgressPill: "Domanda {current} di {total}",
		completedProgress: "Progresso · {done} di {total} completate",
		correctFeedback: "Ben fatto! Corretto",
		wrongFeedback: "Bel tentativo!",
		timesUpFeedback: "Tempo scaduto!",
		addTimeAria: "Aggiungi 15 secondi per 5 monete d’oro",
		addTimeToast: "+15s aggiunti! (-5 monete)",
		notEnoughCoinsToast: "Servono 5 monete per +15s",
		readingQuestionHint: "Ascolto… il timer parte dopo la voce",
		referenceLabel: "Rif",
		nextQuestion: "Avanti",
		quizCompleteTitle: "Quiz Completato!",
		quizCompleteSubtitle: "Ottimo lavoro esplorando la Parola di Dio oggi",
		coinsEarnedLabel: "Monete d’Oro Guadagnate",
		scoreLabel: "Punteggio",
		playAgain: "Gioca Ancora",
		quizSettingsBtn: "Impostazioni Quiz",
		doubleCoinsBtn: "Guarda Video · 2x Monete (+{bonus})",
		coinsDoubledBadge: "2x Monete Raddoppiate!",
		rewardAdTitle: "Storie Bibliche Audio per la Famiglia",
		rewardAdSponsor: "Ascoltate insieme ogni sera avventure bibliche edificanti.",
		rewardAdCountdown: "Premio tra {sec}s",
		rewardAdUnlockedTitle: "Premio Pronto!",
		claimDoubleCoinsBtn: "Riscatta +{bonus} Monete Bonus",
		rewardAdCancel: "Chiudi senza bonus",
		rewardAdEarnedToast: "+{bonus} monete d’oro bonus aggiunte!",
		settingsTitle: "Impostazioni",
		ageCardTitle: "1. Età dell’Utente",
		ageKids: "Bambini",
		ageKidsRange: "5–9",
		ageTeens: "Ragazzi",
		ageTeensRange: "10–17",
		ageAdults: "Adulti",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Libro della Bibbia",
		allBooks: "Tutti i Libri",
		voiceCardTitle: "3. Tipo di Voce",
		voiceFemale: "Voce Femminile",
		voiceMale: "Voce Maschile",
		voiceTeen: "Voce Adolescente",
		voiceKids: "Voce Bambino",
		saveSettings: "Salva Impostazioni",
		settingsSavedToast: "Impostazioni salvate",
		voiceUpdatedSample: "Voce aggiornata!",
		voiceSpeedLabel: "Velocità",
		voicePitchLabel: "Tono",
		previewVoiceBtn: "Anteprima",
		savedVersesTitle: "Versetti Salvati",
		savedEmptyTitle: "Nessun versetto salvato",
		savedEmptySubtitle: "Tocca Salva su qualsiasi Versetto del Giorno per conservarlo qui.",
		browseVersesBtn: "Esplora i Versetti",
		pageLabel: "Pagina {page} di {total}",
		remove: "Rimuovi",
		profileTitle: "Il Mio Profilo",
		totalCoins: "Monete d’Oro",
		quizzesDone: "Quiz",
		dayStreak: "Serie Giorni",
		languageSettingLabel: "Lingua dell’App",
		quizSettingsLabel: "Difficoltà e Voce Quiz",
		soundEffectsLabel: "Effetti Sonori Quiz",
		soundOn: "Attivi",
		soundOff: "Disattivati",
		adBannerLabel: "Annuncio",
		adBannerText: "Storie Bibliche Audio per Bambini — Prova Gratuita",
		shareAchievement: "Condividi Traguardo",
		achievementCardTitle: "Il Mio Cammino Biblico",
		achievementSummaryText: "Ho guadagnato {coins} monete d’oro e raggiunto una serie di {streak} giorni su Bible Quest: Daily Verse & Quiz!",
		saveCardImage: "Salva Scheda",
		copySummary: "Copia Testo",
		achievementCopiedToast: "Riepilogo traguardo copiato",
		achievementSavedToast: "Scheda traguardo salvata",
		closeLabel: "Chiudi",
		bookNames: {
			all: "Tutti i Libri",
			Genesis: "Genesi",
			Exodus: "Esodo",
			Psalms: "Salmi",
			Matthew: "Matteo",
			John: "Giovanni",
			Revelation: "Apocalisse"
		}
	},
	sw: {
		chooseLanguageTitle: "Chagua Lugha Yako",
		chooseLanguageFooter: "Chagua lugha yako kuanza chemsha bongo",
		dailyBibleVerse: "Mstari wa Siku",
		searchPlaceholder: "Tafuta mistari katika Biblia",
		listen: "Sikiliza",
		stop: "Simama",
		previous: "Uliopita",
		random: "Nasibu",
		copy: "Nakili",
		share: "Shiriki",
		bookmark: "Hifadhi",
		savedWord: "Imehifadhiwa",
		copiedToast: "Mstari umenakiliwa",
		sharedToast: "Mstari uko tayari kushirikiwa",
		bookmarkedToast: "Umehifadhiwa kwenye mistari yako",
		removedToast: "Umeondolewa kwenye mistari iliyohifadhiwa",
		noSearchMatches: "Hakuna mistari inayolingana",
		clearSearch: "Weka upya",
		autoNextIn: "Inayofuata baada ya {sec}s",
		autoNextPaused: "Imesimamishwa",
		pauseAutoNext: "Simamisha",
		resumeAutoNext: "Endelea",
		tabHome: "Nyumbani",
		tabQuiz: "Maswali",
		tabSaved: "Hifadhi",
		tabProfile: "Wasifu",
		questionProgressPill: "Swali {current} kati ya {total}",
		completedProgress: "Maendeleo · {done} kati ya {total} yamekamilika",
		correctFeedback: "Hongera! Sahihi",
		wrongFeedback: "Jaribu tena!",
		timesUpFeedback: "Muda umekwisha!",
		addTimeAria: "Ongeza sekunde 15 kwa sarafu 5",
		addTimeToast: "Sekunde +15 zimeongezwa! (-5 sarafu)",
		notEnoughCoinsToast: "Unahitaji sarafu 5 kuongeza +15s",
		readingQuestionHint: "Inasoma… muda utaanza baada ya sauti",
		referenceLabel: "Rejea",
		nextQuestion: "Ifuatayo",
		quizCompleteTitle: "Maswali Yamekamilika!",
		quizCompleteSubtitle: "Kazi nzuri kuchunguza Neno la Mungu leo",
		coinsEarnedLabel: "Sarafu za Dhahabu",
		scoreLabel: "Alama",
		playAgain: "Cheza Tena",
		quizSettingsBtn: "Mipangilio ya Maswali",
		doubleCoinsBtn: "Tazama Video · Mara 2 Sarafu (+{bonus})",
		coinsDoubledBadge: "Sarafu Zimeongezwa Mara 2!",
		rewardAdTitle: "Hadithi za Sauti za Biblia",
		rewardAdSponsor: "Sikiliza hadithi njema za Biblia na familia kila jioni.",
		rewardAdCountdown: "Zawadi baada ya {sec}s",
		rewardAdUnlockedTitle: "Zawadi Iko Tayari!",
		claimDoubleCoinsBtn: "Kusanya Sarafu +{bonus}",
		rewardAdCancel: "Funga bila nyongeza",
		rewardAdEarnedToast: "Sarafu +{bonus} za ziada zimeongezwa!",
		settingsTitle: "Mipangilio",
		ageCardTitle: "1. Umri wa Mtumiaji",
		ageKids: "Watoto",
		ageKidsRange: "5–9",
		ageTeens: "Vijana",
		ageTeensRange: "10–17",
		ageAdults: "Watu Wazima",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Kitabu cha Biblia",
		allBooks: "Vitabu Vyote",
		voiceCardTitle: "3. Aina ya Sauti",
		voiceFemale: "Sauti ya Kike",
		voiceMale: "Sauti ya Kiume",
		voiceTeen: "Sauti ya Kijana",
		voiceKids: "Sauti ya Mtoto",
		saveSettings: "Hifadhi Mipangilio",
		settingsSavedToast: "Mipangilio imehifadhiwa",
		voiceUpdatedSample: "Sauti imesasishwa!",
		voiceSpeedLabel: "Kasi",
		voicePitchLabel: "Mlio",
		previewVoiceBtn: "Sikiliza",
		savedVersesTitle: "Mistari Iliyohifadhiwa",
		savedEmptyTitle: "Hakuna mistari iliyohifadhiwa",
		savedEmptySubtitle: "Gusa Hifadhi kwenye mstari wowote kuuweka hapa.",
		browseVersesBtn: "Vinjari Mistari",
		pageLabel: "Ukurasa {page} kati ya {total}",
		remove: "Ondoa",
		profileTitle: "Wasifu Wangu",
		totalCoins: "Sarafu za Dhahabu",
		quizzesDone: "Maswali",
		dayStreak: "Mfululizo",
		languageSettingLabel: "Lugha ya Programu",
		quizSettingsLabel: "Ugumu na Sauti",
		soundEffectsLabel: "Sauti za Mchezo",
		soundOn: "Washa",
		soundOff: "Zima",
		adBannerLabel: "Tangazo",
		adBannerText: "Hadithi za Sauti za Biblia kwa Familia — Jaribu Bure",
		shareAchievement: "Shiriki Mafanikio",
		achievementCardTitle: "Safari Yangu ya Biblia",
		achievementSummaryText: "Nimepata sarafu {coins} za dhahabu na mfululizo wa siku {streak} kwenye Bible Quest: Daily Verse & Quiz!",
		saveCardImage: "Hifadhi Kadi",
		copySummary: "Nakili Maelezo",
		achievementCopiedToast: "Muhtasari umenakiliwa",
		achievementSavedToast: "Kadi ya mafanikio imehifadhiwa",
		closeLabel: "Funga",
		bookNames: {
			all: "Vitabu Vyote",
			Genesis: "Mwanzo",
			Exodus: "Kutoka",
			Psalms: "Zaburi",
			Matthew: "Mathayo",
			John: "Yohana",
			Revelation: "Ufunuo"
		}
	},
	fr: {
		chooseLanguageTitle: "Choisissez Votre Langue",
		chooseLanguageFooter: "Sélectionnez votre langue pour commencer le quiz",
		dailyBibleVerse: "Verset du Jour",
		searchPlaceholder: "Rechercher des versets bibliques",
		listen: "Écouter",
		stop: "Arrêter",
		previous: "Précédent",
		random: "Aléatoire",
		copy: "Copier",
		share: "Partager",
		bookmark: "Sauver",
		savedWord: "Enregistré",
		copiedToast: "Verset copié",
		sharedToast: "Verset prêt à partager",
		bookmarkedToast: "Ajouté aux versets enregistrés",
		removedToast: "Retiré des favoris",
		noSearchMatches: "Aucun verset trouvé",
		clearSearch: "Effacer",
		autoNextIn: "Suivant dans {sec}s",
		autoNextPaused: "En pause",
		pauseAutoNext: "Pause",
		resumeAutoNext: "Lire",
		tabHome: "Accueil",
		tabQuiz: "Quiz",
		tabSaved: "Favoris",
		tabProfile: "Profil",
		questionProgressPill: "Question {current} sur {total}",
		completedProgress: "Progrès · {done} sur {total} terminées",
		correctFeedback: "Bravo ! Bonne réponse",
		wrongFeedback: "Bien essayé !",
		timesUpFeedback: "Temps écoulé !",
		addTimeAria: "Ajouter 15 secondes pour 5 pièces d’or",
		addTimeToast: "+15s ajoutées ! (-5 pièces)",
		notEnoughCoinsToast: "Il faut 5 pièces d’or pour +15s",
		readingQuestionHint: "Écoute… le chrono démarre après la voix",
		referenceLabel: "Réf",
		nextQuestion: "Suivant",
		quizCompleteTitle: "Quiz Terminé !",
		quizCompleteSubtitle: "Beau travail dans la Parole aujourd’hui",
		coinsEarnedLabel: "Pièces d’Or",
		scoreLabel: "Score",
		playAgain: "Rejouer",
		quizSettingsBtn: "Paramètres du Quiz",
		doubleCoinsBtn: "Voir la Vidéo · Doubler (+{bonus})",
		coinsDoubledBadge: "Pièces Doublées (2x) !",
		rewardAdTitle: "Histoires Bibliques Audio",
		rewardAdSponsor: "Écoutez des récits bibliques inspirants en famille chaque soir.",
		rewardAdCountdown: "Bonus dans {sec}s",
		rewardAdUnlockedTitle: "Bonus Débloqué !",
		claimDoubleCoinsBtn: "Recevoir +{bonus} Pièces",
		rewardAdCancel: "Fermer sans bonus",
		rewardAdEarnedToast: "+{bonus} pièces d’or bonus ajoutées !",
		settingsTitle: "Paramètres",
		ageCardTitle: "1. Âge de l’utilisateur",
		ageKids: "Enfants",
		ageKidsRange: "5–9",
		ageTeens: "Ados",
		ageTeensRange: "10–17",
		ageAdults: "Adultes",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Livre de la Bible",
		allBooks: "Tous les Livres",
		voiceCardTitle: "3. Type de Voix",
		voiceFemale: "Voix Féminine",
		voiceMale: "Voix Masculine",
		voiceTeen: "Voix Ado",
		voiceKids: "Voix Enfant",
		saveSettings: "Enregistrer",
		settingsSavedToast: "Paramètres enregistrés",
		voiceUpdatedSample: "Voix mise à jour !",
		voiceSpeedLabel: "Vitesse",
		voicePitchLabel: "Hauteur",
		previewVoiceBtn: "Tester",
		savedVersesTitle: "Versets Enregistrés",
		savedEmptyTitle: "Aucun verset enregistré",
		savedEmptySubtitle: "Appuyez sur Sauver pour garder un verset ici.",
		browseVersesBtn: "Voir les Versets",
		pageLabel: "Page {page} sur {total}",
		remove: "Retirer",
		profileTitle: "Mon Profil",
		totalCoins: "Pièces d’Or",
		quizzesDone: "Quiz Joués",
		dayStreak: "Série",
		languageSettingLabel: "Langue de l’application",
		quizSettingsLabel: "Difficulté et Voix",
		soundEffectsLabel: "Effets Sonores",
		soundOn: "Activé",
		soundOff: "Désactivé",
		adBannerLabel: "Pub",
		adBannerText: "Histoires Bibliques Audio en Famille — Essai Gratuit",
		shareAchievement: "Partager mes Progrès",
		achievementCardTitle: "Mon Parcours Biblique",
		achievementSummaryText: "J’ai gagné {coins} pièces d’or et atteint une série de {streak} jours sur Bible Quest: Daily Verse & Quiz !",
		saveCardImage: "Enregistrer",
		copySummary: "Copier le Texte",
		achievementCopiedToast: "Résumé copié",
		achievementSavedToast: "Carte enregistrée",
		closeLabel: "Fermer",
		bookNames: {
			all: "Tous les Livres",
			Genesis: "Genèse",
			Exodus: "Exode",
			Psalms: "Psaumes",
			Matthew: "Matthieu",
			John: "Jean",
			Revelation: "Apocalypse"
		}
	},
	es: {
		chooseLanguageTitle: "Elige Tu Idioma",
		chooseLanguageFooter: "Selecciona tu idioma para comenzar el quiz",
		dailyBibleVerse: "Versículo Diario",
		searchPlaceholder: "Buscar versículos en la Biblia",
		listen: "Escuchar",
		stop: "Parar",
		previous: "Anterior",
		random: "Aleatorio",
		copy: "Copiar",
		share: "Compartir",
		bookmark: "Guardar",
		savedWord: "Guardado",
		copiedToast: "Versículo copiado",
		sharedToast: "Listo para compartir",
		bookmarkedToast: "Guardado en tus favoritos",
		removedToast: "Eliminado de guardados",
		noSearchMatches: "No se encontraron versículos",
		clearSearch: "Limpiar",
		autoNextIn: "Siguiente en {sec}s",
		autoNextPaused: "En pausa",
		pauseAutoNext: "Pausa",
		resumeAutoNext: "Seguir",
		tabHome: "Inicio",
		tabQuiz: "Quiz",
		tabSaved: "Guardados",
		tabProfile: "Perfil",
		questionProgressPill: "Pregunta {current} de {total}",
		completedProgress: "Progreso · {done} de {total} completadas",
		correctFeedback: "¡Excelente! Correcto",
		wrongFeedback: "¡Buen intento!",
		timesUpFeedback: "¡Se acabó el tiempo!",
		addTimeAria: "Añadir 15 segundos por 5 monedas de oro",
		addTimeToast: "¡+15s añadidos! (-5 monedas)",
		notEnoughCoinsToast: "Necesitas 5 monedas para +15s",
		readingQuestionHint: "Escuchando… el reloj inicia tras la voz",
		referenceLabel: "Ref",
		nextQuestion: "Siguiente",
		quizCompleteTitle: "¡Quiz Completado!",
		quizCompleteSubtitle: "Gran trabajo explorando la Palabra hoy",
		coinsEarnedLabel: "Monedas de Oro",
		scoreLabel: "Puntaje",
		playAgain: "Jugar de Nuevo",
		quizSettingsBtn: "Ajustes del Quiz",
		doubleCoinsBtn: "Ver Video · Doblar Monedas (+{bonus})",
		coinsDoubledBadge: "¡Monedas Duplicadas (2x)!",
		rewardAdTitle: "Audiocuentos Bíblicos en Familia",
		rewardAdSponsor: "Disfruta historias bíblicas narradas cada noche en familia.",
		rewardAdCountdown: "Premio en {sec}s",
		rewardAdUnlockedTitle: "¡Premio Listo!",
		claimDoubleCoinsBtn: "Cobrar +{bonus} Monedas",
		rewardAdCancel: "Cerrar sin bono",
		rewardAdEarnedToast: "¡+{bonus} monedas de oro añadidas!",
		settingsTitle: "Ajustes",
		ageCardTitle: "1. Edad del Usuario",
		ageKids: "Niños",
		ageKidsRange: "5–9",
		ageTeens: "Jóvenes",
		ageTeensRange: "10–17",
		ageAdults: "Adultos",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Libro de la Biblia",
		allBooks: "Todos los Libros",
		voiceCardTitle: "3. Tipo de Voz",
		voiceFemale: "Voz Femenina",
		voiceMale: "Voz Masculina",
		voiceTeen: "Voz Juvenil",
		voiceKids: "Voz Infantil",
		saveSettings: "Guardar Ajustes",
		settingsSavedToast: "Ajustes guardados",
		voiceUpdatedSample: "¡Voz actualizada!",
		voiceSpeedLabel: "Velocidad",
		voicePitchLabel: "Tono",
		previewVoiceBtn: "Probar",
		savedVersesTitle: "Versículos Guardados",
		savedEmptyTitle: "Aún no hay guardados",
		savedEmptySubtitle: "Toca Guardar en cualquier versículo diario.",
		browseVersesBtn: "Ver Versículos",
		pageLabel: "Página {page} de {total}",
		remove: "Quitar",
		profileTitle: "Mi Perfil",
		totalCoins: "Monedas de Oro",
		quizzesDone: "Quizzes",
		dayStreak: "Racha",
		languageSettingLabel: "Idioma de la App",
		quizSettingsLabel: "Dificultad y Voz",
		soundEffectsLabel: "Efectos de Sonido",
		soundOn: "Sí",
		soundOff: "No",
		adBannerLabel: "Anuncio",
		adBannerText: "Audiocuentos Bíblicos en Familia — Prueba Gratis",
		shareAchievement: "Compartir Logros",
		achievementCardTitle: "Mi Camino Bíblico",
		achievementSummaryText: "¡Logré {coins} monedas de oro y una racha de {streak} días en Bible Quest: Daily Verse & Quiz!",
		saveCardImage: "Guardar Tarjeta",
		copySummary: "Copiar Texto",
		achievementCopiedToast: "Resumen copiado",
		achievementSavedToast: "Tarjeta guardada",
		closeLabel: "Cerrar",
		bookNames: {
			all: "Todos los Libros",
			Genesis: "Génesis",
			Exodus: "Éxodo",
			Psalms: "Salmos",
			Matthew: "Mateo",
			John: "Juan",
			Revelation: "Apocalipsis"
		}
	},
	pt: {
		chooseLanguageTitle: "Escolha Seu Idioma",
		chooseLanguageFooter: "Selecione seu idioma para iniciar o quiz",
		dailyBibleVerse: "Versículo Diário",
		searchPlaceholder: "Buscar versículos na Bíblia",
		listen: "Ouvir",
		stop: "Parar",
		previous: "Anterior",
		random: "Aleatório",
		copy: "Copiar",
		share: "Partilhar",
		bookmark: "Salvar",
		savedWord: "Salvo",
		copiedToast: "Versículo copiado",
		sharedToast: "Pronto para partilhar",
		bookmarkedToast: "Salvo nos seus favoritos",
		removedToast: "Removido dos salvos",
		noSearchMatches: "Nenhum versículo encontrado",
		clearSearch: "Limpar",
		autoNextIn: "Próximo em {sec}s",
		autoNextPaused: "Pausado",
		pauseAutoNext: "Pausar",
		resumeAutoNext: "Continuar",
		tabHome: "Início",
		tabQuiz: "Quiz",
		tabSaved: "Salvos",
		tabProfile: "Perfil",
		questionProgressPill: "Pergunta {current} de {total}",
		completedProgress: "Progresso · {done} de {total} concluídas",
		correctFeedback: "Muito bem! Correto",
		wrongFeedback: "Boa tentativa!",
		timesUpFeedback: "Tempo esgotado!",
		addTimeAria: "Adicionar 15 segundos por 5 moedas",
		addTimeToast: "+15s adicionados! (-5 moedas)",
		notEnoughCoinsToast: "Precisa de 5 moedas para +15s",
		readingQuestionHint: "Ouvindo… o tempo começa após a voz",
		referenceLabel: "Ref",
		nextQuestion: "Próxima",
		quizCompleteTitle: "Quiz Concluído!",
		quizCompleteSubtitle: "Ótimo trabalho explorando a Palavra hoje",
		coinsEarnedLabel: "Moedas de Ouro",
		scoreLabel: "Pontuação",
		playAgain: "Jogar Novamente",
		quizSettingsBtn: "Configurações",
		doubleCoinsBtn: "Ver Vídeo · Dobrar Moedas (+{bonus})",
		coinsDoubledBadge: "Moedas Dobradas (2x)!",
		rewardAdTitle: "Histórias Bíblicas em Áudio",
		rewardAdSponsor: "Ouça belas histórias da Bíblia em família todas as noites.",
		rewardAdCountdown: "Prêmio em {sec}s",
		rewardAdUnlockedTitle: "Prêmio Pronto!",
		claimDoubleCoinsBtn: "Resgatar +{bonus} Moedas",
		rewardAdCancel: "Fechar sem bônus",
		rewardAdEarnedToast: "+{bonus} moedas de ouro adicionadas!",
		settingsTitle: "Configurações",
		ageCardTitle: "1. Idade do Usuário",
		ageKids: "Crianças",
		ageKidsRange: "5–9",
		ageTeens: "Jovens",
		ageTeensRange: "10–17",
		ageAdults: "Adultos",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Livro da Bíblia",
		allBooks: "Todos os Livros",
		voiceCardTitle: "3. Voz do Narrador",
		voiceFemale: "Voz Feminina",
		voiceMale: "Voz Masculina",
		voiceTeen: "Voz Adolescente",
		voiceKids: "Voz Infantil",
		saveSettings: "Salvar Configurações",
		settingsSavedToast: "Configurações salvas",
		voiceUpdatedSample: "Voz atualizada!",
		voiceSpeedLabel: "Velocidade",
		voicePitchLabel: "Tom",
		previewVoiceBtn: "Ouvir",
		savedVersesTitle: "Versículos Salvos",
		savedEmptyTitle: "Nenhum versículo salvo",
		savedEmptySubtitle: "Toque em Salvar em qualquer versículo diário.",
		browseVersesBtn: "Ver Versículos",
		pageLabel: "Página {page} de {total}",
		remove: "Remover",
		profileTitle: "Meu Perfil",
		totalCoins: "Moedas de Ouro",
		quizzesDone: "Quizzes",
		dayStreak: "Sequência",
		languageSettingLabel: "Idioma do App",
		quizSettingsLabel: "Dificuldade e Voz",
		soundEffectsLabel: "Efeitos Sonoros",
		soundOn: "Ativo",
		soundOff: "Mudo",
		adBannerLabel: "Anúncio",
		adBannerText: "Histórias Bíblicas em Áudio — Teste Grátis",
		shareAchievement: "Partilhar Conquistas",
		achievementCardTitle: "Minha Jornada Bíblica",
		achievementSummaryText: "Conquistei {coins} moedas de ouro e uma sequência de {streak} dias no Bible Quest: Daily Verse & Quiz!",
		saveCardImage: "Salvar Cartão",
		copySummary: "Copiar Texto",
		achievementCopiedToast: "Resumo copiado",
		achievementSavedToast: "Cartão salvo",
		closeLabel: "Fechar",
		bookNames: {
			all: "Todos os Livros",
			Genesis: "Gênesis",
			Exodus: "Êxodo",
			Psalms: "Salmos",
			Matthew: "Mateus",
			John: "João",
			Revelation: "Apocalipse"
		}
	},
	de: {
		chooseLanguageTitle: "Wähle Deine Sprache",
		chooseLanguageFooter: "Wähle deine Sprache, um das Quiz zu starten",
		dailyBibleVerse: "Täglicher Bibelvers",
		searchPlaceholder: "Bibelverse durchsuchen",
		listen: "Anhören",
		stop: "Stopp",
		previous: "Zurück",
		random: "Zufällig",
		copy: "Kopieren",
		share: "Teilen",
		bookmark: "Merken",
		savedWord: "Gespeichert",
		copiedToast: "Vers kopiert",
		sharedToast: "Bereit zum Teilen",
		bookmarkedToast: "Zu Favoriten hinzugefügt",
		removedToast: "Aus Favoriten entfernt",
		noSearchMatches: "Keine Verse gefunden",
		clearSearch: "Leeren",
		autoNextIn: "Weiter in {sec}s",
		autoNextPaused: "Pausiert",
		pauseAutoNext: "Pause",
		resumeAutoNext: "Start",
		tabHome: "Start",
		tabQuiz: "Quiz",
		tabSaved: "Merkliste",
		tabProfile: "Profil",
		questionProgressPill: "Frage {current} von {total}",
		completedProgress: "Fortschritt · {done} von {total} erledigt",
		correctFeedback: "Super! Richtig",
		wrongFeedback: "Guter Versuch!",
		timesUpFeedback: "Zeit abgelaufen!",
		addTimeAria: "15 Sekunden für 5 Goldmünzen hinzufügen",
		addTimeToast: "+15s hinzugefügt! (-5 Münzen)",
		notEnoughCoinsToast: "5 Goldmünzen für +15s nötig",
		readingQuestionHint: "Vorlesen… Timer startet nach der Stimme",
		referenceLabel: "Stelle",
		nextQuestion: "Weiter",
		quizCompleteTitle: "Quiz Beendet!",
		quizCompleteSubtitle: "Tolle Leistung heute beim Bibel-Quiz",
		coinsEarnedLabel: "Goldmünzen",
		scoreLabel: "Punkte",
		playAgain: "Nochmal Spielen",
		quizSettingsBtn: "Quiz-Einstellungen",
		doubleCoinsBtn: "Video ansehen · 2x Münzen (+{bonus})",
		coinsDoubledBadge: "Münzen verdoppelt (2x)!",
		rewardAdTitle: "Bibelgeschichten als Hörbuch",
		rewardAdSponsor: "Jeden Abend gemeinsam spannende Bibelgeschichten hören.",
		rewardAdCountdown: "Bonus in {sec}s",
		rewardAdUnlockedTitle: "Bonus Bereit!",
		claimDoubleCoinsBtn: "+{bonus} Bonusmünzen holen",
		rewardAdCancel: "Ohne Bonus schließen",
		rewardAdEarnedToast: "+{bonus} Bonus-Goldmünzen gutgeschrieben!",
		settingsTitle: "Einstellungen",
		ageCardTitle: "1. Alter des Nutzers",
		ageKids: "Kinder",
		ageKidsRange: "5–9",
		ageTeens: "Teens",
		ageTeensRange: "10–17",
		ageAdults: "Erwachsene",
		ageAdultsRange: "18+",
		bookCardTitle: "2. Buch der Bibel",
		allBooks: "Alle Bücher",
		voiceCardTitle: "3. Stimmfarbe",
		voiceFemale: "Weibliche Stimme",
		voiceMale: "Männliche Stimme",
		voiceTeen: "Jugendstimme",
		voiceKids: "Kinderstimme",
		saveSettings: "Einstellungen Speichern",
		settingsSavedToast: "Einstellungen gespeichert",
		voiceUpdatedSample: "Stimme aktualisiert!",
		voiceSpeedLabel: "Tempo",
		voicePitchLabel: "Tonhöhe",
		previewVoiceBtn: "Testen",
		savedVersesTitle: "Gespeicherte Verse",
		savedEmptyTitle: "Noch keine Verse gemerkt",
		savedEmptySubtitle: "Tippe auf Merken bei einem Tagesvers.",
		browseVersesBtn: "Verse Ansehen",
		pageLabel: "Seite {page} von {total}",
		remove: "Entfernen",
		profileTitle: "Mein Profil",
		totalCoins: "Goldmünzen",
		quizzesDone: "Quizze",
		dayStreak: "Tage-Serie",
		languageSettingLabel: "App-Sprache",
		quizSettingsLabel: "Stufe & Stimme",
		soundEffectsLabel: "Toneffekte",
		soundOn: "An",
		soundOff: "Aus",
		adBannerLabel: "Anzeige",
		adBannerText: "Bibelgeschichten als Hörbuch für Familien — Gratis testen",
		shareAchievement: "Erfolg Teilen",
		achievementCardTitle: "Meine Bibel-Reise",
		achievementSummaryText: "Ich habe {coins} Goldmünzen und eine {streak}-Tage-Serie bei Bible Quest: Daily Verse & Quiz erreicht!",
		saveCardImage: "Karte Speichern",
		copySummary: "Text Kopieren",
		achievementCopiedToast: "Erfolg kopiert",
		achievementSavedToast: "Erfolgskarte gespeichert",
		closeLabel: "Schließen",
		bookNames: {
			all: "Alle Bücher",
			Genesis: "1. Mose",
			Exodus: "2. Mose",
			Psalms: "Psalmen",
			Matthew: "Matthäus",
			John: "Johannes",
			Revelation: "Offenbarung"
		}
	},
	ar: {
		chooseLanguageTitle: "اختر لغتك",
		chooseLanguageFooter: "اختر لغتك لبدء المسابقة",
		dailyBibleVerse: "آية اليوم",
		searchPlaceholder: "ابحث في آيات الكتاب المقدس",
		listen: "استمع",
		stop: "إيقاف",
		previous: "السابق",
		random: "عشوائي",
		copy: "نسخ",
		share: "مشاركة",
		bookmark: "حفظ",
		savedWord: "محفوظة",
		copiedToast: "تم نسخ الآية",
		sharedToast: "الآية جاهزة للمشاركة",
		bookmarkedToast: "تم الحفظ في المفضلة",
		removedToast: "تمت الإزالة من المحفوظات",
		noSearchMatches: "لا توجد آيات مطابقة",
		clearSearch: "مسح",
		autoNextIn: "التالي خلال {sec}ث",
		autoNextPaused: "متوقف مؤقتاً",
		pauseAutoNext: "إيقاف",
		resumeAutoNext: "تشغيل",
		tabHome: "الرئيسية",
		tabQuiz: "المسابقة",
		tabSaved: "المحفوظة",
		tabProfile: "حسابي",
		questionProgressPill: "السؤال {current} من {total}",
		completedProgress: "التقدم · {done} من {total} مكتمل",
		correctFeedback: "أحسنت! إجابة صحيحة",
		wrongFeedback: "محاولة جيدة!",
		timesUpFeedback: "انتهى الوقت!",
		addTimeAria: "أضف 15 ثانية مقابل 5 عملات ذهبية",
		addTimeToast: "تمت إضافة +15 ثانية! (-5 عملات)",
		notEnoughCoinsToast: "تحتاج إلى 5 عملات لإضافة +15ث",
		readingQuestionHint: "جارٍ الاستماع… يبدأ المؤقت بعد الصوت",
		referenceLabel: "المرجع",
		nextQuestion: "التالي",
		quizCompleteTitle: "اكتملت المسابقة!",
		quizCompleteSubtitle: "عمل رائع في تأمل كلمة الله اليوم",
		coinsEarnedLabel: "عملات ذهبية",
		scoreLabel: "النتيجة",
		playAgain: "العب مجدداً",
		quizSettingsBtn: "إعدادات المسابقة",
		doubleCoinsBtn: "شاهد فيديو · ضاعف العملات (+{bonus})",
		coinsDoubledBadge: "تمت مضاعفة العملات (2x)!",
		rewardAdTitle: "قصص الكتاب المقدس الصوتية",
		rewardAdSponsor: "استمتع بقصص الكتاب المقدس الصوتية مع العائلة كل مساء.",
		rewardAdCountdown: "المكافأة خلال {sec}ث",
		rewardAdUnlockedTitle: "المكافأة جاهزة!",
		claimDoubleCoinsBtn: "اجمع +{bonus} عملة",
		rewardAdCancel: "إغلاق بدون مكافأة",
		rewardAdEarnedToast: "تمت إضافة +{bonus} عملة ذهبية!",
		settingsTitle: "الإعدادات",
		ageCardTitle: "١. عمر المستخدم",
		ageKids: "أطفال",
		ageKidsRange: "5–9",
		ageTeens: "ناشئة",
		ageTeensRange: "10–17",
		ageAdults: "كبار",
		ageAdultsRange: "18+",
		bookCardTitle: "٢. سفر الكتاب المقدس",
		allBooks: "كل الأسفار",
		voiceCardTitle: "٣. نوع الصوت",
		voiceFemale: "صوت نسائي",
		voiceMale: "صوت رجالي",
		voiceTeen: "صوت شاب",
		voiceKids: "صوت طفل",
		saveSettings: "حفظ الإعدادات",
		settingsSavedToast: "تم حفظ الإعدادات",
		voiceUpdatedSample: "تم تحديث الصوت!",
		voiceSpeedLabel: "السرعة",
		voicePitchLabel: "النبرة",
		previewVoiceBtn: "معاينة",
		savedVersesTitle: "الآيات المحفوظة",
		savedEmptyTitle: "لا توجد آيات محفوظة بعد",
		savedEmptySubtitle: "اضغط على حفظ لإضافة أي آية هنا.",
		browseVersesBtn: "تصفح الآيات",
		pageLabel: "صفحة {page} من {total}",
		remove: "إزالة",
		profileTitle: "ملفي الشخصي",
		totalCoins: "العملات الذهبية",
		quizzesDone: "المسابقات",
		dayStreak: "أيام التتابع",
		languageSettingLabel: "لغة التطبيق",
		quizSettingsLabel: "المستوى والصوت",
		soundEffectsLabel: "المؤثرات الصوتية",
		soundOn: "تشغيل",
		soundOff: "إيقاف",
		adBannerLabel: "إعلان",
		adBannerText: "قصص الكتاب المقدس الصوتية للعائلة — تجربة مجانية",
		shareAchievement: "مشاركة الإنجاز",
		achievementCardTitle: "رحلتي مع الكتاب المقدس",
		achievementSummaryText: "حصلت على {coins} عملة ذهبية ووصلت إلى تتابع {streak} أيام في Bible Quest: Daily Verse & Quiz!",
		saveCardImage: "حفظ البطاقة",
		copySummary: "نسخ النص",
		achievementCopiedToast: "تم نسخ ملخص الإنجاز",
		achievementSavedToast: "تم حفظ بطاقة الإنجاز",
		closeLabel: "إغلاق",
		bookNames: {
			all: "كل الأسفار",
			Genesis: "التكوين",
			Exodus: "الخروج",
			Psalms: "المزامير",
			Matthew: "متى",
			John: "يوحنا",
			Revelation: "الرؤيا"
		}
	},
	hi: {
		chooseLanguageTitle: "अपनी भाषा चुनें",
		chooseLanguageFooter: "क्विज़ शुरू करने के लिए अपनी भाषा चुनें",
		dailyBibleVerse: "दैनिक बाइबिल वचन",
		searchPlaceholder: "बाइबिल में वचन खोजें",
		listen: "सुनें",
		stop: "रोकें",
		previous: "पिछला",
		random: "रैंडम",
		copy: "कॉपी",
		share: "शेयर",
		bookmark: "सेव",
		savedWord: "सेव किया",
		copiedToast: "वचन कॉपी हो गया",
		sharedToast: "शेयर करने के लिए तैयार",
		bookmarkedToast: "आपके वचनों में सेव किया गया",
		removedToast: "सेव किए वचनों से हटाया गया",
		noSearchMatches: "कोई वचन नहीं मिला",
		clearSearch: "साफ़ करें",
		autoNextIn: "अगला {sec}s में",
		autoNextPaused: "रुका हुआ",
		pauseAutoNext: "रोकें",
		resumeAutoNext: "चलाएँ",
		tabHome: "होम",
		tabQuiz: "क्विज़",
		tabSaved: "सेव्ड",
		tabProfile: "प्रोफ़ाइल",
		questionProgressPill: "प्रश्न {current} / {total}",
		completedProgress: "प्रगति · {done} / {total} पूर्ण",
		correctFeedback: "शाबाश! बिल्कुल सही",
		wrongFeedback: "अच्छा प्रयास!",
		timesUpFeedback: "समय समाप्त!",
		addTimeAria: "5 सोने के सिक्कों में 15 सेकंड बढ़ाएँ",
		addTimeToast: "+15 सेकंड जोड़े गए! (-5 सिक्के)",
		notEnoughCoinsToast: "+15s के लिए 5 सिक्के चाहिए",
		readingQuestionHint: "सुन रहे हैं… आवाज़ के बाद टाइमर शुरू होगा",
		referenceLabel: "संदर्भ",
		nextQuestion: "अगला",
		quizCompleteTitle: "क्विज़ पूरा हुआ!",
		quizCompleteSubtitle: "आज परमेश्वर के वचन के साथ शानदार समय",
		coinsEarnedLabel: "मिले सोने के सिक्के",
		scoreLabel: "स्कोर",
		playAgain: "फिर खेलें",
		quizSettingsBtn: "क्विज़ सेटिंग्स",
		doubleCoinsBtn: "वीडियो देखें · दोगुने सिक्के (+{bonus})",
		coinsDoubledBadge: "सिक्के दोगुने हो गए (2x)!",
		rewardAdTitle: "परिवार बाइबिल ऑडियो कहानियाँ",
		rewardAdSponsor: "हर शाम परिवार के साथ प्रेरणादायक बाइबिल कहानियाँ सुनें।",
		rewardAdCountdown: "{sec} सेकंड में इनाम",
		rewardAdUnlockedTitle: "इनाम तैयार है!",
		claimDoubleCoinsBtn: "+{bonus} बोनस सिक्के लें",
		rewardAdCancel: "बिना बोनस बंद करें",
		rewardAdEarnedToast: "+{bonus} बोनस सोने के सिक्के जोड़े गए!",
		settingsTitle: "सेटिंग्स",
		ageCardTitle: "1. उपयोगकर्ता की आयु",
		ageKids: "बच्चे",
		ageKidsRange: "5–9",
		ageTeens: "किशोर",
		ageTeensRange: "10–17",
		ageAdults: "वयस्क",
		ageAdultsRange: "18+",
		bookCardTitle: "2. बाइबिल की पुस्तक",
		allBooks: "सभी पुस्तकें",
		voiceCardTitle: "3. आवाज़ चुनें",
		voiceFemale: "महिला आवाज़",
		voiceMale: "पुरुष आवाज़",
		voiceTeen: "किशोर आवाज़",
		voiceKids: "बच्चों की आवाज़",
		saveSettings: "सेटिंग्स सेव करें",
		settingsSavedToast: "सेटिंग्स सेव हो गईं",
		voiceUpdatedSample: "आवाज़ अपडेट हो गई!",
		voiceSpeedLabel: "गति",
		voicePitchLabel: "पिच",
		previewVoiceBtn: "सुनें",
		savedVersesTitle: "सेव किए गए वचन",
		savedEmptyTitle: "अभी कोई वचन सेव नहीं है",
		savedEmptySubtitle: "यहाँ रखने के लिए किसी भी वचन पर सेव दबाएँ।",
		browseVersesBtn: "वचन देखें",
		pageLabel: "पृष्ठ {page} / {total}",
		remove: "हटाएँ",
		profileTitle: "मेरी प्रोफ़ाइल",
		totalCoins: "सोने के सिक्के",
		quizzesDone: "क्विज़",
		dayStreak: "लगातार दिन",
		languageSettingLabel: "ऐप की भाषा",
		quizSettingsLabel: "स्तर और आवाज़",
		soundEffectsLabel: "ध्वनि प्रभाव",
		soundOn: "चालू",
		soundOff: "बंद",
		adBannerLabel: "विज्ञापन",
		adBannerText: "परिवार के लिए बाइबिल कहानियाँ ऑडियो — मुफ़्त ट्रायल",
		shareAchievement: "उपलब्धि शेयर करें",
		achievementCardTitle: "मेरी बाइबिल यात्रा",
		achievementSummaryText: "मैंने Bible Quest: Daily Verse & Quiz पर {coins} सोने के सिक्के और {streak} दिनों की स्ट्रीक हासिल की है!",
		saveCardImage: "कार्ड सेव करें",
		copySummary: "टेक्स्ट कॉपी करें",
		achievementCopiedToast: "उपलब्धि कॉपी हो गई",
		achievementSavedToast: "उपलब्धि कार्ड सेव हो गया",
		closeLabel: "बंद करें",
		bookNames: {
			all: "सभी पुस्तकें",
			Genesis: "उत्पत्ति",
			Exodus: "निर्गमन",
			Psalms: "भजन संहिता",
			Matthew: "मत्ती",
			John: "यूहन्ना",
			Revelation: "प्रकाशितवाक्य"
		}
	},
	zh: {
		chooseLanguageTitle: "选择您的语言",
		chooseLanguageFooter: "选择您的语言即可开始圣经问答",
		dailyBibleVerse: "每日圣经金句",
		searchPlaceholder: "搜索圣经金句",
		listen: "朗读",
		stop: "停止",
		previous: "上一句",
		random: "随机",
		copy: "复制",
		share: "分享",
		bookmark: "收藏",
		savedWord: "已收藏",
		copiedToast: "已复制金句",
		sharedToast: "已准备好分享",
		bookmarkedToast: "已保存到收藏夹",
		removedToast: "已从收藏中移除",
		noSearchMatches: "未找到匹配的经文",
		clearSearch: "重置",
		autoNextIn: "{sec}秒后自动切换",
		autoNextPaused: "已暂停",
		pauseAutoNext: "暂停",
		resumeAutoNext: "继续",
		tabHome: "首页",
		tabQuiz: "问答",
		tabSaved: "收藏",
		tabProfile: "我的",
		questionProgressPill: "第 {current} / {total} 题",
		completedProgress: "进度 · 已完成 {done} / {total}",
		correctFeedback: "太棒了！回答正确",
		wrongFeedback: "继续加油！",
		timesUpFeedback: "时间到！",
		addTimeAria: "花费 5 枚金币增加 15 秒",
		addTimeToast: "已增加 15 秒！(-5 金币)",
		notEnoughCoinsToast: "需要 5 枚金币才能加时 15 秒",
		readingQuestionHint: "正在朗读…语音结束后开始计时",
		referenceLabel: "出处",
		nextQuestion: "下一题",
		quizCompleteTitle: "问答完成！",
		quizCompleteSubtitle: "今天探索神的话语做得真棒",
		coinsEarnedLabel: "获得金币",
		scoreLabel: "得分",
		playAgain: "再玩一次",
		quizSettingsBtn: "问答设置",
		doubleCoinsBtn: "观看视频 · 双倍金币 (+{bonus})",
		coinsDoubledBadge: "金币已翻倍 (2x)！",
		rewardAdTitle: "家庭圣经有声故事",
		rewardAdSponsor: "每晚与家人一起聆听温暖人心的圣经故事。",
		rewardAdCountdown: "{sec}秒后获得奖励",
		rewardAdUnlockedTitle: "奖励已就绪！",
		claimDoubleCoinsBtn: "领取 +{bonus} 额外金币",
		rewardAdCancel: "关闭并放弃翻倍",
		rewardAdEarnedToast: "已额外获得 +{bonus} 金币！",
		settingsTitle: "设置",
		ageCardTitle: "1. 用户年龄",
		ageKids: "儿童",
		ageKidsRange: "5–9",
		ageTeens: "青少年",
		ageTeensRange: "10–17",
		ageAdults: "成人",
		ageAdultsRange: "18+",
		bookCardTitle: "2. 圣经书卷",
		allBooks: "全部书卷",
		voiceCardTitle: "3. 朗读声音",
		voiceFemale: "女声",
		voiceMale: "男声",
		voiceTeen: "少年声",
		voiceKids: "童声",
		saveSettings: "保存设置",
		settingsSavedToast: "设置已保存",
		voiceUpdatedSample: "语音已更新！",
		voiceSpeedLabel: "语速",
		voicePitchLabel: "音调",
		previewVoiceBtn: "试听",
		savedVersesTitle: "收藏的金句",
		savedEmptyTitle: "暂无收藏的金句",
		savedEmptySubtitle: "在每日金句页面点击收藏即可保存。",
		browseVersesBtn: "浏览金句",
		pageLabel: "第 {page} / {total} 页",
		remove: "移除",
		profileTitle: "个人主页",
		totalCoins: "金币总数",
		quizzesDone: "完成次数",
		dayStreak: "连续天数",
		languageSettingLabel: "应用语言",
		quizSettingsLabel: "难度与语音",
		soundEffectsLabel: "游戏音效",
		soundOn: "开启",
		soundOff: "关闭",
		adBannerLabel: "广告",
		adBannerText: "家庭圣经有声故事合集 — 免费体验",
		shareAchievement: "分享成就",
		achievementCardTitle: "我的圣经之旅",
		achievementSummaryText: "我在 Bible Quest: Daily Verse & Quiz 赢得了 {coins} 枚金币，并保持了 {streak} 天连续打卡！",
		saveCardImage: "保存卡片",
		copySummary: "复制文字",
		achievementCopiedToast: "已复制成就摘要",
		achievementSavedToast: "已保存成就卡片",
		closeLabel: "关闭",
		bookNames: {
			all: "全部书卷",
			Genesis: "创世记",
			Exodus: "出埃及记",
			Psalms: "诗篇",
			Matthew: "马太福音",
			John: "约翰福音",
			Revelation: "启示录"
		}
	}
};
// src/data/bibleBooks.ts
var BIBLE_BOOKS = [
	{
		id: 1,
		name: "Genesis",
		testament: "OT",
		chapters: 50
	},
	{
		id: 2,
		name: "Exodus",
		testament: "OT",
		chapters: 40
	},
	{
		id: 3,
		name: "Leviticus",
		testament: "OT",
		chapters: 27
	},
	{
		id: 4,
		name: "Numbers",
		testament: "OT",
		chapters: 36
	},
	{
		id: 5,
		name: "Deuteronomy",
		testament: "OT",
		chapters: 34
	},
	{
		id: 6,
		name: "Joshua",
		testament: "OT",
		chapters: 24
	},
	{
		id: 7,
		name: "Judges",
		testament: "OT",
		chapters: 21
	},
	{
		id: 8,
		name: "Ruth",
		testament: "OT",
		chapters: 4
	},
	{
		id: 9,
		name: "1 Samuel",
		testament: "OT",
		chapters: 31
	},
	{
		id: 10,
		name: "2 Samuel",
		testament: "OT",
		chapters: 24
	},
	{
		id: 11,
		name: "1 Kings",
		testament: "OT",
		chapters: 22
	},
	{
		id: 12,
		name: "2 Kings",
		testament: "OT",
		chapters: 25
	},
	{
		id: 13,
		name: "1 Chronicles",
		testament: "OT",
		chapters: 29
	},
	{
		id: 14,
		name: "2 Chronicles",
		testament: "OT",
		chapters: 36
	},
	{
		id: 15,
		name: "Ezra",
		testament: "OT",
		chapters: 10
	},
	{
		id: 16,
		name: "Nehemiah",
		testament: "OT",
		chapters: 13
	},
	{
		id: 17,
		name: "Esther",
		testament: "OT",
		chapters: 10
	},
	{
		id: 18,
		name: "Job",
		testament: "OT",
		chapters: 42
	},
	{
		id: 19,
		name: "Psalms",
		testament: "OT",
		chapters: 150
	},
	{
		id: 20,
		name: "Proverbs",
		testament: "OT",
		chapters: 31
	},
	{
		id: 21,
		name: "Ecclesiastes",
		testament: "OT",
		chapters: 12
	},
	{
		id: 22,
		name: "Song of Solomon",
		testament: "OT",
		chapters: 8
	},
	{
		id: 23,
		name: "Isaiah",
		testament: "OT",
		chapters: 66
	},
	{
		id: 24,
		name: "Jeremiah",
		testament: "OT",
		chapters: 52
	},
	{
		id: 25,
		name: "Lamentations",
		testament: "OT",
		chapters: 5
	},
	{
		id: 26,
		name: "Ezekiel",
		testament: "OT",
		chapters: 48
	},
	{
		id: 27,
		name: "Daniel",
		testament: "OT",
		chapters: 12
	},
	{
		id: 28,
		name: "Hosea",
		testament: "OT",
		chapters: 14
	},
	{
		id: 29,
		name: "Joel",
		testament: "OT",
		chapters: 3
	},
	{
		id: 30,
		name: "Amos",
		testament: "OT",
		chapters: 9
	},
	{
		id: 31,
		name: "Obadiah",
		testament: "OT",
		chapters: 1
	},
	{
		id: 32,
		name: "Jonah",
		testament: "OT",
		chapters: 4
	},
	{
		id: 33,
		name: "Micah",
		testament: "OT",
		chapters: 7
	},
	{
		id: 34,
		name: "Nahum",
		testament: "OT",
		chapters: 3
	},
	{
		id: 35,
		name: "Habakkuk",
		testament: "OT",
		chapters: 3
	},
	{
		id: 36,
		name: "Zephaniah",
		testament: "OT",
		chapters: 3
	},
	{
		id: 37,
		name: "Haggai",
		testament: "OT",
		chapters: 2
	},
	{
		id: 38,
		name: "Zechariah",
		testament: "OT",
		chapters: 14
	},
	{
		id: 39,
		name: "Malachi",
		testament: "OT",
		chapters: 4
	},
	{
		id: 40,
		name: "Matthew",
		testament: "NT",
		chapters: 28
	},
	{
		id: 41,
		name: "Mark",
		testament: "NT",
		chapters: 16
	},
	{
		id: 42,
		name: "Luke",
		testament: "NT",
		chapters: 24
	},
	{
		id: 43,
		name: "John",
		testament: "NT",
		chapters: 21
	},
	{
		id: 44,
		name: "Acts",
		testament: "NT",
		chapters: 28
	},
	{
		id: 45,
		name: "Romans",
		testament: "NT",
		chapters: 16
	},
	{
		id: 46,
		name: "1 Corinthians",
		testament: "NT",
		chapters: 16
	},
	{
		id: 47,
		name: "2 Corinthians",
		testament: "NT",
		chapters: 13
	},
	{
		id: 48,
		name: "Galatians",
		testament: "NT",
		chapters: 6
	},
	{
		id: 49,
		name: "Ephesians",
		testament: "NT",
		chapters: 6
	},
	{
		id: 50,
		name: "Philippians",
		testament: "NT",
		chapters: 4
	},
	{
		id: 51,
		name: "Colossians",
		testament: "NT",
		chapters: 4
	},
	{
		id: 52,
		name: "1 Thessalonians",
		testament: "NT",
		chapters: 5
	},
	{
		id: 53,
		name: "2 Thessalonians",
		testament: "NT",
		chapters: 3
	},
	{
		id: 54,
		name: "1 Timothy",
		testament: "NT",
		chapters: 6
	},
	{
		id: 55,
		name: "2 Timothy",
		testament: "NT",
		chapters: 4
	},
	{
		id: 56,
		name: "Titus",
		testament: "NT",
		chapters: 3
	},
	{
		id: 57,
		name: "Philemon",
		testament: "NT",
		chapters: 1
	},
	{
		id: 58,
		name: "Hebrews",
		testament: "NT",
		chapters: 13
	},
	{
		id: 59,
		name: "James",
		testament: "NT",
		chapters: 5
	},
	{
		id: 60,
		name: "1 Peter",
		testament: "NT",
		chapters: 5
	},
	{
		id: 61,
		name: "2 Peter",
		testament: "NT",
		chapters: 3
	},
	{
		id: 62,
		name: "1 John",
		testament: "NT",
		chapters: 5
	},
	{
		id: 63,
		name: "2 John",
		testament: "NT",
		chapters: 1
	},
	{
		id: 64,
		name: "3 John",
		testament: "NT",
		chapters: 1
	},
	{
		id: 65,
		name: "Jude",
		testament: "NT",
		chapters: 1
	},
	{
		id: 66,
		name: "Revelation",
		testament: "NT",
		chapters: 22
	}
];
var OLD_TESTAMENT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === "OT");
var NEW_TESTAMENT_BOOKS = BIBLE_BOOKS.filter((b) => b.testament === "NT");
// src/data/verses.ts
var BIBLE_VERSES = [
	{
		id: "john-3-16",
		book: "John",
		translations: {
			en: {
				reference: "John 3:16",
				highlightPrefix: "For God so loved the world,",
				text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
				version: "ESV",
				themes: ["Encouragement", "Love"]
			},
			it: {
				reference: "Giovanni 3:16",
				highlightPrefix: "Perché Dio ha tanto amato il mondo,",
				text: "Perché Dio ha tanto amato il mondo, che ha dato il suo unigenito Figlio, affinché chiunque crede in lui non perisca, ma abbia vita eterna.",
				version: "NR06",
				themes: ["Amore", "Speranza"]
			},
			sw: {
				reference: "Yohana 3:16",
				highlightPrefix: "Kwa maana jinsi hii Mungu aliupenda ulimwengu,",
				text: "Kwa maana jinsi hii Mungu aliupenda ulimwengu, hata akamtoa Mwanawe pekee, ili kila mtu amwaminiye asipotee, bali awe na uzima wa milele.",
				version: "SUV",
				themes: ["Upendo", "Tumaini"]
			},
			fr: {
				reference: "Jean 3:16",
				highlightPrefix: "Car Dieu a tant aimé le monde",
				text: "Car Dieu a tant aimé le monde qu’il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu’il ait la vie éternelle.",
				version: "LSG",
				themes: ["Amour", "Encouragement"]
			},
			es: {
				reference: "Juan 3:16",
				highlightPrefix: "Porque de tal manera amó Dios al mundo,",
				text: "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree no se pierda, mas tenga vida eterna.",
				version: "RVR",
				themes: ["Amor", "Esperanza"]
			},
			pt: {
				reference: "João 3:16",
				highlightPrefix: "Porque Deus amou o mundo de tal maneira",
				text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.",
				version: "ARC",
				themes: ["Amor", "Esperança"]
			},
			de: {
				reference: "Johannes 3,16",
				highlightPrefix: "Denn also hat Gott die Welt geliebt,",
				text: "Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, damit alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.",
				version: "LUT",
				themes: ["Liebe", "Ermutigung"]
			},
			ar: {
				reference: "يوحنا 3:16",
				highlightPrefix: "لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ",
				text: "لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ، لِكَيْ لاَ يَهْلِكَ كُلُّ مَنْ يُؤْمِنُ بِهِ، بَلْ تَكُونُ لَهُ الْحَيَاةُ الأَبَدِيَّةُ.",
				version: "SVD",
				themes: ["محبة", "رجاء"]
			},
			hi: {
				reference: "यूहन्ना 3:16",
				highlightPrefix: "क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा",
				text: "क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।",
				version: "OV",
				themes: ["प्रेम", "आशा"]
			},
			zh: {
				reference: "约翰福音 3:16",
				highlightPrefix: "神爱世人，",
				text: "神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不致灭亡，反得永生。",
				version: "CUNP",
				themes: ["大爱", "盼望"]
			}
		}
	},
	{
		id: "psalm-23-1",
		book: "Psalms",
		translations: {
			en: {
				reference: "Psalm 23:1–2",
				highlightPrefix: "The Lord is my shepherd;",
				text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.",
				version: "ESV",
				themes: ["Peace", "Comfort"]
			},
			it: {
				reference: "Salmo 23:1–2",
				highlightPrefix: "Il Signore è il mio pastore:",
				text: "Il Signore è il mio pastore: nulla mi manca. Egli mi fa riposare in verdeggianti pascoli, mi guida lungo le acque calme.",
				version: "NR06",
				themes: ["Pace", "Conforto"]
			},
			sw: {
				reference: "Zaburi 23:1–2",
				highlightPrefix: "Bwana ndiye mchungaji wangu,",
				text: "Bwana ndiye mchungaji wangu, sitapungukiwa na kitu. Katika malisho ya majani mabichi hunilaza, kando ya maji ya utulivu huniongoza.",
				version: "SUV",
				themes: ["Amani", "Faraja"]
			},
			fr: {
				reference: "Psaume 23:1–2",
				highlightPrefix: "L’Éternel est mon berger:",
				text: "L’Éternel est mon berger: je ne manquerai de rien. Il me fait reposer dans de verts pâturages, il me dirige près des eaux paisibles.",
				version: "LSG",
				themes: ["Paix", "Réconfort"]
			},
			es: {
				reference: "Salmos 23:1–2",
				highlightPrefix: "Jehová es mi pastor;",
				text: "Jehová es mi pastor; nada me faltará. En lugares de delicados pastos me hará descansar; junto a aguas de reposo me pastoreará.",
				version: "RVR",
				themes: ["Paz", "Consuelo"]
			},
			pt: {
				reference: "Salmos 23:1–2",
				highlightPrefix: "O Senhor é o meu pastor;",
				text: "O Senhor é o meu pastor; nada me faltará. Deitar-me faz em verdes pastos, guia-me mansamente a águas tranquilas.",
				version: "ARC",
				themes: ["Paz", "Cuidado"]
			},
			de: {
				reference: "Psalm 23,1–2",
				highlightPrefix: "Der Herr ist mein Hirte,",
				text: "Der Herr ist mein Hirte, mir wird nichts mangeln. Er weidet mich auf einer grünen Aue und führet mich zum frischen Wasser.",
				version: "LUT",
				themes: ["Frieden", "Trost"]
			},
			ar: {
				reference: "مزمور 23:1–2",
				highlightPrefix: "الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ.",
				text: "الرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ. فِي مَرَاعٍ خُضْرٍ يُرْبِضُنِي، إِلَى مِيَاهِ الرَّاحَةِ يُورِدُنِي.",
				version: "SVD",
				themes: ["سلام", "رعاية"]
			},
			hi: {
				reference: "भजन संहिता 23:1–2",
				highlightPrefix: "यहोवा मेरा चरवाहा है,",
				text: "यहोवा मेरा चरवाहा है, मुझे कुछ घटी न होगी। वह मुझे हरी हरी चराइयों में बैठाता है; वह मुझे सुखदाई जल के झरने के पास ले चलता है।",
				version: "OV",
				themes: ["शांति", "सांत्वना"]
			},
			zh: {
				reference: "诗篇 23:1–2",
				highlightPrefix: "耶和华是我的牧者，",
				text: "耶和华是我的牧者，我必不致缺乏。他使我躺卧在青草地上，领我在可安歇的水边。",
				version: "CUNP",
				themes: ["平安", "安慰"]
			}
		}
	},
	{
		id: "genesis-1-1",
		book: "Genesis",
		translations: {
			en: {
				reference: "Genesis 1:1",
				highlightPrefix: "In the beginning, God created",
				text: "In the beginning, God created the heavens and the earth.",
				version: "ESV",
				themes: ["Creation", "Wonder"]
			},
			it: {
				reference: "Genesi 1:1",
				highlightPrefix: "Nel principio Dio creò",
				text: "Nel principio Dio creò i cieli e la terra.",
				version: "NR06",
				themes: ["Creazione", "Meraviglia"]
			},
			sw: {
				reference: "Mwanzo 1:1",
				highlightPrefix: "Hapo mwanzo Mungu aliziumba",
				text: "Hapo mwanzo Mungu aliziumba mbingu na nchi.",
				version: "SUV",
				themes: ["Uumbaji", "Imani"]
			},
			fr: {
				reference: "Genèse 1:1",
				highlightPrefix: "Au commencement, Dieu créa",
				text: "Au commencement, Dieu créa les cieux et la terre.",
				version: "LSG",
				themes: ["Création", "Foi"]
			},
			es: {
				reference: "Génesis 1:1",
				highlightPrefix: "En el principio creó Dios",
				text: "En el principio creó Dios los cielos y la tierra.",
				version: "RVR",
				themes: ["Creación", "Fe"]
			},
			pt: {
				reference: "Gênesis 1:1",
				highlightPrefix: "No princípio criou Deus",
				text: "No princípio criou Deus os céus e a terra.",
				version: "ARC",
				themes: ["Criação", "Fé"]
			},
			de: {
				reference: "1. Mose 1,1",
				highlightPrefix: "Am Anfang schuf Gott",
				text: "Am Anfang schuf Gott Himmel und Erde.",
				version: "LUT",
				themes: ["Schöpfung", "Staunen"]
			},
			ar: {
				reference: "التكوين 1:1",
				highlightPrefix: "فِي الْبَدْءِ خَلَقَ اللهُ",
				text: "فِي الْبَدْءِ خَلَقَ اللهُ السَّمَاوَاتِ وَالأَرْضَ.",
				version: "SVD",
				themes: ["الخليقة", "إيمان"]
			},
			hi: {
				reference: "उत्पत्ति 1:1",
				highlightPrefix: "आदि में परमेश्वर ने",
				text: "आदि में परमेश्वर ने आकाश और पृथ्वी की सृष्टि की।",
				version: "OV",
				themes: ["सृष्टि", "विश्वास"]
			},
			zh: {
				reference: "创世记 1:1",
				highlightPrefix: "起初，神创造天地。",
				text: "起初，神创造天地。",
				version: "CUNP",
				themes: ["创造", "敬畏"]
			}
		}
	},
	{
		id: "exodus-15-2",
		book: "Exodus",
		translations: {
			en: {
				reference: "Exodus 15:2",
				highlightPrefix: "The Lord is my strength and my song,",
				text: "The Lord is my strength and my song, and he has become my salvation; this is my God, and I will praise him.",
				version: "ESV",
				themes: ["Strength", "Praise"]
			},
			it: {
				reference: "Esodo 15:2",
				highlightPrefix: "Il Signore è la mia forza e il mio cantico,",
				text: "Il Signore è la mia forza e il mio cantico; egli è stato la mia salvezza. Questi è il mio Dio, io lo glorificherò.",
				version: "NR06",
				themes: ["Forza", "Lode"]
			},
			sw: {
				reference: "Kutoka 15:2",
				highlightPrefix: "Bwana ni nguvu zangu, na wimbo wangu,",
				text: "Bwana ni nguvu zangu, na wimbo wangu, naye amekuwa wokovu wangu; huyu ni Mungu wangu, nami nitamsifu.",
				version: "SUV",
				themes: ["Nguvu", "Sifa"]
			},
			fr: {
				reference: "Exode 15:2",
				highlightPrefix: "L’Éternel est ma force et le sujet de mes louanges;",
				text: "L’Éternel est ma force et le sujet de mes louanges; c’est lui qui m’a sauvé. Il est mon Dieu: je le célébrerai.",
				version: "LSG",
				themes: ["Force", "Louange"]
			},
			es: {
				reference: "Éxodo 15:2",
				highlightPrefix: "Jehová es mi fortaleza y mi cántico,",
				text: "Jehová es mi fortaleza y mi cántico, y ha sido mi salvación. Este es mi Dios, y lo alabaré.",
				version: "RVR",
				themes: ["Fortaleza", "Alabanza"]
			},
			pt: {
				reference: "Êxodo 15:2",
				highlightPrefix: "O Senhor é a minha força e o meu cântico;",
				text: "O Senhor é a minha força e o meu cântico; ele me foi por salvação; este é o meu Deus, portanto lhe farei uma habitação.",
				version: "ARC",
				themes: ["Força", "Louvor"]
			},
			de: {
				reference: "2. Mose 15,2",
				highlightPrefix: "Der Herr ist meine Stärke und mein Lobgesang",
				text: "Der Herr ist meine Stärke und mein Lobgesang und ist mein Heil. Das ist mein Gott, ich will ihn preisen.",
				version: "LUT",
				themes: ["Stärke", "Lob"]
			},
			ar: {
				reference: "الخروج 15:2",
				highlightPrefix: "الرَّبُّ قُوَّتِي وَنَشِيدِي،",
				text: "الرَّبُّ قُوَّتِي وَنَشِيدِي، وَقَدْ صَارَ خَلاَصِي. هذَا إِلهِي فَأُمَجِّدُهُ.",
				version: "SVD",
				themes: ["قوة", "تسبيح"]
			},
			hi: {
				reference: "निर्गमन 15:2",
				highlightPrefix: "यहोवा मेरा बल और मेरे भजन का विषय है,",
				text: "यहोवा मेरा बल और मेरे भजन का विषय है, और वह मेरा उद्धार ठहरा है; मेरा परमेश्वर वही है, मैं उसकी स्तुति करूँगा।",
				version: "OV",
				themes: ["सामर्थ्य", "स्तुति"]
			},
			zh: {
				reference: "出埃及记 15:2",
				highlightPrefix: "耶和华是我的力量，我的诗歌，",
				text: "耶和华是我的力量，我的诗歌，也成了我的拯救。这是我的神，我要赞美他。",
				version: "CUNP",
				themes: ["力量", "赞美"]
			}
		}
	},
	{
		id: "matthew-5-14",
		book: "Matthew",
		translations: {
			en: {
				reference: "Matthew 5:14–16",
				highlightPrefix: "You are the light of the world.",
				text: "You are the light of the world. A city set on a hill cannot be hidden. Let your light shine before others.",
				version: "ESV",
				themes: ["Joy", "Kindness"]
			},
			it: {
				reference: "Matteo 5:14–16",
				highlightPrefix: "Voi siete la luce del mondo.",
				text: "Voi siete la luce del mondo. Una città posta sopra un monte non può rimanere nascosta. Così risplenda la vostra luce davanti agli uomini.",
				version: "NR06",
				themes: ["Gioia", "Gentilezza"]
			},
			sw: {
				reference: "Mathayo 5:14–16",
				highlightPrefix: "Ninyi ni nuru ya ulimwengu.",
				text: "Ninyi ni nuru ya ulimwengu. Mji hauwezi kusitirika ukiwa juu ya mlima. Nuru yenu na iangaze mbele ya watu.",
				version: "SUV",
				themes: ["Nuru", "Wema"]
			},
			fr: {
				reference: "Matthieu 5:14–16",
				highlightPrefix: "Vous êtes la lumière du monde.",
				text: "Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée. Que votre lumière luise ainsi devant les hommes.",
				version: "LSG",
				themes: ["Lumière", "Joie"]
			},
			es: {
				reference: "Mateo 5:14–16",
				highlightPrefix: "Vosotros sois la luz del mundo;",
				text: "Vosotros sois la luz del mundo; una ciudad asentada sobre un monte no se puede esconder. Así alumbre vuestra luz delante de los hombres.",
				version: "RVR",
				themes: ["Luz", "Bondad"]
			},
			pt: {
				reference: "Mateus 5:14–16",
				highlightPrefix: "Vós sois a luz do mundo;",
				text: "Vós sois a luz do mundo; não se pode esconder uma cidade edificada sobre um monte. Assim resplandeça a vossa luz diante dos homens.",
				version: "ARC",
				themes: ["Luz", "Bondade"]
			},
			de: {
				reference: "Matthäus 5,14–16",
				highlightPrefix: "Ihr seid das Licht der Welt.",
				text: "Ihr seid das Licht der Welt. Es kann die Stadt, die auf einem Berge liegt, nicht verborgen sein. So lasst euer Licht leuchten vor den Leuten.",
				version: "LUT",
				themes: ["Licht", "Freude"]
			},
			ar: {
				reference: "متى 5:14–16",
				highlightPrefix: "أَنْتُمْ نُورُ الْعَالَمِ.",
				text: "أَنْتُمْ نُورُ الْعَالَمِ. لاَ يُمْكِنُ أَنْ تُخْفَى مَدِينَةٌ مَوْضُوعَةٌ عَلَى جَبَلٍ. فَلْيُضِئْ نُورُكُمْ هكَذَا قُدَّامَ النَّاسِ.",
				version: "SVD",
				themes: ["نور", "فرح"]
			},
			hi: {
				reference: "मत्ती 5:14–16",
				highlightPrefix: "तुम जगत की ज्योति हो।",
				text: "तुम जगत की ज्योति हो। जो नगर पहाड़ पर बसा हुआ है वह छिप नहीं सकता। तुम्हारा उजियाला मनुष्यों के सामने चमके।",
				version: "OV",
				themes: ["ज्योति", "भलाई"]
			},
			zh: {
				reference: "马太福音 5:14–16",
				highlightPrefix: "你们是世上的光。",
				text: "你们是世上的光。城造在山上是不能隐藏的。你们的光也当这样照在人前。",
				version: "CUNP",
				themes: ["光明", "喜乐"]
			}
		}
	},
	{
		id: "proverbs-3-5",
		book: "Proverbs",
		translations: {
			en: {
				reference: "Proverbs 3:5–6",
				highlightPrefix: "Trust in the Lord with all your heart,",
				text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
				version: "ESV",
				themes: ["Wisdom", "Guidance"]
			},
			it: {
				reference: "Proverbi 3:5–6",
				highlightPrefix: "Confida nel Signore con tutto il cuore",
				text: "Confida nel Signore con tutto il cuore e non ti appoggiare sul tuo discernimento. Riconoscilo in tutte le tue vie ed egli appianerà i tuoi sentieri.",
				version: "NR06",
				themes: ["Saggezza", "Guida"]
			},
			sw: {
				reference: "Mithali 3:5–6",
				highlightPrefix: "Mtumaini Bwana kwa moyo wako wote,",
				text: "Mtumaini Bwana kwa moyo wako wote, wala usizitegemee akili zako mwenyewe; katika njia zako zote mkiri yeye, naye atayanyoosha mapito yako.",
				version: "SUV",
				themes: ["Hekima", "Uongozi"]
			},
			fr: {
				reference: "Proverbes 3:5–6",
				highlightPrefix: "Confie-toi en l’Éternel de tout ton cœur,",
				text: "Confie-toi en l’Éternel de tout ton cœur, et ne t’appuie pas sur ta sagesse; reconnais-le dans toutes tes voies, et il aplanira tes sentiers.",
				version: "LSG",
				themes: ["Sagesse", "Confiance"]
			},
			es: {
				reference: "Proverbios 3:5–6",
				highlightPrefix: "Fíate de Jehová de todo tu corazón,",
				text: "Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus veredas.",
				version: "RVR",
				themes: ["Sabiduría", "Confianza"]
			},
			pt: {
				reference: "Provérbios 3:5–6",
				highlightPrefix: "Confia no Senhor de todo o teu coração,",
				text: "Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento. Reconhece-o em todos os teus caminhos, e ele endireitará as tuas veredas.",
				version: "ARC",
				themes: ["Sabedoria", "Confiança"]
			},
			de: {
				reference: "Sprüche 3,5–6",
				highlightPrefix: "Verlass dich auf den Herrn von ganzem Herzen,",
				text: "Verlass dich auf den Herrn von ganzem Herzen, und verlass dich nicht auf deinen Verstand, sondern gedenke an ihn in allen deinen Wegen, so wird er dich recht führen.",
				version: "LUT",
				themes: ["Weisheit", "Vertrauen"]
			},
			ar: {
				reference: "الأمثال 3:5–6",
				highlightPrefix: "تَوَكَّلْ عَلَى الرَّبِّ بِكُلِّ قَلْبِكَ،",
				text: "تَوَكَّلْ عَلَى الرَّبِّ بِكُلِّ قَلْبِكَ، وَعَلَى فَهْمِكَ لاَ تَعْتَمِدْ. فِي كُلِّ طُرُقِكَ اعْرِفْهُ، وَهُوَ يُقَوِّمُ سُبُلَكَ.",
				version: "SVD",
				themes: ["حكمة", "توجيه"]
			},
			hi: {
				reference: "नीतिवचन 3:5–6",
				highlightPrefix: "तू अपनी समझ का सहारा न लेना,",
				text: "तू अपनी समझ का सहारा न लेना, वरन सम्पूर्ण मन से यहोवा पर भरोसा रखना। उसी को स्मरण करके सब काम करना, तब वह तेरे लिये सीधा मार्ग निकालेगा।",
				version: "OV",
				themes: ["बुद्धि", "भरोसा"]
			},
			zh: {
				reference: "箴言 3:5–6",
				highlightPrefix: "你要专心仰赖耶和华，",
				text: "你要专心仰赖耶和华，不可倚靠自己的聪明，在你一切所行的事上都要认定他，他必指引你的路。",
				version: "CUNP",
				themes: ["智慧", "指引"]
			}
		}
	},
	{
		id: "philippians-4-13",
		book: "Philippians",
		translations: {
			en: {
				reference: "Philippians 4:13",
				highlightPrefix: "I can do all things",
				text: "I can do all things through him who strengthens me.",
				version: "ESV",
				themes: ["Courage", "Strength"]
			},
			it: {
				reference: "Filippesi 4:13",
				highlightPrefix: "Io posso ogni cosa",
				text: "Io posso ogni cosa in colui che mi fortifica.",
				version: "NR06",
				themes: ["Coraggio", "Forza"]
			},
			sw: {
				reference: "Wafilipi 4:13",
				highlightPrefix: "Nayaweza mambo yote",
				text: "Nayaweza mambo yote katika yeye anitiaye nguvu.",
				version: "SUV",
				themes: ["Ujasiri", "Nguvu"]
			},
			fr: {
				reference: "Philippiens 4:13",
				highlightPrefix: "Je puis tout",
				text: "Je puis tout par celui qui me fortifie.",
				version: "LSG",
				themes: ["Courage", "Force"]
			},
			es: {
				reference: "Filipenses 4:13",
				highlightPrefix: "Todo lo puedo en Cristo",
				text: "Todo lo puedo en Cristo que me fortalece.",
				version: "RVR",
				themes: ["Valentía", "Fuerza"]
			},
			pt: {
				reference: "Filipenses 4:13",
				highlightPrefix: "Posso todas as coisas",
				text: "Posso todas as coisas naquele que me fortalece.",
				version: "ARC",
				themes: ["Coragem", "Força"]
			},
			de: {
				reference: "Philipper 4,13",
				highlightPrefix: "Ich vermag alles durch den,",
				text: "Ich vermag alles durch den, der mich mächtig macht.",
				version: "LUT",
				themes: ["Mut", "Kraft"]
			},
			ar: {
				reference: "فيلبي 4:13",
				highlightPrefix: "أَسْتَطِيعُ كُلَّ شَيْءٍ",
				text: "أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي.",
				version: "SVD",
				themes: ["شجاعة", "قوة"]
			},
			hi: {
				reference: "फिलिप्पियों 4:13",
				highlightPrefix: "जो मुझे सामर्थ्य देता है",
				text: "जो मुझे सामर्थ्य देता है उसमें मैं सब कुछ कर सकता हूँ।",
				version: "OV",
				themes: ["साहस", "सामर्थ्य"]
			},
			zh: {
				reference: "腓立比书 4:13",
				highlightPrefix: "我靠着那加给我力量的，",
				text: "我靠着那加给我力量的，凡事都能作。",
				version: "CUNP",
				themes: ["勇气", "力量"]
			}
		}
	},
	{
		id: "revelation-21-4",
		book: "Revelation",
		translations: {
			en: {
				reference: "Revelation 21:4",
				highlightPrefix: "He will wipe away every tear from their eyes,",
				text: "He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore.",
				version: "ESV",
				themes: ["Hope", "Comfort"]
			},
			it: {
				reference: "Apocalisse 21:4",
				highlightPrefix: "Egli asciugherà ogni lacrima dai loro occhi",
				text: "Egli asciugherà ogni lacrima dai loro occhi e non ci sarà più la morte, né cordoglio, né grido, né dolore.",
				version: "NR06",
				themes: ["Speranza", "Conforto"]
			},
			sw: {
				reference: "Ufunuo 21:4",
				highlightPrefix: "Naye atafuta kila chozi katika macho yao,",
				text: "Naye atafuta kila chozi katika macho yao, wala mauti haitakuwapo tena; wala maombolezo, wala kilio, wala maumivu hayatakuwapo tena.",
				version: "SUV",
				themes: ["Tumaini", "Faraja"]
			},
			fr: {
				reference: "Apocalypse 21:4",
				highlightPrefix: "Il essuiera toute larme de leurs yeux,",
				text: "Il essuiera toute larme de leurs yeux, et la mort ne sera plus, et il n’y aura plus ni deuil, ni cri, ni douleur.",
				version: "LSG",
				themes: ["Espérance", "Paix"]
			},
			es: {
				reference: "Apocalipsis 21:4",
				highlightPrefix: "Enjugará Dios toda lágrima de los ojos de ellos;",
				text: "Enjugará Dios toda lágrima de los ojos de ellos; y ya no habrá muerte, ni habrá más llanto, ni clamor, ni dolor.",
				version: "RVR",
				themes: ["Esperanza", "Consuelo"]
			},
			pt: {
				reference: "Apocalipse 21:4",
				highlightPrefix: "E Deus limpará de seus olhos toda a lágrima;",
				text: "E Deus limpará de seus olhos toda a lágrima; e não haverá mais morte, nem pranto, nem clamor, nem dor.",
				version: "ARC",
				themes: ["Esperança", "Consolo"]
			},
			de: {
				reference: "Offenbarung 21,4",
				highlightPrefix: "Und Gott wird abwischen alle Tränen von ihren Augen,",
				text: "Und Gott wird abwischen alle Tränen von ihren Augen, und der Tod wird nicht mehr sein, noch Leid noch Geschrei noch Schmerz wird mehr sein.",
				version: "LUT",
				themes: ["Hoffnung", "Trost"]
			},
			ar: {
				reference: "الرؤيا 21:4",
				highlightPrefix: "وَسَيَمْسَحُ اللهُ كُلَّ دَمْعَةٍ مِنْ عُيُونِهِمْ،",
				text: "وَسَيَمْسَحُ اللهُ كُلَّ دَمْعَةٍ مِنْ عُيُونِهِمْ، وَالْمَوْتُ لاَ يَكُونُ فِي مَا بَعْدُ، وَلاَ يَكُونُ حُزْنٌ وَلاَ صُرَاخٌ وَلاَ وَجَعٌ.",
				version: "SVD",
				themes: ["رجاء", "تعزية"]
			},
			hi: {
				reference: "प्रकाशितवाक्य 21:4",
				highlightPrefix: "वह उनकी आँखों से सब आँसू पोंछ डालेगा,",
				text: "वह उनकी आँखों से सब आँसू पोंछ डालेगा, और इसके बाद मृत्यु न रहेगी, और न शोक, न विलाप, न पीड़ा रहेगी।",
				version: "OV",
				themes: ["आशा", "शांति"]
			},
			zh: {
				reference: "启示录 21:4",
				highlightPrefix: "神要擦去他们一切的眼泪，",
				text: "神要擦去他们一切的眼泪，不再有死亡，也不再有悲哀、哭号、疼痛。",
				version: "CUNP",
				themes: ["盼望", "安慰"]
			}
		}
	},
	{
		id: "psalm-119-105",
		book: "Psalms",
		translations: {
			en: {
				reference: "Psalm 119:105",
				highlightPrefix: "Your word is a lamp to my feet",
				text: "Your word is a lamp to my feet and a light to my path.",
				version: "ESV",
				themes: ["Wisdom", "Light"]
			},
			it: {
				reference: "Salmo 119:105",
				highlightPrefix: "La tua parola è una lampada al mio piede",
				text: "La tua parola è una lampada al mio piede e una luce sul mio sentiero.",
				version: "NR06",
				themes: ["Saggezza", "Luce"]
			},
			sw: {
				reference: "Zaburi 119:105",
				highlightPrefix: "Neno lako ni taa ya miguu yangu,",
				text: "Neno lako ni taa ya miguu yangu, na mwanga wa njia yangu.",
				version: "SUV",
				themes: ["Hekima", "Nuru"]
			},
			fr: {
				reference: "Psaume 119:105",
				highlightPrefix: "Ta parole est une lampe à mes pieds,",
				text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.",
				version: "LSG",
				themes: ["Sagesse", "Lumière"]
			},
			es: {
				reference: "Salmos 119:105",
				highlightPrefix: "Lámpara es a mis pies tu palabra,",
				text: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
				version: "RVR",
				themes: ["Sabiduría", "Luz"]
			},
			pt: {
				reference: "Salmos 119:105",
				highlightPrefix: "Lâmpada para os meus pés é tua palavra,",
				text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
				version: "ARC",
				themes: ["Sabedoria", "Luz"]
			},
			de: {
				reference: "Psalm 119,105",
				highlightPrefix: "Dein Wort ist meines Fußes Leuchte",
				text: "Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.",
				version: "LUT",
				themes: ["Weisheit", "Licht"]
			},
			ar: {
				reference: "مزمور 119:105",
				highlightPrefix: "سِرَاجٌ لِرِجْلِي كَلاَمُكَ",
				text: "سِرَاجٌ لِرِجْلِي كَلاَمُكَ وَنُورٌ لِسَبِيلِي.",
				version: "SVD",
				themes: ["حكمة", "نور"]
			},
			hi: {
				reference: "भजन संहिता 119:105",
				highlightPrefix: "तेरा वचन मेरे पाँव के लिये दीपक",
				text: "तेरा वचन मेरे पाँव के लिये दीपक और मेरे मार्ग के लिये उजियाला है।",
				version: "OV",
				themes: ["बुद्धि", "ज्योति"]
			},
			zh: {
				reference: "诗篇 119:105",
				highlightPrefix: "你的话是我脚前的灯，",
				text: "你的话是我脚前的灯，是我路上的光。",
				version: "CUNP",
				themes: ["智慧", "光明"]
			}
		}
	},
	{
		id: "john-14-27",
		book: "John",
		translations: {
			en: {
				reference: "John 14:27",
				highlightPrefix: "Peace I leave with you;",
				text: "Peace I leave with you; my peace I give to you. Let not your hearts be troubled, neither let them be afraid.",
				version: "ESV",
				themes: ["Peace", "Courage"]
			},
			it: {
				reference: "Giovanni 14:27",
				highlightPrefix: "Io vi lascio pace;",
				text: "Io vi lascio pace; vi do la mia pace. Il vostro cuore non sia turbato e non si spaventi.",
				version: "NR06",
				themes: ["Pace", "Coraggio"]
			},
			sw: {
				reference: "Yohana 14:27",
				highlightPrefix: "Amani nawaachieni;",
				text: "Amani nawaachieni; amani yangu nawapa. Msifadhaike mioyoni mwenu, wala msiwe na woga.",
				version: "SUV",
				themes: ["Amani", "Ujasiri"]
			},
			fr: {
				reference: "Jean 14:27",
				highlightPrefix: "Je vous laisse la paix,",
				text: "Je vous laisse la paix, je vous donne ma paix. Que votre cœur ne se trouble point, et ne s’alarme point.",
				version: "LSG",
				themes: ["Paix", "Courage"]
			},
			es: {
				reference: "Juan 14:27",
				highlightPrefix: "La paz os dejo,",
				text: "La paz os dejo, mi paz os doy. No se turbe vuestro corazón, ni tenga miedo.",
				version: "RVR",
				themes: ["Paz", "Valentía"]
			},
			pt: {
				reference: "João 14:27",
				highlightPrefix: "Deixo-vos a paz,",
				text: "Deixo-vos a paz, a minha paz vos dou. Não se turbe o vosso coração, nem se atemorize.",
				version: "ARC",
				themes: ["Paz", "Coragem"]
			},
			de: {
				reference: "Johannes 14,27",
				highlightPrefix: "Den Frieden lasse ich euch,",
				text: "Den Frieden lasse ich euch, meinen Frieden gebe ich euch. Euer Herz erschrecke nicht und fürchte sich nicht.",
				version: "LUT",
				themes: ["Frieden", "Mut"]
			},
			ar: {
				reference: "يوحنا 14:27",
				highlightPrefix: "سَلاَماً أَتْرُكُ لَكُمْ.",
				text: "سَلاَماً أَتْرُكُ لَكُمْ. سَلاَمِي أُعْطِيكُمْ. لاَ تَضْطَرِبْ قُلُوبُكُمْ وَلاَ تَرْهَبْ.",
				version: "SVD",
				themes: ["سلام", "طمأنينة"]
			},
			hi: {
				reference: "यूहन्ना 14:27",
				highlightPrefix: "मैं तुम्हें शान्ति दिए जाता हूँ,",
				text: "मैं तुम्हें शान्ति दिए जाता हूँ, अपनी शान्ति तुम्हें देता हूँ। तुम्हारा मन न घबराए और न डरे।",
				version: "OV",
				themes: ["शांति", "साहस"]
			},
			zh: {
				reference: "约翰福音 14:27",
				highlightPrefix: "我留下平安给你们，",
				text: "我留下平安给你们，我将我的平安赐给你们。你们心里不要忧愁，也不要胆怯。",
				version: "CUNP",
				themes: ["平安", "刚强"]
			}
		}
	}
];
// src/data/categories.ts
var QUIZ_CATEGORIES = [
	{
		id: "genesis-creation",
		title: "Genesis & Creation",
		subtitle: "Beginnings, Noah’s Ark, Abraham, Jacob & Joseph",
		unlockCost: 0,
		bookIds: [1],
		storyTheme: "noah",
		badgeLabel: "Free Starter"
	},
	{
		id: "life-of-jesus",
		title: "Life & Teachings of Jesus",
		subtitle: "The four Gospels, Beatitudes & Good Shepherd",
		unlockCost: 0,
		bookIds: [
			40,
			41,
			42,
			43
		],
		storyTheme: "shepherd",
		badgeLabel: "Free Starter"
	},
	{
		id: "heroes-of-faith",
		title: "Heroes of Faith",
		subtitle: "Joshua, Ruth, David, Daniel, Esther & Hebrews 11",
		unlockCost: 0,
		bookIds: [
			6,
			8,
			9,
			17,
			27,
			58
		],
		storyTheme: "david",
		badgeLabel: "Free Starter"
	},
	{
		id: "miracles-parables",
		title: "Miracles & Parables",
		subtitle: "Signs, wonders, storms calmed & Gospel stories",
		unlockCost: 150,
		bookIds: [
			40,
			41,
			42,
			43,
			11,
			12
		],
		storyTheme: "whale",
		badgeLabel: "Gospels & Kings"
	},
	{
		id: "women-of-bible",
		title: "Women of the Bible",
		subtitle: "Ruth, Esther, Deborah, Hannah, Mary & Priscilla",
		unlockCost: 200,
		bookIds: [
			7,
			8,
			9,
			17,
			42,
			43,
			44
		],
		storyTheme: "shepherd",
		badgeLabel: "Faithful Voices"
	},
	{
		id: "kings-judges",
		title: "Kings & Judges of Israel",
		subtitle: "Gideon, Samson, Saul, David, Solomon & Josiah",
		unlockCost: 200,
		bookIds: [
			7,
			9,
			10,
			11,
			12,
			13,
			14
		],
		storyTheme: "david",
		badgeLabel: "Royal History"
	},
	{
		id: "major-minor-prophets",
		title: "Major & Minor Prophets",
		subtitle: "Isaiah, Jeremiah, Ezekiel, Jonah & Malachi",
		unlockCost: 250,
		bookIds: [
			23,
			24,
			26,
			27,
			28,
			32,
			33,
			38,
			39
		],
		storyTheme: "whale",
		badgeLabel: "Prophetic Books"
	},
	{
		id: "acts-early-church",
		title: "Acts & The Early Church",
		subtitle: "Pentecost, Paul’s journeys & New Testament letters",
		unlockCost: 250,
		bookIds: [
			44,
			45,
			46,
			48,
			49,
			50
		],
		storyTheme: "bible",
		badgeLabel: "Apostolic Era"
	},
	{
		id: "psalms-proverbs",
		title: "Psalms & Proverbs Wisdom",
		subtitle: "Songs of praise, wisdom sayings & Ecclesiastes",
		unlockCost: 300,
		bookIds: [
			19,
			20,
			21
		],
		storyTheme: "shepherd",
		badgeLabel: "Wisdom Poetry"
	},
	{
		id: "revelation-hard",
		title: "Revelation & Prophecy Hard Mode",
		subtitle: "Seven churches, scrolls, seals & end-times visions",
		unlockCost: 350,
		bookIds: [
			66,
			27,
			26
		],
		storyTheme: "bible",
		badgeLabel: "Hard Mode",
		hardMode: true
	}
];
var FREE_CATEGORY_IDS = QUIZ_CATEGORIES.filter((c) => c.unlockCost === 0).map((c) => c.id);
function getQuizCategoryById(id) {
	return QUIZ_CATEGORIES.find((c) => c.id === id);
}
// src/data/illustrations.ts
var STORY_THEME_META = {
	noah: { alt: "Noah’s wooden ark floating on blue waves beneath a rainbow and dove" },
	david: { alt: "Young shepherd David with sling, staff, and sheep in a sunlit green meadow" },
	whale: { alt: "Friendly giant blue whale swimming in turquoise ocean waves beside a sailboat" },
	shepherd: { alt: "Peaceful sunlit hills of Galilee with lambs, olive tree, and wildflowers" },
	bible: { alt: "Open Bible resting on soft clouds beneath golden light and a glowing cross" }
};
// src/utils/speechAndAudio.ts
var LANG_BCP47 = {
	en: "en-US",
	it: "it-IT",
	sw: "sw-KE",
	fr: "fr-FR",
	es: "es-ES",
	pt: "pt-BR",
	de: "de-DE",
	ar: "ar-SA",
	hi: "hi-IN",
	zh: "zh-CN"
};
var VOICE_PRESETS = {
	kids: {
		pitch: 1.75,
		rate: 1.1
	},
	teen: {
		pitch: 1.3,
		rate: 1.05
	},
	female: {
		pitch: 1.05,
		rate: .95
	},
	male: {
		pitch: .75,
		rate: .92
	}
};
var activeSpeechToken = 0;
function stopSpeaking() {
	activeSpeechToken += 1;
	if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
function clamp(num, min, max) {
	return Math.min(max, Math.max(min, num));
}
function prepareSpeechText(raw) {
	return raw.replace(/\s+/g, " ").replace(/\s*—\s*/g, ". ").replace(/(\d+):(\d+)/g, "$1, verse $2").trim();
}
function splitIntoNaturalChunks(text) {
	const cleaned = prepareSpeechText(text);
	if (cleaned.length <= 150) return [cleaned];
	const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
	const chunks = [];
	let buffer = "";
	for (const s of sentences) if (buffer && buffer.length + s.length + 1 > 160) {
		chunks.push(buffer.trim());
		buffer = s;
	} else buffer = buffer ? `${buffer} ${s}` : s;
	if (buffer.trim()) chunks.push(buffer.trim());
	return chunks.length > 0 ? chunks : [cleaned];
}
function isFemaleVoiceName(name) {
	return /\bfemale\b|\bwoman\b|\bgirl\b|\bchild\b|\bkid\b/.test(name) || [
		"samantha",
		"aria",
		"jenny",
		"sonia",
		"libby",
		"ava",
		"allison",
		"karen",
		"victoria",
		"moira",
		"tessa",
		"serena",
		"zira",
		"hazel",
		"susan",
		"fiona",
		"emma",
		"claire",
		"sara",
		"sofia",
		"elsa",
		"helena",
		"paulina",
		"monica",
		"amelie",
		"alice",
		"katja",
		"hedda",
		"luciana",
		"lekha",
		"ting-ting",
		"tingting",
		"google us english"
	].some((hint) => name.includes(hint));
}
function isMaleVoiceName(name) {
	return /\bmale\b|\bman\b|\bboy\b/.test(name) || [
		"daniel",
		"alex",
		"arthur",
		"oliver",
		"david",
		"george",
		"guy",
		"ryan",
		"mark",
		"christopher",
		"eric",
		"andrew",
		"thomas",
		"matthew",
		"rishi",
		"aaron",
		"gordon",
		"fred",
		"jorge",
		"diego",
		"luca",
		"stefan",
		"henrik",
		"maged",
		"tarik",
		"liam",
		"james",
		"reed",
		"eddy",
		"rocko",
		"sandy"
	].some((hint) => name.includes(hint));
}
function scoreSystemVoice(voice, targetLocale, voiceGender) {
	const name = voice.name.toLowerCase();
	const lang = voice.lang.toLowerCase();
	const prefix = targetLocale.split("-")[0].toLowerCase();
	let score = 0;
	if ([
		"espeak",
		"compact",
		"zarvox",
		"trinoids",
		"boing",
		"bubbles",
		"bells",
		"whisper",
		"wobble",
		"cellos",
		"organ",
		"albert",
		"bad news",
		"good news",
		"hysterical",
		"deranged",
		"ralph",
		"kathy",
		"princess",
		"junior",
		"jester",
		"superstar"
	].some((p) => name.includes(p))) score -= 200;
	if (lang === targetLocale.toLowerCase()) score += 80;
	else if (lang.startsWith(prefix)) score += 50;
	else score -= 80;
	if (name.includes("natural") || name.includes("neural") || name.includes("online") || name.includes("enhanced") || name.includes("premium") || name.includes("wavenet") || name.includes("siri")) score += 65;
	if (name.includes("google")) score += 35;
	if (!voice.localService) score += 15;
	const isFemale = isFemaleVoiceName(name);
	const isMale = isMaleVoiceName(name);
	if (voiceGender === "male") {
		if (isMale) score += 120;
		if (isFemale) score -= 120;
	} else if (voiceGender === "kids") {
		if (/\bchild\b|\bkid\b|\bgirl\b/.test(name)) score += 90;
		if (isFemale) score += 85;
		if (isMale) score -= 120;
	} else if (voiceGender === "female") {
		if (isFemale) score += 110;
		if (isMale) score -= 110;
	} else {
		if (isFemale) score += 60;
		if (isMale) score -= 40;
	}
	return score;
}
function pickSystemVoice(voices, targetLocale, voiceGender) {
	if (voices.length === 0) return void 0;
	const prefix = targetLocale.split("-")[0].toLowerCase();
	const localeVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
	const pool = localeVoices.length > 0 ? localeVoices : voices;
	if (voiceGender === "male") {
		const maleMatches = pool.filter((v) => isMaleVoiceName(v.name.toLowerCase()));
		if (maleMatches.length > 0) return maleMatches.reduce((best, cur) => scoreSystemVoice(cur, targetLocale, voiceGender) > scoreSystemVoice(best, targetLocale, voiceGender) ? cur : best);
	} else if (voiceGender === "female" || voiceGender === "kids") {
		const femaleMatches = pool.filter((v) => isFemaleVoiceName(v.name.toLowerCase()));
		if (femaleMatches.length > 0) return femaleMatches.reduce((best, cur) => scoreSystemVoice(cur, targetLocale, voiceGender) > scoreSystemVoice(best, targetLocale, voiceGender) ? cur : best);
	}
	let best = pool[0];
	let bestScore = -Infinity;
	for (const v of pool) {
		const s = scoreSystemVoice(v, targetLocale, voiceGender);
		if (s > bestScore) {
			bestScore = s;
			best = v;
		}
	}
	return best;
}
function speakWithWebSpeech(text, lang, voiceGender, options, token, onEnd) {
	if (typeof window === "undefined" || !("speechSynthesis" in window)) {
		onEnd?.();
		return;
	}
	const preset = VOICE_PRESETS[voiceGender] || VOICE_PRESETS.female;
	const targetPitch = clamp(options.pitch ?? preset.pitch, .7, 1.85);
	const targetRate = clamp(options.rate ?? preset.rate, .7, 1.3);
	const runChunks = () => {
		if (token !== activeSpeechToken) return;
		const synth = window.speechSynthesis;
		const wasBusy = synth.speaking || synth.pending;
		synth.cancel();
		const targetLocale = LANG_BCP47[lang] || "en-US";
		const picked = pickSystemVoice(synth.getVoices(), targetLocale, voiceGender);
		const chunks = splitIntoNaturalChunks(text);
		const speakChunk = (idx) => {
			if (token !== activeSpeechToken) return;
			if (idx >= chunks.length) {
				onEnd?.();
				return;
			}
			const chunkText = chunks[idx];
			const utterance = new SpeechSynthesisUtterance(chunkText);
			utterance.lang = targetLocale;
			if (picked) utterance.voice = picked;
			utterance.pitch = targetPitch;
			utterance.rate = targetRate;
			utterance.volume = 1;
			let settled = false;
			let startGuardTimer = null;
			let maxDurationTimer = null;
			const clearTimers = () => {
				if (startGuardTimer !== null) {
					window.clearTimeout(startGuardTimer);
					startGuardTimer = null;
				}
				if (maxDurationTimer !== null) {
					window.clearTimeout(maxDurationTimer);
					maxDurationTimer = null;
				}
			};
			const finishSequenceEarly = () => {
				if (settled) return;
				settled = true;
				clearTimers();
				try {
					synth.cancel();
				} catch {}
				if (token === activeSpeechToken) onEnd?.();
			};
			utterance.onstart = () => {
				if (startGuardTimer !== null) {
					window.clearTimeout(startGuardTimer);
					startGuardTimer = null;
				}
				const estimatedMs = Math.max(7e3, Math.round(chunkText.length * 140 / targetRate));
				maxDurationTimer = window.setTimeout(() => {
					finishSequenceEarly();
				}, estimatedMs);
			};
			utterance.onend = () => {
				if (settled) return;
				settled = true;
				clearTimers();
				if (token !== activeSpeechToken) return;
				speakChunk(idx + 1);
			};
			utterance.onerror = () => {
				if (settled) return;
				settled = true;
				clearTimers();
				if (token !== activeSpeechToken) return;
				onEnd?.();
			};
			startGuardTimer = window.setTimeout(() => {
				if (!settled && token === activeSpeechToken && !synth.speaking && !synth.pending) finishSequenceEarly();
			}, 2200);
			try {
				synth.speak(utterance);
			} catch {
				finishSequenceEarly();
			}
		};
		if (wasBusy) window.setTimeout(() => speakChunk(0), 50);
		else speakChunk(0);
	};
	if (window.speechSynthesis.getVoices().length > 0) {
		runChunks();
		return;
	}
	let started = false;
	const startOnce = () => {
		if (started) return;
		started = true;
		window.speechSynthesis.removeEventListener("voiceschanged", startOnce);
		runChunks();
	};
	window.speechSynthesis.addEventListener("voiceschanged", startOnce);
	window.setTimeout(startOnce, 250);
}
function speakText(text, lang, voiceGender, onEnd, options = {}) {
	if (typeof window === "undefined") {
		onEnd?.();
		return;
	}
	stopSpeaking();
	const token = activeSpeechToken;
	speakWithWebSpeech(prepareSpeechText(text), lang, voiceGender, options, token, onEnd);
}
var audioCtx = null;
function getAudioContext() {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (Ctx) audioCtx = new Ctx();
	}
	if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
	return audioCtx;
}
function playChime(kind, enabled) {
	if (!enabled) return;
	const ctx = getAudioContext();
	if (!ctx) return;
	const now = ctx.currentTime;
	const playTone = (freq, startOffset, duration, type = "sine", gainLevel = .12) => {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = type;
		osc.frequency.setValueAtTime(freq, now + startOffset);
		gain.gain.setValueAtTime(.001, now + startOffset);
		gain.gain.exponentialRampToValueAtTime(gainLevel, now + startOffset + .02);
		gain.gain.exponentialRampToValueAtTime(.001, now + startOffset + duration);
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start(now + startOffset);
		osc.stop(now + startOffset + duration + .02);
	};
	if (kind === "tap") playTone(540, 0, .07, "sine", .06);
	else if (kind === "correct") {
		playTone(523.25, 0, .14, "triangle", .12);
		playTone(659.25, .09, .16, "triangle", .12);
		playTone(783.99, .18, .24, "triangle", .14);
	} else if (kind === "wrong") {
		playTone(310, 0, .16, "sine", .1);
		playTone(245, .13, .22, "sine", .1);
	} else if (kind === "complete") {
		playTone(523.25, 0, .14, "triangle", .12);
		playTone(659.25, .1, .14, "triangle", .12);
		playTone(783.99, .2, .14, "triangle", .12);
		playTone(1046.5, .3, .36, "triangle", .15);
	}
}
// node_modules/@capacitor/core/dist/index.js
/*! Capacitor: https://capacitorjs.com/ - MIT License */
var ExceptionCode;
(function(ExceptionCode) {
	/**
	* API is not implemented.
	*
	* This usually means the API can't be used because it is not implemented for
	* the current platform.
	*/
	ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
	/**
	* API is not available.
	*
	* This means the API can't be used right now because:
	*   - it is currently missing a prerequisite, such as network connectivity
	*   - it requires a particular platform or browser version
	*/
	ExceptionCode["Unavailable"] = "UNAVAILABLE";
})(ExceptionCode || (ExceptionCode = {}));
var CapacitorException = class extends Error {
	constructor(message, code, data) {
		super(message);
		this.message = message;
		this.code = code;
		this.data = data;
	}
};
var getPlatformId = (win) => {
	var _a, _b;
	if (win === null || win === void 0 ? void 0 : win.androidBridge) return "android";
	else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) return "ios";
	else return "web";
};
var createCapacitor = (win) => {
	const capCustomPlatform = win.CapacitorCustomPlatform || null;
	const cap = win.Capacitor || {};
	const Plugins = cap.Plugins = cap.Plugins || {};
	const getPlatform = () => {
		return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
	};
	const isNativePlatform = () => getPlatform() !== "web";
	const isPluginAvailable = (pluginName) => {
		const plugin = registeredPlugins.get(pluginName);
		if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) return true;
		if (getPluginHeader(pluginName)) return true;
		return false;
	};
	const getPluginHeader = (pluginName) => {
		var _a;
		return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
	};
	const handleError = (err) => win.console.error(err);
	const registeredPlugins = /* @__PURE__ */ new Map();
	const registerPlugin = (pluginName, jsImplementations = {}) => {
		const registeredPlugin = registeredPlugins.get(pluginName);
		if (registeredPlugin) {
			console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
			return registeredPlugin.proxy;
		}
		const platform = getPlatform();
		const pluginHeader = getPluginHeader(pluginName);
		let jsImplementation;
		const loadPluginImplementation = async () => {
			if (!jsImplementation && platform in jsImplementations) jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
			else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
			return jsImplementation;
		};
		const createPluginMethod = (impl, prop) => {
			var _a, _b;
			if (pluginHeader) {
				const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
				if (methodHeader) {
					if (methodHeader.rtype === "promise") return (options) => cap.nativePromise(pluginName, prop.toString(), options);
					else return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
				} else if (impl) return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
			} else if (impl) return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
			else throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
		};
		const createPluginMethodWrapper = (prop) => {
			let remove;
			const wrapper = (...args) => {
				const p = loadPluginImplementation().then((impl) => {
					const fn = createPluginMethod(impl, prop);
					if (fn) {
						const p = fn(...args);
						remove = p === null || p === void 0 ? void 0 : p.remove;
						return p;
					} else throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
				});
				if (prop === "addListener") p.remove = async () => remove();
				return p;
			};
			wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
			Object.defineProperty(wrapper, "name", {
				value: prop,
				writable: false,
				configurable: false
			});
			return wrapper;
		};
		const addListener = createPluginMethodWrapper("addListener");
		const removeListener = createPluginMethodWrapper("removeListener");
		const addListenerNative = (eventName, callback) => {
			const call = addListener({ eventName }, callback).then((callbackId) => callbackId);
			const remove = async () => {
				const callbackId = await call;
				await removeListener({
					eventName,
					callbackId
				});
			};
			const p = new Promise((resolve) => call.then(() => resolve({ remove })));
			p.remove = async () => {
				console.warn(`Using addListener() without 'await' is deprecated.`);
				await remove();
			};
			return p;
		};
		const proxy = new Proxy({}, { get(_, prop) {
			switch (prop) {
				case "$$typeof": return;
				case "toJSON": return () => ({});
				case "addListener": return pluginHeader ? addListenerNative : addListener;
				case "removeListener": return removeListener;
				default: return createPluginMethodWrapper(prop);
			}
		} });
		Plugins[pluginName] = proxy;
		registeredPlugins.set(pluginName, {
			name: pluginName,
			proxy,
			platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
		});
		return proxy;
	};
	if (!cap.convertFileSrc) cap.convertFileSrc = (filePath) => filePath;
	cap.getPlatform = getPlatform;
	cap.handleError = handleError;
	cap.isNativePlatform = isNativePlatform;
	cap.isPluginAvailable = isPluginAvailable;
	cap.registerPlugin = registerPlugin;
	cap.Exception = CapacitorException;
	cap.DEBUG = !!cap.DEBUG;
	cap.isLoggingEnabled = !!cap.isLoggingEnabled;
	return cap;
};
var initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
var Capacitor = /*#__PURE__*/ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
var registerPlugin = Capacitor.registerPlugin;
/**
* Base class web plugins should extend.
*/
var WebPlugin = class {
	constructor() {
		this.listeners = {};
		this.retainedEventArguments = {};
		this.windowListeners = {};
	}
	addListener(eventName, listenerFunc) {
		let firstListener = false;
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
			firstListener = true;
		}
		this.listeners[eventName].push(listenerFunc);
		const windowListener = this.windowListeners[eventName];
		if (windowListener && !windowListener.registered) this.addWindowListener(windowListener);
		if (firstListener) this.sendRetainedArgumentsForEvent(eventName);
		const remove = async () => this.removeListener(eventName, listenerFunc);
		return Promise.resolve({ remove });
	}
	async removeAllListeners() {
		this.listeners = {};
		for (const listener in this.windowListeners) this.removeWindowListener(this.windowListeners[listener]);
		this.windowListeners = {};
	}
	notifyListeners(eventName, data, retainUntilConsumed) {
		const listeners = this.listeners[eventName];
		if (!listeners) {
			if (retainUntilConsumed) {
				let args = this.retainedEventArguments[eventName];
				if (!args) args = [];
				args.push(data);
				this.retainedEventArguments[eventName] = args;
			}
			return;
		}
		listeners.forEach((listener) => listener(data));
	}
	hasListeners(eventName) {
		var _a;
		return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
	}
	registerWindowListener(windowEventName, pluginEventName) {
		this.windowListeners[pluginEventName] = {
			registered: false,
			windowEventName,
			pluginEventName,
			handler: (event) => {
				this.notifyListeners(pluginEventName, event);
			}
		};
	}
	unimplemented(msg = "not implemented") {
		return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
	}
	unavailable(msg = "not available") {
		return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
	}
	async removeListener(eventName, listenerFunc) {
		const listeners = this.listeners[eventName];
		if (!listeners) return;
		const index = listeners.indexOf(listenerFunc);
		if (index !== -1) this.listeners[eventName].splice(index, 1);
		if (!this.listeners[eventName].length) this.removeWindowListener(this.windowListeners[eventName]);
	}
	addWindowListener(handle) {
		window.addEventListener(handle.windowEventName, handle.handler);
		handle.registered = true;
	}
	removeWindowListener(handle) {
		if (!handle) return;
		window.removeEventListener(handle.windowEventName, handle.handler);
		handle.registered = false;
	}
	sendRetainedArgumentsForEvent(eventName) {
		const args = this.retainedEventArguments[eventName];
		if (!args) return;
		delete this.retainedEventArguments[eventName];
		args.forEach((arg) => {
			this.notifyListeners(eventName, arg);
		});
	}
};
/******** END WEB VIEW PLUGIN ********/
/******** COOKIES PLUGIN ********/
/**
* Safely web encode a string value (inspired by js-cookie)
* @param str The string value to encode
*/
var encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
/**
* Safely web decode a string value (inspired by js-cookie)
* @param str The string value to decode
*/
var decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
var CapacitorCookiesPluginWeb = class extends WebPlugin {
	async getCookies() {
		const cookies = document.cookie;
		const cookieMap = {};
		cookies.split(";").forEach((cookie) => {
			if (cookie.length <= 0) return;
			let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
			key = decode(key).trim();
			value = decode(value).trim();
			cookieMap[key] = value;
		});
		return cookieMap;
	}
	async setCookie(options) {
		try {
			const encodedKey = encode(options.key);
			const encodedValue = encode(options.value);
			const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
			const path = (options.path || "/").replace("path=", "");
			const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
			document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async deleteCookie(options) {
		try {
			document.cookie = `${options.key}=; Max-Age=0`;
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async clearCookies() {
		try {
			const cookies = document.cookie.split(";") || [];
			for (const cookie of cookies) document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
		} catch (error) {
			return Promise.reject(error);
		}
	}
	async clearAllCookies() {
		try {
			await this.clearCookies();
		} catch (error) {
			return Promise.reject(error);
		}
	}
};
registerPlugin("CapacitorCookies", { web: () => new CapacitorCookiesPluginWeb() });
/**
* Read in a Blob value and return it as a base64 string
* @param blob The blob value to convert to a base64 string
*/
var readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => {
		const base64String = reader.result;
		resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
	};
	reader.onerror = (error) => reject(error);
	reader.readAsDataURL(blob);
});
/**
* Normalize an HttpHeaders map by lowercasing all of the values
* @param headers The HttpHeaders object to normalize
*/
var normalizeHttpHeaders = (headers = {}) => {
	const originalKeys = Object.keys(headers);
	return Object.keys(headers).map((k) => k.toLocaleLowerCase()).reduce((acc, key, index) => {
		acc[key] = headers[originalKeys[index]];
		return acc;
	}, {});
};
/**
* Builds a string of url parameters that
* @param params A map of url parameters
* @param shouldEncode true if you should encodeURIComponent() the values (true by default)
*/
var buildUrlParams = (params, shouldEncode = true) => {
	if (!params) return null;
	return Object.entries(params).reduce((accumulator, entry) => {
		const [key, value] = entry;
		let encodedValue;
		let item;
		if (Array.isArray(value)) {
			item = "";
			value.forEach((str) => {
				encodedValue = shouldEncode ? encodeURIComponent(str) : str;
				item += `${key}=${encodedValue}&`;
			});
			item.slice(0, -1);
		} else {
			encodedValue = shouldEncode ? encodeURIComponent(value) : value;
			item = `${key}=${encodedValue}`;
		}
		return `${accumulator}&${item}`;
	}, "").substr(1);
};
/**
* Build the RequestInit object based on the options passed into the initial request
* @param options The Http plugin options
* @param extra Any extra RequestInit values
*/
var buildRequestInit = (options, extra = {}) => {
	const output = Object.assign({
		method: options.method || "GET",
		headers: options.headers
	}, extra);
	const type = normalizeHttpHeaders(options.headers)["content-type"] || "";
	if (typeof options.data === "string") output.body = options.data;
	else if (type.includes("application/x-www-form-urlencoded")) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(options.data || {})) params.set(key, value);
		output.body = params.toString();
	} else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
		const form = new FormData();
		if (options.data instanceof FormData) options.data.forEach((value, key) => {
			form.append(key, value);
		});
		else for (const key of Object.keys(options.data)) form.append(key, options.data[key]);
		output.body = form;
		const headers = new Headers(output.headers);
		headers.delete("content-type");
		output.headers = headers;
	} else if (type.includes("application/json") || typeof options.data === "object") output.body = JSON.stringify(options.data);
	return output;
};
var CapacitorHttpPluginWeb = class extends WebPlugin {
	/**
	* Perform an Http request given a set of options
	* @param options Options to build the HTTP request
	*/
	async request(options) {
		const requestInit = buildRequestInit(options, options.webFetchExtra);
		const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
		const url = urlParams ? `${options.url}?${urlParams}` : options.url;
		const response = await fetch(url, requestInit);
		const contentType = response.headers.get("content-type") || "";
		let { responseType = "text" } = response.ok ? options : {};
		if (contentType.includes("application/json")) responseType = "json";
		let data;
		let blob;
		switch (responseType) {
			case "arraybuffer":
			case "blob":
				blob = await response.blob();
				data = await readBlobAsBase64(blob);
				break;
			case "json":
				data = await response.json();
				break;
			default: data = await response.text();
		}
		const headers = {};
		response.headers.forEach((value, key) => {
			headers[key] = value;
		});
		return {
			data,
			headers,
			status: response.status,
			url: response.url
		};
	}
	/**
	* Perform an Http GET request given a set of options
	* @param options Options to build the HTTP request
	*/
	async get(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
	}
	/**
	* Perform an Http POST request given a set of options
	* @param options Options to build the HTTP request
	*/
	async post(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
	}
	/**
	* Perform an Http PUT request given a set of options
	* @param options Options to build the HTTP request
	*/
	async put(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
	}
	/**
	* Perform an Http PATCH request given a set of options
	* @param options Options to build the HTTP request
	*/
	async patch(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
	}
	/**
	* Perform an Http DELETE request given a set of options
	* @param options Options to build the HTTP request
	*/
	async delete(options) {
		return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
	}
};
registerPlugin("CapacitorHttp", { web: () => new CapacitorHttpPluginWeb() });
/******** END HTTP PLUGIN ********/
/******** SYSTEM BARS PLUGIN ********/
/**
* Available status bar styles.
*/
var SystemBarsStyle;
(function(SystemBarsStyle) {
	/**
	* Light system bar content on a dark background.
	*
	* @since 8.0.0
	*/
	SystemBarsStyle["Dark"] = "DARK";
	/**
	* For dark system bar content on a light background.
	*
	* @since 8.0.0
	*/
	SystemBarsStyle["Light"] = "LIGHT";
	/**
	* The style is based on the device appearance or the underlying content.
	* If the device is using Dark mode, the system bars content will be light.
	* If the device is using Light mode, the system bars content will be dark.
	*
	* @since 8.0.0
	*/
	SystemBarsStyle["Default"] = "DEFAULT";
})(SystemBarsStyle || (SystemBarsStyle = {}));
/**
* Available system bar types.
*/
var SystemBarType;
(function(SystemBarType) {
	/**
	* The top status bar on both Android and iOS.
	*
	* @since 8.0.0
	*/
	SystemBarType["StatusBar"] = "StatusBar";
	/**
	* The navigation bar (or gesture bar on iOS) on both Android and iOS.
	*
	* @since 8.0.0
	*/
	SystemBarType["NavigationBar"] = "NavigationBar";
})(SystemBarType || (SystemBarType = {}));
var SystemBarsPluginWeb = class extends WebPlugin {
	async setStyle() {
		this.unavailable("not available for web");
	}
	async setAnimation() {
		this.unavailable("not available for web");
	}
	async show() {
		this.unavailable("not available for web");
	}
	async hide() {
		this.unavailable("not available for web");
	}
};
registerPlugin("SystemBars", { web: () => new SystemBarsPluginWeb() });
// node_modules/@capacitor-community/admob/dist/esm/native-ads/native-ad-template.enum.js
/**
* Layouts rendered by the native Google Mobile Ads SDK.
*
* The dimensions of a native ad slot must remain stable while it is used by a
* virtual scroller. `small` is intended for compact rows, while `medium`
* includes a larger media area.
*/
var NativeAdTemplate;
(function(NativeAdTemplate) {
	NativeAdTemplate["Small"] = "small";
	NativeAdTemplate["Medium"] = "medium";
})(NativeAdTemplate || (NativeAdTemplate = {}));
// node_modules/@capacitor-community/admob/dist/esm/definitions.js
var MaxAdContentRating;
(function(MaxAdContentRating) {
	/**
	* Content suitable for general audiences, including families.
	*/
	MaxAdContentRating["General"] = "General";
	/**
	* Content suitable for most audiences with parental guidance.
	*/
	MaxAdContentRating["ParentalGuidance"] = "ParentalGuidance";
	/**
	* Content suitable for teen and older audiences.
	*/
	MaxAdContentRating["Teen"] = "Teen";
	/**
	* Content suitable only for mature audiences.
	*/
	MaxAdContentRating["MatureAudience"] = "MatureAudience";
})(MaxAdContentRating || (MaxAdContentRating = {}));
// node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-plugin-events.enum.js
var BannerAdPluginEvents;
(function(BannerAdPluginEvents) {
	/**
	* Emits when the displayed banner size changes.
	*/
	BannerAdPluginEvents["SizeChanged"] = "bannerAdSizeChanged";
	/**
	* Emits when a banner ad has loaded.
	*/
	BannerAdPluginEvents["Loaded"] = "bannerAdLoaded";
	/**
	* Emits when a banner ad fails to load.
	*/
	BannerAdPluginEvents["FailedToLoad"] = "bannerAdFailedToLoad";
	/**
	* Emits when a banner opens an overlay after the user taps it.
	*/
	BannerAdPluginEvents["Opened"] = "bannerAdOpened";
	/**
	* Emits when the banner overlay is closed.
	*/
	BannerAdPluginEvents["Closed"] = "bannerAdClosed";
	/**
	* Emits when an impression is recorded for the banner ad.
	*/
	BannerAdPluginEvents["AdImpression"] = "bannerAdImpression";
	/**
	* Emits impression-level ad revenue data when a paid event is recorded.
	*/
	BannerAdPluginEvents["AdPaid"] = "bannerAdPaid";
})(BannerAdPluginEvents || (BannerAdPluginEvents = {}));
// node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-position.enum.js
/**
* @see https://developer.android.com/reference/android/widget/LinearLayout#attr_android:gravity
*/
var BannerAdPosition;
(function(BannerAdPosition) {
	/**
	* Positions the banner at the top center of the screen.
	*/
	BannerAdPosition["TOP_CENTER"] = "TOP_CENTER";
	/**
	* Positions the banner at the center of the screen.
	*/
	BannerAdPosition["CENTER"] = "CENTER";
	/**
	* Positions the banner at the bottom center of the screen.
	*/
	BannerAdPosition["BOTTOM_CENTER"] = "BOTTOM_CENTER";
})(BannerAdPosition || (BannerAdPosition = {}));
// node_modules/@capacitor-community/admob/dist/esm/banner/banner-ad-size.enum.js
/**
*  For more information:
*  https://developers.google.com/admob/ios/banner#banner_sizes
*  https://developers.google.com/android/reference/com/google/android/gms/ads/AdSize
*
* */
var BannerAdSize;
(function(BannerAdSize) {
	/**
	* Mobile Marketing Association (MMA)
	* banner ad size (320x50 density-independent pixels).
	*/
	BannerAdSize["BANNER"] = "BANNER";
	/**
	* Interactive Advertising Bureau (IAB)
	* full banner ad size (468x60 density-independent pixels).
	*/
	BannerAdSize["FULL_BANNER"] = "FULL_BANNER";
	/**
	* Large banner ad size (320x100 density-independent pixels).
	*/
	BannerAdSize["LARGE_BANNER"] = "LARGE_BANNER";
	/**
	* Interactive Advertising Bureau (IAB)
	* medium rectangle ad size (300x250 density-independent pixels).
	*/
	BannerAdSize["MEDIUM_RECTANGLE"] = "MEDIUM_RECTANGLE";
	/**
	* Interactive Advertising Bureau (IAB)
	* leaderboard ad size (728x90 density-independent pixels).
	*/
	BannerAdSize["LEADERBOARD"] = "LEADERBOARD";
	/**
	* A dynamically sized banner that is full-width and auto-height.
	*/
	BannerAdSize["ADAPTIVE_BANNER"] = "ADAPTIVE_BANNER";
	/**
	* A legacy smart banner sized to the screen width.
	* Retained for compatibility; use `ADAPTIVE_BANNER` for new integrations.
	*
	* @deprecated Use `ADAPTIVE_BANNER` instead.
	*/
	BannerAdSize["SMART_BANNER"] = "SMART_BANNER";
})(BannerAdSize || (BannerAdSize = {}));
// node_modules/@capacitor-community/admob/dist/esm/interstitial/interstitial-ad-plugin-events.enum.js
var InterstitialAdPluginEvents;
(function(InterstitialAdPluginEvents) {
	/**
	* Emits when an interstitial ad has loaded and is ready to show.
	*/
	InterstitialAdPluginEvents["Loaded"] = "interstitialAdLoaded";
	/**
	* Emits when an interstitial ad fails to load.
	*/
	InterstitialAdPluginEvents["FailedToLoad"] = "interstitialAdFailedToLoad";
	/**
	* Emits when an interstitial ad is shown.
	*/
	InterstitialAdPluginEvents["Showed"] = "interstitialAdShowed";
	/**
	* Emits when a loaded interstitial ad fails to show.
	*/
	InterstitialAdPluginEvents["FailedToShow"] = "interstitialAdFailedToShow";
	/**
	* Emits when an interstitial ad is dismissed.
	*/
	InterstitialAdPluginEvents["Dismissed"] = "interstitialAdDismissed";
	/**
	* Emits impression-level ad revenue data when a paid event is recorded.
	*/
	InterstitialAdPluginEvents["AdImpression"] = "interstitialAdImpression";
})(InterstitialAdPluginEvents || (InterstitialAdPluginEvents = {}));
// node_modules/@capacitor-community/admob/dist/esm/reward-interstitial/reward-interstitial-ad-plugin-events.enum.js
var RewardInterstitialAdPluginEvents;
(function(RewardInterstitialAdPluginEvents) {
	/**
	* Emits when a rewarded interstitial ad has loaded and is ready to show.
	*/
	RewardInterstitialAdPluginEvents["Loaded"] = "onRewardedInterstitialAdLoaded";
	/**
	* Emits when a rewarded interstitial ad fails to load.
	*/
	RewardInterstitialAdPluginEvents["FailedToLoad"] = "onRewardedInterstitialAdFailedToLoad";
	/**
	* Emits when a rewarded interstitial ad is shown.
	*/
	RewardInterstitialAdPluginEvents["Showed"] = "onRewardedInterstitialAdShowed";
	/**
	* Emits when a loaded rewarded interstitial ad fails to show.
	*/
	RewardInterstitialAdPluginEvents["FailedToShow"] = "onRewardedInterstitialAdFailedToShow";
	/**
	* Emits when a rewarded interstitial ad is dismissed.
	*
	* This event does not indicate whether the user earned a reward. Listen for
	* `Rewarded` separately before granting the reward.
	*/
	RewardInterstitialAdPluginEvents["Dismissed"] = "onRewardedInterstitialAdDismissed";
	/**
	* Emits when the user earns the advertised reward.
	*/
	RewardInterstitialAdPluginEvents["Rewarded"] = "onRewardedInterstitialAdReward";
	/**
	* Emits impression-level ad revenue data when a paid event is recorded.
	*/
	RewardInterstitialAdPluginEvents["AdImpression"] = "onRewardedInterstitialAdImpression";
})(RewardInterstitialAdPluginEvents || (RewardInterstitialAdPluginEvents = {}));
// node_modules/@capacitor-community/admob/dist/esm/reward/reward-ad-plugin-events.enum.js
var RewardAdPluginEvents;
(function(RewardAdPluginEvents) {
	/**
	* Emits when the SDK records a click on a rewarded ad.
	*/
	RewardAdPluginEvents["adClicked"] = "onRewardedVideoAdClicked";
	/**
	* Emits when a rewarded ad has loaded and is ready to show.
	*/
	RewardAdPluginEvents["Loaded"] = "onRewardedVideoAdLoaded";
	/**
	* Emits when a rewarded ad fails to load.
	*/
	RewardAdPluginEvents["FailedToLoad"] = "onRewardedVideoAdFailedToLoad";
	/**
	* Emits when a rewarded ad is shown.
	*/
	RewardAdPluginEvents["Showed"] = "onRewardedVideoAdShowed";
	/**
	* Emits when a loaded rewarded ad fails to show.
	*/
	RewardAdPluginEvents["FailedToShow"] = "onRewardedVideoAdFailedToShow";
	/**
	* Emits when a rewarded ad is dismissed.
	*
	* This event does not indicate whether the user earned a reward. Listen for
	* `Rewarded` separately before granting the reward.
	*/
	RewardAdPluginEvents["Dismissed"] = "onRewardedVideoAdDismissed";
	/**
	* Emits when the user earns the advertised reward.
	*/
	RewardAdPluginEvents["Rewarded"] = "onRewardedVideoAdReward";
	/**
	* Emits impression-level ad revenue data when a paid event is recorded.
	*/
	RewardAdPluginEvents["AdImpression"] = "onRewardedVideoAdImpression";
})(RewardAdPluginEvents || (RewardAdPluginEvents = {}));
// node_modules/@capacitor-community/admob/dist/esm/consent/consent-status.enum.js
/**
*  For more information:
*  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#consentstatus
*
* */
var AdmobConsentStatus;
(function(AdmobConsentStatus) {
	/**
	* User consent not required.
	*/
	AdmobConsentStatus["NOT_REQUIRED"] = "NOT_REQUIRED";
	/**
	* User consent already obtained.
	*/
	AdmobConsentStatus["OBTAINED"] = "OBTAINED";
	/**
	* User consent required but not yet obtained.
	*/
	AdmobConsentStatus["REQUIRED"] = "REQUIRED";
	/**
	* Unknown consent status, AdsConsent.requestInfoUpdate needs to be called to update it.
	*/
	AdmobConsentStatus["UNKNOWN"] = "UNKNOWN";
})(AdmobConsentStatus || (AdmobConsentStatus = {}));
// node_modules/@capacitor-community/admob/dist/esm/consent/consent-debug-geography.enum.js
/**
*  For more information:
*  https://developers.google.com/admob/unity/reference/namespace/google-mobile-ads/ump/api#debuggeography
*
* */
var AdmobConsentDebugGeography;
(function(AdmobConsentDebugGeography) {
	/**
	* Debug geography disabled.
	*/
	AdmobConsentDebugGeography[AdmobConsentDebugGeography["DISABLED"] = 0] = "DISABLED";
	/**
	* Geography appears as in EEA for debug devices.
	*/
	AdmobConsentDebugGeography[AdmobConsentDebugGeography["EEA"] = 1] = "EEA";
	/**
	* Geography appears as not in EEA for debug devices.
	* @deprecated
	*/
	AdmobConsentDebugGeography[AdmobConsentDebugGeography["NOT_EEA"] = 2] = "NOT_EEA";
	/**
	* Geography appears as in regulated US state for debug devices.
	*/
	AdmobConsentDebugGeography[AdmobConsentDebugGeography["US"] = 3] = "US";
	/**
	* Geography appears as OTHER state for debug devices.
	*/
	AdmobConsentDebugGeography[AdmobConsentDebugGeography["OTHER"] = 4] = "OTHER";
})(AdmobConsentDebugGeography || (AdmobConsentDebugGeography = {}));
// node_modules/@capacitor-community/admob/dist/esm/shared/ad-mob-revenue-data.interface.js
/**
* The precision of an impression-level ad value.
*/
var AdValuePrecision;
(function(AdValuePrecision) {
	/**
	* The ad value precision is unknown.
	*/
	AdValuePrecision[AdValuePrecision["Unknown"] = 0] = "Unknown";
	/**
	* The ad value is estimated from aggregated data.
	*/
	AdValuePrecision[AdValuePrecision["Estimated"] = 1] = "Estimated";
	/**
	* The ad value was provided by the publisher.
	*/
	AdValuePrecision[AdValuePrecision["PublisherProvided"] = 2] = "PublisherProvided";
	/**
	* The ad value is the precise value paid for this ad.
	*/
	AdValuePrecision[AdValuePrecision["Precise"] = 3] = "Precise";
})(AdValuePrecision || (AdValuePrecision = {}));
// node_modules/@capacitor-community/admob/dist/esm/app-open/app-open-ad-plugin-events.enum.js
var AppOpenAdPluginEvents;
(function(AppOpenAdPluginEvents) {
	/**
	* Emits when an App Open ad has loaded.
	*/
	AppOpenAdPluginEvents["Loaded"] = "appOpenAdLoaded";
	/**
	* Emits when an App Open ad fails to load.
	*/
	AppOpenAdPluginEvents["FailedToLoad"] = "appOpenAdFailedToLoad";
	/**
	* Emits when an App Open ad is shown.
	*/
	AppOpenAdPluginEvents["Opened"] = "appOpenAdOpened";
	/**
	* Emits when an App Open ad is dismissed.
	*/
	AppOpenAdPluginEvents["Closed"] = "appOpenAdClosed";
	/**
	* Emits when a loaded App Open ad fails to show.
	*/
	AppOpenAdPluginEvents["FailedToShow"] = "appOpenAdFailedToShow";
	/**
	* Emits impression-level ad revenue data when a paid event is recorded.
	*/
	AppOpenAdPluginEvents["AdImpression"] = "appOpenAdImpression";
})(AppOpenAdPluginEvents || (AppOpenAdPluginEvents = {}));
// node_modules/@capacitor-community/admob/dist/esm/native-ads/native-ad-plugin-events.enum.js
var NativeAdPluginEvents;
(function(NativeAdPluginEvents) {
	NativeAdPluginEvents["Loaded"] = "nativeAdLoaded";
	NativeAdPluginEvents["FailedToLoad"] = "nativeAdFailedToLoad";
	NativeAdPluginEvents["Clicked"] = "nativeAdClicked";
	NativeAdPluginEvents["AdImpression"] = "nativeAdImpression";
	NativeAdPluginEvents["Opened"] = "nativeAdOpened";
	NativeAdPluginEvents["Closed"] = "nativeAdClosed";
	NativeAdPluginEvents["AdPaid"] = "nativeAdPaid";
})(NativeAdPluginEvents || (NativeAdPluginEvents = {}));
var AdMob = registerPlugin("AdMob", { web: () => __vitePreload(() => import("./web-BZ5LY6pP.js").then((m) => new m.AdMobWeb()), []) });
// src/config/admob.ts
var ADMOB_CONFIG = {
	appId: "ca-app-pub-7897492892059206~7970405530",
	publisherId: "pub-7897492892059206",
	appPubClient: "ca-app-pub-7897492892059206",
	bannerAdUnitId: "ca-app-pub-7897492892059206/7421409491",
	bannerAdSlot: "7421409491",
	rewardedAdUnitId: "ca-app-pub-7897492892059206/5789597777",
	rewardedAdSlot: "5789597777"
};
// src/utils/admobBridge.ts
var initialized = false;
var bannerVisible = false;
function isNativeCapacitorApp() {
	try {
		return Capacitor.isNativePlatform();
	} catch {
		return false;
	}
}
async function initNativeAdMob() {
	if (!isNativeCapacitorApp() || initialized) return;
	try {
		await AdMob.initialize({ initializeForTesting: false });
		initialized = true;
	} catch {}
}
async function showNativeBanner() {
	if (!isNativeCapacitorApp()) return;
	try {
		await initNativeAdMob();
		if (bannerVisible) {
			await AdMob.resumeBanner();
			return;
		}
		await AdMob.showBanner({
			adId: ADMOB_CONFIG.bannerAdUnitId,
			adSize: BannerAdSize.ADAPTIVE_BANNER,
			position: BannerAdPosition.BOTTOM_CENTER,
			isTesting: false
		});
		bannerVisible = true;
	} catch {}
}
async function hideNativeBanner() {
	if (!isNativeCapacitorApp() || !bannerVisible) return;
	try {
		await AdMob.hideBanner();
	} catch {}
}
/**
* Triggers a native Android AdMob Rewarded Video Ad when running inside Capacitor.
* Returns 'rewarded' if earned, 'dismissed' if closed early, or 'unavailable' on web so
* the caller falls back smoothly to the in-app web RewardVideoAdModal.
*/
async function tryShowNativeRewardedAd() {
	if (!isNativeCapacitorApp()) return "unavailable";
	try {
		await initNativeAdMob();
		let earned = false;
		const rewardHandle = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
			earned = true;
		});
		try {
			await AdMob.prepareRewardVideoAd({
				adId: ADMOB_CONFIG.rewardedAdUnitId,
				isTesting: false
			});
			const rewardItem = await AdMob.showRewardVideoAd();
			if (rewardItem && typeof rewardItem.amount === "number") earned = true;
			return earned ? "rewarded" : "dismissed";
		} finally {
			await rewardHandle.remove();
		}
	} catch {
		return "unavailable";
	}
}
// node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element");
	var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
// src/components/SkyBackdrop.tsx
var import_jsx_runtime = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
})))();
var SkyBackdrop = ({ showMeadow = false }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none fixed inset-0 z-0 overflow-hidden",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-[#BFE3FF] via-[#DCEEFF] to-[#EFF7FF]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute -top-24 left-1/2 -translate-x-1/2 w-[140vw] h-[65vh] opacity-55",
				style: { background: "radial-gradient(circle at 50% 18%, rgba(255, 245, 198, 0.95) 0%, rgba(255, 245, 198, 0.35) 35%, rgba(255, 255, 255, 0) 70%)" }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 1440 900",
				preserveAspectRatio: "xMidYMid slice",
				className: "absolute inset-0 w-full h-full opacity-75",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					fill: "#FFFFFF",
					fillOpacity: "0.65",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "140",
							cy: "140",
							r: "85"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "220",
							cy: "125",
							r: "105"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "315",
							cy: "150",
							r: "78"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "1200",
							cy: "130",
							r: "95"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "1310",
							cy: "115",
							r: "110"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "1105",
							cy: "155",
							r: "70"
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					fill: "#FFFFFF",
					fillOpacity: "0.45",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "90",
							cy: "480",
							r: "120"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "200",
							cy: "510",
							r: "95"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "1320",
							cy: "470",
							r: "130"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: "1210",
							cy: "500",
							r: "90"
						})
					]
				})]
			}),
			showMeadow && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 1440 220",
				preserveAspectRatio: "none",
				className: "absolute bottom-0 left-0 w-full h-24 sm:h-28",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0,120 C260,30 520,170 780,100 C1040,30 1260,150 1440,80 L1440,220 L0,220 Z",
					fill: "#A6E07B",
					fillOpacity: "0.7"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M0,150 C340,95 620,195 960,125 C1180,80 1340,145 1440,120 L1440,220 L0,220 Z",
					fill: "#7FD15C",
					fillOpacity: "0.8"
				})]
			})
		]
	});
};
// node_modules/lucide-react/dist/esm/shared/src/utils.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
var toCamelCase = (string) => string.replace(/^([A-Z])|[\s-_]+(\w)/g, (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase());
var toPascalCase = (string) => {
	const camelCase = toCamelCase(string);
	return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
	return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
var hasA11yProp = (props) => {
	for (const prop in props) if (prop.startsWith("aria-") || prop === "role" || prop === "title") return true;
};
// node_modules/lucide-react/dist/esm/defaultAttributes.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var defaultAttributes = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
};
// node_modules/lucide-react/dist/esm/Icon.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Icon = (0, import_react.forwardRef)(({ color = "currentColor", size = 24, strokeWidth = 2, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => (0, import_react.createElement)("svg", {
	ref,
	...defaultAttributes,
	width: size,
	height: size,
	stroke: color,
	strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
	className: mergeClasses("lucide", className),
	...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
	...rest
}, [...iconNode.map(([tag, attrs]) => (0, import_react.createElement)(tag, attrs)), ...Array.isArray(children) ? children : [children]]));
// node_modules/lucide-react/dist/esm/createLucideIcon.js
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var createLucideIcon = (iconName, iconNode) => {
	const Component = (0, import_react.forwardRef)(({ className, ...props }, ref) => (0, import_react.createElement)(Icon, {
		ref,
		iconNode,
		className: mergeClasses(`lucide-${toKebabCase(toPascalCase(iconName))}`, `lucide-${iconName}`, className),
		...props
	}));
	Component.displayName = toPascalCase(iconName);
	return Component;
};
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowLeft = createLucideIcon("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ArrowRight = createLucideIcon("arrow-right", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "m12 5 7 7-7 7",
	key: "xquz4c"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Award = createLucideIcon("award", [["path", {
	d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
	key: "1yiouv"
}], ["circle", {
	cx: "12",
	cy: "8",
	r: "6",
	key: "1vp47v"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bird = createLucideIcon("bird", [
	["path", {
		d: "M16 7h.01",
		key: "1kdx03"
	}],
	["path", {
		d: "M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20",
		key: "oj1oa8"
	}],
	["path", {
		d: "m20 7 2 .5-2 .5",
		key: "12nv4d"
	}],
	["path", {
		d: "M10 18v3",
		key: "1yea0a"
	}],
	["path", {
		d: "M14 17.75V21",
		key: "1pymcb"
	}],
	["path", {
		d: "M7 18a6 6 0 0 0 3.84-10.61",
		key: "1npnn0"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var BookOpen = createLucideIcon("book-open", [["path", {
	d: "M12 7v14",
	key: "1akyts"
}], ["path", {
	d: "M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",
	key: "ruj8y"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Bookmark = createLucideIcon("bookmark", [["path", {
	d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z",
	key: "1fy3hk"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Check = createLucideIcon("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronLeft = createLucideIcon("chevron-left", [["path", {
	d: "m15 18-6-6 6-6",
	key: "1wnfg3"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronRight = createLucideIcon("chevron-right", [["path", {
	d: "m9 18 6-6-6-6",
	key: "mthhwq"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CircleAlert = createLucideIcon("circle-alert", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "8",
		y2: "12",
		key: "1pkeuh"
	}],
	["line", {
		x1: "12",
		x2: "12.01",
		y1: "16",
		y2: "16",
		key: "4dfq90"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Clock = createLucideIcon("clock", [["path", {
	d: "M12 6v6l4 2",
	key: "mmk7yg"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Cloud = createLucideIcon("cloud", [["path", {
	d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z",
	key: "p7xjir"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Copy = createLucideIcon("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Crown = createLucideIcon("crown", [["path", {
	d: "M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z",
	key: "1vdc57"
}], ["path", {
	d: "M5 21h14",
	key: "11awu3"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Dices = createLucideIcon("dices", [
	["rect", {
		width: "12",
		height: "12",
		x: "2",
		y: "10",
		rx: "2",
		ry: "2",
		key: "6agr2n"
	}],
	["path", {
		d: "m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6",
		key: "1o487t"
	}],
	["path", {
		d: "M6 18h.01",
		key: "uhywen"
	}],
	["path", {
		d: "M10 14h.01",
		key: "ssrbsk"
	}],
	["path", {
		d: "M15 6h.01",
		key: "cblpky"
	}],
	["path", {
		d: "M18 9h.01",
		key: "2061c0"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Download = createLucideIcon("download", [
	["path", {
		d: "M12 15V3",
		key: "m9g1x1"
	}],
	["path", {
		d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
		key: "ih7n3h"
	}],
	["path", {
		d: "m7 10 5 5 5-5",
		key: "brsn70"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Feather = createLucideIcon("feather", [
	["path", {
		d: "M12.67 19a2 2 0 0 0 1.416-.588l6.154-6.172a6 6 0 0 0-8.49-8.49L5.586 9.914A2 2 0 0 0 5 11.328V18a1 1 0 0 0 1 1z",
		key: "18jl4k"
	}],
	["path", {
		d: "M16 8 2 22",
		key: "vp34q"
	}],
	["path", {
		d: "M17.5 15H9",
		key: "1oz8nu"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Fish = createLucideIcon("fish", [
	["path", {
		d: "M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z",
		key: "15baut"
	}],
	["path", {
		d: "M18 12v.5",
		key: "18hhni"
	}],
	["path", {
		d: "M16 17.93a9.77 9.77 0 0 1 0-11.86",
		key: "16dt7o"
	}],
	["path", {
		d: "M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33",
		key: "l9di03"
	}],
	["path", {
		d: "M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4",
		key: "1kjonw"
	}],
	["path", {
		d: "m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98",
		key: "1zlm23"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Flame = createLucideIcon("flame", [["path", {
	d: "M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4",
	key: "1slcih"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Globe = createLucideIcon("globe", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
		key: "13o1zl"
	}],
	["path", {
		d: "M2 12h20",
		key: "9i4pu4"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Headphones = createLucideIcon("headphones", [["path", {
	d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3",
	key: "1xhozi"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var House = createLucideIcon("house", [["path", {
	d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",
	key: "5wwlr5"
}], ["path", {
	d: "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
	key: "r6nss1"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Layers = createLucideIcon("layers", [
	["path", {
		d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
		key: "zw3jo"
	}],
	["path", {
		d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
		key: "1wduqc"
	}],
	["path", {
		d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
		key: "kqbvx6"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Leaf = createLucideIcon("leaf", [["path", {
	d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
	key: "nnexq3"
}], ["path", {
	d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12",
	key: "mt58a7"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ListChecks = createLucideIcon("list-checks", [
	["path", {
		d: "M13 5h8",
		key: "a7qcls"
	}],
	["path", {
		d: "M13 12h8",
		key: "h98zly"
	}],
	["path", {
		d: "M13 19h8",
		key: "c3s6r1"
	}],
	["path", {
		d: "m3 17 2 2 4-4",
		key: "1jhpwq"
	}],
	["path", {
		d: "m3 7 2 2 4-4",
		key: "1obspn"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LoaderCircle = createLucideIcon("loader-circle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LockOpen = createLucideIcon("lock-open", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 9.9-1",
	key: "1mm8w8"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Lock = createLucideIcon("lock", [["rect", {
	width: "18",
	height: "11",
	x: "3",
	y: "11",
	rx: "2",
	ry: "2",
	key: "1w4ew1"
}], ["path", {
	d: "M7 11V7a5 5 0 0 1 10 0v4",
	key: "fwvmzm"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Mic = createLucideIcon("mic", [
	["path", {
		d: "M12 19v3",
		key: "npa21l"
	}],
	["path", {
		d: "M19 10v2a7 7 0 0 1-14 0v-2",
		key: "1vc78b"
	}],
	["rect", {
		x: "9",
		y: "2",
		width: "6",
		height: "13",
		rx: "3",
		key: "s6n7sd"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Music = createLucideIcon("music", [
	["path", {
		d: "M9 18V5l12-2v13",
		key: "1jmyc2"
	}],
	["circle", {
		cx: "6",
		cy: "18",
		r: "3",
		key: "fqmcym"
	}],
	["circle", {
		cx: "18",
		cy: "16",
		r: "3",
		key: "1hluhg"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pause = createLucideIcon("pause", [["rect", {
	x: "14",
	y: "3",
	width: "5",
	height: "18",
	rx: "1",
	key: "kaeet6"
}], ["rect", {
	x: "5",
	y: "3",
	width: "5",
	height: "18",
	rx: "1",
	key: "1wsw3u"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pencil = createLucideIcon("pencil", [["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}], ["path", {
	d: "m15 5 4 4",
	key: "1mk7zo"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Play = createLucideIcon("play", [["path", {
	d: "M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z",
	key: "10ikf1"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var RotateCcw = createLucideIcon("rotate-ccw", [["path", {
	d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
	key: "1357e3"
}], ["path", {
	d: "M3 3v5h5",
	key: "1xhq8a"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ScrollText = createLucideIcon("scroll-text", [
	["path", {
		d: "M15 12h-5",
		key: "r7krc0"
	}],
	["path", {
		d: "M15 8h-5",
		key: "1khuty"
	}],
	["path", {
		d: "M19 17V5a2 2 0 0 0-2-2H4",
		key: "zz82l3"
	}],
	["path", {
		d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
		key: "1ph1d7"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Search = createLucideIcon("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Settings = createLucideIcon("settings", [["path", {
	d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
	key: "1i5ecw"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Share2 = createLucideIcon("share-2", [
	["circle", {
		cx: "18",
		cy: "5",
		r: "3",
		key: "gq8acd"
	}],
	["circle", {
		cx: "6",
		cy: "12",
		r: "3",
		key: "w7nqdw"
	}],
	["circle", {
		cx: "18",
		cy: "19",
		r: "3",
		key: "1xt0gg"
	}],
	["line", {
		x1: "8.59",
		x2: "15.42",
		y1: "13.51",
		y2: "17.49",
		key: "47mynk"
	}],
	["line", {
		x1: "15.41",
		x2: "8.59",
		y1: "6.51",
		y2: "10.49",
		key: "1n3mei"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Shield = createLucideIcon("shield", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var SlidersHorizontal = createLucideIcon("sliders-horizontal", [
	["path", {
		d: "M10 5H3",
		key: "1qgfaw"
	}],
	["path", {
		d: "M12 19H3",
		key: "yhmn1j"
	}],
	["path", {
		d: "M14 3v4",
		key: "1sua03"
	}],
	["path", {
		d: "M16 17v4",
		key: "1q0r14"
	}],
	["path", {
		d: "M21 12h-9",
		key: "1o4lsq"
	}],
	["path", {
		d: "M21 19h-5",
		key: "1rlt1p"
	}],
	["path", {
		d: "M21 5h-7",
		key: "1oszz2"
	}],
	["path", {
		d: "M8 10v4",
		key: "tgpxqk"
	}],
	["path", {
		d: "M8 12H3",
		key: "a7s4jb"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Smartphone = createLucideIcon("smartphone", [["rect", {
	width: "14",
	height: "20",
	x: "5",
	y: "2",
	rx: "2",
	ry: "2",
	key: "1yt0o3"
}], ["path", {
	d: "M12 18h.01",
	key: "mhygvu"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Smile = createLucideIcon("smile", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M8 14s1.5 2 4 2 4-2 4-2",
		key: "1y1vjs"
	}],
	["line", {
		x1: "9",
		x2: "9.01",
		y1: "9",
		y2: "9",
		key: "yxxnd0"
	}],
	["line", {
		x1: "15",
		x2: "15.01",
		y1: "9",
		y2: "9",
		key: "1p4y9e"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Snowflake = createLucideIcon("snowflake", [
	["path", {
		d: "m10 20-1.25-2.5L6 18",
		key: "18frcb"
	}],
	["path", {
		d: "M10 4 8.75 6.5 6 6",
		key: "7mghy3"
	}],
	["path", {
		d: "m14 20 1.25-2.5L18 18",
		key: "1chtki"
	}],
	["path", {
		d: "m14 4 1.25 2.5L18 6",
		key: "1b4wsy"
	}],
	["path", {
		d: "m17 21-3-6h-4",
		key: "15hhxa"
	}],
	["path", {
		d: "m17 3-3 6 1.5 3",
		key: "11697g"
	}],
	["path", {
		d: "M2 12h6.5L10 9",
		key: "kv9z4n"
	}],
	["path", {
		d: "m20 10-1.5 2 1.5 2",
		key: "1swlpi"
	}],
	["path", {
		d: "M22 12h-6.5L14 15",
		key: "1mxi28"
	}],
	["path", {
		d: "m4 10 1.5 2L4 14",
		key: "k9enpj"
	}],
	["path", {
		d: "m7 21 3-6-1.5-3",
		key: "j8hb9u"
	}],
	["path", {
		d: "m7 3 3 6h4",
		key: "1otusx"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Sparkles = createLucideIcon("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Split = createLucideIcon("split", [
	["path", {
		d: "M16 3h5v5",
		key: "1806ms"
	}],
	["path", {
		d: "M8 3H3v5",
		key: "15dfkv"
	}],
	["path", {
		d: "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3",
		key: "1qrqzj"
	}],
	["path", {
		d: "m15 9 6-6",
		key: "ko1vev"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Square = createLucideIcon("square", [["rect", {
	width: "18",
	height: "18",
	x: "3",
	y: "3",
	rx: "2",
	key: "afitv7"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Star = createLucideIcon("star", [["path", {
	d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
	key: "r04s7s"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trash2 = createLucideIcon("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Trophy = createLucideIcon("trophy", [
	["path", {
		d: "M10 14.66v1.626a2 2 0 0 1-.976 1.696A5 5 0 0 0 7 21.978",
		key: "1n3hpd"
	}],
	["path", {
		d: "M14 14.66v1.626a2 2 0 0 0 .976 1.696A5 5 0 0 1 17 21.978",
		key: "rfe1zi"
	}],
	["path", {
		d: "M18 9h1.5a1 1 0 0 0 0-5H18",
		key: "7xy6bh"
	}],
	["path", {
		d: "M4 22h16",
		key: "57wxv0"
	}],
	["path", {
		d: "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z",
		key: "1mhfuq"
	}],
	["path", {
		d: "M6 9H4.5a1 1 0 0 1 0-5H6",
		key: "tex48p"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var UserCheck = createLucideIcon("user-check", [
	["path", {
		d: "m16 11 2 2 4-4",
		key: "9rsbq5"
	}],
	["path", {
		d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
		key: "1yyitq"
	}],
	["circle", {
		cx: "9",
		cy: "7",
		r: "4",
		key: "nufk8"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var User = createLucideIcon("user", [["path", {
	d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",
	key: "975kel"
}], ["circle", {
	cx: "12",
	cy: "7",
	r: "4",
	key: "17ys0d"
}]]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Volume2 = createLucideIcon("volume-2", [
	["path", {
		d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
		key: "uqj9uw"
	}],
	["path", {
		d: "M16 9a5 5 0 0 1 0 6",
		key: "1q6k2b"
	}],
	["path", {
		d: "M19.364 18.364a9 9 0 0 0 0-12.728",
		key: "ijwkga"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var VolumeX = createLucideIcon("volume-x", [
	["path", {
		d: "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z",
		key: "uqj9uw"
	}],
	["line", {
		x1: "22",
		x2: "16",
		y1: "9",
		y2: "15",
		key: "1ewh16"
	}],
	["line", {
		x1: "16",
		x2: "22",
		y1: "9",
		y2: "15",
		key: "5ykzw1"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var WifiOff = createLucideIcon("wifi-off", [
	["path", {
		d: "M12 20h.01",
		key: "zekei9"
	}],
	["path", {
		d: "M8.5 16.429a5 5 0 0 1 7 0",
		key: "1bycff"
	}],
	["path", {
		d: "M5 12.859a10 10 0 0 1 5.17-2.69",
		key: "1dl1wf"
	}],
	["path", {
		d: "M19 12.859a10 10 0 0 0-2.007-1.523",
		key: "4k23kn"
	}],
	["path", {
		d: "M2 8.82a15 15 0 0 1 4.177-2.643",
		key: "1grhjp"
	}],
	["path", {
		d: "M22 8.82a15 15 0 0 0-11.288-3.764",
		key: "z3jwby"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]);
/**
* @license lucide-react v0.546.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var X = createLucideIcon("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]);
// src/components/BibleAvatarIcon.tsx
var BIBLE_AVATARS = [
	{
		id: "dove",
		label: "Dove",
		bg: "bg-[#E0F2FE]",
		ring: "border-[#38BDF8]",
		text: "text-[#0369A1]"
	},
	{
		id: "crown",
		label: "Crown",
		bg: "bg-[#FEF3C7]",
		ring: "border-[#F59E0B]",
		text: "text-[#B45309]"
	},
	{
		id: "scroll",
		label: "Scroll",
		bg: "bg-[#EDE9FE]",
		ring: "border-[#A78BFA]",
		text: "text-[#6D28D9]"
	},
	{
		id: "shield",
		label: "Shield",
		bg: "bg-[#DBEAFE]",
		ring: "border-[#3B82F6]",
		text: "text-[#1D4ED8]"
	},
	{
		id: "olive",
		label: "Olive Branch",
		bg: "bg-[#DCFCE7]",
		ring: "border-[#4ADE80]",
		text: "text-[#15803D]"
	}
];
var BibleAvatarIcon = ({ avatarId, size = "md" }) => {
	const meta = BIBLE_AVATARS.find((a) => a.id === avatarId) || BIBLE_AVATARS[0];
	const boxSize = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-12 h-12" : "w-9 h-9";
	const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
	const Icon = avatarId === "crown" ? Crown : avatarId === "scroll" ? ScrollText : avatarId === "shield" ? Shield : avatarId === "olive" ? Leaf : Bird;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `${boxSize} rounded-full ${meta.bg} border-2 ${meta.ring} ${meta.text} inline-flex items-center justify-center shrink-0`,
		"aria-label": meta.label,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: iconSize })
	});
};
var RankMedal = ({ rank }) => {
	if (rank === 1) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "w-8 h-8 rounded-full bg-gradient-to-b from-[#FFE66D] to-[#F59E0B] border-2 border-[#B45309] text-[#78350F] inline-flex items-center justify-center shadow-xs shrink-0",
		"aria-label": "Gold Medal Rank 1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "w-4 h-4 fill-current" })
	});
	if (rank === 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "w-8 h-8 rounded-full bg-gradient-to-b from-[#F8FAFC] to-[#CBD5E1] border-2 border-[#64748B] text-[#334155] inline-flex items-center justify-center shadow-xs shrink-0",
		"aria-label": "Silver Medal Rank 2",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "w-4 h-4 fill-current" })
	});
	if (rank === 3) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "w-8 h-8 rounded-full bg-gradient-to-b from-[#FDBA74] to-[#C2410C] border-2 border-[#7C2D12] text-white inline-flex items-center justify-center shadow-xs shrink-0",
		"aria-label": "Bronze Medal Rank 3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "w-4 h-4 fill-current" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "w-8 h-8 rounded-full bg-[#EDF5FF] text-[#14274E] font-display text-xs font-extrabold inline-flex items-center justify-center tabular-nums shrink-0",
		children: ["#", rank]
	});
};
// src/components/GoldCoinIcon.tsx
var GoldCoinIcon = ({ className = "w-6 h-6", dimmed = false, missed = false }) => {
	const gradId = (0, import_react.useId)();
	if (dimmed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 36 36",
		className,
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "18",
			cy: "18",
			r: "15",
			fill: "#F1F5F9",
			stroke: "#CBD5E1",
			strokeWidth: "2.5"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "18",
			cy: "18",
			r: "10",
			fill: "none",
			stroke: "#CBD5E1",
			strokeWidth: "1.5",
			strokeDasharray: "3 2"
		})]
	});
	if (missed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 36 36",
		className,
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "18",
			cy: "18",
			r: "15",
			fill: "#FFEDD5",
			stroke: "#FB923C",
			strokeWidth: "2.5"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M13 13 L23 23 M23 13 L13 23",
			stroke: "#EA580C",
			strokeWidth: "2.5",
			strokeLinecap: "round"
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 36 36",
		className,
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: gradId,
				x1: "0%",
				y1: "0%",
				x2: "100%",
				y2: "100%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#FFF07A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "50%",
						stopColor: "#FFD02C"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#E59300"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "18",
				r: "15.5",
				fill: `url(#${gradId})`,
				stroke: "#C27200",
				strokeWidth: "2.2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "18",
				cy: "18",
				r: "11.5",
				fill: "none",
				stroke: "#FFF7B2",
				strokeWidth: "1.8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M18 11.5 V24.5 M14.2 15.2 H21.8",
				stroke: "#9A5400",
				strokeWidth: "2.5",
				strokeLinecap: "round"
			})
		]
	});
};
// src/components/TopBar.tsx
var TopBar = ({ profile, stats, onOpenProfileModal, onOpenLeaderboard }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "relative z-20 shrink-0 w-full bg-white/85 backdrop-blur-md border-b border-[#DCEBFF] px-3 sm:px-5 py-1.5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-4xl mx-auto flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onOpenProfileModal,
				className: "min-h-[36px] flex items-center gap-2 rounded-full pe-2.5 hover:bg-[#EDF5FF] transition-colors cursor-pointer min-w-0",
				"aria-label": "Edit player profile",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BibleAvatarIcon, {
					avatarId: profile.avatarId,
					size: "sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate max-w-[110px] sm:max-w-[160px]",
					children: profile.displayName || "Pilgrim"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 sm:gap-3 shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onOpenLeaderboard,
						className: "min-h-[34px] inline-flex items-center gap-1 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] px-2.5 py-1 text-xs font-extrabold text-[#164A9E] tabular-nums transition-colors cursor-pointer whitespace-nowrap",
						"aria-label": "Open Leaderboard",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-3.5 h-3.5 text-[#F59E0B]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [stats.totalScore.toLocaleString(), " pts"] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "hidden sm:inline-flex items-center gap-1 text-xs font-extrabold text-[#C2410C] tabular-nums whitespace-nowrap",
						title: "Best Streak",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "w-3.5 h-3.5 fill-[#FB923C] text-[#EA580C]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: stats.bestStreak })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-h-[34px] inline-flex items-center gap-1.5 rounded-full bg-[#FFF4C4] border border-[#F5B935] px-2.5 py-1 shadow-2xs",
						"aria-label": `Coin balance: ${stats.totalCoins}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xs sm:text-sm font-extrabold text-[#7A5400] tabular-nums",
							children: stats.totalCoins.toLocaleString()
						})]
					})
				]
			})]
		})
	});
};
// src/components/BottomChrome.tsx
var BottomChrome = ({ activeTab, onSelectTab, t, showTabs, showBanner, onAdClick }) => {
	(0, import_react.useEffect)(() => {
		initNativeAdMob();
	}, []);
	(0, import_react.useEffect)(() => {
		if (showBanner) showNativeBanner();
		else hideNativeBanner();
	}, [showBanner]);
	const tabs = [
		{
			id: "home",
			label: t.tabHome,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "w-5 h-5" })
		},
		{
			id: "categories",
			label: "Packs",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-5 h-5" })
		},
		{
			id: "treasury",
			label: "Treasury",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-5 h-5" })
		},
		{
			id: "leaderboard",
			label: "Ranks",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-5 h-5" })
		},
		{
			id: "profile",
			label: t.tabProfile,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "w-5 h-5" })
		}
	];
	const isQuizOrCategories = activeTab === "categories" || activeTab === "quiz";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "relative z-30 shrink-0 w-full",
		children: [showTabs && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
			"aria-label": "Primary navigation",
			className: "bg-white/95 backdrop-blur-md border-t border-[#DCEBFF] shadow-[0_-4px_20px_rgba(20,39,78,0.06)]",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-w-4xl mx-auto grid grid-cols-5 gap-1 px-2 py-1.5",
				children: tabs.map((tab) => {
					const isActive = tab.id === "categories" ? isQuizOrCategories : activeTab === tab.id;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onSelectTab(tab.id),
						className: `min-h-[44px] flex flex-col items-center justify-center rounded-2xl px-1.5 py-1 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2F8FFF] ${isActive ? "bg-[#2F8FFF] text-white shadow-sm" : "text-[#5C7299] hover:bg-[#EDF5FF] hover:text-[#14274E]"}`,
						children: [tab.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] sm:text-[11px] font-semibold mt-0.5 leading-tight whitespace-nowrap truncate max-w-full",
							children: tab.label
						})]
					}, tab.id);
				})
			})
		}), showBanner && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "bg-[#FFF2BA] border-t border-[#F3DC86] px-3 py-1",
			"data-ad-provider": "google-admob",
			"data-ad-app-id": ADMOB_CONFIG.appId,
			"data-ad-unit-id": ADMOB_CONFIG.bannerAdUnitId,
			"data-ad-client": ADMOB_CONFIG.appPubClient,
			"data-ad-slot": ADMOB_CONFIG.bannerAdSlot,
			"aria-label": `Banner Ad ${ADMOB_CONFIG.bannerAdUnitId}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "max-w-4xl mx-auto flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-bold text-[#6E5611] bg-[#FBE284] border border-[#E5C65B] rounded px-1.5 py-0.5 shrink-0",
						children: t.adBannerLabel
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-medium text-[#14274E] truncate",
						children: t.adBannerText
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onAdClick,
					className: "shrink-0 text-[10px] font-bold bg-[#2F8FFF] hover:bg-[#1E7CE8] text-white rounded-full px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap",
					children: t.nextQuestion === "Next" ? "Learn More" : t.nextQuestion
				})]
			})
		})]
	});
};
// src/components/StorySceneSvg.tsx
var StorySceneSvg = ({ theme, label, className = "w-full h-full" }) => {
	if (theme === "noah") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 400 160",
		className,
		role: "img",
		"aria-label": label,
		preserveAspectRatio: "xMidYMid slice",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "noahSky",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#7AC5FF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#D7EEFF"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "noahSea",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#268BFF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#1359BA"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "400",
				height: "160",
				fill: "url(#noahSky)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 40 130 A 160 110 0 0 1 360 130",
				fill: "none",
				stroke: "#FF6B6B",
				strokeWidth: "8",
				strokeLinecap: "round",
				opacity: "0.85"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 48 130 A 152 102 0 0 1 352 130",
				fill: "none",
				stroke: "#FFD166",
				strokeWidth: "8",
				strokeLinecap: "round",
				opacity: "0.88"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 56 130 A 144 94 0 0 1 344 130",
				fill: "none",
				stroke: "#49C946",
				strokeWidth: "8",
				strokeLinecap: "round",
				opacity: "0.85"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 64 130 A 136 86 0 0 1 336 130",
				fill: "none",
				stroke: "#4DA3FF",
				strokeWidth: "7",
				strokeLinecap: "round",
				opacity: "0.82"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "332",
				cy: "36",
				r: "18",
				fill: "#FFE066"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#FFFFFF",
				opacity: "0.95",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "76",
						cy: "40",
						rx: "26",
						ry: "12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "94",
						cy: "35",
						rx: "18",
						ry: "12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "290",
						cy: "48",
						rx: "22",
						ry: "10"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 116 96 L 284 96 L 266 130 L 134 130 Z",
				fill: "#9B5E2A",
				stroke: "#5C3210",
				strokeWidth: "3",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "146",
				y: "72",
				width: "108",
				height: "24",
				rx: "4",
				fill: "#BA763B",
				stroke: "#5C3210",
				strokeWidth: "2.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 138 74 L 200 54 L 262 74 Z",
				fill: "#7A4419",
				stroke: "#5C3210",
				strokeWidth: "2.5",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "190",
				y: "78",
				width: "20",
				height: "18",
				rx: "3",
				fill: "#FFF3C4",
				stroke: "#5C3210",
				strokeWidth: "2"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "158",
				y: "80",
				width: "7",
				height: "16",
				fill: "#F4B942"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "161.5",
				cy: "79",
				r: "5",
				fill: "#F4B942"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "236",
				cy: "86",
				r: "7",
				fill: "#94A3B8"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(88 64)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "0",
						cy: "0",
						rx: "8",
						ry: "5",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -3 -2 Q -12 -14 -18 -5 Q -10 1 -3 -2 Z",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 6 0 L 11 -1 L 7 2 Z",
						fill: "#F59E0B"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 10 1 Q 15 3 18 0",
						stroke: "#49C946",
						strokeWidth: "2",
						fill: "none"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 124 Q 40 116 80 124 T 160 124 T 240 124 T 320 124 T 400 124 L 400 160 L 0 160 Z",
				fill: "url(#noahSea)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 138 Q 35 132 70 138 T 140 138 T 210 138 T 280 138 T 350 138 T 400 138",
				fill: "none",
				stroke: "#93D5FF",
				strokeWidth: "2.5",
				opacity: "0.7"
			})
		]
	});
	if (theme === "whale") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 400 160",
		className,
		role: "img",
		"aria-label": label,
		preserveAspectRatio: "xMidYMid slice",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "seaSky",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#6EC1FF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#D6F0FF"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "oceanGrad",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#1696F2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#0D57A8"
				})]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "400",
				height: "160",
				fill: "url(#seaSky)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "72",
				cy: "36",
				r: "18",
				fill: "#FFE066"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#FFFFFF",
				opacity: "0.92",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "145",
						cy: "34",
						rx: "26",
						ry: "11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "163",
						cy: "29",
						rx: "18",
						ry: "11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "322",
						cy: "40",
						rx: "28",
						ry: "12"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(310 74)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -22 16 L 22 16 L 15 26 L -15 26 Z",
						fill: "#8C5324",
						stroke: "#4E2A0F",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "0",
						y1: "16",
						x2: "0",
						y2: "-16",
						stroke: "#4E2A0F",
						strokeWidth: "2.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 2 -14 L 22 12 L 2 12 Z",
						fill: "#FFF8E7",
						stroke: "#CBD5E1",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -2 -10 L -16 12 L -2 12 Z",
						fill: "#FFE675"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(182 96)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -16 -30 Q -26 -48 -38 -40",
						fill: "none",
						stroke: "#FFFFFF",
						strokeWidth: "3.5",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -14 -30 Q -4 -48 8 -40",
						fill: "none",
						stroke: "#FFFFFF",
						strokeWidth: "3.5",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -68 6 C -68 -24 -28 -34 12 -28 C 40 -24 56 -6 70 2 L 88 -12 L 84 6 L 94 20 L 70 12 C 46 28 -52 30 -68 6 Z",
						fill: "#2563EB",
						stroke: "#1E3A8A",
						strokeWidth: "2.5",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -62 10 C -40 24 22 24 44 10 C 20 8 -28 8 -62 10 Z",
						fill: "#BFDBFE"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "-38",
						cy: "-4",
						r: "4",
						fill: "#0F172A"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "-39.5",
						cy: "-5.5",
						r: "1.3",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -56 4 Q -46 10 -34 7",
						fill: "none",
						stroke: "#1E3A8A",
						strokeWidth: "2",
						strokeLinecap: "round"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 118 Q 40 108 80 118 T 160 118 T 240 118 T 320 118 T 400 118 L 400 160 L 0 160 Z",
				fill: "url(#oceanGrad)",
				opacity: "0.92"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 10 136 Q 55 128 100 136 T 190 136 T 280 136 T 370 136",
				fill: "none",
				stroke: "#93D5FF",
				strokeWidth: "2.5",
				strokeLinecap: "round",
				opacity: "0.75"
			})
		]
	});
	if (theme === "david") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 400 160",
		className,
		role: "img",
		"aria-label": label,
		preserveAspectRatio: "xMidYMid slice",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "davidSky",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#7CC6FF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#DCF0FF"
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "400",
				height: "160",
				fill: "url(#davidSky)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "335",
				cy: "36",
				r: "19",
				fill: "#FFE066"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#FFFFFF",
				opacity: "0.92",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "86",
						cy: "36",
						rx: "28",
						ry: "12"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "106",
						cy: "31",
						rx: "18",
						ry: "11"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "242",
						cy: "42",
						rx: "22",
						ry: "10"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 112 Q 110 74 220 108 T 400 100 L 400 160 L 0 160 Z",
				fill: "#7AD66D"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 124 Q 140 102 270 124 T 400 118 L 400 160 L 0 160 Z",
				fill: "#49B843"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(150 92)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "-18",
						y1: "-18",
						x2: "-24",
						y2: "26",
						stroke: "#784212",
						strokeWidth: "3.5",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -18 -18 A 6 6 0 0 1 -7 -18",
						fill: "none",
						stroke: "#784212",
						strokeWidth: "3.5",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -9 0 L 9 0 L 13 24 L -13 24 Z",
						fill: "#F59E0B",
						stroke: "#92400E",
						strokeWidth: "2"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -8 4 L 10 18",
						stroke: "#1696F2",
						strokeWidth: "4",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "0",
						cy: "-9",
						r: "9",
						fill: "#FCD5B5",
						stroke: "#92400E",
						strokeWidth: "1.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -9 -10 Q 0 -22 9 -10 Z",
						fill: "#78350F"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 10 8 Q 22 -4 26 8",
						fill: "none",
						stroke: "#784212",
						strokeWidth: "2"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(262 118)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "0",
						cy: "0",
						rx: "14",
						ry: "10",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "-11",
						cy: "-2",
						r: "5",
						fill: "#1E293B"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "36",
						cy: "4",
						rx: "13",
						ry: "9",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "26",
						cy: "2",
						r: "4.5",
						fill: "#1E293B"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#94A3B8",
				stroke: "#475569",
				strokeWidth: "1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "182",
						cy: "136",
						rx: "4",
						ry: "2.8"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "192",
						cy: "138",
						rx: "3.5",
						ry: "2.5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "201",
						cy: "135",
						rx: "4",
						ry: "2.8"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "187",
						cy: "142",
						rx: "3.5",
						ry: "2.4"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "198",
						cy: "142",
						rx: "3.8",
						ry: "2.6"
					})
				]
			})
		]
	});
	if (theme === "shepherd") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 400 160",
		className,
		role: "img",
		"aria-label": label,
		preserveAspectRatio: "xMidYMid slice",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "galileeSky",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#85CCFF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#FFF7D6"
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "400",
				height: "160",
				fill: "url(#galileeSky)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "200",
				cy: "48",
				r: "24",
				fill: "#FFE066",
				opacity: "0.95"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "200",
				cy: "48",
				r: "34",
				fill: "#FFE066",
				opacity: "0.25"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#FFFFFF",
				opacity: "0.9",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "82",
					cy: "36",
					rx: "25",
					ry: "10"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "318",
					cy: "38",
					rx: "28",
					ry: "11"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "44",
				y: "76",
				width: "10",
				height: "44",
				rx: "4",
				fill: "#7A4924"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#4E9F3D",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "49",
						cy: "66",
						r: "20"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "34",
						cy: "72",
						r: "14"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "64",
						cy: "72",
						r: "14"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 112 Q 110 82 220 110 T 400 104 L 400 160 L 0 160 Z",
				fill: "#82DB73"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 0 128 Q 160 106 300 128 T 400 122 L 400 160 L 0 160 Z",
				fill: "#4DC147"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M 186 122 L 186 78 A 9 9 0 0 1 204 78",
				fill: "none",
				stroke: "#7A4924",
				strokeWidth: "4",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(232 118)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "0",
						cy: "0",
						rx: "16",
						ry: "11",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "-13",
						cy: "-3",
						r: "6",
						fill: "#334155"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: "-15",
						cy: "-4",
						r: "1.2",
						fill: "#FFFFFF"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(284 126)",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
					cx: "0",
					cy: "0",
					rx: "14",
					ry: "9.5",
					fill: "#FFFFFF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "-11",
					cy: "-2",
					r: "5",
					fill: "#334155"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "110",
				cy: "136",
				r: "3",
				fill: "#FFD166"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "136",
				cy: "142",
				r: "3",
				fill: "#FF6B6B"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "338",
				cy: "138",
				r: "3",
				fill: "#FFD166"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 400 160",
		className,
		role: "img",
		"aria-label": label,
		preserveAspectRatio: "xMidYMid slice",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "bibleSky",
				x1: "0",
				y1: "0",
				x2: "0",
				y2: "1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "0%",
					stopColor: "#6CBAFF"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: "100%",
					stopColor: "#E1F2FF"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
				id: "goldenGlow",
				cx: "50%",
				cy: "35%",
				r: "55%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#FFF3B0",
						stopOpacity: "0.95"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "60%",
						stopColor: "#FFE066",
						stopOpacity: "0.25"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#FFE066",
						stopOpacity: "0"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "400",
				height: "160",
				fill: "url(#bibleSky)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				width: "400",
				height: "160",
				fill: "url(#goldenGlow)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				stroke: "#FFF8D6",
				strokeWidth: "2.5",
				opacity: "0.7",
				strokeLinecap: "round",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "200",
						y1: "16",
						x2: "200",
						y2: "34"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "158",
						y1: "24",
						x2: "170",
						y2: "40"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
						x1: "242",
						y1: "24",
						x2: "230",
						y2: "40"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "195",
				y: "28",
				width: "10",
				height: "44",
				rx: "3",
				fill: "#F5B935",
				stroke: "#B45309",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "182",
				y: "40",
				width: "36",
				height: "9",
				rx: "3",
				fill: "#F5B935",
				stroke: "#B45309",
				strokeWidth: "1.5"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				fill: "#FFFFFF",
				opacity: "0.95",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "96",
						cy: "134",
						rx: "58",
						ry: "22"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "200",
						cy: "136",
						rx: "84",
						ry: "24"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "304",
						cy: "134",
						rx: "58",
						ry: "22"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(200 100)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -78 -18 L -4 -12 L -4 26 L -78 20 Z",
						fill: "#6B3D18",
						stroke: "#4E2A0F",
						strokeWidth: "2.5",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 78 -18 L 4 -12 L 4 26 L 78 20 Z",
						fill: "#6B3D18",
						stroke: "#4E2A0F",
						strokeWidth: "2.5",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -70 -24 Q -36 -28 -2 -16 L -2 20 Q -36 10 -70 14 Z",
						fill: "#FFFDF5",
						stroke: "#CBD5E1",
						strokeWidth: "1.8",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 70 -24 Q 36 -28 2 -16 L 2 20 Q 36 10 70 14 Z",
						fill: "#FFFDF5",
						stroke: "#CBD5E1",
						strokeWidth: "1.8",
						strokeLinejoin: "round"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						stroke: "#94A3B8",
						strokeWidth: "2",
						strokeLinecap: "round",
						opacity: "0.7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "-58",
								y1: "-12",
								x2: "-16",
								y2: "-8"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "-58",
								y1: "-4",
								x2: "-16",
								y2: "0"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "-58",
								y1: "4",
								x2: "-22",
								y2: "7"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "16",
								y1: "-8",
								x2: "58",
								y2: "-12"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "16",
								y1: "0",
								x2: "58",
								y2: "-4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: "22",
								y1: "7",
								x2: "58",
								y2: "4"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 10 17 L 10 34 L 15 30 L 20 34 L 20 16 Z",
						fill: "#EF4444"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
				transform: "translate(110 60)",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ellipse", {
						cx: "0",
						cy: "0",
						rx: "8",
						ry: "5",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M -2 -2 Q -12 -14 -18 -5 Q -9 2 -2 -2 Z",
						fill: "#FFFFFF"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
						d: "M 7 0 L 12 -1 L 7 2 Z",
						fill: "#F59E0B"
					})
				]
			})
		]
	});
};
// src/components/OnboardingScreen.tsx
var LANGUAGE_CARD_STYLES = {
	en: {
		bg: "bg-[#BCE0FF]",
		border: "border-[#90C5FA]",
		text: "text-[#153E7E]"
	},
	it: {
		bg: "bg-[#DFCBFF]",
		border: "border-[#C19FF7]",
		text: "text-[#4D2584]"
	},
	sw: {
		bg: "bg-[#B5EAE4]",
		border: "border-[#84CFC6]",
		text: "text-[#0E5E59]"
	},
	fr: {
		bg: "bg-[#C3DFFF]",
		border: "border-[#96C1F9]",
		text: "text-[#174082]"
	},
	es: {
		bg: "bg-[#FFD4A8]",
		border: "border-[#F2B172]",
		text: "text-[#8F3E0B]"
	},
	pt: {
		bg: "bg-[#C1E8AC]",
		border: "border-[#92CF74]",
		text: "text-[#1E621D]"
	},
	de: {
		bg: "bg-[#FFEAA3]",
		border: "border-[#ECC960]",
		text: "text-[#59460A]"
	},
	ar: {
		bg: "bg-[#FBEAD2]",
		border: "border-[#E6C99E]",
		text: "text-[#166634]"
	},
	hi: {
		bg: "bg-[#FFD3B8]",
		border: "border-[#F0A87E]",
		text: "text-[#8A3B12]"
	},
	zh: {
		bg: "bg-[#FFA8B1]",
		border: "border-[#E97A86]",
		text: "text-[#7A1821]"
	}
};
var OnboardingScreen = ({ currentLang, onSelectLanguage, t }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: currentLang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex flex-col items-center justify-between px-4 py-2 sm:py-4 max-w-2xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full flex flex-col items-center shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-52 h-24 sm:w-64 sm:h-32 md:w-72 md:h-36 rounded-3xl overflow-hidden shadow-[0_10px_28px_-6px_rgba(30,58,138,0.2)] border-2 border-white/80 bg-[#CBE7FF]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorySceneSvg, {
							theme: "bible",
							label: "Open Bible with glowing golden cross resting on soft sky clouds"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-gradient-to-t from-[#DCEEFF]/20 via-transparent to-transparent" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-sm sm:text-base font-extrabold text-[#1D4ED8] mt-1.5 tracking-tight text-center",
						children: "Bible Quest: Daily Verse & Quiz"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#163A7A] mt-0.5 sm:mt-1 text-center tracking-tight text-balance",
						style: { textShadow: "0 2px 0 rgba(255,255,255,0.95), 0 0 12px rgba(255,255,255,0.85)" },
						children: t.chooseLanguageTitle
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "w-full flex-1 min-h-0 flex items-center justify-center py-1.5 sm:py-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full grid grid-cols-2 gap-2 sm:gap-3",
					children: LANGUAGES.map((lang) => {
						const style = LANGUAGE_CARD_STYLES[lang.code];
						const isSelected = currentLang === lang.code;
						const showNativeSub = lang.nativeName !== lang.name;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelectLanguage(lang.code),
							className: `relative min-h-[50px] sm:min-h-[58px] flex items-center justify-between gap-2.5 px-4 sm:px-5 py-2 rounded-[20px] border-2 shadow-[0_3px_0_rgba(20,39,78,0.08)] active:translate-y-[1px] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#163A7A] ${style.bg} ${style.border} ${isSelected ? "ring-2 ring-[#163A7A] ring-offset-2 ring-offset-[#DCEEFF]" : "hover:brightness-[0.98]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col items-start min-w-0 text-start",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `font-display text-sm sm:text-base font-bold leading-tight truncate max-w-full ${style.text}`,
									children: lang.name
								}), showNativeSub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[11px] sm:text-xs font-semibold leading-tight opacity-80 ${style.text}`,
									children: lang.nativeName
								})]
							}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-5 h-5 rounded-full bg-[#163A7A] text-white flex items-center justify-center shrink-0",
								"aria-label": "Selected",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3 h-3 stroke-[3]" })
							})]
						}, lang.code);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "shrink-0 text-xs sm:text-sm font-semibold text-[#1E3A8A] text-center pb-1",
				children: t.chooseLanguageFooter
			})
		]
	});
};
// src/utils/offlineVerseStore.ts
var DB_NAME = "bible_quest_offline_v1";
var DB_VERSION = 1;
var STORE_VIEWED = "viewedVerses";
var STORE_SAVED = "savedVerses";
var dbPromise = null;
function openOfflineDB() {
	if (typeof window === "undefined" || !("indexedDB" in window)) return Promise.resolve(null);
	if (dbPromise) return dbPromise;
	dbPromise = new Promise((resolve) => {
		try {
			const request = window.indexedDB.open(DB_NAME, DB_VERSION);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains(STORE_VIEWED)) db.createObjectStore(STORE_VIEWED, { keyPath: "id" }).createIndex("by_viewedAt", "viewedAt", { unique: false });
				if (!db.objectStoreNames.contains(STORE_SAVED)) db.createObjectStore(STORE_SAVED, { keyPath: "id" }).createIndex("by_savedAt", "savedAt", { unique: false });
			};
			request.onsuccess = () => {
				const db = request.result;
				db.onversionchange = () => {
					db.close();
					dbPromise = null;
				};
				resolve(db);
			};
			request.onerror = () => {
				dbPromise = null;
				resolve(null);
			};
		} catch {
			dbPromise = null;
			resolve(null);
		}
	});
	return dbPromise;
}
function txDone(tx) {
	return new Promise((resolve) => {
		tx.oncomplete = () => resolve();
		tx.onerror = () => resolve();
		tx.onabort = () => resolve();
	});
}
function requestResult(req) {
	return new Promise((resolve) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => resolve(void 0);
	});
}
async function recordViewedVerse(verse) {
	const db = await openOfflineDB();
	if (!db) return;
	try {
		const tx = db.transaction(STORE_VIEWED, "readwrite");
		const store = tx.objectStore(STORE_VIEWED);
		const record = {
			...verse,
			viewedAt: Date.now()
		};
		store.put(record);
		const allRows = await requestResult(store.getAll()) || [];
		if (allRows.length > 50) {
			const sortedOldestFirst = [...allRows].sort((a, b) => a.viewedAt - b.viewedAt);
			const excessCount = sortedOldestFirst.length - 50;
			for (let i = 0; i < excessCount; i++) store.delete(sortedOldestFirst[i].id);
		}
		await txDone(tx);
	} catch {}
}
async function getViewedVerses(limit = 50) {
	const db = await openOfflineDB();
	if (!db) return [];
	try {
		return (await requestResult(db.transaction(STORE_VIEWED, "readonly").objectStore(STORE_VIEWED).getAll()) || []).sort((a, b) => b.viewedAt - a.viewedAt).slice(0, limit).map(({ viewedAt: _viewedAt, ...verse }) => verse);
	} catch {
		return [];
	}
}
async function syncSavedVersesToIDB(verses) {
	const db = await openOfflineDB();
	if (!db) return;
	try {
		const tx = db.transaction(STORE_SAVED, "readwrite");
		const store = tx.objectStore(STORE_SAVED);
		store.clear();
		const baseTime = Date.now();
		verses.forEach((verse, idx) => {
			const record = {
				...verse,
				savedAt: baseTime - idx
			};
			store.put(record);
		});
		await txDone(tx);
	} catch {}
}
async function getSavedVersesFromIDB() {
	const db = await openOfflineDB();
	if (!db) return [];
	try {
		return (await requestResult(db.transaction(STORE_SAVED, "readonly").objectStore(STORE_SAVED).getAll()) || []).sort((a, b) => b.savedAt - a.savedAt).map(({ savedAt: _savedAt, ...verse }) => verse);
	} catch {
		return [];
	}
}
async function searchOfflineVerses(query, extraPool = []) {
	const needle = query.trim().toLowerCase();
	if (needle.length < 2) return [];
	const [viewed, saved] = await Promise.all([getViewedVerses(50), getSavedVersesFromIDB()]);
	const deduped = /* @__PURE__ */ new Map();
	for (const item of [
		...saved,
		...viewed,
		...extraPool
	]) if (!deduped.has(item.id)) deduped.set(item.id, item);
	return Array.from(deduped.values()).filter((item) => item.reference.toLowerCase().includes(needle) || item.text.toLowerCase().includes(needle) || item.bookName.toLowerCase().includes(needle) || item.themes.some((th) => th.toLowerCase().includes(needle)));
}
// src/components/HomeScreen.tsx
var AUTO_REFRESH_SECONDS = 20;
var HomeScreen = ({ currentVerse, isVerseLoading, isAutoPaused, timerResetToken, onToggleAutoPaused, onSelectVerse, onPrevVerse, onRandomVerse, onCopyVerse, onShareVerse, onToggleBookmark, onToggleSpeak, onGoToCategories, onGoToLeaderboard, onWatchFreeCoinsAd, isSpeaking, savedIds, lang, t }) => {
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [isSearching, setIsSearching] = (0, import_react.useState)(false);
	const [searchError, setSearchError] = (0, import_react.useState)(null);
	const [secondsLeft, setSecondsLeft] = (0, import_react.useState)(AUTO_REFRESH_SECONDS);
	const isSaved = savedIds.includes(currentVerse.id);
	(0, import_react.useEffect)(() => {
		setSecondsLeft(AUTO_REFRESH_SECONDS);
	}, [currentVerse.id, timerResetToken]);
	(0, import_react.useEffect)(() => {
		if (isAutoPaused || isVerseLoading || isSpeaking || searchQuery.trim().length >= 2) return;
		if (secondsLeft <= 0) {
			setSecondsLeft(AUTO_REFRESH_SECONDS);
			onRandomVerse(true);
			return;
		}
		const timer = window.setTimeout(() => {
			setSecondsLeft((prev) => Math.max(0, prev - 1));
		}, 1e3);
		return () => window.clearTimeout(timer);
	}, [
		secondsLeft,
		isAutoPaused,
		isVerseLoading,
		isSpeaking,
		searchQuery,
		onRandomVerse
	]);
	(0, import_react.useEffect)(() => {
		const trimmed = searchQuery.trim();
		if (trimmed.length < 2) {
			setSearchResults([]);
			setSearchError(null);
			setIsSearching(false);
			return;
		}
		const controller = new AbortController();
		const timer = window.setTimeout(async () => {
			setIsSearching(true);
			setSearchError(null);
			const lower = trimmed.toLowerCase();
			const starterPool = BIBLE_VERSES.map((v) => {
				const content = v.translations[lang];
				return {
					id: `${v.bookId || 43}:${v.chapter || 1}:${v.verseNumber || 1}`,
					bookId: v.bookId || 43,
					bookName: v.book,
					chapter: v.chapter || 1,
					verse: v.verseNumber || 1,
					reference: content.reference,
					highlightPrefix: content.highlightPrefix,
					text: content.text,
					version: content.version,
					themes: content.themes,
					lang
				};
			});
			const localMatches = starterPool.filter((item) => item.reference.toLowerCase().includes(lower) || item.text.toLowerCase().includes(lower) || item.bookName.toLowerCase().includes(lower));
			const offlineMatches = await searchOfflineVerses(trimmed, starterPool);
			if (controller.signal.aborted) return;
			const initialMatches = offlineMatches.length > 0 ? offlineMatches : localMatches;
			if (initialMatches.length > 0) setSearchResults(initialMatches);
			if (typeof navigator !== "undefined" && !navigator.onLine) {
				setIsSearching(false);
				if (initialMatches.length === 0) setSearchResults([]);
				return;
			}
			try {
				const resp = await fetch(`/api/bible/search?q=${encodeURIComponent(trimmed)}&lang=${encodeURIComponent(lang)}`, { signal: controller.signal });
				const data = await resp.json();
				if (!resp.ok) throw new Error(data.error || "Search failed.");
				const remote = Array.isArray(data.results) ? data.results : [];
				if (remote.length > 0) setSearchResults(remote);
				else if (initialMatches.length === 0) setSearchResults([]);
			} catch (err) {
				if (err.name === "AbortError") return;
				if (initialMatches.length === 0) setSearchError(err instanceof Error ? err.message : "Unable to search right now.");
			} finally {
				setIsSearching(false);
			}
		}, 360);
		return () => {
			window.clearTimeout(timer);
			controller.abort();
		};
	}, [searchQuery, lang]);
	const remainingText = currentVerse.text.startsWith(currentVerse.highlightPrefix) ? currentVerse.text.slice(currentVerse.highlightPrefix.length) : "";
	const speakPayload = `${currentVerse.reference}. ${currentVerse.text}`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex flex-col justify-between px-4 py-1.5 sm:py-2.5 max-w-4xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 flex items-center justify-between gap-2 pt-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
							viewBox: "0 0 48 48",
							className: "w-full h-full",
							"aria-hidden": "true",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
									cx: "22",
									cy: "18",
									r: "9",
									fill: "#FBBF24"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
									stroke: "#FBBF24",
									strokeWidth: "2.5",
									strokeLinecap: "round",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "22",
											y1: "3",
											x2: "22",
											y2: "6"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "33",
											y1: "7",
											x2: "31",
											y2: "9.5"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "11",
											y1: "7",
											x2: "13",
											y2: "9.5"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "37",
											y1: "18",
											x2: "34",
											y2: "18"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
											x1: "7",
											y1: "18",
											x2: "10",
											y2: "18"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M15 36 H34 C38 36 41 33 41 29.5 C41 26.3 38.6 23.7 35.5 23.3 C34.5 18.8 30.5 15.5 25.8 15.5 C20.6 15.5 16.3 19.5 15.9 24.6 C12.6 25.1 10 27.9 10 31.3 C10 34 12.2 36 15 36 Z",
									fill: "#FFFFFF",
									stroke: "#C9B382",
									strokeWidth: "2"
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-lg sm:text-2xl font-extrabold text-[#14274E] tracking-tight truncate",
						children: t.dailyBibleVerse
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onGoToLeaderboard,
						className: "min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] font-display text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-4 h-4 text-[#F59E0B]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Leaderboard" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onGoToCategories,
						className: "hidden sm:inline-flex min-h-[38px] items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400] font-display text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer whitespace-nowrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-4 h-4" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "10 Quiz Packs" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5" })
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 relative mt-1.5 z-20 flex flex-col sm:flex-row gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center bg-white/95 rounded-full px-3.5 py-1.5 sm:py-2 shadow-[0_4px_14px_rgba(20,39,78,0.08)] border border-white",
						children: [
							isSearching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-4 h-4 sm:w-5 sm:h-5 text-[#2F8FFF] animate-spin shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 sm:w-5 sm:h-5 text-[#64748B] shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value),
								placeholder: t.searchPlaceholder,
								"aria-label": t.searchPlaceholder,
								className: "w-full bg-transparent px-2.5 text-sm text-[#14274E] placeholder:text-[#7C8BA1] focus:outline-none"
							}),
							searchQuery && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setSearchQuery(""),
								"aria-label": t.clearSearch,
								className: "w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-3.5 h-3.5" })
							})
						]
					}), searchQuery.trim().length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute left-0 right-0 top-full mt-1.5 bg-white rounded-3xl shadow-[0_14px_34px_rgba(20,39,78,0.18)] border border-[#DCEBFF] max-h-60 overflow-y-auto p-2 space-y-1.5 z-30",
						children: searchResults.length > 0 ? searchResults.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => {
								onSelectVerse(item);
								setSearchQuery("");
								setSearchResults([]);
							},
							className: "w-full text-start rounded-2xl p-2.5 hover:bg-[#EDF5FF] transition-colors cursor-pointer border border-transparent hover:border-[#BFD9FA]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-sm font-extrabold text-[#14274E]",
									children: item.reference
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-semibold text-[#5C7299]",
									children: item.version
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-[#334155] line-clamp-2 mt-0.5 leading-snug",
								children: item.text
							})]
						}, `${item.id}-${item.reference}`)) : isSearching ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-4 text-center text-xs font-semibold text-[#5C7299]",
							children: "Searching all 66 books..."
						}) : searchError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-3 px-3 text-center text-xs font-semibold text-[#C81E3D]",
							children: searchError
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "py-4 text-center text-xs font-semibold text-[#5C7299]",
							children: t.noSearchMatches
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onWatchFreeCoinsAd,
					className: "min-h-[38px] px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-[0_3px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-3.5 h-3.5 fill-current shrink-0" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Watch Video for +100 Free Coins" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-4 h-4 shrink-0" })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-h-0 flex flex-col md:grid md:grid-cols-12 md:gap-4 justify-center my-1.5 sm:my-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "md:col-span-8 bg-white/95 rounded-[28px] p-4 sm:p-5 shadow-[0_12px_32px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col justify-between min-h-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-xl sm:text-3xl font-extrabold text-[#14274E] tracking-tight pt-1",
								children: currentVerse.reference
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onToggleBookmark(currentVerse),
									"aria-label": isSaved ? t.savedWord : t.bookmark,
									className: `w-11 h-11 rounded-2xl flex items-center justify-center transition-colors cursor-pointer ${isSaved ? "bg-[#E5F0FF] text-[#2F8FFF]" : "bg-[#F4F8FF] text-[#14274E] hover:bg-[#E5F0FF]"}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: `w-5 h-5 ${isSaved ? "fill-[#2F8FFF]" : ""}` })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onToggleSpeak(speakPayload),
									"aria-label": isSpeaking ? t.stop : t.listen,
									className: `w-13 h-13 sm:w-15 sm:h-15 rounded-full flex flex-col items-center justify-center shadow-sm border-2 transition-transform active:scale-95 cursor-pointer ${isSpeaking ? "bg-[#FF9F43] border-[#E67E22] text-white" : "bg-gradient-to-b from-[#FFE985] to-[#FFD23F] border-[#F5C12E] text-[#7A5400]"}`,
									children: [isSpeaking ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "w-4 h-4 sm:w-5 sm:h-5 fill-current" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-5 h-5 sm:w-6 sm:h-6" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-bold leading-none mt-0.5",
										children: isSpeaking ? t.stop : t.listen
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "my-auto py-2 overflow-y-auto",
							children: isVerseLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-center gap-2 py-6 text-[#5C7299] text-sm font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-5 h-5 animate-spin text-[#2F8FFF]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loading Scripture..." })]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[16px] sm:text-xl md:text-[21px] leading-snug sm:leading-relaxed text-[#1E293B] font-medium",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("mark", {
									className: "bg-[#FFF16A] text-[#14274E] font-bold rounded-md px-1.5 py-0.5 box-decoration-clone",
									children: currentVerse.highlightPrefix
								}), remainingText ? ` ${remainingText.trimStart()}` : ""]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "shrink-0 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 pt-2 border-t border-[#EFF5FF]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-xs font-semibold text-[#47608B]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentVerse.version }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentVerse.themes[0] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "·"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentVerse.themes[1] })
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 ms-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#5C7299] tabular-nums",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3.5 h-3.5 text-[#2F8FFF]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isAutoPaused ? t.autoNextPaused : t.autoNextIn.replace("{sec}", String(secondsLeft)) })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: onToggleAutoPaused,
									"aria-label": isAutoPaused ? t.resumeAutoNext : t.pauseAutoNext,
									className: `h-8 px-2.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1 border transition-colors cursor-pointer ${isAutoPaused ? "bg-[#FFE675] hover:bg-[#FFD94A] border-[#F5B935] text-[#7A5400]" : "bg-[#EDF5FF] hover:bg-[#DCEBFF] border-[#B0D4FA] text-[#14274E]"}`,
									children: isAutoPaused ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-3 h-3 fill-current" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.resumeAutoNext })] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "w-3 h-3 fill-current" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.pauseAutoNext })] })
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden md:flex md:col-span-4 bg-white/95 rounded-[28px] p-5 shadow-[0_12px_32px_-8px_rgba(30,58,138,0.12)] border border-white flex-col justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl overflow-hidden h-32 border border-[#DCEEFF] bg-[#CBE7FF] mb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorySceneSvg, {
								theme: "noah",
								label: "Illustrated Bible Quiz Packs"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl font-extrabold text-[#14274E]",
							children: "10 Bible Quiz Packs"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-[#5C7299] mt-1 leading-snug",
							children: "Earn +10 coins & +100 pts per answer, plus +20 coins & +200 pts on 6/6 Perfect Rounds."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onGoToCategories,
						className: "w-full py-3 rounded-2xl bg-[#2A8CFF] hover:bg-[#1A79EC] text-white font-display font-bold text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer",
						children: "Choose Quiz Pack"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 grid grid-cols-5 gap-1.5 sm:gap-2.5 pb-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onPrevVerse,
						className: "min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full",
							children: t.previous
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: isVerseLoading,
						onClick: () => onRandomVerse(false),
						className: "min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#2A8CFF] hover:bg-[#1B7CEE] disabled:opacity-70 border border-[#196FD6] text-white px-1 py-1.5 shadow-sm transition-colors cursor-pointer",
						children: [isVerseLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-5 h-5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dices, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full",
							children: t.random
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onCopyVerse(currentVerse),
						className: "min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full",
							children: t.copy
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onShareVerse(currentVerse),
						className: "min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl bg-[#D4E9FF] hover:bg-[#C3E0FF] border border-[#B0D4FA] text-[#14274E] px-1 py-1.5 transition-colors cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full",
							children: t.share
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onToggleBookmark(currentVerse),
						className: `min-h-[50px] sm:min-h-[58px] flex flex-col items-center justify-center rounded-2xl border px-1 py-1.5 transition-colors cursor-pointer ${isSaved ? "bg-[#FFE675] border-[#EBB935] text-[#14274E]" : "bg-[#D4E9FF] hover:bg-[#C3E0FF] border-[#B0D4FA] text-[#14274E]"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: `w-5 h-5 ${isSaved ? "fill-[#14274E]" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] sm:text-xs font-bold leading-tight mt-0.5 text-center truncate max-w-full",
							children: isSaved ? t.savedWord : t.bookmark
						})]
					})
				]
			})
		]
	});
};
// src/components/CategorySelectScreen.tsx
var CategorySelectScreen = ({ unlockedCategories, activeCategoryId, totalCoins, onSelectAndPlay, onUnlockCategory, onWatchFreeCoinsAd }) => {
	const unlockedCount = unlockedCategories.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2.5 sm:py-3 max-w-4xl mx-auto w-full overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight",
				children: "10 Bible Quiz Packs"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-semibold text-[#47608B]",
				children: [
					unlockedCount,
					" of ",
					QUIZ_CATEGORIES.length,
					" packs unlocked · +10 coins & +100 pts per right answer"
				]
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onWatchFreeCoinsAd,
				className: "min-h-[40px] px-3.5 py-2 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-[0_3px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap shrink-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-3.5 h-3.5 fill-current shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Watch Video for +100 Free Coins" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-4 h-4 shrink-0" })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 min-h-0 overflow-y-auto pr-0.5 pb-3 grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 content-start",
			children: QUIZ_CATEGORIES.map((category, idx) => {
				const isUnlocked = category.unlockCost === 0 || unlockedCategories.includes(category.id);
				const isActive = activeCategoryId === category.id;
				const canAfford = totalCoins >= category.unlockCost;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `bg-white/95 rounded-[24px] p-3.5 shadow-[0_8px_20px_-8px_rgba(30,58,138,0.14)] border-2 flex flex-col justify-between gap-2.5 transition-all ${isActive && isUnlocked ? "border-[#2F8FFF] ring-2 ring-[#BFDBFE]" : "border-white"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-16 h-16 rounded-2xl overflow-hidden border border-[#DCEBFF] bg-[#CBE7FF] shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorySceneSvg, {
								theme: category.storyTheme,
								label: category.title
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-1.5 text-[11px] font-bold text-[#5C7299]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										String(idx + 1).padStart(2, "0"),
										" · ",
										category.badgeLabel
									] }), category.hardMode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[#B91C1C] font-extrabold inline-flex items-center gap-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3 h-3" }), "Hard Mode"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base sm:text-lg font-extrabold text-[#14274E] leading-tight mt-0.5",
									children: category.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-[#47608B] leading-snug mt-0.5",
									children: category.subtitle
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between gap-2 pt-1 border-t border-[#EFF5FF]",
						children: isUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-bold text-[#1E7E1C] inline-flex items-center gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: category.unlockCost === 0 ? "Free Starter" : "Unlocked" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelectAndPlay(category),
							className: "min-h-[40px] px-4 py-1.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-[0_3px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-3.5 h-3.5 fill-current" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Play Pack" })]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-extrabold text-[#7A5400] inline-flex items-center gap-1 tabular-nums",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-3.5 h-3.5 text-[#B45309]" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-4 h-4" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [category.unlockCost, " Coins"] })
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onUnlockCategory(category),
							className: `min-h-[40px] px-4 py-1.5 rounded-full font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${canAfford ? "bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400] shadow-xs" : "bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#475569]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								"Unlock (",
								category.unlockCost,
								")"
							] })]
						})] })
					})]
				}, category.id);
			})
		})]
	});
};
// src/components/QuizScreen.tsx
var COINS_PER_CORRECT = 10;
var POINTS_PER_CORRECT = 100;
var PERFECT_BONUS_COINS = 20;
var PERFECT_BONUS_POINTS = 200;
var QUESTION_DURATION_SECONDS = 15;
var TIMER_FREEZE_PAUSE_SECONDS = 10;
var TIMER_FREEZE_ADD_SECONDS = 15;
var LIFELINE_5050_COST = 25;
var LIFELINE_FREEZE_COST = 30;
var LIFELINE_CLUE_COST = 40;
var SAVE_STREAK_COIN_COST = 50;
var OPTION_LETTERS = [
	"A",
	"B",
	"C",
	"D"
];
var OPTION_THEMES = [
	{
		bg: "bg-[#49C946] hover:bg-[#3FB83C]",
		border: "border-[#238820]",
		letterText: "text-[#238820]"
	},
	{
		bg: "bg-[#1696F2] hover:bg-[#0E85DC]",
		border: "border-[#0B66AC]",
		letterText: "text-[#0B66AC]"
	},
	{
		bg: "bg-[#9753E8] hover:bg-[#8642D6]",
		border: "border-[#6727B5]",
		letterText: "text-[#6727B5]"
	},
	{
		bg: "bg-[#FF8C1A] hover:bg-[#EB7C0E]",
		border: "border-[#C85C00]",
		letterText: "text-[#C85C00]"
	}
];
var QuizScreen = ({ questions, isLoading, errorMessage, categoryTitle, totalCoins, currentStreak, lang, t, isSpeaking, saveStreakGrantToken, onStartQuizSpeech, onStopSpeech, onPlaySound, onQuestionPlayed, onSpendCoins, onAnswerOutcome, onFinishRound, onRoundOverChange, onStartNewRound, onOpenCategories, onOpenSettings, onWatchDoubleRoundAd, onWatchSaveStreakAd, coinsDoubledForRound }) => {
	const [currentIdx, setCurrentIdx] = (0, import_react.useState)(0);
	const [selectedOption, setSelectedOption] = (0, import_react.useState)(null);
	const [timedOut, setTimedOut] = (0, import_react.useState)(false);
	const [secondsLeft, setSecondsLeft] = (0, import_react.useState)(QUESTION_DURATION_SECONDS);
	const [questionMaxSeconds, setQuestionMaxSeconds] = (0, import_react.useState)(QUESTION_DURATION_SECONDS);
	const [freezeSecondsLeft, setFreezeSecondsLeft] = (0, import_react.useState)(0);
	const [isTimerArmed, setIsTimerArmed] = (0, import_react.useState)(false);
	const [answersRecord, setAnswersRecord] = (0, import_react.useState)([]);
	const [isRoundOver, setIsRoundOver] = (0, import_react.useState)(false);
	const [eliminatedIndices, setEliminatedIndices] = (0, import_react.useState)([]);
	const [used5050, setUsed5050] = (0, import_react.useState)(false);
	const [usedFreeze, setUsedFreeze] = (0, import_react.useState)(false);
	const [showVerseClue, setShowVerseClue] = (0, import_react.useState)(false);
	const [streakRescueState, setStreakRescueState] = (0, import_react.useState)(null);
	const advanceTimerRef = (0, import_react.useRef)(null);
	const onStartQuizSpeechRef = (0, import_react.useRef)(onStartQuizSpeech);
	const onStopSpeechRef = (0, import_react.useRef)(onStopSpeech);
	const lastHandledGrantTokenRef = (0, import_react.useRef)(saveStreakGrantToken);
	(0, import_react.useEffect)(() => {
		onStartQuizSpeechRef.current = onStartQuizSpeech;
		onStopSpeechRef.current = onStopSpeech;
	}, [onStartQuizSpeech, onStopSpeech]);
	(0, import_react.useEffect)(() => {
		onRoundOverChange(isRoundOver);
	}, [isRoundOver, onRoundOverChange]);
	const total = questions.length;
	const activeQ = questions[currentIdx];
	const hasAnswered = selectedOption !== null || timedOut;
	const isResolvingMiss = streakRescueState !== null;
	const resetQuestionHelpers = () => {
		setEliminatedIndices([]);
		setUsed5050(false);
		setUsedFreeze(false);
		setShowVerseClue(false);
		setFreezeSecondsLeft(0);
		setStreakRescueState(null);
	};
	(0, import_react.useEffect)(() => {
		setCurrentIdx(0);
		setSelectedOption(null);
		setTimedOut(false);
		setSecondsLeft(QUESTION_DURATION_SECONDS);
		setQuestionMaxSeconds(QUESTION_DURATION_SECONDS);
		setIsTimerArmed(false);
		setAnswersRecord([]);
		setIsRoundOver(false);
		resetQuestionHelpers();
	}, [questions]);
	(0, import_react.useEffect)(() => {
		if (isLoading || errorMessage || !activeQ || isRoundOver || hasAnswered || isResolvingMiss) return;
		let cancelled = false;
		setIsTimerArmed(false);
		const spokenText = `${activeQ.question}. A: ${activeQ.options[0]}. B: ${activeQ.options[1]}. C: ${activeQ.options[2]}. D: ${activeQ.options[3]}.`;
		onStartQuizSpeechRef.current(spokenText, () => {
			if (!cancelled) setIsTimerArmed(true);
		});
		return () => {
			cancelled = true;
		};
	}, [
		activeQ?.id,
		isLoading,
		errorMessage,
		isRoundOver
	]);
	(0, import_react.useEffect)(() => {
		if (isLoading || errorMessage || !activeQ || isRoundOver || hasAnswered || isResolvingMiss || !isTimerArmed) return;
		const interval = window.setInterval(() => {
			if (freezeSecondsLeft > 0) {
				setFreezeSecondsLeft((f) => Math.max(0, f - 1));
				return;
			}
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					window.clearInterval(interval);
					onPlaySound("wrong");
					setStreakRescueState({
						reason: "timeout",
						wrongOptionIdx: null
					});
					return 0;
				}
				return prev - 1;
			});
		}, 1e3);
		return () => window.clearInterval(interval);
	}, [
		currentIdx,
		isLoading,
		errorMessage,
		activeQ,
		isRoundOver,
		hasAnswered,
		isResolvingMiss,
		isTimerArmed,
		freezeSecondsLeft,
		onPlaySound
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
			onStopSpeechRef.current();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (saveStreakGrantToken > lastHandledGrantTokenRef.current && streakRescueState) {
			lastHandledGrantTokenRef.current = saveStreakGrantToken;
			applyStreakRescueContinue();
		} else lastHandledGrantTokenRef.current = saveStreakGrantToken;
	}, [saveStreakGrantToken]);
	const applyStreakRescueContinue = () => {
		if (!streakRescueState) return;
		const { reason, wrongOptionIdx } = streakRescueState;
		if (wrongOptionIdx !== null) setEliminatedIndices((prev) => prev.includes(wrongOptionIdx) ? prev : [...prev, wrongOptionIdx]);
		if (reason === "timeout" || secondsLeft <= 3) setSecondsLeft((prev) => {
			const next = prev + 15;
			setQuestionMaxSeconds((maxPrev) => Math.max(maxPrev, next));
			return next;
		});
		setStreakRescueState(null);
		setIsTimerArmed(true);
	};
	const handleSpendSaveStreakCoins = () => {
		if (!streakRescueState) return;
		if (!onSpendCoins(SAVE_STREAK_COIN_COST, "Streak saved! Continue round (-50 coins)")) {
			onPlaySound("wrong");
			return;
		}
		onPlaySound("tap");
		applyStreakRescueContinue();
	};
	const handleDeclineStreakRescue = () => {
		if (!streakRescueState || !activeQ) return;
		const { reason, wrongOptionIdx } = streakRescueState;
		setStreakRescueState(null);
		onQuestionPlayed(activeQ.question);
		onAnswerOutcome(false);
		if (reason === "timeout") setTimedOut(true);
		else if (wrongOptionIdx !== null) setSelectedOption(wrongOptionIdx);
		const updatedRecord = [...answersRecord, false];
		setAnswersRecord(updatedRecord);
		advanceTimerRef.current = window.setTimeout(() => {
			proceedToNext(updatedRecord);
		}, 1500);
	};
	const proceedToNext = (updatedRecord) => {
		if (advanceTimerRef.current) {
			window.clearTimeout(advanceTimerRef.current);
			advanceTimerRef.current = null;
		}
		onStopSpeech();
		if (currentIdx + 1 >= total) {
			const score = updatedRecord.filter(Boolean).length;
			const isPerfect = total === 6 && score === 6;
			const coinsEarned = score * COINS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_COINS : 0);
			const pointsEarned = score * POINTS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_POINTS : 0);
			onPlaySound("complete");
			onFinishRound(score, coinsEarned, pointsEarned, isPerfect);
			setIsRoundOver(true);
		} else {
			setIsTimerArmed(false);
			setCurrentIdx((prev) => prev + 1);
			setSelectedOption(null);
			setTimedOut(false);
			setSecondsLeft(QUESTION_DURATION_SECONDS);
			setQuestionMaxSeconds(QUESTION_DURATION_SECONDS);
			resetQuestionHelpers();
		}
	};
	const handleLifeline5050 = () => {
		if (!activeQ || used5050 || hasAnswered || isResolvingMiss) return;
		if (!onSpendCoins(LIFELINE_5050_COST, "50/50 Hint used! 2 wrong answers removed (-25 coins)")) {
			onPlaySound("wrong");
			return;
		}
		const toRemove = [...[
			0,
			1,
			2,
			3
		].filter((i) => i !== activeQ.correctIndex && !eliminatedIndices.includes(i))].sort(() => Math.random() - .5).slice(0, 2);
		setEliminatedIndices((prev) => [...prev, ...toRemove]);
		setUsed5050(true);
		onPlaySound("tap");
	};
	const handleLifelineFreeze = () => {
		if (!activeQ || usedFreeze || hasAnswered || isResolvingMiss) return;
		if (!onSpendCoins(LIFELINE_FREEZE_COST, "Time Freeze activated! Paused +15s (-30 coins)")) {
			onPlaySound("wrong");
			return;
		}
		setUsedFreeze(true);
		setFreezeSecondsLeft(TIMER_FREEZE_PAUSE_SECONDS);
		setSecondsLeft((prev) => {
			const next = prev + TIMER_FREEZE_ADD_SECONDS;
			setQuestionMaxSeconds((maxPrev) => Math.max(maxPrev, next));
			return next;
		});
		onPlaySound("tap");
	};
	const handleLifelineVerseClue = () => {
		if (!activeQ || showVerseClue || hasAnswered || isResolvingMiss) return;
		if (!onSpendCoins(LIFELINE_CLUE_COST, `Clue unlocked: ${activeQ.reference} (-40 coins)`)) {
			onPlaySound("wrong");
			return;
		}
		setShowVerseClue(true);
		onPlaySound("tap");
	};
	const handleToggleListen = () => {
		if (!activeQ) return;
		if (isSpeaking) {
			onStopSpeech();
			setIsTimerArmed(true);
		} else onStartQuizSpeech(`${activeQ.question}. A: ${activeQ.options[0]}. B: ${activeQ.options[1]}. C: ${activeQ.options[2]}. D: ${activeQ.options[3]}.`, () => {
			setIsTimerArmed(true);
		});
	};
	const handleSelectOption = (optIndex) => {
		if (hasAnswered || isResolvingMiss || !activeQ || eliminatedIndices.includes(optIndex)) return;
		onStopSpeech();
		setIsTimerArmed(true);
		if (!(optIndex === activeQ.correctIndex)) {
			onPlaySound("wrong");
			setStreakRescueState({
				reason: "wrong",
				wrongOptionIdx: optIndex
			});
			return;
		}
		setSelectedOption(optIndex);
		onQuestionPlayed(activeQ.question);
		onAnswerOutcome(true);
		onPlaySound("correct");
		const updatedRecord = [...answersRecord, true];
		setAnswersRecord(updatedRecord);
		advanceTimerRef.current = window.setTimeout(() => {
			proceedToNext(updatedRecord);
		}, 1500);
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-4 max-w-lg mx-auto w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full bg-white/95 rounded-[28px] p-6 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.16)] border-2 border-white flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-16 h-16 rounded-full bg-[#FFE675] border-2 border-[#F5B935] flex items-center justify-center text-[#164A9E] mb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "w-8 h-8 animate-spin" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E]",
					children: [
						"Loading ",
						categoryTitle,
						"..."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-[#5C7299] mt-1",
					children: "Preparing 6 fresh multiple-choice questions just for this pack."
				})
			]
		})
	});
	if (errorMessage && total === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-4 max-w-lg mx-auto w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full bg-white/95 rounded-[28px] p-6 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.16)] border-2 border-white flex flex-col items-center text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-14 h-14 rounded-full bg-[#FFE8EC] text-[#C81E3D] flex items-center justify-center mb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "w-7 h-7" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl font-extrabold text-[#14274E]",
					children: "Unable to Load Quiz"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs sm:text-sm text-[#5C7299] mt-1.5 break-words w-full",
					children: errorMessage
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full flex flex-col sm:flex-row gap-2.5 mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onStartNewRound,
						className: "flex-1 min-h-[44px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Retry" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onOpenCategories,
						className: "flex-1 min-h-[44px] rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border border-[#B0D4FA] text-[#14274E] font-display font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "All Packs" })]
					})]
				})
			]
		})
	});
	if (!activeQ) return null;
	if (isRoundOver) {
		const finalScore = answersRecord.filter(Boolean).length;
		const isPerfect = total === 6 && finalScore === 6;
		const baseCoins = finalScore * COINS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_COINS : 0);
		const basePoints = finalScore * POINTS_PER_CORRECT + (isPerfect ? PERFECT_BONUS_POINTS : 0);
		const displayedCoins = coinsDoubledForRound ? baseCoins * 2 : baseCoins;
		const displayedPoints = coinsDoubledForRound ? basePoints * 2 : basePoints;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			dir: lang === "ar" ? "rtl" : "ltr",
			className: "relative z-10 flex-1 min-h-0 flex items-center justify-center px-4 py-3 max-w-xl mx-auto w-full overflow-hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full bg-white/95 rounded-[30px] p-5 sm:p-6 shadow-[0_14px_34px_-8px_rgba(30,58,138,0.18)] border-2 border-white flex flex-col items-center text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-16 h-16 rounded-full bg-[#FFE675] border-4 border-[#F5B935] flex items-center justify-center text-[#B45309] shadow-sm",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-8 h-8" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl sm:text-3xl font-extrabold text-[#14274E] mt-2.5",
						children: isPerfect ? "Perfect Round! 6/6" : t.quizCompleteTitle
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs sm:text-sm font-semibold text-[#5C7299] mt-0.5",
						children: [categoryTitle, isPerfect ? " · +20 Coins & +200 Pts Perfect Bonus included!" : ""]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full grid grid-cols-3 gap-2.5 my-3.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-[#E5F0FF] border border-[#B2CEFB] p-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold text-[#164A9E]",
									children: t.scoreLabel
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums mt-0.5",
									children: [
										finalScore,
										" / ",
										total
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-[#FFF6CC] border border-[#F3D877] p-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold text-[#7A5400]",
									children: "Coins Earned"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums mt-0.5 flex items-center justify-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["+", displayedCoins] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-5 h-5" })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] p-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] font-semibold text-[#047857]",
									children: "Rank Points"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-display text-xl sm:text-2xl font-extrabold text-[#065F46] tabular-nums mt-0.5",
									children: ["+", displayedPoints]
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-center gap-2 mb-3.5",
						children: Array.from({ length: total }).map((_, idx) => {
							const answered = idx < answersRecord.length;
							const earned = answersRecord[idx] === true;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, {
								className: "w-7 h-7",
								dimmed: !answered,
								missed: answered && !earned
							}, idx);
						})
					}),
					baseCoins > 0 && !coinsDoubledForRound && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => onWatchDoubleRoundAd(baseCoins, basePoints),
						className: "w-full min-h-[48px] mb-3 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_4px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 fill-current shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: "2x Round Coins & Points (Watch Video)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-5 h-5 shrink-0" })
						]
					}),
					coinsDoubledForRound && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 text-xs sm:text-sm font-extrabold text-[#1E7E1C] flex items-center justify-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 stroke-[3]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2x Round Coins & Points Applied!" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "w-full flex flex-col sm:flex-row gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onStartNewRound,
							className: "flex-1 min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm sm:text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.playAgain })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onOpenCategories,
							className: "flex-1 min-h-[46px] flex items-center justify-center gap-2 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] border-2 border-[#B0D4FA] text-[#14274E] font-display font-bold text-sm sm:text-base transition-colors cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Quiz Packs" })]
						})]
					})
				]
			})
		});
	}
	const progressText = t.questionProgressPill.replace("{current}", String(currentIdx + 1)).replace("{total}", String(total));
	const circleRadius = 21;
	const circleCircumference = 2 * Math.PI * circleRadius;
	const strokeOffset = circleCircumference - Math.min(1, Math.max(0, secondsLeft / Math.max(1, questionMaxSeconds))) * circleCircumference;
	const isTimeLow = !hasAnswered && freezeSecondsLeft === 0 && secondsLeft > 0 && secondsLeft <= 6;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex flex-col justify-between px-3 sm:px-5 py-1.5 sm:py-2 max-w-3xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 flex items-center justify-between gap-1.5 bg-[#FFE675] border-2 border-[#F5B935] rounded-2xl px-2.5 py-1 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 min-w-0 flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xs sm:text-base font-extrabold text-[#164A9E] truncate",
							children: progressText
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden sm:inline text-xs font-bold text-[#3A5A8C] truncate",
							children: ["· ", categoryTitle]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-0.5 text-[11px] font-extrabold text-[#C2410C] tabular-nums shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "w-3.5 h-3.5 fill-[#FB923C]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentStreak })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onOpenSettings,
							"aria-label": t.quizSettingsBtn,
							className: "w-8 h-8 rounded-xl bg-white/75 hover:bg-white text-[#164A9E] flex items-center justify-center transition-colors cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: handleToggleListen,
							"aria-label": isSpeaking ? t.stop : t.listen,
							className: `w-9 h-9 rounded-xl flex items-center justify-center text-white border-2 transition-transform active:scale-95 cursor-pointer ${isSpeaking ? "bg-[#FF8C1A] border-[#C85C00] animate-pulse" : "bg-[#4DA3FF] hover:bg-[#2F8FFF] border-[#2574D4]"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-4 h-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `relative w-10 h-10 flex items-center justify-center rounded-full border-2 shadow-xs transition-colors ${freezeSecondsLeft > 0 ? "bg-[#0EA5E9] border-[#0369A1]" : isTimeLow ? "bg-[#EF4444] border-[#991B1B]" : "bg-[#FF8C1A] border-[#C85C00]"}`,
							"aria-label": `${secondsLeft} seconds remaining`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									className: "absolute inset-0 w-full h-full -rotate-90",
									viewBox: "0 0 48 48",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "24",
										cy: "24",
										r: circleRadius,
										fill: "none",
										stroke: "rgba(255,255,255,0.3)",
										strokeWidth: "3"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "24",
										cy: "24",
										r: circleRadius,
										fill: "none",
										stroke: "#FFFFFF",
										strokeWidth: "3",
										strokeDasharray: circleCircumference,
										strokeDashoffset: strokeOffset,
										strokeLinecap: "round",
										className: "transition-all duration-500"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "relative font-display text-xs sm:text-sm font-extrabold text-white tabular-nums",
									children: secondsLeft
								}),
								freezeSecondsLeft > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "absolute -top-1 -right-1 w-3.5 h-3.5 text-white bg-[#0369A1] rounded-full p-0.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: `absolute -top-1 -right-1 w-3.5 h-3.5 text-white rounded-full p-0.5 ${isTimeLow ? "bg-[#991B1B]" : "bg-[#E66A00]"}` })
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 flex flex-col items-center my-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "w-full max-w-md h-20 sm:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-[#CBE7FF]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorySceneSvg, {
						theme: activeQ.storyTheme,
						label: activeQ.illustrationAlt
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "wood-signboard relative -mt-3 w-full max-w-lg rounded-2xl px-4 py-2 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-sm sm:text-lg font-extrabold text-[#FFF8E7] leading-snug text-balance",
						children: activeQ.question
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 min-h-[26px] flex items-center justify-center",
				children: hasAnswered ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 bg-white/95 border border-[#BFD9FA] rounded-full px-3 py-0.5 shadow-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `text-xs font-extrabold ${selectedOption === activeQ.correctIndex ? "text-[#1E7E1C]" : "text-[#C85C00]"}`,
							children: timedOut ? t.timesUpFeedback : selectedOption === activeQ.correctIndex ? `${t.correctFeedback} (+10 coins · +100 pts)` : t.wrongFeedback
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-slate-400",
							children: "·"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold text-[#14274E]",
							children: activeQ.reference
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => proceedToNext(answersRecord),
							className: "inline-flex items-center gap-0.5 text-[11px] font-bold text-[#2F8FFF] hover:underline cursor-pointer ms-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.nextQuestion }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3 h-3" })]
						})
					]
				}) : showVerseClue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1.5 bg-[#FFFBEB] border border-[#F59E0B] rounded-full px-3 py-0.5 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-3.5 h-3.5 text-[#B45309]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-extrabold text-[#78350F]",
						children: ["Hint: Read ", activeQ.reference]
					})]
				}) : freezeSecondsLeft > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1.5 bg-[#E0F2FE] border border-[#38BDF8] rounded-full px-3 py-0.5 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "w-3.5 h-3.5 text-[#0369A1]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs font-extrabold text-[#0369A1] tabular-nums",
						children: [
							"Timer Frozen (",
							freezeSecondsLeft,
							"s) · +15s added"
						]
					})]
				}) : !isTimerArmed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "inline-flex items-center gap-1.5 bg-white/85 border border-[#BFD9FA] rounded-full px-3 py-0.5 shadow-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-3.5 h-3.5 text-[#2F8FFF] animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[11px] font-bold text-[#164A9E]",
						children: t.readingQuestionHint
					})]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] opacity-0 select-none",
					children: "·"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-h-0 flex flex-col justify-center gap-1.5 max-w-lg mx-auto w-full",
				children: activeQ.options.map((optionText, idx) => {
					const theme = OPTION_THEMES[idx];
					const isEliminated = eliminatedIndices.includes(idx);
					const isChosen = selectedOption === idx;
					const isCorrect = activeQ.correctIndex === idx;
					let stateClasses = `${theme.bg} ${theme.border}`;
					if (isEliminated && !hasAnswered) stateClasses = "bg-slate-200 border-slate-300 opacity-35 cursor-not-allowed";
					else if (hasAnswered) {
						if (isCorrect) stateClasses = "bg-[#49C946] border-[#1A6D18] ring-2 ring-white scale-[1.01]";
						else if (isChosen) stateClasses = "bg-[#EF4444] border-[#991B1B] ring-2 ring-white";
						else stateClasses = `${theme.bg} ${theme.border} opacity-55`;
					}
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: hasAnswered || isEliminated || isResolvingMiss,
						onClick: () => handleSelectOption(idx),
						className: `w-full min-h-[42px] sm:min-h-[46px] flex items-center justify-between gap-3 rounded-full border-2 px-2.5 sm:px-3.5 py-1 shadow-[0_3px_0_rgba(20,39,78,0.18)] transition-all duration-150 cursor-pointer disabled:cursor-default ${stateClasses}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2.5 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `w-7 h-7 rounded-full bg-white flex items-center justify-center font-display text-sm font-extrabold shrink-0 ${isEliminated && !hasAnswered ? "text-slate-400" : theme.letterText}`,
									children: OPTION_LETTERS[idx]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `font-display text-sm sm:text-base font-bold text-start truncate ${isEliminated && !hasAnswered ? "text-slate-500 line-through" : "text-white"}`,
									children: optionText
								})]
							}),
							hasAnswered && isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 h-6 rounded-full bg-white text-[#1E7E1C] flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 stroke-[3]" })
							}),
							hasAnswered && isChosen && !isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-6 h-6 rounded-full bg-white text-[#DC2626] flex items-center justify-center shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4 stroke-[3]" })
							})
						]
					}, idx);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 grid grid-cols-3 gap-1.5 sm:gap-2 max-w-lg mx-auto w-full pt-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleLifeline5050,
						disabled: used5050 || hasAnswered || isResolvingMiss,
						className: `min-h-[42px] rounded-2xl border-2 px-2 py-1 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-45 disabled:cursor-default ${totalCoins >= LIFELINE_5050_COST && !used5050 ? "bg-white hover:bg-[#EFF6FF] border-[#93C5FD] text-[#14274E]" : "bg-white/70 border-slate-200 text-slate-500"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 font-display text-[11px] sm:text-xs font-extrabold whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Split, { className: "w-3.5 h-3.5 text-[#2F8FFF]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "50/50 Hint" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-0.5 text-[10px] font-bold text-[#7A5400] tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: used5050 ? "Used" : `${LIFELINE_5050_COST} Coins` })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleLifelineFreeze,
						disabled: usedFreeze || hasAnswered || isResolvingMiss,
						className: `min-h-[42px] rounded-2xl border-2 px-2 py-1 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-45 disabled:cursor-default ${totalCoins >= LIFELINE_FREEZE_COST && !usedFreeze ? "bg-white hover:bg-[#E0F2FE] border-[#7DD3FC] text-[#14274E]" : "bg-white/70 border-slate-200 text-slate-500"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 font-display text-[11px] sm:text-xs font-extrabold whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "w-3.5 h-3.5 text-[#0284C7]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "+15s Freeze" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-0.5 text-[10px] font-bold text-[#7A5400] tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: usedFreeze ? "Used" : `${LIFELINE_FREEZE_COST} Coins` })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleLifelineVerseClue,
						disabled: showVerseClue || hasAnswered || isResolvingMiss,
						className: `min-h-[42px] rounded-2xl border-2 px-2 py-1 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-45 disabled:cursor-default ${totalCoins >= LIFELINE_CLUE_COST && !showVerseClue ? "bg-white hover:bg-[#FFFBEB] border-[#FCD34D] text-[#14274E]" : "bg-white/70 border-slate-200 text-slate-500"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 font-display text-[11px] sm:text-xs font-extrabold whitespace-nowrap",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-3.5 h-3.5 text-[#D97706]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verse Clue" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-0.5 text-[10px] font-bold text-[#7A5400] tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-3 h-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: showVerseClue ? "Shown" : `${LIFELINE_CLUE_COST} Coins` })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 flex items-center justify-center gap-2 pt-1 pb-0.5",
				children: Array.from({ length: total }).map((_, idx) => {
					const answered = idx < answersRecord.length;
					const correct = answersRecord[idx] === true;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `transition-transform ${answered && correct ? "scale-110" : idx === currentIdx && !hasAnswered ? "scale-105 ring-2 ring-[#F59E0B] rounded-full" : ""}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, {
							className: "w-5 h-5 sm:w-6 sm:h-6",
							dimmed: !answered,
							missed: answered && !correct
						})
					}, idx);
				})
			}),
			streakRescueState && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "save-streak-modal-title",
				className: "fixed inset-0 z-50 bg-[#14274E]/65 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white rounded-[28px] max-w-sm w-full p-5 shadow-[0_24px_60px_rgba(15,30,61,0.4)] border-2 border-white text-center space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-14 h-14 mx-auto rounded-full bg-[#FFE4D6] border-2 border-[#FB923C] text-[#EA580C] flex items-center justify-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "w-7 h-7 fill-[#FB923C]" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-extrabold text-[#EA580C] inline-flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: streakRescueState.reason === "timeout" ? "Time's Up!" : "Oops, Not Quite!" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "save-streak-modal-title",
								className: "font-display text-xl font-extrabold text-[#14274E] mt-0.5",
								children: "Save Your Streak!"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs sm:text-sm text-[#47608B] mt-1",
								children: [
									"Spend 50 Coins OR watch 1 short video to continue free and keep your",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-[#14274E]",
										children: currentStreak
									}),
									" streak alive!"
								]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2 pt-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleSpendSaveStreakCoins,
									className: `w-full min-h-[46px] px-4 py-2 rounded-full font-display font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${totalCoins >= SAVE_STREAK_COIN_COST ? "bg-[#FFE675] hover:bg-[#FFD94A] border-2 border-[#F5B935] text-[#7A5400]" : "bg-slate-100 border border-slate-300 text-slate-500"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Spend ",
										SAVE_STREAK_COIN_COST,
										" Coins to Continue"
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: onWatchSaveStreakAd,
									className: "w-full min-h-[46px] px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8C1A] to-[#F59E0B] hover:from-[#EB7C0E] hover:to-[#D97706] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_3px_0_#B45309] active:translate-y-[1px] transition-all cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-4 h-4 fill-current shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Watch 1 Short Video to Continue Free" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: handleDeclineStreakRescue,
									className: "w-full py-2 text-xs font-bold text-[#5C7299] hover:text-[#14274E] cursor-pointer",
									children: "No thanks, continue & reveal answer"
								})
							]
						})
					]
				})
			})
		]
	});
};
// src/data/treasuryCards.ts
var TREASURY_CARDS = [
	{
		id: "psalm-23-1",
		reference: "Psalm 23:1",
		title: "The Good Shepherd",
		verseText: "The LORD is my shepherd; I shall not want.",
		reflection: "Rest in knowing God guides and provides for every step ahead.",
		unlockCost: 100,
		storyTheme: "shepherd",
		accentGradient: "from-[#FFE885] via-[#FFF6CC] to-[#DFF0FF]"
	},
	{
		id: "proverbs-3-5",
		reference: "Proverbs 3:5",
		title: "Trust With All Your Heart",
		verseText: "Trust in the LORD with all your heart, and do not lean on your own understanding.",
		reflection: "True wisdom begins when we place our confidence in God’s plan.",
		unlockCost: 100,
		storyTheme: "bible",
		accentGradient: "from-[#E2F1FF] via-[#FFF7D6] to-[#DCFCE7]"
	},
	{
		id: "philippians-4-13",
		reference: "Philippians 4:13",
		title: "Strength Through Christ",
		verseText: "I can do all things through him who strengthens me.",
		reflection: "Even the tallest mountain is climbable with God’s strength inside you.",
		unlockCost: 100,
		storyTheme: "david",
		accentGradient: "from-[#FDE68A] via-[#FFFBEB] to-[#DBEAFE]"
	},
	{
		id: "isaiah-40-31",
		reference: "Isaiah 40:31",
		title: "Soaring Like Eagles",
		verseText: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles.",
		reflection: "Patience in prayer brings fresh wings for tomorrow’s journey.",
		unlockCost: 100,
		storyTheme: "noah",
		accentGradient: "from-[#BAE6FD] via-[#EFF6FF] to-[#FEF3C7]"
	},
	{
		id: "joshua-1-9",
		reference: "Joshua 1:9",
		title: "Strong & Courageous",
		verseText: "Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go.",
		reflection: "Courage grows when you remember you never walk alone.",
		unlockCost: 100,
		storyTheme: "david",
		accentGradient: "from-[#FED7AA] via-[#FFF7ED] to-[#DBEAFE]"
	},
	{
		id: "jeremiah-29-11",
		reference: "Jeremiah 29:11",
		title: "Plans of Hope",
		verseText: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
		reflection: "God writes your story with hope, purpose, and peace.",
		unlockCost: 100,
		storyTheme: "noah",
		accentGradient: "from-[#DDD6FE] via-[#F5F3FF] to-[#FEF9C3]"
	},
	{
		id: "romans-8-28",
		reference: "Romans 8:28",
		title: "All Things For Good",
		verseText: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
		reflection: "Every season has meaning in the hands of a faithful Creator.",
		unlockCost: 100,
		storyTheme: "whale",
		accentGradient: "from-[#A5F3FC] via-[#ECFEFF] to-[#FEF3C7]"
	},
	{
		id: "matthew-11-28",
		reference: "Matthew 11:28",
		title: "Peace & Rest",
		verseText: "Come to me, all who labor and are heavy laden, and I will give you rest.",
		reflection: "Lay down your worries and receive gentle peace today.",
		unlockCost: 100,
		storyTheme: "shepherd",
		accentGradient: "from-[#BBF7D0] via-[#F0FDF4] to-[#E0F2FE]"
	},
	{
		id: "john-3-16",
		reference: "John 3:16",
		title: "Everlasting Love",
		verseText: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
		reflection: "The heart of Scripture shines brightest in God’s unconditional love.",
		unlockCost: 100,
		storyTheme: "bible",
		accentGradient: "from-[#FDE047]/50 via-[#FFFDF0] to-[#DBEAFE]"
	}
];
// src/utils/scriptureCardCanvas.ts
function wrapText(ctx, text, maxWidth) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines = [];
	let current = "";
	for (const word of words) {
		const test = current ? `${current} ${word}` : word;
		if (ctx.measureText(test).width <= maxWidth) current = test;
		else {
			if (current) lines.push(current);
			current = word;
		}
	}
	if (current) lines.push(current);
	return lines;
}
function generateTreasuryCardImage(card) {
	const shareText = `"${card.verseText}" — ${card.reference} (${card.title}) | Bible Quest Scripture Treasury`;
	if (typeof document === "undefined") return {
		dataUrl: "",
		file: null,
		shareText
	};
	const width = 960;
	const height = 640;
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return {
		dataUrl: "",
		file: null,
		shareText
	};
	const bgGrad = ctx.createLinearGradient(0, 0, width, height);
	bgGrad.addColorStop(0, "#88C8FF");
	bgGrad.addColorStop(.55, "#E4F3FF");
	bgGrad.addColorStop(1, "#FFF6CC");
	ctx.fillStyle = bgGrad;
	ctx.fillRect(0, 0, width, height);
	const sunGlow = ctx.createRadialGradient(820, 110, 20, 820, 110, 260);
	sunGlow.addColorStop(0, "rgba(255, 224, 102, 0.72)");
	sunGlow.addColorStop(1, "rgba(255, 224, 102, 0)");
	ctx.fillStyle = sunGlow;
	ctx.fillRect(0, 0, width, height);
	const pad = 44;
	ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
	ctx.beginPath();
	ctx.roundRect(pad, pad, 872, 552, 34);
	ctx.fill();
	ctx.strokeStyle = "#F5B935";
	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.roundRect(58, 58, 844, 524, 24);
	ctx.stroke();
	ctx.textAlign = "center";
	ctx.fillStyle = "#B45309";
	ctx.font = "700 20px \"Plus Jakarta Sans\", sans-serif";
	ctx.fillText("BIBLE QUEST · SCRIPTURE TREASURY", width / 2, 118);
	ctx.fillStyle = "#14274E";
	ctx.font = "800 38px \"Outfit\", \"Plus Jakarta Sans\", sans-serif";
	ctx.fillText(card.reference, width / 2, 174);
	ctx.fillStyle = "#2F8FFF";
	ctx.font = "700 22px \"Plus Jakarta Sans\", sans-serif";
	ctx.fillText(card.title, width / 2, 212);
	ctx.fillStyle = "#1E293B";
	ctx.font = "600 30px \"Plus Jakarta Sans\", sans-serif";
	const lines = wrapText(ctx, `“${card.verseText}”`, 770);
	let y = 286;
	for (const line of lines.slice(0, 5)) {
		ctx.fillText(line, width / 2, y);
		y += 44;
	}
	ctx.fillStyle = "#5C7299";
	ctx.font = "500 20px \"Plus Jakarta Sans\", sans-serif";
	const refLines = wrapText(ctx, card.reflection, 740);
	let ry = Math.max(y + 24, 495);
	for (const rLine of refLines.slice(0, 2)) {
		ctx.fillText(rLine, width / 2, ry);
		ry += 28;
	}
	const dataUrl = canvas.toDataURL("image/png");
	let file = null;
	try {
		const [, base64] = dataUrl.split(",");
		const bin = atob(base64);
		const bytes = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
		file = new File([bytes], `bible-quest-${card.id}.png`, { type: "image/png" });
	} catch {
		file = null;
	}
	return {
		dataUrl,
		file,
		shareText
	};
}
// src/components/ScriptureTreasuryScreen.tsx
var ScriptureTreasuryScreen = ({ unlockedCardIds, totalCoins, savedVerses, lang, t, onUnlockCard, onListen, onCopyVerse, onRemoveSaved, onSelectVerse, onBrowseVerses, onShowToast }) => {
	const [subTab, setSubTab] = (0, import_react.useState)("cards");
	const [viewingCard, setViewingCard] = (0, import_react.useState)(null);
	const handleOpenCard = (card) => {
		const image = generateTreasuryCardImage(card);
		setViewingCard({
			card,
			image
		});
	};
	const handleShareCard = async (card, image) => {
		if (typeof navigator !== "undefined" && typeof navigator.share === "function") try {
			if (image.file && typeof navigator.canShare === "function" && navigator.canShare({ files: [image.file] })) {
				await navigator.share({
					title: `${card.reference} — ${card.title}`,
					text: image.shareText,
					files: [image.file]
				});
				onShowToast(t.sharedToast);
				return;
			}
			await navigator.share({
				title: `${card.reference} — ${card.title}`,
				text: image.shareText
			});
			onShowToast(t.sharedToast);
			return;
		} catch (err) {
			if (err.name === "AbortError") return;
		}
		try {
			await navigator.clipboard?.writeText(image.shareText);
		} catch {}
		onShowToast(t.copiedToast);
	};
	const handleDownloadCard = (card, image) => {
		if (!image.dataUrl) return;
		const link = document.createElement("a");
		link.href = image.dataUrl;
		link.download = `scripture-card-${card.id}.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		onShowToast("Scripture card saved!");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2.5 sm:py-3 max-w-4xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-10 h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#7A5400] flex items-center justify-center shadow-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-5 h-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight",
						children: "Scripture Treasury"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold text-[#47608B]",
						children: [
							unlockedCardIds.length,
							"/",
							TREASURY_CARDS.length,
							" illustrated verse cards unlocked"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSubTab("cards"),
						className: `min-h-[36px] px-3 rounded-xl font-display text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${subTab === "cards" ? "bg-[#2A8CFF] text-white" : "text-[#47608B] hover:text-[#14274E]"}`,
						children: "Verse Cards"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSubTab("saved"),
						className: `min-h-[36px] px-3 rounded-xl font-display text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${subTab === "saved" ? "bg-[#2A8CFF] text-white" : "text-[#47608B] hover:text-[#14274E]"}`,
						children: [
							t.tabSaved,
							" (",
							savedVerses.length,
							")"
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex-1 min-h-0 overflow-y-auto pr-0.5 pb-3",
				children: subTab === "cards" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
					children: TREASURY_CARDS.map((card) => {
						const isUnlocked = unlockedCardIds.includes(card.id);
						const canAfford = totalCoins >= card.unlockCost;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "bg-white/95 rounded-[24px] p-3.5 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border-2 border-white flex flex-col justify-between gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative h-28 rounded-2xl overflow-hidden border border-[#DCEBFF] bg-[#CBE7FF] mb-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StorySceneSvg, {
										theme: card.storyTheme,
										label: `${card.reference} — ${card.title}`
									}), !isUnlocked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "absolute inset-0 bg-[#14274E]/40 backdrop-blur-[1px] flex items-center justify-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-10 h-10 rounded-full bg-white/95 text-[#B45309] flex items-center justify-center shadow-sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-5 h-5" })
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base font-extrabold text-[#14274E]",
									children: card.reference
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs font-bold text-[#2F8FFF]",
									children: card.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-[#334155] mt-1 leading-snug line-clamp-3",
									children: isUnlocked ? `“${card.verseText}”` : "Unlock this illustrated Scripture card to read, listen, and share it with family & friends."
								})
							] }), isUnlocked ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 pt-1 border-t border-[#EFF5FF]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleOpenCard(card),
									className: "flex-1 min-h-[40px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "View & Share" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => onListen(`${card.reference}. ${card.verseText}`),
									"aria-label": `Listen to ${card.reference}`,
									className: "w-10 h-10 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] text-[#7A5400] flex items-center justify-center cursor-pointer shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-4 h-4" })
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => onUnlockCard(card),
								className: `w-full min-h-[40px] rounded-full font-display font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${canAfford ? "bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400]" : "bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[#475569]"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Unlock for ",
									card.unlockCost,
									" Coins"
								] })]
							})]
						}, card.id);
					})
				}) : savedVerses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white/95 rounded-[28px] p-6 shadow-[0_10px_28px_-8px_rgba(30,58,138,0.12)] border border-white flex flex-col items-center text-center mt-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-14 h-14 rounded-full bg-[#EDF5FF] text-[#2F8FFF] flex items-center justify-center mb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "w-7 h-7" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl font-extrabold text-[#14274E]",
							children: t.savedEmptyTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-[#5C7299] mt-1 max-w-xs",
							children: t.savedEmptySubtitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onBrowseVerses,
							className: "mt-4 px-6 py-2.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm shadow-sm cursor-pointer",
							children: t.browseVersesBtn
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2.5",
					children: savedVerses.map((verse) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "bg-white/95 rounded-2xl p-3.5 sm:p-4 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => onSelectVerse(verse),
							className: "text-start cursor-pointer group",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-base sm:text-lg font-extrabold text-[#14274E] group-hover:text-[#2F8FFF] transition-colors",
								children: verse.reference
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs sm:text-sm text-[#334155] mt-0.5 leading-snug",
								children: verse.text
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 pt-0.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-[11px] font-semibold text-[#5C7299]",
								children: [
									verse.version,
									" · ",
									verse.themes[0]
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5 shrink-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onListen(`${verse.reference}. ${verse.text}`),
										"aria-label": t.listen,
										className: "h-8 px-2.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] text-[#7A5400] text-xs font-bold flex items-center gap-1 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.listen })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => onCopyVerse(verse),
										"aria-label": t.copy,
										className: "h-8 px-2.5 rounded-full bg-[#E5F0FF] hover:bg-[#CFE3FF] text-[#14274E] text-xs font-bold flex items-center gap-1 cursor-pointer",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden sm:inline",
											children: t.copy
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => onRemoveSaved(verse),
										"aria-label": t.remove,
										className: "h-8 w-8 rounded-full bg-[#FFE8EC] hover:bg-[#FFD1DA] text-[#C81E3D] flex items-center justify-center cursor-pointer",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-3.5 h-3.5" })
									})
								]
							})]
						})]
					}, verse.id))
				})
			}),
			viewingCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "treasury-card-modal-title",
				className: "fixed inset-0 z-50 bg-[#14274E]/60 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white rounded-[28px] max-w-md w-full p-4 sm:p-5 shadow-[0_24px_60px_rgba(15,30,61,0.35)] border-2 border-white space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "treasury-card-modal-title",
								className: "font-display text-lg sm:text-xl font-extrabold text-[#14274E]",
								children: viewingCard.card.reference
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold text-[#2F8FFF]",
								children: viewingCard.card.title
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setViewingCard(null),
								"aria-label": t.closeLabel,
								className: "w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
							})]
						}),
						viewingCard.image.dataUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl overflow-hidden border border-[#DCEBFF] shadow-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: viewingCard.image.dataUrl,
								alt: `${viewingCard.card.reference} — ${viewingCard.card.verseText}`,
								referrerPolicy: "no-referrer",
								className: "w-full h-auto block"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-[#47608B] text-center font-medium",
							children: viewingCard.card.reflection
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void handleShareCard(viewingCard.card, viewingCard.image),
									className: "min-h-[42px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.share })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleDownloadCard(viewingCard.card, viewingCard.image),
									className: "min-h-[42px] rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#7A5400] font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save PNG" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onListen(`${viewingCard.card.reference}. ${viewingCard.card.verseText}`),
									className: "min-h-[42px] rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] font-display font-bold text-xs flex items-center justify-center gap-1 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-3.5 h-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.listen })]
								})
							]
						})
					]
				})
			})
		]
	});
};
// src/data/leaderboardData.ts
var COMPETING_SCHOLARS = [
	{
		id: "npc-1",
		displayName: "Miriam K.",
		avatarId: "olive",
		baseWeeklyPoints: 2950,
		baseAllTimePoints: 14200,
		basePerfectRounds: 14
	},
	{
		id: "npc-2",
		displayName: "Caleb N.",
		avatarId: "shield",
		baseWeeklyPoints: 2680,
		baseAllTimePoints: 12900,
		basePerfectRounds: 12
	},
	{
		id: "npc-3",
		displayName: "Esther V.",
		avatarId: "crown",
		baseWeeklyPoints: 2420,
		baseAllTimePoints: 11400,
		basePerfectRounds: 11
	},
	{
		id: "npc-4",
		displayName: "Daniel O.",
		avatarId: "scroll",
		baseWeeklyPoints: 2150,
		baseAllTimePoints: 10200,
		basePerfectRounds: 9
	},
	{
		id: "npc-5",
		displayName: "Ruth M.",
		avatarId: "dove",
		baseWeeklyPoints: 1920,
		baseAllTimePoints: 9100,
		basePerfectRounds: 8
	},
	{
		id: "npc-6",
		displayName: "Gideon T.",
		avatarId: "shield",
		baseWeeklyPoints: 1710,
		baseAllTimePoints: 7900,
		basePerfectRounds: 7
	},
	{
		id: "npc-7",
		displayName: "Hannah S.",
		avatarId: "dove",
		baseWeeklyPoints: 1520,
		baseAllTimePoints: 6800,
		basePerfectRounds: 6
	},
	{
		id: "npc-8",
		displayName: "Josiah P.",
		avatarId: "crown",
		baseWeeklyPoints: 1340,
		baseAllTimePoints: 5900,
		basePerfectRounds: 5
	},
	{
		id: "npc-9",
		displayName: "Lydia W.",
		avatarId: "olive",
		baseWeeklyPoints: 1180,
		baseAllTimePoints: 5100,
		basePerfectRounds: 5
	},
	{
		id: "npc-10",
		displayName: "Samuel A.",
		avatarId: "scroll",
		baseWeeklyPoints: 1040,
		baseAllTimePoints: 4400,
		basePerfectRounds: 4
	},
	{
		id: "npc-11",
		displayName: "Deborah R.",
		avatarId: "shield",
		baseWeeklyPoints: 920,
		baseAllTimePoints: 3800,
		basePerfectRounds: 3
	},
	{
		id: "npc-12",
		displayName: "Timothy L.",
		avatarId: "scroll",
		baseWeeklyPoints: 810,
		baseAllTimePoints: 3250,
		basePerfectRounds: 3
	},
	{
		id: "npc-13",
		displayName: "Naomi B.",
		avatarId: "dove",
		baseWeeklyPoints: 700,
		baseAllTimePoints: 2700,
		basePerfectRounds: 2
	},
	{
		id: "npc-14",
		displayName: "Barnabas C.",
		avatarId: "olive",
		baseWeeklyPoints: 610,
		baseAllTimePoints: 2250,
		basePerfectRounds: 2
	},
	{
		id: "npc-15",
		displayName: "Priscilla D.",
		avatarId: "crown",
		baseWeeklyPoints: 520,
		baseAllTimePoints: 1850,
		basePerfectRounds: 2
	},
	{
		id: "npc-16",
		displayName: "Joshua E.",
		avatarId: "shield",
		baseWeeklyPoints: 440,
		baseAllTimePoints: 1450,
		basePerfectRounds: 1
	},
	{
		id: "npc-17",
		displayName: "Phoebe G.",
		avatarId: "dove",
		baseWeeklyPoints: 360,
		baseAllTimePoints: 1100,
		basePerfectRounds: 1
	},
	{
		id: "npc-18",
		displayName: "Nehemiah H.",
		avatarId: "scroll",
		baseWeeklyPoints: 280,
		baseAllTimePoints: 820,
		basePerfectRounds: 1
	},
	{
		id: "npc-19",
		displayName: "Abigail J.",
		avatarId: "olive",
		baseWeeklyPoints: 190,
		baseAllTimePoints: 540,
		basePerfectRounds: 0
	},
	{
		id: "npc-20",
		displayName: "Silas F.",
		avatarId: "shield",
		baseWeeklyPoints: 110,
		baseAllTimePoints: 310,
		basePerfectRounds: 0
	}
];
function buildLeaderboardEntries(params) {
	const userPoints = params.mode === "weekly" ? params.userWeeklyPoints : params.userAllTimePoints;
	const roundWave = Math.min(params.quizzesCompleted, 25);
	const scaleFactor = params.mode === "weekly" ? 1 + Math.min(.25, roundWave * .015) : 1 + Math.min(.35, roundWave * .02);
	const combined = COMPETING_SCHOLARS.map((npc, idx) => {
		const rawBase = params.mode === "weekly" ? npc.baseWeeklyPoints : npc.baseAllTimePoints;
		const scaled = Math.round(rawBase * scaleFactor / 10) * 10;
		const bonusPerfect = Math.floor(roundWave / (idx + 5));
		return {
			id: npc.id,
			displayName: npc.displayName,
			avatarId: npc.avatarId,
			totalPoints: scaled,
			perfectRounds: npc.basePerfectRounds + bonusPerfect,
			isCurrentUser: false
		};
	});
	combined.push({
		id: "current-user",
		displayName: params.playerProfile.displayName.trim() || "Pilgrim",
		avatarId: params.playerProfile.avatarId,
		totalPoints: userPoints,
		perfectRounds: params.userPerfectRounds,
		isCurrentUser: true
	});
	combined.sort((a, b) => {
		if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
		if (b.perfectRounds !== a.perfectRounds) return b.perfectRounds - a.perfectRounds;
		return a.isCurrentUser ? -1 : 1;
	});
	const ranked = combined.map((entry, idx) => ({
		...entry,
		rank: idx + 1
	}));
	const userIndex = ranked.findIndex((e) => e.isCurrentUser);
	const userRank = userIndex >= 0 ? ranked[userIndex].rank : ranked.length;
	const pointsToNextRank = userIndex > 0 ? Math.max(10, ranked[userIndex - 1].totalPoints - ranked[userIndex].totalPoints + 10) : null;
	return {
		top20: ranked.slice(0, 20),
		userRank,
		pointsToNextRank
	};
}
// src/components/LeaderboardScreen.tsx
var LeaderboardScreen = ({ profile, stats, onEditProfile, onStartQuiz }) => {
	const [mode, setMode] = (0, import_react.useState)("weekly");
	const { top20, userRank, pointsToNextRank } = (0, import_react.useMemo)(() => buildLeaderboardEntries({
		mode,
		playerProfile: profile,
		userWeeklyPoints: stats.weeklyScore,
		userAllTimePoints: stats.totalScore,
		userPerfectRounds: stats.perfectRounds,
		quizzesCompleted: stats.quizzesCompleted
	}), [
		mode,
		profile,
		stats.weeklyScore,
		stats.totalScore,
		stats.perfectRounds,
		stats.quizzesCompleted
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2.5 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 flex flex-wrap items-center justify-between gap-2 mb-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-10 h-10 rounded-2xl bg-[#FFE675] border-2 border-[#F5B935] text-[#B45309] flex items-center justify-center shadow-xs",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-5 h-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight",
						children: "Leaderboard"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold text-[#47608B] tabular-nums",
						children: [
							"Your Rank: #",
							userRank,
							pointsToNextRank !== null ? ` · ${pointsToNextRank.toLocaleString()} pts to climb` : " · #1 Champion!"
						]
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onEditProfile,
					className: "min-h-[40px] px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] font-display font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BibleAvatarIcon, {
							avatarId: profile.avatarId,
							size: "sm"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate max-w-[100px]",
							children: profile.displayName || "Pilgrim"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "w-3.5 h-3.5 text-[#2F8FFF]" })
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 grid grid-cols-2 gap-1.5 p-1 bg-white/85 rounded-2xl border border-[#DCEBFF] mb-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMode("weekly"),
					className: `min-h-[40px] rounded-xl font-display text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${mode === "weekly" ? "bg-[#2A8CFF] text-white shadow-xs" : "text-[#47608B] hover:text-[#14274E]"}`,
					children: "Weekly Challenge"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setMode("alltime"),
					className: `min-h-[40px] rounded-xl font-display text-xs sm:text-sm font-extrabold transition-colors cursor-pointer ${mode === "alltime" ? "bg-[#2A8CFF] text-white shadow-xs" : "text-[#47608B] hover:text-[#14274E]"}`,
					children: "All-Time Top Scholars"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "shrink-0 grid grid-cols-12 gap-2 px-3.5 py-1.5 text-[11px] font-bold text-[#47608B]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "col-span-2",
						children: "Rank"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "col-span-5",
						children: "Scholar"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "col-span-3 text-end",
						children: "Points"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "col-span-2 text-end",
						children: "6/6"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-0.5 pb-3",
				children: [top20.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `grid grid-cols-12 items-center gap-2 rounded-2xl px-3 py-2 border transition-colors ${entry.isCurrentUser ? "bg-[#FFF7D6] border-2 border-[#F5B935] shadow-sm" : "bg-white/95 border-white shadow-[0_4px_12px_-6px_rgba(30,58,138,0.12)]"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2 flex items-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankMedal, { rank: entry.rank })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "col-span-5 flex items-center gap-2 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BibleAvatarIcon, {
								avatarId: entry.avatarId,
								size: "sm"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "min-w-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "font-display text-xs sm:text-sm font-extrabold text-[#14274E] truncate",
									children: [entry.displayName, entry.isCurrentUser ? " (You)" : ""]
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-3 text-end font-display text-xs sm:text-sm font-extrabold text-[#164A9E] tabular-nums",
							children: entry.totalPoints.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "col-span-2 text-end text-xs font-bold text-[#5C7299] tabular-nums",
							children: entry.perfectRounds
						})
					]
				}, entry.id)), userRank > 20 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 rounded-2xl bg-[#FFF7D6] border-2 border-[#F5B935] px-3.5 py-2.5 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RankMedal, { rank: userRank }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BibleAvatarIcon, {
								avatarId: profile.avatarId,
								size: "sm"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-display text-sm font-extrabold text-[#14274E] truncate",
								children: [profile.displayName || "Pilgrim", " (You)"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-display text-sm font-extrabold text-[#164A9E] tabular-nums",
							children: [
								(mode === "weekly" ? stats.weeklyScore : stats.totalScore).toLocaleString(),
								" ",
								"pts"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onStartQuiz,
							className: "px-3 py-1.5 rounded-full bg-[#2A8CFF] text-white font-display font-bold text-xs cursor-pointer",
							children: "Play"
						})]
					})]
				})]
			})
		]
	});
};
// src/components/SettingsScreen.tsx
var BOOK_PILLS = [
	{
		id: "Genesis",
		bg: "bg-[#FFD8AE] border-[#F0B87D] text-[#7A3B09]",
		activeBg: "bg-[#FFC182] border-[#14274E] text-[#14274E]",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feather, { className: "w-3.5 h-3.5 shrink-0" })
	},
	{
		id: "Exodus",
		bg: "bg-[#FFCBD0] border-[#EE9EA7] text-[#7F1D2B]",
		activeBg: "bg-[#FFA9B2] border-[#14274E] text-[#14274E]",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "w-3.5 h-3.5 shrink-0" })
	},
	{
		id: "Psalms",
		bg: "bg-[#B7E9E2] border-[#84CFC5] text-[#0E5851]",
		activeBg: "bg-[#8FDCD1] border-[#14274E] text-[#14274E]",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music, { className: "w-3.5 h-3.5 shrink-0" })
	},
	{
		id: "Matthew",
		bg: "bg-[#FFE7A3] border-[#EBC663] text-[#6B4E07]",
		activeBg: "bg-[#FFD76E] border-[#14274E] text-[#14274E]",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5 shrink-0" })
	},
	{
		id: "John",
		bg: "bg-[#D7C8FF] border-[#B69CF6] text-[#452483]",
		activeBg: "bg-[#C0A9FF] border-[#14274E] text-[#14274E]",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fish, { className: "w-3.5 h-3.5 shrink-0" })
	},
	{
		id: "Revelation",
		bg: "bg-[#CBD6FF] border-[#9BB0FA] text-[#1E3A8A]",
		activeBg: "bg-[#AEC0FF] border-[#14274E] text-[#14274E]",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "w-3.5 h-3.5 shrink-0" })
	}
];
var SettingsScreen = ({ settings, onSaveSettings, onPreviewVoice, onBack, lang, t }) => {
	const [draft, setDraft] = (0, import_react.useState)(() => {
		const preset = VOICE_PRESETS[settings.voiceGender] || VOICE_PRESETS.female;
		return {
			...settings,
			voicePitch: settings.voicePitch ?? preset.pitch,
			voiceSpeed: settings.voiceSpeed ?? preset.rate
		};
	});
	const activePreset = VOICE_PRESETS[draft.voiceGender] || VOICE_PRESETS.female;
	const currentPitch = draft.voicePitch ?? activePreset.pitch;
	const currentSpeed = draft.voiceSpeed ?? activePreset.rate;
	const ageOptions = [
		{
			id: "kids",
			label: t.ageKids,
			range: t.ageKidsRange,
			bg: "bg-[#FFE89E] border-[#F0CA65]"
		},
		{
			id: "teens",
			label: t.ageTeens,
			range: t.ageTeensRange,
			bg: "bg-[#D3C2F8] border-[#B297F0]"
		},
		{
			id: "adults",
			label: t.ageAdults,
			range: t.ageAdultsRange,
			bg: "bg-[#B8E6A3] border-[#89C86E]"
		}
	];
	const voiceOptions = [
		{
			id: "female",
			label: t.voiceFemale,
			bg: "bg-[#FFC2CC] border-[#EF96A5] text-[#6E1A2A]",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "w-4 h-4 shrink-0" })
		},
		{
			id: "male",
			label: t.voiceMale,
			bg: "bg-[#B8D9FF] border-[#88B8F2] text-[#153E7E]",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "w-4 h-4 shrink-0" })
		},
		{
			id: "teen",
			label: t.voiceTeen,
			bg: "bg-[#FFD5A8] border-[#F0B270] text-[#7A3B09]",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Headphones, { className: "w-4 h-4 shrink-0" })
		},
		{
			id: "kids",
			label: t.voiceKids,
			bg: "bg-[#C1E8AC] border-[#90CB72] text-[#1E5C1D]",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "w-4 h-4 shrink-0" })
		}
	];
	const handleSelectAgeGroup = (ageGroup) => {
		const syncedVoice = ageGroup === "kids" ? "kids" : ageGroup === "teens" ? "teen" : draft.voiceGender === "male" ? "male" : "female";
		const preset = VOICE_PRESETS[syncedVoice];
		setDraft({
			...draft,
			ageGroup,
			voiceGender: syncedVoice,
			voicePitch: preset.pitch,
			voiceSpeed: preset.rate
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex flex-col justify-between px-3.5 sm:px-5 py-1.5 sm:py-2.5 max-w-3xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 flex items-center justify-between gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onBack,
						"aria-label": t.previous,
						className: "w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#14274E] flex items-center justify-center shadow-xs cursor-pointer shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-5 h-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex items-center gap-2.5 bg-white/95 border-2 border-white rounded-full px-4 py-1.5 shadow-[0_6px_18px_rgba(20,39,78,0.1)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF4C4] border border-[#F2CE5B] text-[#B45309]",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-4 h-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-8 h-8 rounded-full bg-[#BCE0FF] flex items-center justify-center text-[#164A9E]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cloud, { className: "w-5 h-5 fill-white text-[#2F8FFF]" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-xl sm:text-2xl font-extrabold text-[#164A9E] tracking-tight",
								children: t.settingsTitle
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "w-10 shrink-0",
						"aria-hidden": "true"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-h-0 flex flex-col justify-evenly gap-1.5 sm:gap-2.5 my-1 sm:my-2 overflow-y-auto pr-0.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "bg-white/95 rounded-[24px] p-2.5 sm:p-3.5 shadow-[0_6px_20px_-6px_rgba(30,58,138,0.12)] border border-white shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-7 h-7 rounded-full bg-[#FFE89E] flex items-center justify-center text-[#8A5600] shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smile, { className: "w-4 h-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-sm sm:text-base font-extrabold text-[#14274E]",
								children: t.ageCardTitle
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: ageOptions.map((opt) => {
								const isActive = draft.ageGroup === opt.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => handleSelectAgeGroup(opt.id),
									className: `relative rounded-2xl border-2 px-2 py-1.5 sm:py-2.5 flex flex-col items-center justify-center transition-all cursor-pointer ${opt.bg} ${isActive ? "border-[#14274E] ring-1 ring-[#14274E] shadow-xs" : "opacity-90 hover:opacity-100"}`,
									children: [
										isActive && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "absolute -top-2 -right-1.5 w-5 h-5 rounded-full bg-[#2A8CFF] text-white border-2 border-white flex items-center justify-center shadow-xs",
											"aria-label": "Active",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-3 h-3 stroke-[3]" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-xs sm:text-sm font-extrabold text-[#14274E] leading-tight",
											children: opt.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] sm:text-xs font-bold text-[#334155] tabular-nums",
											children: opt.range
										})
									]
								}, opt.id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "bg-white/95 rounded-[24px] p-2.5 sm:p-3.5 shadow-[0_6px_20px_-6px_rgba(30,58,138,0.12)] border border-white shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2 mb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-7 h-7 rounded-full bg-[#D4E9FF] flex items-center justify-center text-[#164A9E] shrink-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-4 h-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate",
									children: t.bookCardTitle
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								"aria-label": t.bookCardTitle,
								value: draft.bookFilter,
								onChange: (e) => setDraft({
									...draft,
									bookFilter: e.target.value
								}),
								className: "max-w-[175px] sm:max-w-[220px] rounded-full bg-[#F1F6FF] border border-[#BFD9FA] px-3 py-1 text-xs sm:text-sm font-bold text-[#14274E] focus:outline-none focus:ring-2 focus:ring-[#2A8CFF] cursor-pointer",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "all",
										children: t.bookNames.all
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
										label: "Old Testament (39)",
										children: OLD_TESTAMENT_BOOKS.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: book.name,
											children: [
												book.name,
												" (",
												book.chapters,
												" ch)"
											]
										}, book.id))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
										label: "New Testament (27)",
										children: NEW_TESTAMENT_BOOKS.map((book) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: book.name,
											children: [
												book.name,
												" (",
												book.chapters,
												" ch)"
											]
										}, book.id))
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-1.5 sm:gap-2",
							children: BOOK_PILLS.map((pill) => {
								const isSelected = draft.bookFilter === pill.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setDraft({
										...draft,
										bookFilter: isSelected ? "all" : pill.id
									}),
									className: `min-h-[34px] sm:min-h-[38px] rounded-full border-2 px-2 py-1 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${isSelected ? `${pill.activeBg} shadow-xs` : pill.bg}`,
									children: [pill.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: t.bookNames[pill.id]
									})]
								}, pill.id);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "bg-white/95 rounded-[24px] p-2.5 sm:p-3.5 shadow-[0_6px_20px_-6px_rgba(30,58,138,0.12)] border border-white shrink-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2 mb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-7 h-7 rounded-full bg-[#FFD4DD] flex items-center justify-center text-[#9E1C3F] shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "w-4 h-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-sm sm:text-base font-extrabold text-[#14274E] truncate",
										children: t.voiceCardTitle
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => onPreviewVoice(draft),
									className: "inline-flex items-center gap-1 rounded-full bg-[#FFF0B8] hover:bg-[#FFE382] border border-[#F2C94C] px-2.5 py-1 text-[11px] sm:text-xs font-extrabold text-[#14274E] transition-colors cursor-pointer shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-3.5 h-3.5 text-[#B45309]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.previewVoiceBtn })]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-1.5 sm:gap-2",
								children: voiceOptions.map((voice) => {
									const isSelected = draft.voiceGender === voice.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => {
											const preset = VOICE_PRESETS[voice.id];
											setDraft({
												...draft,
												voiceGender: voice.id,
												voicePitch: preset.pitch,
												voiceSpeed: preset.rate
											});
										},
										className: `relative min-h-[36px] sm:min-h-[42px] rounded-full border-2 px-3 py-1 flex items-center justify-between gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${voice.bg} ${isSelected ? "border-[#14274E] ring-1 ring-[#14274E] shadow-xs" : "opacity-90 hover:opacity-100"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 min-w-0",
											children: [voice.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: voice.label
											})]
										}), isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-4 h-4 rounded-full bg-[#14274E] text-white flex items-center justify-center shrink-0",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-2.5 h-2.5 stroke-[3]" })
										})]
									}, voice.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 mt-2.5 pt-2 border-t border-[#E6EFFC]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-[11px] font-bold text-[#334155]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.voiceSpeedLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "tabular-nums text-[#164A9E]",
											children: [currentSpeed.toFixed(2), "x"]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: .7,
										max: 1.3,
										step: .05,
										value: currentSpeed,
										onChange: (e) => setDraft({
											...draft,
											voiceSpeed: parseFloat(e.target.value)
										}),
										className: "w-full accent-[#2C88FF] cursor-pointer h-1.5"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex flex-col gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-[11px] font-bold text-[#334155]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.voicePitchLabel }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "tabular-nums text-[#164A9E]",
											children: currentPitch.toFixed(2)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "range",
										min: .7,
										max: 1.85,
										step: .05,
										value: currentPitch,
										onChange: (e) => setDraft({
											...draft,
											voicePitch: parseFloat(e.target.value)
										}),
										className: "w-full accent-[#2C88FF] cursor-pointer h-1.5"
									})]
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 pb-0.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onSaveSettings(draft),
					className: "w-full min-h-[46px] sm:min-h-[52px] rounded-full bg-[#2C88FF] hover:bg-[#1B78F0] text-white font-display text-base sm:text-lg font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_0_#1662C6] active:translate-y-[1px] transition-all cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.saveSettings }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-6 h-6 rounded-full bg-white/25 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-4 h-4 stroke-[3]" })
					})]
				})
			})
		]
	});
};
// src/utils/achievementCard.ts
function drawRoundedRect(ctx, x, y, w, h, r) {
	const radius = Math.min(r, w / 2, h / 2);
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + w, y, x + w, y + h, radius);
	ctx.arcTo(x + w, y + h, x, y + h, radius);
	ctx.arcTo(x, y + h, x, y, radius);
	ctx.arcTo(x, y, x + w, y, radius);
	ctx.closePath();
}
function drawCoinIcon(ctx, cx, cy, radius) {
	ctx.beginPath();
	ctx.arc(cx, cy, radius, 0, Math.PI * 2);
	ctx.fillStyle = "#FFD02C";
	ctx.fill();
	ctx.lineWidth = 2.5;
	ctx.strokeStyle = "#C27200";
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(cx, cy, radius * .72, 0, Math.PI * 2);
	ctx.lineWidth = 1.6;
	ctx.strokeStyle = "#FFF7B2";
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(cx, cy - radius * .42);
	ctx.lineTo(cx, cy + radius * .42);
	ctx.moveTo(cx - radius * .25, cy - radius * .16);
	ctx.lineTo(cx + radius * .25, cy - radius * .16);
	ctx.lineWidth = 2.4;
	ctx.lineCap = "round";
	ctx.strokeStyle = "#9A5400";
	ctx.stroke();
}
function drawFlameIcon(ctx, cx, cy, scale) {
	ctx.beginPath();
	ctx.moveTo(cx, cy - 22 * scale);
	ctx.bezierCurveTo(cx + 16 * scale, cy - 6 * scale, cx + 18 * scale, cy + 14 * scale, cx, cy + 22 * scale);
	ctx.bezierCurveTo(cx - 18 * scale, cy + 14 * scale, cx - 16 * scale, cy - 6 * scale, cx, cy - 22 * scale);
	ctx.closePath();
}
function dataUrlToFile(dataUrl, filename) {
	try {
		const [header, base64] = dataUrl.split(",");
		const mimeMatch = header.match(/data:(.*?);/);
		const mime = mimeMatch ? mimeMatch[1] : "image/png";
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
		return new File([bytes], filename, { type: mime });
	} catch {
		return null;
	}
}
function generateAchievementSummaryCard(stats, lang, t) {
	const width = 900;
	const height = 520;
	const isRtl = lang === "ar";
	const summaryText = t.achievementSummaryText.replace("{coins}", String(stats.totalCoins)).replace("{streak}", String(stats.streakDays));
	const title = t.achievementCardTitle;
	if (typeof document === "undefined") return {
		dataUrl: "",
		file: null,
		title,
		text: summaryText
	};
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) return {
		dataUrl: "",
		file: null,
		title,
		text: summaryText
	};
	const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
	skyGrad.addColorStop(0, "#BFE3FF");
	skyGrad.addColorStop(.55, "#DCEEFF");
	skyGrad.addColorStop(1, "#EFF7FF");
	ctx.fillStyle = skyGrad;
	ctx.fillRect(0, 0, width, height);
	const glowGrad = ctx.createRadialGradient(width / 2, 80, 10, width / 2, 80, 360);
	glowGrad.addColorStop(0, "rgba(255, 245, 198, 0.92)");
	glowGrad.addColorStop(.5, "rgba(255, 245, 198, 0.3)");
	glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
	ctx.fillStyle = glowGrad;
	ctx.fillRect(0, 0, width, height);
	ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
	[
		[
			95,
			95,
			58
		],
		[
			150,
			82,
			70
		],
		[
			205,
			102,
			50
		],
		[
			720,
			88,
			62
		],
		[
			785,
			76,
			72
		],
		[
			835,
			100,
			48
		]
	].forEach(([cx, cy, r]) => {
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, Math.PI * 2);
		ctx.fill();
	});
	ctx.save();
	ctx.shadowColor = "rgba(30, 58, 138, 0.14)";
	ctx.shadowBlur = 28;
	ctx.shadowOffsetY = 12;
	drawRoundedRect(ctx, 56, 46, 788, 428, 36);
	ctx.fillStyle = "#FFFFFF";
	ctx.fill();
	ctx.restore();
	drawRoundedRect(ctx, 56, 46, 788, 428, 36);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#DCEBFF";
	ctx.stroke();
	ctx.fillStyle = "#FFE675";
	ctx.beginPath();
	ctx.arc(width / 2, 114, 34, 0, Math.PI * 2);
	ctx.fill();
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#F5B935";
	ctx.stroke();
	ctx.fillStyle = "#7A5400";
	drawRoundedRect(ctx, width / 2 - 4, 93, 8, 42, 4);
	ctx.fill();
	drawRoundedRect(ctx, width / 2 - 14, 103, 28, 8, 4);
	ctx.fill();
	ctx.textAlign = "center";
	ctx.direction = isRtl ? "rtl" : "ltr";
	ctx.fillStyle = "#5C7299";
	ctx.font = "700 18px \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText("Bible Quest: Daily Verse & Quiz", width / 2, 174);
	ctx.fillStyle = "#14274E";
	ctx.font = "800 34px \"Outfit\", \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText(title, width / 2, 214);
	const boxWidth = 336;
	const boxHeight = 160;
	const startX = 96;
	const boxY = 246;
	drawRoundedRect(ctx, startX, boxY, boxWidth, boxHeight, 28);
	ctx.fillStyle = "#FFF9DF";
	ctx.fill();
	ctx.lineWidth = 2.5;
	ctx.strokeStyle = "#F5D46B";
	ctx.stroke();
	drawCoinIcon(ctx, 264, 292, 22);
	ctx.fillStyle = "#14274E";
	ctx.font = "800 44px \"Outfit\", \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText(String(stats.totalCoins), 264, 360);
	ctx.fillStyle = "#5C7299";
	ctx.font = "700 18px \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText(t.totalCoins, 264, 388);
	drawRoundedRect(ctx, 468, boxY, boxWidth, boxHeight, 28);
	ctx.fillStyle = "#FFF2EB";
	ctx.fill();
	ctx.lineWidth = 2.5;
	ctx.strokeStyle = "#FDBA74";
	ctx.stroke();
	ctx.fillStyle = "#FFE4D6";
	ctx.beginPath();
	ctx.arc(636, 292, 26, 0, Math.PI * 2);
	ctx.fill();
	drawFlameIcon(ctx, 636, 293, .72);
	ctx.fillStyle = "#EA580C";
	ctx.fill();
	ctx.fillStyle = "#14274E";
	ctx.font = "800 44px \"Outfit\", \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText(String(stats.streakDays), 636, 360);
	ctx.fillStyle = "#5C7299";
	ctx.font = "700 18px \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText(t.dayStreak, 636, 388);
	ctx.fillStyle = "#47608B";
	ctx.font = "600 16px \"Plus Jakarta Sans\", system-ui, sans-serif";
	ctx.fillText(t.quizCompleteSubtitle, width / 2, 444);
	const dataUrl = canvas.toDataURL("image/png");
	return {
		dataUrl,
		file: dataUrlToFile(dataUrl, "bible-quest-achievement.png"),
		title,
		text: summaryText
	};
}
// src/hooks/usePWA.ts
function usePWAInstall() {
	const [deferredPrompt, setDeferredPrompt] = (0, import_react.useState)(null);
	const [isInstalled, setIsInstalled] = (0, import_react.useState)(false);
	const [isIOS, setIsIOS] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
		setIsInstalled(isStandalone);
		const ua = window.navigator.userAgent.toLowerCase();
		setIsIOS(/iphone|ipad|ipod/.test(ua));
		const handleBeforeInstallPrompt = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
		};
		const handleAppInstalled = () => {
			setIsInstalled(true);
			setDeferredPrompt(null);
		};
		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		window.addEventListener("appinstalled", handleAppInstalled);
		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);
	const install = async () => {
		if (!deferredPrompt) return false;
		await deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === "accepted") {
			setIsInstalled(true);
			setDeferredPrompt(null);
			return true;
		}
		return false;
	};
	return {
		isInstallable: Boolean(deferredPrompt),
		isInstalled,
		isIOS,
		install
	};
}
function useOnlineStatus() {
	const [isOnline, setIsOnline] = (0, import_react.useState)(typeof navigator !== "undefined" ? navigator.onLine : true);
	(0, import_react.useEffect)(() => {
		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);
		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);
		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);
	return isOnline;
}
// src/components/PWAComponents.tsx
var OfflineIndicator = () => {
	if (useOnlineStatus()) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		"aria-live": "polite",
		className: "fixed top-2.5 right-3 z-50 flex items-center gap-1.5 rounded-full bg-[#B45309]/95 border border-[#FCD34D] px-3 py-1 text-[11px] font-bold text-white shadow-md backdrop-blur-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "w-3.5 h-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Offline · Cached verses" })]
	});
};
var PWAInstallCard = ({ onInstalled }) => {
	const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
	const [showIOSGuide, setShowIOSGuide] = (0, import_react.useState)(false);
	if (isInstalled) return null;
	if (!isInstallable && !isIOS) return null;
	const handleClick = async () => {
		if (isInstallable) {
			if (await install()) onInstalled?.();
		} else if (isIOS) setShowIOSGuide(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: handleClick,
		className: "w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3 min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "w-10 h-10 rounded-full bg-[#FFE675] flex items-center justify-center shrink-0",
				children: isIOS ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "w-5 h-5 text-[#7A5400]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-5 h-5 text-[#7A5400]" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-start min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-display text-base font-extrabold text-[#14274E] truncate",
					children: "Install Bible Quest App"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs font-semibold text-[#5C7299] mt-0.5 truncate",
					children: isIOS ? "Add to Home Screen for offline reading" : "Quick access & offline reading anytime"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-5 h-5 text-[#5C7299] shrink-0" })]
	}), showIOSGuide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "ios-install-title",
		className: "fixed inset-0 z-50 bg-[#14274E]/55 backdrop-blur-xs flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-[28px] max-w-sm w-full p-5 shadow-xl border border-white space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "ios-install-title",
						className: "font-display text-lg font-extrabold text-[#14274E]",
						children: "Install on iPhone / iPad"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setShowIOSGuide(false),
						"aria-label": "Close",
						className: "w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-[#334155] leading-relaxed",
					children: [
						"1. Tap the ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Share" }),
						" button in Safari's toolbar.",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"2. Scroll down and tap ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Add to Home Screen" }),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setShowIOSGuide(false),
					className: "w-full min-h-[44px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm cursor-pointer",
					children: "Got it"
				})
			]
		})
	})] });
};
// src/components/SavedAndProfile.tsx
var ProfileScreen = ({ profile, stats, lang, settings, t, onEditProfile, onOpenLeaderboard, onOpenLanguagePicker, onOpenQuizSettings, onToggleSound, onShowToast }) => {
	const [celebrateKey, setCelebrateKey] = (0, import_react.useState)(0);
	const [achievementCard, setAchievementCard] = (0, import_react.useState)(null);
	const shareCardViaWebShare = async (card) => {
		if (typeof navigator !== "undefined" && typeof navigator.share === "function") try {
			if (card.file && typeof navigator.canShare === "function" && navigator.canShare({ files: [card.file] })) {
				await navigator.share({
					title: card.title,
					text: card.text,
					files: [card.file]
				});
				onShowToast(t.sharedToast);
				return true;
			}
			await navigator.share({
				title: card.title,
				text: card.text
			});
			onShowToast(t.sharedToast);
			return true;
		} catch (err) {
			if (err.name === "AbortError") return false;
		}
		return false;
	};
	const handleShareAchievement = () => {
		const card = generateAchievementSummaryCard(stats, lang, t);
		setAchievementCard(card);
		shareCardViaWebShare(card);
	};
	const handleCopyAchievement = async () => {
		if (!achievementCard) return;
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(achievementCard.text);
			onShowToast(t.achievementCopiedToast);
		} catch {
			onShowToast(t.achievementCopiedToast);
		}
	};
	const handleSaveCardImage = () => {
		if (!achievementCard?.dataUrl) return;
		const link = document.createElement("a");
		link.href = achievementCard.dataUrl;
		link.download = "bible-quest-achievement.png";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		onShowToast(t.achievementSavedToast);
	};
	const currentLanguage = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
	const ageLabel = settings.ageGroup === "kids" ? `${t.ageKids} (${t.ageKidsRange})` : settings.ageGroup === "teens" ? `${t.ageTeens} (${t.ageTeensRange})` : `${t.ageAdults} (${t.ageAdultsRange})`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		dir: lang === "ar" ? "rtl" : "ltr",
		className: "relative z-10 flex-1 min-h-0 flex flex-col px-4 py-2 sm:py-3 max-w-3xl mx-auto w-full overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "shrink-0 flex items-center justify-between gap-2 pt-0.5 mb-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BibleAvatarIcon, {
						avatarId: profile.avatarId,
						size: "md"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tracking-tight truncate",
							children: profile.displayName || t.profileTitle
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold text-[#5C7299] truncate",
							children: t.profileTitle
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onEditProfile,
					className: "min-h-[38px] px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white border border-[#BFD9FA] text-[#164A9E] font-display font-bold text-xs shadow-xs cursor-pointer shrink-0",
					children: "Edit Avatar"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5 pb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid grid-cols-3 gap-2 sm:gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-9 h-9 rounded-full bg-[#FFF2BA] flex items-center justify-center mb-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-5 h-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none",
										children: stats.totalCoins.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full",
										children: t.totalCoins
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-9 h-9 rounded-full bg-[#E5F0FF] text-[#164A9E] flex items-center justify-center mb-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-5 h-5 text-[#F59E0B]" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none",
										children: stats.totalScore.toLocaleString()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full",
										children: "Total Points"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setCelebrateKey((k) => k + 1),
								"aria-label": `${stats.bestStreak} best streak`,
								className: "animate-streak-celebrate relative bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(234,88,12,0.2)] border-2 border-[#FED7AA] flex flex-col items-center text-center cursor-pointer focus-visible:outline-2 focus-visible:outline-[#EA580C]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "relative w-9 h-9 rounded-full bg-[#FFE4D6] text-[#EA580C] flex items-center justify-center mb-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "animate-streak-flame w-5 h-5 fill-[#FB923C]" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												style: {
													["--tx"]: "-12px",
													["--ty"]: "-10px"
												},
												className: "animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#FBBF24]"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												"aria-hidden": "true",
												style: {
													["--tx"]: "12px",
													["--ty"]: "-10px"
												},
												className: "animate-streak-sparkle absolute w-1.5 h-1.5 rounded-full bg-[#FB923C]"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none",
										children: stats.bestStreak
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full",
										children: "Best Streak"
									})
								]
							}, celebrateKey),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-9 h-9 rounded-full bg-[#FFF7D1] text-[#D97706] flex items-center justify-center mb-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "w-5 h-5 fill-[#FBBF24]" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none",
										children: stats.perfectRounds
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full",
										children: "Perfect 6/6"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-9 h-9 rounded-full bg-[#E5F0FF] text-[#2F8FFF] flex items-center justify-center mb-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "w-5 h-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none",
										children: stats.quizzesCompleted
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full",
										children: t.quizzesDone
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-white/95 rounded-3xl p-3 shadow-[0_8px_22px_-8px_rgba(30,58,138,0.14)] border border-white flex flex-col items-center text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-9 h-9 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mb-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "w-5 h-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] tabular-nums leading-none",
										children: stats.streakDays
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-bold text-[#5C7299] mt-1 truncate max-w-full",
										children: t.dayStreak
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-1 sm:grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleShareAchievement,
							className: "w-full min-h-[46px] px-5 py-2.5 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-4 h-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t.shareAchievement })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: onOpenLeaderboard,
							className: "w-full min-h-[46px] px-5 py-2.5 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#14274E] font-display font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_0_#D99B1C] active:translate-y-[1px] transition-all cursor-pointer",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-4 h-4 text-[#B45309]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Top 20 Leaderboard" })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PWAInstallCard, { onInstalled: () => onShowToast("Bible Quest installed!") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onOpenLanguagePicker,
								className: "w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-10 h-10 rounded-full bg-[#BCE0FF] flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "w-5 h-5 text-[#164A9E]" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-start min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-display text-base font-extrabold text-[#14274E] truncate",
											children: t.languageSettingLabel
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-semibold text-[#5C7299] flex items-center gap-1.5 mt-0.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: currentLanguage.nativeName !== currentLanguage.name ? `${currentLanguage.name} · ${currentLanguage.nativeName}` : currentLanguage.name })
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-5 h-5 text-[#5C7299] shrink-0" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onOpenQuizSettings,
								className: "w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-10 h-10 rounded-full bg-[#D3C2F8] flex items-center justify-center shrink-0",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "w-5 h-5 text-[#4D2584]" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-start min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-display text-base font-extrabold text-[#14274E] truncate",
											children: t.quizSettingsLabel
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-xs font-semibold text-[#5C7299] truncate mt-0.5",
											children: [
												ageLabel,
												" ·",
												" ",
												settings.bookFilter === "all" ? t.bookNames.all : settings.bookFilter
											]
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "w-5 h-5 text-[#5C7299] shrink-0" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: onToggleSound,
								className: "w-full bg-white/95 hover:bg-white rounded-2xl p-3.5 shadow-[0_6px_18px_-6px_rgba(30,58,138,0.12)] border border-white flex items-center justify-between gap-3 transition-colors cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "w-10 h-10 rounded-full bg-[#C1E8AC] flex items-center justify-center shrink-0",
										children: settings.soundEnabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-5 h-5 text-[#1E621D]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "w-5 h-5 text-[#64748B]" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-start min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-display text-base font-extrabold text-[#14274E] truncate",
											children: t.soundEffectsLabel
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs font-semibold text-[#5C7299] mt-0.5",
											children: settings.soundEnabled ? t.soundOn : t.soundOff
										})]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `px-3 py-1 rounded-full text-xs font-bold ${settings.soundEnabled ? "bg-[#C1E8AC] text-[#1E621D]" : "bg-slate-200 text-slate-600"}`,
									children: settings.soundEnabled ? t.soundOn : t.soundOff
								})]
							})
						]
					})
				]
			}),
			achievementCard && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "dialog",
				"aria-modal": "true",
				"aria-labelledby": "achievement-modal-title",
				className: "fixed inset-0 z-50 bg-[#14274E]/55 backdrop-blur-xs flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-white rounded-[28px] max-w-md w-full p-4 sm:p-5 shadow-[0_20px_50px_rgba(20,39,78,0.28)] border border-white space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "achievement-modal-title",
								className: "font-display text-lg sm:text-xl font-extrabold text-[#14274E]",
								children: t.achievementCardTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setAchievementCard(null),
								"aria-label": t.closeLabel,
								className: "w-10 h-10 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-5 h-5" })
							})]
						}),
						achievementCard.dataUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl overflow-hidden border border-[#DCEBFF] shadow-sm bg-[#EFF7FF]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: achievementCard.dataUrl,
								alt: `${t.achievementCardTitle} — ${stats.totalCoins} ${t.totalCoins}, ${stats.streakDays} ${t.dayStreak}`,
								referrerPolicy: "no-referrer",
								className: "w-full h-auto block"
							})
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rounded-2xl bg-gradient-to-b from-[#BFE3FF] to-[#EFF7FF] p-5 text-center space-y-2 border border-[#DCEBFF]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-display text-xl font-extrabold text-[#14274E]",
								children: [
									stats.totalCoins,
									" ",
									t.totalCoins,
									" · ",
									stats.streakDays,
									" ",
									t.dayStreak
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs sm:text-sm font-semibold text-[#47608B] text-center leading-snug",
							children: achievementCard.text
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2 pt-0.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: async () => {
										if (!await shareCardViaWebShare(achievementCard)) await handleCopyAchievement();
									},
									className: "min-w-0 min-h-[44px] px-2.5 py-2 rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-[0_3px_0_#1561C0] cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: t.share
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleSaveCardImage,
									className: "min-w-0 min-h-[44px] px-2.5 py-2 rounded-full bg-[#FFE675] hover:bg-[#FFD94A] border border-[#F5B935] text-[#14274E] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: t.saveCardImage
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: handleCopyAchievement,
									className: "min-w-0 min-h-[44px] px-2.5 py-2 rounded-full bg-[#E5F0FF] hover:bg-[#CFE3FF] text-[#14274E] font-display font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-4 h-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: t.copySummary
									})]
								})
							]
						})
					]
				})
			})
		]
	});
};
// src/components/PlayerProfileModal.tsx
var PlayerProfileModal = ({ isOpen, profile, isFirstLaunchPrompt, onSave, onClose }) => {
	const [name, setName] = (0, import_react.useState)(profile.displayName || "");
	const [avatarId, setAvatarId] = (0, import_react.useState)(profile.avatarId);
	if (!isOpen) return null;
	const handleSubmit = (e) => {
		e.preventDefault();
		onSave({
			displayName: name.trim() || "Bible Pilgrim",
			avatarId,
			isCustomized: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "player-profile-modal-title",
		className: "fixed inset-0 z-50 bg-[#14274E]/60 backdrop-blur-xs flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: handleSubmit,
			className: "bg-white rounded-[28px] max-w-md w-full p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,30,61,0.35)] border-2 border-white space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-1.5 text-xs font-extrabold text-[#164A9E]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 text-[#F59E0B]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isFirstLaunchPrompt ? "Welcome! +50 Starter Coins" : "Leaderboard Profile" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "player-profile-modal-title",
						className: "font-display text-xl sm:text-2xl font-extrabold text-[#14274E] mt-0.5",
						children: isFirstLaunchPrompt ? "Choose Your Scholar Profile" : "Edit Display Name & Avatar"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						"aria-label": "Close",
						className: "w-9 h-9 rounded-full bg-[#EDF5FF] hover:bg-[#DCEBFF] text-[#14274E] flex items-center justify-center cursor-pointer shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					htmlFor: "scholar-name-input",
					className: "block text-xs font-bold text-[#47608B] mb-1.5",
					children: "Display Name"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "scholar-name-input",
					type: "text",
					maxLength: 22,
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Enter your name (e.g. David)",
					className: "w-full min-h-[44px] rounded-2xl border-2 border-[#DCEBFF] focus:border-[#2F8FFF] px-3.5 py-2 text-sm font-bold text-[#14274E] bg-[#F8FBFF] focus:outline-none"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs font-bold text-[#47608B] mb-2",
					children: "Pick a Bible Avatar"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-5 gap-2",
					children: BIBLE_AVATARS.map((item) => {
						const selected = avatarId === item.id;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setAvatarId(item.id),
							className: `min-h-[68px] rounded-2xl p-2 flex flex-col items-center justify-center gap-1 border-2 transition-all cursor-pointer ${selected ? "bg-[#E5F0FF] border-[#2F8FFF] scale-[1.03] shadow-xs" : "bg-[#F8FBFF] border-[#DCEBFF] hover:border-[#B0D4FA]"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BibleAvatarIcon, {
								avatarId: item.id,
								size: "md"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-bold text-[#14274E] truncate max-w-full",
								children: item.label
							})]
						}, item.id);
					})
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "submit",
					className: "w-full min-h-[48px] rounded-full bg-[#2A8CFF] hover:bg-[#1B7CEE] text-white font-display font-bold text-base shadow-[0_4px_0_#1561C0] active:translate-y-[1px] transition-all flex items-center justify-center gap-2 cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Save Profile" })]
				})
			]
		})
	});
};
// src/components/RewardVideoAdModal.tsx
var AD_DURATION_SECONDS = 8;
var RewardVideoAdModal = ({ placement, t, onUserEarnedReward, onCancel }) => {
	const [secondsLeft, setSecondsLeft] = (0, import_react.useState)(AD_DURATION_SECONDS);
	const [muted, setMuted] = (0, import_react.useState)(false);
	const isOpen = placement !== null;
	(0, import_react.useEffect)(() => {
		if (!isOpen) {
			setSecondsLeft(AD_DURATION_SECONDS);
			return;
		}
		setSecondsLeft(AD_DURATION_SECONDS);
		const interval = window.setInterval(() => {
			setSecondsLeft((prev) => {
				if (prev <= 1) {
					window.clearInterval(interval);
					return 0;
				}
				return prev - 1;
			});
		}, 1e3);
		return () => window.clearInterval(interval);
	}, [isOpen]);
	if (!placement) return null;
	const isRewardReady = secondsLeft === 0;
	const progressPct = (AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS * 100;
	let headingText = "+100 Free Coins";
	let badgeText = `+100 Coins`;
	let claimText = "Claim +100 Free Coins";
	if (placement.kind === "free-coins") {
		headingText = `Watch & Earn +${placement.coins} Free Coins`;
		badgeText = `+${placement.coins} Coins`;
		claimText = `Claim +${placement.coins} Coins`;
	} else if (placement.kind === "double-round") {
		headingText = "2x Round Coins & Points";
		badgeText = `+${placement.baseCoins} Coins · +${placement.basePoints} Pts`;
		claimText = `Claim 2x (+${placement.baseCoins} Coins & +${placement.basePoints} Pts)`;
	} else if (placement.kind === "save-streak") {
		headingText = "Save Your Streak Free!";
		badgeText = "Streak Protected · Continue Round";
		claimText = "Continue Without Losing Streak";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-labelledby": "reward-video-title",
		"data-ad-provider": "google-admob",
		"data-ad-app-id": ADMOB_CONFIG.appId,
		"data-ad-unit-id": ADMOB_CONFIG.rewardedAdUnitId,
		className: "fixed inset-0 z-50 bg-[#0F1E3D]/80 backdrop-blur-xs flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white rounded-[30px] max-w-md w-full overflow-hidden shadow-[0_24px_60px_rgba(15,30,61,0.45)] border-2 border-white",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-[#14274E] text-white px-4 py-3 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "px-2 py-0.5 rounded-md bg-[#FFE675] text-[#14274E] text-[11px] font-extrabold",
							children: t.adBannerLabel
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs font-bold text-sky-100 truncate",
							children: isRewardReady ? t.rewardAdUnlockedTitle : t.rewardAdCountdown.replace("{sec}", String(secondsLeft))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setMuted((m) => !m),
							"aria-label": muted ? t.soundOn : t.soundOff,
							className: "w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer",
							children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "w-4 h-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-4 h-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onCancel,
							"aria-label": t.closeLabel,
							className: "w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "w-4 h-4" })
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative bg-gradient-to-br from-[#2B8CFF] via-[#5FB3FF] to-[#FFE675] p-5 text-center text-[#14274E]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-white/95 rounded-2xl p-4 shadow-md border border-white space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-14 h-14 mx-auto rounded-full bg-[#FFE675] border-2 border-[#F5B935] flex items-center justify-center shadow-xs",
								children: isRewardReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-7 h-7 text-[#B45309]" }) : placement.kind === "save-streak" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "w-7 h-7 text-[#EA580C] fill-[#FB923C]" }) : placement.kind === "double-round" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "w-7 h-7 text-[#B45309]" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "w-7 h-7 text-[#14274E] fill-[#14274E] ms-0.5" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "reward-video-title",
								className: "font-display text-lg sm:text-xl font-extrabold text-[#14274E]",
								children: headingText
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs sm:text-sm text-[#47608B] font-medium",
								children: t.rewardAdSponsor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-2 inline-flex items-center gap-2 bg-[#FFF8D6] border border-[#F3D877] rounded-full px-4 py-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, { className: "w-5 h-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-display text-xs sm:text-sm font-extrabold text-[#7A5400] tabular-nums",
									children: badgeText
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 w-full h-2.5 rounded-full bg-white/45 overflow-hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-full bg-[#14274E] rounded-full transition-all duration-1000 ease-linear",
							style: { width: `${progressPct}%` }
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 bg-white flex flex-col gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						disabled: !isRewardReady,
						onClick: onUserEarnedReward,
						className: `w-full min-h-[48px] px-5 py-2.5 rounded-full font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${isRewardReady ? "bg-[#49C946] hover:bg-[#3FB83C] text-white shadow-[0_4px_0_#238820] active:translate-y-[1px] cursor-pointer" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldCoinIcon, {
							className: "w-5 h-5",
							dimmed: !isRewardReady
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: isRewardReady ? claimText : t.rewardAdCountdown.replace("{sec}", String(secondsLeft)) })]
					}), !isRewardReady && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onCancel,
						className: "w-full py-2 text-xs font-bold text-[#5C7299] hover:text-[#14274E] cursor-pointer",
						children: t.rewardAdCancel
					})]
				})
			]
		})
	});
};
// src/App.tsx
var STORAGE_KEYS = {
	lang: "sunbeam_lang_v1",
	savedVerses: "sunbeam_saved_verses_v2",
	seenVerses: "sunbeam_seen_verses_v1",
	askedQuestions: "sunbeam_asked_questions_v1",
	settings: "sunbeam_settings_v1",
	stats: "sunbeam_stats_v1",
	profile: "sunbeam_profile_v1",
	unlockedCategories: "sunbeam_unlocked_categories_v1",
	activeCategory: "sunbeam_active_category_v1",
	unlockedTreasury: "sunbeam_unlocked_treasury_v1"
};
var DEFAULT_SETTINGS = {
	ageGroup: "adults",
	bookFilter: "all",
	voiceGender: "female",
	voicePitch: VOICE_PRESETS.female.pitch,
	voiceSpeed: VOICE_PRESETS.female.rate,
	soundEnabled: true
};
var DEFAULT_STATS = {
	totalCoins: 50,
	totalScore: 0,
	weeklyScore: 0,
	bestStreak: 0,
	currentCorrectStreak: 0,
	perfectRounds: 0,
	quizzesCompleted: 0,
	streakDays: 1,
	lastPlayedDate: null
};
var DEFAULT_PROFILE = {
	displayName: "Bible Pilgrim",
	avatarId: "dove",
	isCustomized: false
};
function loadJson(key, fallback) {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw);
	} catch {
		return fallback;
	}
}
function loadInitialSettings() {
	const base = loadJson(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
	try {
		const storedBook = localStorage.getItem("selectedBook");
		const storedVoice = localStorage.getItem("voiceGender");
		const resolvedGender = storedVoice === "female" || storedVoice === "male" || storedVoice === "teen" || storedVoice === "kids" ? storedVoice : base.voiceGender;
		const preset = VOICE_PRESETS[resolvedGender] || VOICE_PRESETS.female;
		const clampedPitch = typeof base.voicePitch === "number" && base.voicePitch >= .7 && base.voicePitch <= 1.85 ? base.voicePitch : preset.pitch;
		const clampedSpeed = typeof base.voiceSpeed === "number" && base.voiceSpeed >= .7 && base.voiceSpeed <= 1.3 ? base.voiceSpeed : preset.rate;
		return {
			...base,
			bookFilter: storedBook ? storedBook : base.bookFilter,
			voiceGender: resolvedGender,
			voicePitch: clampedPitch,
			voiceSpeed: clampedSpeed
		};
	} catch {
		return base;
	}
}
function loadStats() {
	try {
		const raw = localStorage.getItem(STORAGE_KEYS.stats);
		if (!raw) return DEFAULT_STATS;
		const parsed = JSON.parse(raw);
		return {
			totalCoins: typeof parsed.totalCoins === "number" ? parsed.totalCoins : typeof parsed.totalStars === "number" ? parsed.totalStars * 10 : DEFAULT_STATS.totalCoins,
			totalScore: typeof parsed.totalScore === "number" ? parsed.totalScore : DEFAULT_STATS.totalScore,
			weeklyScore: typeof parsed.weeklyScore === "number" ? parsed.weeklyScore : DEFAULT_STATS.weeklyScore,
			bestStreak: typeof parsed.bestStreak === "number" ? parsed.bestStreak : DEFAULT_STATS.bestStreak,
			currentCorrectStreak: typeof parsed.currentCorrectStreak === "number" ? parsed.currentCorrectStreak : DEFAULT_STATS.currentCorrectStreak,
			perfectRounds: typeof parsed.perfectRounds === "number" ? parsed.perfectRounds : DEFAULT_STATS.perfectRounds,
			quizzesCompleted: typeof parsed.quizzesCompleted === "number" ? parsed.quizzesCompleted : DEFAULT_STATS.quizzesCompleted,
			streakDays: typeof parsed.streakDays === "number" ? parsed.streakDays : DEFAULT_STATS.streakDays,
			lastPlayedDate: parsed.lastPlayedDate ?? null
		};
	} catch {
		return DEFAULT_STATS;
	}
}
function loadUnlockedCategories() {
	const saved = loadJson(STORAGE_KEYS.unlockedCategories, FREE_CATEGORY_IDS);
	const merged = /* @__PURE__ */ new Set([...FREE_CATEGORY_IDS, ...saved]);
	return Array.from(merged);
}
function getStarterVerseItem(index, lang) {
	const safe = BIBLE_VERSES[index] || BIBLE_VERSES[0];
	const content = safe.translations[lang];
	const bookMeta = BIBLE_BOOKS.find((b) => b.name.toLowerCase() === safe.book.toLowerCase()) || BIBLE_BOOKS[42];
	const refParts = content.reference.match(/(\d+)[:,](\d+)/);
	const chapter = refParts ? parseInt(refParts[1], 10) : 3;
	const verse = refParts ? parseInt(refParts[2], 10) : 16;
	return {
		id: `${bookMeta.id}:${chapter}:${verse}`,
		bookId: bookMeta.id,
		bookName: bookMeta.name,
		chapter,
		verse,
		reference: content.reference,
		highlightPrefix: content.highlightPrefix,
		text: content.text,
		version: content.version,
		themes: content.themes,
		lang
	};
}
function mapThemeToIllustration(theme) {
	const validTheme = theme === "noah" || theme === "david" || theme === "whale" || theme === "shepherd" ? theme : "bible";
	return {
		storyTheme: validTheme,
		alt: STORY_THEME_META[validTheme].alt
	};
}
var VALID_LANGS = /* @__PURE__ */ new Set([
	"en",
	"it",
	"sw",
	"fr",
	"es",
	"pt",
	"de",
	"ar",
	"hi",
	"zh"
]);
function loadLang() {
	const saved = loadJson(STORAGE_KEYS.lang, "en");
	return VALID_LANGS.has(saved) ? saved : "en";
}
function App() {
	const [lang, setLang] = (0, import_react.useState)(() => loadLang());
	const [screen, setScreen] = (0, import_react.useState)("onboarding");
	const [previousTab, setPreviousTab] = (0, import_react.useState)("home");
	const [activeTab, setActiveTab] = (0, import_react.useState)("home");
	const [currentVerse, setCurrentVerse] = (0, import_react.useState)(() => getStarterVerseItem(0, loadLang()));
	const [verseHistory, setVerseHistory] = (0, import_react.useState)([]);
	const [seenVerses, setSeenVerses] = (0, import_react.useState)(() => loadJson(STORAGE_KEYS.seenVerses, ["43:3:16"]));
	const [isVerseLoading, setIsVerseLoading] = (0, import_react.useState)(false);
	const [isAutoNextPaused, setIsAutoNextPaused] = (0, import_react.useState)(false);
	const [verseTimerResetToken, setVerseTimerResetToken] = (0, import_react.useState)(0);
	const [savedVerses, setSavedVerses] = (0, import_react.useState)(() => loadJson(STORAGE_KEYS.savedVerses, [getStarterVerseItem(0, loadLang()), getStarterVerseItem(1, loadLang())]));
	const [settings, setSettings] = (0, import_react.useState)(() => loadInitialSettings());
	const [stats, setStats] = (0, import_react.useState)(() => loadStats());
	const [playerProfile, setPlayerProfile] = (0, import_react.useState)(() => loadJson(STORAGE_KEYS.profile, DEFAULT_PROFILE));
	const [isProfileModalOpen, setIsProfileModalOpen] = (0, import_react.useState)(false);
	const [isFirstLaunchPrompt, setIsFirstLaunchPrompt] = (0, import_react.useState)(false);
	const [unlockedCategories, setUnlockedCategories] = (0, import_react.useState)(() => loadUnlockedCategories());
	const [activeCategoryId, setActiveCategoryId] = (0, import_react.useState)(() => loadJson(STORAGE_KEYS.activeCategory, "genesis-creation"));
	const [useCustomBookFilter, setUseCustomBookFilter] = (0, import_react.useState)(() => settings.bookFilter !== "all");
	const [unlockedTreasuryIds, setUnlockedTreasuryIds] = (0, import_react.useState)(() => loadJson(STORAGE_KEYS.unlockedTreasury, []));
	const [askedQuestions, setAskedQuestions] = (0, import_react.useState)(() => loadJson(STORAGE_KEYS.askedQuestions, []));
	const [quizDeck, setQuizDeck] = (0, import_react.useState)([]);
	const [isQuizLoading, setIsQuizLoading] = (0, import_react.useState)(false);
	const [quizError, setQuizError] = (0, import_react.useState)(null);
	const [isQuizRoundOver, setIsQuizRoundOver] = (0, import_react.useState)(false);
	const [pendingRewardAd, setPendingRewardAd] = (0, import_react.useState)(null);
	const [roundCoinsDoubled, setRoundCoinsDoubled] = (0, import_react.useState)(false);
	const [saveStreakGrantToken, setSaveStreakGrantToken] = (0, import_react.useState)(0);
	const [isSpeaking, setIsSpeaking] = (0, import_react.useState)(false);
	const [toast, setToast] = (0, import_react.useState)(null);
	const quizRequestSeqRef = (0, import_react.useRef)(0);
	const quizAbortRef = (0, import_react.useRef)(null);
	const totalCoinsRef = (0, import_react.useRef)(stats.totalCoins);
	const t = TRANSLATIONS[lang];
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.lang, JSON.stringify(lang));
		} catch {}
	}, [lang]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		getSavedVersesFromIDB().then((idbSaved) => {
			if (cancelled || idbSaved.length === 0) return;
			setSavedVerses((prev) => {
				if (prev.length === 0) return idbSaved;
				const existingIds = new Set(prev.map((v) => v.id));
				const missingFromLocal = idbSaved.filter((v) => !existingIds.has(v.id));
				return missingFromLocal.length > 0 ? [...prev, ...missingFromLocal] : prev;
			});
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		recordViewedVerse(currentVerse);
	}, [currentVerse]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.savedVerses, JSON.stringify(savedVerses));
		} catch {}
		syncSavedVersesToIDB(savedVerses);
	}, [savedVerses]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.seenVerses, JSON.stringify(seenVerses));
		} catch {}
	}, [seenVerses]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.askedQuestions, JSON.stringify(askedQuestions));
		} catch {}
	}, [askedQuestions]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
			localStorage.setItem("selectedBook", settings.bookFilter);
			localStorage.setItem("voiceGender", settings.voiceGender);
		} catch {}
	}, [settings]);
	(0, import_react.useEffect)(() => {
		totalCoinsRef.current = stats.totalCoins;
		try {
			localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(stats));
		} catch {}
	}, [stats]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(playerProfile));
		} catch {}
	}, [playerProfile]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.unlockedCategories, JSON.stringify(unlockedCategories));
		} catch {}
	}, [unlockedCategories]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.activeCategory, JSON.stringify(activeCategoryId));
		} catch {}
	}, [activeCategoryId]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.unlockedTreasury, JSON.stringify(unlockedTreasuryIds));
		} catch {}
	}, [unlockedTreasuryIds]);
	(0, import_react.useEffect)(() => {
		if (!toast) return;
		const id = window.setTimeout(() => setToast(null), 2600);
		return () => window.clearTimeout(id);
	}, [toast]);
	(0, import_react.useEffect)(() => {
		return () => {
			quizAbortRef.current?.abort();
		};
	}, []);
	const showToast = (0, import_react.useCallback)((message) => {
		setToast(message);
	}, []);
	const handleStopAndSpeak = (0, import_react.useCallback)((text) => {
		if (isSpeaking) {
			stopSpeaking();
			setIsSpeaking(false);
		} else {
			setIsSpeaking(true);
			speakText(text, lang, settings.voiceGender, () => setIsSpeaking(false), {
				pitch: settings.voicePitch,
				rate: settings.voiceSpeed
			});
		}
	}, [
		isSpeaking,
		lang,
		settings.voiceGender,
		settings.voicePitch,
		settings.voiceSpeed
	]);
	const handleStartQuizSpeech = (0, import_react.useCallback)((text, onDone) => {
		setIsSpeaking(true);
		speakText(text, lang, settings.voiceGender, () => {
			setIsSpeaking(false);
			onDone?.();
		}, {
			pitch: settings.voicePitch,
			rate: settings.voiceSpeed
		});
	}, [
		lang,
		settings.voiceGender,
		settings.voicePitch,
		settings.voiceSpeed
	]);
	const handleStopSpeech = (0, import_react.useCallback)(() => {
		stopSpeaking();
		setIsSpeaking(false);
	}, []);
	const fetchGeminiQuizRound = (0, import_react.useCallback)(async (targetLang, targetSettings, excludeQuestions, categoryId) => {
		if (quizAbortRef.current) quizAbortRef.current.abort();
		const controller = new AbortController();
		quizAbortRef.current = controller;
		const reqId = ++quizRequestSeqRef.current;
		setIsQuizLoading(true);
		setQuizError(null);
		setIsQuizRoundOver(false);
		setQuizDeck([]);
		const MAX_RETRIES = 3;
		const BASE_DELAY_MS = 800;
		const waitWithAbort = (ms, signal) => new Promise((resolve, reject) => {
			if (signal.aborted) {
				reject(new DOMException("Aborted", "AbortError"));
				return;
			}
			const onAbort = () => {
				window.clearTimeout(timer);
				reject(new DOMException("Aborted", "AbortError"));
			};
			const timer = window.setTimeout(() => {
				signal.removeEventListener("abort", onAbort);
				resolve();
			}, ms);
			signal.addEventListener("abort", onAbort, { once: true });
		});
		const isNonTransientError = (status, message) => {
			if (/GEMINI_API_KEY is not set|API_KEY_INVALID|PERMISSION_DENIED/i.test(message)) return true;
			return status === 400 || status === 401 || status === 403 || status === 404 || status === 422;
		};
		try {
			let lastErrorMessage = "Unable to reach quiz service.";
			for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
				if (controller.signal.aborted || reqId !== quizRequestSeqRef.current) return;
				let retryAfterMs = null;
				let shouldRetry = false;
				try {
					const resp = await fetch("/api/quiz/generate", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							lang: targetLang,
							ageGroup: targetSettings.ageGroup,
							bookFilter: categoryId ? "all" : targetSettings.bookFilter,
							categoryId,
							askedQuestions: excludeQuestions
						}),
						signal: controller.signal
					});
					const retryAfterHeader = resp.headers.get("Retry-After");
					if (retryAfterHeader && /^\d+$/.test(retryAfterHeader.trim())) retryAfterMs = Math.min(1e4, parseInt(retryAfterHeader.trim(), 10) * 1e3);
					const rawBody = await resp.text();
					let data = {};
					try {
						data = rawBody ? JSON.parse(rawBody) : {};
					} catch {
						const parseMessage = resp.ok ? "Invalid response format from quiz generator." : `Quiz request failed (${resp.status}).`;
						const err = new Error(parseMessage);
						err.status = resp.status;
						err.retryable = !isNonTransientError(resp.status, parseMessage);
						throw err;
					}
					if (reqId !== quizRequestSeqRef.current) return;
					if (!resp.ok || !Array.isArray(data.questions) || data.questions.length === 0) {
						const apiMessage = data.error || "Could not generate quiz questions.";
						const err = new Error(apiMessage);
						err.status = resp.status;
						err.retryable = !isNonTransientError(resp.status, apiMessage);
						throw err;
					}
					const mapped = data.questions.map((q) => {
						const art = mapThemeToIllustration(q.storyTheme);
						return {
							id: q.id,
							question: q.question,
							options: q.options,
							correctIndex: q.correctIndex,
							reference: q.reference,
							storyTheme: art.storyTheme,
							illustrationAlt: art.alt
						};
					});
					setRoundCoinsDoubled(false);
					setQuizDeck(mapped);
					return;
				} catch (err) {
					if (err instanceof DOMException && err.name === "AbortError") return;
					if (reqId !== quizRequestSeqRef.current) return;
					const typedErr = err;
					lastErrorMessage = typedErr instanceof Error ? typedErr.message : "Unable to reach quiz service.";
					shouldRetry = typedErr.retryable !== false;
				}
				if (!shouldRetry || attempt === MAX_RETRIES) {
					setQuizDeck([]);
					setQuizError(lastErrorMessage);
					return;
				}
				const exponentialMs = BASE_DELAY_MS * Math.pow(2, attempt);
				const jitterMs = Math.floor(Math.random() * 250);
				await waitWithAbort(retryAfterMs ?? exponentialMs + jitterMs, controller.signal);
			}
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			if (reqId !== quizRequestSeqRef.current) return;
			const message = err instanceof Error ? err.message : "Unable to reach quiz service.";
			setQuizDeck([]);
			setQuizError(message);
		} finally {
			if (reqId === quizRequestSeqRef.current) setIsQuizLoading(false);
		}
	}, []);
	const handleSelectLanguage = async (chosen) => {
		stopSpeaking();
		setIsSpeaking(false);
		playChime("tap", settings.soundEnabled);
		if (quizAbortRef.current) quizAbortRef.current.abort();
		quizRequestSeqRef.current += 1;
		setIsQuizLoading(false);
		setQuizDeck([]);
		setQuizError(null);
		setLang(chosen);
		setScreen("main");
		setActiveTab("home");
		if (!playerProfile.isCustomized) {
			setIsFirstLaunchPrompt(true);
			setIsProfileModalOpen(true);
		}
		const starterIdx = BIBLE_VERSES.findIndex((v) => {
			return getStarterVerseItem(BIBLE_VERSES.indexOf(v), lang).id === currentVerse.id;
		});
		if (starterIdx >= 0) setCurrentVerse(getStarterVerseItem(starterIdx, chosen));
		else {
			setIsVerseLoading(true);
			try {
				const resp = await fetch(`/api/bible/verse?book=${currentVerse.bookId}&chapter=${currentVerse.chapter}&verse=${currentVerse.verse}&lang=${chosen}`);
				if (resp.ok) {
					const updated = await resp.json();
					if (updated.text) setCurrentVerse(updated);
				}
			} catch {} finally {
				setIsVerseLoading(false);
			}
		}
	};
	const handleSelectTab = (tab) => {
		stopSpeaking();
		setIsSpeaking(false);
		playChime("tap", settings.soundEnabled);
		setScreen("main");
		setActiveTab(tab);
		if (tab === "quiz" && quizDeck.length === 0 && !isQuizLoading) fetchGeminiQuizRound(lang, settings, askedQuestions, useCustomBookFilter ? void 0 : activeCategoryId);
	};
	const handleLaunchCategoryQuiz = (category) => {
		stopSpeaking();
		setIsSpeaking(false);
		playChime("tap", settings.soundEnabled);
		setActiveCategoryId(category.id);
		setUseCustomBookFilter(false);
		const nextSettings = {
			...settings,
			bookFilter: "all"
		};
		setSettings(nextSettings);
		setRoundCoinsDoubled(false);
		setIsQuizRoundOver(false);
		setScreen("main");
		setActiveTab("quiz");
		fetchGeminiQuizRound(lang, nextSettings, askedQuestions, category.id);
	};
	const handleUnlockCategory = (category) => {
		if (unlockedCategories.includes(category.id)) {
			handleLaunchCategoryQuiz(category);
			return;
		}
		if (totalCoinsRef.current < category.unlockCost) {
			showToast(`Need ${category.unlockCost} coins to unlock ${category.title}. Watch a video for +100 free coins!`);
			return;
		}
		totalCoinsRef.current -= category.unlockCost;
		setStats((prev) => ({
			...prev,
			totalCoins: Math.max(0, prev.totalCoins - category.unlockCost)
		}));
		setUnlockedCategories((prev) => prev.includes(category.id) ? prev : [...prev, category.id]);
		playChime("complete", settings.soundEnabled);
		showToast(`Unlocked ${category.title}!`);
		handleLaunchCategoryQuiz(category);
	};
	const handleUnlockTreasuryCard = (card) => {
		if (unlockedTreasuryIds.includes(card.id)) return;
		if (totalCoinsRef.current < card.unlockCost) {
			showToast(`Need ${card.unlockCost} coins to unlock ${card.reference}.`);
			return;
		}
		totalCoinsRef.current -= card.unlockCost;
		setStats((prev) => ({
			...prev,
			totalCoins: Math.max(0, prev.totalCoins - card.unlockCost)
		}));
		setUnlockedTreasuryIds((prev) => prev.includes(card.id) ? prev : [...prev, card.id]);
		playChime("complete", settings.soundEnabled);
		showToast(`${card.reference} unlocked in your Scripture Treasury!`);
	};
	const navigateToVerse = (0, import_react.useCallback)((nextVerse) => {
		stopSpeaking();
		setIsSpeaking(false);
		setVerseTimerResetToken((n) => n + 1);
		setCurrentVerse((prev) => {
			if (nextVerse.id === prev.id) return prev;
			setVerseHistory((hist) => [...hist, prev]);
			setSeenVerses((seen) => seen.includes(nextVerse.id) ? seen : [...seen, nextVerse.id]);
			return nextVerse;
		});
	}, []);
	const handlePrevVerse = () => {
		stopSpeaking();
		setIsSpeaking(false);
		playChime("tap", settings.soundEnabled);
		setVerseTimerResetToken((n) => n + 1);
		if (verseHistory.length > 0) {
			const realPrevious = verseHistory[verseHistory.length - 1];
			setVerseHistory((prev) => prev.slice(0, -1));
			setCurrentVerse(realPrevious);
		} else {
			const fallbackIdx = (BIBLE_VERSES.findIndex((_, i) => getStarterVerseItem(i, lang).id === currentVerse.id) - 1 + BIBLE_VERSES.length) % BIBLE_VERSES.length;
			setCurrentVerse(getStarterVerseItem(fallbackIdx, lang));
		}
	};
	const handleRandomVerse = (0, import_react.useCallback)(async (silent = false) => {
		stopSpeaking();
		setIsSpeaking(false);
		if (!silent) playChime("tap", settings.soundEnabled);
		setVerseTimerResetToken((n) => n + 1);
		setIsVerseLoading(true);
		try {
			if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("Offline mode");
			const randomBook = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
			const randomChapter = Math.floor(Math.random() * randomBook.chapters) + 1;
			const resp = await fetch(`/api/bible/verse?book=${randomBook.id}&chapter=${randomChapter}&lang=${encodeURIComponent(lang)}&random=1&seen=${encodeURIComponent(seenVerses.slice(-50).join(","))}`);
			const data = await resp.json();
			if (!resp.ok || !data.text) throw new Error(data.error || "Could not load random verse.");
			if (seenVerses.includes(data.id)) {
				const retryBook = BIBLE_BOOKS[Math.floor(Math.random() * BIBLE_BOOKS.length)];
				const retryChapter = Math.floor(Math.random() * retryBook.chapters) + 1;
				const retryResp = await fetch(`/api/bible/verse?book=${retryBook.id}&chapter=${retryChapter}&lang=${encodeURIComponent(lang)}&random=1&seen=${encodeURIComponent(seenVerses.slice(-50).join(","))}`);
				const retryData = await retryResp.json();
				if (retryResp.ok && retryData.text) {
					navigateToVerse(retryData);
					return;
				}
			}
			navigateToVerse(data);
		} catch {
			const cachedViewed = await getViewedVerses(50);
			const starterItems = BIBLE_VERSES.map((_, idx) => getStarterVerseItem(idx, lang));
			const combinedPoolMap = /* @__PURE__ */ new Map();
			for (const v of [
				...cachedViewed,
				...savedVerses,
				...starterItems
			]) if (!combinedPoolMap.has(v.id)) combinedPoolMap.set(v.id, v);
			const candidates = Array.from(combinedPoolMap.values()).filter((item) => item.id !== currentVerse.id);
			const sameLang = candidates.filter((item) => item.lang === lang);
			const pool = sameLang.length > 0 ? sameLang : candidates;
			const picked = pool[Math.floor(Math.random() * pool.length)];
			if (picked) navigateToVerse(picked);
		} finally {
			setIsVerseLoading(false);
		}
	}, [
		currentVerse.id,
		lang,
		navigateToVerse,
		savedVerses,
		seenVerses,
		settings.soundEnabled
	]);
	const handleCopyVerse = async (verse) => {
		const formatted = `"${verse.text}" — ${verse.reference} (${verse.version})`;
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(formatted);
		} catch {}
		showToast(t.copiedToast);
	};
	const handleShareVerse = async (verse) => {
		const formatted = `"${verse.text}" — ${verse.reference}`;
		if (navigator.share) try {
			await navigator.share({
				title: verse.reference,
				text: formatted
			});
			return;
		} catch {}
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(formatted);
		} catch {}
		showToast(t.sharedToast);
	};
	const handleToggleBookmark = (verse) => {
		setSavedVerses((prev) => {
			if (prev.some((v) => v.id === verse.id)) {
				showToast(t.removedToast);
				return prev.filter((v) => v.id !== verse.id);
			} else {
				playChime("tap", settings.soundEnabled);
				showToast(t.bookmarkedToast);
				return [verse, ...prev];
			}
		});
	};
	const handlePlaySound = (0, import_react.useCallback)((kind) => {
		playChime(kind, settings.soundEnabled);
	}, [settings.soundEnabled]);
	const handleQuestionPlayed = (0, import_react.useCallback)((questionText) => {
		setAskedQuestions((prev) => prev.includes(questionText) ? prev : [...prev.slice(-99), questionText]);
	}, []);
	const handleSpendCoins = (0, import_react.useCallback)((amount, reasonToast) => {
		if (totalCoinsRef.current < amount) {
			showToast(t.notEnoughCoinsToast);
			return false;
		}
		totalCoinsRef.current -= amount;
		setStats((prev) => ({
			...prev,
			totalCoins: Math.max(0, prev.totalCoins - amount)
		}));
		showToast(reasonToast);
		return true;
	}, [showToast, t.notEnoughCoinsToast]);
	const handleAnswerOutcome = (0, import_react.useCallback)((isCorrect) => {
		setStats((prev) => {
			if (isCorrect) {
				const nextCorrectStreak = prev.currentCorrectStreak + 1;
				return {
					...prev,
					currentCorrectStreak: nextCorrectStreak,
					bestStreak: Math.max(prev.bestStreak, nextCorrectStreak)
				};
			}
			return {
				...prev,
				currentCorrectStreak: 0
			};
		});
	}, []);
	const handleFinishRound = (0, import_react.useCallback)((_correctCount, coinsEarned, pointsEarned, isPerfect) => {
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		totalCoinsRef.current += coinsEarned;
		setStats((prev) => {
			const nextDayStreak = prev.lastPlayedDate === today ? prev.streakDays : prev.lastPlayedDate ? prev.streakDays + 1 : 1;
			return {
				...prev,
				totalCoins: prev.totalCoins + coinsEarned,
				totalScore: prev.totalScore + pointsEarned,
				weeklyScore: prev.weeklyScore + pointsEarned,
				perfectRounds: prev.perfectRounds + (isPerfect ? 1 : 0),
				quizzesCompleted: prev.quizzesCompleted + 1,
				streakDays: Math.max(1, nextDayStreak),
				lastPlayedDate: today
			};
		});
	}, []);
	const applyRewardedAdOutcome = (0, import_react.useCallback)((placement) => {
		if (placement.kind === "free-coins") {
			totalCoinsRef.current += placement.coins;
			setStats((prev) => ({
				...prev,
				totalCoins: prev.totalCoins + placement.coins
			}));
			playChime("complete", settings.soundEnabled);
			showToast(`+${placement.coins} Free Coins added!`);
			return;
		}
		if (placement.kind === "double-round") {
			if (roundCoinsDoubled) return;
			totalCoinsRef.current += placement.baseCoins;
			setStats((prev) => ({
				...prev,
				totalCoins: prev.totalCoins + placement.baseCoins,
				totalScore: prev.totalScore + placement.basePoints,
				weeklyScore: prev.weeklyScore + placement.basePoints
			}));
			setRoundCoinsDoubled(true);
			playChime("complete", settings.soundEnabled);
			showToast(`2x Bonus! +${placement.baseCoins} coins & +${placement.basePoints} pts`);
			return;
		}
		if (placement.kind === "save-streak") {
			setSaveStreakGrantToken((n) => n + 1);
			playChime("complete", settings.soundEnabled);
			showToast("Streak saved! Continue answering.");
		}
	}, [
		roundCoinsDoubled,
		settings.soundEnabled,
		showToast
	]);
	const triggerRewardedAd = (0, import_react.useCallback)(async (placement) => {
		stopSpeaking();
		setIsSpeaking(false);
		const nativeOutcome = await tryShowNativeRewardedAd();
		if (nativeOutcome === "rewarded") {
			applyRewardedAdOutcome(placement);
			return;
		}
		if (nativeOutcome === "dismissed") {
			showToast("Watch the full video to claim your reward.");
			return;
		}
		setPendingRewardAd(placement);
	}, [applyRewardedAdOutcome, showToast]);
	const handleStartNewRound = () => {
		stopSpeaking();
		setIsSpeaking(false);
		fetchGeminiQuizRound(lang, settings, askedQuestions, useCustomBookFilter ? void 0 : activeCategoryId);
	};
	const handleOpenSettings = () => {
		stopSpeaking();
		setIsSpeaking(false);
		setPreviousTab(activeTab);
		setScreen("settings");
	};
	const handleSaveSettings = (nextSettings) => {
		stopSpeaking();
		try {
			localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(nextSettings));
			localStorage.setItem("selectedBook", nextSettings.bookFilter);
			localStorage.setItem("voiceGender", nextSettings.voiceGender);
		} catch {}
		const customBookChosen = nextSettings.bookFilter !== "all";
		setUseCustomBookFilter(customBookChosen);
		setQuizDeck([]);
		setQuizError(null);
		setRoundCoinsDoubled(false);
		setIsQuizRoundOver(false);
		setSettings(nextSettings);
		showToast(t.settingsSavedToast);
		setIsSpeaking(true);
		speakText(t.settingsSavedToast, lang, nextSettings.voiceGender, () => setIsSpeaking(false), {
			pitch: nextSettings.voicePitch,
			rate: nextSettings.voiceSpeed
		});
		setScreen("main");
		const destTab = previousTab === "profile" ? "profile" : "quiz";
		setActiveTab(destTab);
		if (destTab === "quiz") fetchGeminiQuizRound(lang, nextSettings, askedQuestions, customBookChosen ? void 0 : activeCategoryId);
	};
	const handlePreviewVoice = (draftSettings) => {
		setIsSpeaking(true);
		speakText(t.voiceUpdatedSample, lang, draftSettings.voiceGender, () => setIsSpeaking(false), {
			pitch: draftSettings.voicePitch,
			rate: draftSettings.voiceSpeed
		});
	};
	const showMeadow = screen === "settings" || screen === "main" && activeTab === "quiz";
	const isActiveQuizGameplay = screen === "main" && activeTab === "quiz" && !isQuizRoundOver;
	const activeCategoryTitle = useCustomBookFilter ? settings.bookFilter === "all" ? t.bookNames.all : settings.bookFilter : getQuizCategoryById(activeCategoryId)?.title ?? "Bible Quiz";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-screen overflow-hidden flex flex-col select-none",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyBackdrop, { showMeadow }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OfflineIndicator, {}),
			screen !== "onboarding" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TopBar, {
				profile: playerProfile,
				stats,
				onOpenProfileModal: () => {
					setIsFirstLaunchPrompt(false);
					setIsProfileModalOpen(true);
				},
				onOpenLeaderboard: () => handleSelectTab("leaderboard")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden",
				children: [
					screen === "onboarding" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingScreen, {
						currentLang: lang,
						onSelectLanguage: handleSelectLanguage,
						t
					}),
					screen === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, {
						settings,
						onSaveSettings: handleSaveSettings,
						onPreviewVoice: handlePreviewVoice,
						onBack: () => {
							stopSpeaking();
							setIsSpeaking(false);
							setScreen("main");
						},
						lang,
						t
					}),
					screen === "main" && activeTab === "home" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeScreen, {
						currentVerse,
						isVerseLoading,
						isAutoPaused: isAutoNextPaused,
						timerResetToken: verseTimerResetToken,
						onToggleAutoPaused: () => setIsAutoNextPaused((prev) => !prev),
						onSelectVerse: navigateToVerse,
						onPrevVerse: handlePrevVerse,
						onRandomVerse: handleRandomVerse,
						onCopyVerse: handleCopyVerse,
						onShareVerse: handleShareVerse,
						onToggleBookmark: handleToggleBookmark,
						onToggleSpeak: handleStopAndSpeak,
						onGoToCategories: () => handleSelectTab("categories"),
						onGoToLeaderboard: () => handleSelectTab("leaderboard"),
						onWatchFreeCoinsAd: () => void triggerRewardedAd({
							kind: "free-coins",
							coins: 100
						}),
						isSpeaking,
						savedIds: savedVerses.map((v) => v.id),
						lang,
						t
					}),
					screen === "main" && activeTab === "categories" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategorySelectScreen, {
						unlockedCategories,
						activeCategoryId,
						totalCoins: stats.totalCoins,
						onSelectAndPlay: handleLaunchCategoryQuiz,
						onUnlockCategory: handleUnlockCategory,
						onWatchFreeCoinsAd: () => void triggerRewardedAd({
							kind: "free-coins",
							coins: 100
						})
					}),
					screen === "main" && activeTab === "quiz" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuizScreen, {
						questions: quizDeck,
						isLoading: isQuizLoading,
						errorMessage: quizError,
						categoryTitle: activeCategoryTitle,
						totalCoins: stats.totalCoins,
						currentStreak: stats.currentCorrectStreak,
						lang,
						t,
						isSpeaking,
						saveStreakGrantToken,
						onStartQuizSpeech: handleStartQuizSpeech,
						onStopSpeech: handleStopSpeech,
						onPlaySound: handlePlaySound,
						onQuestionPlayed: handleQuestionPlayed,
						onSpendCoins: handleSpendCoins,
						onAnswerOutcome: handleAnswerOutcome,
						onFinishRound: handleFinishRound,
						onRoundOverChange: setIsQuizRoundOver,
						onStartNewRound: handleStartNewRound,
						onOpenCategories: () => handleSelectTab("categories"),
						onOpenSettings: handleOpenSettings,
						onWatchDoubleRoundAd: (baseCoins, basePoints) => {
							if (!roundCoinsDoubled && baseCoins > 0) triggerRewardedAd({
								kind: "double-round",
								baseCoins,
								basePoints
							});
						},
						onWatchSaveStreakAd: () => void triggerRewardedAd({ kind: "save-streak" }),
						coinsDoubledForRound: roundCoinsDoubled
					}),
					screen === "main" && activeTab === "treasury" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScriptureTreasuryScreen, {
						unlockedCardIds: unlockedTreasuryIds,
						totalCoins: stats.totalCoins,
						savedVerses,
						lang,
						t,
						onUnlockCard: handleUnlockTreasuryCard,
						onListen: (text) => {
							setIsSpeaking(true);
							speakText(text, lang, settings.voiceGender, () => setIsSpeaking(false), {
								pitch: settings.voicePitch,
								rate: settings.voiceSpeed
							});
						},
						onCopyVerse: handleCopyVerse,
						onRemoveSaved: handleToggleBookmark,
						onSelectVerse: (verse) => {
							navigateToVerse(verse);
							handleSelectTab("home");
						},
						onBrowseVerses: () => handleSelectTab("home"),
						onShowToast: showToast
					}),
					screen === "main" && activeTab === "leaderboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeaderboardScreen, {
						profile: playerProfile,
						stats,
						onEditProfile: () => {
							setIsFirstLaunchPrompt(false);
							setIsProfileModalOpen(true);
						},
						onStartQuiz: () => handleSelectTab("categories")
					}),
					screen === "main" && activeTab === "profile" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProfileScreen, {
						profile: playerProfile,
						stats,
						lang,
						settings,
						t,
						onEditProfile: () => {
							setIsFirstLaunchPrompt(false);
							setIsProfileModalOpen(true);
						},
						onOpenLeaderboard: () => handleSelectTab("leaderboard"),
						onOpenLanguagePicker: () => {
							stopSpeaking();
							setIsSpeaking(false);
							setScreen("onboarding");
						},
						onOpenQuizSettings: handleOpenSettings,
						onToggleSound: () => setSettings((prev) => ({
							...prev,
							soundEnabled: !prev.soundEnabled
						})),
						onShowToast: showToast
					})
				]
			}),
			toast && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "status",
				"aria-live": "polite",
				className: "pointer-events-none fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-[#14274E] text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap max-w-[92vw] truncate",
				children: toast
			}),
			isProfileModalOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerProfileModal, {
				isOpen: isProfileModalOpen,
				profile: playerProfile,
				isFirstLaunchPrompt,
				onSave: (next) => {
					setPlayerProfile(next);
					setIsProfileModalOpen(false);
					setIsFirstLaunchPrompt(false);
					playChime("tap", settings.soundEnabled);
					showToast(`Welcome, ${next.displayName}!`);
				},
				onClose: () => {
					setPlayerProfile((prev) => ({
						...prev,
						isCustomized: true
					}));
					setIsProfileModalOpen(false);
					setIsFirstLaunchPrompt(false);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RewardVideoAdModal, {
				placement: pendingRewardAd,
				t,
				onUserEarnedReward: () => {
					if (pendingRewardAd) applyRewardedAdOutcome(pendingRewardAd);
					setPendingRewardAd(null);
				},
				onCancel: () => setPendingRewardAd(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomChrome, {
				activeTab,
				onSelectTab: handleSelectTab,
				t,
				showTabs: screen !== "onboarding",
				showBanner: screen !== "onboarding" && !isActiveQuizGameplay,
				onAdClick: () => showToast(t.adBannerText)
			})
		]
	});
}
// src/main.tsx
if ("serviceWorker" in navigator) registerSW({
	immediate: true,
	onRegisterError(error) {
		console.warn("Service worker registration failed:", error);
	}
});
(0, import_client.createRoot)(document.getElementById("root")).render(/* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {}));
export { WebPlugin as n, AdmobConsentStatus as t };
