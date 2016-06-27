import {FieldLayoutDto, ComponentLayoutDto} from '../../app/unientities';

export class UniFieldLayout extends FieldLayoutDto {
    public Options: any;
    public Validations: Array<any>;
    public AsyncValidators: any;
    public SyncValidators: any;

    constructor() {
        super();
        this.SyncValidators = this.Validations;
    }
};
export class UniComponentLayout extends ComponentLayoutDto {};

export enum KeyCodes {
    ARROW_LEFT = 37, 
    ARROW_UP = 38, 
    ARROW_RIGHT = 39, 
    ARROW_DOWN = 40, 

    ENTER = 13,
    ESC = 27, 
    TAB = 9, 
    F2 = 113, 
    SPACE = 32,

    CTRL = 17,
    SHIFT = 16, 

    HOME = 36,
    END = 35, 
    INSERT = 45, 
    DELETE = 46, 

    PAGEUP = 33,
    PAGEDOWN = 34
}