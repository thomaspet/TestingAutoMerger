import { Injectable } from '@angular/core';
import { DimensionSettings, DimensionsInfo } from '@uni-entities';
export interface IDimensionTableField {
    id: number;
    identifyingField: string;
    name: string;
}
export type DimensionsField = '_Project'
    | '_Department'
    | '_ProjectTask'
    | '_Responsible'
    | '_Region'
    | '_Dimension5'
    | '_Dimension6'
    | '_Dimension7'
    | '_Dimension8'
    | '_Dimension9'
    | '_Dimension10';
@Injectable()
export class DimensionsColumnsFieldsService {

    constructor() { }

    public getDimensionFields(settings: DimensionSettings[], include: DimensionsField[] = []) {
        return [
            {field: '_Project', name: 'Prosjekt'},
            {field: '_Department', name: 'Avdeling'},
            {field: '_ProjectTask', name: 'ProsjektOppgave'},
            {field: '_Responsible', name: 'Ansvar'},
            {field: '_Region', name: 'Region'},
            ...settings
                .filter(setting => setting.IsActive)
                .map(setting => ({field: `_Dimension${setting.Dimension}`, name: setting.Label}))
        ]
        .filter(dim => !include.length || include.some(field => field === dim.field));
    }

    public getIdentifyingField(model: string) {
        switch (model) {
            case 'Project':
                return 'ProjectNumber';
            case 'Department':
                return 'DepartmentNumber';
            case 'Responsible':
                return 'NameOfResponsible';
            case 'Region':
                return 'RegionCode';
            default:
                return 'Number';
        }
    }

    public convertToTableFields(info: DimensionsInfo): {name: string, data: IDimensionTableField}[] {
        return Object
            .keys(info)
            .filter(key => !key.endsWith('ID'))
            .map(key => ({model: `_${this.getFieldModel(key)}`, from: key, to: this.getFieldName(key)}))
            .reduce((dataList, mapping) => {
                if (!dataList.some(d => d.name === mapping.model)) {
                    dataList.push({name: mapping.model, data: {}});
                }
                const data = dataList.find(d => d.name === mapping.model);
                data.data[mapping.to] = info[mapping.from];
                return dataList;
            }, []);
    }

    private getFieldModel(key: string) {
        if (key.endsWith('Code')) {
            return key.replace('Code', '');
        }
        if (key.endsWith('Number')) {
            return key.replace('Number', '');
        }
        return key.replace('Name', '');
    }

    private getFieldName(key: string) {
        if (key.endsWith('Name')) {
            return 'name';
        }
        return 'identifyingField';
    }
}
