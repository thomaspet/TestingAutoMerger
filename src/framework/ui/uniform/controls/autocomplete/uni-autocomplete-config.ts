import {Observable} from 'rxjs';
import * as _ from 'lodash';

export class UniAutocompleteConfig {
    public source: any;
    public valueKey: string;
    public template: (obj: any) => string;
    public minLength: number;
    public debounceTime: number;
    public search: (query: string) => Observable<any>;
    public searchOnButtonClick: boolean;

    public static build(obj: any) {
        return _.assign(new UniAutocompleteConfig(), obj);
    }

    constructor() {
    }
}
