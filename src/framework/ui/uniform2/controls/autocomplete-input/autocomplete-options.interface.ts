export interface AutocompleteOptions {
    itemTemplate: (obj: any) => string;
    initialValueFn: (...args: any[]) => any;
    valueProperty: string;
    labelProperty: string;
    searchFn: (...args: any[]) => any;
    editor: (...args: any[]) => any;
    searchOnButtonClick: boolean;
    source: any;
}
