import { IPacket, IGeoJson } from "../common";

export class Loader<T extends { weight: number }> {

    load(packet: IPacket<T>, cb: (data: IGeoJson<T>) => void) {
        let client = new XMLHttpRequest();
        client.open("GET", packet.url, true);
        client.onloadend = () => {
            let geoJson: IGeoJson<T> = JSON.parse(client.responseText);
            if (packet.filter) {
                geoJson.features = geoJson.features.filter(f => !packet.filter || packet.filter(f, packet.score || 0));
            }
            if (packet.weight) {
                geoJson.features.forEach(f => f.properties.weight = packet.weight ? packet.weight(f) : 1);
            }
            cb(geoJson);
        };
        client.send();
    }

}

