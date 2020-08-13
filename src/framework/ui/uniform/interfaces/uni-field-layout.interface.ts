import {FieldLayoutDto} from '@uni-framework/ui/uniform/interfaces/field-layout-dto.interface';

export class UniFieldLayout extends FieldLayoutDto {
    public Options: any;
    public Validations: Array<any>;
    public AsyncValidators: any;
    public SyncValidators: any;
    public Classes: string;
    public Required: boolean;
    public MaxLength: number;
    public UpdateOn: 'blur' | 'change';
    public isLast: boolean;
    public FeaturePermission?: string;

    constructor() {
        super();
        this.SyncValidators = this.Validations;
    }
}
