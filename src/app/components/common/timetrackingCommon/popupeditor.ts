import {
    Component,
    Input,
    Output,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener,
    EventEmitter,
    ViewChild
} from '@angular/core';
import {
    TimeSheet,
    TimesheetService,
    ErrorService
} from '@app/services/services';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {LocalDate} from '@uni-entities';
import {WorkEditor} from './workeditor';
import {parseTime } from '../../common/utils/utils';

@Component({
    selector: 'uni-time-modal',
    template: `
        <section class="uni-modal uni-redesign">
            <header>Rediger timer</header>

            <i *ngIf="options.data.linkToCancel" class="material-icons arrow_back icon-blue">arrow_back</i>
            <a *ngIf="options.data.linkToCancel" (click)="close()">Tilbake til timevalg</a>

            <article [attr.aria-busy]="busy" id="uniTableWrapper">
                <div style="display: flex; align-items: center;">
                    <a class="time-popup-date-text register-text">
                        <i class="material-icons"> watch_later </i> Registrer timer for {{ date|isotime:'Udddd DD.MM.YYYY' }}
                    </a>

                    <mat-form-field *ngIf="templates.length" style="margin-left: auto;">
                        <mat-select [value]="currentTemplate" (valueChange)="useTemplate($event)" placeholder="Bruk mal">
                            <mat-option *ngFor="let template of templates" [value]="template">
                                {{ template.Name }}
                            </mat-option>
                        </mat-select>
                    </mat-form-field>
                </div>

                <workeditor class="workEditor" [order]="options.data.order" [timesheet]="timesheet"> </workeditor>

                <div class="sum">
                    <a class="time-popup-date-text total-text">
                        <i class="material-icons"> work_outline </i> Totalsum: {{timesheet?.totals?.Minutes|min2hours:'decimal'}}
                    </a>
                </div>
            </article>

            <footer>
                <button (click)="close('cancel')" class="secondary">
                    Avbryt
                </button>

                <button class="c2a" (click)="close('ok')">
                    Lagre
                </button>
            </footer>
        </section>
    `,
    styleUrls: ['./popupeditor.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTimeModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Input()
    public timesheet: TimeSheet;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(WorkEditor, { static: true })
    private editor: WorkEditor;

    public date: Date;
    public busy: boolean = false;

    templates: any[] = [];
    currentTemplate;

    constructor(
        private timesheetService: TimesheetService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService) {
    }

    public ngOnInit() {
        // setting height of other modal to cover the other modal
        if (this.options.data.height) {
            const element = document.getElementById('uniTableWrapper');
            element.setAttribute('style', 'height:' + this.options.data.height + ';');
        }

        if (this.options.data.templates) {
            this.templates = this.options.data.templates;
        }

        const ts = this.timesheetService.newTimeSheet(this.options.data.relation);
        if (this.timesheet) {
            this.timesheet.items = [];
        }
        this.date = this.options.data.date;
        this.goBusy(true);
        ts.loadItemsByPeriod(this.date, this.date).subscribe(x => {
            this.editor.EmptyRowDetails.Date = new LocalDate(this.date);
            this.timesheet = ts;
            this.goBusy(false);
        });
    }

    public close(src: 'ok' | 'cancel') {

        if (src === 'ok') {
            this.editor.closeEditor();
            setTimeout( () => this.save(), 10);
            return;
        }
        this.onClose.emit(false);
        this.refresh();
    }

    private save() {
        this.goBusy(true);
        this.timesheet.saveItems(true)
            .finally(() => this.goBusy(false))
            .subscribe( x => {
                this.onClose.emit(true);
            },  err => {
                this.errorService.handle(err);
        });
    }

    private goBusy(busy: boolean = true) {
        this.busy = busy;
        this.refresh();
    }

    public useTemplate(event) {
        event.Items.forEach((item) => {
            this.timesheet.addItem(this.mapTemplateToWorkItem({}, item));
            if (item && item.Project && item.Project.ID) {
                const value = {
                    name: 'Dimensions.ProjectID',
                    value: item.Project,
                    isParsed: false,
                    rowIndex: this.timesheet.items.length - 1
                };
                this.timesheet.setItemValue(value);
            }
        });

        this.timesheet.recalc();
        this.editor.refreshData();
    }

    private mapTemplateToWorkItem(workItem: any, template) {
        const types = this.editor.getWorkTypes();
        workItem.Date = this.options.data.date;
        workItem.StartTime = template.StartTime ? parseTime(template.StartTime) : parseTime('8');
        workItem.EndTime = template.EndTime ? parseTime(template.EndTime) : parseTime('8');
        workItem.Minutes = template.Minutes;
        workItem.LunchInMinutes = template.LunchInMinutes;
        workItem.Description = template.Description;
        if (template.Worktype && template.Worktype.ID) {
            workItem.Worktype = types.find(t => t.ID === template.Worktype.ID);
        } else {
            workItem.Worktype = types[0];
        }
        workItem.WorkTypeID = workItem.Worktype.ID;
        return workItem;
    }

    @HostListener('keydown', ['$event'])
    public keyHandler(event: KeyboardEvent) {
        switch (event.keyCode) {
            case 27: // ESC
                this.close('cancel');
                break;
            case 83: // S
                if (event.ctrlKey) {
                    this.close('ok');
                }
                break;
        }
    }

    private refresh() {
        if (this.changeDetectorRef) {
            this.changeDetectorRef.markForCheck();
        }
    }

}
