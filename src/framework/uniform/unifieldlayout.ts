import {FieldLayout} from '../../app/unientities';

export class UniFieldLayout extends FieldLayout {

    public Options: any;
    public AsyncValidators: any;
    public SyncValidators: any;
    
    constructor(field: FieldLayout) {
        super();
        this.SyncValidators = field.Validations;
        for (var prop in field) {
            if (field.hasOwnProperty(prop)) {
                if (prop === 'Options') {
                    if (field[prop] === 'null') {
                        this[prop] = null;
                    } else {
                        this[prop] = field[prop];
                    }   
                } else {
                    this[prop] = field[prop];
                }
            }
        }
    }
}
