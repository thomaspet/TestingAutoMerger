import {Component, Input, Output, EventEmitter, HostListener} from '@angular/core';
import {WorkRelation} from '@uni-entities';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';

@Component({
    selector: 'time-approve-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 50vw;">
            <header>
                <h1>
                    {{workrelation?.Worker?.Info?.Name}} - {{workrelation?.Description}}
                    {{workrelation?.WorkPercentage}}%
                </h1>
            </header>

            <article>
                <div class="dialog-container">
                    <timetracking-timetable [workrelation]="workrelation"></timetracking-timetable>
                </div>
            </article>

            <footer>
                <button (click)="onClose.emit()" class="good">Lukk</button>
            </footer>

            <!--
            <article class="uniModal_bounds">
                <button (click)="close('cancel')" class="closeBtn"></button>
                <article class="modal-content">
                    <h3>{{workrelation?.Worker?.Info?.Name}} - {{workrelation?.Description}} {{workrelation?.WorkPercentage}}%</h3>
                    <div class="dialog-container">
                        <timetracking-timetable [workrelation]="workrelation"></timetracking-timetable>
                    </div>
                    <footer>
                        <button (click)="onClose.emit()" class="good">Lukk</button>
                    </footer>
                </article>
            </article>
            -->
        </section>
    `
})
export class TimeApproveModal implements IUniModal {
    options: IModalOptions = {};
    onClose: EventEmitter<any> = new EventEmitter();

    workrelation: WorkRelation;

    ngOnInit() {
        this.workrelation = this.options.data;
    }

    public open(relation: WorkRelation) {
        this.workrelation = relation;
        // this.isOpen = true;
        // return new Promise((resolve, reject) => {
        //     this.onClose = ok => resolve(ok);
        // });
    }


}
