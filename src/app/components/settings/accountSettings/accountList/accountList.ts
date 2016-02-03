import {Component, Output, EventEmitter} from 'angular2/core';

@Component({
    selector: 'account-list',
    templateUrl: 'app/components/settings/accountSettings/accountList/accountList.html'
})
export class AccountList {
    @Output() change = new EventEmitter<number>();
 
    constructor() {
    }
    
    test()
    {
        this.change.emit(7);
    }
}