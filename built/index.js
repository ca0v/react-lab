var __extends=this&&this.__extends||function(){var e=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t}||function(e,t){for(var n in t)t.hasOwnProperty(n)&&(e[n]=t[n])};return function(t,n){function o(){this.constructor=t}e(t,n),t.prototype=null===n?Object.create(n):(o.prototype=n.prototype,new o)}}();define("common/common",["require","exports","react"],function(e,t,n){"use strict";function o(e){return Object.keys(e).map(function(t){return n.createElement("li",{key:t},t,": ",e[t])})}function r(e){var t=e.state,o=Object.keys(t).map(function(o){var r=t[o],i={number:{type:"number",value:"valueAsNumber"},"boolean":{type:"checkbox",value:"checked"},string:{type:"text",value:"value"},undefined:{type:"text",value:"value"}},l=i[typeof r]||i.string;return n.createElement("div",null,n.createElement("label",{className:"input"},o),n.createElement("input",{key:o,type:l.type,value:r,checked:r,placeholder:o,onChange:function(t){e.setState((n={},n[o]=t.target[l.value],n));var n}}))});return n.createElement("div",null,o)}Object.defineProperty(t,"__esModule",{value:!0}),t.dump=o,t.input=r}),define("components/myfoo",["require","exports","react","common/common"],function(e,t,n,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(e){function t(t){return e.call(this,t)||this}return __extends(t,e),t.prototype.input=function(){var e=o.input(this);return e},t.prototype.render=function(){return n.createElement("div",{className:"component"},n.createElement("h5",null,this.props.title),n.createElement("label",null,"props: ",n.createElement("ol",null,o.dump(this.props))),n.createElement("label",null,"state: ",n.createElement("ol",null,o.dump(this.state))),n.createElement("div",null,this.input()))},t.prototype.tick=function(){this.setState(function(e){return{ticks:(e.ticks||0)+1}})},t.prototype.componentWillMount=function(){var e=this;this.setState(function(t,n){return{tickHandler:window.setInterval(function(){return e.tick()},1e3),about:t&&t.about||"About"}})},t.prototype.componentWillUnmount=function(){clearInterval(this.state.tickHandler)},t}(n.PureComponent);t.Component=r}),define("components/openlayers",["require","exports","react","openlayers"],function(e,t,n,o){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function(e){function t(t){var n=e.call(this,t)||this;return n.state={target:null,zoom:t.zoom||0,center:t.center||[0,0]},n}return __extends(t,e),Object.defineProperty(t.prototype,"title",{get:function(){return this.props.title||this.state.center.map(function(e){return e.toPrecision(5)}).join(",")},enumerable:!0,configurable:!0}),t.prototype.render=function(){var e=this;return n.createElement("div",{className:"maplet"},this.title&&n.createElement("label",null,this.title),n.createElement("div",{className:"map "+(this.props.orientation||""),ref:function(t){return e.setState({target:t})}}))},t.prototype.componentDidMount=function(){var e=this,t=new o.Map({view:new o.View({center:o.proj.fromLonLat(this.state.center),zoom:this.state.zoom})});t.on("moveend",function(){var n=t.getView().getCenter();e.setState({center:o.proj.toLonLat(n)})}),this.props.osm&&t.addLayer(new o.layer.Tile({source:new o.source.OSM})),this.props.bing&&t.addLayer(new o.layer.Tile({source:new o.source.BingMaps({key:"AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl",imagerySet:"Aerial"})})),this.setState(function(e,n){return{map:t}})},t.prototype.componentDidUpdate=function(e,t){var n=this.state.target;this.state.map&&this.state.map.setTarget(n)},t.prototype.componentWillUnmount=function(){},t}(n.PureComponent);t.OpenLayers=r}),define("app",["require","exports","react","react-dom","components/myfoo","common/common","components/openlayers"],function(e,t,n,o,r,i,l){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var c=function(e){function t(t){var n=e.call(this,t)||this;return n.state={value:t.value||0,title:t.title||"untitled",showComponents:!1},n}return __extends(t,e),Object.defineProperty(t.prototype,"title",{get:function(){return this.state.title||this.props.title},enumerable:!0,configurable:!0}),t.prototype.input=function(){var e=i.input(this);return e},t.prototype.render=function(){var e=this;return n.createElement("div",{className:"application"},n.createElement("h3",null,this.title),n.createElement("label",null,"app props: ",n.createElement("ol",null,i.dump(this.props))),n.createElement("label",null,"app state: ",n.createElement("ol",null,i.dump(this.state))),n.createElement("div",null,this.input()),this.state.showComponents&&n.createElement("div",null,n.createElement("div",{className:"panel"},n.createElement(l.OpenLayers,{osm:!0,center:[-121.4944,38.5816],zoom:10,orientation:"portrait"}),n.createElement(l.OpenLayers,{bing:!0,center:[-73.994792,40.7408906],zoom:18}),n.createElement(l.OpenLayers,{osm:!0,center:[-82.394,34.8526],zoom:10})),n.createElement(r.Component,{title:"Component of "+this.title,value:2*this.state.value})),n.createElement("div",{className:"toolbar"},n.createElement("button",{onClick:function(){return e.increment()}},"Increment"),n.createElement("button",{onClick:function(){return e.destroy()}},"Destroy")))},t.prototype.destroy=function(){var e=o.findDOMNode(this).parentElement;e&&o.unmountComponentAtNode(e)},t.prototype.increment=function(){this.setState(function(e,t){return{value:e.value+1}})},t.prototype.componentWillMount=function(){console.log("componentWillMount",this)},t.prototype.componentWillUnMount=function(){console.log("componentWillUnMount",this)},t.prototype.componentDidMount=function(){console.log("componentDidMount",this)},t.prototype.componentWillReceiveProps=function(){console.log("componentWillReceiveProps",this)},t.prototype.componentDidUpdate=function(){console.log("componentDidUpdate",this)},t.prototype.componentWillUnmount=function(){console.log("componentWillUnmount",this)},t.prototype.componentWillUpdate=function(){console.log("componentWillUpdate",this)},t}(n.PureComponent);t.App=c}),define("index",["require","exports","app","react","react-dom"],function(e,t,n,o,r){"use strict";function i(){for(var e=document.getElementsByTagName("app"),t=[],i=0;i<e.length;i++){var l="App "+(i+1);t.push(r.render(o.createElement(n.App,{title:l}),e[i]))}return t}return i});
//# sourceMappingURL=index.js.map