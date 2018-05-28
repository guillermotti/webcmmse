import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
const store = require('store');
const MINUTES_UNTIL_AUTO_LOGOUT = 30; // in mins
const CHECK_INTERVAL = 1000; // in ms
const STORE_KEY = 'lastAction';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    year = new Date().getFullYear();
    constructor(private router: Router) {
        this.check();
        this.initListener();
        this.initInterval();
    }

    ngOnInit() {
        this.router.events.subscribe((evt) => {
            if (!(evt instanceof NavigationEnd)) {
                return;
            }
            window.scrollTo(0, 0);
        });
    }

    get lastAction() {
        return parseInt(store.get(STORE_KEY), 10);
    }
    set lastAction(value) {
        store.set(STORE_KEY, value);
    }

    initListener() {
        document.body.addEventListener('click', () => this.reset());
    }

    reset() {
        this.lastAction = Date.now();
    }

    initInterval() {
        setInterval(() => {
            this.check();
        }, CHECK_INTERVAL);
    }

    check() {
        const now = Date.now();
        const timeleft = this.lastAction + MINUTES_UNTIL_AUTO_LOGOUT * 60 * 1000;
        const diff = timeleft - now;
        const isTimeout = diff < 0;

        if (isTimeout) {
            window.sessionStorage.clear();
            this.router.navigate(['login']);
        }
    }
}
