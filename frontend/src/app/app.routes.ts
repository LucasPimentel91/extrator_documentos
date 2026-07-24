import { type Routes } from "@angular/router";

import { UploadPageComponent } from "./features/upload/upload-page.component";

export const routes: Routes = [
  {
    path: "upload",
    component: UploadPageComponent,
    title: "Enviar documento",
  },
  {
    path: "resultado",
    loadComponent: () =>
      import("./features/result/result-page.component").then(
        (module) => module.ResultPageComponent,
      ),
    title: "Resultado da análise",
  },
  {
    path: "",
    pathMatch: "full",
    redirectTo: "upload",
  },
  {
    path: "**",
    redirectTo: "upload",
  },
];
