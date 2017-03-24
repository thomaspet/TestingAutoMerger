import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {TimeSheet, TimesheetService} from '../../../services/services';
import {WorkRelation} from '../../../unientities';

@Component({
    selector: 'uni-time-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="close('cancel')" class="closeBtn"></button>
                <article class="modal-content" [attr.aria-busy]="busy" >
                    <h3>{{date|isotime:'Udddd DD.MM.YYYY'}}</h3>
                    <workeditor [timesheet]="timesheet" ></workeditor>
                    <span class="total">Totalsum: {{timesheet?.totals?.Minutes|min2hours:'decimal'}}</span>
                    <footer>                         
                        <button (click)="close('ok')" class="good">OK</button>
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
    private isOpen: boolean = false;
    private date: Date;
    private busy: boolean = false;

    constructor(private timesheetService: TimesheetService, private changeDetectorRef: ChangeDetectorRef) {
    }

    public close(src: 'ok' | 'cancel') {

        if (src === 'ok') {
            this.busy = true;
            this.timesheet.saveItems(true).subscribe( x => {
                this.isOpen = false;
                this.busy = false;
                this.onClose(true);
                this.changeDetectorRef.markForCheck();
            });
            return;
        } 
        this.isOpen = false;
        this.onClose(false);
    }

    private onClose: (ok: boolean) => void = () => {};

    public open(relation: WorkRelation, date: Date): Promise<boolean> {
        var ts = this.timesheetService.newTimeSheet(relation);
        if (this.timesheet) {
            this.timesheet.items = [];
        }
        this.date = date;
        this.busy = true;
        this.changeDetectorRef.markForCheck();
        ts.loadItemsByPeriod(date, date).subscribe( 
            x => { 
                this.busy = false;
                this.timesheet = ts;
                this.changeDetectorRef.markForCheck();
            });        
        this.isOpen = true;
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
    }

}
