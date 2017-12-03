import {PureComponent as Component, createElement as create} from 'react';

export function dump(o: any) {
    return Object.keys(o).map(k => <li key={k}>{k}: {o[k]}</li>);
}

// https://davidwalsh.name/javascript-debounce-function
export let debounce = (func: () => void, wait = 200) => {
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


export function input(c: React.PureComponent) {
    let o: any = c.state;
    let inputs = Object.keys(o).map(k => {
        let value = o[k];

        let typeMaps = {
            'number': { type: 'number', value: 'valueAsNumber' },
            'boolean': { type: 'checkbox', value: 'checked' },
            'string': { type: 'text', value: 'value' },
            'undefined': { type: 'text', value: 'value' },
        }

        let typeMap = typeMaps[typeof value] || typeMaps.string;
        return <div><label className="input">{k}</label>
            <input
                key={k}
                type={typeMap.type}
                value={value}
                checked={value}
                placeholder={k}
                onChange={event => { c.setState({ [k]: event.target[typeMap.value] }) }}
            />
        </div>
    });
    return <div>{inputs}</div>;
}