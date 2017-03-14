import {Injectable} from '@angular/core';
import {Language} from '../../../unientities';
import {BizHttp} from '../../../../framework/core/http/BizHttp';
import {UniHttp} from '../../../../framework/core/http/http';
import {AuthService} from '../../../../framework/core/authService';
import {AppConfig} from '../../../appConfig';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/toArray';

const calculatePercentage = (data) => {
    const obj = data.Data[0];
    let value: number = (obj.translated / obj.translatables) * 100;
    return value.toFixed(2);
};

@Injectable()
export class LanguageService extends BizHttp<Language> {

    constructor(protected http: UniHttp, protected authService?: AuthService) {
        super(http, authService);
        this.relativeURL = Language.RelativeUrl;
        this.entityType = Language.EntityType;
        this.DefaultOrderBy = 'ID';
    }

    public retrieve(query = '') {
        return this.GetAll(query)
            .switchMap((languages: Language[]) => Observable.from(languages))
            .mergeMap((language: Language) => this.getTranslatedPercent(language).map(data => {
                language['_translatedPercentage'] = calculatePercentage(data);
                return language;
            })).toArray();
    }

    public retrieveOne(id: number) {
        return this.Get(id);
    }

    public create(language: Language) {
        return this.GetNewEntity([], this.entityType)
            .map((newEntity: Language) => Object.assign({}, newEntity, {
                _createguid: this.getNewGuid()
            }))
            .map((newEntity: Language) => {
                const keys: string[] = Object.keys(language);
                keys.forEach(key => {
                    newEntity[key] = language[key];
                });
                return newEntity;
            })
            .switchMap((newEntity: Language) => this.Post(newEntity));
    }

    public update(language: Language) {
        return this.GetNewEntity([], this.entityType)
            .map((newEntity: Language) => {
                const keys: string[] = Object.keys(language);
                keys.forEach(key => {
                    newEntity[key] = language[key];
                });
                return newEntity;
            })
            .switchMap((newEntity: Language) => this.Put(newEntity.ID, newEntity));
    }

    public remove(language: Language) {
        return this.Remove(language.ID, language);
    }

    public getTranslatedPercent(language: Language) {
        const base = AppConfig.BASE_URL;
        const api = AppConfig.API_DOMAINS.STATISTICS;
        const endpoint = `?model=Translatable` +
            `&expand=Translations&select=count(id) as translatables` +
            `,sum(casewhen(Translations.LanguageID eq ${language.ID}\\,1\\,0)) as translated`;
        const url = [base, api, endpoint].join('');
        return this.http.asGET().sendToUrl(url);
    }
}

