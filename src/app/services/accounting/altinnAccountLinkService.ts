import {Injectable} from '@angular/core';
import {BizHttp, UniHttp} from '@uni-framework/core/http';
import {StatisticsService} from '@app/services/common/statisticsService';
import {Account} from '@uni-entities';


export interface AltinnAccountLink {
    _createguid?: string;
    ID?: number;
    AltinnAccountNumber: number;
    AccountNumber: number;
}

@Injectable()
export class AltinnAccountLinkService extends BizHttp<AltinnAccountLink> {

    constructor(http: UniHttp, private statisticsService: StatisticsService) {
        super(http);
        this.relativeURL = 'AltinnAccountLinks';
        this.entityType = 'AltinnAccountLink';
        this.DefaultOrderBy = 'AccountNumber';
    }

    getByAccountNumber(accountNumber: number) {
        return this.GetOneByQuery('filter=AccountNumber eq ' + accountNumber);
    }

    save(altinnAccountLink: AltinnAccountLink) {
        const source = altinnAccountLink.ID ? this.Put(altinnAccountLink.ID, altinnAccountLink) : this.Post(altinnAccountLink);
        return source;
    }
}
