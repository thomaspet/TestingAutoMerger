import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';

export interface IUniCacheEntry {
    isDirty?: boolean;
    updatedAt?: Date;
    state: {
        [key: string]: {
            isDirty?: boolean;
            updatedAt?: Date;
            subject: ReplaySubject<any>
        }
    };
}

interface ICacheStore {
    [key: string]: IUniCacheEntry;
}

@Injectable()
export class UniCacheService {
    private store: ICacheStore = {};

    public initCacheEntry(path): IUniCacheEntry {
        this.store[path] = {
            isDirty: false,
            state: {}
        };

        return this.store[path];
    }

    public getCacheEntry(path): IUniCacheEntry{
        return this.store[path];
    }

    public updateCacheEntry(path: string, entry: IUniCacheEntry): void {

        if (!entry.updatedAt) {
            entry.updatedAt = new Date();
        }

        let elements = entry.state;
        entry.isDirty = false;
        Object.keys(elements).forEach((key) => {
            if (elements[key].isDirty) {
                entry.isDirty = true;
            }
        });

        this.store[path] = entry;
    }

    public clearCacheEntry(path): void {
        delete this.store[path];
    }

}
