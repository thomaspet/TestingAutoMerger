import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { IUniModal, IModalOptions } from "@uni-framework/uni-modal";
import { JobService } from "@app/services/services";
import { Router } from "@angular/router";

@Component({
    selector: 'import-details',
    templateUrl: './import-details-modal.html',
    styleUrls: ['./import-details-modal.sass']
})

export class ImportDetailsModal implements OnInit, IUniModal {
    @Input() options: IModalOptions = {};

    @Output() onClose: EventEmitter<any> = new EventEmitter();

    constructor(private jobService: JobService, private router: Router) { }

    fileName: string = 'Customer_All.xlsx';
    jobRun: any;
    log: any = [];
    progress: any = [];
    status: boolean = true;
    header: string;
    isFetching: boolean = true;

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
                this.setJobStatus();
                this.isFetching = false;
            }
        );
    }

    private setJobStatus() {
        this.status = this.log.length ? false : true;
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