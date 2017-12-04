import {
    PureComponent as Component,
    createElement as create,
    Children,
    ReactElement
} from 'react';

import { debounce } from "../common/common";
import * as ol from "openlayers";

export type Orientations = "portrait" | "landscape";

interface OpenLayersProps {
    setCenter?: (v: [number, number], z: number) => void;
    title?: string;
    bingImagerySet?: string;
    osm?: boolean;
    labels?: boolean;
    center: [number, number];
    zoom: number;
    orientation?: Orientations;
    allowPan?: boolean;
    allowZoom?: boolean;
    controls?: {
        draw?: {
            point?: boolean;
            circle?: boolean;
            line?: boolean;
            polygon?: boolean;
        };
        zoom?: boolean;
        zoomSlider?: boolean;
        zoomToExtent?: boolean;
        fullScreen?: boolean;
        mousePosition?: boolean;
        rotate?: boolean;
        scaleLine?: boolean;
    };
    geoJsonUrl?: string;
}

interface OpenLayersState {
    map?: ol.Map;
    target: Element | null;
}

export class OpenLayers extends Component<OpenLayersProps, OpenLayersState> {

    constructor(props: OpenLayersProps) {
        super(props);
        this.state = {
            target: null,
        };
    }

    render() {
        let map = this.state.map;        
        let DrawControls = () => <div />;
        if (this.props.controls) {
            if (this.props.controls.draw) {
                let draw = this.props.controls.draw;
                DrawControls = () => <div>
                    {draw.point && <button onClick={() => map && this.draw(map, "Point")}>Point</button>}
                    {draw.circle && <button onClick={() => map && this.draw(map, "Circle")}>Circle</button>}
                    {draw.line && <button onClick={() => map && this.draw(map, "LineString")}>Line</button>}
                    {draw.polygon && <button onClick={() => map && this.draw(map, "Polygon")}>Polygon</button>}
                </div>
            }
        }

        return <div className='maplet'>
            {this.props.title && <label>{this.props.title}</label>}
            <div className={`map ${this.props.orientation || ''}`} ref={v => this.setState({ target: v })}></div>
            <DrawControls />
            {this.props.children}
        </div>;
    }

    /**
     * BAD PRACTICE - Makes map available to child components
     */
    parent() {
        return this;
    }

    /**
     * BAD PRACTICE - Makes map available to child components
     */
    public static childContextTypes = {
        parent: OpenLayers
    }

    componentDidMount() {
        let map = new ol.Map({
            view: new ol.View({
                center: ol.proj.fromLonLat(this.props.center),
                zoom: this.props.zoom
            }),
            controls: [],
            interactions: [],
        });

        if (this.props.allowPan !== false) {
            map.addInteraction(new ol.interaction.DragPan());
            map.addInteraction(new ol.interaction.KeyboardPan());
        }
        if (this.props.allowZoom !== false) {
            map.addInteraction(new ol.interaction.MouseWheelZoom());
            map.addInteraction(new ol.interaction.DragZoom());
        }

        map.on("moveend", debounce(() => {
            this.props.setCenter && this.props.setCenter(
                ol.proj.toLonLat(map.getView().getCenter()),
                map.getView().getZoom());
        }, 50));

        if (this.props.bingImagerySet) {
            map.addLayer(new ol.layer.Tile({
                source: new ol.source.BingMaps({
                    key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                    imagerySet: this.props.bingImagerySet
                })
            }));
        } else if (this.props.osm !== false) {
            map.addLayer(new ol.layer.Tile({ source: new ol.source.OSM() }));
        }

        this.setState((prev, prop) => ({
            map: map,
        }));

        // one alternative is to not use child components but properties...
        this.props.geoJsonUrl && GeoJsonLayer.addGeoJsonLayer(map, this.props.geoJsonUrl);

        // another is to use child components and pass parent to a handler..
        Children.forEach(this.props.children, c => {
            c;
            if (typeof c === "string") return;
            if (typeof c === "number") return;
            let child: any = c;
            if (child.type === GeoJsonLayer) {
                GeoJsonLayer.addGeoJsonLayer(map, c.props.url);
            }
        });

        // I would prefer that the child trigger a cascading event that the parent could receive
        // and process

        if (this.props.controls) {

            if (this.props.controls.draw) {
                let draw = this.props.controls.draw;
                if (draw.point || draw.circle || draw.line || draw.polygon) {
                    draw.polygon && this.addDraw(map, "Polygon");
                    draw.circle && this.addDraw(map, "Circle");
                    draw.line && this.addDraw(map, "LineString");
                    draw.point && this.addDraw(map, "Point");
                }
            }

            if (this.props.controls.zoom) {
                map.addControl(new ol.control.Zoom({
                }));
            }
            else if (this.props.controls.zoomSlider) {
                map.addControl(new ol.control.ZoomSlider({
                }));
            }

            if (this.props.controls.fullScreen) {
                map.addControl(new ol.control.FullScreen({
                }));
            }

            if (this.props.controls.mousePosition) {
                map.addControl(new ol.control.MousePosition({
                    coordinateFormat: v => !v ? "" : v.map(c => c.toFixed(4)).join(","),
                    projection: "EPSG:4326"
                }));
            }

            if (this.props.controls.rotate) {
                map.addControl(new ol.control.Rotate({
                }));
            }

            if (this.props.controls.scaleLine) {
                map.addControl(new ol.control.ScaleLine({
                }));
            }

            if (this.props.controls.zoomToExtent) {
                map.addControl(new ol.control.ZoomToExtent({
                }));
            }
        }

    }

