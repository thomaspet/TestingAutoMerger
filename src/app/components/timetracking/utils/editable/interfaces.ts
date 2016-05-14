export interface IJQItem {
    on(eventName:string, fx:Function);
    off(eventName:string, fx:Function);
    is(tagName:string):boolean;
    text(value?:string):string;
    css(style:any, value?:any);
    val(value?:string):string;
    show();
    attr(name:string, value?:any);
    focus();
    outerHeight(value?:number):number;
    outerWidth(value?:number):number;
    offset(ref?:any):any;
    select();
    parent():IJQItem;
    index():number;
    append(content:any);
}

export interface IPos {
    col: number;
    row: number;
}

export interface IEditEvents {
    finalizeEdit(value:any, position:IPos):boolean;
}

export interface IRect {
    left:number;
    top:number;
    width:number;
    height:number;
}

export interface IEditor {
    editEvents:IEditEvents;
    create(owner:IJQItem): IJQItem;
    destroy();
    move(pos:IRect);
    moveTo(cell:IJQItem);
    focus();
    startEdit(value:any, cell:IJQItem);
    finalizeEdit(cancel:boolean);
}