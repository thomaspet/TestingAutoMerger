import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {FileService, UniFilesService, StatisticsService, BankStatementService, ErrorService} from '@app/services/services';
import {File, BankAccount, BankStatementEntry} from '@uni-entities';
import {switchMap} from 'rxjs/operators';
import {forkJoin} from 'rxjs';

@Component({
    selector: 'bank-statement-upload-modal',
    templateUrl: './bank-statement-upload-modal.html',
    styleUrls: ['./bank-statement-upload-modal.sass']
})
export class BankStatementUploadModal implements IUniModal {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();

    busy: boolean;
    files;
    selectedFileID: number;

    bankAccounts: BankAccount[];
    selectedAccountID: number;

    previewStep: boolean;

    importTemplates: any[];
    selectedImportTemplate: any;
    previewLines: BankStatementEntry[];

    constructor(
        private errorService: ErrorService,
        private bankStatementService: BankStatementService,
        private statisticsService: StatisticsService,
        private fileService: FileService,
        private uniFilesService: UniFilesService
    ) {}

    ngOnInit() {
        const data = this.options.data || {};
        this.bankAccounts = data.bankAccounts;
        this.selectedAccountID = data.selectedAccountID;

        const fileQuery = `model=filetag`
            + `&filter=tagname eq 'Bankstatement' and status lt 30`
            + `&select=FileID as ID,File.Name as Name,Status as Status`
            + `&top=50&expand=file&orderby=FileID desc`;

        this.busy = true;
        forkJoin(
            this.statisticsService.GetAllUnwrapped(fileQuery),
            this.bankStatementService.getImportTemplates()
        ).subscribe(
            res => {
                this.files = res[0] || [];
                this.importTemplates = res[1] || [];
                if (this.importTemplates.length) {
                    this.selectedImportTemplate = this.importTemplates[0];
                }

                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    uploadFile(event) {
        const source = event.srcElement || event.target;
        const blob = source.files && source.files[0];

        if (!blob) {
            return;
        }

        this.busy = true;
        this.uniFilesService.upload(blob).pipe(
            switchMap(res => this.fileService.Get(res.ExternalId))
        ).subscribe(
            (file: File) => {
                this.files.unshift(file);
                this.selectedFileID = file.ID;

                this.fileService.tag(file.ID, 'Bankstatement', 10).subscribe(
                    () => this.busy = false,
                    err => {
                        console.error(err);
                        this.busy = false;
                    }
                );
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    goToPreviewStep() {
        this.previewStep = true;
        this.loadPreviewLines();
    }

    loadPreviewLines() {
        this.busy = true;
        this.previewLines = [];

        this.bankStatementService.previewImport(
            this.selectedImportTemplate,
            this.selectedAccountID,
            this.selectedFileID
        ).subscribe(
            res => {
                this.previewLines = res.Entries || [];
                this.busy = false;
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }

    import() {
        this.busy = true;
        this.bankStatementService.import(
            this.selectedImportTemplate,
            this.selectedAccountID,
            this.selectedFileID
        ).subscribe(
            res => {
                this.fileService.tag(this.selectedFileID, 'Bankstatement', 30).subscribe();
                this.onClose.emit(res);
            },
            err => {
                this.errorService.handle(err);
                this.busy = false;
            }
        );
    }
}
