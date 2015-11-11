import {Component, CORE_DIRECTIVES, OnInit} from 'angular2/angular2';
import {Router} from 'angular2/router';
import {Hero} from '../hero/hero';
import {HeroService} from '../hero/hero.service';
import {Routes} from '../../route.config';

@Component({
  selector: 'my-dashboard',
  templateUrl: 'app/components/dashboard/dashboard.component.html',
  styleUrls: ['app/components/dashboard/dashboard.component.css'],
  directives: [CORE_DIRECTIVES]
})
export class DashboardComponent implements OnInit {
	public heroes: Hero[];

  constructor(private _heroService: HeroService, private _router: Router) { }

	onInit() {
    this.heroes = this.getHeroes();
  }

  gotoDetail(hero: Hero) {
    this._router.navigate([`/${Routes.detail.as}`, { id: hero.id }]);
  }

  getHeroes() {
    this.heroes = [];

    this._heroService.getHeroes()
      .then((heroes: Hero[]) => this.heroes = heroes);

    return this.heroes;
  }
}
