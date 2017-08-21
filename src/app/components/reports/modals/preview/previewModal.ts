import {Component, Input, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';
import {IModalOptions, IUniModal} from './../../../../../framework/uniModal/barrel';
import {ReportFormat} from '../../../../models/reportFormat';
import {ReportService, Report} from '../../../../services/services';

interface IDownloadAction {
    label: string;
    format: ReportFormat;
}

@Component({
    selector: 'uni-preview-modal',
    template: `
        <dialog class="uni-modal medium"
            (clickOutside)="close()"
            (keydown.esc)="close()">

            <header>
                <h1>{{options.header || 'Forhåndsvisning'}}</h1>
            </header>

            <main>
                <section id="reportContainer" [innerHtml]="modalConfig?.report | safehtml"></section>
            </main>

            <footer>
                <button class="main-action-button good" (click)="download(actions[0].format)">
                    {{actions[0].label}}
                </button>

                <button class="action-list-toggle good" (click)="showActionList = !showActionList">
                    Flere valg
                </button>

                <ul class="download-action-list" [attr.aria-expanded]="showActionList">
                    <li *ngFor="let action of actions" (click)="download(action.format)">
                        {{action.label}}
                    </li>
                </ul>
            </footer>
        </dialog>
    `
})
export class UniPreviewModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    public showActionList: boolean;
    private actions: IDownloadAction[];
    private modalConfig: any;

    constructor(
        private reportService: ReportService,
        private cdr: ChangeDetectorRef
    ) {
        this.actions = [
            {
                label: 'Last ned PDF',
                format: ReportFormat.PDF
            },
            {
                label: 'Last ned CSV',
                format: ReportFormat.CSV
            },
            {
                label: 'Last ned HTML',
                format: ReportFormat.HTML
            },
            {
                label: 'Last ned Excel',
                format: ReportFormat.Excel
            },
            {
                label: 'Last ned Word',
                format: ReportFormat.Word
            }
        ];
    }

    public ngAfterViewInit() {
        if (this.options.data) {
            let reportDefinition: Report = this.options.data;

            this.modalConfig = {
                title: reportDefinition.Name,
                report: null,
                reportDefinition: reportDefinition
            };

            this.reportService.generateReportHtml(this.options.data, this.modalConfig, () => {
                this.cdr.markForCheck();
            });
        }
    }

    public download(format: string) {
        this.reportService.generateReportFormat(format, this.modalConfig.reportDefinition);
    }

<<<<<<< HEAD
    public open(report: Report, parameters = null, doneHandler: (msg: string) => void = null) {
        this.modalDoneHandler = doneHandler;
        this.modalConfig.title = report.Name;
        this.modalConfig.report = null;
        this.reportDefinition = report;
        this.modal.open();
        
        if (doneHandler !== null) {
            doneHandler('Skrevet ut');
        }

        this.reportService.generateReportHtml(report, this.modalConfig, () => {
            this.cdr.markForCheck();
        });
=======
    public close(saveBeforeClosing?: boolean) {
        this.onClose.emit();
>>>>>>> feat(modals): rewrite previewModal to support modalService
    }
}
