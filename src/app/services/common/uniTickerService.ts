import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {NumberFormat} from './NumberFormatService';

declare const moment;

@Injectable()
export class UniTickerService { //extends BizHttp<UniQueryDefinition> {

    constructor(private http: Http, private numberFormatService: NumberFormat) {
        /* KE: We dont have a backend endpoint yet - consider this later
               when we have stabilized the JSON structure for tickers

        super(http);

        this.relativeURL = UniQueryDefinition.RelativeUrl;
        this.DefaultOrderBy = null;
        this.entityType = UniQueryDefinition.EntityType;
        */
    }

    public getTickers(): Observable<any[]> {
        return this.http.get('assets/tickers/tickers.json').map(x => x.json());
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
    public Field: string;
    public Operator: string;
    public Value: string;
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

export class TickerFilter {
    public Name: string;
    public Code: string;
    public Filter: string;
    public IsActive: boolean;
}

export class TickerAction {
    public Name: string;
    public Code: string;
    public ConfirmBeforeExecuteMessage: string;
    public ExecuteWithMultipleSelections: boolean;
    public ExecuteWithoutSelection: boolean;
}
