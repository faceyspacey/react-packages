ReactMeteorData = {
  componentWillMount() {
    this.bindReactiveMethods();
    this._computations = [];
  },
  componentWillUnmount() {
    this._computations.forEach(c => c.stop());
    delete this._computations;
  }
  _isFunction(functionToCheck) {
    let getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }
  bindReactiveMethods() {
    let reg = /props|state|conext|getDOMNode|refs/;
    
    _.each(this, function(prop) {
      if(this.hasOwnProperty(prop) && prop.charAt(0) !== '_' && this._isFunction(this[prop]) && !reg.test(prop)) {
        this.bindMethod(prop);
      }
    }, this);
  }
  bindMethod(prop) {
    let oldFunction = this[prop],
      bindingComplete = false;
          
    this[prop] = function() {
      let computation, args = arguments;
      
      if(bindingComplete === false) {
        computation = Tracker.autorun(function() {
          oldFunction.apply(this, args);
          this.forceUpdate();
        }.bind(this));
        
        this._computations.push(computation);
      }
      
      return this[prop](...args);
    }.bind(this);
  }
};
