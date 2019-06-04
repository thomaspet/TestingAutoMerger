import { Injectable } from '@angular/core';
interface IFromToFilter {
    from: number;
    to: number;
}
@Injectable()
export class SalaryHelperMethods {

    constructor() { }

    public odataFilter(ids: number[], field: string = 'ID'): string {
        return `(${this.getFromToFilter([...ids].sort((a, b) => a - b))
            .map(({from, to}) => from !== to
                    ? `${field} ge ${from} and ${field} le ${to}`
                    : `${field} eq ${from}`)
            .join(' or ')})`;
    }

    private getFromToFilter(ids: number[]): IFromToFilter[] {
        let from = 0;
        const ret: IFromToFilter[] = [];
        if (!ids.length) {
            return ret;
        }
        ids.forEach((id, i) => {
            if (!from) {
                from = id;
            } else if (i > 0 && ids[i - 1] + 1 !== id) {
                ret.push({from: from, to: ids[i - 1]});
                from = id;
            }
        });

        ret.push({from: from, to: ids[ids.length - 1]});

        return ret;
    }
}
