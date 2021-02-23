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
    Link = 13,
    Status = 14,
    Checkbox = 15,
    Attachment = 16,
    Button = 17,
    Icon = 18
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

export interface TableStatusIndicator {
    label: string;
    width: string;
    type?: 'info' | 'c2a' | 'good' | 'warn' | 'bad';
    tooltip?: string;
}

export interface TableStatusMap {
    [statusCode: number]: string | {
        label: string;
        class: 'info' | 'c2a' | 'good' | 'warn' | 'bad',
        tooltip?: (row) => string;
    };
}

export interface TableCheckboxConfig {
    checked?: boolean | ((row) => boolean);
    type?: string;
    onChange?: (row, checked: boolean) => void;
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
    maxWidth?: number;
    filterable: boolean;
    filterOperator?: string;
    filterSelectConfig?: {options: Array<any>, displayField: string, valueField: string};
    skipOnEnterKeyNavigation?: boolean;
    sortMode: UniTableColumnSortMode;
    sortField?: string;
    jumpToColumn?: string;
    onCellClick?: (rowModel) => void;
    isSumColumn?: boolean;
    markedRowsSumCol?: boolean;
    tooltipResolver?: (rowModel) => IColumnTooltip;
    hasLink?: (rowModel) => boolean;
    linkResolver?: (rowModel) => string;
    linkClick?: (rowModel) => void;
    checkboxConfig?: TableCheckboxConfig;
    maxLength?: number;
    resizeable?: boolean;
    sizeToFit?: boolean;
    placeholder?: string | ((row) => string);
    statusMap?: TableStatusMap;
    featurePermission?: string;
    cellTitleResolver: (data) => string;
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
    public maxWidth: number;
    public sortable = true;
    public sortMode: UniTableColumnSortMode;
    public sortField: string;
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
    public sizeToFit: boolean = true;
    public rowGroup?: boolean;
    public enableRowGroup?: boolean;
    public enablePivot?: boolean;
    public placeholder: string | ((row) => string);
    public statusMap: TableStatusMap;
    public checkboxConfig: TableCheckboxConfig;
    public featurePermission: string;
    public cellTitleResolver: (data) => string;

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
    }

    public setHeader(header: string) {
        this.header = header;
        return this;
    }

    public setCellTitleResolver(resolver: (data) => string) {
        this.cellTitleResolver = resolver;
        return this;
    }

    public setEditable(editable: boolean | ((rowModel) => boolean)) {
        this.editable = editable;
        return this;
    }

    public setWidth(width: number|string, resizeable?: boolean, sizeToFit?: boolean) {
        this.width = width;

        if (typeof resizeable === 'boolean') {
            this.resizeable = resizeable;
        }

        if (typeof sizeToFit === 'boolean') {
            this.sizeToFit = sizeToFit;
        }

        return this;
    }

    public setMaxWidth(width: number) {
        this.maxWidth = width;
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
                this.filterOperator = 'eq';
                this.setAlignment('right');
                this.numberFormat = {
                    thousandSeparator: ' ',
                    decimalSeparator: ',',
                    decimalLength: (type === UniTableColumnType.Money) ? 2 : undefined,
                    postfix: (type === UniTableColumnType.Percent) ? '%' : undefined
                };
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

            case UniTableColumnType.Link:
                this.editable = false;
            break;

            case UniTableColumnType.Status:
                this.resizeable = false;
                this.editable = false;
                this.filterOperator = 'eq';
                this.setAlignment('center');
            break;

            case UniTableColumnType.Boolean:
                this.filterSelectConfig = {
                    displayField: 'label',
                    valueField: 'value',
                    options: [
                        { label: 'Ja', value: true },
                        { label: 'Nei', value: false }
                    ]
                };
            break;

            case UniTableColumnType.Checkbox:
                this.setAlignment('center');
                this.setWidth('4rem', false);
                this.setCls('checkbox-column');
            break;

            case UniTableColumnType.Attachment:
                this.setCls('attachment-column');
                this.setWidth('160px', false);
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

    public setSortable(sortable: boolean) {
        this.sortable = sortable;
        return this;
    }

    public setSortMode(sortMode: UniTableColumnSortMode) {
        this.sortMode = sortMode;
        return this;
    }

    public setSortField(field: string) {
        this.sortField = field;
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

    setStatusMap(statusMap: TableStatusMap) {
        this.statusMap = statusMap;

        const filterOptions = Object.keys(statusMap).map(key => {
            const label = typeof statusMap[key] === 'string' ? statusMap[key] : statusMap[key].label;
            return {label, value: key};
        });

        this.filterSelectConfig = {
            options: filterOptions,
            valueField: 'value',
            displayField: 'label'
        };

        return this;
    }

    setCheckboxConfig(checkboxConfig: TableCheckboxConfig) {
        this.checkboxConfig = checkboxConfig;
        return this;
    }

    setFeaturePermission(permission: string) {
        this.featurePermission = permission;
        return this;
    }
}
