import {Injectable} from '@angular/core';

export interface IUniCacheEntry {
    isDirty?: boolean;
    updatedAt?: Date;
    state: {
        [key: string]: {
            isDirty?: boolean;
            // isValid?: boolean;
            updatedAt?: Date;
            data: any
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


/*

[
    {
        "Path":"/employee/1",
        "IsDirty": true,
        "UpdatedAt: ...,
        "CachedElements": {
            "Employee" <cachedelement>: {
                "IsDirty": true,
                "IsValid": true,
                "UpdatedAt: ...,
                "Data"<any>: {}/[]
            },

            "Employments" <cachedelement>: {
                "IsDirty": true,
                "IsValid": true,
                "UpdatedAt: ...,
                "Data"<any>: {}/[]
                },
                "ViewState" <cachedelement>: {
                    "IsDirty": true,
                    "IsValid": true,
                    "UpdatedAt: ...,
                    "Data"<any>: {
                        "SelectedEmploymentID": "5"
                    }
                }
            }
        }
    }
]


Cacheservice:
- Enkel måte å oppdatere/hente data basert på route
- Pushe til sessionStorage?
- Clear (lukking av view)

Utfordringer:
- Childroutes - får de tilgang til parenten sin route? Kan den emitte eventer til parent om endringer?
- F5 - hva gjør den? Clearer data? Ønskelig? Umulig å refreshe ellers..

Muligheter:
- Vise "*" i tab-bar (ulagrede endringer)
- Kontroll på _hva_ som er endret


Hva skal gjøres i følgende tilfeller?
- Brukeren åpner /employees/1/employments, men har ikke gjort endringer enda
    * Parent "registrerer" seg på cache tabellen med path, isDirty = false
    * Child henter data og lagrer det på cachen med isDirty = false

- Brukeren gjør endringer og bytter view
    * Child oppdaterer data i cache og setter dirty til true. Dette propagerer opp til toppnivå i cache entry, som også får dirty satt til true

- Brukeren går tilbake til viewet
    * Child henter data fra cache istedenfor api

- Brukeren lukker fanen som hører til viewet fra et annet view, og velger "lagre" i unsaved changes dialogen.
    * Vi åpner viewet og viser umiddelbart en dialog om ulagrede endringer
      (grunnen til at vi åpner viewet er at vi trenger save funksjonen som ligger her)
    * Problem: hvordan vet vi hvilket child view vi skal gå til?
      Dersom de ulagrede endringene ligger på /employees/1/employments bør vi gå her for å vise dialogen,
      ikke til /employees/1/personal-details?

      I dette tilfellet kan path + key i cachedElements utgjøre full path. Hva med f.eks /invoices/1, som ikke har noen child?
      Hvor går vi dersom det er ulagrede endringer i flere child views?

      Enkel løsning: Bare gå til default child på path. Se heller på mulighet for å indikere hvor endringen ligger i tabstripen for child views.
*/


