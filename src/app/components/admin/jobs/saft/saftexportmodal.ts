import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';

import { BehaviorSubject, timer as observableTimer } from 'rxjs';
import { JobService, AccountService, ErrorService } from '@app/services/services';
import { MatStepper } from '@angular/material';

const JOBNAME: string = 'ExportSaft';

@Component({
    selector: 'saft-export-modal',
    templateUrl: './saftexportmodal.html'
})
export class SaftExportModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(MatStepper, { static: true }) stepper: MatStepper;
    public currentStep = 1;
    public totalSteps = 3;

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public emailField$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    private jobID: number;
    private noJobID = -1;
    public busy = false;
    public errorMessage = '';
    private subscription: any;
    public isReady = false;
    public fixAccounts = [];

    constructor(private jobService: JobService,
        private accountService: AccountService,
        private errorService: ErrorService) {}

    public ngOnInit() {
        const value = this.options.data || {};
        this.formModel$.next(value);
        this.formFields$.next(this.getSaftExportFormFields());
        this.emailField$.next(this.getEmailField());

        const timer = observableTimer(5000, 5000);
        this.subscription = timer.subscribe( t => {
            if (this.jobID > 0) {
                this.fetchFileJobStatus();
            }
        });
    }

    public close(emitValue?: boolean) {
        let params = null;
        if (emitValue) {
            params = this.formModel$.getValue();
            params['Validate'] = false;
        }
        this.onClose.emit(params);
    }

    public validate() {
        this.busy = true;
        const params = this.formModel$.getValue();
        this.jobService.startJob(JOBNAME, undefined, params)
        .subscribe((jobID: number) => {
            this.jobID = jobID;
        });
    }

    public fix() {
        this.accountService.setSaftMappings(this.fixAccounts).subscribe(() => {
            this.isReady = true;
            this.goNext();
        },
        err => {
            this.errorService.handle(err);
        });
    }

    public goNext() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.stepper.selected.completed = true;
            this.stepper.next();
        }
    }

    private getSaftExportFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: 'JobDetails',
                Property: 'FromYear',
                FieldType: FieldType.NUMERIC,
                Label: 'Fra regnskapsår'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'ToYear',
                FieldType: FieldType.NUMERIC,
                Label: 'Til regnskapsår'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'FromPeriod',
                FieldType: FieldType.NUMERIC,
                Label: 'Fra Periode'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'ToPeriod',
                FieldType: FieldType.NUMERIC,
                Label: 'Til Periode'
            },
            <any> {
                EntityType: 'JobDetails',
                Property: 'Anonymous',
                FieldType: FieldType.CHECKBOX,
                Label: 'Anonymiser data'
            }
        ];
    }

    private getEmailField(): UniFieldLayout[] {
        return [<any> {
            EntityType: 'JobDetails',
            Property: 'SendEmail',
            FieldType: FieldType.CHECKBOX,
            Label: 'Send meg epost med filen'
        }];
    }

    private fetchFileJobStatus() {
        this.jobService.getJobRunWithOutput(JOBNAME, this.jobID)
            .subscribe( (result: any) => {
                if (result) {
                    const output = JSON.parse(result.Output);
                    if (result.Exception || (output && output.HasError)) {
                        this.jobID = this.noJobID;
                        if (output) {
                            this.errorMessage = output.Message;
                        } else {
                            this.errorMessage = result.Exception;
                        }
                    } else {
                        this.jobID = this.noJobID;
                        if (output) {
                            const validationResult = output.ValidationResult;
                            if (!validationResult) {
                                this.isReady = true;
                                this.goNext();
                                this.goNext();
                            } else if (validationResult.startsWith('Kontoene ') &&
                                validationResult.endsWith(' mangler saf-t kobling')) {
                                    const accounts = validationResult.substring('Kontoene '.length, validationResult.indexOf(' mangler saf-t kobling'));
                                    this.fixAccounts = accounts.split(', ').map(Number);
                                    this.goNext();
                            } else {
                                this.errorMessage = validationResult;
                            }
                        }
                    }
                    this.busy = false;
                }
            });
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
