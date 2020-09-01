import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '../../ui/uniform/index';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'uni-confirm-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>{{options.header}}</header>

            <article>
                <uni-form
                    [config]="formConfig$"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button *ngIf="options.buttonLabels.accept" class="good" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>
            </footer>
        </section>
    `
})
export class UniEditFieldModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public newValue = {
        Value: null
    };

    public formConfig$: BehaviorSubject<any> = new BehaviorSubject({autofocus: true});
    public formModel$: BehaviorSubject<any> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }
        this.newValue.Value = this.options.data.Value || null;
        this.formModel$.next(this.newValue);
        this.formFields$.next(this.getLayout());
    }

    public accept() {
        this.onClose.emit(this.newValue.Value);
    }

    public cancel() {
        this.onClose.emit(false);
    }

    public getLayout() {
        return [
            <any> {
                Property: 'Value',
                FieldType: this.options.fieldType,
                Label: this.options.fieldLabel,
            }
        ];
    }
}
