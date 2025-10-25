import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RepoItem, RepositoriosService } from '../../services/repositorios/service';


@Component({
  selector: 'app-repositorios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repositorios.component.html',
  styleUrls: ['./repositorios.component.scss']
})
export class RepositoriosComponent implements OnInit {
  repositorios: RepoItem[] = [];
  defaultUrl = 'https://github.com/CharlyTlelo/ABC_EXPREZO-Frontend';

  constructor(private api: RepositoriosService) {}
  ngOnInit(): void { this.api.list().subscribe(d => this.repositorios = d); }

  href(repo: RepoItem){ return repo.url && repo.url.trim() ? repo.url : this.defaultUrl; }
}
