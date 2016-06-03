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