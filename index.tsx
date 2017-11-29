import { Component as MyFooComponent } from './components/myfoo';
import * as React from 'react'

export class Templates {

    private _value: string;
    public get value(): string {
        return this._value;
    }
    public set value(v: string) {
        this._value = v;
    }

    t1(title: string) {
        return <h1>{title}</h1>;
    }

    t2(list: string[]) {
        return <ul>{list.map(v => <li title={v} key={v}>{v}</li>)}</ul>;
    }

    t3() {
        return <div className="container"><MyFooComponent /></div>;
    }
}