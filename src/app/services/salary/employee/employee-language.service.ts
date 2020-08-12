import { Injectable } from '@angular/core';
import { StatisticsService } from '@app/services/common/statisticsService';
import { map, tap } from 'rxjs/operators';
import { Observable, of, forkJoin } from 'rxjs';
export interface IEmployeeLanguage {
    ID: number;
    LanguageCode: string;
}
export interface ILanguageCode {
    Code: string;
    Name: string;
}
@Injectable()
export class EmployeeLanguageService {

    private languageCache: IEmployeeLanguage[];
    private languageCodeCache: ILanguageCode[];
    constructor(private statistics: StatisticsService) { }

    public getLanguageCodeTable(): Observable<ILanguageCode[]> {
        if (this.languageCodeCache) {
            return of(this.languageCodeCache);
        }
        return this.statistics
            .GetAllUnwrapped('Select=Code as Code,Name as Name&model=LanguageCode')
            .pipe(
                tap(codes => this.languageCodeCache = codes),
            );
    }

    public getAllEmployeeLanguagesWithNames(): Observable<{ID: number, Name: string}[]> {
        return forkJoin(this.getAll(), this.getLanguageCodeTable())
            .pipe(
                map(([languages, codes]) => languages
                        .map(lang => ({ID: lang.ID, Name: this.mapLanguageCodeToName(lang.LanguageCode, codes)}))
                        .filter(lang => !!lang.Name)
                ),
            );
    }

    public clearCache() {
        this.languageCache = null;
        this.languageCodeCache = null;
    }

    public getAll() {
        return !this.languageCache
            ? this.getAllAndCache()
            : of(this.languageCache);
    }

    private getAllAndCache(): Observable<IEmployeeLanguage[]> {
        return this.statistics
            .GetAllUnwrapped(`model=EmployeeLanguage&select=LanguageCode as LanguageCode,ID as ID`)
            .pipe(
                tap(languages => this.languageCache = languages),
            );
    }

    private mapLanguageCodeToName(languageCode: string, languageCodeTable: ILanguageCode[]): string {
        return languageCodeTable
            .find(c => c.Code === languageCode)
            ?.Name;
    }
}
