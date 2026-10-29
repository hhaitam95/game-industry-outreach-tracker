/** @type {Readonly<{ roleExplorer: boolean }>} */
export const FEATURES = Object.freeze({
  roleExplorer: false,
});

/** @param {{ roleExplorer?: boolean }} [features] */
export function isRoleExplorerEnabled(features = FEATURES) {
  return features.roleExplorer === true;
}
