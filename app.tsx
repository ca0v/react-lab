import * as React from 'react';
import {Component as MyFoo} from './components/myfoo';
import {Templates} from './index';

class App extends React.Component {
    render() {
        let T = new Templates();
    
        return <div className="application">
            {T.t1("My Title")}
            <MyFoo/>
            {T.t2("My List Of Items".split(" "))}
        </div>
    }
}

export = App;