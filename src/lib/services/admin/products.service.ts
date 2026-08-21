import { apiClient } from "@/lib/api-client"
import { getProductById } from "@/lib/services/products.service"
import type { ProductDetailResponse, ProductRequest, VariantCreateRequest } from "@/types"

export async function createProduct(payload: ProductRequest): Promise<ProductDetailResponse> {
  const { data } = await apiClient.post<ProductDetailResponse>("/admin/products", payload)
  return data
}

/**
 * Clones a product's fields/variants into a new draft (no images — those aren't
 * re-uploadable from a URL, so the admin adds them after duplicating). The
 * clone is created inactive so it doesn't show up in the live catalog until
 * reviewed and published.
 */
export async function duplicateProduct(id: string): Promise<ProductDetailResponse> {
  const source = await getProductById(id)
  if (!source) throw new Error("Produit introuvable.")

  const variants: VariantCreateRequest[] | undefined =
    source.variants.length > 0
      ? source.variants.map((v) => ({
          colorName: v.colorName,
          colorHex: v.colorHex,
          sizes: v.size ? [v.size] : [],
          stock: v.stock,
          active: v.active,
        }))
      : undefined

  return createProduct({
    name: `${source.name} (copie)`,
    description: source.description,
    price: source.price,
    purchasePrice: source.purchasePrice,
    stock: source.stock,
    categoryId: source.categoryId ?? "",
    supplierId: source.supplierId,
    active: false,
    variants,
  })
}

export async function updateProduct(
  id: string,
  payload: ProductRequest
): Promise<ProductDetailResponse> {
  const { data } = await apiClient.put<ProductDetailResponse>(`/admin/products/${id}`, payload)
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`)
}
