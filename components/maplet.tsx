import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";
import { OpenLayers } from "./openlayers";
import { input } from "../common/common";

export interface MapletStates {
    showmap: boolean;
    center: [number, number];
    zoom: number;
    drawPointTest?: boolean;
    portrait?: boolean;
}

export interface MapletProps extends MapletStates {
}

export class Maplet extends Component<MapletProps, MapletStates> {

    constructor(props: MapletProps) {
        super(props);
        props.drawPointTest = true;
        this.state = this.props;
    }

    componentDidUpdate(prevProp: MapletProps, prevState: MapletStates) {
        if (prevState.portrait != this.state.portrait) {
            // help openlayers detect resize
            window.dispatchEvent(new Event('resize'));
        }
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
                        draw: {
                            point: this.state.drawPointTest,
                        },
                        zoom: true,
                        zoomToExtent: true,
                    }}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    osm={false}>
                </OpenLayers>
                <OpenLayers
                    orientation={orientation}
                    controls={{
                        mousePosition: true,
                        draw: {
                            point: this.state.drawPointTest,
                        },
                    }}
                    bingImagerySet="AerialWithLabels"
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    layers={{
                        geoJson: ["http://openlayers.org/en/master/examples/data/geojson/countries.geojson"]
                    }} />
                <OpenLayers
                    orientation={orientation}
                    controls={{
                        fullScreen: true,
                        draw: {
                            point: this.state.drawPointTest,
                        },
                    }}
                    bingImagerySet="Aerial"
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom}
                    layers={{
                        geoJson: ["https://gist.githubusercontent.com/ca0v/78c82dbcb184d52f784a9aa11a452272/raw/5929e9469e02363665017202394aabba906845ae/trip.geojson"]
                    }} />
                <OpenLayers
                    orientation={orientation}
                    allowPan={false}
                    allowZoom={false}
                    controls={{
                        scaleLine: true,
                        draw: {
                            circle: true,
                            line: true,
                            point: true,
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

}
