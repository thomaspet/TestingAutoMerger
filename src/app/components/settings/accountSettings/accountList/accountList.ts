import {Component, Output, EventEmitter} from 'angular2/core';

@Component({
    selector: 'account-list',
    templateUrl: 'app/components/settings/accountSettings/accountList/accountList.html'
})
export class AccountList {
    @Output() uniAccountChange = new EventEmitter<number>();
 
    constructor() {
    }
    
    test()
    {
        this.uniAccountChange.emit(11);
    }
}