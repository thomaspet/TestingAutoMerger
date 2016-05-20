import {Component} from '@angular/core';
import {UniSave, IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'uni-save-demo',
    template: `
        <h1>Save demo</h1>

        <uni-save [actions]="myActions" [status]="status" (save)="onSave($event)"></uni-save>

        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    `,
    directives: [UniSave]
})
export class UniSaveDemo {

    // The save bar status text
    public status: string = 'Aldri lagret';

    // The save bar's available actions. These will probably come from HATEOAS.
    private myActions: IUniSaveAction[] = [
        {
            verb: 'Lagre',
            callback: this.save,
            main: true,
            disabled: true
        },
        {
            verb: 'Lagre og bokfør',
            callback: this.saveAndBank
        },
        {
            verb: 'Lagre og dans',
            callback: this.saveAndBank
        },
        {
            verb: 'Lagre og synyg en sang',
            callback: this.saveAndBank
        },
        {
            verb: 'Lagre og bokfør',
            callback: this.saveAndBank
        }
    ];

    // An event to fire on the save-event from the save-bar
    private onSave(action) {
        // Usually, we just need to fire the callback, and perhaps provide the
        // action itself to set its `busy` and/or `available`-flags…
        action.callback(action, this);
    }

    // You provide your own save functions and queueings, the save component
    // is simply responsible for UI and event emission.
    private save(event, self) {
        console.log(this);
        self.status = 'Lagrer…';
        event.busy = true;
        window.setTimeout(() => {
            event.busy = false;
            self.status = 'Du lagret, just nu';
        }, 2000);
    }

    private saveAndBank() {
        console.log('Hello there');
    }

}