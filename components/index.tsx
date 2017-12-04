import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";
import { OpenLayers, GeoJsonLayer } from "./openlayers";
import { input } from "../common/common";

export interface ToggleMapState {
    showmap: boolean;
    center: [number, number];
    zoom: number;
    drawPointTest?: boolean;
    portrait?: boolean;
}

export interface ToggleMapProps extends ToggleMapState {
}

export class ToggleMap extends Component<ToggleMapProps, ToggleMapState> {

    constructor(props: ToggleMapProps) {
        super(props);
        props.drawPointTest = true;
        this.state = this.props;
    }

    onMountMap() {

    }

    onMountLayerMap() {

    }

    render(): any {

        let setCenter = (v: [number, number], z: number) => {
            this.setState({ center: v, zoom: z });
        };

        let orientation: "portrait" | "landscape" = this.state.portrait ? "portrait" : "landscape";

        return <div>
            {input(this)}
            {this.state.showmap && <div>
                <div>
                    <label>{this.state.center.map(v => v.toFixed(5)).join(",")} Z{this.state.zoom}</label>
                </div>
                <OpenLayers
                    orientation={orientation}
                    controls={{
                        zoom: true,
                        zoomToExtent: true,
                    }}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    osm={false}>
                    <GeoJsonLayer url="http://openlayers.org/en/master/examples/data/geojson/countries.geojson" />
                </OpenLayers>
                <OpenLayers
                    orientation={orientation}
                    controls={{ mousePosition: true }}
                    bingImagerySet="AerialWithLabels"
                    labels={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    geoJsonUrl="http://openlayers.org/en/master/examples/data/geojson/countries.geojson" />
                <OpenLayers
                    orientation={orientation}
                    controls={{ fullScreen: true }}
                    bingImagerySet="Aerial"
                    labels={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    geoJsonUrl="https://gist.githubusercontent.com/ca0v/78c82dbcb184d52f784a9aa11a452272/raw/5929e9469e02363665017202394aabba906845ae/trip.geojson" />
                <OpenLayers
                    orientation={orientation}
                    allowPan={false}
                    allowZoom={false}
                    controls={{
                        scaleLine: true,
                        draw: {
                            circle: true,
                            line: true,
                            point: this.state.drawPointTest,
                            polygon: true,
                        }
                    }}
                    osm={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
            </div>}
        </div>;
    }

    toggleMap() {
        this.setState(prev => ({
            showmap: !prev.showmap
        }));
    }

}
