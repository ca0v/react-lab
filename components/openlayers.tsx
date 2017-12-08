import {
    PureComponent as Component,
    createElement as create,
    Children,
    ReactElement
} from 'react';

import { debounce } from "../common/common";
import * as ol from "openlayers";

function addGeoJsonLayer(map: ol.Map, url: string) {
    // how to access parent map to add layer...should be a inferred "props" of sorts
    let vector = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON()
        })
    });

    map.addLayer(vector);

    return vector;
}


export type Orientations = "portrait" | "landscape" | "full";

interface OpenLayersProps {
    className?: string;
    setCenter?: (v: [number, number], z: number) => void;
    title?: string;
    bingImagerySet?: "Aerial" | "AerialWithLabels" | "Birdseye" | "CanvasDark" | "CanvasLight" | "CanvasGray" | "Road" | "RoadOnDemand" | "BirdseyeV2WithLabels";
    osm?: boolean;
    center?: [number, number];
    zoom?: number;
    orientation?: Orientations;
    features?: ol.Collection<ol.Feature>;
    allowPan?: boolean;
    allowZoom?: boolean;
    allowKeyboard?: boolean;
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
    layers?: {
        geoJson?: string[]
    };
    onFeatureClick?: (args: { layer: ol.layer.Vector, feature: ol.Feature }) => void;
    onClick?: (args: { coordinate: ol.Coordinate }) => void;
    onLayerAdd?: (args: { layer: ol.layer.Vector }) => void;
    trigger?: { message: string, args: any[] };
}

interface OpenLayersState {
    map?: ol.Map;
    target: Element | null;
    activeDrawingTool?: ol.geom.GeometryType;
}

class Toolbar extends Component<{}, {}> {
    render() {
        return <span className="toolbar">{this.props.children}</span>;
    }
}

export class OpenLayers extends Component<OpenLayersProps, OpenLayersState> {

    constructor(props: OpenLayersProps) {
        super(props);
        this.state = {
            target: null,
        };
    }

    trigger(message: string, args: any): void;
    trigger(message: "refresh", args: {}): void;
    trigger(message: "extent", args: { extent: ol.Extent }): void;
    trigger(message: string, args: any) {
        let map = this.state.map;
        if (!map) return;

        switch (message) {
            case "refresh":
                map.getLayers().getArray()
                    .filter(l => l instanceof ol.layer.Vector)
                    .map((l: any) => l.getSource().changed())
                break;
            case "extent":
                let p: { extent: ol.Extent } = args;
                let view: any = map.getView();
                let resolution = view.getResolutionForExtent(p.extent);
                let zoom = view.getZoomForResolution(resolution);
                //map.getView().fit(p.extent);
                view.animate({
                    center: ol.extent.getCenter(p.extent),
                    zoom: zoom,
                })
                break;
        }
    }

    render() {
        let map = this.state.map;
        let DrawControls = () => <Toolbar />;
        if (this.props.controls) {
            if (this.props.controls.draw) {
                let draw = this.props.controls.draw;
                DrawControls = () => <Toolbar>
                    {draw.point &&
                        <button
                            className={`${(this.state.activeDrawingTool === "Point") ? 'active' : 'inactive'}`}
                            onClick={() => map && this.draw("Point")}>Point</button>
                    }
                    {draw.circle &&
                        <button
                            className={`${(this.state.activeDrawingTool === "Circle") ? 'active' : 'inactive'}`}
                            onClick={() => map && this.draw("Circle")}>Circle</button>
                    }
                    {draw.line &&
                        <button
                            className={`${(this.state.activeDrawingTool === "LineString") ? 'active' : 'inactive'}`}
                            onClick={() => map && this.draw("LineString")}>Line</button>
                    }
                    {draw.polygon &&
                        <button
                            className={`${(this.state.activeDrawingTool === "Polygon") ? 'active' : 'inactive'}`}
                            onClick={() => map && this.draw("Polygon")}>Polygon</button>
                    }
                </Toolbar>
            }
        }

        return <div className={`maplet ${this.props.className || ""} ${this.props.orientation || ''}`}>
            {this.props.title && <label>{this.props.title}</label>}
            <div className={`map`} ref={v => this.setState({ target: v })}></div>
            <DrawControls />
            {this.props.children}
        </div>;
    }

    componentDidMount() {
        let map = new ol.Map({
            view: new ol.View({
                center: this.props.center || ol.proj.fromLonLat([0, 0]),
                zoom: this.props.zoom || 0
            }),
            controls: [],
            interactions: [],
            keyboardEventTarget: this.props.allowKeyboard ? document : undefined,
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

        map.on("singleclick", (args: ol.MapBrowserEvent) => {
            this.props.onClick && this.props.onClick({ coordinate: args.coordinate });
        });

        map.on("moveend", debounce(() => {
            this.props.setCenter && this.props.setCenter(map.getView().getCenter(), map.getView().getZoom());
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

        if (this.props.features) {
            let layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: this.props.features
                })
            });
            map.addLayer(layer);
        }

        this.setState((prev, prop) => ({
            map: map,
        }));

        if (this.props.layers) {
            if (this.props.layers.geoJson) {
                this.props.layers.geoJson.forEach(url => {
                    let vector = addGeoJsonLayer(map, url);
                    if (this.props.onLayerAdd) {
                        this.props.onLayerAdd({ layer: vector });
                    }
                    if (this.props.onFeatureClick) {
                        map.on("click", (args: ol.MapBrowserEvent) => {
                            if (this.props.onFeatureClick) {
                                let features = map.getFeaturesAtPixel(args.pixel);
                                if (!features) return;
                                if (features.length !== 1) return;
                                let feature = features[0];
                                if (feature instanceof ol.Feature) {
                                    this.props.onFeatureClick({ layer: vector, feature: feature });
                                }
                            }
                        });
                    }
                })
            }
        }

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

    draw(type: ol.geom.GeometryType) {
        this.setState((prev) => ({
            activeDrawingTool: prev.activeDrawingTool === type ? null : type
        }));
    }

    activateDrawTool(map: ol.Map) {
        map.getInteractions().getArray().forEach(interaction => {
            if (interaction instanceof ol.interaction.Draw) {
                interaction.setActive(interaction.get("type") === this.state.activeDrawingTool);
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
