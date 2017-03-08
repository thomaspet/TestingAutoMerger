import {Injectable} from '@angular/core';
import {Dimensions} from '../../unientities';

export enum DimensionTypes {
    Project = 1,
    Department = 2,
    Region = 3,
    Responsible = 4
}

export function createGuid(): string {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0, 3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
}

export function checkGuid(item) {
    if ((!item.createguid) && (!item.ID)) {
        item._createguid = createGuid();
    }
}

@Injectable()
export class Dimension extends Dimensions {

    public static setNewGuid(dim: any) {
        dim._createguid = createGuid();
    }

    public static setProject(dim: any, value: any) {
        Dimension.setValue(dim, value, 'Project');
    }

    public static setDepartment(dim: any, value: any) {
        Dimension.setValue(dim, value, 'Department');
    }

    public static setValue(dim: any, value: any, pfx = 'Project') {
        var p1 = pfx + 'ID';
        if (!dim._createguid) { Dimension.setNewGuid(dim); }
        if (typeof value === 'object') {
            dim[p1] = value.ID;
            dim[pfx] = value; // { ID: value.ID, Name: value.Name };
        } else {
            dim[p1] = value;
        }
    }
}

export class DimensionService {
    public static getEntityNameFromDimensionType(dimensionType: number) {
        let entityName = '';
        if (dimensionType.toString() === DimensionTypes.Project.toString()) {
            entityName = 'Project';
        } else if (dimensionType.toString() === DimensionTypes.Department.toString()) {
            entityName = 'Department';
        }

        return entityName;
    }

    public static getEntityDisplayNameFromDimensionType(dimensionType: number) {
        let displayName = '';
        if (dimensionType.toString() === DimensionTypes.Project.toString()) {
            displayName = 'Prosjekt';
        } else if (dimensionType.toString() === DimensionTypes.Department.toString()) {
            displayName = 'Avdeling';
        }
        return displayName;
    }
}
