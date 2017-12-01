require('ol/ol.css');
import * as React from 'react';
import * as ol from "openlayers";

export type Orientations = "portrait" | "landscape";

// https://davidwalsh.name/javascript-debounce-function
let debounce = (func: () => void, wait = 200) => {
    let timeout: any;
    return () => {
        let later = () => {
            clearTimeout(timeout);
            func();
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    }
}

interface OpenLayersProps {
    setCenter?: (v: [number, number], z: number) => void;
    title?: string;
    bingImagerySet?: string;
    labels?: boolean;
    center: [number, number];
    zoom: number;
    orientation?: Orientations;
}

interface OpenLayersState {
    map?: ol.Map;
    target: Element | null;
}

export class OpenLayers extends React.PureComponent<OpenLayersProps, OpenLayersState> {

    constructor(props: OpenLayersProps) {
        super(props);
        this.state = {
            target: null,
        };
    }

    get title() {
        return this.props.title;
    }

    render() {
        return <div className='maplet'>
            {this.title && <label>{this.title}</label>}
            <div className={`map ${this.props.orientation || ''}`} ref={v => this.setState({ target: v })}></div>
        </div>;
    }

    componentDidMount() {
        let map = new ol.Map({
            view: new ol.View({
                center: ol.proj.fromLonLat(this.props.center),
                zoom: this.props.zoom
            })
        });

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