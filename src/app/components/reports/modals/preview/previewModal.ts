import {
    Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewEncapsulation,
    AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {IModalOptions, IUniModal} from './../../../../../framework/uni-modal';
import {ReportFormat} from '../../../../models/reportFormat';
import {ReportService, Report, ErrorService} from '@app/services/services';

interface IDownloadAction {
    label: string;
    format: ReportFormat;
}

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'uni-preview-modal',
    template: `
        <section class="uni-modal"
            (clickOutside)="close()"
            (keydown.esc)="close()">
            <header>
                <h1>{{options.header || 'Forhåndsvisning'}}</h1>
            </header>

            <article>
                <section *ngIf="busy" class="report-loading">
                    <small>Laster data og genererer rapport..</small>
                    <mat-progress-bar
                        class="uni-progress-bar"
                        mode="determinate"
                        [value]="reportService.progress$ | async">
                    </mat-progress-bar>
                </section>

                <section id="reportContainer"></section>
            </article>
            <footer *ngIf="!busy">
                <button class="main-action-button good" (click)="download(actions[0].format)" [disabled]="actionButtonDisabled">
                    {{actions[0].label}}
                </button>
                <button class="action-list-toggle good" (click)="showActionList = !showActionList" [disabled]="actionButtonDisabled">
                    Flere valg
                </button>
                <ul class="download-action-list" [attr.aria-expanded]="showActionList">
                    <li *ngFor="let action of actions" (click)="download(action.format)">
                        {{action.label}}
                    </li>
                </ul>
            </footer>
        </section>
    `
})
export class UniPreviewModal implements IUniModal, AfterViewInit {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<boolean> = new EventEmitter();

    public showActionList: boolean;
    public actions: IDownloadAction[];
    public modalConfig: any;
    public busy: boolean = true;
    public actionButtonDisabled = true;

    constructor(
        public reportService: ReportService,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService
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
            const reportDefinition: Report = this.options.data;

            this.modalConfig = {
                title: reportDefinition.Name,
                report: null,
                reportDefinition: reportDefinition
            };

            this.reportService.startReportProcess(
                reportDefinition,
                this.modalConfig,
                this.onClose
            ).subscribe(
                () => {
                    console.log(this.modalConfig);
                    this.actionButtonDisabled = false;
                    this.busy = false;
                    this.cdr.markForCheck();
                },
                (err) => {
                    this.errorService.handle(err);
                    this.close();
                }
            );
        }
    }

    public download(format) {
        this.reportService.generateReportFormat(format, this.modalConfig.reportDefinition);
    }

    public close() {
        this.onClose.emit();
    }
}
