import {UnitableAutocomplete} from '../controls/table-autocomplete';
import {UnitableTypeahead} from '../controls/typeahead';
import {UnitableTextInput} from '../controls/text';
import {UnitableNumberInput} from '../controls/number';
import {UnitableDateTimepicker} from '../controls/dateTimePicker/dateTimePicker';
import {UnitableSelect} from '../controls/select';
import {LocalDatePicker} from '../controls/localDatePicker/LocalDatePicker';

/*
    Dont make changes to this unless you know what you're doing!
    UniQuery uses the numerical values when saving configs,
    on the backend, so altering these will cause the wrong
    column types to be used in UniQuery...
    <insert facepalm gif>

    Adding stuff to the end of the enum is fine, just dont alter existing numbers.
*/
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

export interface IColumnTooltip {
    text: string;
    type: 'good'|'warn'|'bad'|'neutral';
    alignment?: 'left'|'right';
}

export interface FilterSelectConfig {
    options: any[];
    displayField: string;
    valueField: string;
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
    width?: number|string;
    filterable: boolean;
    filterOperator?: string;
    filterSelectConfig?: {options: Array<any>, displayField: string, valueField: string};
    skipOnEnterKeyNavigation?: boolean;
    sortMode: UniTableColumnSortMode;
    jumpToColumn?: string;
    onCellClick?: (rowModel) => void;
    isSumColumn?: boolean;
    markedRowsSumCol?: boolean;
    tooltipResolver?: (rowModel) => IColumnTooltip;
    hasLink?: (rowModel) => boolean;
    linkResolver?: (rowModel) => string;
    linkClick?: (rowModel) => void;
    maxLength?: number;
    resizeable?: boolean;
    placeholder?: string | ((row) => string);
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

    public hasLink: (rowMdoel) => boolean;
    public linkResolver: (rowModel) => string;
    public linkClick: (rowModel) => void;
    public tooltipResolver: (rowModel) => IColumnTooltip;
    public template: (rowModel: any) => string;
    public format: string;
    public numberFormat: INumberFormat;
    public alignment: string;
    public options: any;
    public editor: any;
    public width: number|string;
    public sortMode: UniTableColumnSortMode;
    public isSumColumn: boolean;
    public markedRowsSumCol: boolean;
    public aggFunc: (items: any[]) => number;

    public filterable: boolean;
    public filterOperator: string;
    public filterSelectConfig: FilterSelectConfig;

    public skipOnEnterKeyNavigation: boolean;
    public jumpToColumn: string;
    public onCellClick: (rowModel) => void;
    public maxLength: number;
    public resizeable: boolean = true;
    public rowGroup?: boolean;
    public enableRowGroup?: boolean;
    public enablePivot?: boolean;
    public placeholder: string | ((row) => string);

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
        this.skipOnEnterKeyNavigation = false;
        this.sortMode = UniTableColumnSortMode.Normal;

        this.cls = '';
        this.headerCls = '';

        this.setType(type || UniTableColumnType.Text);

        if (type === UniTableColumnType.Number || type === UniTableColumnType.Money || type === UniTableColumnType.Percent) {
            this.filterOperator = 'eq';
            this.setAlignment('right');
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

    public setWidth(width: number|string, resizeable?: boolean) {
        this.width = width;

        if (typeof resizeable === 'boolean') {
            this.resizeable = resizeable;
        }

        return this;
    }

    public setResizeable(resizeable: boolean) {
        this.resizeable = resizeable;
        return this;
    }

    public setRowGroup(rowGroup: boolean) {
        this.rowGroup = rowGroup;
        return this;
    }

    public setEnableRowGroup(enableRowGroup: boolean) {
        this.enableRowGroup = enableRowGroup;
        return this;
    }

    public setField(field: string) {
        this.field = field;
        return this;
    }

    public setAlias(alias: string) {
        this.alias = alias;
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
        }

        if (type === UniTableColumnType.LocalDate || type === UniTableColumnType.DateTime) {
            this.setWidth('6rem');
        }

        return this;
    }

    public setVisible(visible: boolean) {
        this.visible = visible;
        return this;
    }

    public setConditionalCls(conditionalCls: (rowModel: any) => string) {
        // Hack for making column work with both uni-table and ag-grid
        this.conditionalCls = (param) => {
            const row = param.data ? param.data : param;
            return ' ' + conditionalCls(row) + this.cls;
        };

        return this;
    }

    public setCls(cls: string) {
        this.cls += ' ' + cls;
        return this;
    }

    public setHeaderCls(headerCls: string) {
        this.headerCls += ' ' + headerCls;
        return this;
    }

    public setTemplate(template: (rowModel: any) => string) {
        this.template = template;
        return this;
    }

    public setTooltipResolver(tooltipResolver: (rowModel) => IColumnTooltip) {
        this.tooltipResolver = tooltipResolver;
        return this;
    }

    public setHasLink(check: (rowModel) => boolean) {
        this.hasLink = check;
        return this;
    }

    public setLinkResolver(linkResolver: (rowModel) => string) {
        this.linkResolver = linkResolver;
        this.cls += ' link-cell';
        return this;
    }

    public setLinkClick(clickHandler: (rowModel) => void) {
        this.linkClick = clickHandler;
        this.cls += ' link-cell';
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

    public setAlignment(alignment: 'left'|'right'|'center') {
        this.alignment = alignment;

        // ngx datatable
        this.headerCls += ' align-' + alignment;
        this.cls += ' align-' + alignment;

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

    public setFilterSelectConfig(config: FilterSelectConfig) {
        this.filterSelectConfig = config;
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

    public setAggFunc(aggFunc: (data: any[]) => number) {

        this.aggFunc = aggFunc;
            return this;
    }

    public setMaxLength(maxLength: number) {
        this.maxLength = maxLength;
        return this;
    }

    setPlaceholder(placeholder: string | ((row) => string)) {
        this.placeholder = placeholder;
        return this;
    }
}
