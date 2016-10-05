import {Component} from '@angular/core';
import {IUniSaveAction} from '../../../../framework/save/save';

@Component({
    selector: 'uni-save-demo',
    template: `
        <h1>Save demo</h1>

        <uni-save [actions]="actions"></uni-save>

        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    `
})
export class UniSaveDemo {
    private actions: IUniSaveAction[] = [
        {
            label: 'Lagre',
            action: this.save,
            main: true,
            disabled: true
        },
        {
            label: 'Lagre og bokfør',
            action: this.saveAndBank
        },
        {
            label: 'Lagre og syng en sang',
            action: this.save,
            disabled: true
        }   
    ];

    private save(done) {
        // Replace timeout with http subscription
        window.setTimeout(() => {
            // Do stuff with http response?
            done('Lagring fullført');
        }, 2000);
    }

    private saveAndBank(done) {
        window.setTimeout(() => {
            done('Lagring feilet');
        }, 2000);
    }
    
    public ngAfterViewInit() {
        // Changing disabled bool after init will update save component
        setTimeout(() => {
            this.actions[0].disabled = false;
        }, 2000);
    }

}
