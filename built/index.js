var __extends=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])};return function(t,n){function o(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(o.prototype=n.prototype,new o)}}();define("common/common",["require","exports","react"],function(e,t,n){"use strict";function o(e){return Object.keys(e).map(function(t){return n.createElement("li",{key:t},t,": ",e[t])})}function r(e){for(var t,n,o=e.length;0!==o;)n=Math.floor(Math.random()*o),o-=1,t=e[o],e[o]=e[n],e[n]=t;return e}function a(e){var t=e.state,o=Object.keys(t).map(function(o){var r=t[o],a={number:{type:"number",value:"valueAsNumber"},"boolean":{type:"checkbox",value:"checked"},string:{type:"text",value:"value"},undefined:{type:"text",value:"value"}},i=a[typeof r]||a.string;return n.createElement("div",null,n.createElement("label",{className:"input"},o),n.createElement("input",{key:o,type:i.type,value:r,checked:r,placeholder:o,onChange:function(t){e.setState((n={},n[o]=t.target[i.value],n));var n}}))});return n.createElement("div",null,o)}t.__esModule=!0,t.dump=o,t.debounce=function(e,t){void 0===t&&(t=200);var n;return function(){var o=function(){clearTimeout(n),e()};clearTimeout(n),n=setTimeout(o,t)}},t.shuffle=r,t.input=a}),define("components/openlayers",["require","exports","react","common/common","openlayers"],function(e,t,n,o,r){"use strict";function a(e,t){var n=new r.layer.Vector({source:new r.source.Vector({url:t,format:new r.format.GeoJSON})});return e.addLayer(n),n}t.__esModule=!0;var i=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return __extends(t,e),t.prototype.render=function(){return n.createElement("span",{className:"toolbar"},this.props.children)},t}(n.PureComponent),s=function(e){function t(t){var n=e.call(this,t)||this;return n.state={target:null},n}return __extends(t,e),t.prototype.render=function(){var e=this,t=this.state.map,o=function(){return n.createElement(i,null)};if(this.props.controls&&this.props.controls.draw){var r=this.props.controls.draw;o=function(){return n.createElement(i,null,r.point&&n.createElement("button",{className:""+("Point"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("Point")}},"Point"),r.circle&&n.createElement("button",{className:""+("Circle"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("Circle")}},"Circle"),r.line&&n.createElement("button",{className:""+("LineString"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("LineString")}},"Line"),r.polygon&&n.createElement("button",{className:""+("Polygon"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("Polygon")}},"Polygon"))}}return n.createElement("div",{className:"maplet "+(this.props.className||"")+" "+(this.props.orientation||"")},this.props.title&&n.createElement("label",null,this.props.title),n.createElement("div",{className:"map",ref:function(t){return e.setState({target:t})}}),n.createElement(o,null),this.props.children)},t.prototype.componentDidMount=function(){var e=this,t=new r.Map({view:new r.View({center:r.proj.fromLonLat(this.props.center||[0,0]),zoom:this.props.zoom||0}),controls:[],interactions:[]});if(this.props.allowPan!==!1&&(t.addInteraction(new r.interaction.DragPan),t.addInteraction(new r.interaction.KeyboardPan)),this.props.allowZoom!==!1&&(t.addInteraction(new r.interaction.MouseWheelZoom),t.addInteraction(new r.interaction.PinchZoom),t.addInteraction(new r.interaction.DragZoom)),t.on("moveend",o.debounce(function(){e.props.setCenter&&e.props.setCenter(r.proj.toLonLat(t.getView().getCenter()),t.getView().getZoom())},50)),this.props.bingImagerySet?t.addLayer(new r.layer.Tile({source:new r.source.BingMaps({key:"AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl",imagerySet:this.props.bingImagerySet})})):this.props.osm!==!1&&t.addLayer(new r.layer.Tile({source:new r.source.OSM})),this.props.features){var n=new r.layer.Vector({source:new r.source.Vector({features:this.props.features})});t.addLayer(n)}if(this.setState(function(e,n){return{map:t}}),this.props.layers&&this.props.layers.geoJson&&this.props.layers.geoJson.forEach(function(n){var o=a(t,n);e.props.onLayerAdd&&e.props.onLayerAdd({layer:o}),e.props.onFeatureClick&&t.on("click",function(n){if(e.props.onFeatureClick){var a=t.getFeaturesAtPixel(n.pixel);if(!a)return;if(1!==a.length)return;var i=a[0];i instanceof r.Feature&&e.props.onFeatureClick({layer:o,feature:i})}})}),this.props.controls){if(this.props.controls.draw){var i=this.props.controls.draw;(i.point||i.circle||i.line||i.polygon)&&(i.polygon&&this.addDraw(t,"Polygon"),i.circle&&this.addDraw(t,"Circle"),i.line&&this.addDraw(t,"LineString"),i.point&&this.addDraw(t,"Point"))}this.props.controls.zoom?t.addControl(new r.control.Zoom({})):this.props.controls.zoomSlider&&t.addControl(new r.control.ZoomSlider({})),this.props.controls.fullScreen&&t.addControl(new r.control.FullScreen({})),this.props.controls.mousePosition&&t.addControl(new r.control.MousePosition({coordinateFormat:function(e){return e?e.map(function(e){return e.toFixed(4)}).join(","):""},projection:"EPSG:4326"})),this.props.controls.rotate&&t.addControl(new r.control.Rotate({})),this.props.controls.scaleLine&&t.addControl(new r.control.ScaleLine({})),this.props.controls.zoomToExtent&&t.addControl(new r.control.ZoomToExtent({}))}},t.prototype.draw=function(e){this.setState(function(t){return{activeDrawingTool:t.activeDrawingTool===e?null:e}})},t.prototype.activateDrawTool=function(e){var t=this;e.getInteractions().getArray().forEach(function(e){e instanceof r.interaction.Draw&&e.setActive(e.get("type")===t.state.activeDrawingTool)})},t.prototype.addDraw=function(e,t){var n=new r.source.Vector,o=new r.layer.Vector({source:n}),a=new r.interaction.Draw({source:n,type:t});a.set("type",t),a.setActive(!1),e.addInteraction(a),e.addLayer(o)},t.prototype.componentDidUpdate=function(e,t){var n=this.state.target,o=this.state.map;o&&(o.setTarget(n),o.getView().animate({center:r.proj.fromLonLat(this.props.center||[0,0]),zoom:this.props.zoom,duration:250}),this.activateDrawTool(o))},t.prototype.componentWillUnmount=function(){this.setState({target:null})},t}(n.PureComponent);t.OpenLayers=s}),define("components/maplet",["require","exports","react","components/openlayers","common/common"],function(e,t,n,o,r){"use strict";t.__esModule=!0;var a=function(e){function t(t){var n=e.call(this,t)||this;return t.drawPointTest=!0,n.state=n.props,n}return __extends(t,e),t.prototype.componentDidUpdate=function(e,t){t.portrait!=this.state.portrait&&window.dispatchEvent(new Event("resize"))},t.prototype.render=function(){var e=this,t=function(t,n){e.setState({center:t,zoom:n})},a=this.state.portrait?"portrait":"landscape";return n.createElement("div",null,r.input(this),this.state.showmap&&n.createElement("div",null,n.createElement("div",null,n.createElement("label",null,this.state.center.map(function(e){return e.toFixed(5)}).join(",")," Z",this.state.zoom)),n.createElement(o.OpenLayers,{orientation:a,controls:{draw:{point:this.state.drawPointTest},zoom:!0,zoomToExtent:!0},setCenter:t,center:this.state.center,zoom:this.state.zoom,osm:!1}),n.createElement(o.OpenLayers,{orientation:a,controls:{mousePosition:!0,draw:{point:this.state.drawPointTest}},bingImagerySet:"AerialWithLabels",setCenter:t,center:this.state.center,zoom:this.state.zoom,layers:{geoJson:["http://openlayers.org/en/master/examples/data/geojson/countries.geojson"]}}),n.createElement(o.OpenLayers,{orientation:a,controls:{fullScreen:!0,draw:{point:this.state.drawPointTest}},bingImagerySet:"Aerial",setCenter:t,center:this.state.center,zoom:this.state.zoom,layers:{geoJson:["https://gist.githubusercontent.com/ca0v/78c82dbcb184d52f784a9aa11a452272/raw/5929e9469e02363665017202394aabba906845ae/trip.geojson"]}}),n.createElement(o.OpenLayers,{orientation:a,allowPan:!1,allowZoom:!1,controls:{scaleLine:!0,draw:{circle:!0,line:!0,point:!0,polygon:!0}},osm:!0,setCenter:t,center:this.state.center,zoom:this.state.zoom})))},t}(n.PureComponent);t.Maplet=a}),define("components/quizlet",["require","exports","components/openlayers","react","common/common","openlayers"],function(e,t,n,o,r,a){"use strict";t.__esModule=!0;var i,s={right:new a.style.Style({fill:new a.style.Fill({color:[0,128,0,.5]}),text:new a.style.Text({text:"☺",scale:5}),stroke:new a.style.Stroke({color:[20,200,200,1],width:2})}),wrong:new a.style.Style({fill:new a.style.Fill({color:[255,0,0,.5]}),text:new a.style.Text({text:"☹",scale:5}),stroke:new a.style.Stroke({color:[200,20,200,1],width:2})}),indeterminate:new a.style.Style({stroke:new a.style.Stroke({color:[20,20,200,1],width:2})})},c=function(e){function t(t){var n=e.call(this,t)||this;return n.state={answer:"Click the map to Begin!",center:[0,0],zoom:1,score:0,features:new a.Collection},n}return __extends(t,e),t.prototype.render=function(){var e=this;return o.createElement("div",{className:"quizlet"},o.createElement(n.OpenLayers,{orientation:"full",center:this.state.center,zoom:this.state.zoom,controls:{mousePosition:!0},bingImagerySet:"Aerial",layers:{geoJson:[this.props.geojsonUrl]},setCenter:function(t,n){e.setState(function(){return{center:t,zoom:n}})},onFeatureClick:function(t){if(i&&i.length)if(e.test(t.feature))e.state.features.push(t.feature);else{var n=e.find();n&&e.state.features.push(n)}else e.init(t.layer),e.next()},onLayerAdd:function(t){return setTimeout(function(){e.init(t.layer),e.next()},500)}},o.createElement(n.OpenLayers,{className:"inset",bingImagerySet:"AerialWithLabels",center:this.state.center,allowZoom:!0,allowPan:!0,orientation:"landscape",onFeatureClick:function(){},features:this.state.features})),o.createElement("div",{className:"score"},"Score",o.createElement("label",null,this.state.score)),o.createElement("div",{className:"score"},"Find",o.createElement("label",null,this.state.answer)),o.createElement("br",null),o.createElement("div",{className:"score"},o.createElement("button",{onClick:function(){e.score(-1),e.state.answer&&i.unshift(e.state.answer),e.next()}},"Skip"),o.createElement("button",{onClick:function(){e.score(-5),e.hint()}},"Hint")))},t.prototype.score=function(e){this.setState(function(t){return{score:t.score+e}})},t.prototype.init=function(e){var t=e.getSource(),n=this.props.featureNameFieldName,o=t.getFeatures();o.forEach(function(e){return e.setStyle(s.indeterminate)}),i=r.shuffle(o.map(function(e){return e.get(n)}));var c=o[Math.floor(Math.random()*i.length)];this.setState(function(t){return{layer:e,center:a.proj.transform(a.extent.getCenter(c.getGeometry().getExtent()),"EPSG:3857","EPSG:4326"),zoom:8,score:0}})},t.prototype.test=function(e){var t=this,n=this.props.featureNameFieldName,o=e.get(n)===this.state.answer;if(o)this.score(20),e.setStyle(s.right),this.next();else{this.score(-20);var r=this.find();if(r){r.setStyle(s.wrong);var c=a.extent.getCenter(r.getGeometry().getExtent());this.setState(function(e){return{center:a.proj.transform(c,"EPSG:3857","EPSG:4326"),zoom:6}}),this.state.answer&&i.unshift(this.state.answer),setTimeout(function(){return t.next()},2500)}}return o},t.prototype.next=function(){i.length&&this.setState(function(e){return{answer:i.pop()}})},t.prototype.find=function(){var e=this;if(this.state.layer){var t=this.state.layer.getSource();if(t){var n=t.getFeatures().filter(function(t){return t.get(e.props.featureNameFieldName)===e.state.answer});if(n&&1===n.length){var o=n[0];return o}return null}}},t.prototype.hint=function(){var e=this.find();if(e){var t=a.extent.getCenter(e.getGeometry().getExtent());this.setState(function(e){return{center:a.proj.transform(t,"EPSG:3857","EPSG:4326"),zoom:e.zoom+.25}})}},t}(o.PureComponent);t.QuizletComponent=c}),define("app",["require","exports","react","components/quizlet"],function(e,t,n,o){"use strict";t.__esModule=!0;var r=function(e){function t(t){var n=e.call(this,t)||this;return n.state={orientation:"landscape",url:"./data/countries.json"},n}return __extends(t,e),t.prototype.render=function(){return n.createElement("div",{className:"app"},n.createElement("title",null,"React + Openlayers Lab"),n.createElement(o.QuizletComponent,{geojsonUrl:this.state.url,featureNameFieldName:"name"}))},t}(n.PureComponent);t.App=r}),define("index",["require","exports","react","react-dom","app"],function(e,t,n,o,r){"use strict";function a(){o.render(n.createElement(r.App,{showmap:!0,center:[-82.408,34.789],zoom:12}),document.querySelector("app"))}return a}),define("components/index",["require","exports","react"],function(e,t,n){"use strict";t.__esModule=!0;var o=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return __extends(t,e),t}(n.PureComponent);t.IndexComponent=o});
//# sourceMappingURL=index.js.map