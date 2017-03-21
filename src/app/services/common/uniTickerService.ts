import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Http} from '@angular/http';
import {BrowserStorageService} from './browserStorageService';
import {Observable} from 'rxjs/Observable';
import {NumberFormat} from './numberFormatService';
import {AuthService} from '../../../framework/core/authService';
import {ModelService, ModuleConfig} from './modelService';
import {ErrorService} from './errorService';
import * as allModels from '../../unientities';

import * as moment from 'moment';


@Injectable()
export class UniTickerService { //extends BizHttp<UniQueryDefinition> {

    private TICKER_LOCALSTORAGE_KEY: string = 'UniTickerHistory';
    private tickers: Array<Ticker>;
    private models: Array<any>;

    constructor(
        private http: Http,
        private uniHttp: UniHttp,
        private numberFormatService: NumberFormat,
        private storageService: BrowserStorageService,
        private authService: AuthService,
        private router: Router,
        private modelService: ModelService,
        private errorService: ErrorService) {
        /* KE: We dont have a backend endpoint yet - consider this later
               when we have stabilized the JSON structure for tickers

        super(http);

        this.relativeURL = UniQueryDefinition.RelativeUrl;
        this.DefaultOrderBy = null;
        this.entityType = UniQueryDefinition.EntityType;
        */

        if (this.authService) {
            this.authService.authentication$.subscribe(change => this.invalidateCache());
        }
    }

    private invalidateCache() {
        this.tickers = null;
    }

