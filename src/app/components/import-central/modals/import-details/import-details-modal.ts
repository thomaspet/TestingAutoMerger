import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { JobService } from '@app/services/services';
import { Router } from '@angular/router';
import { ImportJobName } from '@app/models/import-central/ImportDialogModel';

@Component({
    selector: 'import-details',
    templateUrl: './import-details-modal.html',
    styleUrls: ['./import-details-modal.sass']
})
export class ImportDetailsModal implements OnInit, IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    jobRun: any;
    log: any = [];
    progress: any = [];
    status: boolean = true;
    header: string;
    isFetching: boolean = true;

    constructor(private jobService: JobService, private router: Router) { }

    ngOnInit() {
        this.initDetailModal(this.options.data.jobName, this.options.data.hangfireJobId);
        this.setJobHeader();
    }

    private initDetailModal(jobName: string, hangfireJobId: string) {
        this.jobService.getJobRun(jobName, +hangfireJobId).subscribe(
            jobRun => {
                this.jobRun = jobRun;
                this.log = jobRun ? jobRun.JobRunLogs : [];
                this.progress = jobRun ? jobRun.Progress : [];
                this.progress.reverse();
                this.setJobStatus();
                this.isFetching = false;
            }
        );
    }

    private setJobStatus() {
        if (this.options.data.jobName === ImportJobName.Saft) {
            if (this.log.length) {
                if (this.log[0].Msg === 'Import completed') {
                    this.status = true;
                } else {
                    this.status = false;
                }
            } else {
                this.status = false;
            }
        } else {
            this.status = this.log.length ? false : true;
        }
        // if (this.log && this.log.length && this.log[0].Msg)
        //     this.status = (this.log[0].Msg.includes("error") || this.log[0].Msg.includes("errors")) ? false : true;
    }

    private setJobHeader() {
        this.header = `${this.options.header} - ${this.options.data.jobName} (${this.options.data.hangfireJobId})`;
    }

    public close() {
        this.onClose.emit();
    }

    onNavigateTo() {
        this.router.navigate([`${this.options.data.url}`]);
        this.onClose.emit();
    }
}
