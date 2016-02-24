import {Pipe} from 'angular2/core';

@Pipe({
    name: 'sort'
})

export class OrderByPipe {
    transform(value, property) {
        return value.sort(this.dynamicSort(property[0]));
    }

    dynamicSort(property) {
        var sortOrder = 1;

        if (property !== undefined) {
            console.log(property);
            if (property.charAt(0) === '-') {
                sortOrder = -1;
                property = property.substr(1);
            }

            //If property is in sub-object: Ex Status.Description in User => User.Status.Description
            if (property.split('.').length == 2) {
                var props = property.split('.');

                return (a, b) => {
                    return ((a[props[0]][props[1]] < b[props[0]][props[1]]) ? -1 : (a[props[0]][props[1]] > b[props[0]][props[1]]) ? 1 : 0) * sortOrder;
                }
            }

            //If property is in sub-object of sub-object: Ex Description.Value in User.Status => User.Status.Description.Value
            if (property.split('.').length == 3) {
                var props = property.split('.');

                return (a, b) => {
                    return ((a[props[0]][props[1]][props[2]] < b[props[0]][props[1]][props[2]]) ? -1 : (a[props[0]][props[1]][props[2]] > b[props[0]][props[1]][props[2]]) ? 1 : 0) * sortOrder;
                }
            }
        }

        return (a, b) => {
            return ((a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0) * sortOrder;
        }
    }
}