import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {TabService} from '../navbar/tabstrip/tabService';

@Component({
    selector: 'uni-usertest',
    templateUrl: 'app/components/usertest/usertest.html',
    directives: [CORE_DIRECTIVES]
})
export class Usertest {

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Usertest', url: '/usertest'});
    }

}
