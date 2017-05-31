import {Component, Input, ChangeDetectionStrategy, ChangeDetectorRef
    , HostListener, ViewChild} from '@angular/core';
import {ErrorService} from '../../../services/services';
import {WorkRelation} from '../../../unientities';
import {ApproveDetails} from './approvedetails';

@Component({
    selector: 'time-approve-modal',
    template: `
        <dialog class="uniModal" [attr.open]="isOpen">            
            <article class="uniModal_bounds">                
                <button (click)="close('cancel')" class="closeBtn"></button>
                <article class="modal-content" [attr.aria-busy]="busy" >
                    <h3>{{workrelation?.Worker?.Info?.Name}}</h3>
                    <div class="dialog-container">
                        <approve-details [workrelation]="workrelation"></approve-details>
                    </div>
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
export class TimeApproveModal {

    @Input() public workrelation: WorkRelation;    
    @ViewChild(ApproveDetails) private editor: ApproveDetails;
    private isOpen: boolean = false;
    private busy: boolean = false;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private errorService: ErrorService) {
    }

    public close(src: 'ok' | 'cancel') {

        if (src === 'ok') {
            // this.editor.closeEditor();
            setTimeout( () => this.save(), 10);
            return;
        } 
        this.isOpen = false;
        this.onClose(false);
        this.refresh();
    }

    private save() {
        this.goBusy(true);
        // this.timesheet.saveItems(true)
        //     .finally(() => this.goBusy(false))
        //     .subscribe( x => {
        //         this.isOpen = false;
        //         this.onClose(true);
        //     },  err => {
        //         this.errorService.handle(err);
        // });
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

    public open(relation: WorkRelation): Promise<boolean> {
        this.workrelation = relation;
        this.isOpen = true;
        this.refresh();
        return new Promise((resolve, reject) => {
            this.onClose = ok => resolve(ok);            
        });
    }

    private refresh() {
        if (this.changeDetectorRef) {
            this.changeDetectorRef.markForCheck();
        }
    }

}
