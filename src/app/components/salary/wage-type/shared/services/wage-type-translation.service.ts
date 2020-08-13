import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IEmployeeLanguage, EmployeeLanguageService } from '@app/services/services';
import { map, switchMap } from 'rxjs/operators';
import { BizHttp, UniHttp } from '@uni-framework/core/http';

export class WageTypeTranslationDto {
    public static RelativeUrl = 'wagetypetranslations';
    public static EntityType = 'WageTypeTranslation';
    ID?: number;
    WageTypeNumber: number;
    WageTypeName?: string;
    EmployeeLanguageID: number;
    EmployeeLanguage?: IEmployeeLanguage;
}
const STANDARD_LANGUAGE = 'nb';
@Injectable()
export class WageTypeTranslationService extends BizHttp<WageTypeTranslationDto> {

    constructor(
        private employeeLanguageService: EmployeeLanguageService,
        protected http: UniHttp,
    ) {
        super(http);
        super.entityType = WageTypeTranslationDto.EntityType;
        super.relativeURL = WageTypeTranslationDto.RelativeUrl;
    }
    public save(translation: WageTypeTranslationDto): Observable<WageTypeTranslationDto> {
        return translation.ID
            ? super.Put(translation.ID, translation)
            : super.Post(translation);
    }
    public getTranslationForNumber(number: number, languageCode: string = STANDARD_LANGUAGE): Observable<WageTypeTranslationDto> {
        if (!number) {
            return this.getNewTranslation(number, languageCode);
        }
        return super.GetAll('', ['EmployeeLanguage'])
            .pipe(
                map(translations => translations
                    .find(t =>
                        t.WageTypeNumber === number
                        && t.EmployeeLanguage?.LanguageCode === languageCode
                    )
                ),
                switchMap(translation => translation
                    ? of(translation)
                    : this.getNewTranslation(number, languageCode)),
            );
    }

    private getNewTranslation(number: number, languageCode: string): Observable<WageTypeTranslationDto> {
        return this.employeeLanguageService
            .getAll()
            .pipe(
                map(languages => ({
                    WageTypeNumber: number,
                    EmployeeLanguageID: languages.find(l => l.LanguageCode === languageCode)?.ID,
                })),
            );
    }

    public clearCache() {
        super.invalidateCache();
        this.employeeLanguageService.clearCache();
    }
}
