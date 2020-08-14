import {
    PureComponent as Component,
    createElement as create,
    Children,
    ReactElement
} from 'react';

import { Toolbar } from "./index";
import { debounce, Dictionary, EventDispatcher } from "../common/common";
import Map from "@ol/Map";
import VectorSource from "@ol/source/Vector";
import VectorLayer from "@ol/layer/Vector";
import Geometry from '@ol/geom/Geometry';
import { GeoJSON } from '@ol/format';
import View from '@ol/View';
import { fromLonLat } from "@ol/proj";
import * as interaction from "@ol/interaction";
import type MapBrowserEvent from '@ol/MapBrowserEvent';
import Feature from '@ol/Feature';
import type Collection from '@ol/Collection';
import type { Coordinate } from '@ol/coordinate';
import BingMaps from "@ol/source/BingMaps";
import XYZ from "@ol/source/XYZ";
import OSM from "@ol/source/OSM";
import TileLayer from "@ol/layer/Tile";
import TileSource from '@ol/source/Tile';
import type { Extent } from '@ol/extent';
import * as extent from '@ol/extent';
import Zoom from "@ol/control/Zoom";
import ZoomSlider from "@ol/control/ZoomSlider";
import FullScreen from "@ol/control/FullScreen";
import MousePosition from "@ol/control/MousePosition";
import Rotate from "@ol/control/Rotate";
import ScaleLine from "@ol/control/ScaleLine";
import ZoomToExtent from "@ol/control/ZoomToExtent";

const ol = {
    interaction,
    control:
    {
        ScaleLine,
        Rotate,
        MousePosition,
        FullScreen,
        Zoom,
        ZoomSlider,
        ZoomToExtent,
    },
    source: {
        XYZ,
        OSM,
        Vector: VectorSource
    },
    layer: {
        Vector: VectorLayer
    }
};

function addSourceLayer(map: Map, source: VectorSource<Geometry>) {
    let vector = new VectorLayer({
        source: source
    });
    map.addLayer(vector);

    return vector;
}

function addGeoJsonLayer(map: Map, url: string) {
    // how to access parent map to add layer...should be a inferred "props" of sorts
    let vector = new VectorLayer({
        source: new VectorSource({
            url: url,
            format: new GeoJSON()
        })
    });

    map.addLayer(vector);

    return vector;
}


export type Orientations = "portrait" | "landscape" | "full";
export type BingImagerySet = "Aerial" | "AerialWithLabels" | "Birdseye" | "CanvasDark" | "CanvasLight" | "CanvasGray" | "Road" | "RoadOnDemand" | "BirdseyeV2WithLabels";
export type OtherImagerySet = "WaterColor" | "WaterColorWithLabels" | "Black" | "BlackWithLabels" | "EsriAerial" | "EsriAerialWithLabels" | "CanvasDarkWithLabels"

interface OpenLayersProps {
    className?: string;
    setCenter?: (v: [number, number], z: number) => void;
    title?: string;
    bingImagerySet?: BingImagerySet | OtherImagerySet;
    osm?: boolean;
    center?: [number, number];
    zoom?: number;
    orientation?: Orientations;
    features?: Collection<Feature<Geometry>>;
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
        geoJson?: string[];
        source?: VectorSource<Geometry>[];
    };
    onFeatureClick?: (args: { layer: VectorLayer, feature: Feature<Geometry>, coordinate: Coordinate }) => void;
    onClick?: (args: { coordinate: Coordinate, map: Map }) => void;
    onLayerAdd?: (args: { layer: VectorLayer }) => void;
    trigger?: { message: string, args: any[] };
}

interface OpenLayersState {
    map?: Map;
    target: Element | null;
    activeDrawingTool?: string;
}

export class OpenLayers extends Component<OpenLayersProps, OpenLayersState> {

    private dispatcher = new EventDispatcher<any>();

