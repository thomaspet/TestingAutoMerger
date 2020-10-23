import {Injectable} from '@angular/core';
import {BizHttp} from '../../../framework/core/http/BizHttp';
import {JournalEntryLineDraft} from '../../unientities';
import {UniHttp} from '../../../framework/core/http/http';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { JournalEntryTypes } from './journal-entry-type.service';


@Injectable()
export class JournalEntryLineDraftService extends BizHttp<JournalEntryLineDraft> {

    constructor(http: UniHttp) {
        super(http);

        //TODO: should resolve this from configuration based on type (IVatType)? Frank is working on something..
        this.relativeURL = JournalEntryLineDraft.RelativeUrl;

        this.entityType = JournalEntryLineDraft.EntityType;

        //set this property if you want a default sort order from the API
        this.DefaultOrderBy = null;

        // caching journalentrylinedraft requests can caused undesired effects, so diable it
        super.disableCache();
    }

    public getNewestFromTypes(types: JournalEntryTypes[]): Observable<JournalEntryLineDraft> {
        if (!types?.length) {
            return of(null);
        }
        return super.GetAll(
                `filter=${types.map(type => `JournalEntryTypeID eq ${type}`).join(' or ')}` +
                `&orderby=CreatedAt desc` +
                `&top=1`
            )
            .pipe(
                map(lines => lines[0]),
            );
    }
}
