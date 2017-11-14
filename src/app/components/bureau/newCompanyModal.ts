import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniModal, IModalOptions} from '../../../framework/uniModal/modalService';
import {UniFieldLayout} from '../../../framework/ui/uniform/interfaces';
import {FieldType} from '../../unientities';

type FormModel = {CompanyName: string};

@Component({
    selector: 'uni-new-company-modal',
    template: `
        <dialog class="uni-modal"
                (clickOutside)="close(false)"
                (keydown.esc)="close(false)">
            <header>
                <h1>{{options.header || 'Opprett nytt selskap'}}</h1>
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
export class UniNewCompanyModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<{CompanyName: string}> = new EventEmitter();

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    private formModel$: BehaviorSubject<FormModel> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        let email = this.options.data || {};
        this.formModel$.next(email);
        this.formFields$.next(this.getFormFields());
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            this.onClose.emit(this.formModel$.getValue());
        } else {
            this.onClose.emit();
        }
    }

    private getFormFields(): UniFieldLayout[] {
        return [
            <any> {
                EntityType: '',
                Property: 'CompanyName',
                FieldType: FieldType.TEXT,
                Label: 'Firmanavn',
            }
        ];
    }
}
