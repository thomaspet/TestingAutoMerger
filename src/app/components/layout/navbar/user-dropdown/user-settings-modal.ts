import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {UniFieldLayout, FieldType} from '@uni-framework/ui/uniform';
import {User} from '@app/unientities';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'uni-user-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Brukerinnstillinger</h1>
            </header>
            <article>
                <uni-form
                    [config]="{autofocus: true}"
                    [fields]="formFields$"
                    [model]="formModel$">
                </uni-form>
            </article>

            <footer>
                <button class="good" (click)="close(true)">Lagre</button>
                <button class="bad" (click)="close(false)">Avbryt</button>
            </footer>
        </section>
    `
})
export class UserSettingsModal implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public formModel$: BehaviorSubject<User> = new BehaviorSubject(null);
    public formFields$: BehaviorSubject<Partial<UniFieldLayout>[]> = new BehaviorSubject([]);

    public ngOnInit() {
        const user = this.options.data || {};
        this.formModel$.next(user);
        this.formFields$.next(this.getFormFields());
    }

    public close(emitValue?: boolean) {
        if (emitValue) {
            this.onClose.emit(this.formModel$.getValue());
        } else {
            this.onClose.emit(null);
        }
    }

    private getFormFields(): Partial<UniFieldLayout>[] {
        return [
            {
                EntityType: 'User',
                Property: 'DisplayName',
                FieldType: FieldType.TEXT,
                Label: 'Visningsnavn',
            },
            {
                EntityType: 'User',
                Property: 'PhoneNumber',
                FieldType: FieldType.TEXT,
                Label: 'Telefonnummer',
            },
            {
                EntityType: 'User',
                Property: 'Email',
                FieldType: FieldType.TEXT,
                ReadOnly: true,
                Label: 'E-post',
            }
        ];
    }
}
