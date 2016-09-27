import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {WageTypeService, EmploymentService, SalaryTransactionService, UniCacheService} from '../../../../services/services';
import {Observable} from 'rxjs/Observable';
import {UniSave, IUniSaveAction} from '../../../../../framework/save/save';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {Employment, SalaryTransaction, WageType} from '../../../../unientities';
import {AsyncPipe} from '@angular/common';
import {UniHttp} from '../../../../../framework/core/http/http';
import {UniView} from '../../../../../framework/core/uniView';
declare var _;

@Component({
    selector: 'reccuringpost-list',
    templateUrl: 'app/components/salary/employee/recurringPost/recurringPost.html',
    directives: [UniTable, UniSave],
    providers: [WageTypeService, SalaryTransactionService],
    pipes: [AsyncPipe]
})

export class RecurringPost extends UniView implements OnInit {
    private tableConfig: UniTableConfig;
    private recurringPosts: SalaryTransaction[] = [];
    private employeeID: number;
    private employments: Employment[] = [];
    private wagetypes: WageType[];
    private saveactions: IUniSaveAction[] = [
        {
            label: 'Lagre faste poster',
            action: this.saveRecurringpost.bind(this),
            main: true,
            disabled: false
        }
    ];

    constructor(public route: ActivatedRoute,
                public router: Router,
                private wagetypeService: WageTypeService,
                private employmentService: EmploymentService,
                private uniHttp: UniHttp,
                private salarytransService: SalaryTransactionService,
                cacheService: UniCacheService) {

        super(router.url, cacheService);
    }

    public ngOnInit() {
        this.route.parent.params.subscribe( params => {
            this.employeeID = +params['id'];
            this.buildTableConfig();

            let employmentSubject = super.getStateSubject('employments');
            let recurringPostSubject = super.getStateSubject('recurringPosts');

            // If we're the first one to subscribe to any of the subjects
            // we need to get data from backend and update the subjects ourselves
            if (!employmentSubject.observers.length) {
                this.employmentService.GetAll(`filter=EmployeeID eq ${this.employeeID}`)
                    .subscribe((employments: Employment[]) => {
                        this.employments = employments;
                        super.updateState('employments', employments, false);
                    });
            }

            if (!recurringPostSubject.observers.length) {
                this.uniHttp.asGET()
                    .usingBusinessDomain()
                    .withEndPoint('salarytrans')
                    .send({filter: `EmployeeID eq ${this.employeeID} and IsRecurringPost eq true and PayrollRunID eq 0`})
                    .subscribe(response => super.updateState('recurringPosts', response.json(), false));
            }

            employmentSubject.subscribe(employments => this.employments = employments);
            recurringPostSubject.subscribe(recurringPosts => this.recurringPosts = recurringPosts);
        });

        this.wagetypeService.GetAll('').subscribe((wagetypes: WageType[]) => {
            this.wagetypes = wagetypes;
        });

    }

    private buildTableConfig() {
        const wagetypeCol = new UniTableColumn('_Wagetype', 'Lønnsart', UniTableColumnType.Lookup)
            .setDisplayField('WageTypeNumber')
            .setEditorOptions({
                itemTemplate: (selectedItem: WageType) => {
                    return (selectedItem.WageTypeNumber + ' - ' + selectedItem.WageTypeName);
                },
                lookupFunction: (searchValue) => {
                    return this.wagetypes.filter((wagetype) => {
                        if (isNaN(searchValue)) {
                            return (wagetype.WageTypeName.toLowerCase().indexOf(searchValue) > -1);
                        } else {
                            return wagetype.WageTypeNumber.toString().startsWith(searchValue.toString());
                        }
                    });
                }
            });

        const descriptionCol = new UniTableColumn('Text', 'Beskrivelse');

        const employmentIDCol = new UniTableColumn('_Employment', 'Arbeidsforhold', UniTableColumnType.Lookup)
            .setTemplate((rowModel) => {
                let employment = rowModel['_Employment'];

                if (!employment) {
                    employment = this.employments.find(emp => emp.ID === rowModel.EmploymentID);
                }

                return (employment) ? employment.JobName : '';
            })
            .setEditorOptions({
                itemTemplate: (selectedItem) => {
                    return (selectedItem.ID + ' - ' + selectedItem.JobName);
                },
                lookupFunction: (searchValue) => {
                    return this.employments.filter(employment => employment.JobName.toLowerCase().indexOf(searchValue) > -1);
                }
            });

        const fromdateCol = new UniTableColumn('recurringPostValidFrom', 'Fra dato', UniTableColumnType.Date);
        const todateCol = new UniTableColumn('recurringPostValidTo', 'Til dato', UniTableColumnType.Date);
        const amountCol = new UniTableColumn('Amount', 'Antall', UniTableColumnType.Number);
        const rateCol = new UniTableColumn('Rate', 'Sats', UniTableColumnType.Number);
        const sumCol = new UniTableColumn('Sum', 'Sum', UniTableColumnType.Number);

        this.tableConfig = new UniTableConfig()
            .setDeleteButton({
                deleteHandler: (rowModel: SalaryTransaction) => {
                    if (isNaN(rowModel.ID)) { return true; }
                    return this.salarytransService.delete(rowModel.ID);
                }
            })
            .setColumns([
                wagetypeCol, descriptionCol, employmentIDCol, fromdateCol, todateCol,
                amountCol, rateCol, sumCol
            ])
            .setChangeCallback((event) => {
                let row = event.rowModel;
                row['_isDirty'] = true;

                if (event.field === '_Wagetype' && row['_Wagetype']) {
                    this.mapWagetypeToRecurrinpost(row);
                }

                if (event.field === '_Employment') {
                    const employment = row['_Employment'];
                    row['EmploymentID'] = (employment) ? employment.ID : null;
                }

                if (event.field === 'Amount' || event.field === 'Rate') {
                    this.calcItem(row);
                }

                // Update local array and cache
                this.recurringPosts[row['_originalIndex']] = row;
                super.updateState('recurringPosts', this.recurringPosts, true);

                return row;
            });
    }

    private mapWagetypeToRecurrinpost(rowModel) {
        let wagetype = rowModel['_Wagetype'];
        rowModel['Text'] = wagetype.WageTypeName;
        rowModel['Account'] = wagetype.AccountNumber;
        rowModel['WageTypeNumber'] = wagetype.WageTypeNumber;
        rowModel['Amount'] = 1;
        rowModel['Rate'] = wagetype.Rate;
        this.calcItem(rowModel);
    }

    private calcItem(rowModel) {
        let sum = rowModel['Amount'] * rowModel['Rate'];
        rowModel['Sum'] = sum; // .toFixed(2);
    }

    public saveRecurringpost(done) {
        let saving: Observable<any>[] = [];

        this.recurringPosts.forEach(recurringpost => {
            if (recurringpost['_isDirty']) {
                recurringpost.IsRecurringPost = true;
                recurringpost.EmployeeID = this.employeeID;
                recurringpost.EmployeeNumber = this.employeeID;
                if (recurringpost.ID > 0) {
                    saving.push(this.salarytransService.Put(recurringpost.ID, recurringpost));
                } else {
                    saving.push(this.salarytransService.Post(recurringpost));
                }
            }
        });

        Observable.forkJoin(saving).subscribe(
            res => {
                done('Lagring fullført');
                super.updateState('recurringPosts', this.recurringPosts, false);
            },
            err => {
                done('Feil ved lagring av faste poster');
                this.log(err);
            }
        );
    }

    private log(err) {
        alert(err._body);
    }
}
