import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';

import { BehaviorSubject, timer as observableTimer } from 'rxjs';
import { MatStepper } from '@angular/material';
import { JobService, CompanySettingsService, AccountService } from '@app/services/services';
import { UniTableConfig, UniTableColumn, UniTableColumnType } from '@uni-framework/ui/unitable';
import { CompanySettings, Account } from '@uni-entities';
import { UniModalService } from '@uni-framework/uni-modal';
import { UniCompanySaftAccountModal } from './companySaftAccountModal/companySaftAccountModal';
import { AuthService } from '@app/authService';

const JOBNAME: string = 'ImportSaft';

@Component({
    selector: 'saft-import-modal',
    templateUrl: './saftimportmodal.html'
})
export class SaftImportModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(MatStepper) stepper: MatStepper;
    public currentStep = 1;
    public totalSteps = 4;

    private companySettingsID = 1;
    private companySettings: CompanySettings;
    private jobID: number;
    private noJobID = -1;
    private subscription: any;
    private filename = '';
    private fileID: number;

    public fileStatus = '';
    public fileOk = false;
    public fileError = false;
    public correctionLines: [];
    public correctionLinesConfig = null;
    public dataIsRetrieved = false;
    public busy = false;
    public fileIsValidated = false;
    public saftImportAccount: Account;

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    constructor(
        private jobService: JobService,
        private companySettingsService: CompanySettingsService,
        private accountService: AccountService,
        private modalService: UniModalService,
        private authService: AuthService
    ) {}

    public ngOnInit() {
        this.jobID = this.noJobID;
        this.companySettingsService.Get(this.companySettingsID).subscribe((res) => {
            this.companySettings = res;
            this.setSaftAccount();
        });
        const value = this.options.data || {};
        if (this.options.data && this.options.data.file) {
            this.filename = this.options.data.file.FileName;
            this.fileID = value.file.FileID;
        }
        this.formModel$.next(value);
        this.formFields$.next(this.getFormFields());

        this.setTableConfig();

        const timer = observableTimer(5000, 5000);
        this.subscription = timer.subscribe( t => {
            if (this.jobID > 0) {
                this.fetchFileJobStatus();
            }
        });

    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public setSaftAccount() {
        this.saftImportAccount = new Account();
        let saftImportAccountID: number;
        if (this.companySettings.SAFTimportAccountID) {
            saftImportAccountID = this.companySettings.SAFTimportAccountID;
            this.accountService.Get(saftImportAccountID).subscribe((account) => {
                if (account) {
                    this.saftImportAccount = account;
                }
                this.dataIsRetrieved = true;
            });
        } else {
            this.dataIsRetrieved = true;
        }
    }

    private setTableConfig() {
        const transactionColumn = new UniTableColumn('TransactionID', 'Bilagsnr', UniTableColumnType.Text, false);
        const dateColumn = new UniTableColumn('Date', 'Dato', UniTableColumnType.Text, false);
        const diffColumn = new UniTableColumn('DiffAmount', 'Differansesum', UniTableColumnType.Text, false);
        this.correctionLinesConfig = new UniTableConfig('SaftImportModal.JournalCorrectionLines', false, true, 7)
        .setColumns([
            transactionColumn,
            dateColumn,
            diffColumn
        ])
        .setColumnMenuVisible(false)
        ;
    }

    public close(emitValue?: boolean) {
        let value: any;
        if (emitValue) {
            value = this.formModel$.getValue();
        }
        this.onClose.emit(value);
    }

    public goBack() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.stepper.previous();
        }
    }

    public goNext() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.stepper.next();
        }
    }

    public checkFile() {
        if (this.fileID < 1) {
            return;
        }
        const file = {FileID: this.fileID, FileName: this.filename};
        this.onValidateFile(file);
    }

    public onValidateFile(file: any) {

        this.busy = true;
        const data = this.options.data;
        const details = {
            Validate: true,
            FileID: file.FileID,
            FileName: file.FileName,
            CompanyKey: this.authService.getCompanyKey(),
            IncludeStartingBalance: data.IncludeStartingBalance,
            ReuseExistingNumbers: data.ReuseExistingNumbers,
            UpdateExistingData: data.UpdateExistingData,
            Automark: false
        };
        this.jobService.startJob(JOBNAME, undefined, details)
            .subscribe((jobID: number) => {
                this.jobID = jobID;
            });
    }


    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'JobDetails',
                Property: 'IncludeStartingBalance',
                FieldType: FieldType.CHECKBOX,
                Label: 'Opprett åpningsbalanse'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'ReuseExistingNumbers',
                FieldType: FieldType.CHECKBOX,
                Label: 'Behold kunde- og leverandørnummer'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'UpdateExistingData',
                FieldType: FieldType.CHECKBOX,
                Label: 'Oppdater eksisterende kunder/leverandører'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'Automark',
                FieldType: FieldType.CHECKBOX,
                Label: 'Automatisk merking av reskontroposter'
            }
        ];
    }

    public openSaftAccountModal() {
        this.modalService.open(UniCompanySaftAccountModal, {
            data: {
                model: this.companySettings
            }
        }).onClose.subscribe(result => {
            if (result) {
                this.companySettings = result;
                this.setSaftAccount();
            }
        });
    }

    private fetchFileJobStatus() {
        this.jobService.getJobRunWithOutput(JOBNAME, this.jobID)
            .subscribe( (result: any) => {
                if (result) {
                    const progress = (result.Progress && result.Progress.length > 0) ? result.Progress[0].Progress : '';
                    const output = JSON.parse(result.Output);
                    if (result.Exception || (output && output.HasError)) {
                        this.fileError = true;
                        this.jobID = this.noJobID;
                        if (output) {
                            this.fileStatus = output.Message;
                        } else {
                            this.fileStatus = result.Exception;
                        }
                    } else if (progress.startsWith('100%')) {
                        this.jobID = this.noJobID;
                        if (output) {
                            this.fileStatus = output.Message;
                            this.fileError = false;
                            this.correctionLines = output.CorrectionLines;
                            if (!this.correctionLines || this.correctionLines.length === 0) {
                                this.fileOk = true;
                            }
                        } else {
                            this.fileError = true;
                            this.fileStatus = 'Noe gikk galt ved validering av fil';
                        }
                        this.busy = false;
                        this.fileIsValidated = true;
                    }
                    if (this.jobID === this.noJobID) {
                        this.goNext();
                    }
                }
            });
    }
}
