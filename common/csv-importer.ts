import { Dictionary } from "./common";

export class Transform {
    transform(data: string) {
        let dataItems = data.split("\n");
        let header = dataItems.shift();

        if (header) {
            let headers = header.split("\t");
            return dataItems.map(row => {
                let fields = row.split("\t");
                let result: Dictionary<string> = {};
                headers.forEach((name, index) => {
                    let value = fields[index];
                    if (value !== "") {
                        result[name] = value;
                    }
                });
                return result;
            })
        }
        return [];
    }
}
