import { getDeepValue, parseDate, safeDec } from '@app/components/common/utils/utils';
import { AccountService } from '@app/services/services';
import { Account, VatType, LocalDate } from '@uni-entities';
import { UniTable, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { UniHttp } from '@uni-framework/core/http';

export class CsvConverter {

    constructor(private http: UniHttp, private accountService: AccountService, private vattypes: VatType[]) {

    }

    public static getCsvData(table: UniTable, divider = '\t'): string {
        const colNames = table.tableColumns.filter( x => x.get('visible') ).map( y => y.get('field')).toArray();
        const cols = table.config.columns.filter( y => colNames.indexOf(y.field) >= 0 && y.field !== 'ID');
        const header = cols.map( x => x.header).join(divider);
        const rows = [];
        table.getTableData().forEach(row => {
            rows.push( cols.map( x => {
                return this.toString(row[x.field], x, row);
            }).join(divider));
        });
        return header + '\n' + rows.join('\n');
    }

    private static toString(value: any, col: UniTableColumn, row: any) {
        switch (col.type) {
            case UniTableColumnType.Lookup:
                if (col.field === 'DebitAccount' || col.field === 'CreditAccount') { return value?.AccountNumber; }
                if (col.field === 'DebitVatType' || col.field === 'CreditVatType') { return value?.VatCode; }
                if (col.field === 'Dimensions.Project') { return row?.Dimensions?.Project?.ProjectNumber; }
                if (col.field === 'Dimensions.Department') { return row?.Dimensions?.Department?.DepartmentNumber; }
                if (col.field === 'JournalEntryType') { return value?.Number; }
                if (col.field === 'SameOrNewDetails') {
                    if (value?.Name) {
                        const parts = value.Name.split('-');
                        if (parts.length > 0) { return parts[0]; }
                    }
                    return value?.Name;
                }
                if (col.field.indexOf('Dimensions.Dimension') === 0) {
                    { return getDeepValue(row, col.field + '.Number'); }
                }
                break;

            case UniTableColumnType.Select:
                if (col.field === 'CurrencyCode') { return value?.Code; }
                break;

            case UniTableColumnType.LocalDate:
                return moment(value).format('DD.MM.YYYY');

            case UniTableColumnType.Money:
            case UniTableColumnType.Number:
                return value ? value.toFixed(2).replace('.', ',') : '0';
        }
        return value;
    }

    private static fromString(value: any, col: UniTableColumn) {
        switch (col.type) {
            case UniTableColumnType.Money:
            case UniTableColumnType.Number:
                return value ? safeDec(value) : 0;
            case UniTableColumnType.LocalDate:
                if (!value) { return undefined; }
                try {
                    const converted = parseDate(value);
                    if (converted) {
                        value = new LocalDate(converted);
                        const thisYear = new Date().getFullYear();
                        if (value.year < thisYear - 10 || value.year > thisYear + 2 ) { return undefined; }
                        return value;
                    }
                } catch {}
                return undefined;
        }
        return value;
    }

    public setCsvData(table: UniTable, value: string, divider = '\t'): Promise<any> {

        const rows = value.split('\n');
        if (!(rows && rows.length >= 2)) { return Promise.resolve([]); }

        // Detect column-names from first row
        const columns = table.config.columns.slice();
        const title = rows[0].split(divider);
        const targets: Array<{ index: number, column: UniTableColumn }> = [];
        for (let cellIndex = 0; cellIndex < title.length; cellIndex++) {
            if (!title[cellIndex]) { continue; }
            // Extract column-title
            let colTitle = title[cellIndex].toLocaleLowerCase();
            if (colTitle.length > 0 && colTitle.substr(colTitle.length - 1, 1) === '\r') {
                colTitle = colTitle.substr(0, colTitle.length - 1);
            }
            // Locate matching column in layout
            const match = columns.filter( x => x.header.toLocaleLowerCase() === this.mapAlternative(colTitle) );
            if (match && match.length > 0) {
                targets.push({ index: cellIndex, column: match[0] });
                columns.splice(columns.indexOf(match[0]), 1);
            }
        }

        // Prepare lookup-columns (values that we have to fetch)
        const journalEntryData = []; let financialDateMapped = false; let amountMapped = false;

        // tslint:disable: max-line-length
        const lookup = [
            { field: 'DebitAccount', field2: 'CreditAccount', route: 'accounts', key: 'AccountNumber', keys: [], values: [], isNumeric: true },
            { field: 'DebitVatType', field2: 'CreditVatType', route: 'vattypes', key: 'VatCode', keys: [], values: this.vattypes },
            { field: 'CurrencyCode', route: 'currencycodes', key: 'Code', keys: [], map: undefined, values: [], idField: 'CurrencyID' },
            { field: 'Dimensions.Project', route: 'projects', key: 'ProjectNumber', keys: [], parent: 'Dimensions', child: 'Project', values: [] },
            { field: 'Dimensions.Department', route: 'departments', key: 'DepartmentNumber', keys: [], parent: 'Dimensions', child: 'Department', values: [] },
            { field: 'Dimensions.Dimension5', route: 'dimension5', key: 'Number', keys: [], parent: 'Dimensions', child: 'Dimension5', values: [] },
            { field: 'Dimensions.Dimension6', route: 'dimension6', key: 'Number', keys: [], parent: 'Dimensions', child: 'Dimension6', values: [] },
            { field: 'Dimensions.Dimension7', route: 'dimension7', key: 'Number', keys: [], parent: 'Dimensions', child: 'Dimension7', values: [] },
            { field: 'Dimensions.Dimension8', route: 'dimension8', key: 'Number', keys: [], parent: 'Dimensions', child: 'Dimension8', values: [] },
            { field: 'Dimensions.Dimension9', route: 'dimension9', key: 'Number', keys: [], parent: 'Dimensions', child: 'Dimension9', values: [] },
            { field: 'Dimensions.Dimension10', route: 'dimension10', key: 'Number', keys: [], parent: 'Dimensions', child: 'Dimension10', values: [] },
        ];

        // Detect which lookups are used (so that we can fetch them all in one-go)
        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex]?.split(divider);
            const dataRow = <any>{ AmountCurrency: 0, Description: '', Amount: 0 };
            targets.forEach( map => {

                let cellValue = row && row.length > map.index ? row[map.index] : undefined;
                if (!cellValue) { return; }

                lookup.forEach( dep => {
                    if (!(map.column.field === dep.field || map.column.field === dep.field2)) { return; }
                    cellValue = cellValue.replace(dep.isNumeric ? /[^0-9]/g : /[^A-Za-z0-9-+._]/g, '');
                    if (dep.keys.indexOf(cellValue) < 0) { dep.keys.push(cellValue); }
                    if (map.column.field === dep.field) { dataRow[dep.field] = cellValue; }
                    if (map.column.field === dep.field2) { dataRow[dep.field2] = cellValue; }
                });

                switch (map.column.field) {
                    case 'SameOrNewDetails':
                        dataRow.JournalEntryNo = cellValue;
                        break;
                    default:
                        const converted = CsvConverter.fromString(cellValue, map.column);
                        if (converted) {
                            if (map.column.field === 'FinancialDate') { financialDateMapped = true; }
                            if (map.column.field === 'Amount') { amountMapped = true; }
                            dataRow[map.column.field] = converted;
                        }
                        break;
                }
            });
            if (dataRow.AmountCurrency) {
                if (!amountMapped) { dataRow.Amount = dataRow.AmountCurrency; }
                if (!financialDateMapped) { dataRow.FinancialDate = dataRow.VatDate; }
                journalEntryData.push(dataRow);
            }
        }

        // Query server for accounts, projects, etc.
        const apiCalls = []; const chunkSize = 100; const resolveMapping = [];
        lookup.forEach( x => {
            if (x.values && x.values.length > 0) { return; }
            if (!x.keys.length) { return; }
            while (x.keys.length > 0) {
                const chunk = x.keys.splice(0, x.keys.length > chunkSize ? chunkSize : x.keys.length);
                const query = `${x.route}?filter=${chunk.map( a => `${x.key} eq '${a}'`).join(' or ')}`;
                apiCalls.push(this.apiCall(query));
                resolveMapping.push(x);
            }
        });

        // Setup final handler that can be called (if needed) after we get the accounts, departments etc.
        const finalHandler = (result, resolve) => {
            journalEntryData.forEach( x => {
                result.forEach( def => {
                    if (!def.map) { def.map = targets.find( t => t.column.field === def.field); }
                    if ((x[def.field]) && def.map) { this.mapLookupValue(def, def.field, x); }
                    if ((x[def.field2]) && def.map) { this.mapLookupValue(def, def.field2, x); }
                });
            });
            resolve(journalEntryData);
        };

        return new Promise( (resolve, reject) =>
            apiCalls.length
            ? Observable.forkJoin(apiCalls)
                .subscribe( results => {
                    results.forEach( (x: any, index) => {
                        if (x.length <= 0) { return; }
                        const lk = resolveMapping[index];
                        if (!lk) { return; }
                        if (x[0][lk.key]) {
                            lk.values = lk.values.concat(x);
                        }
                    });
                    finalHandler(lookup, resolve);
            }, err => reject(err))
            : finalHandler(lookup, resolve)
        );

    }

    mapLookupValue(lookup: any, fieldName: string, target: any) {
        let value = target[fieldName];
        if (lookup.parent && lookup.child) {
            target[lookup.parent] = target[lookup.parent] || {};
            target = target[lookup.parent];
            fieldName = lookup.child;
        }
        // Set value
        target[fieldName] = this.mapLookup(value, lookup.key, lookup.values, lookup.isNumeric);
        value = target[fieldName];
        // Set ID (if any)
        if (value && value.ID) { target[(lookup.idField || (fieldName + 'ID'))] = value.ID; }
    }

    private mapAlternative(colName: string): string {
        switch (colName) {
            case 'tekst':
            case 'text':
                return 'beskrivelse';
            case 'konto':
                return 'debet';
            case 'bilagsnr.':
            case 'bilagsnummer':
                return 'bilagsnr';
            case 'mvakode':
                return 'mva';
            case 'faktura':
            case 'fakturanummer':
                return 'fakturanr';
            default:
                return colName;
        }
    }

    private mapLookup(value: string, colName: string, list: Array<any>, isNumeric = false) {
        if ((!value) || (!(list)) || list.length === 0) { return; }
        if (isNumeric) {
            const iVal = parseInt(value, 10);
            return list.find( x => x[colName] === iVal );
        } else {
            if (!value.trim()) { return; }
            const lcase = value.trim().toLocaleLowerCase();
            return list.find( x => isNumeric ? x[colName].toString() === lcase : x[colName].toLocaleLowerCase() === lcase );
        }
    }

    private apiCall(route: string) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(route)
            .send()
            .map(response => response.body);
    }

}
