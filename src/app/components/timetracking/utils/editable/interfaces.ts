export interface IChangeEvent {
    value: any;
    col: number;
    row: number;
    cancel: boolean;
    updateCell: boolean;
    columnDefinition?: ICol;
    lookupValue?: any;
    userTypedValue: boolean;
}

export interface IStartEdit {
    col: number;
    row: number;
    cancel: boolean;
    columnDefinition: ICol;
}

export interface IPos {
    col: number;
    row: number;
}

export interface IJQItem {
    length: number;
    on(eventName: string, fx: Function);
    off(eventName: string, fx: Function);
    is(tagName: string): boolean;
    text(value?: string): string;
    css(style: any, value?: any);
    val(value?: string): string;
    show();
    hide();
    remove();
    attr(name: string, value?: any);
    focus();
    outerHeight(value?: any): any;
    outerWidth(value?: any): any;
    offset(ref?: any): any;
    select();
    parent(): IJQItem;
    index(): number;
    append(content: any);
    find(filter?: any): IJQItem;
    first(filter?: any): IJQItem;
    last(filter?: any): IJQItem;
    next(filter?: any): IJQItem;
    prev(filter?: any): IJQItem;
    parent(filter?: any): IJQItem;
    children(filter?: any): IJQItem;
    eq(filter: any): IJQItem;
    addClass(c: any): IJQItem;
    removeClass(c: any): IJQItem;
    html(h: any): IJQItem;
    closest(v: any): IJQItem;
}

export interface IEditEvents {
    onEditChanged(value: any, position: IPos): boolean;
    onEditKeydown(event: any);
    onEditTyping(event: any, text: string, position: IPos);
    onEditBtnClick(event: any, text: string, position: IPos);
}

export interface IRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IEditor {
    editEvents: IEditEvents;
    create(owner: IJQItem): IJQItem;
    destroy();
    move(pos: IRect);
    moveTo(cell: IJQItem);
    focus();
    close(cancel: boolean);
    startEdit(value: any, cell: IJQItem, pos: IPos, showButton?: boolean);
    setValue(value: any, flagChange?: boolean);
    finalizeEdit(cancel: boolean, value?: string, src?: string): boolean;
    hasChanges(): boolean;
    getValue(): any;
}

export interface ITypeSearch {
    value: string;
    position: IPos;
    ignore: boolean;
    columnDefinition?: ICol;
    promise?: Promise<any>;
    renderFunc?: (item: any) => string;
    itemPropertyToSet?: string;
    rows?: Array<any>;    
}

export var KEYS = {
    ARROW_LEFT : 37, ARROW_UP : 38, ARROW_RIGHT : 39, ARROW_DOWN : 40,
    ENTER : 13, ESC : 27, TAB : 9, F2 : 113, F3 : 114, F4 : 115, SPACE : 32,
    CTRL : 17, SHIFT : 16,
    HOME : 36, END : 35, INSERT : 45, DELETE : 46, PAGEUP : 33, PAGEDOWN : 34
};


export enum ColumnType {
    Text = 0,
    Integer = 1,
    Decimal = 2,
    Date = 3,
    Time = 4,
    Action = 10,
    Custom = 11
}

export interface ICol {
    name: string;
    label?: string;
    columnType?: ColumnType;
    width?: number;
    visible?: boolean;
    alignment?: string;
    lookup?: ILookupDetails;
}

export class Column implements ICol {
    public label: string;
    public visible: boolean = true;
    public columnType: ColumnType;
    public lookup: ILookupDetails;
    constructor(public name: string, label = '', colType = ColumnType.Text, lookup?: ILookupDetails) {
        this.label = label || name;
        this.columnType = colType; 
        this.lookup = lookup;
    }
}

export interface ILookupDetails {
    route: string;
    colToSave?: string;
    select?: string;
    filter?: string;    
    visualKey?: string;
    blankFilter?: string;
    model?: string;
}
