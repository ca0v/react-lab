var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("components/myfoo", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dump(o) {
        var keys = Object.keys(o);
        return keys.map(function (k) { return React.createElement("li", { key: k },
            k,
            ": ",
            o[k]); });
    }
    var Component = /** @class */ (function (_super) {
        __extends(Component, _super);
        function Component(props) {
            return _super.call(this, props) || this;
        }
        Component.prototype.render = function () {
            return React.createElement("div", { className: (this.props.value || 0) % 2 === 0 ? "even" : "odd" },
                React.createElement("h4", null, this.props.title),
                React.createElement("ol", null, dump(this.props)),
                React.createElement("ol", null, dump(this.state)));
        };
        Component.prototype.tick = function () {
            this.setState(function (prev) { return ({ ticks: (prev.ticks || 0) + 1 }); });
        };
        Component.prototype.componentWillMount = function () {
            var _this = this;
            console.log("componentWillMount", this);
            this.setState({ tickHandler: window.setInterval(function () { return _this.tick(); }, 1000) });
        };
        Component.prototype.componentWillUnmount = function () {
            console.log("componentWillUnmount", this);
            clearInterval(this.state.tickHandler);
        };
        return Component;
    }(React.Component));
    exports.Component = Component;
});
define("app", ["require", "exports", "react", "react-dom", "components/myfoo"], function (require, exports, React, reactDom, myfoo_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dump = function (o) { return Object.keys(o).map(function (k) { return React.createElement("li", { key: k, title: k },
        k,
        ": ",
        o[k]); }); };
    var App = /** @class */ (function (_super) {
        __extends(App, _super);
        function App(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                value: props.value || Math.ceil(Math.random() * 100),
                title: props.title || "untitled"
            };
            return _this;
        }
        App.prototype.render = function () {
            var _this = this;
            return React.createElement("div", { className: "application" },
                React.createElement("h3", null, this.state.title),
                React.createElement("label", null,
                    React.createElement(myfoo_1.Component, { title: this.state.title || this.props.title, value: this.state.value })),
                React.createElement("ol", null, dump(this.props)),
                React.createElement("ol", null, dump(this.state)),
                React.createElement("div", null,
                    "Change Title: ",
                    React.createElement("input", { type: "text", value: this.state.title, onChange: function (event) { _this.setState({ title: event.target.value }); } })),
                React.createElement("button", { onClick: function () { return _this.increment(); } }, "Increment"),
                React.createElement("button", { onClick: function () { return _this.destroy(); } }, "Destroy"));
        };
        App.prototype.destroy = function () {
            var node = reactDom.findDOMNode(this).parentElement;
            node && reactDom.unmountComponentAtNode(node);
        };
        App.prototype.increment = function () {
            this.setState(function (prev, props) { return ({
                value: prev.value + 1
            }); });
        };
        App.prototype.componentWillMount = function () {
            console.log("componentWillMount", this);
        };
        App.prototype.componentWillUnMount = function () {
            console.log("componentWillUnMount", this);
        };
        App.prototype.componentDidMount = function () {
            console.log("componentDidMount", this);
        };
        App.prototype.componentWillReceiveProps = function () {
            console.log("componentWillReceiveProps", this);
        };
        App.prototype.componentDidUpdate = function () {
            console.log("componentDidUpdate", this);
        };
        App.prototype.componentWillUnmount = function () {
            console.log("componentWillUnmount", this);
        };
        App.prototype.componentWillUpdate = function () {
            console.log("componentWillUpdate", this);
        };
        return App;
    }(React.Component));
    exports.App = App;
});
define("index", ["require", "exports", "app", "react", "react-dom"], function (require, exports, app_1, React, reactDom) {
    "use strict";
    function run() {
        var nodes = document.getElementsByTagName("app");
        var apps = [];
        for (var i = 0; i < nodes.length; i++) {
            var title = "App " + (i + 1);
            apps.push(reactDom.render(React.createElement(app_1.App, { title: title }), nodes[i]));
        }
        return apps;
    }
    return run;
});
//# sourceMappingURL=index.js.map