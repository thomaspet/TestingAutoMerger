import { parseDate, safeDec } from '@app/components/common/utils/utils';
import { AccountService } from '@app/services/services';
import { Account, VatType } from '@uni-entities';
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
        return header + '\r' + rows.join('\r');
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
                break;

            case UniTableColumnType.LocalDate:
                return moment(value).format('DD.MM.YYYY');

            case UniTableColumnType.Money:
                return value ? value.toFixed(2).replace('.', ',') : '0';
        }
        return value;
    }

    private static fromString(value: any, col: UniTableColumn, accounts?: Array<Account>, vatCodes?: Array<VatType>) {
        switch (col.type) {
            case UniTableColumnType.Lookup:
                if (col.field === 'DebitAccount' || col.field === 'CreditAccount') {
                    value = accounts.find( x => x.AccountNumber === parseInt(value, 10));
                }
                if (col.field === 'DebitVatType' || col.field === 'CreditVatType') {
                    value = vatCodes?.find( x => x.VatCode === value);
                }
                if (col.field === 'SameOrNewDetails') { value = value?.Name; }
                break;
            case UniTableColumnType.Money:
                return value ? safeDec(value) : 0;
            case UniTableColumnType.LocalDate:
                return value ? parseDate(value) : undefined;
        }
        return value;
    }

    public setCsvData(table: UniTable, value: string, divider = '\t'): Promise<any> {

        const rows = value.split('\r');
        if (!(rows && rows.length >= 2)) { return Promise.resolve([]); }

        // Detect which columns are used
        const columns = table.config.columns.slice();
        const title = rows[0].split(divider);
        const targets: Array<{ index: number, column: UniTableColumn }> = [];
        for (let cellIndex = 0; cellIndex < title.length; cellIndex++) {
            const match = columns.filter( x => x.header.toLocaleLowerCase() === title[cellIndex].toLocaleLowerCase() );
            if (match && match.length > 0) {
                targets.push({ index: cellIndex, column: match[0] });
                columns.splice(columns.indexOf(match[0]), 1);
            }
        }

        // Detect which accounts are used (so that we can fetch them all)
        const accountNumbers = []; const journalEntryData = []; let financialDateMapped = false;
        const lookup = [{ route: 'projects', pk: 'ProjectNumber', keys: [] }, { route: 'departments', pk: 'DepartmentNumber', keys: [] }];
        for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex]?.split(divider);
            const dataRow = <any>{ AmountCurrency: 0, Description: '', Amount: 0 };
            targets.forEach( map => {
                let cellValue = row && row.length > map.index ? row[map.index] : undefined;
                switch (map.column.field) {
                    case 'DebitAccount':
                    case 'CreditAccount':
                        if ((!cellValue) || (!(parseInt(cellValue, 10) > 0)) ) { return; }
                        if (accountNumbers.indexOf(cellValue) < 0) { accountNumbers.push(cellValue); }
                        dataRow[map.column.field] = cellValue; // temporarily insert accountnumber (update later..)
                        break;
                    case 'Dimensions.Project':
                        if (!cellValue) { return; }
                        cellValue = cellValue.replace(/[^A-Za-z0-9-+._]/g, '');
                        const proj = lookup[0];
                        if (proj.keys.indexOf(cellValue) < 0) { proj.keys.push(cellValue); }
                        dataRow[map.column.field] = cellValue;
                        break;
                    case 'Dimensions.Department':
                        if (!cellValue) { return; }
                        cellValue = cellValue.replace(/[^A-Za-z0-9-+._]/g, '');
                        const dep = lookup[1];
                        if (dep.keys.indexOf(cellValue) < 0) { dep.keys.push(cellValue); }
                        dataRow[map.column.field] = cellValue;
                        break;
                    case 'SameOrNewDetails':
                        dataRow.JournalEntryNo = cellValue;
                        break;
                    default:
                        const converted = CsvConverter.fromString(cellValue, map.column, undefined, this.vattypes);
                        if (converted) {
                            if (map.column.field === 'FinancialDate') { financialDateMapped = true; }
                            dataRow[map.column.field] = converted;
                        }
                        break;
                }
            });
            if (dataRow.AmountCurrency) {
                dataRow.Amount = dataRow.AmountCurrency;
                if (!financialDateMapped) { dataRow.FinancialDate = dataRow.VatDate; }
                journalEntryData.push(dataRow);
            }
        }

        // Fetch all accounts from server
        const apiCalls = []; const chunkSize = 100;
        while (accountNumbers.length > 0) {
            const chunk = accountNumbers.splice(0, accountNumbers.length > chunkSize ? chunkSize : accountNumbers.length);
            const query = `filter=${chunk.map( a => 'AccountNumber eq ' + a).join(' or ')}`;
            apiCalls.push(this.accountService.GetAll(query));
        }

        // More lookups?
        lookup.forEach( x => {
            if (!x.keys.length) { return; }
            const query = `${x.route}?filter=${x.keys.map( a => `${x.pk} eq '${a}'`).join(' or ')}`;
            apiCalls.push(this.apiCall(query));
        });

        // Setup final handler that can be called (if needed) after we get the accounts, departments etc.
        const finalHandler = (lookups, resolve) => {
            const debitMap = targets.find( t => t.column.field === 'DebitAccount');
            const creditMap = targets.find( t => t.column.field === 'CreditAccount');
            const projectMap = targets.find( t => t.column.field === 'Dimensions.Project');
            const departmentMap = targets.find( t => t.column.field === 'Dimensions.Department');
            journalEntryData.forEach( x => {
                if (x.DebitAccount && debitMap) {
                    x.DebitAccount = CsvConverter.fromString(x.DebitAccount, debitMap.column, lookups.accounts );
                    if (x.DebitAccount) { x.DebitAccountID = x.DebitAccount.ID; }
                }
                if (x.CreditAccount && creditMap) {
                    x.CreditAccount = CsvConverter.fromString(x.CreditAccount, creditMap.column, lookups.accounts );
                    if (x.CreditAccount) { x.CreditAccountID = x.CreditAccount.ID; }
                }
                if (x['Dimensions.Project'] && projectMap) {
                    x.Dimensions = x.Dimensions || {};
                    x.Dimensions.Project = this.mapLookup(x['Dimensions.Project'], 'ProjectNumber', lookups.projects);
                    x.Dimensions.ProjectID = x.Dimensions.Project?.ID;
                }
                if (x['Dimensions.Department'] && departmentMap) {
                    x.Dimensions = x.Dimensions || {};
                    x.Dimensions.Department = this.mapLookup(x['Dimensions.Department'], 'DepartmentNumber', lookups.departments);
                    x.Dimensions.DepartmentID = x.Dimensions.Department?.ID;
                }
            });
            resolve(journalEntryData);
        };

        return new Promise( (resolve, reject) =>
            apiCalls.length
            ? Observable.forkJoin(apiCalls)
                .subscribe( results => {
                    const lookups = { accounts: [],  projects: [], departments: [] };
                    results.forEach( (x: any) => {
                        if (x.length <= 0) { return; }
                        if (x[0].AccountNumber) {
                            lookups.accounts = lookups.accounts.concat(x);
                        } else if (x[0].ProjectNumber) {
                            lookups.projects = x;
                        } else if (x[0].DepartmentNumber) {
                            lookups.departments = x;
                        }
                    });
                    finalHandler(lookups, resolve);
            }, err => reject(err))
            : finalHandler([], resolve)
        );

    }

    private mapLookup(value: string, colName: string, list: Array<any>) {
        if ((!value) || (!(list)) || list.length === 0) { return; }
        if (!value.trim()) { return; }
        const lcase = value.trim().toLocaleLowerCase();
        return list.find( x => x[colName].toLocaleLowerCase() === lcase );
    }

    private apiCall(route: string) {
        return this.http.asGET()
            .usingBusinessDomain()
            .withEndPoint(route)
            .send()
            .map(response => response.body);
    }

}