    constructor(props: OpenLayersProps) {
        super(props);
        this.state = {
            target: null,
        };

        {
            let bingLayerCache: Dictionary<BingMaps> = {};
            let bingLayer: TileLayer;

            this.dispatcher.on("basemap-toggle", (args: { map: Map }) => {
                let map = args.map || this.state.map;
                let layerType = this.props.bingImagerySet;
                if (!map) return;
                if (!layerType) return;

                let source = bingLayerCache[layerType] as TileSource;

                switch (layerType) {
                    case "WaterColor":
                    case "WaterColorWithLabels":
                        {
                            if (!source) {
                                source = new ol.source.XYZ({
                                    url: `http://tile.stamen.com/watercolor/{z}/{x}/{y}.jpg`,
                                });
                            }
                            break;
                        }
                    case "EsriAerial":
                    case "EsriAerialWithLabels":
                        {
                            if (!source) {
                                source = new ol.source.XYZ({
                                    url: `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
                                });
                            }
                            break;
                        }
                    case "Black":
                    case "BlackWithLabels":
                        {
                            break;
                        }
                    case "CanvasDarkWithLabels":
                        layerType = "CanvasDark";
                    case "Aerial":
                    case "AerialWithLabels":
                    case "CanvasDark":
                    case "CanvasLight":
                    case "CanvasGray":
                    case "Road":
                        {
                            if (!source) {
                                source = bingLayerCache[layerType] = new BingMaps({
                                    key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                                    imagerySet: layerType
                                });
                            }
                            break;
                        }
                    default:
                        {
                            console.log(`unknown layer type: ${layerType}`);
                            break;
                        }
                }
                if (!bingLayer) {
                    bingLayer = new TileLayer({ source: source });
                    map.getLayers().insertAt(0, bingLayer);
                } else {
                    bingLayer.setSource(source);
                }

            });
        }

        this.dispatcher.on("ensure-extent-visible", (args: { extent: Extent }) => {
            const map = this.state.map;
            if (!map) return;
            const view = map.getView();

            // get the current extent
            const currentExtent = view.calculateExtent() as Extent;
            const targetExtent = args.extent;

            if (extent.containsExtent(currentExtent, targetExtent)) return;

            const scale = (10 * extent.getWidth(targetExtent)) / extent.getWidth(currentExtent);
            const currentRes = view.getResolution();
            const targetRes = currentRes * ((0.9 < scale && scale < 1.1) ? 1 : scale);
            const targetZoom = view.getZoomForResolution(targetRes);

            view.animate({
                center: extent.getCenter(targetExtent),
                zoom: targetZoom,
            });
        });

    }

    trigger(message: string, args: any): void;
    trigger(message: "refresh", args: {}): void;
    trigger(message: "extent", args: { extent: Extent }): void;
    trigger(message: string, args: any) {
        let map = this.state.map;
        if (!map) return;

        switch (message) {
            case "refresh":
                map.getLayers().getArray()
                    .filter(l => l instanceof VectorLayer)
                    .map((l: any) => l.getSource().changed())
                break;
            case "extent":
                let p: { extent: Extent } = args;
                let view: any = map.getView();
                let resolution = view.getResolutionForExtent(p.extent);
                let zoom = view.getZoomForResolution(resolution);
                //map.getView().fit(p.extent);
                view.animate({
                    center: extent.getCenter(p.extent),
                    zoom: zoom,
                })
                break;
            default:
                this.dispatcher.trigger(message, args);
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
        const map = new Map({
            view: new View({
                center: this.props.center || fromLonLat([0, 0]),
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

        map.on("singleclick", (args: MapBrowserEvent<UIEvent>) => {
            this.props.onClick && this.props.onClick({
                coordinate: args.coordinate,
                map: map,
            });
        });

        map.on("moveend", debounce(() => {
            this.props.setCenter && this.props.setCenter(map.getView().getCenter() as [number, number], map.getView().getZoom());
        }, 50));

        this.setState((prev, prop) => ({
            map: map,
        }));

        if (this.props.bingImagerySet) {
            this.dispatcher.trigger("basemap-toggle", { map: map });
        } else if (this.props.osm !== false) {
            map.addLayer(new TileLayer({ source: new ol.source.OSM() }));
        }

        if (this.props.features) {
            let layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: this.props.features
                })
            });
            map.addLayer(layer);
        }

        if (this.props.layers) {
            if (this.props.layers.source) {
                this.props.layers.source.forEach(source => {
                    let vector = addSourceLayer(map, source);
                    if (this.props.onLayerAdd) {
                        this.props.onLayerAdd({ layer: vector });
                    }
                    if (this.props.onFeatureClick) {
                        map.on("click", (args: MapBrowserEvent<UIEvent>) => {
                            if (this.props.onFeatureClick) {
                                let features = map.getFeaturesAtPixel(args.pixel);
                                if (!features) return;
                                if (features.length !== 1) return;
                                let feature = features[0];
                                if (feature instanceof Feature) {
                                    this.props.onFeatureClick({ layer: vector, feature: feature, coordinate: args.coordinate });
                                }
                            }
                        });
                    }
                })

            }
            if (this.props.layers.geoJson) {
                this.props.layers.geoJson.forEach(url => {
                    let vector = addGeoJsonLayer(map, url);
                    if (this.props.onLayerAdd) {
                        this.props.onLayerAdd({ layer: vector });
                    }
                    if (this.props.onFeatureClick) {
                        map.on("click", (args: MapBrowserEvent<any>) => {
                            if (this.props.onFeatureClick) {
                                let features = map.getFeaturesAtPixel(args.pixel);
                                if (!features) return;
                                if (features.length !== 1) return;
                                let feature = features[0];
                                if (feature instanceof Feature) {
                                    this.props.onFeatureClick({
                                        layer: vector,
                                        feature: feature,
                                        coordinate: args.coordinate
                                    });
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

    draw(type: string) {
        this.setState((prev) => ({
            activeDrawingTool: prev.activeDrawingTool === type ? null : type
        }));
    }

    activateDrawTool(map: Map) {
        map.getInteractions().getArray().forEach(interaction => {
            if (interaction instanceof ol.interaction.Draw) {
                interaction.setActive(interaction.get("type") === this.state.activeDrawingTool);
            }
        });
    }

    addDraw(map: Map, type: string) {
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
                center: this.props.center || fromLonLat([0, 0]),
                zoom: this.props.zoom,
                duration: 250
            });
            this.activateDrawTool(map);

            if (this.props.trigger) {
                if (this.props.trigger !== prevProp.trigger) {
                    this.trigger(this.props.trigger.message, this.props.trigger.args);
                }
            }
            if (prevProp.bingImagerySet !== this.props.bingImagerySet) {
                this.dispatcher.trigger("basemap-toggle", { map: map });
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
