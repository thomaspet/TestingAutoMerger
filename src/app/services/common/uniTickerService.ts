import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../framework/core/http/http';
import {HttpClient} from '@angular/common/http';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {Observable} from 'rxjs';
import {NumberFormat} from './numberFormatService';
import {AuthService} from '../../authService';
import {ApiModelService, ApiModel} from './apiModelService';
import {
    Leavetype,
    LimitType,
    SpecialTaxAndContributionsRule,
    ShipRegistry,
    ShipTradeArea,
    ShipTypeOfShip,
    WorkingHoursScheme,
    RemunerationType,
    TypeOfEmployment,
    SharingType,
    StatusCodeSharing,
    TaxType,
    StdWageType,
    SpecialAgaRule
} from '../../unientities';
import {ErrorService} from './errorService';
import {StatusService} from './statusService';
import {CompanySettingsService} from './companySettingsService';
import {CompanySettings} from '../../unientities';
import * as allModels from '../../unientities';

import * as moment from 'moment';

import {cloneDeep} from 'lodash';
import {ColumnTemplateOverrides} from '@app/components/uniticker/ticker/column-template-overrides';
import {QuickFilter} from '@uni-framework/ui/unitable';

@Injectable()
export class UniTickerService {

    private TICKER_LOCALSTORAGE_KEY: string = 'UniTickerHistory';
    private tickers: Array<Ticker>;
    private companySettings: CompanySettings;

    constructor(
        private http: HttpClient,
        private uniHttp: UniHttp,
        private numberFormatService: NumberFormat,
        private storageService: BrowserStorageService,
        private authService: AuthService,
        private router: Router,
        private statusService: StatusService,
        private modelService: ApiModelService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService
    ) {
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
        this.companySettings = null;
    }

