require('./index.css');
import * as React from "react";
import { render } from "react-dom";
import Button from "material-ui/Button";
import { OpenLayers } from "./components/openlayers";

interface AppState {
}

interface AppProps {
    showmap: boolean;
    bing?: boolean;
    center: [number, number];
    zoom: number;
}

interface ToggleMapState {
    showmap: boolean;
    center: [number, number];
    zoom: number;
}

interface ToggleMapProps {
    showmap: boolean;
    bing?: boolean;
    center: [number, number];
    zoom: number;
}

class ToggleMap extends React.PureComponent<ToggleMapProps, ToggleMapState> {

    constructor(props: ToggleMapProps) {
        super(props);
        this.state = this.props;
    }

    render() {

        let setCenter = (v: [number, number], z: number) => {
            this.setState({ center: v, zoom: z });
        };

        return <div>
            <Button color="primary" onClick={() => this.toggleMap()}>{this.state.center.map(v => v.toFixed(5)).join(",")} Z{this.state.zoom}</Button>
            {this.state.showmap && <div>
                <OpenLayers
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
                <OpenLayers
                    bingImagerySet="Aerial"
                    labels={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
                <OpenLayers
                    bingImagerySet="AerialWithLabels"
                    labels={true}
                    setCenter={setCenter}
                    center={this.state.center}
                    zoom={this.state.zoom} />
                <OpenLayers
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

class App extends React.PureComponent<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = this.props;
    }

    render() {
        return <div>
            <ToggleMap showmap={this.props.showmap} center={this.props.center} zoom={this.props.zoom} />
        </div>;
    }
}

render(<App showmap={true} center={[-82.408, 34.789]} zoom={12} />, document.querySelector("#root"));

