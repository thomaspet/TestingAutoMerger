import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';
import {Travel} from '@uni-entities';

export interface ITravelRejectEvent {
    reject: boolean;
    travel: Travel;
}

@Component({
    selector: 'travel-reject-modal',
    templateUrl: './travel-reject-modal.component.html'
})

export class TravelRejectModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<ITravelRejectEvent> = new EventEmitter<ITravelRejectEvent>();
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public trvlModel$: BehaviorSubject<any> = new BehaviorSubject({});

    constructor() { }

    public ngOnInit() {
        this.createFormConfig();
        this.trvlModel$.next(this.options.data);
     }

    public close(submit: boolean) {
        this.trvlModel$
            .take(1)
            .map(model => {
                return {
                    reject: submit,
                    travel: model
                };
            })
            .subscribe(event => this.onClose.next(event));
    }

    private createFormConfig() {
        const commentField = new UniFieldLayout();
        commentField.Label = 'Kommentar';
        commentField.EntityType = 'trvlModel';
        commentField.FieldType = FieldType.TEXT;
        commentField.Property = 'Comment';

        this.fields$.next([commentField]);
    }
}
