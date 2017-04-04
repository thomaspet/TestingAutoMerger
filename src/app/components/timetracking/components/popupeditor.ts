import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, ViewChild} from '@angular/core';
import {TimeSheet, TimesheetService, ErrorService} from '../../../services/services';
import {WorkRelation, LocalDate} from '../../../unientities';
import {WorkEditor} from './workeditor';
import * as moment from 'moment';

@Component({
    selector: 'uni-time-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="close('cancel')" class="closeBtn"></button>
                <article class="modal-content" [attr.aria-busy]="busy" >
                    <h3>{{date|isotime:'Udddd DD.MM.YYYY'}}</h3>
                    <workeditor [timesheet]="timesheet" (rowDeleted)="onEditChanged(true)"
                        (valueChanged)="onEditChanged(false)"></workeditor>
                    <span class="total">Totalsum: {{timesheet?.totals?.Minutes|min2hours:'decimal'}}</span>
                    <footer>                         
                        <button (click)="close('ok')" class="good">Lagre</button>
                        <button (click)="close('cancel')" class="bad">Avbryt</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush    
})
export class UniTimeModal {

    @Input() public timesheet: TimeSheet;    
    @ViewChild(WorkEditor) private editor: WorkEditor;
    private isOpen: boolean = false;
    private date: Date;
    private busy: boolean = false;

    constructor(
        private timesheetService: TimesheetService, 
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService) {
    }

    public close(src: 'ok' | 'cancel') {

        if (src === 'ok') {
            this.editor.closeEditor();
            setTimeout( () => this.save(), 10);
            return;
        } 
        this.isOpen = false;
        this.onClose(false);
        this.refresh();
    }

    private save() {
        this.goBusy(true);
        this.timesheet.saveItems(true)
            .finally(() => this.goBusy(false))
            .subscribe( x => {
                this.isOpen = false;
                this.onClose(true);
            },  err => {
                this.errorService.handle(err);
        });
    }

    private goBusy(busy: boolean = true) {
        this.busy = busy;
        this.refresh();
    }

    private onClose: (ok: boolean) => void = () => {};

    @HostListener('keydown', ['$event']) 
    public keyHandler(event: KeyboardEvent) {
        if (!this.isOpen) { return; }
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

    public open(relation: WorkRelation, date: Date): Promise<boolean> {
        var ts = this.timesheetService.newTimeSheet(relation);
        if (this.timesheet) {
            this.timesheet.items = [];
        }
        this.date = date;
        this.suggestTime();
        this.goBusy(true);
        ts.loadItemsByPeriod(date, date).subscribe( 
            x => { 
                this.timesheet = ts;
                this.suggestTime();
                this.goBusy(false);
            });        
        this.isOpen = true;
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
    }

    public onEditChanged(rowDeleted: boolean) {
        this.suggestTime();
    }

    private suggestTime() {
        let defDate = this.date;
        let def = moment(this.date).hours(8).minutes(0).seconds(0).toDate();
        let ts = this.timesheet;
        if (ts && ts.items && ts.items.length > 0) {
            def = ts.items[ts.items.length - 1].EndTime;
            defDate = ts.items[ts.items.length - 1].Date;
        }
        this.editor.EmptyRowDetails.Date = new LocalDate(defDate);
        this.editor.EmptyRowDetails.StartTime = def;
    }    

    private refresh() {
        if (this.changeDetectorRef) {
            this.changeDetectorRef.markForCheck();
        }
    }

}
