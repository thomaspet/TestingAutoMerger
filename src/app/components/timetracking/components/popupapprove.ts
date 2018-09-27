import {Component, EventEmitter} from '@angular/core';
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
}
