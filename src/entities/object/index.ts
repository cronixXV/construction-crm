export type { IObject } from "./model/types/types";

export { useObjects, objectKeys } from "./api/use-objects";
export {
  getObjects,
  createObject,
  updateObject,
  deleteObject,
} from "./api/objects-api";
export { useObjectById } from "./api/use-object-by-id";

export { ObjectCard } from "./ui/object-card";
