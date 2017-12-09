var __extends=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var r in t)t.hasOwnProperty(r)&&(e[r]=t[r])};return function(t,r){function o(){this.constructor=t}e(t,r),t.prototype=null===r?Object.create(r):(o.prototype=r.prototype,new o)}}();define("common/common",["require","exports","react"],function(e,t,r){"use strict";function o(e){return Object.keys(e).map(function(t){return r.createElement("li",{key:t},t,": ",e[t])})}function n(e){for(var t,r,o=e.length;0!==o;)r=Math.floor(Math.random()*o),o-=1,t=e[o],e[o]=e[r],e[r]=t;return e}function a(e){var t={};return Object.keys(e).forEach(function(r){return t[e[r]]=!0}),Object.keys(t)}function s(e){var t=e.state,o=Object.keys(t).map(function(o){var n=t[o],a={number:{type:"number",value:"valueAsNumber"},"boolean":{type:"checkbox",value:"checked"},string:{type:"text",value:"value"},undefined:{type:"text",value:"value"}},s=a[typeof n]||a.string;return r.createElement("div",null,r.createElement("label",{className:"input"},o),r.createElement("input",{key:o,type:s.type,value:n,checked:n,placeholder:o,onChange:function(t){e.setState((r={},r[o]=t.target[s.value],r));var r}}))});return r.createElement("div",null,o)}t.__esModule=!0,t.dump=o,t.debounce=function(e,t){void 0===t&&(t=200);var r;return function(){var o=function(){clearTimeout(r),e()};clearTimeout(r),r=setTimeout(o,t)}},t.shuffle=n;var i=function(){function e(){this.localStorage=window.localStorage||{setItem:function(e){},getItem:function(){return""}}}return e.prototype.setItem=function(e){this.localStorage.setItem("globals",JSON.stringify(e))},e.prototype.getItem=function(){var e=this.localStorage.getItem("globals")||"{}";return JSON.parse(e)},e}();t.distinct=a,t.storage=new i,t.input=s}),define("components/openlayers",["require","exports","react","common/common","openlayers"],function(e,t,r,o,n){"use strict";function a(e,t){var r=new n.layer.Vector({source:t});return e.addLayer(r),r}function s(e,t){var r=new n.layer.Vector({source:new n.source.Vector({url:t,format:new n.format.GeoJSON})});return e.addLayer(r),r}t.__esModule=!0;var i=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return __extends(t,e),t.prototype.render=function(){return r.createElement("span",{className:"toolbar"},this.props.children)},t}(r.PureComponent),c=function(e){function t(t){var r=e.call(this,t)||this;return r.state={target:null},r}return __extends(t,e),t.prototype.trigger=function(e,t){var r=this.state.map;if(r)switch(e){case"refresh":r.getLayers().getArray().filter(function(e){return e instanceof n.layer.Vector}).map(function(e){return e.getSource().changed()});break;case"extent":var o=t,a=r.getView(),s=a.getResolutionForExtent(o.extent),i=a.getZoomForResolution(s);a.animate({center:n.extent.getCenter(o.extent),zoom:i})}},t.prototype.render=function(){var e=this,t=this.state.map,o=function(){return r.createElement(i,null)};if(this.props.controls&&this.props.controls.draw){var n=this.props.controls.draw;o=function(){return r.createElement(i,null,n.point&&r.createElement("button",{className:""+("Point"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("Point")}},"Point"),n.circle&&r.createElement("button",{className:""+("Circle"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("Circle")}},"Circle"),n.line&&r.createElement("button",{className:""+("LineString"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("LineString")}},"Line"),n.polygon&&r.createElement("button",{className:""+("Polygon"===e.state.activeDrawingTool?"active":"inactive"),onClick:function(){return t&&e.draw("Polygon")}},"Polygon"))}}return r.createElement("div",{className:"maplet "+(this.props.className||"")+" "+(this.props.orientation||"")},this.props.title&&r.createElement("label",null,this.props.title),r.createElement("div",{className:"map",ref:function(t){return e.setState({target:t})}}),r.createElement(o,null),this.props.children)},t.prototype.componentDidMount=function(){var e=this,t=new n.Map({view:new n.View({center:this.props.center||n.proj.fromLonLat([0,0]),zoom:this.props.zoom||0}),controls:[],interactions:[],keyboardEventTarget:this.props.allowKeyboard?document:void 0});if(this.props.allowPan!==!1&&(t.addInteraction(new n.interaction.DragPan),t.addInteraction(new n.interaction.KeyboardPan)),this.props.allowZoom!==!1&&(t.addInteraction(new n.interaction.MouseWheelZoom),t.addInteraction(new n.interaction.PinchZoom),t.addInteraction(new n.interaction.DragZoom),t.addInteraction(new n.interaction.KeyboardZoom)),t.on("singleclick",function(t){e.props.onClick&&e.props.onClick({coordinate:t.coordinate})}),t.on("moveend",o.debounce(function(){e.props.setCenter&&e.props.setCenter(t.getView().getCenter(),t.getView().getZoom())},50)),this.props.bingImagerySet?t.addLayer(new n.layer.Tile({source:new n.source.BingMaps({key:"AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl",imagerySet:this.props.bingImagerySet})})):this.props.osm!==!1&&t.addLayer(new n.layer.Tile({source:new n.source.OSM})),this.props.features){var r=new n.layer.Vector({source:new n.source.Vector({features:this.props.features})});t.addLayer(r)}if(this.setState(function(e,r){return{map:t}}),this.props.layers&&(this.props.layers.source&&this.props.layers.source.forEach(function(r){var o=a(t,r);e.props.onLayerAdd&&e.props.onLayerAdd({layer:o}),e.props.onFeatureClick&&t.on("click",function(r){if(e.props.onFeatureClick){var a=t.getFeaturesAtPixel(r.pixel);if(!a)return;if(1!==a.length)return;var s=a[0];s instanceof n.Feature&&e.props.onFeatureClick({layer:o,feature:s})}})}),this.props.layers.geoJson&&this.props.layers.geoJson.forEach(function(r){var o=s(t,r);e.props.onLayerAdd&&e.props.onLayerAdd({layer:o}),e.props.onFeatureClick&&t.on("click",function(r){if(e.props.onFeatureClick){var a=t.getFeaturesAtPixel(r.pixel);if(!a)return;if(1!==a.length)return;var s=a[0];s instanceof n.Feature&&e.props.onFeatureClick({layer:o,feature:s})}})})),this.props.controls){if(this.props.controls.draw){var i=this.props.controls.draw;(i.point||i.circle||i.line||i.polygon)&&(i.polygon&&this.addDraw(t,"Polygon"),i.circle&&this.addDraw(t,"Circle"),i.line&&this.addDraw(t,"LineString"),i.point&&this.addDraw(t,"Point"))}this.props.controls.zoom?t.addControl(new n.control.Zoom({})):this.props.controls.zoomSlider&&t.addControl(new n.control.ZoomSlider({})),this.props.controls.fullScreen&&t.addControl(new n.control.FullScreen({})),this.props.controls.mousePosition&&t.addControl(new n.control.MousePosition({coordinateFormat:function(e){return e?e.map(function(e){return e.toFixed(4)}).join(","):""},projection:"EPSG:4326"})),this.props.controls.rotate&&t.addControl(new n.control.Rotate({})),this.props.controls.scaleLine&&t.addControl(new n.control.ScaleLine({})),this.props.controls.zoomToExtent&&t.addControl(new n.control.ZoomToExtent({}))}},t.prototype.draw=function(e){this.setState(function(t){return{activeDrawingTool:t.activeDrawingTool===e?null:e}})},t.prototype.activateDrawTool=function(e){var t=this;e.getInteractions().getArray().forEach(function(e){e instanceof n.interaction.Draw&&e.setActive(e.get("type")===t.state.activeDrawingTool)})},t.prototype.addDraw=function(e,t){var r=new n.source.Vector,o=new n.layer.Vector({source:r}),a=new n.interaction.Draw({source:r,type:t});a.set("type",t),a.setActive(!1),e.addInteraction(a),e.addLayer(o)},t.prototype.componentDidUpdate=function(e,t){var r=this.state.target,o=this.state.map;o&&(o.setTarget(r),o.getView().animate({center:this.props.center||n.proj.fromLonLat([0,0]),zoom:this.props.zoom,duration:250}),this.activateDrawTool(o),this.props.trigger&&this.props.trigger!==e.trigger&&this.trigger(this.props.trigger.message,this.props.trigger.args))},t.prototype.componentWillUnmount=function(){this.setState({target:null})},t}(r.PureComponent);t.OpenLayers=c}),define("components/maplet",["require","exports","react","components/openlayers","common/common"],function(e,t,r,o,n){"use strict";t.__esModule=!0;var a=function(e){function t(t){var r=e.call(this,t)||this;return t.drawPointTest=!0,r.state=r.props,r}return __extends(t,e),t.prototype.componentDidUpdate=function(e,t){t.portrait!=this.state.portrait&&window.dispatchEvent(new Event("resize"))},t.prototype.render=function(){var e=this,t=function(t,r){e.setState({center:t,zoom:r})},a=this.state.portrait?"portrait":"landscape";return r.createElement("div",null,n.input(this),this.state.showmap&&r.createElement("div",null,r.createElement("div",null,r.createElement("label",null,this.state.center.map(function(e){return e.toFixed(5)}).join(",")," Z",this.state.zoom)),r.createElement(o.OpenLayers,{orientation:a,controls:{draw:{point:this.state.drawPointTest},zoom:!0,zoomToExtent:!0},setCenter:t,center:this.state.center,zoom:this.state.zoom,osm:!1}),r.createElement(o.OpenLayers,{orientation:a,controls:{mousePosition:!0,draw:{point:this.state.drawPointTest}},bingImagerySet:"AerialWithLabels",setCenter:t,center:this.state.center,zoom:this.state.zoom,layers:{geoJson:["http://openlayers.org/en/master/examples/data/geojson/countries.geojson"]}}),r.createElement(o.OpenLayers,{orientation:a,controls:{fullScreen:!0,draw:{point:this.state.drawPointTest}},bingImagerySet:"Aerial",setCenter:t,center:this.state.center,zoom:this.state.zoom,layers:{geoJson:["https://gist.githubusercontent.com/ca0v/78c82dbcb184d52f784a9aa11a452272/raw/5929e9469e02363665017202394aabba906845ae/trip.geojson"]}}),r.createElement(o.OpenLayers,{orientation:a,allowPan:!1,allowZoom:!1,controls:{scaleLine:!0,draw:{circle:!0,line:!0,point:!0,polygon:!0}},osm:!0,setCenter:t,center:this.state.center,zoom:this.state.zoom})))},t}(r.PureComponent);t.Maplet=a}),define("components/quizlet",["require","exports","components/openlayers","react","common/common","openlayers"],function(e,t,r,o,n,a){"use strict";function s(e){var t=20-Math.log(e.get("population"));return Math.round(t)}function i(e){var t=e;return t}t.__esModule=!0;var c={textFillColor:[200,200,200,1],textBorderColor:[200,100,20,1],correctFillColor:[20,100,20,.3],correctBorderColor:[20,100,20,1],incorrectFillColor:[200,20,20,.3],incorrectBorderColor:[200,20,20,1],borderColor:[200,100,20,1],hintBorderColor:[200,20,200,1],noColor:[0,0,0,0]},l={correct:function(e){return function(t,r){return[new a.style.Style({fill:new a.style.Fill({color:i(c.correctFillColor)}),stroke:new a.style.Stroke({color:i(c.correctBorderColor),width:2})}),new a.style.Style({text:new a.style.Text({text:""+t.get(e.props.featureNameFieldName),scale:2,fill:new a.style.Fill({color:i(c.textFillColor)}),stroke:new a.style.Stroke({color:i(c.correctBorderColor),width:2})})})]}},wrong:function(e){return function(t,r){var o=t.get(e.props.featureNameFieldName);switch(t.getGeometry().getType()){case"Point":return new a.style.Style({image:new a.style.Circle({radius:10,stroke:new a.style.Stroke({color:i(c.incorrectBorderColor),width:1}),fill:new a.style.Fill({color:i(c.incorrectFillColor)})}),text:new a.style.Text({text:50>r?o:"",scale:1.5,stroke:new a.style.Stroke({color:i(c.textBorderColor),width:1}),fill:new a.style.Fill({color:i(c.textFillColor)})})});default:return[new a.style.Style({fill:new a.style.Fill({color:i(c.incorrectFillColor)}),stroke:new a.style.Stroke({color:i(c.incorrectBorderColor),width:2})}),new a.style.Style({text:new a.style.Text({text:t.get(e.props.featureNameFieldName),scale:2,fill:new a.style.Fill({color:i(c.textFillColor)}),stroke:new a.style.Stroke({color:i(c.incorrectBorderColor),width:2})})})]}}},indeterminate:function(e){return function(t,r){var o=t.get(e.props.featureNameFieldName),n=e.state.hint||0,l=n>1,u=e.state.answer===o,p=n>1&&u;switch(t.getGeometry().getType()){case"Point":return new a.style.Style({image:new a.style.Circle({radius:18+2*((u?e.state.hint||1:0)-s(t)),stroke:new a.style.Stroke({color:i(c.borderColor),width:1+n/2}),fill:new a.style.Fill({color:i(c.textFillColor)})}),text:new a.style.Text({text:50+10*n>r?o:"",scale:1.5,stroke:new a.style.Stroke({color:i(c.textBorderColor),width:1}),fill:new a.style.Fill({color:i(c.textFillColor)})})});default:return new a.style.Style({text:new a.style.Text({text:l?o:"",scale:2,stroke:new a.style.Stroke({color:i(c.textBorderColor),width:2}),fill:new a.style.Fill({color:i(c.textFillColor)})}),stroke:new a.style.Stroke({color:i(p?c.hintBorderColor:c.borderColor),width:2})})}}}},u=function(e){function t(t){var r=e.call(this,t)||this;return r.state={answer:"Click the map to Begin!",center:[0,0],zoom:1,score:n.storage.getItem().score||0,features:new a.Collection,answers:[]},r}return __extends(t,e),t.prototype.render=function(){var e=this;return o.createElement("div",{className:"quizlet"},o.createElement(r.OpenLayers,{trigger:this.state.mapTrigger,allowKeyboard:!0,orientation:"full",center:this.state.center,zoom:this.state.zoom,controls:{mousePosition:!0},bingImagerySet:"Aerial",layers:{source:[this.props.source]},setCenter:function(t,r){e.setState(function(){return{center:t,zoom:r}})},onLayerAdd:function(e){var t=e.layer.getSource();t.once("addfeature",n.debounce(function(){},500))},onFeatureClick:function(t){var r=t.layer.getSource();r.removeFeature(t.feature),t.feature.setId(1e4*Math.random()),r.addFeature(t.feature),r.changed();var o=e.state.answers;if(o&&o.length)if(e.test(t.feature)){if(e.score(20),t.feature.setStyle(l.correct(e)),e.state.answer&&0===e.state.hint){var a=n.storage.getItem();a[e.state.answer]=(a[e.state.answer]||0)+1,a.score=e.state.score,n.storage.setItem(a)}e.next(),e.state.features.push(t.feature)}else{e.score(-20);var s=e.find();s&&(s.setStyle(l.wrong(e)),e.zoomToFeature(s),e.state.features.push(s),e.skip())}else{t.feature.get(e.props.featureNameFieldName);e.init(t.layer),e.next()}}},o.createElement(r.OpenLayers,{className:"inset",osm:!1,center:this.state.center,zoom:Math.max(0,this.state.zoom-5),allowZoom:!0,allowPan:!0,orientation:"landscape",onClick:function(t){e.setState(function(e){return{center:t.coordinate}})},layers:{geoJson:["./data/countries.json"]},features:this.state.features})),o.createElement("div",{className:"score"},"Score",o.createElement("label",null,this.state.score)),o.createElement("div",{className:"score"},"Find",o.createElement("label",null,this.state.answer)),!!this.state.answers.length&&o.createElement("div",{className:"score"},"Remaining",o.createElement("label",null,1+this.state.answers.length||"?")),o.createElement("br",null)," ",o.createElement("div",{className:"score"},o.createElement("button",{onClick:function(){return e.skip()}},"Skip"),o.createElement("button",{onClick:function(){return e.hint()}},"Hint")))},t.prototype.skip=function(){if(this.state.answer){this.score(-1);var e=this.state.answers;e&&e.unshift(this.state.answer),this.next()}},t.prototype.score=function(e){this.setState(function(t){return{score:t.score+e}});var t=n.storage.getItem();t.score=this.state.score,n.storage.setItem(t)},t.prototype.generate=function(e){var t=this.props.featureNameFieldName,r=n.storage.getItem();this.setState(function(e){return{score:r.score||0}}),delete r.score;for(var o=e.filter(function(e){var t=s(e);return 5>t}).map(function(e){return e.get(t)}),a=n.distinct(r).map(function(e){return parseInt(e)}).sort().reverse(),i=o,c=function(){o=i;var e=a.pop()||0;console.log("removing where count >= "+e),i=i.filter(function(t){return!r[t]||r[t]<e})};a.length&&i.length>10;)c();return n.shuffle(o),o.length>10&&(o=o.splice(0,10)),o},t.prototype.init=function(e){var t=this,r=e.getSource(),o=r.getFeatures();o.forEach(function(e){return e.setStyle(l.indeterminate(t))}),this.setState(function(r){return{layer:e,answers:t.generate(o)}}),document.addEventListener("keypress",function(e){switch(e.key.toUpperCase()){case"H":t.hint();break;case"S":t.skip()}})},t.prototype.test=function(e){var t=this.props.featureNameFieldName,r=e.get(t)===this.state.answer;return r},t.prototype.zoomToFeature=function(e,t){void 0===t&&(t=1);var r=function(e,t){var r=a.extent.getCenter(e),o=Math.max(1e3,a.extent.getWidth(e),a.extent.getHeight(e))*t;return[r[0]-o,r[1]-o,r[0]+o,r[1]+o]};this.setState(function(o){return{mapTrigger:{message:"extent",args:{extent:r(e.getGeometry().getExtent(),t)}}}})},t.prototype.next=function(){var e=this.state.answers;e.length&&this.setState(function(t){return{answer:e.pop(),hint:0}})},t.prototype.find=function(){var e=this;if(this.state.layer){var t=this.state.layer.getSource();if(t){var r=t.getFeatures().filter(function(t){return t.get(e.props.featureNameFieldName)===e.state.answer});if(r&&1===r.length){var o=r[0];return o}return null}}},t.prototype.hint=function(){var e=this.find();if(e){this.score(-5);var t=a.extent.getCenter(e.getGeometry().getExtent());this.setState(function(e){return{hint:(e.hint||0)+1,mapTrigger:{message:"refresh"},center:t,zoom:Math.min(12,5+(e.hint||0)+1)}})}},t}(o.PureComponent);t.QuizletComponent=u}),define("common/csv-importer",["require","exports"],function(e,t){"use strict";t.__esModule=!0;var r=function(){function e(){}return e.prototype.transform=function(e){var t=e.split("\n"),r=t.shift();if(r){var o=r.split("	");return t.map(function(e){var t=e.split("	"),r={};return o.forEach(function(e,o){var n=t[o];""!==n&&(r[e]=n)}),r})}return[]},e}();t.Transform=r}),define("app",["require","exports","react","components/quizlet"],function(e,t,r,o){"use strict";function n(e,t){switch(t.type){case"geojson":var r=new a;r.load(t,function(t){var r=t.features.map(function(e){var t=new ol.Feature,r=new ol.geom.Point(e.geometry.coordinates,"XY");return r.transform("EPSG:4326","EPSG:3857"),t.setGeometry(r),t.setProperties(e.properties),t});e.addFeatures(r)})}}t.__esModule=!0;var a=function(){function e(){}return e.prototype.load=function(e,t){var r=new XMLHttpRequest;r.open("GET",e.url,!0),r.onloadend=function(){var o=JSON.parse(r.responseText);o.features=o.features.filter(function(t){return e.filter(t.properties)}),t(o)},r.send()},e}(),s={"usa great lakes":{url:"https://gist.githubusercontent.com/tristanwietsma/6046119/raw/f5e8654b5a811199d2f2190b3090d1c1e3488436/greatlakes.geojson",name:"NAME"},"world countries":{url:"./data/countries.json",name:"name"},"usa city centers":{url:"./data/us-cities.json",name:"name"},"world city centers":{type:"geojson",url:"./data/cities.json",loader:a,name:"city",radius:function(e){return Math.log(e.population)},filter:function(e){return e.population>1e7}},"usa states":{url:"./data/us-states.json",name:"name"}},i=function(e){function t(t){var r=e.call(this,t)||this,o=s["world city centers"],a=new ol.source.Vector;return r.state={orientation:"landscape",source:a,featureNameFieldName:o.name},n(a,o),r}return __extends(t,e),t.prototype.render=function(){return r.createElement("div",{className:"app"},r.createElement("title",null,"React + Openlayers Lab"),r.createElement(o.QuizletComponent,{source:this.state.source,featureNameFieldName:this.state.featureNameFieldName}))},t}(r.PureComponent);t.App=i}),define("index",["require","exports","react","react-dom","app"],function(e,t,r,o,n){"use strict";function a(){o.render(r.createElement(n.App,{showmap:!0,center:[-82.408,34.789],zoom:12}),document.querySelector("app"))}return a}),define("components/index",["require","exports","react"],function(e,t,r){"use strict";t.__esModule=!0;var o=function(e){function t(){return null!==e&&e.apply(this,arguments)||this}return __extends(t,e),t}(r.PureComponent);t.IndexComponent=o});
//# sourceMappingURL=index.js.map