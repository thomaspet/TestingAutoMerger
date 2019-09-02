import {Observable} from 'rxjs';
import {BehaviorSubject} from 'rxjs';

export enum SearchType1880 {
    searchCompanies,
    searchPersons,
    searchCompaniesAndPersons
}

export interface IUniSearchConfig {
    lookupFn: (searchTerm: string) => Observable<any[]>;
    onSelect: (item: any) => Observable<any>;
    initialItem$: BehaviorSubject<any>;
    inputTemplateFn: (item: any) => string;
    tableHeader?: string[];
    rowTemplateFn: (item: any) => string[]|number[];
    createNewFn?: (currentInputValue?: string) => Observable<any>;
    externalLookupFn?: (searchTerm: string, searchCompanies: boolean, searchPersons: boolean) => Observable<any[]>;
    maxResultsLength?: number;
    placeholder?: string;
    unfinishedValueFn?: (val: any) => Observable<any>;
    searchType1880?: SearchType1880;
}
