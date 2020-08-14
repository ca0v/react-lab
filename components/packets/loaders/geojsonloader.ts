import { IPacket, IGeoJson, IGeoJsonFeature } from "../common";

function load<T>(url: string) {
    return new Promise<T>((resolve, reject) => {
        let client = new XMLHttpRequest();
        client.open("GET", url, true);
        client.onloadend = () => {
            let json = JSON.parse(client.responseText);
            resolve(json);
        };
        client.send();
    });
}

export class Loader<T extends { weight: number }> {

    load(packet: IPacket<T>, cb: (data: IGeoJson<T>) => void) {
        if (Array.isArray(packet.url)) {
            this.multiload(packet, cb);
            return;
        }
        load<IGeoJson<T>>(packet.url).then(async geoJson => {
            if (packet.filter) {
                const filter = await packet.filter;
                geoJson.features = geoJson.features.filter(f => filter(f, packet.score || 0));
            }
            if (packet.weight) {
                geoJson.features.forEach(f => f.properties.weight = packet.weight ? packet.weight(f) : 1);
            }
            cb(geoJson);
        });
    }

    multiload(packet: IPacket<T>, cb: (data: IGeoJson<T>) => void) {

        if (!Array.isArray(packet.url)) {
            this.load(packet, cb);
            return;
        }
        let promises = packet.url.map(url => load<IGeoJsonFeature<T> & IGeoJson<T>>(url));

        Promise.all(promises).then(async data => {
            let allGeoJson: IGeoJson<T>;
            allGeoJson = {
                features: [],
                type: "FeatureCollection",
            };

            data.forEach(geoJson => {
                if (Array.isArray(geoJson.features)) {
                    allGeoJson.features = allGeoJson.features.concat(geoJson.features);
                } else {
                allGeoJson.features.push(geoJson);
                }
            });
            if (packet.filter) {
                const filter = await packet.filter;
                allGeoJson.features = allGeoJson.features.filter(f => filter(f, packet.score || 0));
            }
            if (packet.weight) {
                allGeoJson.features.forEach(f => f.properties.weight = packet.weight ? packet.weight(f) : 1);
            }
            cb(allGeoJson);
        });
    }

}

