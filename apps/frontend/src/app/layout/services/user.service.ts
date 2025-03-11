import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@frontend/environments';
import { UserResponse } from '@core/api-types';
import { RosterUser } from '@realworld/core/api-types/roster-user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.api_url;

  constructor(private http: HttpClient) {}

  getUser(username: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/profiles/${username}`);
  }

  getRosterUser(username: string): Observable<RosterUser> {
    return this.http.get<RosterUser>(`${this.apiUrl}/roster/${username}`);
  }
}


