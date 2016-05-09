import {Pipe} from '@angular/core';

@Pipe({
    name: 'filter'
})

export class FilterInactivePipe {
    transform(value, property) {
        if (!property[0]) {
            return value;
        } else {
            return value.filter((user) => { return user.StatusCode === property[1] });
        }
    }
}