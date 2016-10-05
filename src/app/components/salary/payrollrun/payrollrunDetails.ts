import {Component, OnInit, ViewChild, provide} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PayrollRun} from '../../../unientities';
import {PayrollrunService} from '../../../services/services';
import {Observable} from 'rxjs/Observable';
import {SalaryTransactionSelectionList} from '../../salary/salarytrans/salarytransactionSelectionList';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {ControlModal} from './controlModal';
import {PostingsummaryModal} from './postingsummaryModal';
import {VacationpayModal} from './vacationpay/VacationpayModal';
import {RootRouteParamsService} from '../../../services/rootRouteParams';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';
import {UniForm, UniFieldLayout} from '../../../../framework/uniform';
import {ContextMenu} from '../../common/contextMenu/contextMenu';
import {IContextMenuItem} from 'unitable-ng2/main';
import {UniBreadcrumbs} from '../../common/toolbar/breadcrumbs';

declare var _;


@Component({
    selector: 'payrollrun-details',
    templateUrl: 'app/components/salary/payrollrun/payrollrunDetails.html',
    providers: [PayrollrunService, provide(RootRouteParamsService, { useClass: RootRouteParamsService })],
    directives: [SalaryTransactionSelectionList, ControlModal, PostingsummaryModal, UniSave, UniForm, VacationpayModal, ContextMenu, UniBreadcrumbs]
})

export class PayrollrunDetails {
    public config: any = {};
    public fields: any[] = [];
    @ViewChild(UniForm) public uniform: UniForm;
    private payrollrun: PayrollRun;
    private payrollrunID: number;
    private payDate: Date = null;
    private payStatus: string;
    @ViewChild(ControlModal) private controlModal: ControlModal;
    @ViewChild(PostingsummaryModal) private postingSummaryModal: PostingsummaryModal;
    @ViewChild(VacationpayModal) private vacationPayModal: VacationpayModal;
    private isEditable: boolean;
    private busy: boolean = false;
    private saveactions: IUniSaveAction[] = [];
    private formIsReady: boolean = false;
    private contextMenuItems: IContextMenuItem[] = [];

    constructor(private route: ActivatedRoute, private payrollrunService: PayrollrunService, private router: Router, private tabSer: TabService, private _rootRouteParamsService: RootRouteParamsService) {
        this.route.params.subscribe(params => {
            this.payrollrunID = +params['id'];
            this._rootRouteParamsService.params = params;
            this.tabSer.addTab({ name: 'Lønnsavregning ' + this.payrollrunID, url: 'salary/payrollrun/' + this.payrollrunID, moduleID: UniModules.Payrollrun, active: true });
            this.getPayrollRun();
        });
        this.contextMenuItems = [
            {
                label: 'Generer feriepenger',
                action: () => {
                    this.openVacationPayModal();
                }
            },
            {
                label: 'Nullstill lønnsavregning',
                action: () => {

                    if (this.payrollrun.StatusCode < 2 || confirm('Denne lønnsavregningen er bokført, er du sikker på at du vil nullstille?')) {
                        this.busy = true;
                        this.payrollrunService.resetSettling(this.payrollrunID).subscribe((response: boolean) => {
                            if (response) {
                                this.payrollrunService.Get(this.payrollrunID).subscribe((payrollRun: PayrollRun) => {
                                    this.payrollrunService.refreshPayrun(payrollRun);
                                }, error => {
                                    this.busy = false;
                                    this.log(error);
                                });
                            } else {
                                alert('fikk ikke nullstilt lønnsavregning');
                                this.busy = false;
                            }
                        }, error => {
                            this.busy = false;
                            this.log(error);
                        });
                    }

                }
            }
        ];

        this.payrollrunService.refreshPayrollRun$.subscribe((payrollrun: PayrollRun) => {
            this.busy = true;
            this.payrollrun = payrollrun;
            this.payrollrunID = payrollrun.ID;
            this.payDate = new Date(this.payrollrun.PayDate.toString());
            this.payStatus = this.payrollrunService.getStatus(this.payrollrun).text;
            this.refreshSaveActions();
            if (this.formIsReady) {
                this.setEditMode();
            }
            this.busy = false;
        });
    }

    private getPayrollRun() {
        this.busy = true;
        if (this.payrollrunID) {
            Observable.forkJoin(
                this.payrollrunService.Get<PayrollRun>(this.payrollrunID),
                this.payrollrunService.layout('payrollrunDetailsForm')
            ).subscribe((response: any) => {
                var [payrollrun, layout] = response;
                this.payrollrunService.refreshPayrun(payrollrun);
                this.payrollrun = payrollrun;
                this.payDate = new Date(this.payrollrun.PayDate.toString());
                this.fields = layout.Fields;
                this.config = {
                    submitText: ''
                };
                this.busy = false;
            },
                (err) => {
                    this.busy = false;
                    this.log(err);
                    console.log(err);
                });
        }
    }

    private refreshSaveActions() {
        this.saveactions = [
            {
                label: 'Lagre lønnsavregning',
                action: this.savePayrollrun.bind(this),
                main: true,
                disabled: this.payrollrun.StatusCode > 0
            },
            {
                label: 'Kontroller',
                action: this.openControlModal.bind(this),
                main: false,
                disabled: this.payrollrun.StatusCode > 0
            },
            {
                label: 'Avregn',
                action: this.runSettling.bind(this),
                main: false,
                disabled: this.payrollrun.StatusCode > 0
            },
            {
                label: 'Utbetalingsliste',
                action: this.showPaymentList.bind(this),
                main: false,
                disabled: this.payrollrun.StatusCode < 1
            },
            {
                label: 'Bokfør',
                action: this.openPostingSummaryModal.bind(this),
                main: false,
                disabled: this.payrollrun.StatusCode !== 1
            }
        ];
    }

