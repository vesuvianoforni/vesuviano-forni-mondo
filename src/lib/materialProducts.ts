export interface MaterialProduct { id: string; name: string }
export interface MaterialProductLink { product_id: string; products?: MaterialProduct | null }
export interface LinkedMaterial {
  product_id: string | null;
  products?: { name: string } | null | undefined;
  product_asset_links?: MaterialProductLink[] | undefined;
}

export function materialProductIds(material: LinkedMaterial): string[] {
  return [...new Set([...(material.product_asset_links ?? []).map((link) => link.product_id), ...(material.product_id ? [material.product_id] : [])])];
}

export function materialProductNames(material: LinkedMaterial): string[] {
  return [...new Set([...(material.product_asset_links ?? []).map((link) => link.products?.name), material.products?.name].filter((name): name is string => Boolean(name)))];
}

export function toggleMaterialProduct(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

export function materialMatchesProduct(material: LinkedMaterial, product: string): boolean {
  const ids = materialProductIds(material);
  return product === "any" || (product === "general" ? ids.length === 0 : ids.includes(product));
}