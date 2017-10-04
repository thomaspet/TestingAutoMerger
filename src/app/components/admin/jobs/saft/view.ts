import {Component, OnInit, ViewChild} from '@angular/core';
import {ErrorService, JobService, FileService} from '../../../../services/services';
import {Http} from '@angular/http';
import {AuthService} from '../../../../authService';
import {TimerObservable} from 'rxjs/observable/TimerObservable';
import {AppConfig} from '../../../../AppConfig';
import {
    UniModalService,
    ConfirmActions
} from '../../../../../framework/uniModal/barrel';
import {SaftImportModal} from './saftimportmodal';
import * as moment from 'moment';

const JOBNAME: string = 'ImportSaft';
const COMPLETEMESSAGE: string = 'Import completed';

@Component({
    selector: 'saft-import-view',
    templateUrl: './view.html'
})
export class SaftExportView implements OnInit {
    @ViewChild('fileInput') private fileInput: any;
    private busy: boolean = false;
    private busyFetch: boolean = false;
    private files: Array<ISaftFileInfo> = [];
    private currentFileId: number;
    private activeCompany: any;
    private token: string;
    private subscription: any;
    public jobName: string = JOBNAME;
    private baseUrl: string = AppConfig.BASE_URL_FILES;

    constructor(
        private errorService: ErrorService,
        private jobService: JobService,
        private fileService: FileService,
        private ngHttp: Http,
        private authService: AuthService,
        private modalService: UniModalService
    ) {
        // Subscribe to authentication/activeCompany changes
        authService.authentication$.subscribe((authDetails) => {
            this.activeCompany = authDetails.activeCompany;
        });

        authService.filesToken$.subscribe(token => this.token = token);
    }

