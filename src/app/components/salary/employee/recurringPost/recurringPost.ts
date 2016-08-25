import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {WageTypeService, EmployeeService, SalaryTransactionService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Employment, SalaryTransaction, WageType} from '../../../../unientities';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../../framework/core/http/http';
import moment from 'moment';

declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html',
    directives: [UniTable, UniSave],
    providers: [WageTypeService, SalaryTransactionService],
    pipes: [AsyncPipe]
})

export class RecurringPost implements OnInit {
    private recurringpostListConfig: UniTableConfig;
    private employeeID: number;
    private wagetypes: WageType[];
    private employments: Employment[];
    private recurringItems$: Observable<any>;
    private recurringPosts: SalaryTransaction[];
    @ViewChild(UniTable) private table: UniTable;

    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre faste poster',
            action: this.saveRecurringpost.bind(this),
            main: true,
            disabled: false
        }
    ];

    constructor(public rootRouteParams: RootRouteParamsService, public routr: Router, private wagetypeService: WageTypeService, private employeeService: EmployeeService, private uniHttp: UniHttp, private salarytransService: SalaryTransactionService) {
        this.employeeID = +this.rootRouteParams.params['id'];
        this.buildTableConfig();
    }

    public ngOnInit() {
        this.buildTableConfig();

        Observable.forkJoin(
            this.wagetypeService.GetAll(''),
            this.employeeService.Get(this.employeeID, ['Employments', 'BusinessRelationInfo'])
        )
            .subscribe((response: any) => {
                let [wagetypes, employee] = response;
                this.wagetypes = wagetypes;
                this.employments = employee.Employments;
                this.employeeService.refreshEmployee(employee);

                this.recurringItems$ = this.uniHttp.asGET()
                    .usingBusinessDomain()
                    .withEndPoint('salarytrans')
                    .send({
                        filter: `EmployeeNumber eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`
                    })
                    .map(response => response.json());
            }, (error: any) => {
                console.error(error);
                this.log(error);
            });
    }

    private refreshData() {
        this.recurringItems$ = _.cloneDeep(this.recurringItems$);
    }


    public saveRecurringpost(done) {
        this.saveactions[0].disabled = true;
        this.recurringPosts = this.table.getTableData();
        done('Lagrer faste poster');
        let saving: Observable<any>[] = [];
        this.recurringPosts.forEach(recurringpost => {
            this.saveactions[0].disabled = true;
            recurringpost.IsRecurringPost = true;
            recurringpost.EmployeeID = this.employeeID;
            recurringpost.EmployeeNumber = this.employeeID;

            if (recurringpost.ID > 0) {
                saving.push(this.salarytransService.Put(recurringpost.ID, recurringpost));
            } else {
                saving.push(this.salarytransService.Post(recurringpost));
            }
        });
        Observable.forkJoin(saving).subscribe((response: SalaryTransaction[]) => {
            done('Sist lagret: ');
            this.saveactions[0].disabled = false;
            this.refreshData();
        },
            (err) => {
                done('Feil ved oppdatering av fast post', err);
                this.log(err);
                this.saveactions[0].disabled = false;
            });
    }

    private buildTableConfig() {
        var wagetypeCol = new UniTableColumn('_Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return dataItem.WageTypeNumber;
            })
            .setEditorOptions({
                itemTemplate: (selectedItem: WageType) => {
                    return (selectedItem.WageTypeNumber + ' - ' + selectedItem.WageTypeName);
                },
                lookupFunction: (searchValue) => {
                    let matching: WageType[] = [];

                    this.wagetypes.forEach(wagetype => {
                        if (isNaN(searchValue)) {
                            if (wagetype.WageTypeName.toLowerCase().indexOf(searchValue) > -1) {
                                matching.push(wagetype);
                            }
                        } else {
                            if (wagetype.WageTypeNumber.toString().indexOf(searchValue) > -1) {
                                matching.push(wagetype);
                            }
                        }
                    });
                    return matching;
                }
            });

        var descriptionCol = new UniTableColumn('Text', 'Beskrivelse', UniTableColumnType.Text);

        var employmentIDCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return this.getEmploymentJobName(dataItem.EmploymentID);
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => {
                    let matching: Employment[] = [];
                    this.employments.forEach(employment => {
                        if (employment.JobName.toLowerCase().indexOf(searchValue) > -1) {
                            matching.push(employment);
                        }
                    });
                    return matching;
                }
            });

        var fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', UniTableColumnType.Date);
        var todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', UniTableColumnType.Date);
        var amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        var rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number);
        var sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number);

        this.recurringpostListConfig = new UniTableConfig()
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol,
                amountCol, rateCol, sumCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;

                if (event.field === '_Wagetype') {
                    this.mapWagetypeToRecurrinpost(row);
                }

                if (event.field === '_Employment') {
                    this.mapEmploymentToRecurringpost(row);
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                if (event.field === 'recurringPostValidFrom') {
                    if (row.recurringPostValidFrom) {
                        row.recurringPostValidFrom = new Date(row.recurringPostValidFrom.toString());
                        row.recurringPostValidFrom.setHours(12);
                    }
                }

                if (event.field === 'recurringPostValidTo') {
                    if (row.recurringPostValidTo) {
                        row.recurringPostValidTo = new Date(row.recurringPostValidTo.toString());
                        row.recurringPostValidTo.setHours(12);
                    }
                }
                return row;
            });
    }

    private mapWagetypeToRecurrinpost(rowModel) {
        let wagetype = rowModel['_Wagetype'];
        if (!wagetype) {
            return;
        }
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;
        this.calcItem(rowModel);
    }

    private mapEmploymentToRecurringpost(rowModel) {
        let employment = rowModel['_Employment'];
        if (!employment) {
            return;
        }
        rowModel['EmploymentID'] = employment.ID;
    }

    private calcItem(rowModel) {
        let sum = rowModel['Amount'] * rowModel['Rate'];
        rowModel['Sum'] = sum; // .toFixed(2);
    }

    private getEmploymentJobName(employmentID: number) {
        var jobName = '';

        this.employments.forEach((employment: Employment) => {
            if (employment.ID === employmentID) {
                jobName = employment.JobName;
            }
        });
        return jobName;
    }

    public log(err) {
        alert(err._body);
    }
}
