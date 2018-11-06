import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'transformConfig'
})
export class TransformConfigPipe implements PipeTransform {
    public transform(config: any): any {
        const newConfig = [];
        config.forEach(item => {
            toSection(item, newConfig);
        });
        return newConfig;
    }
}

function  toSection(item, list) {
    const section = list.find(element => {
        return element.type === 'section' && element.id === item.Section;
    });
    if (section) {
        toFieldSet(item, section.list);
    } else if (!section && item.Section !== undefined) {
        const tmp = [];
        toFieldSet(item, tmp);
        list.push({
            id: item.Section,
            type: 'section',
            header: item.Sectionheader,
            list: tmp
        });
    } else {
        toFieldSet(item, list);
    }
}

function  toFieldSet(item, list) {
    const fieldset = list.find(element => element.type === 'fieldset' && element.id === item.FieldSet);
    if (fieldset) {
        fieldset.list.push(item);
    } else if (!fieldset && item.FieldSet !== undefined) {
        list.push({
            id: item.FieldSet,
            type: 'fieldset',
            header: item.Legend,
            list: [item]
        });
    } else {
        list.push(item);
    }
}