    public openPostingSummaryModal(done) {
        this.postingSummaryModal.openModal();
        done('');
    }

    public openControlModal(done) {
        this.controlModal.openModal();
        done('');
    }

    public openVacationPayModal() {
        this.vacationPayModal.openModal();
    }

    public canPost(): boolean {
        if (this.payrollrun) {
            if (this.payrollrun.StatusCode === 1) {
                return true;
            }
        }
        return false;
    }

    public previousPayrollrun() {
        this.payrollrunService.getPrevious(this.payrollrunID)
            .subscribe((response) => {
                if (response) {
                    this.payrollrunService.refreshPayrun(response);
                    this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrunID);
                }
            },
            (err) => {
                this.log(err);
            });
    }

    public nextPayrollrun() {
        this.payrollrunService.getNext(this.payrollrunID)
            .subscribe((response) => {
                if (response) {
                    this.payrollrunService.refreshPayrun(response);
                    this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrunID);
                }
            },
            (err) => {
                this.log(err);
            });
    }

    public runSettling() {
        this.busy = true;
        this.saveactions[0].disabled = true;
        this.saveactions = _.cloneDeep(this.saveactions);
        this.payrollrunService.runSettling(this.payrollrunID)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.payrollrunService.Get<PayrollRun>(this.payrollrunID)
                        .subscribe((response) => {
                            this.payrollrunService.refreshPayrun(response);
                            this.setEditMode();
                            this.showPaymentList();
                        },
                        (err) => {
                            this.log(err);
                            this.busy = false;
                            this.saveactions[0].disabled = false;
                            this.saveactions = _.cloneDeep(this.saveactions);
                        });
                }
            },
            (err) => {
                this.log(err);
                this.busy = false;
                this.saveactions[0].disabled = false;
                this.saveactions = _.cloneDeep(this.saveactions);
            });
    }

    public showPaymentList() {
        this.router.navigateByUrl('/salary/paymentlist/' + this.payrollrun.ID);
    }

    public resetSettling() {
        this.payrollrunService.resetSettling(this.payrollrunID)
            .subscribe((bResponse: boolean) => {
                if (bResponse === true) {
                    this.payrollrunService.Get<PayrollRun>(this.payrollrunID)
                        .subscribe((response) => {
                            this.payrollrunService.refreshPayrun(response);
                        },
                        (err) => {
                            this.log(err);
                        });
                }
            },
            (err) => {
                this.log(err);
            });
    }

    private findByProperty(fields, name) {
        var field = fields.find((fld) => fld.Property === name);
        return field;
    }

    private setEditMode() {
        if (this.payrollrun.StatusCode > 0) {
            this.isEditable = false;
            this.uniform.readMode();
        } else {
            this.isEditable = true;
            this.uniform.editMode();
            var idField: UniFieldLayout = this.findByProperty(this.fields, 'ID');
            idField.ReadOnly = true;
        }
        var recurringTransCheck: UniFieldLayout = this.findByProperty(this.fields, 'ExcludeRecurringPosts');
        var noNegativePayCheck: UniFieldLayout = this.findByProperty(this.fields, '1');
        if (this.isEditable) {
            recurringTransCheck.ReadOnly = false;
            noNegativePayCheck.ReadOnly = false;
        } else {
            recurringTransCheck.ReadOnly = true;
            noNegativePayCheck.ReadOnly = true;
        }
        this.fields = _.cloneDeep(this.fields);

        if (!this.payrollrun.Description) {
            setTimeout(() => {
                if (!this.uniform.section(1).isOpen) {
                    this.uniform.section(1).toggle();
                }
            }, 100);
        }

    }

    public salarytransReady(value) {
        if (this.payrollrun) {
            this.payrollrunService.refreshPayrun(_.cloneDeep(this.payrollrun));
        }
    }

    public ready(value) {
        this.setEditMode();
        this.formIsReady = true;
    }

    public change(value) {

    }

    public savePayrollrun(done) {
        this.busy = true;

        if (this.payrollrun.ID > 0) {
            this.payrollrunService.Put(this.payrollrun.ID, this.payrollrun)
                .subscribe((response: PayrollRun) => {
                    this.payrollrunService.refreshPayrun(response);
                    done('Sist lagret: ');
                    this.busy = false;
                },
                (err) => {
                    this.log(err);
                    console.log('Feil ved oppdatering av lønnsavregning', err);
                    this.refreshSaveActions();
                    this.busy = false;
                });
        } else {
            this.payrollrunService.Post(this.payrollrun)
                .subscribe((response: PayrollRun) => {
                    this.payrollrunService.refreshPayrun(response);
                    done('Sist lagret: ');
                    this.router.navigateByUrl('/salary/payrollrun/' + this.payrollrun.ID);
                    this.busy = false;
                },
                (err) => {
                    this.log(err);
                    console.log('Feil ved lagring', err);
                    this.refreshSaveActions();
                    this.busy = false;
                });
        }
    }

    public createNewRun() {
        this.busy = true;
        var createdPayrollrun = new PayrollRun();
        var dates: Date[] = this.payrollrunService.getEmptyPayrollrunDates();

        createdPayrollrun.FromDate = dates[0];
        createdPayrollrun.ToDate = dates[1];
        createdPayrollrun.PayDate = dates[2];

        createdPayrollrun.FromDate.setHours(12);
        createdPayrollrun.ToDate.setHours(12);
        createdPayrollrun.PayDate.setHours(12);

        this.payrollrunService.Post(createdPayrollrun)
            .subscribe((response) => {
                this.router.navigateByUrl('/salary/payrollrun/' + response.ID);
            },
            (err) => {
                this.log(err);
                console.log('Error creating payrollrun: ', err);
            });
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }
}
