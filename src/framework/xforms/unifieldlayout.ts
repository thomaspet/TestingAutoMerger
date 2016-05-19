import {FieldLayout} from '../../app/unientities';

export class UniFieldLayout extends FieldLayout {

    public Options: any;
    public AsyncValidators: any;
    public SyncValidators: any;
    
    constructor(field: FieldLayout) {
        super();
        this.Options = JSON.parse(field.Options);
        for (var prop in field) {
            if (field.hasOwnProperty(prop)) {
                this[prop] = field[prop];
            }
        }
    }
}
