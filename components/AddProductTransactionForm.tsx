"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getActiveBranchId } from "@/lib/branch";

type Member = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Props = {
  onSuccess: () => void;
};

export default function AddProductTransactionForm({
  onSuccess,
}: Props) {
  const supabase = createClient();

  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [memberId, setMemberId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const [cart, setCart] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getData() {
      const branchId = getActiveBranchId();

      if (!branchId) {
        setMembers([]);
        setProducts([]);
        return;
      }

      const [membersResult, productsResult] = await Promise.all([
        supabase
          .from("members")
          .select("id, name")
          .eq("branch_id", branchId)
          .order("name", { ascending: true }),

        supabase
          .from("products")
          .select("id, name, price, stock")
          .eq("branch_id", branchId)
          .eq("status", "active")
          .order("name", { ascending: true }),
      ]);

      if (membersResult.error) {
        console.error(
          "Gagal mengambil member:",
          membersResult.error,
        );
      }

      if (productsResult.error) {
        console.error(
          "Gagal mengambil produk:",
          productsResult.error,
        );
      }

      setMembers(membersResult.data ?? []);
      setProducts(productsResult.data ?? []);
    }

    getData();
  }, []);

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function addToCart() {
    const product = products.find(
      (item) => item.id === productId,
    );

    if (!product) {
      alert("Pilih produk terlebih dahulu.");
      return;
    }

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      alert("Jumlah produk harus lebih dari 0.");
      return;
    }

    const existingItem = cart.find(
      (item) => item.productId === product.id,
    );

    const newQuantity = existingItem
      ? existingItem.quantity + qty
      : qty;

    if (newQuantity > product.stock) {
      alert(`Stok ${product.name} hanya ${product.stock}.`);
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? {
              ...item,
              quantity: newQuantity,
            }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
        },
      ]);
    }

    setProductId("");
    setQuantity("1");
  }

  function removeFromCart(productId: string) {
    setCart(
      cart.filter((item) => item.productId !== productId),
    );
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const selectedProduct = products.find(
    (product) => product.id === productId,
  );

  const selectedProductTotal = selectedProduct
    ? selectedProduct.price * Number(quantity || 0)
    : 0;

  const total =
    cartTotal + selectedProductTotal;

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    let itemsToSave = [...cart];

    // Jika ada produk yang sedang dipilih tetapi
    // belum ditekan tombol Tambah, masukkan langsung
    // ke transaksi.
    if (productId) {
      const product = products.find(
        (item) => item.id === productId,
      );

      const qty = Number(quantity);

      if (!product) {
        alert("Produk tidak ditemukan.");
        return;
      }

      if (!qty || qty <= 0) {
        alert("Jumlah produk harus lebih dari 0.");
        return;
      }

      const existingItem = itemsToSave.find(
        (item) => item.productId === product.id,
      );

      const newQuantity = existingItem
        ? existingItem.quantity + qty
        : qty;

      if (newQuantity > product.stock) {
        alert(`Stok ${product.name} hanya ${product.stock}.`);
        return;
      }

      if (existingItem) {
        itemsToSave = itemsToSave.map((item) =>
          item.productId === product.id
            ? {
              ...item,
              quantity: newQuantity,
            }
            : item,
        );
      } else {
        itemsToSave.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
        });
      }
    }

    if (itemsToSave.length === 0) {
      alert("Pilih produk terlebih dahulu.");
      return;
    }

    setSaving(true);

    const branchId = getActiveBranchId();

    if (!branchId) {
      alert("Cabang aktif belum dipilih.");
      setSaving(false);
      return;
    }

    const items = itemsToSave.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    }));

    const { data, error } = await supabase.rpc(
      "create_product_transaction",
      {
        p_branch_id: branchId,
        p_member_id: memberId || null,
        p_payment_method: paymentMethod,
        p_notes: notes.trim() || null,
        p_items: items,
      },
    );

    if (error) {
      console.error(
        "Gagal membuat transaksi:",
        error,
      );
      alert(error.message);
      setSaving(false);
      return;
    }

    console.log("Transaction ID:", data);

    alert("Transaksi berhasil disimpan.");

    setMemberId("");
    setProductId("");
    setQuantity("1");
    setPaymentMethod("cash");
    setNotes("");
    setCart([]);
    setSaving(false);

    onSuccess();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Member */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Member
        </label>

        <select
          value={memberId}
          onChange={(e) =>
            setMemberId(e.target.value)
          }
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="">Non-member</option>

          {members.map((member) => (
            <option
              key={member.id}
              value={member.id}
            >
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* Produk */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Produk
        </label>

        <div className="flex gap-2">
          <select
            value={productId}
            onChange={(e) =>
              setProductId(e.target.value)
            }
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          >
            <option value="">
              Pilih produk
            </option>

            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name} —{" "}
                {formatRupiah(product.price)} — Stok{" "}
                {product.stock}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            className="w-20 rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
          />

          <button
            type="button"
            onClick={addToCart}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800"
          >
            Tambah
          </button>
        </div>
      </div>

      {/* Produk yang sedang dipilih */}
      {cart.length === 0 && selectedProduct && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600">
              Total
            </span>

            <span className="text-lg font-bold text-zinc-900">
              {formatRupiah(total)}
            </span>
          </div>
        </div>
      )}

      {/* Keranjang */}
      {cart.length > 0 && (
        <div className="rounded-lg border border-zinc-200">
          <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3">
            <h3 className="text-sm font-semibold">
              Detail Produk
            </h3>
          </div>

          <div className="divide-y divide-zinc-100">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {item.name}
                  </p>

                  <p className="text-xs text-zinc-500">
                    {item.quantity} ×{" "}
                    {formatRupiah(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {formatRupiah(
                      item.price * item.quantity,
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeFromCart(
                        item.productId,
                      )
                    }
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-4">
            <span className="font-semibold">
              Total
            </span>

            <span className="text-lg font-bold">
              {formatRupiah(total)}
            </span>
          </div>
        </div>
      )}

      {/* Pembayaran */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Metode Pembayaran
        </label>

        <select
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        >
          <option value="cash">Cash</option>
          <option value="qris">QRIS</option>
          <option value="transfer">
            Transfer
          </option>
        </select>
      </div>

      {/* Catatan */}
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Catatan
        </label>

        <textarea
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
          placeholder="Opsional"
          rows={2}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-orange-500"
        />
      </div>

      {/* Simpan */}
      <button
        type="submit"
        disabled={
          saving ||
          (!productId && cart.length === 0)
        }
        className="w-full rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving
          ? "Menyimpan..."
          : "Simpan Transaksi"}
      </button>
    </form>
  );
}