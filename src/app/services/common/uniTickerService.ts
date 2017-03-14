import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Http} from '@angular/http';
import {BrowserStorageService} from './browserStorageService';
import {Observable} from 'rxjs/Observable';
import {NumberFormat} from './numberFormatService';
import {AuthService} from '../../../framework/core/authService';

import * as moment from 'moment';


@Injectable()
export class UniTickerService { //extends BizHttp<UniQueryDefinition> {

    private TICKER_LOCALSTORAGE_KEY: string = 'UniTickerHistory';
    private tickers: Array<Ticker>;

    constructor(
        private http: Http,
        private numberFormatService: NumberFormat,
        private storageService: BrowserStorageService,
        private authService: AuthService) {
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
                    .subscribe(data => {
                        this.tickers = data;
                        resolve();
                    }, err => reject(err)
                );
            } else {
                resolve();
            }
        });
    }


    public getTickers(): Promise<Ticker[]> {
        return this.loadTickerCache()
            .then(() => {
                return this.tickers;
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
                    let subTicker = tickers.find(x => x.Code === subTickerCode);
                    if (subTicker) {
                        ticker.SubTickers.push(subTicker);
                    }
                });
            }

            group.Tickers.push(ticker);
        }

        return groups;
    }

    public getFieldValue(column: TickerColumn, model: any) {
        let fieldValue: any = this.getFieldValueInternal(column, model);

        if (!fieldValue || fieldValue === '') {
            return '';
        }

        if (!column.Type || column.Type === '') {
            return fieldValue;
        }

        let formattedFieldValue = fieldValue;

        switch (column.Type.toLowerCase()) {
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

    public getFilterString(filterGroups: TickerFilterGroup[], expressionFilterValues: IExpressionFilterValue[], useAllCriterias: boolean): string {
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

                        if (filter.Operator === 'contains' || filter.Operator === 'startswith' || filter.Operator === 'endswith') {
                            // Function operator
                            filterString += (`${filter.Operator}(${filter.Field},'${filterValue}')`);
                        } else {
                            // Logical operator
                            filterString += `${filter.Field} ${filter.Operator} '${filterValue}'`;
                        }

                        hasAddedFilterForGroup = true;
                    }
                }
            }

            // close last group if we are in a group
            if (isInGroup) {
                filterString += ')';
                isInGroup = false;
            }
        }

        // close last group if we are in a group
        if (isInGroup) {
            filterString += ')';
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
    public Format: string;
    public Width: string;
    public CssClass: string;
    public Type: string;
    public SumFunction: string;
    public Alias: string;
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
    //public FieldFilters: Array<TickerFieldFilter>;
}

export class TickerAction {
    public Name: string;
    public Code: string;
    public ConfirmBeforeExecuteMessage: string;
    public ExecuteWithMultipleSelections: boolean;
    public ExecuteWithoutSelection: boolean;
}

export class TickerHistory {
    public Url: string;
    public Ticker: Ticker;
    public TickerFilter: TickerFilter;
}