    draw(map: ol.Map, type: ol.geom.GeometryType) {
        map.getInteractions().getArray().forEach(interaction => {
            if (interaction instanceof ol.interaction.Draw) {
                if (interaction.get("type") === type) {
                    // toggle
                    interaction.setActive(!interaction.getActive());
                } else {
                    // disable
                    interaction.setActive(false);
                }
            }
        });
    }

    addDraw(map: ol.Map, type: ol.geom.GeometryType) {
        let source = new ol.source.Vector();
        let layer = new ol.layer.Vector({
            source: source
        });

        let interaction = new ol.interaction.Draw({
            source: source,
            type: type
        });
        interaction.set("type", type);

        interaction.setActive(false);
        map.addInteraction(interaction);

        map.addLayer(layer);
    }

    componentDidUpdate(prevProp: OpenLayersProps, prevState: OpenLayersState) {
        let target: any = this.state.target; // how to cast in tsx?
        let map = this.state.map;
        if (map) {
            map.setTarget(target);
            map.getView().animate({
                center: ol.proj.fromLonLat(this.props.center),
                zoom: this.props.zoom,
                duration: 250
            });
        }
    }

    componentWillUnmount() {
        // will this force the map to be destroyed?
        this.setState({ target: null });
    }

}

export interface GeoJsonLayerProps {
    url: string;
}

export interface GeoJsonLayerState {
}

/**
 * This is not the react way I don't think...but what *is* the react way?
 * Need a shared state between parent/children so they all get access to "map"
 */
export class GeoJsonLayer extends Component<GeoJsonLayerProps, GeoJsonLayerState> {
    render() {
        return <div>Here I am</div>;
    }

    static addGeoJsonLayer(map: ol.Map, url: string) {
        // how to access parent map to add layer...should be a inferred "props" of sorts
        let vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: url,
                format: new ol.format.GeoJSON()
            })
        });

        map.addLayer(vector);
    }

    componentDidMount() {
        // how to access parent map to add layer...should be a inferred "props" of sorts
        let vector = new ol.layer.Vector({
            source: new ol.source.Vector({
                url: this.props.url,
                format: new ol.format.GeoJSON()
            })
        });

        console.log("context:", this.context);
        let parent: OpenLayers = this.context.parent;
        if (parent && parent.state.map) {
            parent.state.map.getLayers().insertAt(0, vector);
        }
    }

    /**
     * BAD PRACTICE - Makes map available to this component
     */
    public static contextTypes = {
        parent: OpenLayers
    }
}