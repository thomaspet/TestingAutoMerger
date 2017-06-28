import {FieldType} from './fieldTypes';

export class ComponentLayoutDto {
    public static RelativeUrl = '';
    public static EntityType = 'ComponentLayoutDto';

    public BaseEntity: string;
    public Name: string;
    public Url: string;
    public Fields: Array<FieldLayoutDto>;
    public CustomFields: any;
}

export class FieldLayoutDto {
    public static RelativeUrl = '';
    public static EntityType = 'FieldLayoutDto';

    public Alignment: any;
    public Combo: number;
    public ComponentLayoutID: number;
    public CreatedAt: Date;
    public CreatedBy: string;
    public Deleted: boolean;
    public Description: string;
    public DisplayField: string;
    public EntityType: string;
    public FieldSet: number;
    public FieldSetColumn: number;
    public FieldType: FieldType;
    public HelpText: string;
    public Hidden: boolean;
    public ID: number;
    public Label: string;
    public Legend: string;
    public LineBreak: boolean;
    public LookupEntityType: string;
    public LookupField: boolean;
    public Options: string;
    public Placeholder: string;
    public Placement: number;
    public Property: string;
    public ReadOnly: boolean;
    public Section: number;
    public Sectionheader: string;
    public StatusCode: number;
    public UpdatedAt: Date;
    public UpdatedBy: string;
    public Url: string;
    public ValueList: string;
    public Width: string;
    public Validations: Array<any>;
    public CustomFields: any;
}

export class UniFieldLayout extends FieldLayoutDto {
    public Options: any;
    public Validations: Array<any>;
    public AsyncValidators: any;
    public SyncValidators: any;
    public Classes: string;

    constructor() {
        super();
        this.SyncValidators = this.Validations;
    }
}

export class UniComponentLayout extends ComponentLayoutDto {
    public Fields: Array<UniFieldLayout> = [];
}


export enum KeyCodes {
    ARROW_LEFT = 37,
    ARROW_UP = 38,
    ARROW_RIGHT = 39,
    ARROW_DOWN = 40,

    ENTER = 13,
    ESC = 27,
    TAB = 9,
    F2 = 113,
    F4 = 115,
    SPACE = 32,
    BACKSPACE = 8,

    CTRL = 17,
    SHIFT = 16,

    HOME = 36,
    END = 35,
    INSERT = 45,
    DELETE = 46,

    PAGEUP = 33,
    PAGEDOWN = 34
};
