/**
 * A project hours are logged against (Req 4, Feature F).
 * The non-SR&ED bucket ("Unclaimed Work") has `isSred: false`.
 */
export interface Project {
  id: string;
  name: string; // "Rendering System", "Unclaimed Work" ...
  color: string; // hex, for consistent chart colors
  isSred: boolean;
}
