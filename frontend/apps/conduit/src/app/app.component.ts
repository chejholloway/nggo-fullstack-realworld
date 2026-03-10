import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent, FooterComponent } from "@conduit/shared-ui-layout";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: "./app.component.html",
})
export class AppComponent {}
