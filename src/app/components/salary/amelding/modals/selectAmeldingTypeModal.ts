import {Component, Type, ViewChild, Input, Output, EventEmitter, SimpleChanges} from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { UniFieldLayout, FieldType } from 'uniform-ng2/main';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Component({
    selector: 'select-amelding-type-modal-content',
    templateUrl: 'app/components/salary/amelding/modals/selectAmeldingTypeModal.html'
})
export class SelectAmeldingTypeModalContent {
    private fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public ameldingModel$: BehaviorSubject<any> = new BehaviorSubject({});
    @Input() public config: any;

    constructor() {

    }

    public ngOnInit() {
        this.loadContent();
    }

    public loadContent() {
        this.createFormConfig();
        let model = this.ameldingModel$.getValue();
        model.type = 0;
        model.typeChanged = false;
        this.ameldingModel$.next(model);
    }

    public change(change: SimpleChanges) {
        if (change['type']) {
            let model = this.ameldingModel$.getValue();
            model.typeChanged = true;
            this.ameldingModel$.next(model);
        }
    }

    private createFormConfig() {
        var ameldTypeField = new UniFieldLayout();
        ameldTypeField.Label = 'Type melding';
        ameldTypeField.EntityType = 'ameldingModel';
        ameldTypeField.FieldType = FieldType.DROPDOWN;
        ameldTypeField.Property = 'type';
        ameldTypeField.Options = {
            source: [
                { id: 0, name: 'Full a-melding' },
                { id: 1, name: 'Bare arbeidsforhold' },
                { id: 2, name: 'Nullstille a-meldingen' }
            ],
            displayProperty: 'name',
            valueProperty: 'id',
            events: {
                enter: (event) => {
                    this.config.actions[0].method();
                }
            }
        };

        this.fields$.next([ameldTypeField]);
    }


}

export interface IAmeldingTypeEvent {
    type: number;
    done?: (message: string) => void;
}

@Component({
    selector: 'select-amelding-type-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig" (close)="close()"></uni-modal>`
})
export class SelectAmeldingTypeModal {
    public ameldType: number;
    public modalConfig: any = {};
    private isActive: boolean;
    public type: Type<any> = SelectAmeldingTypeModalContent;
    private done: (message: string) => void;
    @Output() private ameldTypeChange: EventEmitter<IAmeldingTypeEvent> = new EventEmitter<IAmeldingTypeEvent>();

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor() {
        this.modalConfig = {
            title: 'Utvalg a-melding',
            ameldType: 0,
            cancel: () => {
                this.modal.getContent().then((component: SelectAmeldingTypeModalContent) => {
                    this.done('Generering av A-melding avbrutt');
                    this.isActive = false;
                    this.modal.close();
                });
            },
            actions: [
                {
                    text: 'Lag a-melding',
                    class: 'good',
                    method: () => {
                        this.modal.getContent().then((component: SelectAmeldingTypeModalContent) => {
                            if (component.ameldingModel$.getValue().typeChanged) {
                                this.ameldType = component.ameldingModel$.getValue().type;
                            } else {
                                this.ameldType = component.ameldingModel$.getValue().type - 1;
                            }
                            let event: IAmeldingTypeEvent = {
                                type: this.ameldType,
                                done: this.done
                            };
                            this.ameldTypeChange.emit(event);
                            this.isActive = false;
                            this.modal.close();
                        });
                    }
                }
            ]
        };
    }

    public close() {
        if (this.isActive) {
            this.done('Generering av A-melding avbrutt');
        }
    }

    public openModal(done) {
        this.modal.open();
        this.modal.getContent().then((component: SelectAmeldingTypeModalContent) => {
            this.done = done;
            this.isActive = true;
        });
    }
}
