import {Pipe} from 'angular2/core';

@Pipe({
    name: 'filter'
})

export class FilterInactivePipe {
    transform(value, property) {
        if (!property[0]) {
            return value;
        } else {
            return value.filter((user) => { return user.Status.Description !== property[1] });
        }
    }
}