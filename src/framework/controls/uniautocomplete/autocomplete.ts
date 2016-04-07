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
        label: 'ATC-nivå',
        displayKey: 'atcnivanavn'
    };

    // State vars
    private guid: string;
    private isExpanded: boolean = false;
    private selected: any;
    private results: string[];
    private query: string;
    private dummyData: any[] = [{"atcnivanavn":"Fordøyelsesorganer og stoffskifte","atckode":"A"},{"atcnivanavn":"Munn- og tannmidler","atckode":"A01"},{"atcnivanavn":"Munn- og tannmidler","atckode":"A01A"},{"atcnivanavn":"Midler mot karies","atckode":"A01AA"},{"atcnivanavn":"natriumfluorid","atckode":"A01AA01"},{"atcnivanavn":"natriummonofluorofosfat","atckode":"A01AA02"},{"atcnivanavn":"oaflur","atckode":"A01AA03"},{"atcnivanavn":"tinnfluorid","atckode":"A01AA04"},{"atcnivanavn":"kombinasjoner","atckode":"A01AA30"},{"atcnivanavn":"natriumfluorid, kombinasjoner","atckode":"A01AA51"},{"atcnivanavn":"Antiinfektiva og antiseptika til lokal behandling i munnen","atckode":"A01AB"},{"atcnivanavn":"hydrogenperoksid","atckode":"A01AB02"},{"atcnivanavn":"klorheksidin","atckode":"A01AB03"},{"atcnivanavn":"amfotericin B","atckode":"A01AB04"},{"atcnivanavn":"polynoksylin","atckode":"A01AB05"},{"atcnivanavn":"domifen","atckode":"A01AB06"},{"atcnivanavn":"oksykinolin","atckode":"A01AB07"},{"atcnivanavn":"neomycin","atckode":"A01AB08"},{"atcnivanavn":"mikonazol","atckode":"A01AB09"},{"atcnivanavn":"natamycin","atckode":"A01AB10"},{"atcnivanavn":"diverse","atckode":"A01AB11"},{"atcnivanavn":"heksetidin","atckode":"A01AB12"},{"atcnivanavn":"tetracyklin","atckode":"A01AB13"},{"atcnivanavn":"benzoksoniumklorid","atckode":"A01AB14"},{"atcnivanavn":"tibezoniumjodid","atckode":"A01AB15"},{"atcnivanavn":"mepartricin","atckode":"A01AB16"},{"atcnivanavn":"metronidazol","atckode":"A01AB17"},{"atcnivanavn":"klotrimazol","atckode":"A01AB18"},{"atcnivanavn":"natriumperborat","atckode":"A01AB19"},{"atcnivanavn":"kortetracyklin","atckode":"A01AB21"},{"atcnivanavn":"doksycyklin","atckode":"A01AB22"},{"atcnivanavn":"minocyklin","atckode":"A01AB23"},{"atcnivanavn":"Kortikosteroider til lokal behandling i munnen","atckode":"A01AC"},{"atcnivanavn":"triamcinolon","atckode":"A01AC01"},{"atcnivanavn":"dexametason","atckode":"A01AC02"},{"atcnivanavn":"hydrokortison","atckode":"A01AC03"},{"atcnivanavn":"prednisolon, kombinasjoner","atckode":"A01AC54"},{"atcnivanavn":"Andre midler til lokal behandling i munnen","atckode":"A01AD"},{"atcnivanavn":"adrenalin","atckode":"A01AD01"},{"atcnivanavn":"benzydamin","atckode":"A01AD02"},{"atcnivanavn":"acetylsalisylsyre","atckode":"A01AD05"},{"atcnivanavn":"adrenalon","atckode":"A01AD06"},{"atcnivanavn":"amlexanox","atckode":"A01AD07"},{"atcnivanavn":"bekaplermin","atckode":"A01AD08"},{"atcnivanavn":"diverse","atckode":"A01AD11"},{"atcnivanavn":"Midler mot syrerelaterte lidelser","atckode":"A02"},{"atcnivanavn":"Antacida","atckode":"A02A"},{"atcnivanavn":"Magnesiumforbindelser","atckode":"A02AA"},{"atcnivanavn":"magnesiumkarbonat","atckode":"A02AA01"},{"atcnivanavn":"magnesiumoksid","atckode":"A02AA02"},{"atcnivanavn":"magnesiumperoksid","atckode":"A02AA03"},{"atcnivanavn":"magnesiumhydroksid","atckode":"A02AA04"},{"atcnivanavn":"magnesiumsilikat","atckode":"A02AA05"},{"atcnivanavn":"kombinasjoner","atckode":"A02AA10"},{"atcnivanavn":"Aluminiumforbindelser","atckode":"A02AB"},{"atcnivanavn":"aluminiumhydroksid","atckode":"A02AB01"},{"atcnivanavn":"algeldrat","atckode":"A02AB02"},{"atcnivanavn":"aluminiumfosfat","atckode":"A02AB03"},{"atcnivanavn":"dihydroksyaluminium natriumkarbonat","atckode":"A02AB04"},{"atcnivanavn":"aluminiumacetoacetat","atckode":"A02AB05"},{"atcnivanavn":"aloglutamol","atckode":"A02AB06"},{"atcnivanavn":"aluminiumglysinat","atckode":"A02AB07"},{"atcnivanavn":"kombinasjoner","atckode":"A02AB10"},{"atcnivanavn":"kalsiumforbindelser","atckode":"A02AC"},{"atcnivanavn":"kalsiumkarbonat","atckode":"A02AC01"},{"atcnivanavn":"kalsiumsilikat","atckode":"A02AC02"},{"atcnivanavn":"kombinasjoner","atckode":"A02AC10"},{"atcnivanavn":"Kombinasjoner og komplekser av aluminium, kalsium og magnesium forbindelser","atckode":"A02AD"},{"atcnivanavn":"ordinære saltkombinasjoner","atckode":"A02AD01"},{"atcnivanavn":"magaldrat","atckode":"A02AD02"},{"atcnivanavn":"almagat","atckode":"A02AD03"},{"atcnivanavn":"hydrotalcit","atckode":"A02AD04"},{"atcnivanavn":"almasilat","atckode":"A02AD05"},{"atcnivanavn":"Kombinasjoner av antacida og midler mot flatulens","atckode":"A02AF"},{"atcnivanavn":"magaldrat og midler mot flatulens","atckode":"A02AF01"},{"atcnivanavn":"ordinære saltkombinasjoner og midler mot flatulens","atckode":"A02AF02"},{"atcnivanavn":"Antacida i kombinasjon med spasmolytika","atckode":"A02AG"},{"atcnivanavn":"Antacida med natriumhydrogenkarbonat","atckode":"A02AH"},{"atcnivanavn":"Antacida, andre kombinasjoner","atckode":"A02AX"},{"atcnivanavn":"Midler mot ulcus og gastroøsofageal reflukssykdom (GORD)","atckode":"A02B"},{"atcnivanavn":"H2-reseptorantagonister","atckode":"A02BA"},{"atcnivanavn":"cimetidin","atckode":"A02BA01"},{"atcnivanavn":"ranitidin","atckode":"A02BA02"},{"atcnivanavn":"famotidin","atckode":"A02BA03"},{"atcnivanavn":"nizatidin","atckode":"A02BA04"},{"atcnivanavn":"niperotidin","atckode":"A02BA05"},{"atcnivanavn":"roxatidin","atckode":"A02BA06"},{"atcnivanavn":"ranitidinvismutsitrat","atckode":"A02BA07"},{"atcnivanavn":"lafutidin","atckode":"A02BA08"},{"atcnivanavn":"cimetidin, kombinasjoner","atckode":"A02BA51"},{"atcnivanavn":"famotidin, kombinasjoner","atckode":"A02BA53"},{"atcnivanavn":"Prostaglandiner","atckode":"A02BB"},{"atcnivanavn":"misoprostol","atckode":"A02BB01"},{"atcnivanavn":"enprostil","atckode":"A02BB02"},{"atcnivanavn":"Protonpumpehemmere","atckode":"A02BC"},{"atcnivanavn":"omeprazol","atckode":"A02BC01"},{"atcnivanavn":"pantoprazol","atckode":"A02BC02"},{"atcnivanavn":"lansoprazol","atckode":"A02BC03"},{"atcnivanavn":"rabeprazol","atckode":"A02BC04"},{"atcnivanavn":"esomeprazol","atckode":"A02BC05"}];

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
        let containsString = (str: string) => {
            return str[this.config.displayKey].toLowerCase().indexOf(query.toLowerCase()) >= 0;
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

        if(item){
            this.query = item[this.config.displayKey];
            this.value = item[this.config.displayKey];
        }else{
            this.query = '';
            this.value = undefined;
        }
    }

}

