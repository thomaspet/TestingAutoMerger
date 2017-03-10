import {Injectable} from '@angular/core';
import {Translation} from '../../../unientities';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../../framework/core/authService';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

@Injectable()
export class TranslationService extends BizHttp<Translation> {

    constructor(protected http: UniHttp, protected authService?: AuthService) {
        super(http, authService);
        this.relativeURL = Translation.RelativeUrl;
        this.entityType = Translation.EntityType;
        this.DefaultOrderBy = 'ID';
    }

    public retrieveOne(languageID: number, translatableID: number) {
        const query = `filter=LanguageID eq ${languageID} and TranslatableID eq ${translatableID}`;
        return this.GetAll(query)
            .switchMap((translations: Translation[]) => {
                if (translations && translations.length > 0) {
                    return Observable.of(translations[0]);
                } else {
                    return this.GetNewEntity();
                }
            })
            .map((translation: Translation) => {
                if (translation.ID === 0) {
                    translation['_createguid'] = this.getNewGuid();
                }
                return translation;
            });
    }

    public create(translation: Translation) {
        return this.Post(translation);
    }

    public update(translation: Translation) {
        return this.Put(translation.ID, translation);
    }

}

