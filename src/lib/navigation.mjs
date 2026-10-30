/** @typedef {"studios" | "applications" | "settings"} PageId */
export const NAV_ITEMS=[
 {id:"studios",label:"Studios",icon:"studios",description:"Find studios that explicitly accept speculative applications."},
 {id:"applications",label:"Applications",icon:"applications",description:"Track the applications you submit yourself."},
 {id:"settings",label:"Settings",icon:"settings",description:"Back up, lock or delete your private tracker."}
];
/** @param {string} pageId */
export function getNavItem(pageId){return NAV_ITEMS.find(item=>item.id===pageId)??NAV_ITEMS[0];}
