'use client';
import type { NavItem, NavGroup } from '@/types';

function hasAccess(item: NavItem) {
  if (item.access?.requireOrg) {
    return false;
  }

  return true;
}

function filterItem(item: NavItem): NavItem | null {
  if (!hasAccess(item)) {
    return null;
  }

  if (!item.items?.length) {
    return item;
  }

  return {
    ...item,
    items: item.items.map(filterItem).filter((child): child is NavItem => child !== null)
  };
}

export function useFilteredNavItems(items: NavItem[]) {
  return items.map(filterItem).filter((item): item is NavItem => item !== null);
}
export function useFilteredNavGroups(groups: NavGroup[]) {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.map(filterItem).filter((item): item is NavItem => item !== null)
    }))
    .filter((group) => group.items.length > 0);
}
