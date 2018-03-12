import {Component, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {ToastService, ToastType} from '../../../../framework/uniToast/toastService';
import {IUniModal, IModalOptions} from '../../../../framework/uniModal/barrel';
import {UniField, FieldType} from '../../../../framework/ui/uniform/index';
import {FormControl, FormGroup} from '@angular/forms';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {DimensionSettings} from '../../../unientities';
import {DimensionSettingsService} from '../../../services/common/dimensionSettingsService';

@Component({
    selector: 'uni-template-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 40vw;">
            <header><h1>{{ options.header }}</h1></header>

            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button (click)="save()" class="good">Lagre</button>
                <button (click)="close()" class="bad">Avbryt</button>
            </footer>
        </section>
`
})

export class UniDimensionModal implements IUniModal {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    private formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    private formConfig$: BehaviorSubject<any> = new BehaviorSubject({});
    private formFields$: BehaviorSubject<UniField[]> = new BehaviorSubject([]);

    constructor(
        private service: DimensionSettingsService
    ) { }

    public ngOnInit() {
        if (this.options && this.options.data && this.options.data.dim) {
            this.formModel$.next(this.options.data.dim);
        } else {
            this.formModel$.next(this.getNewDimensionSettings());
        }
        this.setUpForm();
    }

    private setUpForm() {
        this.formFields$.next([
            <any> {
                EntityType: 'DimensionSettings',
                Property: 'Dimension',
                FieldType: FieldType.NUMERIC,
                ReadOnly: true,
                Label: 'Nummer',
                FieldSet: 0,
                Section: 0,
                Hidden: true
            },
            <any>{
                EntityType: 'DimensionSettings',
                Property: 'Label',
                FieldType: FieldType.TEXT,
                ReadOnly: false,
                Label: 'Navn',
                FieldSet: 0,
                Section: 0
            },
            <any>{
                EntityType: 'DimensionSettings',
                Property: 'IsActive',
                FieldType: FieldType.CHECKBOX,
                ReadOnly: false,
                Label: 'Aktiv',
                FieldSet: 0,
                Section: 0
            }]
        );
    }

    public save() {
        const model = this.formModel$.getValue();
        // If edit
        if (model.Dimension) {
            this.service.Put(model.ID, model).subscribe((res) => {
                this.onClose.emit(true);
            });
        } else {
            this.service.Post(model).subscribe((res) => {
                this.onClose.emit(true);
            });
        }
    }

    public close() {
        this.onClose.emit(false);
    }

    public getNewDimensionSettings() {
        return {
            Dimension: 0,
            Label: '',
            IsActive: true
        };
    }
}
