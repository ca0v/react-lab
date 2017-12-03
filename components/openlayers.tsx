import { PureComponent as Component, createElement as create } from 'react';
import { debounce } from "../common/common";
import * as ol from "openlayers";

export type Orientations = "portrait" | "landscape";

interface OpenLayersProps {
    setCenter?: (v: [number, number], z: number) => void;
    title?: string;
    bingImagerySet?: string;
    labels?: boolean;
    center: [number, number];
    zoom: number;
    orientation?: Orientations;
    controls?: {
        zoom?: boolean;
        zoomSlider?: boolean;
        zoomToExtent?: boolean;
        fullScreen?: boolean;
        mousePosition?: boolean;
        rotate?: boolean;
        scaleLine?: boolean;
    };
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
        return <div className='maplet'>
            {this.props.title && <label>{this.props.title}</label>}
            <div className={`map ${this.props.orientation || ''}`} ref={v => this.setState({ target: v })}></div>
        </div>;
    }

    componentDidMount() {
        let map = new ol.Map({
            view: new ol.View({
                center: ol.proj.fromLonLat(this.props.center),
                zoom: this.props.zoom
            }),
            controls: [],
        });

        if (this.props.controls) {

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
        } else {
            map.addLayer(new ol.layer.Tile({ source: new ol.source.OSM() }));
        }

        this.setState((prev, prop) => ({
            map: map,
        }));

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
    }
}