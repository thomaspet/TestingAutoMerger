import {
    Component, Input, Output, EventEmitter, ChangeDetectorRef, ViewEncapsulation,
    AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {ReportFormat} from '@app/models/reportFormat';
import {ReportService, Report, ErrorService} from '@app/services/services';
import {ComboButtonAction} from '@uni-framework/ui/combo-button/combo-button';

@Component({
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'uni-preview-modal',
    template: `
        <section class="uni-modal">
            <header>{{options.header || 'Forhåndsvisning'}}</header>

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
                <combo-button [actions]="actions"></combo-button>
            </footer>
        </section>
    `
})
export class UniPreviewModal implements IUniModal, AfterViewInit {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter<boolean>();

    actions: ComboButtonAction[];
    modalConfig: any;
    busy: boolean = true;

    constructor(
        public reportService: ReportService,
        private cdr: ChangeDetectorRef,
        private errorService: ErrorService
    ) {
        this.actions = [
            { label: 'Last ned PDF', action: () => this.download(ReportFormat.PDF) },
            { label: 'Last ned CSV', action: () => this.download(ReportFormat.CSV) },
            { label: 'Last ned HTML', action: () => this.download(ReportFormat.HTML) },
            { label: 'Last ned Excel', action: () => this.download(ReportFormat.Excel) },
            { label: 'Last ned Word', action: () => this.download(ReportFormat.Word) }
        ];
    }

    ngAfterViewInit() {
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

    download(format) {
        this.reportService.generateReportFormat(format, this.modalConfig.reportDefinition);
    }

    close() {
        this.onClose.emit();
    }
}
