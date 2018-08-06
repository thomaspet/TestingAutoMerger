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
} from '../../../services/services';
import {IUniModal, IModalOptions} from '../../../../framework/uni-modal';
import {LocalDate} from '../../../unientities';
import {WorkEditor} from './workeditor';

@Component({
    selector: 'uni-time-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 80vw">
            <header><h1>Rediger timer</h1></header>

            <article [attr.aria-busy]="busy">
                <h3>{{date|isotime:'Udddd DD.MM.YYYY'}}</h3>
                <workeditor [timesheet]="timesheet"> </workeditor>
                <span class="total">Totalsum: {{timesheet?.totals?.Minutes|min2hours:'decimal'}}</span>
            </article>

            <footer>
                <button (click)="close('ok')" class="good">Lagre</button>
                <button (click)="close('cancel')" class="bad">Avbryt</button>
            </footer>
        </section>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UniTimeModal implements IUniModal {

    @Input()
    public options: IModalOptions;

    @Input()
    public timesheet: TimeSheet;

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    @ViewChild(WorkEditor)
    private editor: WorkEditor;

    public date: Date;
    public busy: boolean = false;

    constructor(
        private timesheetService: TimesheetService,
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService) {
    }

    public ngOnInit() {
        var ts = this.timesheetService.newTimeSheet(this.options.data.relation);
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
