import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export interface IUniSearchConfig {
    lookupFn: (searchTerm: string) => Observable<any[]>;
    onSelect: (item: any) => Observable<any>;
    initialItem$: BehaviorSubject<any>;
    inputTemplateFn: (item: any) => string;
    tableHeader?: string[];
    rowTemplateFn: (item: any) => string[]|number[];
    createNewFn?: (currentInputValue?: string) => Observable<any>;
    externalLookupFn?: (searchTerm: string) => Observable<any[]>;
    maxResultsLength?: number;
    unfinishedValueFn?: (val: any) => Observable<any>;
}
