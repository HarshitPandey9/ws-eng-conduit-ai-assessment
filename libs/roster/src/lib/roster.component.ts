import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RosterService } from '@realworld/roster/service';
import { RosterUser } from '@realworld/core/api-types/roster-user';

@Component({
  selector: 'realworld-roster',
  templateUrl: './roster.component.html',
  styleUrls: ['./roster.component.scss'],
  standalone: true,
  imports: [CommonModule],
  providers: [RosterService],
})
export class RosterComponent implements OnInit {
  rosterUsers: RosterUser[] = [];

  constructor(private rosterService: RosterService) {}

  ngOnInit(): void {
    this.loadRoster();
  }

  private loadRoster(): void {
    this.rosterService.getRoster().subscribe({
      next: (users) => (this.rosterUsers = users),
      error: (err) => console.error('Failed to load roster:', err),
    });
  }
}

