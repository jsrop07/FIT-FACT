import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { SearchResults } from "./pages/SearchResults";
import { OutfitBuilder } from "./pages/OutfitBuilder";
import { OwnedClothesUpload } from "./pages/OwnedClothesUpload";
import { BodyProfile } from "./pages/BodyProfile";
import { Comparison } from "./pages/Comparison";
import { Curation } from "./pages/Curation";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/curation",
    Component: Curation,
  },
  {
    path: "/search",
    Component: SearchResults,
  },
  {
    path: "/outfit-builder",
    Component: OutfitBuilder,
  },
  {
    path: "/upload-clothes",
    Component: OwnedClothesUpload,
  },
  {
    path: "/body-profile",
    Component: BodyProfile,
  },

  {
    path: "/comparison",
    Component: Comparison,
  },
]);
