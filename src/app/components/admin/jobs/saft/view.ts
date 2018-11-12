import {Component, OnInit, ViewChild} from '@angular/core';
import {ErrorService, JobService, FileService} from '../../../../services/services';
import {Http} from '@angular/http';
import {AuthService} from '../../../../authService';
import {timer as observableTimer, BehaviorSubject, forkJoin} from 'rxjs';
import {environment} from 'src/environments/environment';
import {
    UniModalService,
    ConfirmActions
} from '../../../../../framework/uni-modal';
import {SaftImportModal} from './saftimportmodal';
import * as moment from 'moment';
import { SaftExportModal } from './saftexportmodal';
import { JobRun } from '@app/models/admin/jobs/jobRun';
import {saveAs} from 'file-saver';

const JOBNAME: string = 'ImportSaft';
const COMPLETEMESSAGE: string = 'Import completed';

@Component({
    selector: 'saft-import-view',
    templateUrl: './view.html'
})


export class SaftExportView implements OnInit {
    @ViewChild('fileInput') private fileInput: any;
    public busy: boolean = false;
    public busyFetch: boolean = false;
    public files: Array<ISaftFileInfo> = [];
    public currentFileId: number;
    private subscription: any;
    public jobName: string = JOBNAME;
    private baseUrl: string = environment.BASE_URL_FILES;

    constructor(
        private errorService: ErrorService,
        private jobService: JobService,
        private fileService: FileService,
        private ngHttp: Http,
        private authService: AuthService,
        private modalService: UniModalService
    ) {}

    public ngOnInit() {
        this.loadList();
        const timer = observableTimer(5000, 5000);
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
                    CompanyKey: this.authService.getCompanyKey(),
                    IncludeStartingBalance: response.IncludeStartingBalance,
                    ReuseExistingNumbers: response.ReuseExistingNumbers,
                    UpdateExistingData: response.UpdateExistingData,
                    Automark: !!response.Automark
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

    public onDownloadExport(file:ISaftFileInfo){
        this.fileService.getDownloadUrl(file.FileID)
            .subscribe((url) => {
                const link: any = document.createElement('a');
                if (link.download !== undefined) {
                    link.setAttribute('href', url);
                    link.setAttribute('download', file.FileName);
                    link.style = 'visibility:hidden';
                }
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            err => {
                this.errorService.handle(err);
            }
        );
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
        const index = this.files.findIndex( x => x.FileID === fileId );
        if (index >= 0) { this.files.splice(index, 1); }
    }

    private loadList() {
        this.busyFetch = true;
        this.files = [];
        forkJoin(this.jobService.getJobRuns("ExportSaft"),
        this.fileService.getStatistics('model=file&select=id,name,size,statuscode,contenttype'
        + ',filetag.tagname as tag,filetag.status as status'
        + `&filter=statuscode eq 20001 and (filetag.tagname eq 'SAFT' or filetag.tagname eq 'jobid')`
        + '&join=file.id eq filetag.fileid&top=10&orderby=id desc')
            ).subscribe(result=>{
                this.files =this.mapExportJob(result[0]);
                if(result[1].Success){
                    this.files = this.files.concat(this.findJobIds(result[1].Data).map(x=>{x.JobName='ImportSaft';return x;}));
                }
                this.busyFetch = false;
            },
            err => this.errorService.handle(err),
            () => this.busyFetch = false
        );

    }

    private mapExportJob(list: Array<JobRun>): Array<ISaftFileInfo> {
        var retlist : Array<ISaftFileInfo>=[];
        let filter:string = "";
        list.forEach(job => {
            let f:any = {};
            f.JobName = job.JobName;
            if(job.Output){
                let o = JSON.parse(job.Output); 
                if(!!o){
                    f.FileID = o.FileID;
                    f.Url = o.Url;
                }
            }
            if(filter){
                filter += " or "
            }
            filter+="id eq " + f.FileID;
            f.hasError = job.Exception==="";
            retlist.push(f);
        });
        
        this.fileService.getStatistics('model=File&select=file.*&filter='+filter)
            .subscribe( data => {
                if (data.Success) {
                    data.Data.forEach(file => {
                        var retfile = retlist.find(x=>x.FileID == file.ID);
                        retfile.FileName = file.Name;
                        retfile.FileContentType = file.ContentType;
                        retfile.FileSize = file.Size;
                    });
                }
            });
        return retlist;
    }

   
    private findJobIds(list: Array<ISaftFileInfo>): Array<ISaftFileInfo> {
        const n = list.length;
        for (let i = n - 1; i > 0; i--) {
            const item2 = list[i];
            const item1 = list[i - 1];
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
                        const lastProgress = x.Progress && x.Progress.length > 0 ?
                            moment(x.Progress[0].Created) : moment();
                        const diff = moment.duration(moment().diff(moment(lastProgress)));
                        file.diff = parseInt(diff.asMinutes().toFixed(0), 10);
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


    public exportSaft(event){
       
        this.modalService.open(SaftExportModal,{data: 
            {
                FromYear: new Date().getFullYear(),
                ToYear: new Date().getFullYear(),
                FromPeriod:1,
                ToPeriod:12,
                SendEmail:true
            }
            }).onClose.subscribe((resp)=>{
                if (resp) {
                    this.jobService.startJob("ExportSaft", undefined, resp)
                        .subscribe((jobID: number) => {
                           this.refresh();
                        });
                }
        })
    }

    public uploadFile(event, triedReAuthenticating?: boolean) {
        const source = event.srcElement || event.target;
        const file: IFile = source.files && source.files[0];

        if (file) {
            this.busy = true;

            const data = new FormData();
            data.append('Token', this.authService.filesToken);
            data.append('Key', this.authService.getCompanyKey());
            data.append('Caption', '');
            data.append('File', <any> file);

            this.ngHttp.post(this.baseUrl + '/api/file', data)
                .map(res => res.json())
                .subscribe((res) => {
                    // files are uploaded to unifiles, and will get an externalid that
                    // references the file in UE - get the UE file and add that to the
                    // collection
                    this.fileService.Get(res.ExternalId)
                        .finally(() => this.busy = false)
                        .subscribe(
                            newFile => {
                                this.fileService.tag(newFile.ID, 'SAFT', 1).subscribe(
                                    x => this.refresh()
                                );
                                this.currentFileId = newFile.ID;
                            },
                            err => this.errorService.handle(err)
                        );
                }, err => {
                    if (triedReAuthenticating) {
                        this.busy = false;
                        this.errorService.handle(err);
                    } else {
                        this.authService.authenticateUniFiles().then(() => {
                            this.uploadFile(event, true);
                        });
                    }
                }
            );
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
    JobName: string;
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
    Url:string;
}
