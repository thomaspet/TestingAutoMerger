import {Component, Input, HostListener} from '@angular/core';
import {ErrorService} from '../../../services/services';
import {WorkRelation} from '../../../unientities';

// tslint:disable:max-line-length
@Component({
    selector: 'time-approve-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="close('cancel')" class="closeBtn"></button>
                <article class="modal-content" [attr.aria-busy]="busy" >
                    <h3>{{workrelation?.Worker?.Info?.Name}} - {{workrelation?.Description}} {{workrelation?.WorkPercentage}}%</h3>
                    <div class="dialog-container">
                        <timetracking-timetable [workrelation]="workrelation"></timetracking-timetable>
                    </div>
                    <footer>                         
                        <button (click)="close('ok')" class="good">Lukk</button>
                    </footer>
                </article>
            </article>
        </dialog>
    `    
})
export class TimeApproveModal {

    @Input() public workrelation: WorkRelation;    
    private isOpen: boolean = false;

    constructor(private errorService: ErrorService) {
    }

    public close(src: 'ok' | 'cancel') {
        this.isOpen = false;
        this.onClose(false);
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

    public open(relation: WorkRelation): Promise<boolean> {
        this.workrelation = relation;
        this.isOpen = true;
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
    }


}
