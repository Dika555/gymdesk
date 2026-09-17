export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-black px-6 text-white">
      <h1 className="text-lg font-semibold">
        Dashboard
      </h1>

      <div className="text-sm text-zinc-400">
        Admin
      </div>
    </header>
  );
}