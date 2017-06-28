import {Injectable} from '@angular/core';
import {UniComponentLayout, UniFieldLayout} from '../interfaces';

export enum FieldSize {
    Normal = 0,
    Double = 1,
    Quarter = 2,
    Full = 3
}

declare const _;

@Injectable()
export class LayoutBuilder {
    private _layout: UniComponentLayout = new UniComponentLayout(); 
    constructor() {}

    public createNewLayout() {
        this._layout = new UniComponentLayout();
        return this;
    }

    public getLayout() {
        return _.cloneDeep(this._layout);
    }

    public addField(
        name: string | UniFieldLayout,
        label?: string,
        fieldType?: number,
        size?: number,
        hideLabel?: boolean,
        section?: number,
        sectionHeader?: string,
        fieldset?: number,
        column?: number,
        legend?: string,
        options?: any
    ) {
        if (!this._layout) {
            this.createNewLayout();
        }
        let field = new UniFieldLayout();
        if (typeof name === 'string') {
            field.Property = <string>name;
            field.Label = label;
            field.FieldType = fieldType;
            field.Section = section ;
            field.FieldSet = fieldset
            field.Sectionheader = sectionHeader;
            field.Legend = legend;
            field.FieldSetColumn = column;
            field.Options = options;
            field.Classes = this.sizeClass(size);
        } else {
            field = name;
        }


        this._layout.Fields.push(field);
        return this;
    }

    private sizeClass(size = FieldSize.Normal) {
        var classes = [];
        switch (size) {
            case FieldSize.Double:
                classes.push('half-width');
                break;
            case FieldSize.Quarter:
                classes.push('quarter-width');
                break;
            case FieldSize.Full:
                classes.push('max-width');
                break;
        }
        return classes.length > 0 ? classes.join(' ') : undefined;
    }
}