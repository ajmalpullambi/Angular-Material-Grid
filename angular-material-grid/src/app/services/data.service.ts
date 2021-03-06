import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpParams, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GridService, GridState, GridData } from '@vguleaev/angular-material-grid';

@Injectable()
export class DataService implements GridService {
  private _productUrl = 'assets/json/data.json'; // fake

  constructor(private _http: HttpClient) {}

  fetch(params?: HttpParams): Observable<GridData> {
    const query = params.get('query');
    const state: GridState = JSON.parse(atob(query));

    return this._http.get<any[]>(this._productUrl, { params: params }).pipe(
      map(result => {
        let totalItemsCounter = result.length;

        if (state) {
          if (state.query) {
            result = result.filter(
              user =>
                (user.name && user.name.toLowerCase().indexOf(state.query.toLowerCase()) > -1) ||
                (user.username && user.username.toLowerCase().indexOf(state.query.toLowerCase()) > -1) ||
                (user.email && user.email.toLowerCase().indexOf(state.query.toLowerCase()) > -1)
            );
          }

          if (state.filters && state.filters.length > 0) {
            const positionFilter = state.filters.find(x => x.name === 'PositionFilter');

            if (positionFilter) {
              const selectedPositions = JSON.parse(positionFilter.value) as string[];
              result = result.filter(user => selectedPositions.some(position => user.title === position));
            }
          }

          totalItemsCounter = result.length;

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
            }
            if (state.orderBy.toLowerCase() === 'name') {
              result.sort((a, b) => {
                if (a.name < b.name) {
                  return -1;
                }
                if (a.name > b.name) {
                  return 1;
                }
                return 0;
              });
            }
            if (state.orderBy.toLowerCase() === 'username') {
              result.sort((a, b) => {
                if (a.username < b.username) {
                  return -1;
                }
                if (a.username > b.username) {
                  return 1;
                }
                return 0;
              });
            }
            if (state.orderBy.toLowerCase() === 'email') {
              result.sort((a, b) => {
                if (a.email < b.email) {
                  return -1;
                }
                if (a.email > b.email) {
                  return 1;
                }
                return 0;
              });
            }

            if (state.orderDirection === 'desc') {
              result.reverse();
            }
          }

          const startIndex = (state.page - 1) * state.pageSize;
          const endIndex = result.length - startIndex > state.pageSize ? state.pageSize * state.page : result.length;
          result = result.slice(startIndex, endIndex);
        }
        return { data: result, totalItems: totalItemsCounter };
      })
    );
  }
}
