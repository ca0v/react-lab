import { IPacket, IGeoJson } from "../common";

import { AgsJson } from "../../../d.ts/agsjson";

export class Loader {

    load(url: string, cb: (data: AgsJson.RootObject) => void) {
        let client = new XMLHttpRequest();
        client.open("GET", url, true);
        client.onloadend = () => {
            cb(JSON.parse(client.responseText));
        };
        client.send();
    }
}