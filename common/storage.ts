import { Dictionary, LocalStorage } from "../common/common";

export interface IStorage {
    score: number;
    stats: Dictionary<{
        correct: number;
        incorrect: number;
        hint: number;
    }>
};

function init() {
    let storage = new LocalStorage<Dictionary<IStorage>>();
    let data = storage.getItem();
    let result = {
        keys: () => Object.keys(data),
        save: () => storage.setItem(data),
        force: (key: string) => data[key] = data[key] || { score: 0, stats: {} },
        update: (key: string, cb: (item: IStorage) => IStorage) => cb(result.force(key)),
    };
    return result;
}

export let storage = init();
