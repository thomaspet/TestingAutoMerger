import {Component, Input} from '@angular/core';

@Component({
    selector: 'license-info-admin-list',
    templateUrl: './admin-list.html'
})
export class AdminList {
    @Input() managers: any[];

    filteredManagers: any[];
    filterValue: string;

    ngOnChanges() {
        if (this.managers) {
            this.filteredManagers = this.managers;
        }
    }

    filterManagers() {
        const filterValue = (this.filterValue || '').toLowerCase();
        this.filteredManagers = this.managers.filter(manager => {
            const user = manager.User;
            return (user.Name || '').toLowerCase().includes(filterValue)
                || (user.Email || '').toLowerCase().includes(filterValue)
                || (user.Phone || '').toLowerCase().includes(filterValue);
        });
    }
}
