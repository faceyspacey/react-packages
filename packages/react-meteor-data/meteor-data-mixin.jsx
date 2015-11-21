TrackerReact = {
    componentWillMount() {
        this.bindReactiveMethods();
        this._computations = {};
    },
    componentWillUnmount() {
        _.each(this._computations, c => c.stop());
        delete this._computations;
    },
    _isFunction(functionToCheck) {
        let getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    },
    bindReactiveMethods() {
        let reg = /props|state|conext|getDOMNode|refs|bindReactiveMethods|bindMethod|renderTasks/;

        _.each(this, function(func, prop) {
            if (this.hasOwnProperty(prop) && prop.charAt(0) !== '_' && this._isFunction(this[prop]) && !reg.test(prop)) {
                this.bindMethod(prop);
            }
        }, this);
    },
    bindMethod(prop) {
        let oldFunction = this[prop];

        this[prop] = function() {
            if (this._computations[prop]) this._computations[prop].stop();
            let args = arguments,
                response;

            this._computations[prop] = Tracker.nonreactive(() => {
                return Tracker.autorun(function(c) {
                    if (c.firstRun) response = oldFunction.apply(this, args);
                    else this.forceUpdate();
                }.bind(this));
            });

            return response;
        }.bind(this);
    }
};	
