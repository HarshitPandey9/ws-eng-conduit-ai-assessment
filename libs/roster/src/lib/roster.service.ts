import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@frontend/environments';
import { RosterUser } from '@realworld/core/api-types/roster-user';

@Injectable({
  providedIn: 'root',
})
export class RosterService {
  private apiUrl = `${environment.api_url}/roster`;

  constructor(private http: HttpClient) {}

  getRoster(): Observable<RosterUser[]> {
    return this.http.get<RosterUser[]>(this.apiUrl);
  }
}
