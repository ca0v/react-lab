export declare module AgsJson {

    export interface FieldAliases {
        NAME: string;
        REC_DIST: string;
        AMENITY: string;
        KEYWORD: string;
        OBJECTID: string;
    }

    export interface SpatialReference {
        wkid: number;
        latestWkid: number;
    }

    export interface Field {
        name: string;
        type: string;
        alias: string;
        length: number;
    }

    export interface Attributes {
        NAME: string;
        REC_DIST: string;
        AMENITY: string;
        KEYWORD: string;
        OBJECTID: number;
    }

    export interface Feature {
        attributes: Attributes;
        geometry: any;
    }

    export interface RootObject {
        displayFieldName: string;
        fieldAliases: FieldAliases;
        geometryType: string;
        spatialReference: SpatialReference;
        fields: Field[];
        features: Feature[];
    }

}
