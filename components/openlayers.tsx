import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ol = require('openlayers');

export type Orientations = "portrait" | "landscape";

interface OpenLayersProps {
    title?: string;
    osm?: boolean;
    bing?: boolean;
    center?: [number, number];
    zoom?: number;
    orientation?: Orientations;
}

interface OpenLayersState {
    map?: ol.Map;
    target: Element | null;
    center: [number, number];
    zoom: number;
}

export class OpenLayers extends React.PureComponent<OpenLayersProps, OpenLayersState> {

    constructor(props: OpenLayersProps) {
        super(props);
        this.state = {
            target: null,
            zoom: props.zoom || 0,
            center: props.center || [0, 0],
        };
    }

    get title() {
        return this.props.title || this.state.center.map(v => v.toPrecision(5)).join(',');
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
                center: ol.proj.fromLonLat(this.state.center),
                zoom: this.state.zoom
            })
        });

        map.on("moveend", () => {
            let center = map.getView().getCenter();
            this.setState({
                center: ol.proj.toLonLat(center)
            });
        });

        if (this.props.osm) {
            map.addLayer(new ol.layer.Tile({ source: new ol.source.OSM() }));
        }
        if (this.props.bing) {
            map.addLayer(new ol.layer.Tile({
                source: new ol.source.BingMaps({
                    key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                    imagerySet: 'Aerial'
                })
            }));
        }

        this.setState((prev, prop) => ({
            map: map,
        }));

    }

    componentDidUpdate(prevProp: OpenLayersProps, prevState: OpenLayersState) {
        let target: any = this.state.target; // how to cast in tsx?
        this.state.map && this.state.map.setTarget(target);
    }

    componentWillUnmount() {
    }
}