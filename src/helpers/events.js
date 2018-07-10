/**    Evens implementation
 * ___________________________
 * ---------------------------
 *
 * Implementation of the events.
 * Call this constructor on prototype to add methods.
 * Also instance for which prototype events will be added must has 'events' property.
 * To fire event use triggerEvent method.
 *
 * Example: addEventsImplementation.call(UIElement.prototype);
 */
function addEventsImplementation()
{
    if(!this.hasOwnProperty('__')){
        this.__ = {};
    }
    this.__.events = {};
    this.__.dispatchers = {};

    /**
     *
     * @param {string|number} eventName
     * @param {function} [handler]
     * @returns {EventsDispatcher}
     */
    this.listen = function (eventName, handler) {
        var portNumber = null;
        var arr = eventName.split('->');
        if(arr.length === 2){
            eventName = arr[0].trim();
            portNumber = arr[1].trim();
        }
        eventName = eventName.toLowerCase();
        if (!this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName] = new EventsDispatcher(eventName);
        }
        if(portNumber !== null && typeof handler === 'function'){
            this.__.dispatchers[eventName].onPort(portNumber, handler);
        }
        return this.__.dispatchers[eventName];
    };

    /**
     * Adds event listener for the event with name [[eventName]].
     * @param {string} eventName
     * @param {function} handler
     * @throw EventException
     */
    this.addEventListener = function (eventName, handler) {
        var portNumber = null;
        var arr = eventName.split('->');
        if(arr.length === 2){
            eventName = arr[0].trim();
            portNumber = arr[1].trim();
        }
        eventName = eventName.toLowerCase();
        if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');

        if(portNumber !== null){
            this.listen(eventName).onPort(portNumber, handler);
        }else{
            if (!Array.isArray(this.__.events[eventName])) this.__.events[eventName] = [];
            if (this.__.events[eventName].indexOf(handler) >= 0) return;
            this.__.events[eventName].push(handler);
        }

        return this;
    };

    // Add pseudonym.
    this.on = this.addEventListener;


    /**
     * Removes specified event listener.
     * @param {string} eventName
     * @param {function} [handler]
     * @throw EventException
     */
    this.removeEventListener = function (eventName, handler) {
        eventName = eventName.toLowerCase();
        if (!this.__.events.hasOwnProperty(eventName)) return this;
        if(handler === undefined){
            delete this.__.events[eventName];
            this.__.events[eventName] = [];
        }else{
            if (typeof handler !== 'function') throw new EventException('Type of handler is not a function');
            var index = this.__.events[eventName].indexOf(handler);
            if (index < 0) return this;
            this.__.events[eventName].splice(index, 1);
        }
        return this;
    };

    // Add pseudonym.
    this.off = this.removeEventListener;


    /**
     * Triggers event with name [[eventName]].
     * There are few arguments can be passed instead of date.
     * All the arguments (omitting event name) will be passed to the handlers.
     *
     * @param {string} eventName
     * @param {*} [data]
     */
    this.triggerEvent = function (eventName, data) {
        eventName = eventName.toLowerCase();
        var args = [];
        for (var i = 1, len = arguments.length; i < len; i++) {
            args.push(arguments[i]);
        }

        if (this.__.events.hasOwnProperty(eventName)) {
            for (var i = 0; i < this.__.events[eventName].length; i++) {
                this.__.events[eventName][i].apply(this, args);
            }
        }


        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].runHandlers(this, args);
        }
    };

    this.offPort = function (eventName, portNumber) {
        if(portNumber === undefined){
            eventName = eventName + '';
            var arr = eventName.split('->');
            if(arr.length === 2){
                eventName = arr[0].trim();
                portNumber = arr[1].trim();
            }
        }
        eventName = eventName.toLowerCase();
        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].offPort(portNumber);
        }
    };

    this.offAllPorts = function (eventName) {
        eventName = eventName.toLowerCase();
        if(this.__.dispatchers.hasOwnProperty(eventName)){
            this.__.dispatchers[eventName].offAllPorts();
        }
    };

    this.trigger = this.triggerEvent;
}

/**
 * Object that encapsulates events ports.
 */
function EventsDispatcher (eventName){
	this.eventName = eventName;
	this.ports = {};
}

EventsDispatcher.prototype = {
	constructor: EventsDispatcher,

    onPort: function(portNumber, handler) {
        if (this.ports.hasOwnProperty(portNumber)) {
            delete this.ports[portNumber];
        }
        if (typeof handler !== 'function') {
            throw new EventException('Type of handler is not a function');
        }
        this.ports[portNumber] = handler;
    },

    runHandlers: function(context, args) {
        for (var p in this.ports) {
            if (this.ports.hasOwnProperty(p)) {
                this.ports[p].apply(context, args);
            }
        }
    },

    offPort: function(portNumber) {
        if (this.ports.hasOwnProperty(portNumber)) {
            delete this.ports[portNumber];
        }
    },

    offAllPorts: function() {
        delete this.ports;
        this.ports = {};
    },
};

/**
 * Simple object helper that manages global events.
 * Usage:
 *
 *  // Add first listener.
 *  GlobalEvents.listen('ws:incomingMessage').onPort(500, message => {
 *      // Do something with message...
 *  });
 *
 *  // Add another event listener.
 *  GlobalEvents.listen('ws:incomingMessage -> 501', message => {
 *      // Do something with message...
 *  });
 *
 *  // Then trigger this event.
 *  GlobalEvents.triggerEvent('ws:incomingMessage', {
 *      author: 'Roman',
 *      text: 'Hello world!'
 *  });
 *
 * @returns {string}
 */
function GlobalEvents()
{
    return '1.0.0';
}
_uibuilder.GlobalEvents = GlobalEvents;


addEventsImplementation.call(GlobalEvents);