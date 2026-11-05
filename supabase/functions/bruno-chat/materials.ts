type Product = { name?: string; category?: string };
type Material = { title?: string; description?: string; tags?: string[]; products?: Product | null; product_asset_links?: { products?: Product | null }[] };

export function linkedMaterialProducts(material: Material): Product[] {
  return [...(material.products ? [material.products] : []), ...(material.product_asset_links ?? []).flatMap((link) => link.products ? [link.products] : [])];
}

export function materialSearchText(material: Material): string {
  return [material.title, material.description, ...linkedMaterialProducts(material).flatMap((product) => [product.name, product.category]), ...(material.tags ?? [])].join(' ').toLowerCase();
}

export function linkedMaterialNames(material: Material): string[] {
  return [...new Set(linkedMaterialProducts(material).map((product) => product.name).filter((name): name is string => Boolean(name)))];
}