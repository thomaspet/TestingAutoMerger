import {FieldLayoutDto, ComponentLayoutDto} from '../../app/unientities';

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
};
export class UniComponentLayout extends ComponentLayoutDto {};