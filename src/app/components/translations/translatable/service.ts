import {Injectable} from '@angular/core';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {Translatable} from '../../../unientities';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../../framework/core/authService';

@Injectable()
export class TranslatableService extends BizHttp<Translatable> {

    constructor(protected http: UniHttp, protected authService?: AuthService) {
        super(http, authService);
        this.relativeURL = Translatable.RelativeUrl;
        this.entityType = Translatable.EntityType;
        this.DefaultOrderBy = 'ID';
    }

    public retrieve(languageID: number) {
        const query = 'expand=Translations&filter=Translations.LanguageID eq ' + languageID +
            ' or Translations.ID eq null';
        return this.GetAll(query);
    }
}
