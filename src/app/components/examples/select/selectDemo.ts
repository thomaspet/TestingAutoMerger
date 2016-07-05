import {Component} from '@angular/core';
import { UniSelect } from '../../../../framework/controls/select/select';

@Component({
    selector: 'select-demo',
    template: `
    <label> Favorittdyr
        <uni-select [config]="myFancySelect"></uni-select>
    </label>`,
    directives: [UniSelect]
})
export class UniSelectDemo {

    private myFancySelect: any = {
        options: [
            {
                displayText: 'Kodiak',
                version: 'Public Beta'
            },
            {
                displayText: 'Cheetah',
                version: '10.0'
            },
            {
                displayText: 'Puma',
                version: '10.1'
            },
            {
                displayText: 'Jaguar',
                version: '10.2'
            },
            {
                displayText: 'Panther',
                version: '10.3'
            },
            {
                displayText: 'Tiger',
                version: '10.4'
            },
            {
                displayText: 'Leopard',
                version: '10.5'
            },
            {
                displayText: 'Snow Leopard',
                version: '10.6'
            },
            {
                displayText: 'Lion',
                version: '10.7'
            },
            {
                displayText: 'Mountain Lion',
                version: '10.8'
            },
            {
                displayText: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                version: '10.8'
            }
        ]
    };

    constructor() {}
}
