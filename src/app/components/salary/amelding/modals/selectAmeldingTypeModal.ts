import {Component, Type, ViewChild, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniFieldLayout} from '../../../../../framework/uniform/index';
import {FieldType} from '../../../../unientities';

@Component({
    selector: 'select-amelding-type-modal-content',
    templateUrl: 'app/components/salary/amelding/modals/selectAmeldingTypeModal.html'
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
    }

    public change(value) {
        this.ameldingModel.type = value.type - 1;
    }

    private createFormConfig() {
        var ameldTypeField = new UniFieldLayout();
        ameldTypeField.Label = 'Type melding';
        ameldTypeField.EntityType = 'ameldingModel';
        ameldTypeField.FieldType = FieldType.DROPDOWN;
        ameldTypeField.Property = 'type';
        ameldTypeField.Options = {
            source: [
                {id: 1, name: 'Full a-melding'},
                {id: 2, name: 'Bare arbeidsforhold'}
            ],
            displayProperty: 'name',
            valueProperty: 'id'
        };

        this.fields = [ameldTypeField];
    }


}

@Component({
    selector: 'select-amelding-type-modal',
    template: `<uni-modal [type]="type" [config]="modalConfig"></uni-modal>`
})
export class SelectAmeldingTypeModal implements AfterViewInit {
    public ameldType: number;
    public modalConfig: any = {};
    public type: Type<any> = SelectAmeldingTypeModalContent;
    @Output() private ameldTypeChange: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor() {
        this.modalConfig = {
            title: 'Utvalg a-melding',
            ameldType: 0,
            cancel: () => {
                this.modal.getContent().then((component: SelectAmeldingTypeModalContent) => {
                    this.modal.close();
                });
            },
            actions: [
                {
                    text: 'Lag a-melding',
                    class: 'good',
                    method: () => {
                        this.modal.getContent().then((component) => {
                            this.ameldType = component.ameldingModel.type;
                            this.ameldTypeChange.emit(this.ameldType);
                            this.modal.close();
                        });
                    }
                }
            ]
        };
    }

    public ngAfterViewInit() {
        this.modal.createContent();
    }

    public openModal() {
        this.modal.getContent().then((component: SelectAmeldingTypeModalContent) => {
            component.loadContent();
            this.modal.open();
        });
    }
}
