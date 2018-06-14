import {Injectable} from '@angular/core';
import {ReplaySubject} from 'rxjs/ReplaySubject';

export interface IUniPageCache {
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
    [key: string]: IUniPageCache;
}

@Injectable()
export class UniCacheService {
    private store: ICacheStore = {};

    private initPageCache(url): IUniPageCache {
        this.store[url] = {
            isDirty: false,
            state: {}
        };

        return this.store[url];
    }

    public getPageCache(url): IUniPageCache {
        return this.store[url] || this.initPageCache(url);
    }

    public updatePageCache(url: string, entry: IUniPageCache): void {

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

        this.store[url] = entry;
    }

    public clearPageCache(url): void {
        delete this.store[url];
    }

}
