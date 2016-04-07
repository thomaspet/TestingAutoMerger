import {Component, ElementRef} from 'angular2/core';
import {Observable} from 'rxjs/Observable';
import guid = kendo.guid;

declare var jQuery;

@Component({
    selector: 'autocomplete',
    templateUrl: 'framework/controls/uniautocomplete/uni-autocomplete.html'
})

export class Autocomplete {

    public value: string;
    private config: any = {
        label: 'Fruits'
    };

    // State vars
    private guid: string;
    private isExpanded: boolean = false;
    private selected: any;
    private results: string[];
    private query: string;

    // Dummy data, to simulate server results
    private dummyData: string[] = ['Halden', 'Moss', 'Sarpsborg', 'Fredrikstad', 'Hvaler',
    'Aremark', 'Marker', 'Rømskog', 'Trøgstad', 'Spydeberg', 'Askim', 'Eidsberg', 'Skiptvet',
    'Rakkestad', 'Råde', 'Rygge', 'Hobøl', 'Vestby', 'Ski', 'Ås', 'Frogn', 'Nesodden',
    'Oppegård', 'Bærum', 'Asker', 'Aurskog-Høland', 'Sørum', 'Fet', 'Rælingen', 'Enebakk',
    'Lørenskog', 'Skedsmo', 'Nittedal', 'Gjerdrum', 'Ullensaker', 'Nes', 'Eidsvoll',
    'Nannestad', 'Hurdal', 'Oslo', 'Kongsvinger', 'Hamar', 'Ringsaker', 'Løten', 'Stange',
    'Nord-Odal', 'Sør-Odal', 'Eidskog', 'Grue', 'Åsnes', 'Våler', 'Elverum', 'Trysil', 'Åmot',
    'Stor-Elvdal', 'Rendalen', 'Engerdal', 'Tolga', 'Tynset', 'Alvdal', 'Folldal', 'Os',
    'Lillehammer', 'Gjøvik', 'Dovre', 'Lesja', 'Skjåk', 'Lom', 'Vågå', 'Nord-Fron', 'Sel',
    'Sør-Fron', 'Ringebu', 'Øyer', 'Gausdal', 'Østre Toten', 'Vestre Toten', 'Jevnaker',
    'Lunner', 'Gran', 'Søndre Land', 'Nordre Land', 'Sør-Aurdal', 'Etnedal', 'Nord-Aurdal',
    'Vestre Slidre', 'Øystre Slidre', 'Vang', 'Drammen', 'Kongsberg', 'Ringerike', 'Hole',
    'Flå', 'Nes', 'Gol', 'Hemsedal', 'Ål', 'Hol', 'Sigdal', 'Krødsherad', 'Modum',
    'Øvre Eiker', 'Nedre Eiker', 'Lier', 'Røyken', 'Hurum', 'Flesberg', 'Rollag',
    'Nore og Uvdal', 'Horten', 'Holmestrand', 'Tønsberg', 'Sandefjord', 'Larvik', 'Svelvik',
    'Sande', 'Hof', 'Re', 'Andebu', 'Stokke', 'Nøtterøy', 'Tjøme', 'Lardal', 'Porsgrunn',
    'Skien', 'Notodden', 'Siljan', 'Bamble', 'Kragerø', 'Drangedal', 'Nome', 'Bø', 'Sauherad',
    'Tinn', 'Hjartdal', 'Seljord', 'Kviteseid', 'Nissedal', 'Fyresdal', 'Tokke', 'Vinje',
    'Risør', 'Grimstad', 'Arendal', 'Gjerstad', 'Vegårshei', 'Tvedestrand', 'Froland',
    'Lillesand', 'Birkenes', 'Åmli', 'Iveland', 'Evje og Hornnes', 'Bygland', 'Valle',
    'Bykle', 'Kristiansand', 'Mandal', 'Farsund', 'Flekkefjord', 'Vennesla', 'Songdalen',
    'Søgne', 'Marnardal', 'Åseral', 'Audnedal', 'Lindesnes', 'Lyngdal', 'Hægebostad',
    'Kvinesdal', 'Sirdal', 'Eigersund', 'Sandnes', 'Stavanger', 'Haugesund', 'Sokndal',
    'Lund', 'Bjerkreim', 'Hå', 'Klepp', 'Time', 'Gjesdal', 'Sola', 'Randaberg', 'Forsand',
    'Strand', 'Hjelmeland', 'Suldal', 'Sauda', 'Finnøy', 'Rennesøy', 'Kvitsøy', 'Bokn',
    'Tysvær', 'Karmøy', 'Utsira', 'Vindafjord', 'Bergen', 'Etne', 'Sveio', 'Bømlo', 'Stord',
    'Fitjar', 'Tysnes', 'Kvinnherad', 'Jondal', 'Odda', 'Ullensvang', 'Eidfjord', 'Ulvik',
    'Granvin', 'Voss', 'Kvam', 'Fusa', 'Samnanger', 'Os', 'Austevoll', 'Sund', 'Fjell',
    'Askøy', 'Vaksdal', 'Modalen', 'Osterøy', 'Meland', 'Øygarden', 'Radøy', 'Lindås',
    'Austrheim', 'Fedje', 'Masfjorden', 'Flora', 'Gulen', 'Solund', 'Hyllestad', 'Høyanger',
    'Vik', 'Balestrand', 'Leikanger', 'Sogndal', 'Aurland', 'Lærdal', 'Årdal', 'Luster',
    'Askvoll', 'Fjaler', 'Gaular', 'Jølster', 'Førde', 'Naustdal', 'Bremanger', 'Vågsøy',
    'Selje', 'Eid', 'Hornindal', 'Gloppen', 'Stryn', 'Molde', 'Ålesund', 'Kristiansund',
    'Vanylven', 'Herøy', 'Ulstein', 'Hareid', 'Volda', 'Ørsta', 'Ørskog', 'Norddal',
    'Stranda', 'Stordal', 'Sykkylven', 'Skodje', 'Sula', 'Giske', 'Haram', 'Vestnes', 'Rauma',
    'Nesset', 'Midsund', 'Sandøy', 'Aukra', 'Fræna', 'Eide', 'Averøy', 'Gjemnes', 'Tingvoll',
    'Sunndal', 'Surnadal', 'Rindal', 'Halsa', 'Smøla', 'Aure', 'Trondheim', 'Hemne',
    'Snillfjord', 'Hitra', 'Frøya', 'Ørland', 'Agdenes', 'Rissa', 'Bjugn', 'Åfjord',
    'Roan', 'Osen', 'Oppdal', 'Rennebu', 'Meldal', 'Orkdal', 'Røros', 'Holtålen',
    'Midtre Gauldal', 'Melhus', 'Skaun', 'Klæbu', 'Malvik', 'Selbu', 'Tydal', 'Steinkjer',
    'Namsos', 'Meråker', 'Stjørdal', 'Frosta', 'Leksvik', 'Levanger', 'Verdal', 'Verran',
    'Namdalseid', 'Snåsa', 'Lierne', 'Raarvihke Røyrvik'];

