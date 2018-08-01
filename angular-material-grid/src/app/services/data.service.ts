import { Observable } from 'rxjs';
import { delay, filter, map } from 'rxjs/operators';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractGridService } from '../grid/abstract-grid.service';
import { AotSummaryResolver } from '../../../node_modules/@angular/compiler';
import { GridState } from '../grid/grid-state';

@Injectable()
export class DataService implements AbstractGridService<any> {
    private _productUrl = 'assets/json/data.json'; // fake

    constructor(private _http: HttpClient) {}

    fetch(params?: HttpParams): Promise<any> {
        const query = params.get('query');
        const state: GridState = JSON.parse(atob(query));


        return this._http.get<any[]>(this._productUrl, {params: params}).pipe(
            map(result => {
                const totalItems = result.length;

                if (state) {
                    if (state.query) {
                        result = result.filter(x => x.name && x.name.toLowerCase().indexOf(state.query.toLowerCase()) > -1 ||
                                                  x.username && x.email.toLowerCase().indexOf(state.query.toLowerCase()) > -1 ||
                                                  x.email && x.email.toLowerCase().indexOf(state.query.toLowerCase()) > -1);
                    }
                    if (state.orderBy) {
                        if (state.orderBy.toLowerCase() === 'id') {
                            result.sort((a, b) => {
                                if (a.id < b.id) {
                                  return -1;
                                }
                                if (a.id > b.id) {
                                  return 1;
                                }
                                return 0;
                            });

                            if (state.orderDirection === 'desc') {
                                result.reverse();
                            }
                        }
                    }
                    const startIndex = (state.page - 1) * state.pageSize;
                    const endIndex = (result.length - startIndex) > state.pageSize ? state.pageSize : result.length;
                    result = result.slice(startIndex, endIndex);
                }
                return {data: result, totalItems: totalItems};
            }))
        .toPromise();
    }
}
