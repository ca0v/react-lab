import { App } from 'app';
import * as React from 'react';
import * as reactDom from 'react-dom';

function run() {

    let nodes = document.getElementsByTagName("app");
    let apps = [];

    for (let i = 0; i < nodes.length; i++) {
        let title = `App ${i+1}`;
        apps.push(reactDom.render(<App title={title}/>, nodes[i]));
    }

    return apps;
}

export = run;