    constructor(el: ElementRef) {
        // Set a guid to use in DOM IDs etc.
        this.guid = guid();

        // Add event listeners for dismissing the dropdown
        let $el = jQuery(el.nativeElement);
        document.addEventListener('click', (event) => {
            if (!jQuery(event.target).closest($el).length) {
                this.isExpanded = false;
            }
        });
        document.addEventListener('keyup', (event) => {
            // Escape to dismiss
            if (event.keyCode === 27){
                this.isExpanded = false;
            }
        });

        // And for navigating within the dropdown
        el.nativeElement.addEventListener('keyup', (event) => {
            if (event.keyCode === 38) {
                // Arrow up
                this.moveSelection(-1);
            }else if (event.keyCode === 40) {
                // Arrow down
                this.moveSelection(1);
            }else if (event.keyCode === 13 ||
                      event.keyCode === 9) {
                // Enter or tab
                this.choose(this.selected);
            }
        });

    }

    // Replace this with the call to server
    private search(query: string) {
        let containsString = function (str: string) {
            return str.toLowerCase().indexOf(query.toLowerCase()) >= 0;
        };
        return Observable.fromArray(this.dummyData.filter(containsString));
    }

    // The UI handler for searching
    private searchHandler(query: string) {
        this.results = [];

        // Clean up if the search is cleared out
        if(!query){
            this.isExpanded = false;
            this.selected = undefined;
            return;
        }

        // Kick off the search function
        this.search(query).subscribe(
            (result) => {
                this.results.push(result);
                this.isExpanded = true;
            },
            (err) => {
                console.error(err);
            }
        );
    }

    // Keyboard navigation within list
    private moveSelection(moveBy){
        // If we have no results to traverse, return out
        if (!this.results) { return; }

        // If we have no current selection
        if(!this.selected && moveBy >= 0){
            // If we move down without a selection, start at the top
            return this.selected = this.results[0];
        }else if(!this.selected && moveBy < 0){
            // If we move up without a selection, start at the bottom
            return this.selected = this.results[this.results.length - 1];
        }

        // If we have a selection already
        let currentIndex = this.results.indexOf(this.selected);

        if (currentIndex < 0 ||
            currentIndex + moveBy >= this.results.length) {
            // If the selected result is no longer a result, or if we wrap around,
            // then we go to the first item
            this.selected = this.results[0];
        }else if (currentIndex + moveBy < 0) {
            // Wrap around the other way
            this.selected = this.results[this.results.length - 1];
        }else{
            this.selected = this.results[currentIndex + moveBy];
        }
    }

    // Make a selection
    private choose(item) {
        this.isExpanded = false;
        this.query = item || '';
        this.value = item;
    }

}
