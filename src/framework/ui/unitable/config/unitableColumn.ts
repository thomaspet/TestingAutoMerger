import {UnitableAutocomplete} from '../controls/autocomplete';
import {UnitableTypeahead} from '../controls/typeahead';
import {UnitableTextInput} from '../controls/text';
import {UnitableNumberInput} from '../controls/number';
import {UnitableDateTimepicker} from '../controls/dateTimePicker/dateTimePicker';
import {UnitableSelect} from '../controls/select';
import {LocalDatePicker} from '../controls/localDatePicker/LocalDatePicker';
import {UniSearchWrapper} from '../controls/uniSearchWrapper';

export enum UniTableColumnType {
    Text = 1,
    Number = 2,
    DateTime = 3,
    Lookup = 4,
    Custom = 5,
    Select = 6,
    Money = 7,
    Percent = 8,
    LocalDate = 9,
    Boolean = 10,
    UniSearch = 11,
    Typeahead = 12,
    Link = 13
}

export enum UniTableColumnSortMode {
    Normal = 0,
    Absolute = 1
}

export interface INumberFormat {
    thousandSeparator?: string;
    decimalSeparator?: string;
    decimalLength?: number;
    prefix?: string;
    postfix?: string;
}

export interface IUniTableColumn {
    header: string;
    field: string;
    alias?: string;
    type: UniTableColumnType;
    editable: boolean | ((rowModel) => boolean);
    displayField?: string;
    path?: string;
    sumFunction?: string;
    index?: number;
    visible?: boolean;
    conditionalCls?: (rowModel: any) => string;
    cls?: string;
    headerCls?: string;
    template?: (rowModel: any) => string;
    options?: any;
    editor?: any;
    format?: string;
    numberFormat?: INumberFormat;
    alignment?: string;
    width?: string;
    filterable: boolean;
    filterOperator?: string;
    selectConfig?: {options: Array<any>, dislayField: string, valueField: string};
    skipOnEnterKeyNavigation?: boolean;
    sortMode: UniTableColumnSortMode;
    jumpToColumn?: string;
    onCellClick?: (rowModel) => void;
    isSumColumn?: boolean;
}

export class UniTableColumn implements IUniTableColumn {
    public type: UniTableColumnType;

    public header: string;
    public field: string;
    public displayField: string;
    public alias: string;
    public path: string;
    public sumFunction: string;
    public index: number;
    public editable: boolean | ((rowModel) => boolean);
    public visible: boolean;
    public conditionalCls: (rowModel: any) => string;
    public cls: string;
    public headerCls: string;

    public template: (rowModel: any) => string;
    public format: string;
    public numberFormat: INumberFormat;
    public alignment: string;
    public options: any;
    public editor: any;
    public width: string;
    public sortMode: UniTableColumnSortMode;
    public isSumColumn: boolean;

    public filterable: boolean;
    public filterOperator: string;
    public selectConfig: {options: Array<any>, dislayField: string, valueField: string};

    public skipOnEnterKeyNavigation: boolean;
    public jumpToColumn: string;
    public onCellClick: (rowModel) => void;

    public static fromObject(obj: IUniTableColumn) {
        const column = new UniTableColumn();
        Object.keys(obj).forEach((key) => {
            column[key] = obj[key];
        });

        return column;
    }

    constructor(field?: string, header?: string, type?: UniTableColumnType, editable: boolean | ((rowModel) => boolean) = true) {
        this.header = header || '';
        this.field = field || '';
        this.editable = editable;
        this.visible = true;
        this.filterable = true;
        this.filterOperator = 'contains';
        this.index = 0;
        this.skipOnEnterKeyNavigation = false;
        this.sortMode = UniTableColumnSortMode.Normal;

        this.conditionalCls = () => {
            return '';
        };
        this.cls = '';
        this.headerCls = '';

        this.setType(type || UniTableColumnType.Text);

        if (type === UniTableColumnType.Number || type === UniTableColumnType.Money || type === UniTableColumnType.Percent) {
            this.alignment = 'right';
            this.numberFormat = {
                thousandSeparator: ' ',
                decimalSeparator: ',',
                decimalLength: (type === UniTableColumnType.Money) ? 2 : undefined,
                postfix: (type === UniTableColumnType.Percent) ? '%' : undefined
            };
        } else if (type === UniTableColumnType.Link) {
            this.editable = false;
        }
    }

    public setHeader(header: string) {
        this.header = header;
        return this;
    }

    public setEditable(editable: boolean | ((rowModel) => boolean)) {
        this.editable = editable;
        return this;
    }

    public setWidth(width: string) {
        this.width = width;
        return this;
    }

    public setField(field: string) {
        this.field = field;
        return this;
    }

    public setDisplayField(displayField: string) {
        this.displayField = displayField;
        return this;
    }

    public setType(type: UniTableColumnType) {
        this.type = type;

        switch (type) {
            case UniTableColumnType.Lookup:
                this.editor = UnitableAutocomplete;
                break;

            case UniTableColumnType.Typeahead:
                this.editor = UnitableTypeahead;
                break;

            case UniTableColumnType.Text:
                this.editor = UnitableTextInput;
            break;

            case UniTableColumnType.Number:
            case UniTableColumnType.Money:
            case UniTableColumnType.Percent:
                this.editor = UnitableNumberInput;
            break;

            case UniTableColumnType.DateTime:
                this.editor = UnitableDateTimepicker;
            break;

            case UniTableColumnType.Select:
                this.editor = UnitableSelect;
            break;

            case UniTableColumnType.LocalDate:
                this.editor = LocalDatePicker;
            break;

            case UniTableColumnType.UniSearch:
                this.editor = UniSearchWrapper;
            break;
        }

        return this;
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
        return this;
    }

    public setConditionalCls(conditionalCls: (rowModel: any) => string) {
        this.conditionalCls = conditionalCls;
        return this;
    }

    public setCls(cls: string) {
        this.cls = cls;
        return this;
    }

    public setHeaderCls(headerCls: string) {
        this.headerCls = headerCls;
        return this;
    }

    public setTemplate(template: (rowModel: any) => string) {
        this.template = template;
        return this;
    }

    public setOptions(options: any) {
        this.options = options;
        return this;
    }

    public setEditor(editor: any) {
        this.editor = editor;
        return this;
    }

    public setFormat(format: string) {
        this.format = format;
        return this;
    }

    public setNumberFormat(formatOptions: INumberFormat) {
        this.numberFormat = formatOptions;
        return this;
    }

    public setAlignment(alignment: string) {
        this.alignment = alignment;
        return this;
    }

    public setFilterable(filterable: boolean) {
        this.filterable = filterable;
        return this;
    }

    public setFilterOperator(operator: string) {
        this.filterOperator = operator;
        return this;
    }

    public setSkipOnEnterKeyNavigation(skip: boolean) {
        this.skipOnEnterKeyNavigation = skip;
        return this;
    }

    public setJumpToColumn(field: string) {
        this.jumpToColumn = field;
        return this;
    }

    public setSortMode(sortMode: UniTableColumnSortMode) {
        this.sortMode = sortMode;
        return this;
    }

    public setOnCellClick(handler: (rowModel) => void) {
        this.onCellClick = handler;
        return this;
    }

    public setIsSumColumn(isSumColumn: boolean) {
        this.isSumColumn = isSumColumn;
        return this;
    }
}
