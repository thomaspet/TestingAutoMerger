import {Component} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import {TabService} from '../navbar/tabstrip/tabService';
import {Multival} from '../usertest/multivalue'

@Component({
    selector: 'uni-usertest',
    templateUrl: 'app/components/usertest/usertest.html',
    directives: [CORE_DIRECTIVES, Multival]
})
export class Usertest {

    private phone: string[] = ['95529331'];
    private email: string[] = ['j@lom.me', 'jorgen@unimicro.no', 'jl@highlighter.no'];

    constructor(private tabService: TabService) {
        this.tabService.addTab({name: 'Usertest', url: '/usertest'});
    }

}