    public ngOnInit() {
        this.loadList();
        let timer = TimerObservable.create(5000, 5000);
        this.subscription = timer.subscribe( t => {
            if (this.busy) { return; }
            if (this.files.find( x => x.busyFetch)) {
                return;
            }
            this.files.forEach( x => {
                if (x.hasActiveJob && !x.busyFetch) {
                    this.fetchFileJobStatus(x);
                }
            });
        });
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    public refresh() {
        this.loadList();
    }

    public onJobStart(file: ISaftFileInfo) {

        this.modalService.open(SaftImportModal,
            { header: 'SAF-T IMPORT', data: {
                IncludeStartingBalance: true,
                ReuseExistingNumbers: true,
                UpdateExistingData: false,
                file: file } })
        .onClose.subscribe(response => {
            if (response) {
                file.busy = true;
                this.currentFileId = file.FileID;
                const details = {
                    FileID: file.FileID,
                    FileName: file.FileName,
                    CompanyKey: this.activeCompany.Key,
                    IncludeStartingBalance: response.IncludeStartingBalance,
                    ReuseExistingNumbers: response.ReuseExistingNumbers,
                    UpdateExistingData: response.UpdateExistingData
                };

                this.jobService.startJob(JOBNAME, undefined, details)
                    .finally(() => file.busy = false)
                    .subscribe((jobID: number) => {
                        this.fileService.tag(file.FileID, 'jobid', jobID)
                            .subscribe(() => this.refresh());
                    });
            }
        });
    }

    public onFileDeleteClick(file: ISaftFileInfo) {
        this.modalService.confirm({
            header: 'Bekreft sletting av fil',
            message: `Vennligst bekreft sletting av fil ${file.FileName}`,
            buttonLabels: {
                accept: 'Slett',
                cancel: 'Avbryt'
            }
        }).onClose.subscribe(response => {
            if (response === ConfirmActions.ACCEPT) {
                file.busy = true;
                this.fileService.delete(file.FileID)
                    .finally(() => file.busy = false)
                    .subscribe(
                        () => this.removeFile(file.FileID),
                        err => this.errorService.handle(err)
                    );
            }
        });
    }

    private removeFile(fileId: number) {
        let ix = this.files.findIndex( x => x.FileID === fileId );
        if (ix >= 0) { this.files.splice(ix, 1); }
    }

    private loadList() {
        this.busyFetch = true;
        this.files = [];
        this.fileService.getStatistics('model=file&select=id,name,size,statuscode,contenttype'
            + ',filetag.tagname as tag,filetag.status as status'
            + "&filter=statuscode eq 20001 and (filetag.tagname eq 'SAFT' or filetag.tagname eq 'jobid')"
            + '&join=file.id eq filetag.fileid&top=10&orderby=id desc')
            .finally( () => this.busyFetch = false)
            .subscribe( data => {
                if (data.Success) {
                    this.files = this.findJobIds(data.Data);
                }
            });
    }

    private findJobIds(list: Array<ISaftFileInfo>): Array<ISaftFileInfo> {
        var n = list.length;
        for (var i = n - 1; i > 0; i--) {
            let item2 = list[i];
            let item1 = list[i - 1];
            if (i > 0 && item1.FileID === item2.FileID) {
                item1.jobid = item1.tag === 'jobid' ? item1.status : item2.tag === 'jobid' ? item2.status : 0;
                item1.tags = `${item1.tag}=${item1.status},${item2.tag}=${item2.status}`;
                list.splice(i, 1);
            } else {
                item1.jobid = item1.jobid || item1.tag === 'jobid' ? item1.status : 0;
                item1.tags = item1.tags || `${item1.tag}=${item1.status}`;
            }

            if (item1.jobid) {
                this.fetchFileJobStatus(item1);
            }
        }
        return list;
    }

    private fetchFileJobStatus(file: ISaftFileInfo) {
        file.busyFetch = true;
        file.disabled = true;
        this.jobService.getJobRun(JOBNAME, <any>file.jobid, 2)
            .finally( () => file.busyFetch = false )
            .subscribe( x => {
                if (x) {
                    file.jobStatus = (x.Progress && x.Progress.length > 0) ? x.Progress[0].Progress : '';
                    if (file.jobStatus && file.jobStatus.indexOf(COMPLETEMESSAGE) >= 0) {
                        file.disabled = false;
                        file.hasActiveJob = false;
                    } else {
                        var lastProgress = x.Progress && x.Progress.length > 0 ?
                            moment(x.Progress[0].Created) : moment();
                        var diff = moment.duration(moment().diff(moment(lastProgress)));
                        file.diff = parseInt(diff.asMinutes().toFixed(0));
                        file.hasActiveJob = file.diff < 6;
                        file.disabled = file.hasActiveJob;
                    }
                    if (x.Exception) {
                        file.disabled = false;
                        file.hasActiveJob = false;
                        file.hasError = true;
                    }
                }
            });
    }

    public onUploadClick() {
        let ip: any = this.fileInput.nativeElement;
        if (ip && ip.files && ip.files.length > 0) {
            let f: IFile = <IFile>ip.files[0];
            this.busy = true;

            let data = new FormData();
            data.append('Token', this.token);
            data.append('Key', this.activeCompany.Key);
            data.append('Caption', ''); // where should we get this from the user?
            data.append('File', <any>f);

            this.ngHttp.post(this.baseUrl + '/api/file', data)
                .map(res => res.json())
                .subscribe((res) => {
                    // files are uploaded to unifiles, and will get an externalid that
                    // references the file in UE - get the UE file and add that to the
                    // collection
                    this.fileService.Get(res.ExternalId)
                        .subscribe(newFile => {
                            this.fileService.tag(newFile.ID, 'SAFT', 1).subscribe(
                                x => this.refresh()
                            );
                            this.currentFileId = newFile.ID;
                            this.busy = false;
                        }, err => this.errorService.handle(err));
                }, err => this.errorService.handle(err));
        }
    }
}

interface IFile {
    type: string;
    name: string;
    size: number;
}

interface IUniFile {
    ID: number;
    Name: string;
    UploadSlot?: string;
}

interface ISaftFileInfo {
    FileID: number;
    FileName: string;
    FileSize: number;
    FileContentType: string;
    tag: string;
    status: number;
    jobid: number;
    tags: string;
    busy?: boolean;
    busyFetch?: boolean;
    jobStatus?: string;
    disabled?: boolean;
    hasActiveJob?: boolean;
    diff?: number;
    hasError?: boolean;
}
