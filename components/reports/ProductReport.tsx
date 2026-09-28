"use client";

type ProductReportItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stockIn: number;
  stockOut: number;
  currentStock: number;
};

type Props = {
  products: ProductReportItem[];
};

export default function ProductReport({ products }: Props) {
  function formatCurrency(amount: number) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  return (
    <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-900">
          Data Produk & Stok
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Pergerakan stok produk berdasarkan periode yang dipilih.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500">
              <th className="px-4 py-3 font-medium">No</th>
              <th className="px-4 py-3 font-medium">Produk</th>
              <th className="px-4 py-3 font-medium">Kategori</th>
              <th className="px-4 py-3 font-medium">Harga</th>
              <th className="px-4 py-3 font-medium">Stok Masuk</th>
              <th className="px-4 py-3 font-medium">Stok Keluar</th>
              <th className="px-4 py-3 font-medium">Stok Akhir</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-zinc-500"
                >
                  Tidak ada data produk pada periode ini.
                </td>
              </tr>
            ) : (
              products.map((product, index) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-100"
                >
                  <td className="px-4 py-3 text-zinc-500">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {product.name}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {product.category || "-"}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {product.stockIn}
                  </td>

                  <td className="px-4 py-3 text-zinc-700">
                    {product.stockOut}
                  </td>

                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {product.currentStock}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}