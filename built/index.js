define("components/myfoo", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Component extends React.Component {
        render() {
            return React.createElement("div", null, "My Foo");
        }
    }
    exports.Component = Component;
});
define("index", ["require", "exports", "components/myfoo", "react"], function (require, exports, myfoo_1, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Templates {
        get value() {
            return this._value;
        }
        set value(v) {
            this._value = v;
        }
        t1(title) {
            return React.createElement("h1", null, title);
        }
        t2(list) {
            return React.createElement("ul", null, list.map(v => React.createElement("li", { title: v, key: v }, v)));
        }
        t3() {
            return React.createElement("div", { className: "container" },
                React.createElement(myfoo_1.Component, null));
        }
    }
    exports.Templates = Templates;
});
define("app", ["require", "exports", "react", "components/myfoo", "index"], function (require, exports, React, myfoo_2, index_1) {
    "use strict";
    class App extends React.Component {
        render() {
            let T = new index_1.Templates();
            return React.createElement("div", { className: "application" },
                T.t1("My Title"),
                React.createElement(myfoo_2.Component, null),
                T.t2("My List Of Items".split(" ")));
        }
    }
    return App;
});
//# sourceMappingURL=index.js.map