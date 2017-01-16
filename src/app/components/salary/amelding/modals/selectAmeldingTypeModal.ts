import { Component, Type, ViewChild, Input, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { UniModal } from '../../../../../framework/modals/modal';
import { UniFieldLayout } from 'uniform-ng2/main';
import { FieldType } from '../../../../unientities';

@Component({
    selector: 'select-amelding-type-modal-content',
    templateUrl: './selectAmeldingTypeModal.html'
})
export class SelectAmeldingTypeModalContent {
    private fields: UniFieldLayout[] = [];
    private formConfig: any = {};
    public ameldingModel: any = {};
    @Input() public config: any;

    constructor() {

    }

    public loadContent() {
        this.createFormConfig();
        this.ameldingModel.type = 1;
        this.ameldingModel.typeChanged = false;
    }

    public change(value) {
        this.ameldingModel.type = value.type - 1;
        this.ameldingModel.typeChanged = true;
    }

    private createFormConfig() {
        var ameldTypeField = new UniFieldLayout();
        ameldTypeField.Label = 'Type melding';
        ameldTypeField.EntityType = 'ameldingModel';
        ameldTypeField.FieldType = FieldType.DROPDOWN;
        ameldTypeField.Property = 'type';
        ameldTypeField.Options = {
            source: [
                { id: 1, name: 'Full a-melding' },
                { id: 2, name: 'Bare arbeidsforhold' },
                { id: 3, name: 'Nullstille a-meldingen' }
            ],
            displayProperty: 'name',
            valueProperty: 'id',
            events: {
                enter: (event) => {
                    this.config.actions[0].method();
                }
            }
        };

        this.fields = [ameldTypeField];
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
export class SelectAmeldingTypeModal implements AfterViewInit {
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
                        this.modal.getContent().then((component) => {
                            if (component.ameldingModel.typeChanged) {
                                this.ameldType = component.ameldingModel.type;
                            } else {
                                this.ameldType = component.ameldingModel.type - 1;
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

    public ngAfterViewInit() {
        this.modal.createContent();
    }

    public openModal(done) {
        this.modal.getContent().then((component: SelectAmeldingTypeModalContent) => {
            this.done = done;
            this.isActive = true;
            component.loadContent();
            this.modal.open();
        });
    }
}
