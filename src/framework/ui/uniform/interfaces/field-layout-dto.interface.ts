import {FieldType} from '@uni-framework/ui/uniform';

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
    public LabelWidth: string;
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
    public Tooltip: any;
}
