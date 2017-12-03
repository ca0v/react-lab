import { PureComponent as Component, createElement as create } from 'react';
import { render } from "react-dom";
import { OpenLayers } from "./openlayers";

export interface ToggleMapState {
    showmap: boolean;
    center: [number, number];
    zoom: number;
}

export interface ToggleMapProps {
    showmap: boolean;
    center: [number, number];
    zoom: number;
    portrait?: boolean;
}

export class ToggleMap extends Component<ToggleMapProps, ToggleMapState> {

    constructor(props: ToggleMapProps) {
        super(props);
        this.state = this.props;
    }

    render() {

        let setCenter = (v: [number, number], z: number) => {
            this.setState({ center: v, zoom: z });
        };

        let orientation: "portrait"|"landscape" = this.props.portrait ? "portrait" : "landscape";

        return <div>
            {this.state.showmap && <div>
                <div>
                    <label>{this.state.center.map(v => v.toFixed(5)).join(",")} Z{this.state.zoom}</label>
                </div>
                <OpenLayers
                    orientation = {orientation}
                    controls={{ zoom: true, zoomToExtent: true }}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
                <OpenLayers
                    orientation = {orientation}
                    controls={{ fullScreen: true }}
                    bingImagerySet="Aerial"
                    labels={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
                <OpenLayers
                    orientation = {orientation}
                    controls={{ mousePosition: true }}
                    bingImagerySet="AerialWithLabels"
                    labels={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
                <OpenLayers
                    orientation = {orientation}
                    controls={{ scaleLine: true }}
                    bingImagerySet="Road"
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
