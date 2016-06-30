import {Component, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {WageTypeService, EmploymentService, SalaryTransactionService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Employment, SalaryTransaction, WageType} from '../../../../unientities';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../../framework/core/http/http';

declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html',
    directives: [UniTable, UniSave],
    providers: [WageTypeService, EmploymentService, SalaryTransactionService],
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
            disabled: true
        }
    ];
    
    constructor(public rootRouteParams: RootRouteParamsService, public routr: Router, private wagetypeService: WageTypeService, private employmentService: EmploymentService, private uniHttp: UniHttp, private salarytransService: SalaryTransactionService) {
        this.employeeID = +this.rootRouteParams.params.get('id');
        this.buildTableConfig();
    }
    
    public ngOnInit() {
        this.buildTableConfig();
        
        Observable.forkJoin(
            this.wagetypeService.GetAll(''),
            this.employmentService.GetAll('filter=EmployeeID eq ' + this.employeeID)
        )
        .subscribe((response: any) => {
            let [wagetypes, employments] = response;
            this.wagetypes = wagetypes;
            this.employments = employments;
            
            this.recurringItems$ = this.uniHttp.asGET()
            .usingBusinessDomain()
            .withEndPoint('salarytrans')
            .send({
                filter: `EmployeeNumber eq ${this.employeeID} and IsRecurringPost eq true`
            });
        }, (error: any) => {
                console.error(error);
                this.log(error);
            });
    }
    
    public saveRecurringpost(done) {
        done('Lagrer faste poster');
        this.recurringPosts.forEach(recurringpost => {
            recurringpost.IsRecurringPost = true;
            recurringpost.EmployeeID = this.employeeID;
            recurringpost.EmployeeNumber = this.employeeID;
            
            if (recurringpost.ID > 0) {
                this.salarytransService.Put(recurringpost.ID, recurringpost)
                .subscribe((response: SalaryTransaction) => {
                    done('Sist lagret: ');
                },
                (err) => {
                    done('Feil ved oppdatering av fast post', err);
                    this.log(err);
                });
            } else {
                this.salarytransService.Post(recurringpost)
                .subscribe((response: SalaryTransaction) => {
                    done('Sist lagret: ');
                },
                (err) => {
                    done('Feil ved lagring av fast post', err);
                    this.log(err);
                });
            }
        });
        done('Faste poster lagret: ');
    }
    
    private buildTableConfig() {
        var wagetypeCol = new UniTableColumn('WageType', 'Lønnsart', UniTableColumnType.Lookup)
            .setTemplate((dataItem) => {
                return dataItem.WageTypeNumber;
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.WageTypeId + ' - ' + selectedItem.WageTypeName);
                },
                lookupFunction: (searchValue) => {
                    let matching: WageType[] = [];

                    this.wagetypes.forEach(wagetype => {
                        if (isNaN(searchValue)) {
                            if (wagetype.WageTypeName.toLowerCase().indexOf(searchValue) > -1) {
                                matching.push(wagetype);
                            }
                        } else {
                            if (wagetype.WageTypeId.toString().indexOf(searchValue) > -1) {
                                matching.push(wagetype);
                            }
                        }
                    });
                    return matching;
                }
            });
            
        var descriptionCol = new UniTableColumn('Text', 'Beskrivelse', UniTableColumnType.Text);
        
        var employmentIDCol = new UniTableColumn('Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
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
            
            if (event.field === 'WageType') {
                this.mapWagetypeToRecurrinpost(row);
            }
            
            if (event.field === 'Employment') {
                this.mapEmploymentToRecurringpost(row);
            }
            
            if (event.field === 'Amount' || event.field === 'Rate') {
                this.calcItem(row);
            }
            
            return row;
        });
    }
    
    private mapWagetypeToRecurrinpost(rowModel) {
        let wagetype = rowModel['WageType'];
        if (!wagetype) {
            return;
        }
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeId;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;
        this.calcItem(rowModel);
    }
    
    private mapEmploymentToRecurringpost(rowModel) {
        let employment = rowModel['Employment'];
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
    
    private rowChanged(event) {
        this.recurringPosts = this.table.getTableData();
        this.saveactions[0].disabled = false;
    }
    public log(err) {
        alert(err._body);
    }
}
