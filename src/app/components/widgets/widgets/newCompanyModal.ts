import {Component, Input, Output, EventEmitter} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {IUniModal, IModalOptions} from '../../../../framework/uniModal/modalService';
import {UniFieldLayout} from '../../../../framework/ui/uniform/interfaces';
import {FieldType} from '../../../unientities';

@Component({
    selector: 'uni-new-company-modal',
    template: `
        <dialog class="uni-modal"
                (clickOutside)="close(false)"
                (keydown.esc)="close(false)">
            <header>
                <h1>{{options.header || 'Firmanavn'}}</h1>
            </header>
            <main>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </main>

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
    private formModel$: BehaviorSubject<string> = new BehaviorSubject(null);
    private formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        let email = this.options.data || {};
        this.formModel$.next(email);
        this.formFields$.next(this.getFormFields());
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            this.onClose.emit(<{CompanyName: string}>this.formModel$.getValue());
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
