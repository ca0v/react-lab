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
define("common/common", ["require", "exports", "react"], function (require, exports, react_1) {
    "use strict";
    exports.__esModule = true;
    function dump(o) {
        return Object.keys(o).map(function (k) { return react_1.createElement("li", { key: k },
            k,
            ": ",
            o[k]); });
    }
    exports.dump = dump;
    // https://davidwalsh.name/javascript-debounce-function
    exports.debounce = function (func, wait) {
        if (wait === void 0) { wait = 200; }
        var timeout;
        return function () {
            var later = function () {
                clearTimeout(timeout);
                func();
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    exports.shuffle = shuffle;
    function input(c) {
        var o = c.state;
        var inputs = Object.keys(o).map(function (k) {
            var value = o[k];
            var typeMaps = {
                'number': { type: 'number', value: 'valueAsNumber' },
                'boolean': { type: 'checkbox', value: 'checked' },
                'string': { type: 'text', value: 'value' },
                'undefined': { type: 'text', value: 'value' }
            };
            var typeMap = typeMaps[typeof value] || typeMaps.string;
            return react_1.createElement("div", null,
                react_1.createElement("label", { className: "input" }, k),
                react_1.createElement("input", { key: k, type: typeMap.type, value: value, checked: value, placeholder: k, onChange: function (event) {
                        c.setState((_a = {}, _a[k] = event.target[typeMap.value], _a));
                        var _a;
                    } }));
        });
        return react_1.createElement("div", null, inputs);
    }
    exports.input = input;
});
define("components/openlayers", ["require", "exports", "react", "common/common", "openlayers"], function (require, exports, react_2, common_1, ol) {
    "use strict";
    exports.__esModule = true;
    function addGeoJsonLayer(map, url) {
        // how to access parent map to add layer...should be a inferred "props" of sorts
        var vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.GeoJSON()
            })
        });
        map.addLayer(vector);
        return vector;
    }
    var Toolbar = /** @class */ (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Toolbar.prototype.render = function () {
            return react_2.createElement("span", { className: "toolbar" }, this.props.children);
        };
        return Toolbar;
    }(react_2.PureComponent));
    var OpenLayers = /** @class */ (function (_super) {
        __extends(OpenLayers, _super);
        function OpenLayers(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                target: null
            };
            return _this;
        }
        OpenLayers.prototype.trigger = function (message, args) {
            var map = this.state.map;
            if (!map)
                return;
            switch (message) {
                case "refresh":
                    map.getLayers().getArray()
                        .filter(function (l) { return l instanceof ol.layer.Vector; })
                        .map(function (l) { return l.getSource().changed(); });
                    break;
                case "extent":
                    var p = args;
                    map.getView().fit(p.extent);
                    break;
            }
        };
        OpenLayers.prototype.render = function () {
            var _this = this;
            var map = this.state.map;
            var DrawControls = function () { return react_2.createElement(Toolbar, null); };
            if (this.props.controls) {
                if (this.props.controls.draw) {
                    var draw_1 = this.props.controls.draw;
                    DrawControls = function () { return react_2.createElement(Toolbar, null,
                        draw_1.point &&
                            react_2.createElement("button", { className: "" + ((_this.state.activeDrawingTool === "Point") ? 'active' : 'inactive'), onClick: function () { return map && _this.draw("Point"); } }, "Point"),
                        draw_1.circle &&
                            react_2.createElement("button", { className: "" + ((_this.state.activeDrawingTool === "Circle") ? 'active' : 'inactive'), onClick: function () { return map && _this.draw("Circle"); } }, "Circle"),
                        draw_1.line &&
                            react_2.createElement("button", { className: "" + ((_this.state.activeDrawingTool === "LineString") ? 'active' : 'inactive'), onClick: function () { return map && _this.draw("LineString"); } }, "Line"),
                        draw_1.polygon &&
                            react_2.createElement("button", { className: "" + ((_this.state.activeDrawingTool === "Polygon") ? 'active' : 'inactive'), onClick: function () { return map && _this.draw("Polygon"); } }, "Polygon")); };
                }
            }
            return react_2.createElement("div", { className: "maplet " + (this.props.className || "") + " " + (this.props.orientation || '') },
                this.props.title && react_2.createElement("label", null, this.props.title),
                react_2.createElement("div", { className: "map", ref: function (v) { return _this.setState({ target: v }); } }),
                react_2.createElement(DrawControls, null),
                this.props.children);
        };
        OpenLayers.prototype.componentDidMount = function () {
            var _this = this;
            var map = new ol.Map({
                view: new ol.View({
                    center: this.props.center || ol.proj.fromLonLat([0, 0]),
                    zoom: this.props.zoom || 0
                }),
                controls: [],
                interactions: [],
                keyboardEventTarget: this.props.allowKeyboard ? document : undefined
            });
            if (this.props.allowPan !== false) {
                map.addInteraction(new ol.interaction.DragPan());
                map.addInteraction(new ol.interaction.KeyboardPan());
            }
            if (this.props.allowZoom !== false) {
                map.addInteraction(new ol.interaction.MouseWheelZoom());
                map.addInteraction(new ol.interaction.PinchZoom());
                map.addInteraction(new ol.interaction.DragZoom());
                map.addInteraction(new ol.interaction.KeyboardZoom());
            }
            map.on("singleclick", function (args) {
                _this.props.onClick && _this.props.onClick({ coordinate: args.coordinate });
            });
            map.on("moveend", common_1.debounce(function () {
                _this.props.setCenter && _this.props.setCenter(map.getView().getCenter(), map.getView().getZoom());
            }, 50));
            if (this.props.bingImagerySet) {
                map.addLayer(new ol.layer.Tile({
                    source: new ol.source.BingMaps({
                        key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                        imagerySet: this.props.bingImagerySet
                    })
                }));
            }
            else if (this.props.osm !== false) {
                map.addLayer(new ol.layer.Tile({ source: new ol.source.OSM() }));
            }
            if (this.props.features) {
                var layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: this.props.features
                    })
                });
                map.addLayer(layer);
            }
            this.setState(function (prev, prop) { return ({
                map: map
            }); });
            if (this.props.layers) {
                if (this.props.layers.geoJson) {
                    this.props.layers.geoJson.forEach(function (url) {
                        var vector = addGeoJsonLayer(map, url);
                        if (_this.props.onLayerAdd) {
                            _this.props.onLayerAdd({ layer: vector });
                        }
                        if (_this.props.onFeatureClick) {
                            map.on("click", function (args) {
                                if (_this.props.onFeatureClick) {
                                    var features = map.getFeaturesAtPixel(args.pixel);
                                    if (!features)
                                        return;
                                    if (features.length !== 1)
                                        return;
                                    var feature = features[0];
                                    if (feature instanceof ol.Feature) {
                                        _this.props.onFeatureClick({ layer: vector, feature: feature });
                                    }
                                }
                            });
                        }
                    });
                }
            }
            // I would prefer that the child trigger a cascading event that the parent could receive
            // and process
            if (this.props.controls) {
                if (this.props.controls.draw) {
                    var draw = this.props.controls.draw;
                    if (draw.point || draw.circle || draw.line || draw.polygon) {
                        draw.polygon && this.addDraw(map, "Polygon");
                        draw.circle && this.addDraw(map, "Circle");
                        draw.line && this.addDraw(map, "LineString");
                        draw.point && this.addDraw(map, "Point");
                    }
                }
                if (this.props.controls.zoom) {
                    map.addControl(new ol.control.Zoom({}));
                }
                else if (this.props.controls.zoomSlider) {
                    map.addControl(new ol.control.ZoomSlider({}));
                }
                if (this.props.controls.fullScreen) {
                    map.addControl(new ol.control.FullScreen({}));
                }
                if (this.props.controls.mousePosition) {
                    map.addControl(new ol.control.MousePosition({
                        coordinateFormat: function (v) { return !v ? "" : v.map(function (c) { return c.toFixed(4); }).join(","); },
                        projection: "EPSG:4326"
                    }));
                }
                if (this.props.controls.rotate) {
                    map.addControl(new ol.control.Rotate({}));
                }
                if (this.props.controls.scaleLine) {
                    map.addControl(new ol.control.ScaleLine({}));
                }
                if (this.props.controls.zoomToExtent) {
                    map.addControl(new ol.control.ZoomToExtent({}));
                }
            }
        };
        OpenLayers.prototype.draw = function (type) {
            this.setState(function (prev) { return ({
                activeDrawingTool: prev.activeDrawingTool === type ? null : type
            }); });
        };
        OpenLayers.prototype.activateDrawTool = function (map) {
            var _this = this;
            map.getInteractions().getArray().forEach(function (interaction) {
                if (interaction instanceof ol.interaction.Draw) {
                    interaction.setActive(interaction.get("type") === _this.state.activeDrawingTool);
                }
            });
        };
        OpenLayers.prototype.addDraw = function (map, type) {
            var source = new ol.source.Vector();
            var layer = new ol.layer.Vector({
                source: source
            });
            var interaction = new ol.interaction.Draw({
                source: source,
                type: type
            });
            interaction.set("type", type);
            interaction.setActive(false);
            map.addInteraction(interaction);
            map.addLayer(layer);
        };
        OpenLayers.prototype.componentDidUpdate = function (prevProp, prevState) {
            var target = this.state.target; // how to cast in tsx?
            var map = this.state.map;
            if (map) {
                map.setTarget(target);
                map.getView().animate({
                    center: this.props.center || ol.proj.fromLonLat([0, 0]),
                    zoom: this.props.zoom,
                    duration: 250
                });
                this.activateDrawTool(map);
                if (this.props.trigger) {
                    if (this.props.trigger !== prevProp.trigger) {
                        this.trigger(this.props.trigger.message, this.props.trigger.args);
                    }
                }
            }
        };
        OpenLayers.prototype.componentWillUnmount = function () {
            // will this force the map to be destroyed?
            this.setState({ target: null });
        };
        return OpenLayers;
    }(react_2.PureComponent));
    exports.OpenLayers = OpenLayers;
});
define("components/maplet", ["require", "exports", "react", "components/openlayers", "common/common"], function (require, exports, react_3, openlayers_1, common_2) {
    "use strict";
    exports.__esModule = true;
    var Maplet = /** @class */ (function (_super) {
        __extends(Maplet, _super);
        function Maplet(props) {
            var _this = _super.call(this, props) || this;
            props.drawPointTest = true;
            _this.state = _this.props;
            return _this;
        }
        Maplet.prototype.componentDidUpdate = function (prevProp, prevState) {
            if (prevState.portrait != this.state.portrait) {
                // help openlayers detect resize
                window.dispatchEvent(new Event('resize'));
            }
        };
        Maplet.prototype.render = function () {
            var _this = this;
            var setCenter = function (v, z) {
                _this.setState({ center: v, zoom: z });
            };
            var orientation = this.state.portrait ? "portrait" : "landscape";
            return react_3.createElement("div", null,
                common_2.input(this),
                this.state.showmap && react_3.createElement("div", null,
                    react_3.createElement("div", null,
                        react_3.createElement("label", null,
                            this.state.center.map(function (v) { return v.toFixed(5); }).join(","),
                            " Z",
                            this.state.zoom)),
                    react_3.createElement(openlayers_1.OpenLayers, { orientation: orientation, controls: {
                            draw: {
                                point: this.state.drawPointTest
                            },
                            zoom: true,
                            zoomToExtent: true
                        }, setCenter: setCenter, center: this.state.center, zoom: this.state.zoom, osm: false }),
                    react_3.createElement(openlayers_1.OpenLayers, { orientation: orientation, controls: {
                            mousePosition: true,
                            draw: {
                                point: this.state.drawPointTest
                            }
                        }, bingImagerySet: "AerialWithLabels", setCenter: setCenter, center: this.state.center, zoom: this.state.zoom, layers: {
                            geoJson: ["http://openlayers.org/en/master/examples/data/geojson/countries.geojson"]
                        } }),
                    react_3.createElement(openlayers_1.OpenLayers, { orientation: orientation, controls: {
                            fullScreen: true,
                            draw: {
                                point: this.state.drawPointTest
                            }
                        }, bingImagerySet: "Aerial", setCenter: setCenter, center: this.state.center, zoom: this.state.zoom, layers: {
                            geoJson: ["https://gist.githubusercontent.com/ca0v/78c82dbcb184d52f784a9aa11a452272/raw/5929e9469e02363665017202394aabba906845ae/trip.geojson"]
                        } }),
                    react_3.createElement(openlayers_1.OpenLayers, { orientation: orientation, allowPan: false, allowZoom: false, controls: {
                            scaleLine: true,
                            draw: {
                                circle: true,
                                line: true,
                                point: true,
                                polygon: true
                            }
                        }, osm: true, setCenter: setCenter, center: this.state.center, zoom: this.state.zoom })));
        };
        return Maplet;
    }(react_3.PureComponent));
    exports.Maplet = Maplet;
});
define("components/quizlet", ["require", "exports", "components/openlayers", "react", "common/common", "openlayers"], function (require, exports, openlayers_2, react_4, common_3, ol) {
    "use strict";
    exports.__esModule = true;
    var styles = {
        right: function (quizlet) { return function (feature, res) { return new ol.style.Style({
            fill: new ol.style.Fill({
                color: [0, 128, 0, 0.5]
            }),
            text: new ol.style.Text({
                text: "\u2714 " + feature.get(quizlet.props.featureNameFieldName),
                scale: 1
            }),
            stroke: new ol.style.Stroke({
                color: [20, 200, 200, 1],
                width: 2
            })
        }); }; },
        wrong: function (quizlet) { return function (feature, res) { return new ol.style.Style({
            fill: new ol.style.Fill({
                color: [255, 0, 0, 0.5]
            }),
            text: new ol.style.Text({
                text: feature.get(quizlet.props.featureNameFieldName),
                scale: 5
            }),
            stroke: new ol.style.Stroke({
                color: [200, 20, 200, 1],
                width: 2
            })
        }); }; },
        indeterminate: function (quizlet) { return function (feature, res) {
            var featureName = feature.get(quizlet.props.featureNameFieldName);
            var showText = quizlet.state.hint && (1 < quizlet.state.hint);
            var showOutline = quizlet.state.hint && (2 < quizlet.state.hint) && (quizlet.state.answer === featureName);
            return new ol.style.Style({
                text: new ol.style.Text({
                    text: showText ? featureName : "",
                    scale: 1,
                    stroke: new ol.style.Stroke({
                        color: [200, 200, 200, 1],
                        width: 2
                    })
                }),
                stroke: new ol.style.Stroke({
                    color: showOutline ? [200, 20, 200, 1] : [20, 20, 200, 1],
                    width: showOutline ? quizlet.state.hint : 1
                })
            });
        }; }
    };
    var answers;
    var QuizletComponent = /** @class */ (function (_super) {
        __extends(QuizletComponent, _super);
        function QuizletComponent(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                answer: "Click the map to Begin!",
                center: [0, 0],
                zoom: 1,
                score: 0,
                features: new ol.Collection()
            };
            return _this;
        }
        QuizletComponent.prototype.render = function () {
            var _this = this;
            return react_4.createElement("div", { className: "quizlet" },
                react_4.createElement(openlayers_2.OpenLayers, { trigger: this.state.mapTrigger, allowKeyboard: true, orientation: "full", center: this.state.center, zoom: this.state.zoom, controls: {
                        mousePosition: true
                    }, bingImagerySet: "Aerial", layers: {
                        geoJson: [this.props.geojsonUrl]
                    }, setCenter: function (center, zoom) {
                        _this.setState(function () { return ({
                            center: center,
                            zoom: zoom
                        }); });
                    }, onFeatureClick: function (args) {
                        if (!answers || !answers.length) {
                            var featureName = args.feature.get(_this.props.featureNameFieldName);
                            _this.init(args.layer, {
                                firstLetter: featureName[0]
                            });
                            _this.zoomToFeature(args.feature);
                            _this.next();
                        }
                        else if (_this.test(args.feature)) {
                            _this.state.features.push(args.feature);
                        }
                        else {
                            var expectedFeature = _this.find();
                            expectedFeature && _this.state.features.push(expectedFeature);
                        }
                    } },
                    react_4.createElement(openlayers_2.OpenLayers, { className: "inset", osm: false, center: this.state.center, zoom: Math.max(0, this.state.zoom - 5), allowZoom: true, allowPan: true, orientation: "landscape", onClick: function (args) {
                            _this.setState(function (prev) { return ({
                                center: args.coordinate
                            }); });
                        }, layers: { geoJson: ["./data/countries.json"] }, features: this.state.features })),
                react_4.createElement("div", { className: "score" },
                    "Score",
                    react_4.createElement("label", null,
                        this.state.score,
                        " ",
                        answers && answers.length + " remaining")),
                react_4.createElement("div", { className: "score" },
                    "Remaining",
                    react_4.createElement("label", null, answers ? answers.length : "?")),
                react_4.createElement("div", { className: "score" },
                    "Find",
                    react_4.createElement("label", null, this.state.answer)),
                react_4.createElement("br", null),
                " ",
                react_4.createElement("div", { className: "score" },
                    react_4.createElement("button", { onClick: function () { return _this.skip(); } }, "Skip"),
                    react_4.createElement("button", { onClick: function () { return _this.hint(); } }, "Hint")));
        };
        QuizletComponent.prototype.skip = function () {
            this.score(-1);
            this.state.answer && answers.unshift(this.state.answer);
            this.next();
        };
        QuizletComponent.prototype.score = function (value) {
            this.setState(function (prev) { return ({
                score: prev.score + value
            }); });
        };
        QuizletComponent.prototype.init = function (layer, args) {
            var _this = this;
            var source = layer.getSource();
            var fieldName = this.props.featureNameFieldName;
            var features = source.getFeatures();
            features.forEach(function (f) { return f.setStyle(styles.indeterminate(_this)); });
            answers = features.map(function (f) { return f.get(fieldName); });
            if (args && args.firstLetter)
                answers = answers.filter(function (v) { return 0 === v.indexOf(args.firstLetter); });
            common_3.shuffle(answers);
            this.setState(function (prev) { return ({
                layer: layer,
                score: prev.score || 0
            }); });
            document.addEventListener("keypress", function (args) {
                switch (args.key.toUpperCase()) {
                    case "H":
                        _this.hint();
                        break;
                    case "S":
                        _this.skip();
                        break;
                }
            });
        };
        // return true if the feature matches the correct answer
        QuizletComponent.prototype.test = function (feature) {
            var _this = this;
            var fieldName = this.props.featureNameFieldName;
            var result = feature.get(fieldName) === this.state.answer;
            if (result) {
                this.score(20);
                feature.setStyle(styles.right(this));
                this.next();
            }
            else {
                this.score(-20);
                var actualFeature = this.find();
                if (actualFeature) {
                    actualFeature.setStyle(styles.wrong(this));
                    this.zoomToFeature(actualFeature);
                    this.state.answer && answers.unshift(this.state.answer);
                    setTimeout(function () { return _this.next(); }, 2500);
                }
            }
            return result;
        };
        QuizletComponent.prototype.zoomToFeature = function (feature) {
            var extent = feature.getGeometry().getExtent();
            this.setState(function (prev) { return ({
                mapTrigger: {
                    message: "extent",
                    args: {
                        extent: extent
                    }
                }
            }); });
        };
        QuizletComponent.prototype.next = function () {
            if (!answers.length)
                return;
            this.setState(function (prev) { return ({
                answer: answers.pop(),
                hint: 0
            }); });
        };
        QuizletComponent.prototype.find = function () {
            var _this = this;
            if (!this.state.layer)
                return;
            var source = this.state.layer.getSource();
            if (!source)
                return;
            var features = source.getFeatures().filter(function (f) { return f.get(_this.props.featureNameFieldName) === _this.state.answer; });
            if (features && features.length === 1) {
                var feature = features[0];
                return feature;
            }
            return null;
        };
        QuizletComponent.prototype.hint = function () {
            var feature = this.find();
            if (!feature)
                return;
            var center = ol.extent.getCenter(feature.getGeometry().getExtent());
            this.setState(function (prev) { return ({
                score: prev.score - 5,
                hint: (prev.hint || 0) + 1,
                center: center,
                zoom: Math.min(Math.max(5, prev.zoom + 1), 6),
                mapTrigger: { message: "refresh" }
            }); });
        };
        return QuizletComponent;
    }(react_4.PureComponent));
    exports.QuizletComponent = QuizletComponent;
});
define("app", ["require", "exports", "react", "components/quizlet"], function (require, exports, react_5, quizlet_1) {
    "use strict";
    exports.__esModule = true;
    var App = /** @class */ (function (_super) {
        __extends(App, _super);
        function App(props) {
            var _this = _super.call(this, props) || this;
            _this.state = {
                orientation: "landscape",
                url: "./data/countries.json"
            };
            return _this;
        }
        App.prototype.render = function () {
            return react_5.createElement("div", { className: "app" },
                react_5.createElement("title", null, "React + Openlayers Lab"),
                react_5.createElement(quizlet_1.QuizletComponent, { geojsonUrl: this.state.url, featureNameFieldName: "name" }));
        };
        return App;
    }(react_5.PureComponent));
    exports.App = App;
});
define("index", ["require", "exports", "react", "react-dom", "app"], function (require, exports, react_6, react_dom_1, app_1) {
    "use strict";
    function run() {
        react_dom_1.render(react_6.createElement(app_1.App, { showmap: true, center: [-82.408, 34.789], zoom: 12 }), document.querySelector("app"));
    }
    return run;
});
define("components/index", ["require", "exports", "react"], function (require, exports, react_7) {
    "use strict";
    exports.__esModule = true;
    var IndexComponent = /** @class */ (function (_super) {
        __extends(IndexComponent, _super);
        function IndexComponent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return IndexComponent;
    }(react_7.PureComponent));
    exports.IndexComponent = IndexComponent;
});
//# sourceMappingURL=index.js.map