    public loadTickerCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.modelService.loadModelCache().then(() => {
                if (!this.tickers) {
                    // get statuses from API and add it to the cache
                    this.http.get('assets/tickers/tickers.json')
                        .map(x => x.json())
                        .map((tickers: Array<Ticker>) => {
                            tickers.forEach(ticker => {
                                if (!ticker.Filters || ticker.Filters.length === 0) {
                                    let filter = new TickerFilter();
                                    filter.Name = 'Egendefinert';
                                    filter.Code = ticker.Model + 'CustomSearch';
                                    filter.FilterGroups = [];
                                    filter.IsActive = false;

                                    if (!ticker.Filters) {
                                        ticker.Filters = [];
                                    }

                                    ticker.Filters.push(filter);
                                }
                            });

                            return tickers;
                        })
                        .map(tickers => {
                            // fix typings in config, use lowerCase consistently
                            tickers.forEach(t => {
                                if (t.Type) {
                                    t.Type = t.Type.toLowerCase();
                                }

                                let model = null;
                                if (t.Model && t.Model !== '') {
                                    model = this.modelService.getModel(t.Model);
                                }

                                if (t.Columns) {
                                    t.Columns.forEach(c => {
                                        this.setupFieldProperties(c, t, model);

                                        if (c.SubFields) {
                                            c.SubFields.forEach(sf => {
                                                this.setupFieldProperties(sf, t, model);
                                            });
                                        }
                                    });
                                }
                            });

                            return tickers;
                        })
                        .subscribe(data => {
                            this.tickers = data;

                            resolve();
                        }, err => reject(err)
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    private setupFieldProperties(c: TickerColumn, t: Ticker, model: any) {
        if (!c.Header) {
            // TODO: Get header based on translation
            c.Header = c.Field;
        }

        // TODO: tar ikke hensyn til f.eks. Customer.CustomerNumber her - sjekker
        // bare på hoved nivå.
        // Må utvide til å også sjekke path og finne modell basert på den
        let colName = c.Field;
        let aliasColName = '';
        let selectableColName = '';

        let modelname = (t.Model ? t.Model : '');

        if (this.isFunction(c.Field)) {
            // for functions, trust that the user knows what he/she is doing...
            selectableColName = colName;
            aliasColName = modelname + colName;
        } else if (c.Field.indexOf('.') > 0) {
            // get last part of path, e.g. field.Field = Customer.Info.Name,
            // gets "Info" and "Name"
            let lastIndex = c.Field.lastIndexOf('.');
            let path = c.Field.substring(0, lastIndex);
            if (path.indexOf('.') > 0) {
                lastIndex = path.lastIndexOf('.');
                path = path.substring(lastIndex + 1);
            }

            colName = c.Field.substring(c.Field.lastIndexOf('.') + 1);

            selectableColName = path + '.' + colName;
            aliasColName = path + colName;
        } else {
            selectableColName = modelname + '.' + colName;
            aliasColName = modelname + colName;
        }

        if (c.SumFunction && selectableColName.indexOf(c.SumFunction) === -1) {
            selectableColName = `${c.SumFunction}(${selectableColName})`;
        }

        // set the Alias we are using in the query to simplify
        // getting the data later on
        c.Alias = aliasColName;
        c.SelectableFieldName = selectableColName;

        // if not fieldtype is configured for the ticker column, try to find
        // type based on the model that is retrieved from the API
        if (model &&  (!c.Type || c.Type === '')) {
            let modelField = this.modelService.getField(model, colName);

            if (modelField) {
                if (modelField.Type.toString().indexOf('System.Int32') !== -1) {
                    c.Type = 'number';
                } else if (modelField.Type.toString().indexOf('System.Decimal') !== -1) {
                    c.Type = 'money';
                } else if (modelField.Type.toString().indexOf('System.DateTime') !== -1
                            || modelField.Type.toString().indexOf('NodaTime.LocalDate') !== -1) {
                    c.Type = 'date';
                }
            }
        }
    }

    private isFunction(field: string): boolean {
        return field.indexOf('(') > -1 && field.indexOf(')') > -1;
    }

    public getTickers(): Promise<Ticker[]> {
        return this.loadTickerCache()
            .then(() => {
                return this.tickers;
            });
    }

    public executeAction(action: TickerAction, ticker: Ticker, selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.modelService.loadModelCache()
                .then(() => {
                    let model = this.modelService.getModel(ticker.Model);
                    let uniEntityClass = allModels[ticker.Model];

                    console.log('uniEntityClass.RelativeUrl: ' + uniEntityClass.RelativeUrl);

                    if (action.Type && action.Type.toLowerCase() === 'new') {
                        // get url for new entity, navigate
                        let url: string = model && model.DetailsUrl ? model.DetailsUrl : '';

                        if (url && url !== '') {
                            url = url.replace(':id', '0');
                            this.router.navigateByUrl(url);
                        } else {
                            throw Error('Could not navigate, no URL specified for model ' + ticker.Model);
                        }
                    } else if (action.Type && action.Type.toLowerCase() === 'details') {
                        let rowId: number = null;
                        // check that we can find the ID of the model - and that we have only one
                        if (!selectedRows || selectedRows.length !== 1) {
                            throw Error('Could not navigate, not possible to find ID to navigate to');
                        } else {
                            rowId = selectedRows[0]['ID'];
                        }

                        // get url for new entity, navigate
                        let url: string = model && model.DetailsUrl ? model.DetailsUrl : '';

                        if (url && url !== '') {
                            url = url.replace(':id', rowId.toString());
                            this.router.navigateByUrl(url);
                        } else {
                            throw Error('Could not navigate, no URL specified for model ' + ticker.Model);
                        }

                    } else if (action.Type && action.Type.toLowerCase() === 'action') {
                        console.log('actions with Type = "action" are not impelmented yet', action, ticker, selectedRows);



                    } else if (action.Type && action.Type.toLowerCase() === 'transition') {
                        if (!uniEntityClass) {
                            throw Error('Cannot find unientity class for model ' + ticker.Model + ', cannot run transition');
                        } else if (!uniEntityClass.RelativeUrl || uniEntityClass.RelativeUrl === '') {
                            throw Error('No URL defined for unientity class for model ' + ticker.Model + ', cannot run transition');
                        }

                        // check that we can find the ID of the model - and that we have at least one
                        if (!selectedRows || selectedRows.length === 0) {
                            throw Error('No row selected, cannot execute transition ' + action.Transition);
                        }

                        let service = new BizHttp<any>(this.uniHttp, this.authService);
                        service.relativeURL = uniEntityClass.RelativeUrl;

                        // TBD: should consider some throttling here if a lot of rows are selected - could potentially
                        // start hundreds of requests - errors should probably also be handled better, but it
                        // is probably not optimal to run requests one-by-one either.
                        let requests = [];
                        selectedRows.forEach(row => {
                            requests.push(service.Transition(row['ID'], row, action.Transition));

                            if (!row._links.transitions[action.Transition]) {
                                reject(`Cannot execute transition${action.Transition} for ID ${row['ID']}, transition is not available for this item`);
                            }

                            console.log(`Transition ${action.Transition} queued for ID ${row['ID']}`);
                        });

                        Observable
                            .forkJoin(requests)
                            .subscribe(response => {
                                console.log('response forkjoin:', response);
                                resolve();
                            },
                            err => {
                                reject(`Error executing transition ${action.Transition}`);
                                this.errorService.handle(err);
                            }
                        );
                    }
            });
        });
    }

    public getGroupedTopLevelTickers(tickers: Array<Ticker>): Array<TickerGroup> {
        let groups: Array<TickerGroup> = [];

        for (const ticker of tickers.filter(x => x.IsTopLevelTicker)) {
            let groupName = ticker.Group;

            let group = groups.find(g => g.Name === groupName);

            if (!group) {
                group = {
                    Name: ticker.Group,
                    Tickers: []
                };

                groups.push(group);
            }

            if (!ticker.SubTickers) {
                ticker.SubTickers = [];
            }

            if (ticker.SubTickersCodes && ticker.SubTickersCodes.length) {
                ticker.SubTickersCodes.forEach(subTickerCode => {
                    if (!ticker.SubTickers.find(x => x.Code === subTickerCode)) {
                        let subTicker = tickers.find(x => x.Code === subTickerCode);
                        if (subTicker) {
                            ticker.SubTickers.push(subTicker);
                        }
                    }
                });
            }

            group.Tickers.push(ticker);
        }

        return groups;
    }

    public getFieldValue(column: TickerColumn, model: any) {
        let fieldValue: any = this.getFieldValueInternal(column, model);

        if (!fieldValue) {
            fieldValue = '';
        }

        let formattedFieldValue = fieldValue;

        if (fieldValue !== '') {
            let columnType = column.Type ? column.Type.toLowerCase() : '';

            switch (columnType) {
                case 'number':
                    formattedFieldValue = this.numberFormatService.asNumber(fieldValue);
                    break;
                case 'money':
                    formattedFieldValue = this.numberFormatService.asMoney(fieldValue);
                    break;
                case 'percent':
                    formattedFieldValue = this.numberFormatService.asPercentage(fieldValue);
                    break;
                case 'date':
                case 'datetime':
                case 'localdate':
                    formattedFieldValue = moment(fieldValue).format('DD.MM.YYYY');
                    break;
            }
        }

        if (column.SubFields && column.SubFields.length > 0) {
            column.SubFields.forEach(sf => {
                let subFieldValue = this.getFieldValue(sf, model);
                if (subFieldValue && subFieldValue !== '') {
                    formattedFieldValue += ', ' + subFieldValue;
                }
            });
        }

        return formattedFieldValue;
    }

    private getFieldValueInternal(column: TickerColumn, model: any): any {
        let fieldName = column.Field;
        let fieldValue: string = null;

        // try to get the value using the alias, this will normally be the correct
        // thing to do
        if (column.Alias) {
            fieldValue = model[column.Alias];
            return fieldValue;
        }

        // if Alias is not set on the column, try to get a value using the fieldname. This
        // involves more analysis of the field name, e.g. Customer.Info.Name is probably
        // queried as InfoName
        fieldValue = model[fieldName];

        if (fieldValue) {
            return fieldValue;
        }

        if (fieldName.indexOf('.') !== -1) {
            let colName = fieldName.substring(fieldName.lastIndexOf('.') + 1);
            let lastPath =  fieldName.substring(0, fieldName.lastIndexOf('.'));

            if (lastPath.indexOf('.') !== -1) {
                lastPath = lastPath.substring(lastPath.lastIndexOf('.') + 1);
            }

            fieldName = lastPath + colName;
            fieldValue = model[fieldName];
            if (fieldValue) {
                return fieldValue;
            }
        }

        return '';
    }

    public getFilterString(filterGroups: TickerFilterGroup[], expressionFilterValues: IExpressionFilterValue[], useAllCriterias: boolean, mainModel: string): string {
        let filterString: string = '';
        let isInGroup: boolean = false;

        for (let groupIndex = 0; groupIndex < filterGroups.length; groupIndex++) {
            let group = filterGroups[groupIndex];
            let filters = group.FieldFilters;

            // add "or" or "and" between groups
            if (groupIndex > 0 && !useAllCriterias) {
                filterString += ' or ';
            } else if (groupIndex > 0) {
                filterString += ' and ';
            }

            let hasAddedFilterForGroup = false;

            // dont use filters that miss either field or operator - this is probably just a filter
            // the user has not finished constructing yet
            if (filters) {
                filters = filters.filter(x => x.Field && x.Field !== '' && x.Operator && x.Operator !== '');
            }

            if (filters && filters.length > 0) {
                let orderedByGroupFilters = filters.sort((a, b) => { return a.QueryGroup - b.QueryGroup});
                isInGroup = false;

                for (let index = 0; index < orderedByGroupFilters.length; index++) {
                    let filter: TickerFieldFilter = orderedByGroupFilters[index];

                    let filterValue: string = this.getFilterValueFromFilter(filter, expressionFilterValues);

                    if (filterValue) {
                        // open new filter group with parenthesis
                        if (!isInGroup) {
                            filterString += '(';
                            isInGroup = true;
                        }

                        // add "or" or "and" between groups depending on the UseAllCriterias flag
                        if (index > 0 && !group.UseAllCriterias) {
                            filterString += ' or ';
                        } else if (index > 0) {
                            filterString += ' and ';
                        }

                        let path = filter.Path && filter.Path !== '' ? filter.Path : mainModel;

                        if (filter.Operator === 'contains' || filter.Operator === 'startswith' || filter.Operator === 'endswith') {
                            // Function operator
                            filterString += (`${filter.Operator}(${path}.${filter.Field},'${filterValue}')`);
                        } else {
                            // Logical operator
                            filterString += `${path}.${filter.Field} ${filter.Operator} '${filterValue}'`;
                        }

                        hasAddedFilterForGroup = true;
                    }
                }
            }

            // close last group if we are in a group
            if (isInGroup) {
                filterString += ' )';
                isInGroup = false;
            }
        }

        // close last group if we are in a group
        if (isInGroup) {
            filterString += ' )';
            isInGroup = false;
        }

        return filterString;
    }

    private getFilterValueFromFilter(filter: TickerFieldFilter, expressionFilterValues: IExpressionFilterValue[]): string {
        let filterValue = filter.Value.toString();

        // if expressionfiltervalues are defined, e.g. ":currentuserid", check if any of the defined filters
        // should inject the expressionfiltervalue
        if (filterValue.toString().startsWith(':')) {
            let expressionFilterValue = expressionFilterValues.find(efv => ':' + efv.Expression === filterValue);

            if (expressionFilterValue) {
                filterValue = expressionFilterValue.Value;
            } else {
                // console.log('No ExpressionFilterValue defined for filterexpression ' + filterValue);
            }
        }

        return filterValue;
    }

    public addSearchHistoryItem(ticker: Ticker, filter: TickerFilter, url: string): TickerHistory {
        let existingHistory = this.getSearchHistoryItems();

        let currentHistoryItem = this.getSearchHistoryItem(ticker, filter);

        // if there is already a search item for the ticker/filter supplied, remove it from
        // the list - we will push it to the front of the list afterwards, this will
        // move it to the top of the "stack"
        if (currentHistoryItem) {
            existingHistory = existingHistory.filter(x =>
                !(x.Ticker.Code === ticker.Code
                && ((!x.TickerFilter && !filter)
                || (x.TickerFilter && filter && x.TickerFilter.Code === filter.Code)))
            );
        }

        // add the search history to the start of the array ("top of the stack")
        let newHistoryItem: TickerHistory = {
            Ticker: ticker,
            TickerFilter: filter,
            Url: url
        };

        existingHistory.unshift(newHistoryItem);

        // we shouldnt keep more than 10 items in the history, so remove an item if we have
        // more than this (because this is done every time an item is added, we will never
        // actually end up with more than 10 in our array)
        if (existingHistory.length > 10) {
            existingHistory.pop();
        }

        this.storageService.save(this.TICKER_LOCALSTORAGE_KEY, JSON.stringify(existingHistory), true);

        return newHistoryItem;
    }

    public getSearchHistoryItems(): Array<TickerHistory> {
        let json = this.storageService.get(this.TICKER_LOCALSTORAGE_KEY, true);

        if (json) {
            return JSON.parse(json);
        }

        return [];
    }

    public getSearchHistoryItem(ticker: Ticker, filter: TickerFilter): TickerHistory {
        let json = this.storageService.get(this.TICKER_LOCALSTORAGE_KEY, true);

        if (json) {
            let array: Array<TickerHistory> = JSON.parse(json);

            if (filter) {
                return array.find(
                    x => x.Ticker.Code === ticker.Code
                        && x.TickerFilter && x.TickerFilter.Code === filter.Code);
            } else {
                return array.find(
                    x => x.Ticker.Code === ticker.Code && !x.TickerFilter);
            }
        }

        return null;
    }

    public deleteSearchHistoryItem(ticker: Ticker, filter: TickerFilter) {
        let existingHistory = this.getSearchHistoryItems();

        existingHistory = existingHistory.filter(x => !(x.Ticker.Code === ticker.Code
                    && ((!x.TickerFilter && !filter)
                    || (x.TickerFilter && filter && x.TickerFilter.Code === filter.Code)))
            );

        this.storageService.save(this.TICKER_LOCALSTORAGE_KEY, JSON.stringify(existingHistory), true);
    }
}

export class TickerGroup {
    public Name: string;
    public Tickers: Array<Ticker>;
}

export class Ticker {
    public Name: string;
    public Code: string;
    public Type: string;
    public Group: string;
    public IsTopLevelTicker: boolean;
    public Model: string;
    public Expand: string;
    public ApiUrl: string;
    public ListObject: string;
    public DisableFiltering: boolean;
    public Columns: Array<TickerColumn>;
    public ParentFilter: TickerFieldFilter;
    public SubTickers: Array<Ticker>;
    public SubTickersCodes: Array<string>;
    public Filters: Array<TickerFilter>;
    public Actions: Array<TickerAction>;
    public IsActive: boolean;
}

export class TickerFieldFilter {
    public Path: string;
    public Field: string;
    public Operator: string;
    public Value: string;
    public Value2: string;
    public QueryGroup: number;
}

export interface IExpressionFilterValue {
    Expression: string;
    Value: string;
}

export class TickerColumn {
    public Header: string;
    public Field: string;
    public SelectableFieldName: string;
    public Format: string;
    public Width: string;
    public CssClass: string;
    public Type: string;
    public SumFunction: string;
    public Alias: string;
    public SubFields: Array<TickerColumn>;
}

export class TickerFilterGroup {
    public QueryGroup: number;
    public FieldFilters: Array<TickerFieldFilter>;
    public UseAllCriterias: boolean = true;
}

export class TickerFilter {
    public Name: string;
    public Code: string;
    public Filter: string;
    public IsActive: boolean;
    public FilterGroups: Array<TickerFilterGroup>;
    public UseAllCriterias: boolean = true;
}

export class TickerAction {
    public Name: string;
    public Code: string;
    public ConfirmBeforeExecuteMessage: string;
    public ExecuteWithMultipleSelections: boolean;
    public ExecuteWithoutSelection: boolean;
    public Type: string;
    public Action: string;
    public Transition: string;
    public DisplayInContextMenu: boolean;
    public DisplayInActionBar: boolean;
}

export class TickerHistory {
    public Url: string;
    public Ticker: Ticker;
    public TickerFilter: TickerFilter;
}
