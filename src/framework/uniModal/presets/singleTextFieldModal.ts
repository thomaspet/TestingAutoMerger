import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniModal, IModalOptions} from '../../../framework/uniModal/modalService';
import {UniFieldLayout} from '../../../framework/ui/uniform/interfaces';
import {FieldType} from '../../ui/uniform/fieldTypes';

type FormModel = {field: string};

@Component({
    selector: 'single-text-field-modal',
    template: `
        <dialog class="uni-modal"
                (clickOutside)="close(false)"
                (keydown.esc)="close(false)">
            <header>
                <h1>{{options.header}}&nbsp;</h1>
            </header>
            <article>
                <main>
                    <uni-form
                        [config]="formConfig$"
                        [fields]="formFields$"
                        [model]="formModel$">
                    </uni-form>
                </main>
            </article>
            <footer>
                <button class="good" (click)="close(true)">Ok</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </dialog>
    `
})
export class SingleTextFieldModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<string> = new EventEmitter<string>();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<FormModel> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        const initData = this.options.data || '';
        this.formModel$.next({field: initData});
        this.formFields$.next(this.getFormFields(this.options.modalConfig.label));
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            this.onClose.emit(this.formModel$.getValue().field);
        } else {
            this.onClose.emit();
        }
    }

    private getFormFields(label: string): UniFieldLayout[] {
        return [
            <any> {
                EntityType: '',
                Property: 'field',
                FieldType: FieldType.TEXT,
                Label: label,
            }
        ];
    }
}
