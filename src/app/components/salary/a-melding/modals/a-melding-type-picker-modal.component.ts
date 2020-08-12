import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {BehaviorSubject} from 'rxjs';
import {UniFieldLayout, FieldType} from '../../../../../framework/ui/uniform/index';

export interface IAmeldingTypeEvent {
    type: number;
    done?: (message: string) => void;
}

@Component({
    selector: 'amelding-type-picker-modal',
    templateUrl: './a-melding-type-picker-modal.component.html'
})

export class AMeldingTypePickerModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<IAmeldingTypeEvent> = new EventEmitter<IAmeldingTypeEvent>();
    public fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    public ameldingModel$: BehaviorSubject<any> = new BehaviorSubject({});
    constructor() { }

    public ngOnInit() {
        this.createFormConfig();
        this.ameldingModel$.next({type: 0});
     }

    public close(submit: boolean) {
        this.ameldingModel$
            .take(1)
            .map(model => submit ? model : null)
            .do(model => {
                if (this.options.modalConfig.done && !model) {
                    this.options.modalConfig.done('Generering av A-melding avbrutt');
                }
            })
            .map(model => {
                return {
                    type: model ? model.type : -1,
                    done: this.options.modalConfig.done
                };
            })
            .subscribe(event => this.onClose.next(event));
    }

    private createFormConfig() {
        const ameldTypeField = new UniFieldLayout();

        ameldTypeField.Label = 'Type melding';
        ameldTypeField.EntityType = 'ameldingModel';
        ameldTypeField.FieldType = FieldType.DROPDOWN;
        ameldTypeField.Property = 'type';
        ameldTypeField.Options = {
            displayProperty: 'name',
            source: [
                { id: 0, name: 'Full a-melding' },
                { id: 1, name: 'Bare arbeidsforhold' },
            ],
            valueProperty: 'id',
            events: {
                enter: (event) => {
                    this.options.modalConfig.actions[0].method();
                }
            }
        };

        // if amelding has status sent or recieved from altinn with full amelding remove 'Bare arbeidsforhold' option
        if (this.options.data.anySentInAmeldingerWithStandardAmeldingType) {
            ameldTypeField.Options.source.splice(1, 1);
        }

        this.fields$.next([ameldTypeField]);
    }
}
