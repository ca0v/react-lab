import {createElement as create} from 'react';
import { render } from "react-dom";
import { App } from 'app';

function run() {
    render(<App showmap={true} center={[-82.408, 34.789]} zoom={12} />, document.querySelector("app"));
}

export = run;