    public loadTickerCache(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.companySettingsService.Get(1).subscribe(companySettings => {
                this.companySettings = companySettings;

                this.modelService.loadModelCache().then(() => {

                    this.statusService.loadStatusCache().then(() => {
                        if (!this.tickers) {
                            // get statuses from API and add it to the cache
                            Observable.forkJoin(
                                this.http.get('assets/tickers/accountingtickers.json', {observe: 'body'}),
                                this.http.get('assets/tickers/salestickers.json', {observe: 'body'}),
                                this.http.get('assets/tickers/toftickers.json', {observe: 'body'}),
                                this.http.get('assets/tickers/timetickers.json', {observe: 'body'}),
                                this.http.get('assets/tickers/salarytickers.json', {observe: 'body'}),
                                this.http.get('assets/tickers/sharedtickers.json', {observe: 'body'}),
                                this.http.get('assets/tickers/banktickers.json', {observe: 'body'})
                            ).map(tickerfiles => {
                                const allTickers: Array<Ticker> = [];

                                tickerfiles.forEach((fileContent: Array<Ticker>) => {
                                    fileContent.forEach(ticker => {
                                        allTickers.push(ticker);
                                    });
                                });

                                return allTickers;
                            })
                            .map((tickers: Array<Ticker>) => {
                                    tickers.forEach(ticker => {
                                        if (!ticker.Filters || ticker.Filters.length === 0) {
                                            const filter = new TickerFilter();
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
                                        } else {
                                            t.Type = 'table';
                                        }

                                        let model = null;
                                        if (t.Model && t.Model !== '') {
                                            model = this.modelService.getModel(t.Model);
                                            if (model) {
                                                model = cloneDeep(model);
                                                model.RelatedModels = [];
                                                model.Relations.forEach(rel => {
                                                    const relatedModel = this.modelService.getModel(rel.RelatedModel);
                                                    if (relatedModel) {
                                                        model.RelatedModels.push(
                                                            {
                                                                RelationName: rel.Name,
                                                                Model: cloneDeep(relatedModel)
                                                            });
                                                    } else {
                                                        console.log('rel not found:', rel);
                                                    }
                                                });
                                            }

                                            t.ApiModel = model;
                                        }

                                        if (t.Columns) {
                                            t.Columns.forEach(c => {
                                                c.Type = c.Type ? c.Type.toLowerCase() : '';

                                                this.setupFieldProperties(c, t, model);

                                                if (c.SubFields) {
                                                    c.SubFields.forEach(sf => {
                                                        this.setupFieldProperties(sf, t, model);
                                                    });
                                                }
                                            });
                                        }

                                        if (t.Actions) {
                                            t.Actions.forEach(action => {
                                                action.Type = action.Type ? action.Type.toLowerCase() : '';
                                                action.Options =
                                                    action.Options ? action.Options : new TickerActionOptions();

                                                action.Options.ParameterProperty =
                                                    action.Options.ParameterProperty ? action.Options.ParameterProperty : '';

                                                if (typeof action.DisplayInActionBar !== 'boolean') {
                                                    action.DisplayInActionBar = true;
                                                }
                                                if (typeof action.DisplayInContextMenu !== 'boolean') {
                                                    action.DisplayInContextMenu = false;
                                                }
                                                if (typeof action.DisplayForSubTickers !== 'boolean') {
                                                    action.DisplayForSubTickers = true;
                                                }
                                                if (typeof action.ExecuteWithMultipleSelections !== 'boolean') {
                                                    action.ExecuteWithMultipleSelections = false;
                                                }
                                                if (typeof action.ExecuteWithoutSelection !== 'boolean') {
                                                    action.ExecuteWithoutSelection = false;
                                                }
                                                if (typeof action.ExecuteWithoutSelection !== 'boolean') {
                                                    action.NeedsActionOverride = false;
                                                }
                                            });
                                        }

                                        // add model to all fieldfilters to get consistent setups, e.g filter
                                        // for field "InvoiceNumber" will be changed to
                                        // "CustomerInvoice.InvoiceNumber" if model = CustomerInvoice
                                        if (t.Model && t.Filters) {
                                            t.Filters.forEach(filter => {
                                                if (filter.FilterGroups) {
                                                    filter.FilterGroups.forEach(fg => {
                                                        if (fg.FieldFilters) {
                                                            fg.FieldFilters.forEach(ff => {
                                                                if (!this.isFunction(ff.Field)) {
                                                                    if (ff.Field.indexOf('.') === -1) {
                                                                        ff.Field = t.Model + '.' + ff.Field;
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });

                                    return tickers;
                                })
                                .map(tickers => {
                                    tickers.forEach(t => {
                                        if (!t.SubTickers) {
                                            t.SubTickers = [];
                                        }

                                        if (t.SubTickersCodes && t.SubTickersCodes.length) {
                                            t.SubTickersCodes.forEach(subTickerCode => {
                                                if (!t.SubTickers.find(x => x.Code === subTickerCode)) {
                                                    const subTicker = tickers.find(x => x.Code === subTickerCode);
                                                    if (subTicker) {
                                                        t.SubTickers.push(cloneDeep(subTicker));
                                                    } else {
                                                        console.log('SubTicker ' + subTickerCode + ' not found in loadTickerCache');
                                                    }
                                                }
                                            });
                                        }
                                    });

                                    return tickers;
                                })
                                .switchMap(allTickers => this.filterTickersByPermissions(allTickers))
                                .subscribe(filteredTickers => {
                                    this.tickers = filteredTickers;

                                    resolve();
                                }, err => reject(err)
                            );
                        } else {
                            resolve();
                        }
                    });
                });
            });
        });
    }

    private setupFieldProperties(c: TickerColumn, t: Ticker, model: any) {
        if (!c.Header) {
            // TODO: Get header based on translation
            c.Header = c.Field;
        }

        if (c.Header.indexOf('[BASECURRENCY]') !== -1) {
            let baseCurrencyCode;

            if (this.companySettings && this.companySettings.BaseCurrencyCode) {
                baseCurrencyCode = this.companySettings.BaseCurrencyCode.Code || 'Hovedvaluta';
            } else {
                baseCurrencyCode = 'Hovedvaluta';
            }

            c.Header = c.Header.replace('[BASECURRENCY]', baseCurrencyCode);
        }

        if (typeof c.DefaultHidden !== 'boolean') {
            c.DefaultHidden = false;
        }

        // TODO: tar ikke hensyn til f.eks. Customer.CustomerNumber her - sjekker
        // bare på hoved nivå.
        // Må utvide til å også sjekke path og finne modell basert på den
        let colName = c.Field;
        let aliasColName = '';
        let selectableColName = '';

        const modelname = (t.Model ? t.Model : '');

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
        c.Alias = c.Alias ? c.Alias : aliasColName;
        c.SelectableFieldName = selectableColName;


        // if not fieldtype is configured for the ticker column, try to find
        // type based on the model that is retrieved from the API
        if (model &&  (!c.Type || c.Type === '')) {
            const modelField = this.modelService.getField(model, colName);

            if (modelField) {
                if (modelField.Type.toString().indexOf('System.Int32') !== -1) {
                    c.Type = 'number';
                } else if (modelField.Type.toString().indexOf('System.Decimal') !== -1) {
                    c.Type = 'money';
                } else if (modelField.Type.toString().indexOf('System.Boolean') !== -1) {
                    c.Type = 'boolean';
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

    public getTicker(code: string): Observable<Ticker> {
        return Observable
            .fromPromise(this.getTickers())
            .map(tickers => tickers.find(ticker => ticker.Code === code));
    }

    public executeAction(action: TickerAction, ticker: Ticker, selectedRows: Array<any>): Promise<any> {
        return new Promise((resolve, reject) => {
            this.modelService.loadModelCache()
                .then(() => {
                    const model = this.modelService.getModel(ticker.Model);
                    const uniEntityClass = allModels[ticker.Model];

                    if (action.Type === 'new') {
                        // get url for new entity, navigate
                        let url: string = model && model.DetailsUrl ? model.DetailsUrl : '';

                        if (url && url !== '') {
                            url = url.replace(':ID', '0');
                            this.router.navigateByUrl(url);
                        } else {
                            throw Error('Could not navigate, no URL specified for model ' + ticker.Model);
                        }
                    } else if (action.Type === 'details') {
                        const rowId: number = null;
                        const urlIdProperty: string = 'ID';
                        let propValuePairs: {prop: string, value: any} [] = [{prop: urlIdProperty, value: rowId}];

                        // check that we can find the ID of the model - and that we have only one
                        if (!selectedRows || selectedRows.length !== 1) {
                            throw Error('Could not navigate, not possible to find ID to navigate to');
                        } else {
                            if (action.Options.ParameterProperty !== '') {
                                propValuePairs = [
                                    {
                                        prop: action.Options.ParameterProperty.toLowerCase(),
                                        value: selectedRows[0][action.Options.ParameterProperty.replace('.', '')]
                                    }
                                ];
                            } else if (action.Options.ParameterProperties
                                && action.Options.ParameterProperties.length) {
                                propValuePairs = [];
                                action.Options.ParameterProperties.forEach(prop => {
                                    propValuePairs.push({
                                        prop: prop.toLowerCase().replace('.', ''),
                                        value: selectedRows[0][prop.replace('.', '')]
                                    });
                                });
                            } else {
                                propValuePairs[0].value = selectedRows[0] && selectedRows[0]['ID'];
                            }
                        }

                        // get url for new entity, navigate
                        let url: string = model && model.DetailsUrl ? model.DetailsUrl : '';

                        if (url && url !== '') {
                            propValuePairs.forEach(pair => {
                                url = url.replace(`:${pair.prop}`, pair.value.toString());
                            });
                            this.router.navigateByUrl(url);
                        } else {
                            throw Error('Could not navigate, no URL specified for model ' + ticker.Model);
                        }

                    } else if (action.Type === 'action') {
                        console.error('actions with Type = "action" are not impelmented yet', action, ticker, selectedRows);

                    } else if (action.Type === 'transition') {
                        if (!uniEntityClass) {
                            throw Error('Cannot find unientity class for model ' + ticker.Model + ', cannot run transition');
                        } else if (!uniEntityClass.RelativeUrl || uniEntityClass.RelativeUrl === '') {
                            throw Error('No URL defined for unientity class for model ' + ticker.Model + ', cannot run transition');
                        }

                        // check that we can find the ID of the model - and that we have at least one
                        if (!selectedRows || selectedRows.length === 0) {
                            throw Error('No row selected, cannot execute transition ' + action.Options.Transition);
                        }

                        const service = new BizHttp<any>(this.uniHttp);
                        service.relativeURL = uniEntityClass.RelativeUrl;

                        // TBD: should consider some throttling here if a lot of rows are selected - could potentially
                        // start hundreds of requests - errors should probably also be handled better, but it
                        // is probably not optimal to run requests one-by-one either.
                        const requests = [];
                        selectedRows.forEach(row => {
                            requests.push(service.Transition(row['ID'], row, action.Options.Transition));

                            if (!row._links.transitions[action.Options.Transition]) {
                                reject(`Cannot execute transition ${action.Options.Transition}`
                                + ` for ID ${row['ID']}, transition is not available for this item`);
                            }

                            console.log(`Transition ${action.Options.Transition} queued for ID ${row['ID']}`);
                        });

                        Observable
                            .forkJoin(requests)
                            .subscribe(response => {
                                resolve();
                            },
                            err => {
                                reject(`Error executing transition ${action.Options.Transition}`);
                                this.errorService.handle(err);
                            }
                        );
                    }
            });
        });
    }

    public filterTickersByPermissions(tickers: Ticker[]): Observable<Ticker[]> {
        if (!tickers || !tickers.length) {
            return Observable.of([]);
        }

        return this.uniHttp.authService.authentication$.take(1).map(auth => {
            const permissions = (auth.user && auth.user['Permissions']) || [];
            if (!permissions.length) {
                return tickers;
            }

            const filtered = tickers.filter(ticker => {
                if (!ticker.RequiredUIPermissions || !ticker.RequiredUIPermissions.length) {
                    return true;
                }

                return ticker.RequiredUIPermissions.every(permission => {
                    const splitPermisions = permission.split('||');
                    if (splitPermisions.length > 1) {
                        // Split permissions are separated by 'or', so check if any of them
                        // match a user permission (.some(..))
                        return splitPermisions.some(p => this.authService.hasUIPermission(auth.user, p));
                    } else {
                        return this.authService.hasUIPermission(auth.user, permission);
                    }
                });
            });

            return filtered;
        });
    }

    public getGroupedTopLevelTickers(tickers: Ticker[]): Array<TickerGroup> {
        const groups: Array<TickerGroup> = [];

        for (const ticker of tickers.filter(x => x.IsTopLevelTicker)) {
            const groupName = ticker.Group;

            let group = groups.find(g => g.Name === groupName);

            if (!group) {
                group = {
                    Name: ticker.Group,
                    Tickers: []
                };

                groups.push(group);
            }

            group.Tickers.push(ticker);
        }

        return groups;
    }

    public getFieldValue(column: TickerColumn, data: any, ticker: Ticker, columnOverrides: ITickerColumnOverride[]) {
        let fieldValue: any = this.getFieldValueInternal(column, data);

        const templateOverrides = ColumnTemplateOverrides[ticker.Code] || {};
        const templateOverride = templateOverrides[column.Field];
        if (templateOverride) {
            fieldValue = templateOverride(data, column);
        }

        if (columnOverrides) {
            const columnOverride = columnOverrides.find(x => x.Field === column.Field);
            if (columnOverride) {
                fieldValue = columnOverride.Template(data);
            }
        }

        if (!fieldValue) {
            fieldValue = column.Placeholder || '';
        }

        let formattedFieldValue = fieldValue;

        const columnType = column.Type;

        switch (column.Type) {
            case 'number':
            case 'money':
            case 'percent':
                fieldValue = fieldValue || 0;
        }

        if (fieldValue !== '') {
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

        if (column.SelectableFieldName.toLocaleLowerCase().endsWith('entitytype')) {
            const model = this.modelService.getModel(data[column.Alias]);
            if (model) {
                const linkNavigationPropertyAlias = column.LinkNavigationProperty.replace('.', '');
                formattedFieldValue = `${model.TranslatedName} #${data[linkNavigationPropertyAlias]}`;
            }
        }

        if (column.SelectableFieldName.toLocaleLowerCase().endsWith('entitydisplayvalue')) {
            const model = this.modelService.getModel(data['SharingEntityType']);
            if (model) {
                formattedFieldValue = `${model.TranslatedName} ${fieldValue}`;
            }
        }

        if (column.SelectableFieldName.toLowerCase().endsWith('statuscode')) {
            formattedFieldValue = this.statusCodeToText(data[column.Alias]);
        }

        if (column.SubFields && column.SubFields.length > 0) {
            column.SubFields.forEach(sf => {
                const subFieldValue = this.getFieldValue(sf, data, ticker, columnOverrides);
                if (subFieldValue && subFieldValue !== '') {
                    formattedFieldValue += column.Seperator ? column.Seperator + subFieldValue : ' - ' + subFieldValue;
                }
            });
        }

        return formattedFieldValue;
    }

    public linkColUrlResolver(column: TickerColumn, data: any, ticker: Ticker): string {
        let fieldValue: any = this.getFieldValueInternal(column, data);
        // if (columnOverrides) {
        //     let columnOverride = columnOverrides.find(x => x.Field === column.Field);
        //     if (columnOverride) {
        //         fieldValue = columnOverride.Template(data);
        //     }
        // }

        if (!fieldValue) {
            fieldValue = column.Placeholder || '';
        }

        if (column.Type === 'link') {
            let url = '';
            if (column.ExternalModel) {

                if (column.ExternalModel === 'JournalEntry') {
                    const value = data[column.Alias].toString();

                    const numberAndYear = value.split('-');
                    let linkUrl = `/accounting/transquery?JournalEntryNumber=${numberAndYear[0]}&AccountYear=`;

                    if (numberAndYear.length > 1) {
                        linkUrl += numberAndYear[1];
                    } else {
                        let year = new Date().getFullYear();

                        // Lets try to find the year in another field
                        // Dont use delivery dates or due dates, as these may vary
                        for (const key in data) {
                            if (key.toLowerCase().includes('date')
                                && !key.toLowerCase().includes('due')
                                && !key.toLowerCase().includes('delivery')) {
                                year = moment(data[key]).year();
                            }
                        }

                        linkUrl += year;
                    }

                    return linkUrl;
                } else {
                    let modelName = column.ExternalModel;

                    if (column.Field === 'EntityDisplayValue' && ticker.Code === 'sharings_list') {
                        modelName = data['SharingEntityType'];
                    }

                    const externalModel = this.modelService.getModel(modelName);

                    if (externalModel && externalModel.DetailsUrl) {
                        url = externalModel.DetailsUrl;
                        if (modelName === 'CustomerInvoiceReminder') {
                            url = url + '/reminded';
                        }

                        if (column.LinkNavigationProperty) {
                            const linkNavigationPropertyAlias = column.LinkNavigationProperty.replace('.', '');
                            if (data[linkNavigationPropertyAlias]) {
                                url = url.replace(':ID', data[linkNavigationPropertyAlias]);
                            } else {
                                // we dont have enough data to link to the external model, just show
                                // the property as a normal field
                                url = '';
                            }
                        } else if (column.LinkNavigationProperties && column.LinkNavigationProperties.length) {
                            column.LinkNavigationProperties.forEach(prop => {
                                url = url.replace(`:${prop.toLowerCase().replace('.', '')}`, data[prop.replace('.', '')]);
                            });
                        } else {
                            if (data['ID']) {
                                url = url.replace(':ID', data['ID']);
                            }
                        }
                    } else {
                        console.error(`${column.ExternalModel} not found, or no details url specified for model`);
                    }
                }
            } else {
                const model = ticker.ApiModel || this.modelService.getModel(ticker.Model);

                if (model && model.DetailsUrl) {
                    url = model.DetailsUrl;

                    if (column.LinkNavigationProperty) {
                        const linkNavigationPropertyAlias = column.LinkNavigationProperty.replace('.', '');
                        if (data[linkNavigationPropertyAlias]) {
                            url = url.replace(':ID', data[linkNavigationPropertyAlias]);
                        } else {
                            // we dont have enough data to link to the external model, just show
                            // the property as a normal field
                            url = '';
                        }
                    } else if (column.LinkNavigationProperties && column.LinkNavigationProperties.length) {
                        column.LinkNavigationProperties.forEach(prop => {
                            url = url.replace(`:${prop.toLowerCase().replace('.', '')}`, data[prop.replace('.', '')]);
                        });
                    } else {
                        if (data['ID']) {
                            url = url.replace(':ID', data['ID']);
                        }
                    }
                } else {
                    console.error(`${ticker.Model} not found, or no details url specified for model`);
                }
            }

            return url;

        } else if (column.Type === 'external-link') {
            return fieldValue;
        } else if (column.Type === 'mailto') {
            return 'mailto:' + fieldValue;
        }
    }

    private statusCodeToText(statusCode: number): string {
        const text: string = this.statusService.getStatusText(statusCode);
        return text || (statusCode ? statusCode.toString() : '');
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
            const colName = fieldName.substring(fieldName.lastIndexOf('.') + 1);
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

    public getFilterString(
        filterGroups: TickerFilterGroup[],
        expressionFilterValues: IExpressionFilterValue[],
        useAllCriterias: boolean,
        mainModel: string
    ): string {
        let filterString: string = '';
        let isInGroup: boolean = false;
        let lastGroupWasUsed: boolean = false;

        for (let groupIndex = 0; groupIndex < filterGroups.length; groupIndex++) {
            const group = filterGroups[groupIndex];
            let filters = group.FieldFilters;

            // dont use filters that miss either field or operator - this is probably just a filter
            // the user has not finished constructing yet
            if (filters) {
                filters = filters.filter(x => x.Field && x.Field !== '' && x.Operator && x.Operator !== '');
            }

            if (filters && filters.length > 0) {
                const orderedByGroupFilters = filters.sort((a, b) => a.QueryGroup - b.QueryGroup);
                isInGroup = false;

                let groupFilterString: string = '';
                let needsDelimiterBeforeNextFilter: boolean = false;

                for (let index = 0; index < orderedByGroupFilters.length; index++) {
                    const filter: TickerFieldFilter = orderedByGroupFilters[index];
                    const filterValue: string = this.getFilterValueFromFilter(filter, expressionFilterValues);

                    if (filterValue || filterValue === '') {
                        // open new filter group with parenthesis
                        if (!isInGroup) {
                            groupFilterString += '(';
                            isInGroup = true;
                        }

                        // add "or" or "and" between groups depending on the UseAllCriterias flag
                        if (groupFilterString !== '' && needsDelimiterBeforeNextFilter) {
                            if (!group.UseAllCriterias) {
                                groupFilterString += ' or ';
                            } else {
                                groupFilterString += ' and ';
                            }

                            needsDelimiterBeforeNextFilter = false;
                        }

                        if (filter.Operator === 'contains' || filter.Operator === 'startswith' || filter.Operator === 'endswith') {
                            // Function operator
                            groupFilterString += (`${filter.Operator}(${filter.Field},'${filterValue}')`);
                        } else {
                            // Logical operator
                            if (!this.isFunction(filter.Field)) {
                                groupFilterString += `${filter.Field} ${filter.Operator} '${filterValue}'`;
                            } else {
                                // field is a function, trust the user knows what he is doing..
                                groupFilterString += `${filter.Field} ${filter.Operator} '${filterValue}'`;
                            }
                        }

                        needsDelimiterBeforeNextFilter = true;
                    }
                }

                // add "or" or "and" between groups
                if (groupFilterString !== '') {
                    // close group if we are in a group
                    if (isInGroup) {
                        groupFilterString += ' )';
                        isInGroup = false;
                    }

                    if (groupIndex > 0 && !useAllCriterias && lastGroupWasUsed) {
                        filterString += ' or ' + groupFilterString;
                    } else if (groupIndex > 0 && lastGroupWasUsed) {
                        filterString += ' and ' + groupFilterString;
                    } else {
                        filterString += groupFilterString;
                    }

                    lastGroupWasUsed = true;
                } else {
                    lastGroupWasUsed = false;
                }
            }
        }

        return filterString;
    }

    private getFilterValueFromFilter(filter: TickerFieldFilter, expressionFilterValues: IExpressionFilterValue[]): string {
        let filterValue = filter.Value ? filter.Value.toString() : '';

        // if expressionfiltervalues are defined, e.g. ":currentuserid", check if any of the defined filters
        // should inject the expressionfiltervalue
        if (filterValue.toString().startsWith(':')) {
            const expressionFilterValue = expressionFilterValues.find(efv => ':' + efv.Expression === filterValue);

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

        const currentHistoryItem = this.getSearchHistoryItem(ticker, filter);

        // if there is already a search item for the ticker/filter supplied, remove it from
        // the list - we will push it to the front of the list afterwards, this will
        // move it to the top of the "stack"
        if (currentHistoryItem) {
            existingHistory = existingHistory.filter(x =>
                !(x.TickerCode === ticker.Code
                && ((!x.TickerFilterCode && !filter)
                || (x.TickerFilterCode && filter && x.TickerFilterCode === filter.Code)))
            );
        }

        // add the search history to the start of the array ("top of the stack")
        const newHistoryItem: TickerHistory = {
            TickerCode: ticker.Code,
            TickerName: ticker.Name,
            TickerFilterCode: filter ? filter.Code : null,
            TickerFilterName: filter ? filter.Name : null,
            Url: url
        };

        existingHistory.unshift(newHistoryItem);

        // we shouldnt keep more than 10 items in the history, so remove an item if we have
        // more than this (because this is done every time an item is added, we will never
        // actually end up with more than 10 in our array)
        if (existingHistory.length > 10) {
            existingHistory.pop();
        }

        this.storageService.setItemOnCompany(this.TICKER_LOCALSTORAGE_KEY, existingHistory);

        return newHistoryItem;
    }

    public getSearchHistoryItems(): Array<TickerHistory> {
        const historicalItems = this.storageService.getItemFromCompany(this.TICKER_LOCALSTORAGE_KEY);

        if (historicalItems) {
            return historicalItems;
        }

        return [];
    }

    public getSearchHistoryItem(ticker: Ticker, filter: TickerFilter): TickerHistory {
        const historyItem = this.storageService.getItemFromCompany(this.TICKER_LOCALSTORAGE_KEY);

        if (historyItem) {
            const array: Array<TickerHistory> = historyItem;

            if (filter) {
                return array.find(
                    x => x.TickerCode === ticker.Code
                        && x.TickerFilterCode && x.TickerFilterCode === filter.Code);
            } else {
                return array.find(
                    x => x.TickerCode === ticker.Code && !x.TickerFilterCode);
            }
        }

        return null;
    }

    public deleteSearchHistoryItem(ticker: Ticker, filter: TickerFilter) {
        let existingHistory = this.getSearchHistoryItems();

        existingHistory = existingHistory.filter(x => !(x.TickerCode === ticker.Code
                    && ((!x.TickerFilterCode && !filter)
                    || (x.TickerFilterCode && filter && x.TickerFilterCode === filter.Code)))
            );

        this.storageService.setItemOnCompany(this.TICKER_LOCALSTORAGE_KEY, existingHistory);
    }

    public getOperators() {
        return [
            {
                'verb': 'inneholder',
                'operator': 'contains',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'begynner med',
                'operator': 'startswith',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'slutter på',
                'operator': 'endswith',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'er',
                'operator': 'eq',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'er ikke',
                'operator': 'ne',
                'accepts': [
                    'Text',
                    'Number'
                ]
            },
            {
                'verb': 'er større enn',
                'operator': 'gt',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            },
            {
                'verb': 'er større el. lik',
                'operator': 'ge',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            },
            {
                'verb': 'er mindre enn',
                'operator': 'lt',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            },
            {
                'verb': 'er mindre el. lik',
                'operator': 'le',
                'accepts': [
                    'Number',
                    'DateTime'
                ]
            }
        ];
    }

    // Search value and text showing in the dropdown in advanced search
    public getSelectConfigOptions(configKey: string) {
        switch (configKey) {
            case 'SharingType':
                return [
                    {ID: 0,                         Name: 'Bruk utsendelsesplan'},
                    {ID: SharingType.AP,            Name: 'Aksesspunkt'},
                    {ID: SharingType.Email,         Name: 'E-post'},
                    {ID: SharingType.Export,        Name: 'Eksport'},
                    {ID: SharingType.Print,         Name: 'Utskrift'},
                    {ID: SharingType.InvoicePrint,  Name: 'Fakturaprint'},
                    {ID: SharingType.Factoring,     Name: 'Factoring'},
                    {ID: SharingType.Efaktura,      Name: 'Efaktura'},
                    {ID: SharingType.Avtalegiro,    Name: 'Avtalegiro'}
                ];

            case 'SharingStatusCode':
                return [
                    {ID: StatusCodeSharing.Pending,     Name: 'I kø'},
                    {ID: StatusCodeSharing.InProgress,  Name: 'Behandles'},
                    {ID: StatusCodeSharing.Failed,      Name: 'Feilet'},
                    {ID: StatusCodeSharing.Completed,   Name: 'Fullført'},
                    {ID: StatusCodeSharing.Cancelled,   Name: 'Avbrutt'}
                ];
            case 'PrintStatus':
                return [
                    { Name: 'Sendt på e-post',       ID: 100 },
                    { Name: 'Sendt til utskrift',    ID: 200 },
                    { Name: 'Sendt til aksesspunkt', ID: 300 }
                ];
            case 'TypeOfEmployment':
                return [
                    { ID: 0,                                                    Name: 'Ikke valgt' },
                    { ID: TypeOfEmployment.OrdinaryEmployment,                  Name: '1 - Ordinært arbeidsforhold' },
                    { ID: TypeOfEmployment.MaritimeEmployment,                  Name: '2 - Maritimt arbeidsforhold' },
                    { ID: TypeOfEmployment.FrilancerContratorFeeRecipient,      Name: '3 - Frilanser, oppdragstager, honorar' },
                    { ID: TypeOfEmployment.PensionOrOtherNonEmployedBenefits,   Name: '4 - Pensjon og annet uten ansettelse' }
                ];
            case 'RemunerationType':
                return [
                    { ID: RemunerationType.notSet,              Name: 'Ikke valgt' },
                    { ID: RemunerationType.FixedSalary,         Name: '1 - Fast lønnet' },
                    { ID: RemunerationType.HourlyPaid,          Name: '2 - Timelønnet' },
                    { ID: RemunerationType.PaidOnCommission,    Name: '3 - Provisjonslønnet' },
                    { ID: RemunerationType.OnAgreement_Honorar, Name: '4 - Honorar' },
                    { ID: RemunerationType.ByPerformance,       Name: '5 - Akkord' }
                ];
            case 'WorkingHoursScheme':
                return  [
                    { ID: 0, Name: 'Ikke valgt' },
                    { ID: WorkingHoursScheme.NonShift,                  Name: '1 - Ikke skiftarbeid' },
                    { ID: WorkingHoursScheme.OffshoreWork,              Name: '2 - Arbeid offshore' },
                    { ID: WorkingHoursScheme.ContinousShiftwork336,     Name: '3 - Helkontinuerlig skiftarbeid' },
                    { ID: WorkingHoursScheme.DayAndNightContinous355,   Name: '4 - Døgnkontinuerlig skiftarbeid' },
                    { ID: WorkingHoursScheme.ShiftWork,                 Name: '5 - skiftarbeid' }
                ];
            case 'ShipType':
                return [
                    {ID: ShipTypeOfShip.notSet,                         Name: 'Ikke valgt'},
                    {ID: ShipTypeOfShip.Other,                          Name: '1 - Annet'},
                    {ID: ShipTypeOfShip.DrillingPlatform,               Name: '2 - Boreplattform'},
                    {ID: ShipTypeOfShip.Tourist,                        Name: '3 - Turist'}
                ];
            case 'ShipReg':
                return [
                    {ID: ShipRegistry.notSet,                               Name: 'Ikke valgt'},
                    {ID: ShipRegistry.NorwegianInternationalShipRegister,   Name: '1 - Norsk Internasjonalt skipsregister (NIS)'},
                    {ID: ShipRegistry.NorwegianOrdinaryShipRegister,        Name: '2 - Norsk ordinært skipsregister (NOR)'},
                    {ID: ShipRegistry.ForeignShipRegister,                  Name: '3 - Utenlandsk skipsregister (UTL)'}
                ];
            case 'TypeOfEmployment':
                return [
                    {ID: ShipTradeArea.notSet,                  Name: 'Ikke valgt'},
                    {ID: ShipTradeArea.Domestic,                Name: '1 - Innenriks'},
                    {ID: ShipTradeArea.Foreign,                 Name: '2 - Utenriks'}
                ];
            case 'LeaveType':
                return [
                    {ID: Leavetype.NotSet,                      Name: 'Ikke valgt'},
                    {ID: Leavetype.Leave,                       Name: 'Permisjon'},
                    {ID: Leavetype.LayOff,                      Name: 'Permittering'},
                    {ID: Leavetype.Leave_with_parental_benefit, Name: 'Permisjon med foreldrepenger'},
                    {ID: Leavetype.Military_service_leave,      Name: 'Permisjon ved militærtjeneste'},
                    {ID: Leavetype.Educational_leave,           Name: 'Utdanningspermisjon'},
                    {ID: Leavetype.Compassionate_leave,         Name: 'Velferdspermisjon'}
                ];

            case 'TaxType':
                return [
                    { ID: TaxType.Tax_None,     Name: 'Ingen' },
                    { ID: TaxType.Tax_Table,    Name: 'Tabelltrekk' },
                    { ID: TaxType.Tax_Percent,  Name: 'Prosenttrekk' },
                    { ID: TaxType.Tax_0,        Name: 'Trekkplikt uten skattetrekk' }
                ];
            case 'LimitType':
                return [
                    {Type: LimitType.None,              Name: 'Ingen'},
                    {Type: LimitType.Amount,            Name: 'Antall'},
                    {Type: LimitType.Amount,            Name: 'Beløp'}
                ];
            case 'SpecialAgaRule':
                return [
                    { ID: SpecialAgaRule.Regular,       Name: 'Vanlig' },
                    { ID: SpecialAgaRule.AgaRefund,     Name: 'Aga refusjon' },
                    { ID: SpecialAgaRule.AgaPension,    Name: 'Aga pensjon' }
                ];
            case 'SpecialTaxAndContributionsRule':
                return [
                    { ID: SpecialTaxAndContributionsRule.Standard,                      Name: 'Standard/ingen valgt' },
                    { ID: SpecialTaxAndContributionsRule.NettoPayment,                  Name: 'Netto lønn' },
                    { ID: SpecialTaxAndContributionsRule.SpesialDeductionForMaritim,    Name: 'Særskilt fradrag for sjøfolk'},
                    { ID: SpecialTaxAndContributionsRule.Svalbard,                      Name: 'Svalbard' },
                    { ID: SpecialTaxAndContributionsRule.PayAsYouEarnTaxOnPensions,     Name: 'Kildeskatt for pensjonister' },
                    { ID: SpecialTaxAndContributionsRule.JanMayenAndBiCountries,        Name: 'Jan Mayen og bilandene' },
                    { ID: SpecialTaxAndContributionsRule.NettoPaymentForMaritim,        Name: 'Nettolønn for sjøfolk' }
                ];
            case 'StandardWageTypeFor':
                return [
                    { ID: StdWageType.None,                         Name: 'Ingen' },
                    { ID: StdWageType.TaxDrawTable,                 Name: 'Tabelltrekk' },
                    { ID: StdWageType.TaxDrawPercent,               Name: 'Prosenttrekk' },
                    { ID: StdWageType.HolidayPayWithTaxDeduction,   Name: 'Feriepenger med skattetrekk' },
                    { ID: StdWageType.HolidayPayThisYear,           Name: 'Feriepenger i år' },
                    { ID: StdWageType.HolidayPayLastYear,           Name: 'Feriepenger forrige år' },
                    { ID: StdWageType.HolidayPayEarlierYears,       Name: 'Feriepenger tidligere år' },
                    { ID: StdWageType.AdvancePayment,               Name: 'Forskudd' },
                    { ID: StdWageType.Contribution,                 Name: 'Bidragstrekk' },
                    { ID: StdWageType.Garnishment,                  Name: 'Utleggstrekk skatt' },
                    { ID: StdWageType.Outlay,                       Name: 'Utleggstrekk' },
                    { ID: StdWageType.SourceTaxPension,             Name: 'Forskuddstrekk kildeskatt på pensjon' }
                ];
            case 'WorkTypeSystemType':
                return [
                    { ID: 1, Name: 'Timer' },
                    { ID: 8, Name: 'Utbetalt flex' },
                    { ID: 9, Name: 'Fri med lønn' },
                    { ID: 10, Name: 'Fri' },
                    { ID: 11, Name: 'Fri (flex)' },
                    { ID: 12, Name: 'Overtid' },
                    { ID: 13, Name: 'Ferie' },
                    { ID: 20, Name: 'Sykdom' }
                ];
            case 'PaymentStatus':
                return [
                    { ID: 30112, Name: 'Betalt' },
                    { ID: 30111, Name: 'Delbetalt' },
                    { ID: 30110, Name: 'Overført til bank' },
                    { ID: 30009, Name: 'Ubetalt' }
                ];
            default:
                return [];
        }
    }
}

// Refactor: no need for these to be classes??
// Also, lowerCamelCase por favor
export class TickerGroup {
    public Name: string;
    public Tickers: Array<Ticker>;
}

export interface TickerQuickFilter extends QuickFilter {
    checkBoxValues?: {
        true: string;
        false: string;
    };
}

export class Ticker {
    public Name: string;
    public Code: string;
    public Type?: string;
    public Group: string;
    public IsTopLevelTicker: boolean;
    public AvoidAutoExpand?: boolean;
    public HideCounter?: boolean;
    public Model: string;
    public OrderBy?: string;
    public ApiModel?: ApiModel;
    public Select?: string;
    public Expand?: string;
    public Distinct?: boolean;
    public CountExpand?: string;
    public Joins?: string;
    public ListObject?: string;
    public DisableFiltering?: boolean;
    public Columns: Array<TickerColumn>;
    public ParentFilter?: TickerFieldFilter;
    public SubTickers?: Array<Ticker>;
    public SubTickersCodes?: Array<string>;
    public Filter?: string;
    public Filters?: Array<TickerFilter>;
    public QuickFilters?: TickerQuickFilter[];
    public UseParentTickerActions?: boolean;
    public Actions?: Array<TickerAction>;
    public Pagesize?: number;
    public IsActive?: boolean;
    public ReadOnlyCases?: {Key: string, Value: any}[];
    public MultiRowSelect?: boolean;
    public RequiredUIPermissions?: string[];
    public DefaultTabIndex?: number;
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
    public Header?: string;
    public Field: string;
    public FeaturePermission?: string;
    public IsBankRuleField?: boolean;
    public SelectableFieldName?: string;
    public Format?: string;
    public Width?: string;
    public Resizeable?: boolean;
    public DefaultHidden?: boolean;
    public ShowOnlyOnThisFilter?: number;
    public DefaultHiddenOnGivenFilters?: string[];
    public CssClass?: string;
    public Type?: string;
    public SumFunction?: string;
    public Alias?: string;
    public ExternalModel?: string;
    public LinkNavigationProperty?: string;
    public LinkNavigationProperties?: string[];
    public FilterOperator?: string;
    public SubFields?: Array<TickerColumn>;
    public Placeholder?: string;
    public FieldSetColumn?: number;
    public SumColumn?: boolean;
    public MarkedRowsSumCol?: boolean;
    public ReadOnlyCases?: {Key: string, Value: any}[];
    public DisplayField?: string;
    public Expand?: string;
    public FilterSelectConfigKey?: string;
    public SelectRequired?: boolean;
    public Alignment?: 'left' | 'right' | 'center';
    public EnableRowGroup?: boolean;
    public Seperator?: string;
    public Stuff?: boolean;
}

export interface ITickerColumnOverride {
    Field: string;
    Template?: (data: any) => string;
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
    public OrderBy?: string;
    public IsActive: boolean;
    public tooltip?: string;
    public FilterGroups: Array<TickerFilterGroup>;
    public UseAllCriterias: boolean = true;
    public CurrentCount?: number;
    public IsMultiRowSelect: boolean = false;
    public featurePermission?: string;
}

export class TickerAction {
    public Name: string;
    public Code: string;
    public FeaturePermission?: string;
    public Type: string;
    public ConfirmBeforeExecuteMessage?: string;
    public ExecuteWithMultipleSelections?: boolean;
    public ExecuteWithoutSelection?: boolean;
    public DisplayInContextMenu?: boolean = true;
    public DisplayInActionBar?: boolean = true;
    public DisplayForSubTickers?: boolean = true;
    public NeedsActionOverride?: boolean = false;
    public SendParentModel?: boolean = false;
    public Options: TickerActionOptions;
    public Route?: String;
}

export class TickerActionOptions {
    public ParameterProperty?: string;
    public ParameterProperties?: string[];
    public Action?: string;
    public Transition?: string;
    public ReportName?: string;
}

export interface ITickerActionOverride {
    Code: string;
    CheckActionIsDisabled?: (selectedRow: any) => boolean;
    BeforeExecuteActionHandler?: (selectedRows: Array<any>) => Promise<boolean> | boolean;
    ExecuteActionHandler?: (selectedRows: Array<any>) => Promise<any>;
    AfterExecuteActionHandler?: (selectedRows: Array<any>) => Promise<any>;
}

export class TickerHistory {
    public Url: string;
    public TickerCode: string;
    public TickerName: string;
    public TickerFilterCode: string;
    public TickerFilterName: string;
}
