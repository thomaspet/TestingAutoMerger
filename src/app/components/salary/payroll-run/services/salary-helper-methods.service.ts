import { Injectable } from '@angular/core';
interface IFromToFilter {
    from: number;
    to: number;
}
@Injectable()
export class SalaryHelperMethodsService {

    constructor() { }

    public odataFilters(ids: number[], field: string = 'ID', exclude?: boolean, threshhold: number = 50): string[] {
        const fromTos = this.getFromToFilter(this.getIdsToFilter(ids, exclude).sort((a, b) => a - b));
        const pages = fromTos.reduce((acc, curr) => {
            const index = acc.length - 1;
            if (acc[index].length > threshhold) {
                return [...acc, [curr]];
            }
            acc[index] = [...acc[index], curr];
            return acc;
        }, [[]]);
        return pages.map(page => this.odataFilterFromToos(page, field, exclude));
    }

    public odataFilter(ids: number[], field: string = 'ID', exclude?: boolean): string {
        const idsToFilter = this.getIdsToFilter(ids, exclude);
        return this.odataFilterFromToos(this.getFromToFilter(idsToFilter.sort((a, b) => a - b)), field, exclude);
    }

    public odataFilterFromToos(fromTos: IFromToFilter[], field: string, exclude?: boolean): string {
        return `(${fromTos
            .filter((fromTo, index, arr) => {
                if (!exclude) {
                    return true;
                }
                return index < (arr.length - 1);
            })
            .map(({from, to}) => from !== to
                    ? `${field} ge ${from} and ${field} le ${to}`
                    : `${field} eq ${from}`)
            .join(' or ')}` +
            `${exclude && fromTos.length ? `${fromTos.length > 1 ? ' or ' : ''}${field} ge ${fromTos[fromTos.length - 1].to}` : ''})`;
    }

    private getIdsToFilter(ids: number[], exclude: boolean): number[] {
        return [...(exclude ? this.getExcludes(ids) : ids)];
    }

    private getExcludes(ids: number[]) {
        const range = [];
        const max = ids.reduce((acc, curr) => acc < curr ? curr : acc) + 1;
        for (let i = 1; i <= max; i++ ) {
            range.push(i);
        }
        return range.filter(x => !ids.some(id => id === x));
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

    public idListString(idList: number[]) {
        let last: number;
        if (idList.length > 1) {
            last = idList.pop();
        }
        return `${idList.join(', ')}${last ? ` og ${last}` : ''}`;
    }
}
